'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Dentist = {
  id: string
  name: string
}

type Patient = {
  id: string
  name: string
  phone: string
}

export default function AppointmentForm({ dentists, patients }: { dentists: Dentist[], patients: Patient[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    
    const data = {
      dentistId: formData.get('dentistId'),
      patientId: formData.get('patientId'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      status: formData.get('status'),
      source: 'web',
      notes: formData.get('notes') || null,
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création')
      }

      router.push('/appointments')
      router.refresh()
    } catch (err) {
      setError('Erreur lors de la création du rendez-vous')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="dentistId" className="block text-sm font-medium text-gray-700">Dentiste</label>
          <select id="dentistId" name="dentistId" required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="">Sélectionner un dentiste</option>
            {dentists.map((dentist) => (
              <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient</label>
          <select id="patientId" name="patientId" required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="">Sélectionner un patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.name} - {patient.phone}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Date et heure de début</label>
          <input type="datetime-local" id="startTime" name="startTime" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Date et heure de fin</label>
          <input type="datetime-local" id="endTime" name="endTime" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
          <select id="status" name="status" required className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
          <textarea id="notes" name="notes" rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Contrôle de routine, urgence, etc." />
        </div>

        <div className="flex justify-end space-x-3">
          <a href="/appointments" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</a>
          <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
            {loading ? 'Création...' : 'Créer le rendez-vous'}
          </button>
        </div>
      </form>
    </div>
  )
}