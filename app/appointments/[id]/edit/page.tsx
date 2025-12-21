import { prisma } from '@/lib/prisma/client'
import { notFound } from 'next/navigation'
import EditAppointmentForm from './EditAppointmentForm'

export default async function EditAppointmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [appointment, dentists, patients] = await Promise.all([
    prisma.appointment.findUnique({
      where: { id },
      include: {
        dentist: true,
        patient: true,
      },
    }),
    prisma.dentist.findMany(),
    prisma.patient.findMany(),
  ])

  if (!appointment) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Modifier le rendez-vous</h1>
          <p className="mt-2 text-gray-600">Mettre à jour les informations du rendez-vous</p>
        </div>

        <EditAppointmentForm appointment={appointment} dentists={dentists} patients={patients} />
      </div>
    </main>
  )
}