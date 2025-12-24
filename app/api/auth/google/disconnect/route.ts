import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

/**
 * POST /api/auth/google/disconnect
 * Déconnecte Google Calendar pour un dentiste
 */
export async function POST(request: Request) {
  try {
    const { dentistId } = await request.json()

    if (!dentistId) {
      return NextResponse.json(
        { success: false, error: 'dentistId manquant' },
        { status: 400 }
      )
    }

    // Mettre à jour le dentiste
    await prisma.dentist.update({
      where: { id: dentistId },
      data: {
        googleCalendarId: null,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
        googleCalendarEnabled: false,
        googleWebhookChannelId: null,
        googleWebhookExpiry: null,
      },
    })

    // Log d'audit
    await prisma.auditLog.create({
      data: {
        userId: dentistId,
        userType: 'dentist',
        action: 'disconnect',
        entity: 'google-calendar',
        source: 'web-app',
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}