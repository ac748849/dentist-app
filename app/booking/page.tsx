'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import InterventionTypeSelector from './InterventionTypeSelector'

type Dentist = {
  id: string
  name: string
  specialties: string[]
}

export default function BookingPage() {
  const router = useRouter()
  const [dentists, setDentists] = useState<Dentist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // 🆕 État pour le type d'intervention
  const [interventionType, setInterventionType] = useState('')
  const [ageCategory, setAgeCategory] = useState('')

  useEffect(() => {
    async function loadDentists() {
      try {
        const response = await fetch('/api/dentists')
        const data = await response.json()
        if (data.success) {
          setDentists(data.data)
        }
      } catch (err) {
        console.error('Error loading dentists:', err)
      }
    }
    loadDentists()
  }, [])

  function handleInterventionSelect(type: string, age: string) {
    setInterventionType(type)
    setAgeCategory(age)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      
      const dentistId = formData.get('dentist') as string
      const date = formData.get('date') as string
      const time = formData.get('time') as string
      const name = formData.get('name') as string
      const phone = formData.get('phone') as string
      const email = formData.get('email') as string
      const notes = formData.get('notes') as string

      if (!interventionType) {
        setError('Veuillez sélectionner un type d\'intervention')
        setLoading(false)
        return
      }

      // Créer ou récupérer le patient
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email || null,
          ageCategory,
        }),
      })

      if (!patientResponse.ok) {
        throw new Error('Erreur lors de la création du patient')
      }

      const patientData = await patientResponse.json()

      // Créer le rendez-vous avec le type d'intervention
      const startTime = new Date(`${date}T${time}:00`)
      
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dentistId,
          patientId: patientData.data.id,
          startTime: startTime.toISOString(),
          interventionType, // 🆕 Envoi du type
          notes: notes || null,
          source: 'web',
        }),
      })

      if (!appointmentResponse.ok) {
        throw new Error('Erreur lors de la création du rendez-vous')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rendez-vous confirmé !</h2>
          <p className="text-gray-600">Vous allez être redirigé vers l'accueil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prendre rendez-vous
          </h1>
          <p className="text-gray-600">
            Remplissez le formulaire pour réserver votre consultation
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 🆕 Sélecteur de type d'intervention */}
            <InterventionTypeSelector 
              onSelect={handleInterventionSelect}
              selectedType={interventionType}
            />

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Informations du rendez-vous
              </h3>

              {/* Dentiste */}
              <div className="mb-4">
                <label htmlFor="dentist" className="block text-sm font-medium text-gray-700 mb-1">
                  Dentiste *
                </label>
                <select
                  id="dentist"
                  name="dentist"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sélectionnez un dentiste</option>
                  {dentists.map((dentist) => (
                    <option key={dentist.id} value={dentist.id}>
                      {dentist.name} - {dentist.specialties.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Heure */}
              <div className="mb-4">
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Heure *
                </label>
                <select
                  id="time"
                  name="time"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sélectionnez une heure</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vos informations
              </h3>

              {/* Nom */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Téléphone */}
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Notes */}
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Raison de la visite (optionnel)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !interventionType}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Confirmation en cours...' : 'Confirmer le rendez-vous'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}