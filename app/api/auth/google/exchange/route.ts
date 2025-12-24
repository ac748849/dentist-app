import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { encrypt } from '@/lib/encryption'
import { prisma } from '@/lib/prisma/client'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

export async function POST(request: Request) {
  try {
    const { code, dentistId } = await request.json()

    if (!code || !dentistId) {
      return NextResponse.json(
        { success: false, error: 'Code ou dentistId manquant' },
        { status: 400 }
      )
    }

    // Créer client OAuth2
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    )

    // Échanger le code contre des tokens
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      return NextResponse.json(
        { success: false, error: 'Tokens manquants' },
        { status: 400 }
      )
    }

    // Chiffrer les tokens
    const encryptedAccessToken = encrypt(tokens.access_token)
    const encryptedRefreshToken = encrypt(tokens.refresh_token)

    // Récupérer l'email du calendrier
    oauth2Client.setCredentials({ access_token: tokens.access_token })
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const calendarList = await calendar.calendarList.get({ calendarId: 'primary' })
    const calendarEmail = calendarList.data.id

    // Mettre à jour le dentiste
    await prisma.dentist.update({
      where: { id: dentistId },
      data: {
        googleCalendarId: calendarEmail,
        googleAccessToken: encryptedAccessToken,
        googleRefreshToken: encryptedRefreshToken,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        googleCalendarEnabled: true,
      },
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId: dentistId,
        userType: 'dentist',
        action: 'connect',
        entity: 'google-calendar',
        entityId: calendarEmail || '',
        source: 'web-app',
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error exchanging code:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'échange du code' },
      { status: 500 }
    )
  }
}