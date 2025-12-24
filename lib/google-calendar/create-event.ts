import { google } from 'googleapis'
import { prisma } from '@/lib/prisma/client'
import { decrypt } from '@/lib/encryption'
import { refreshGoogleToken, isTokenExpired } from './refresh-token'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

// Mapping des types d'intervention vers les couleurs Google Calendar
const INTERVENTION_COLORS: Record<string, string> = {
  // Consultations - Bleu
  CONTROLE: '1',
  PREMIERE_VISITE: '1',
  
  // Urgences - Rouge
  URGENCE: '11',
  
  // Soins dentaires - Vert
  CARIE: '2',
  DEVITALISATION: '10', // Vert foncé
  EXTRACTION: '2',
  DETARTRAGE: '2',
  
  // Blanchiment - Jaune
  BLANCHIMENT: '5',
  
  // Prothèses - Violet
  COURONNE: '3',
  BRIDGE: '3',
  IMPLANT: '3',
  PROTHESE_COMPLETE: '3',
  PROTHESE_PARTIELLE: '3',
  
  // Orthodontie - Orange
  ORTHODONTIE_CONSULTATION: '6',
  ORTHODONTIE_SUIVI: '6',
  ORTHODONTIE_POSE: '6',
  ORTHODONTIE_RETRAIT: '6',
  
  // Pédiatrie - Rose
  PEDIATRIE_CONTROLE: '4',
  PEDIATRIE_SOIN: '4',
  PEDIATRIE_PREVENTION: '4',
  
  // Chirurgie - Rouge foncé
  CHIRURGIE_SIMPLE: '11',
  CHIRURGIE_COMPLEXE: '11',
  GREFFE_OSSEUSE: '11',
  
  // Autre - Gris
  AUTRE: '8',
}

// Labels français pour les types
const INTERVENTION_LABELS: Record<string, string> = {
  CONTROLE: 'Contrôle / Check-up',
  URGENCE: 'Urgence dentaire',
  PREMIERE_VISITE: 'Première visite',
  CARIE: 'Traitement carie',
  DEVITALISATION: 'Dévitalisation',
  EXTRACTION: 'Extraction dentaire',
  DETARTRAGE: 'Détartrage',
  BLANCHIMENT: 'Blanchiment dentaire',
  COURONNE: 'Pose couronne',
  BRIDGE: 'Pose bridge',
  IMPLANT: 'Implant dentaire',
  PROTHESE_COMPLETE: 'Prothèse complète',
  PROTHESE_PARTIELLE: 'Prothèse partielle',
  ORTHODONTIE_CONSULTATION: 'Consultation orthodontie',
  ORTHODONTIE_SUIVI: 'Suivi orthodontie',
  ORTHODONTIE_POSE: 'Pose appareil orthodontique',
  ORTHODONTIE_RETRAIT: 'Retrait appareil orthodontique',
  PEDIATRIE_CONTROLE: 'Contrôle pédiatrique',
  PEDIATRIE_SOIN: 'Soin pédiatrique',
  PEDIATRIE_PREVENTION: 'Prévention pédiatrique',
  CHIRURGIE_SIMPLE: 'Chirurgie simple',
  CHIRURGIE_COMPLEXE: 'Chirurgie complexe',
  GREFFE_OSSEUSE: 'Greffe osseuse',
  AUTRE: 'Autre intervention',
}

export async function createGoogleCalendarEvent(appointmentId: string) {
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

    // 3. Vérifier si l'événement existe déjà
    if (appointment.googleCalendarEventId) {
      console.log(`Event already exists for appointment ${appointmentId}`)
      return { success: true, eventId: appointment.googleCalendarEventId }
    }

    // 4. Vérifier l'expiration du token et refresh si nécessaire
    if (isTokenExpired(appointment.dentist.googleTokenExpiry)) {
      console.log(`🔄 Token expired or expiring soon, refreshing...`)
      
      const refreshResult = await refreshGoogleToken(appointment.dentist.id)
      
      if (!refreshResult.success) {
        console.error(`❌ Failed to refresh token: ${refreshResult.error}`)
        return { success: false, error: `Token refresh failed: ${refreshResult.error}` }
      }
      
      console.log(`✅ Token refreshed successfully, new expiry: ${refreshResult.expiryDate?.toISOString()}`)
      
      // Récupérer le dentiste mis à jour avec le nouveau token
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
      
      // Utiliser le nouveau token
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

    // 7. Préparer les données de l'événement
    const interventionLabel = INTERVENTION_LABELS[appointment.interventionType] || appointment.interventionType
    const colorId = INTERVENTION_COLORS[appointment.interventionType] || '8'

    const event = {
      summary: `${interventionLabel} - ${appointment.patient.name}`,
      description: `Patient: ${appointment.patient.name}\nTéléphone: ${appointment.patient.phone}${
        appointment.patient.email ? `\nEmail: ${appointment.patient.email}` : ''
      }\nType: ${interventionLabel}\nDurée: ${appointment.duration} minutes${
        appointment.notes ? `\n\nNotes: ${appointment.notes}` : ''
      }`,
      start: {
        dateTime: appointment.startTime.toISOString(),
        timeZone: 'Europe/Brussels',
      },
      end: {
        dateTime: appointment.endTime.toISOString(),
        timeZone: 'Europe/Brussels',
      },
      colorId: colorId,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },    // 1h avant
          { method: 'popup', minutes: 1440 },  // 24h avant (1 jour)
        ],
      },
    }

    // 8. Créer l'événement dans Google Calendar
    console.log(`📅 Creating Google Calendar event for appointment ${appointmentId}...`)
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    })

    if (!response.data.id || !response.data.htmlLink) {
      console.error('Event created but missing ID or link')
      return { success: false, error: 'Event created but missing data' }
    }

    // 9. Mettre à jour l'appointment avec les infos Google Calendar
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        googleCalendarEventId: response.data.id,
        googleCalendarLink: response.data.htmlLink,
        syncedWithGoogle: true,
        lastSyncedAt: new Date(),
      },
    })

    // 10. Créer un audit log
    await prisma.auditLog.create({
      data: {
        userId: appointment.dentist.id,
        userType: 'dentist',
        action: 'create',
        entity: 'google-calendar-event',
        entityId: response.data.id,
        changes: {
          appointmentId,
          eventId: response.data.id,
          eventLink: response.data.htmlLink,
        },
        source: 'web-app',
      },
    })

    console.log(`✅ Google Calendar event created: ${response.data.id}`)

    return {
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
    }
  } catch (error) {
    console.error('Error creating Google Calendar event:', error)

    // Log l'erreur
    await prisma.auditLog.create({
      data: {
        userId: appointmentId,
        userType: 'system',
        action: 'error',
        entity: 'google-calendar-event',
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