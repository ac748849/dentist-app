import { google } from 'googleapis'
import { prisma } from '@/lib/prisma/client'
import { decrypt } from '@/lib/encryption'
import { refreshGoogleToken, isTokenExpired } from './refresh-token'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export async function deleteGoogleCalendarEvent(appointmentId: string) {
  try {
    // 1. Récupérer l'appointment avec toutes les relations
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        dentist: true,
      },
    })

    if (!appointment) {
      console.error(`Appointment ${appointmentId} not found`)
      return { success: false, error: 'Appointment not found' }
    }

    // 2. Vérifier si Google Calendar est activé
    if (!appointment.dentist.googleCalendarEnabled || !appointment.dentist.googleCalendarId) {
      console.log(`Google Calendar not enabled for dentist ${appointment.dentist.id}`)
      return { success: false, error: 'Google Calendar not enabled' }
    }

    // 3. Vérifier si l'événement existe
    if (!appointment.googleCalendarEventId) {
      console.log(`No Google Calendar event for appointment ${appointmentId}`)
      return { success: true, message: 'No event to delete' }
    }

    // 4. Vérifier l'expiration du token et refresh si nécessaire
    if (isTokenExpired(appointment.dentist.googleTokenExpiry)) {
      console.log(`🔄 Token expired or expiring soon, refreshing...`)
      
      const refreshResult = await refreshGoogleToken(appointment.dentist.id)
      
      if (!refreshResult.success) {
        console.error(`❌ Failed to refresh token: ${refreshResult.error}`)
        return { success: false, error: `Token refresh failed: ${refreshResult.error}` }
      }
      
      // Récupérer le dentiste mis à jour
      const updatedDentist = await prisma.dentist.findUnique({
        where: { id: appointment.dentist.id },
        select: {
          googleAccessToken: true,
          googleRefreshToken: true,
        },
      })
      
      if (!updatedDentist?.googleAccessToken) {
        return { success: false, error: 'Failed to get updated token' }
      }
      
      appointment.dentist.googleAccessToken = updatedDentist.googleAccessToken
      appointment.dentist.googleRefreshToken = updatedDentist.googleRefreshToken
    }

    // 5. Déchiffrer les tokens
    const accessToken = decrypt(appointment.dentist.googleAccessToken!)
    const refreshToken = decrypt(appointment.dentist.googleRefreshToken!)

    // 6. Créer le client OAuth2
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // 7. Supprimer l'événement de Google Calendar
    console.log(`🗑️ Deleting Google Calendar event ${appointment.googleCalendarEventId}...`)

    await calendar.events.delete({
      calendarId: 'primary',
      eventId: appointment.googleCalendarEventId,
    })

    // 8. Mettre à jour l'appointment (retirer les références Google)
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        googleCalendarEventId: null,
        googleCalendarLink: null,
        syncedWithGoogle: false,
        lastSyncedAt: new Date(),
      },
    })

    // 9. Créer un audit log
    await prisma.auditLog.create({
      data: {
        userId: appointment.dentist.id,
        userType: 'dentist',
        action: 'delete',
        entity: 'google-calendar-event',
        entityId: appointment.googleCalendarEventId,
        changes: {
          appointmentId,
          deletedEventId: appointment.googleCalendarEventId,
        },
        source: 'web-app',
      },
    })

    console.log(`✅ Google Calendar event deleted: ${appointment.googleCalendarEventId}`)

    return {
      success: true,
      message: 'Event deleted successfully',
    }
  } catch (error: any) {
    // Si l'événement n'existe pas dans Google Calendar (erreur 404), on considère que c'est OK
    if (error?.code === 404 || error?.message?.includes('404')) {
      console.log(`Event not found in Google Calendar (already deleted?)`)
      
      // Nettoyer quand même les références
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          googleCalendarEventId: null,
          googleCalendarLink: null,
          syncedWithGoogle: false,
          lastSyncedAt: new Date(),
        },
      })
      
      return {
        success: true,
        message: 'Event already deleted or not found',
      }
    }

    console.error('Error deleting Google Calendar event:', error)

    // Log l'erreur
    await prisma.auditLog.create({
      data: {
        userId: appointmentId,
        userType: 'system',
        action: 'error',
        entity: 'google-calendar-event-delete',
        entityId: appointmentId,
        changes: { error: String(error) },
        source: 'web-app',
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}