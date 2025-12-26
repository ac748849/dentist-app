'use client'

import { useEffect, useState } from 'react'

type DentistSettings = {
  id: string
  name: string
  email: string
  phone: string | null
  googleCalendarEnabled: boolean
  googleCalendarId: string | null
  googleTokenExpiry: string | null
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<DentistSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.success) {
        setSettings(data.data)
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone || '',
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
        await loadSettings()
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDisconnectGoogle() {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter Google Calendar ?')) {
      return
    }

    try {
      const response = await fetch('/api/google/disconnect', {
        method: 'POST',
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Google Calendar déconnecté' })
        await loadSettings()
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la déconnexion' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la déconnexion' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  const isTokenExpiringSoon = settings?.googleTokenExpiry 
    ? new Date(settings.googleTokenExpiry).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 
    : false

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Paramètres
        </h1>
        <p className="text-gray-600">
          Gérez votre profil et vos intégrations
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div className={`rounded-xl p-4 border-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Profile section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-4xl">
              👩‍⚕️
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">{settings?.name}</div>
              <div className="text-gray-600">{settings?.email}</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
              placeholder="02 123 45 67"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Google Calendar section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <svg className="w-6 h-6 text-teal-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Google Calendar
          </h2>
        </div>

        <div className="p-6">
          {settings?.googleCalendarEnabled ? (
            <div className="space-y-6">
              {/* Connected status */}
              <div className="flex items-start justify-between p-6 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 mb-1">Compte connecté</div>
                    <div className="text-sm text-gray-700 mb-2">
                      Vos rendez-vous sont synchronisés automatiquement
                    </div>
                    {settings.googleTokenExpiry && (
                      <div className="text-xs text-gray-600">
                        Token valide jusqu'au {new Date(settings.googleTokenExpiry).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Token warning */}
              {isTokenExpiringSoon && (
                <div className="flex items-start p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <div className="font-semibold mb-1">Token expirant bientôt</div>
                    <div>
                      Votre token Google Calendar arrive à expiration. Il sera automatiquement renouvelé lors du prochain rendez-vous.
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Synchronisation automatique</div>
                    <div className="text-xs text-gray-600">Création et mise à jour en temps réel</div>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Rappels automatiques</div>
                    <div className="text-xs text-gray-600">Notifications 24h et 1h avant</div>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Codes couleur</div>
                    <div className="text-xs text-gray-600">Identification visuelle rapide</div>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900 text-sm mb-1">Sécurité renforcée</div>
                    <div className="text-xs text-gray-600">Tokens chiffrés AES-256</div>
                  </div>
                </div>
              </div>

              {/* Disconnect button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleDisconnectGoogle}
                  className="px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
                >
                  Déconnecter Google Calendar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Google Calendar non connecté
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Connectez votre compte Google pour synchroniser automatiquement vos rendez-vous
              </p>

              <a
                href="/api/google/auth"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                </svg>
                Connecter Google Calendar
              </a>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Avantages :</h4>
                <div className="grid md:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Temps réel</div>
                      <div className="text-gray-600">Sync automatique</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Mobile</div>
                      <div className="text-gray-600">Accès partout</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 mb-1">Sécurisé</div>
                      <div className="text-gray-600">Données chiffrées</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <h2 className="text-xl font-bold text-red-900 flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Zone dangereuse
          </h2>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Supprimer le compte</h3>
              <p className="text-sm text-gray-600">
                Cette action est irréversible. Toutes vos données seront supprimées.
              </p>
            </div>
            <button
              onClick={() => alert('Cette fonctionnalité sera bientôt disponible')}
              className="px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition"
            >
              Supprimer le compte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}