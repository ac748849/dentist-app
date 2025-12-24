export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🦷 Cabinet Dentaire</h1>
          <p className="mt-1 text-sm text-gray-600">Gestion de rendez-vous en ligne</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Bienvenue</h2>
          <p className="mt-4 text-xl text-gray-600">Prenez rendez-vous facilement avec votre dentiste</p>
          
          <div className="mt-10">
            <a href="/appointments" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
              Voir les rendez-vous
            </a>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900">Réservation en ligne</h3>
            <p className="mt-2 text-gray-600">Choisissez votre créneau en quelques clics</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-900">Rappels automatiques</h3>
            <p className="mt-2 text-gray-600">Recevez des rappels par email et SMS</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-900">Via Telegram</h3>
            <p className="mt-2 text-gray-600">Prenez RDV directement sur Telegram</p>
          </div>
        </div>
      </div>
    </main>
  )
}