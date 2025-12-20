import { prisma } from '@/lib/prisma/client'
import AppointmentForm from './AppointmentForm'

export default async function NewAppointmentPage() {
  const dentists = await prisma.dentist.findMany()
  const patients = await prisma.patient.findMany()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nouveau rendez-vous</h1>
          <p className="mt-2 text-gray-600">Créer un nouveau rendez-vous</p>
        </div>

        <AppointmentForm dentists={dentists} patients={patients} />
      </div>
    </main>
  )
}