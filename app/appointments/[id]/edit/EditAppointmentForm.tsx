'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Appointment = {
  id: string
  dentistId: string
  patientId: string
  startTime: Date
  endTime: Date
  status: string
  notes: string | null
}

type Dentist = {
  id: string
  name: string
}

type Patient = {
  id: string
  name: string
  phone: string
}

export default function EditAppointmentForm({ appointment, dentists, patients }: { 
  appointment: Appointment
  dentists: Dentist[]
  patients: Patient[] 
}) {
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
      notes: formData.get('notes') || null,
    }

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la modification')
      }

      router.push('/appointments')
      router.refresh()
    } catch (err) {
      setError('Erreur lors de la modification du rendez-vous')
      setLoading(false)
    }
  }

  const formatDateTimeLocal = (date: Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
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
          <select id="dentistId" name="dentistId" required defaultValue={appointment.dentistId} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            {dentists.map((dentist) => (
              <option key={dentist.id} value={dentist.id}>{dentist.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient</label>
          <select id="patientId" name="patientId" required defaultValue={appointment.patientId} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.name} - {patient.phone}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Date et heure de début</label>
          <input type="datetime-local" id="startTime" name="startTime" required defaultValue={formatDateTimeLocal(appointment.startTime)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Date et heure de fin</label>
          <input type="datetime-local" id="endTime" name="endTime" required defaultValue={formatDateTimeLocal(appointment.endTime)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut</label>
          <select id="status" name="status" required defaultValue={appointment.status} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md">
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmé</option>
            <option value="CANCELLED">Annulé</option>
            <option value="COMPLETED">Terminé</option>
            <option value="NO_SHOW">Absent</option>
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={appointment.notes || ''} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Contrôle de routine, urgence, etc." />
        </div>

        <div className="flex justify-end space-x-3">
          <a href="/appointments" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</a>
          <button type="submit" disabled={loading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
            {loading ? 'Modification...' : 'Modifier le rendez-vous'}
          </button>
        </div>
      </form>
    </div>
  )
}