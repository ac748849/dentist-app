'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type Appointment = {
  id: string
  startTime: string
  endTime: string
  status: string
  interventionType: string
  notes: string | null
  patient: {
    name: string
    phone: string
    email: string | null
  }
  dentist: {
    name: string
  }
}

export default function AppointmentsPage() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams?.get('status') || 'ALL'
  
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(initialStatus)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()
      
      if (data.success) {
        setAppointments(data.data)
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(appointmentId: string, newStatus: string) {
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, status: newStatus }),
      })

      if (response.ok) {
        await loadAppointments()
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'CONFIRMED': return 'Confirmé'
      case 'CANCELLED': return 'Annulé'
      case 'COMPLETED': return 'Terminé'
      case 'NO_SHOW': return 'Absent'
      default: return status
    }
  }

  const getInterventionLabel = (type: string) => {
    const labels: Record<string, string> = {
      'CONTROLE': 'Contrôle',
      'URGENCE': 'Urgence',
      'PREMIERE_VISITE': 'Première visite',
      'CARIE': 'Carie',
      'DEVITALISATION': 'Dévitalisation',
      'EXTRACTION': 'Extraction',
      'DETARTRAGE': 'Détartrage',
      'BLANCHIMENT': 'Blanchiment',
      'COURONNE': 'Couronne',
      'BRIDGE': 'Bridge',
      'IMPLANT': 'Implant',
      'ORTHODONTIE_CONSULTATION': 'Consultation orthodontie',
      'PEDIATRIE_CONTROLE': 'Contrôle pédiatrie',
      'PEDIATRIE_SOIN': 'Soin pédiatrie',
    }
    return labels[type] || type
  }

  const filteredAppointments = appointments
    .filter(apt => {
      if (filter === 'ALL') return true
      return apt.status === filter
    })
    .filter(apt => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        apt.patient.name.toLowerCase().includes(query) ||
        apt.patient.phone.includes(query)
      )
    })
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())

  const stats = {
    all: appointments.length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des rendez-vous
        </h1>
        <p className="text-gray-600">
          {filteredAppointments.length} rendez-vous trouvés
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom ou téléphone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
              />
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'ALL', label: 'Tous', count: stats.all, color: 'bg-gray-100 text-gray-800' },
              { value: 'PENDING', label: 'En attente', count: stats.pending, color: 'bg-yellow-100 text-yellow-800' },
              { value: 'CONFIRMED', label: 'Confirmés', count: stats.confirmed, color: 'bg-green-100 text-green-800' },
              { value: 'COMPLETED', label: 'Terminés', count: stats.completed, color: 'bg-blue-100 text-blue-800' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all border-2
                  ${filter === tab.value
                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${filter === tab.value ? 'bg-teal-200' : tab.color}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous trouvé</p>
          <p className="text-gray-600">Modifiez vos filtres ou recherche</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900">{appointment.patient.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{new Date(appointment.startTime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">
                        {new Date(appointment.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(appointment.endTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${appointment.patient.phone}`} className="font-medium hover:text-teal-600 transition">
                        {appointment.patient.phone}
                      </a>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <span className="font-medium">{getInterventionLabel(appointment.interventionType)}</span>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      <span className="font-medium">Notes : </span>
                      {appointment.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  {appointment.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateStatus(appointment.id, 'CONFIRMED')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accepter
                      </button>
                      <button
                        onClick={() => updateStatus(appointment.id, 'CANCELLED')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Annuler
                      </button>
                    </>
                  )}

                  {appointment.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => updateStatus(appointment.id, 'COMPLETED')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Terminé
                      </button>
                      <button
                        onClick={() => updateStatus(appointment.id, 'CANCELLED')}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Annuler
                      </button>
                    </>
                  )}

                  {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                    <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium text-center">
                      Archivé
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}