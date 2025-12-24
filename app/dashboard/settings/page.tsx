'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Dentist = {
  id: string
  name: string
  email: string
  googleCalendarEnabled: boolean
  googleCalendarId: string | null
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [dentist, setDentist] = useState<Dentist | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadDentist()
    
    // Gérer les messages de succès/erreur
    const success = searchParams.get('success')
    const error = searchParams.get('error')
    
    if (success === 'calendar_connected') {
      setMessage({ type: 'success', text: '✅ Google Calendar connecté avec succès !' })
    } else if (error) {
      setMessage({ type: 'error', text: `❌ Erreur : ${error}` })
    }
  }, [searchParams])

  async function loadDentist() {
    try {
      const response = await fetch('/api/dentists')
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        setDentist(data.data[0])
      }
    } catch (error) {
      console.error('Error loading dentist:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnectGoogleCalendar() {
    if (!dentist) return
    
    setConnecting(true)
    
    const GOOGLE_CLIENT_ID = '710771993502-51pbjcarqd4v99ciit0b0fq2nl4vfkus.apps.googleusercontent.com'
    const REDIRECT_URI = 'http://localhost:3000/auth/google/callback'
    const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(SCOPES)}` +
      `&access_type=offline` +
      `&state=${dentist.id}` +
      `&prompt=consent`
    
    window.location.href = authUrl
  }

  async function handleDisconnectGoogleCalendar() {
    if (!dentist || !confirm('Êtes-vous sûr de vouloir déconnecter Google Calendar ?')) return

    try {
      const response = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dentistId: dentist.id }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Google Calendar déconnecté' })
        loadDentist()
      } else {
        setMessage({ type: 'error', text: '❌ Erreur lors de la déconnexion' })
      }
    } catch (error) {
      console.error('Error disconnecting:', error)
      setMessage({ type: 'error', text: '❌ Erreur lors de la déconnexion' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="mt-2 text-gray-600">Gérez les intégrations et les paramètres de votre compte</p>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Retour
          </a>
        </div>

        {/* Message de succès/erreur */}
        {message && (
          <div className={`mb-6 rounded-lg p-4 ${
            message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Google Calendar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Google Calendar</h2>
            <p className="mt-1 text-sm text-gray-600">
              Synchronisez automatiquement vos rendez-vous avec Google Calendar
            </p>
          </div>

          <div className="px-6 py-6">
            {dentist?.googleCalendarEnabled && dentist?.googleCalendarId ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-10 w-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Connecté</h3>
                    <p className="text-sm text-gray-600">{dentist.googleCalendarId}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fonctionnalités activées :</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Les nouveaux rendez-vous apparaissent automatiquement
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Recevez des notifications sur votre téléphone
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Visualisez votre planning en un coup d'œil
                    </li>
                    <li className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Codes couleur par type d'intervention
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleDisconnectGoogleCalendar}
                  className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                >
                  Déconnecter Google Calendar
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-start mb-4">
                  <svg className="h-6 w-6 text-gray-400 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600 mb-4">
                      Connectez votre Google Calendar pour synchroniser automatiquement vos rendez-vous.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li>✓ Les nouveaux rendez-vous apparaissent automatiquement</li>
                      <li>✓ Recevez des notifications sur votre téléphone</li>
                      <li>✓ Visualisez votre planning en un coup d'œil</li>
                      <li>✓ Codes couleur par type d'intervention</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleConnectGoogleCalendar}
                  disabled={connecting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  {connecting ? 'Connexion en cours...' : 'Connecter Google Calendar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Informations du compte */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informations du compte</h2>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <p className="mt-1 text-sm text-gray-900">{dentist?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{dentist?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Spécialités</label>
              <p className="mt-1 text-sm text-gray-900">Dentisterie générale, Orthodontie</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}