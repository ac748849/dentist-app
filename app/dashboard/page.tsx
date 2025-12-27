'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Appointment = {
  id: string
  startTime: string
  endTime: string
  status: string
  interventionType: string
  patient: {
    name: string
    phone: string
  }
}

export default function DashboardHomePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    thisWeek: 0,
  })

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()
      
      if (data.success) {
        const appts = data.data
        setAppointments(appts)
        
        // Calculate stats
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekEnd = new Date(today)
        weekEnd.setDate(weekEnd.getDate() + 7)

        setStats({
          total: appts.length,
          today: appts.filter((a: Appointment) => {
            const apptDate = new Date(a.startTime)
            return apptDate >= today && apptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }).length,
          pending: appts.filter((a: Appointment) => a.status === 'PENDING').length,
          thisWeek: appts.filter((a: Appointment) => {
            const apptDate = new Date(a.startTime)
            return apptDate >= today && apptDate < weekEnd
          }).length,
        })
      }
    } catch (error) {
      console.error('Error loading appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente'
      case 'CONFIRMED': return 'Confirmé'
      case 'CANCELLED': return 'Annulé'
      case 'COMPLETED': return 'Terminé'
      default: return status
    }
  }

  const upcomingAppointments = appointments
    .filter(a => new Date(a.startTime) >= new Date() && a.status !== 'CANCELLED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bienvenue, Dr. Dubois 👋
        </h1>
        <p className="text-gray-600">
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Total rendez-vous</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.today}</div>
          <div className="text-sm text-gray-600">Aujourd'hui</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pending}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.thisWeek}</div>
          <div className="text-sm text-gray-600">Cette semaine</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link 
          href="/dashboard/appointments?status=PENDING"
          className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <svg className="w-6 h-6 text-yellow-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">RDV en attente</h3>
          <p className="text-gray-600 text-sm">Gérer les demandes de rendez-vous</p>
        </Link>

        <Link 
          href="/dashboard/calendar"
          className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <svg className="w-6 h-6 text-teal-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Calendrier</h3>
          <p className="text-gray-600 text-sm">Voir votre planning complet</p>
        </Link>

        <Link 
          href="/booking"
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <svg className="w-6 h-6 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Nouveau RDV</h3>
          <p className="text-gray-600 text-sm">Créer un rendez-vous manuel</p>
        </Link>
      </div>

      {/* Upcoming appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Prochains rendez-vous</h2>
          <Link 
            href="/dashboard/appointments"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center"
          >
            Voir tous
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium">Aucun rendez-vous à venir</p>
            <p className="text-sm mt-2">Les prochains rendez-vous apparaîtront ici</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-gray-900">{appointment.patient.name}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(appointment.startTime).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(appointment.startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center">
                        📞 {appointment.patient.phone}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/appointments"
                    className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg font-medium text-sm transition-colors"
                  >
                    Gérer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}