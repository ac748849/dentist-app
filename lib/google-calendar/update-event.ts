import { google } from 'googleapis'
import { prisma } from '@/lib/prisma/client'
import { decrypt } from '@/lib/encryption'
import { refreshGoogleToken, isTokenExpired } from './refresh-token'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

// Labels français pour les statuts
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente de confirmation',
  CONFIRMED: '✅ Confirmé par le dentiste',
  CANCELLED: '❌ Annulé',
  COMPLETED: '✅ Terminé',
  NO_SHOW: 'Patient absent',
}

// Couleurs par statut
const STATUS_COLORS: Record<string, string> = {
  PENDING: '5',    // Jaune
  CONFIRMED: '10', // Vert foncé
  CANCELLED: '8',  // Gris
  COMPLETED: '1',  // Bleu
  NO_SHOW: '8',    // Gris
}

export async function updateGoogleCalendarEvent(appointmentId: string, newStatus: string) {
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
      return { success: false, error: 'No Google Calendar event found' }
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

    // 7. Récupérer l'événement existant
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: appointment.googleCalendarEventId,
    })

    if (!existingEvent.data) {
      return { success: false, error: 'Event not found in Google Calendar' }
    }

    // 8. Préparer la mise à jour
    const statusLabel = STATUS_LABELS[newStatus] || newStatus
    const colorId = STATUS_COLORS[newStatus] || existingEvent.data.colorId

    // Mise à jour de la description avec le nouveau statut
    const updatedDescription = `${existingEvent.data.description || ''}\n\n📌 Statut: ${statusLabel}\n⏰ Mis à jour le: ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Brussels' })}`

    // 9. Mettre à jour l'événement
    console.log(`📅 Updating Google Calendar event ${appointment.googleCalendarEventId} to status ${newStatus}...`)

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId: appointment.googleCalendarEventId,
      requestBody: {
        description: updatedDescription,
        colorId: colorId,
      },
    })

    // 10. Mettre à jour lastSyncedAt
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        lastSyncedAt: new Date(),
      },
    })

    // 11. Créer un audit log
    await prisma.auditLog.create({
      data: {
        userId: appointment.dentist.id,
        userType: 'dentist',
        action: 'update',
        entity: 'google-calendar-event',
        entityId: appointment.googleCalendarEventId,
        changes: {
          appointmentId,
          oldStatus: appointment.status,
          newStatus,
        },
        source: 'web-app',
      },
    })

    console.log(`✅ Google Calendar event updated: ${appointment.googleCalendarEventId}`)

    return {
      success: true,
      eventId: appointment.googleCalendarEventId,
    }
  } catch (error) {
    console.error('Error updating Google Calendar event:', error)

    // Log l'erreur
    await prisma.auditLog.create({
      data: {
        userId: appointmentId,
        userType: 'system',
        action: 'error',
        entity: 'google-calendar-event-update',
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