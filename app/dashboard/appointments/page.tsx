'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Appointment = {
  id: string
  startTime: string
  endTime: string
  status: string
  interventionType: string
  duration: number
  notes?: string
  patient: {
    id: string
    name: string
    phone: string
    email?: string
  }
  dentist: {
    name: string
  }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
  COMPLETED: 'Terminé',
  NO_SHOW: 'Absent',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
}

export default function AppointmentsPage() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(statusFilter || 'ALL')

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()
      
      if (data.success) {
        // Trier par date (plus récent en premier)
        const sorted = data.data.sort((a: Appointment, b: Appointment) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        setAppointments(sorted)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateStatus(appointmentId: string, newStatus: string) {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      })
  
      if (response.ok) {
        // Recharger la liste
        loadAppointments()
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const filteredAppointments = filter === 'ALL' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rendez-vous</h1>
            <p className="mt-2 text-gray-600">Gérez vos rendez-vous</p>
          </div>
          
          <a 
            href="/dashboard"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Retour
          </a>
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({appointments.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'PENDING'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              En attente ({appointments.filter(a => a.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('CONFIRMED')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'CONFIRMED'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Confirmés ({appointments.filter(a => a.status === 'CONFIRMED').length})
            </button>
            <button
              onClick={() => setFilter('CANCELLED')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'CANCELLED'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Annulés ({appointments.filter(a => a.status === 'CANCELLED').length})
            </button>
          </div>
        </div>

        {/* Liste des RDV */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Aucun rendez-vous {filter !== 'ALL' && 'avec ce statut'}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    {/* Info RDV */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            {appointment.patient.name}
                          </p>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>📞 {appointment.patient.phone}</span>
                            {appointment.patient.email && (
                              <span>✉️ {appointment.patient.email}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center space-x-6">
                        <div>
                          <span className="text-sm text-gray-500">Date et heure</span>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(appointment.startTime).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}{' '}
                            à{' '}
                            {new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm text-gray-500">Type</span>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.interventionType}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm text-gray-500">Durée</span>
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.duration} min
                          </p>
                        </div>

                        <div>
                          <span className="text-sm text-gray-500">Statut</span>
                          <p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                STATUS_COLORS[appointment.status]
                              }`}
                            >
                              {STATUS_LABELS[appointment.status]}
                            </span>
                          </p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Notes : </span>
                          <span className="text-sm text-gray-700">{appointment.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex flex-col space-y-2">
                      {appointment.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(appointment.id, 'CONFIRMED')}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                          >
                            ✅ Accepter
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                          >
                            ❌ Refuser
                          </button>
                        </>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                          >
                            ✅ Terminé
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                          >
                            Annuler
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}