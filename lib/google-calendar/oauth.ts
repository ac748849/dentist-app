import { google } from 'googleapis'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
  throw new Error('Missing Google OAuth environment variables')
}

/**
 * Crée un client OAuth2 Google
 */
export function getOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  )
}

/**
 * Génère l'URL d'autorisation Google OAuth
 */
export function getAuthUrl(dentistId: string) {
  const oauth2Client = getOAuth2Client()
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar.events',
  ]

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Important pour avoir le refresh token
    scope: scopes,
    state: dentistId, // On passe l'ID du dentiste dans le state
    prompt: 'consent', // Force l'écran de consentement pour obtenir refresh token
  })

  return url
}

/**
 * Échange le code d'autorisation contre des tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  
  const { tokens } = await oauth2Client.getToken(code)
  
  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token!, // Null si déjà autorisé avant
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
  }
}

/**
 * Rafraîchit l'access token avec le refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  const { credentials } = await oauth2Client.refreshAccessToken()
  
  return {
    accessToken: credentials.access_token!,
    expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
  }
}

/**
 * Crée un client OAuth2 authentifié pour un dentiste
 */
export function getAuthenticatedClient(accessToken: string, refreshToken: string) {
  const oauth2Client = getOAuth2Client()
  
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  })

  return oauth2Client
}