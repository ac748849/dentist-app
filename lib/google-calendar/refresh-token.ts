import { google } from 'googleapis'
import { prisma } from '@/lib/prisma/client'
import { encrypt, decrypt } from '@/lib/encryption'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export async function refreshGoogleToken(dentistId: string): Promise<{
  success: boolean
  accessToken?: string
  expiryDate?: Date
  error?: string
}> {
  try {
    // 1. Récupérer le dentiste avec son refresh token
    const dentist = await prisma.dentist.findUnique({
      where: { id: dentistId },
      select: {
        id: true,
        googleRefreshToken: true,
        googleCalendarEnabled: true,
      },
    })

    if (!dentist || !dentist.googleCalendarEnabled || !dentist.googleRefreshToken) {
      return {
        success: false,
        error: 'Dentist not found or Google Calendar not enabled',
      }
    }

    // 2. Déchiffrer le refresh token
    const refreshToken = decrypt(dentist.googleRefreshToken)

    // 3. Créer le client OAuth2
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })

    // 4. Demander un nouveau access token
    const { credentials } = await oauth2Client.refreshAccessToken()

    if (!credentials.access_token) {
      return {
        success: false,
        error: 'Failed to refresh access token',
      }
    }

    // 5. Calculer la nouvelle date d'expiration
    const expiryDate = credentials.expiry_date 
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000) // +1h par défaut

    // 6. Chiffrer et sauvegarder le nouveau access token
    const encryptedAccessToken = encrypt(credentials.access_token)

    await prisma.dentist.update({
      where: { id: dentistId },
      data: {
        googleAccessToken: encryptedAccessToken,
        googleTokenExpiry: expiryDate,
        updatedAt: new Date(),
      },
    })

    console.log(`✅ Token refreshed for dentist ${dentistId}, expires at ${expiryDate.toISOString()}`)

    // 7. Créer un audit log
    await prisma.auditLog.create({
      data: {
        userId: dentistId,
        userType: 'dentist',
        action: 'refresh',
        entity: 'google-token',
        entityId: dentistId,
        source: 'auto-refresh',
      },
    })

    return {
      success: true,
      accessToken: credentials.access_token,
      expiryDate,
    }
  } catch (error) {
    console.error('Error refreshing Google token:', error)
    
    // Log l'erreur
    await prisma.auditLog.create({
      data: {
        userId: dentistId,
        userType: 'dentist',
        action: 'error',
        entity: 'google-token-refresh',
        entityId: dentistId,
        changes: { error: String(error) },
        source: 'auto-refresh',
      },
    })

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Vérifie si le token est expiré ou va expirer dans les 5 prochaines minutes
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true
  
  const now = new Date()
  const expiresIn = expiryDate.getTime() - now.getTime()
  const fiveMinutes = 5 * 60 * 1000
  
  return expiresIn < fiveMinutes
}