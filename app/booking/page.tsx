'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  // Charger les dentistes au démarrage
  useEffect(() => {
    async function loadDentists() {
      try {
        const response = await fetch('/api/dentists')
        const data = await response.json()
        if (data.success) {
          setDentists(data.data)
        }
      } catch (err) {
        console.error('Erreur chargement dentistes:', err)
      }
    }
    loadDentists()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    const dentistId = formData.get('dentist') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const notes = formData.get('notes') as string

    const startTime = new Date(`${date}T${time}:00`)
    const endTime = new Date(startTime.getTime() + 30 * 60000)

    try {
      // 1. Créer/récupérer le patient
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
      })

      if (!patientResponse.ok) throw new Error('Erreur patient')

      const { data: patient } = await patientResponse.json()

      // 2. Créer le rendez-vous
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dentistId,
          patientId: patient.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          status: 'PENDING',
          source: 'web',
          notes: notes || null,
        }),
      })

      if (!appointmentResponse.ok) throw new Error('Erreur rendez-vous')

      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)

    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">🦷 Prendre rendez-vous</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Rendez-vous confirmé !</h3>
              <p className="mt-2 text-sm text-gray-500">Vous allez recevoir une confirmation par SMS.</p>
              <p className="mt-4 text-sm text-gray-500">Redirection vers l'accueil...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🦷 Prendre rendez-vous</h1>
              <p className="mt-1 text-sm text-gray-600">Réservez votre consultation en quelques clics</p>
            </div>
            <a href="/" className="text-sm text-indigo-600 hover:text-indigo-800">← Retour à l'accueil</a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations sur le rendez-vous</h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dentist" className="block text-sm font-medium text-gray-700">Choisir un dentiste</label>
              <select id="dentist" name="dentist" required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
                <option value="">Sélectionner un dentiste</option>
                {dentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.name} {dentist.specialties.length > 0 && `- ${dentist.specialties.join(', ')}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Choisir une date</label>
              <input type="date" id="date" name="date" required min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md" />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">Choisir une heure</label>
              <select id="time" name="time" required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
                <option value="">Sélectionner un créneau</option>
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

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vos informations</h3>
              
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom complet</label>
                <input type="text" id="name" name="name" required className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md" placeholder="Jean Dupont" />
              </div>

              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input type="tel" id="phone" name="phone" required className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md" placeholder="06 12 34 56 78" />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (optionnel)</label>
                <input type="email" id="email" name="email" className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md" placeholder="jean.dupont@email.com" />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
                <textarea id="notes" name="notes" rows={3} className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md" placeholder="Motif de la consultation, urgence, etc." />
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
                {loading ? 'Confirmation en cours...' : 'Confirmer le rendez-vous'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}