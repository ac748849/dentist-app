import { prisma } from '@/lib/prisma/client'

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

        <div className="bg-white shadow-md rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-4">Note: Ce formulaire est en développement. Utilisez l&apos;API pour créer des rendez-vous pour le moment.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dentistes disponibles</label>
              <ul className="mt-2 border rounded p-3">
                {dentists.map((d) => (
                  <li key={d.id} className="text-sm">{d.name} - {d.email}</li>
                ))}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Patients enregistrés</label>
              <ul className="mt-2 border rounded p-3">
                {patients.map((p) => (
                  <li key={p.id} className="text-sm">{p.name} - {p.phone}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <a href="/appointments" className="text-indigo-600 hover:text-indigo-800">← Retour à la liste</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}