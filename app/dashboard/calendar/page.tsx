'use client'

import { useEffect, useState } from 'react'

type CalendarSettings = {
  googleCalendarEnabled: boolean
  googleCalendarId: string | null
}

export default function CalendarPage() {
  const [settings, setSettings] = useState<CalendarSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!settings?.googleCalendarEnabled || !settings.googleCalendarId) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Google Calendar non connecté
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Pour afficher votre calendrier synchronisé, vous devez d'abord connecter votre compte Google Calendar.
          </p>
          
          <a
            href="/dashboard/settings"
            className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurer Google Calendar
          </a>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Avantages de la synchronisation :</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Temps réel</div>
                  <div className="text-sm text-gray-600">Synchronisation automatique des rendez-vous</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Rappels</div>
                  <div className="text-sm text-gray-600">Notifications sur votre mobile</div>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Sécurisé</div>
                  <div className="text-sm text-gray-600">Données chiffrées et protégées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendrier
          </h1>
          <p className="text-gray-600">
            Vos rendez-vous synchronisés avec Google Calendar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Synchronisé</span>
          </div>
          
          <a
            href="/dashboard/settings"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Synchronisation bidirectionnelle active</p>
            <p>
              Tous les rendez-vous créés via le site web sont automatiquement ajoutés à votre Google Calendar.
              Les modifications de statut sont également synchronisées en temps réel.
            </p>
          </div>
        </div>
      </div>

      {/* Calendar iframe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <iframe
          src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(settings.googleCalendarId)}&ctz=Europe/Brussels&mode=WEEK&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0`}
          className="w-full h-[800px] border-0"
          frameBorder="0"
          scrolling="no"
        />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <a
          href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(settings.googleCalendarId)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group"
        >
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Ouvrir dans Google</h3>
            <p className="text-sm text-gray-600">Voir dans l'application</p>
          </div>
          <svg className="w-6 h-6 text-gray-400 group-hover:text-teal-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>

        <a
          href="/dashboard/appointments"
          className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group"
        >
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Gérer les RDV</h3>
            <p className="text-sm text-gray-600">Liste complète</p>
          </div>
          <svg className="w-6 h-6 text-gray-400 group-hover:text-teal-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        <a
          href="/booking"
          className="flex items-center justify-between p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group"
        >
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Nouveau RDV</h3>
            <p className="text-sm text-gray-600">Créer manuellement</p>
          </div>
          <svg className="w-6 h-6 text-gray-400 group-hover:text-teal-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </a>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fonctionnalités actives
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Création automatique des événements
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Mise à jour en temps réel du statut
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Suppression automatique si annulé
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Codes couleur par type d'intervention
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Rappels automatiques (1h et 24h avant)
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Astuce
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Vous pouvez aussi accéder à votre calendrier directement depuis votre smartphone via l'application Google Calendar.
          </p>
          <div className="flex gap-3">
            <a href="https://apps.apple.com/app/google-calendar/id909319292" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
              📱 App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.google.android.calendar" target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
              🤖 Google Play
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}