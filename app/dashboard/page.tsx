import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma/client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Récupérer les statistiques
  const [totalAppointments, todayAppointments, upcomingAppointments] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        startTime: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }
    }),
    prisma.appointment.count({
      where: {
        startTime: {
          gte: new Date()
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    })
  ])

  // Prochains RDV
  const nextAppointments = await prisma.appointment.findMany({
    where: {
      startTime: {
        gte: new Date()
      }
    },
    include: {
      patient: true,
      dentist: true
    },
    orderBy: {
      startTime: 'asc'
    },
    take: 5
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Bienvenue, {user.email}</p>
          </div>
          <a href="/logout" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
            Se déconnecter
          </a>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total RDV</p>
                <p className="text-2xl font-semibold text-gray-900">{totalAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Aujourd'hui</p>
                <p className="text-2xl font-semibold text-gray-900">{todayAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">À venir</p>
                <p className="text-2xl font-semibold text-gray-900">{upcomingAppointments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prochains RDV */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Prochains rendez-vous</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {nextAppointments.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Aucun rendez-vous à venir
              </div>
            ) : (
              nextAppointments.map((appointment) => (
                <div key={appointment.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                    <p className="text-sm text-gray-500">{appointment.patient.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.startTime).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(appointment.startTime).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50">
            <a href="/appointments" className="text-sm text-indigo-600 hover:text-indigo-800">
              Voir tous les rendez-vous →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}