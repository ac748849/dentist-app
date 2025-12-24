'use client'

import { useEffect, useState } from 'react'

export default function CalendarPage() {
  const [dentist, setDentist] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    loadDentist()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  if (!dentist?.googleCalendarEnabled || !dentist?.googleCalendarId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendrier Google</h1>
            </div>
            <a
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour
            </a>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Google Calendar non connecté
            </h3>
            <p className="text-gray-600 mb-6">
              Connectez votre Google Calendar pour voir vos rendez-vous ici
            </p>
            <a
              href="/dashboard/settings"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Connecter Google Calendar
            </a>
          </div>
        </div>
      </div>
    )
  }

  // URL de l'embed Google Calendar
  const calendarEmbedUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(dentist.googleCalendarId)}&ctz=Europe/Brussels&mode=WEEK&showTitle=0&showNav=1&showPrint=0&showTabs=0&showCalendars=0`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendrier Google</h1>
            <p className="mt-2 text-gray-600">
              Synchronisé avec {dentist.googleCalendarId}
            </p>
          </div>
          <div className="flex space-x-3">
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-indigo-300 rounded-md text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
            >
              Ouvrir dans Google Calendar
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour
            </a>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-3">
            <a
              href="/dashboard/appointments?status=PENDING"
              className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
            >
              ⏳ RDV en attente
            </a>
            <a
              href="/dashboard/appointments"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              📋 Gérer les RDV
            </a>
            <a
              href="/dashboard/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ⚙️ Paramètres
            </a>
          </div>
        </div>

        {/* Google Calendar Embed */}
        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
          <iframe
            src={calendarEmbedUrl}
            style={{ border: 0 }}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            title="Google Calendar"
          />
        </div>

        {/* Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                💡 <strong>Astuce :</strong> Les rendez-vous créés sur votre site apparaissent automatiquement ici avec des couleurs selon le type d'intervention. Vous pouvez aussi créer des événements directement dans Google Calendar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}