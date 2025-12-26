'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type InterventionType = 
  | 'CONTROLE' | 'URGENCE' | 'PREMIERE_VISITE'
  | 'CARIE' | 'DEVITALISATION' | 'EXTRACTION' | 'DETARTRAGE' | 'BLANCHIMENT'
  | 'COURONNE' | 'BRIDGE' | 'IMPLANT' | 'PROTHESE_COMPLETE' | 'PROTHESE_PARTIELLE'
  | 'ORTHODONTIE_CONSULTATION' | 'ORTHODONTIE_SUIVI' | 'ORTHODONTIE_POSE' | 'ORTHODONTIE_RETRAIT'
  | 'PEDIATRIE_CONTROLE' | 'PEDIATRIE_SOIN' | 'PEDIATRIE_PREVENTION'
  | 'CHIRURGIE_SIMPLE' | 'CHIRURGIE_COMPLEXE' | 'GREFFE_OSSEUSE'
  | 'AUTRE'

type PatientAge = 'ENFANT' | 'ADOLESCENT' | 'ADULTE' | 'SENIOR'

type InterventionInfo = {
  type: InterventionType
  label: string
  duration: number
  icon: string
  description: string
}

const interventionsByAge: Record<PatientAge, InterventionInfo[]> = {
  ENFANT: [
    { type: 'PEDIATRIE_CONTROLE', label: 'Contrôle dentaire', duration: 20, icon: '🔍', description: 'Examen complet des dents' },
    { type: 'PEDIATRIE_SOIN', label: 'Soin dentaire', duration: 30, icon: '🦷', description: 'Traitement des caries' },
    { type: 'PEDIATRIE_PREVENTION', label: 'Prévention', duration: 15, icon: '✨', description: 'Fluoration, scellement' },
  ],
  ADOLESCENT: [
    { type: 'CONTROLE', label: 'Contrôle / Check-up', duration: 30, icon: '🔍', description: 'Examen dentaire complet' },
    { type: 'ORTHODONTIE_CONSULTATION', label: 'Consultation orthodontie', duration: 45, icon: '😊', description: 'Première évaluation' },
    { type: 'ORTHODONTIE_SUIVI', label: 'Suivi orthodontie', duration: 20, icon: '📋', description: 'Contrôle appareil' },
    { type: 'ORTHODONTIE_POSE', label: 'Pose appareil', duration: 90, icon: '🦷', description: 'Installation brackets' },
    { type: 'DETARTRAGE', label: 'Détartrage', duration: 45, icon: '✨', description: 'Nettoyage professionnel' },
    { type: 'BLANCHIMENT', label: 'Blanchiment', duration: 60, icon: '💎', description: 'Éclaircissement dentaire' },
    { type: 'CARIE', label: 'Traitement carie', duration: 45, icon: '🦷', description: 'Soin conservateur' },
  ],
  ADULTE: [
    { type: 'CONTROLE', label: 'Contrôle / Check-up', duration: 30, icon: '🔍', description: 'Examen dentaire complet' },
    { type: 'URGENCE', label: 'Urgence dentaire', duration: 30, icon: '🚨', description: 'Douleur, infection' },
    { type: 'DETARTRAGE', label: 'Détartrage', duration: 45, icon: '✨', description: 'Nettoyage professionnel' },
    { type: 'BLANCHIMENT', label: 'Blanchiment', duration: 60, icon: '💎', description: 'Éclaircissement dentaire' },
    { type: 'CARIE', label: 'Traitement carie', duration: 45, icon: '🦷', description: 'Composite, amalgame' },
    { type: 'DEVITALISATION', label: 'Dévitalisation', duration: 90, icon: '🔧', description: 'Traitement du canal' },
    { type: 'EXTRACTION', label: 'Extraction', duration: 30, icon: '⚕️', description: 'Retrait dentaire' },
    { type: 'COURONNE', label: 'Couronne', duration: 60, icon: '👑', description: 'Prothèse fixe' },
    { type: 'BRIDGE', label: 'Bridge', duration: 90, icon: '🌉', description: 'Pont dentaire' },
    { type: 'IMPLANT', label: 'Implant dentaire', duration: 120, icon: '🔩', description: 'Implant + pilier' },
    { type: 'ORTHODONTIE_CONSULTATION', label: 'Consultation orthodontie', duration: 45, icon: '😊', description: 'Aligneurs invisibles' },
    { type: 'CHIRURGIE_SIMPLE', label: 'Chirurgie simple', duration: 90, icon: '⚕️', description: 'Extraction complexe' },
  ],
  SENIOR: [
    { type: 'CONTROLE', label: 'Contrôle / Check-up', duration: 30, icon: '🔍', description: 'Examen complet' },
    { type: 'URGENCE', label: 'Urgence dentaire', duration: 30, icon: '🚨', description: 'Prise en charge rapide' },
    { type: 'DETARTRAGE', label: 'Détartrage', duration: 45, icon: '✨', description: 'Nettoyage professionnel' },
    { type: 'PROTHESE_COMPLETE', label: 'Prothèse complète', duration: 90, icon: '🦷', description: 'Dentier complet' },
    { type: 'PROTHESE_PARTIELLE', label: 'Prothèse partielle', duration: 60, icon: '🦷', description: 'Dentier partiel' },
    { type: 'IMPLANT', label: 'Implant dentaire', duration: 120, icon: '🔩', description: 'Solution durable' },
    { type: 'COURONNE', label: 'Couronne', duration: 60, icon: '👑', description: 'Prothèse fixe' },
    { type: 'BRIDGE', label: 'Bridge', duration: 90, icon: '🌉', description: 'Pont dentaire' },
    { type: 'EXTRACTION', label: 'Extraction', duration: 30, icon: '⚕️', description: 'Retrait dentaire' },
  ],
}

export default function BookingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedAge, setSelectedAge] = useState<PatientAge | null>(null)
  const [selectedIntervention, setSelectedIntervention] = useState<InterventionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    notes: '',
  })

  const handleAgeSelect = (age: PatientAge) => {
    setSelectedAge(age)
    setSelectedIntervention(null)
    setStep(2)
  }

  const handleInterventionSelect = (intervention: InterventionInfo) => {
    setSelectedIntervention(intervention)
    setStep(3)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Créer/MAJ le patient
      const patientResponse = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          ageCategory: selectedAge,
        }),
      })

      if (!patientResponse.ok) throw new Error('Erreur lors de la création du patient')

      const patientData = await patientResponse.json()

      // 2. Créer le rendez-vous
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dentistId: 'cmjhfa6pr000oyg5kszlc7irs', // ID du dentiste
          patientId: patientData.data.id,
          startTime: formData.date,
          interventionType: selectedIntervention?.type,
          notes: formData.notes || null,
          source: 'web',
        }),
      })

      if (!appointmentResponse.ok) throw new Error('Erreur lors de la création du rendez-vous')

      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Rendez-vous confirmé !</h2>
          <p className="text-gray-600 mb-6">
            Votre demande de rendez-vous a été envoyée avec succès. 
            Nous vous contacterons rapidement pour confirmer la date et l'heure.
          </p>
          <p className="text-sm text-gray-500">Redirection vers l'accueil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">Cabinet Dentaire</div>
                <div className="text-sm text-teal-600 font-medium">Sainte-Catherine</div>
              </div>
            </Link>
            
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Progress steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                  step >= stepNum 
                    ? 'bg-teal-500 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-24 h-1 mx-2 transition-all ${
                    step > stepNum ? 'bg-teal-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 text-sm text-gray-600">
            <span className="w-24 text-center">Profil</span>
            <span className="w-24 text-center mx-2">Service</span>
            <span className="w-24 text-center">Coordonnées</span>
          </div>
        </div>

        {/* Step 1: Age selection */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Réserver un rendez-vous
              </h1>
              <p className="text-xl text-gray-600">
                Commençons par votre profil
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                { age: 'ENFANT' as PatientAge, label: 'Enfant', subtitle: '0-12 ans', icon: '👶', color: 'from-pink-500 to-rose-500' },
                { age: 'ADOLESCENT' as PatientAge, label: 'Adolescent', subtitle: '13-17 ans', icon: '🧒', color: 'from-purple-500 to-indigo-500' },
                { age: 'ADULTE' as PatientAge, label: 'Adulte', subtitle: '18-64 ans', icon: '🧑', color: 'from-teal-500 to-cyan-500' },
                { age: 'SENIOR' as PatientAge, label: 'Senior', subtitle: '65+ ans', icon: '👴', color: 'from-orange-500 to-amber-500' },
              ].map((item) => (
                <button
                  key={item.age}
                  onClick={() => handleAgeSelect(item.age)}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-teal-500 hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className={`absolute top-4 right-4 w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="pr-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.label}</h3>
                    <p className="text-gray-600">{item.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Intervention selection */}
        {step === 2 && selectedAge && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-10">
              <button
                onClick={() => setStep(1)}
                className="text-teal-600 hover:text-teal-700 font-medium flex items-center mb-6"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Changer de profil
              </button>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Quel soin souhaitez-vous ?
              </h2>
              <p className="text-xl text-gray-600">
                Sélectionnez le type d'intervention
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interventionsByAge[selectedAge].map((intervention) => (
                <button
                  key={intervention.type}
                  onClick={() => handleInterventionSelect(intervention)}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-teal-500 hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{intervention.icon}</div>
                    <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {intervention.duration} min
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{intervention.label}</h3>
                  <p className="text-sm text-gray-600">{intervention.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Form */}
        {step === 3 && selectedIntervention && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-10">
              <button
                onClick={() => setStep(2)}
                className="text-teal-600 hover:text-teal-700 font-medium flex items-center mb-6"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Changer de service
              </button>

              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Vos coordonnées
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Dernière étape pour confirmer votre rendez-vous
              </p>

              {/* Selected info recap */}
              <div className="bg-teal-50 border-2 border-teal-100 rounded-xl p-6 mb-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-teal-600 font-semibold mb-2">Service sélectionné</div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{selectedIntervention.icon}</span>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{selectedIntervention.label}</div>
                        <div className="text-sm text-gray-600">{selectedIntervention.description}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                    <div className="text-sm text-gray-600">Durée</div>
                    <div className="text-xl font-bold text-teal-600">{selectedIntervention.duration} min</div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
                    placeholder="0612345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email (optionnel)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
                  placeholder="jean.dupont@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date et heure souhaitées *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={getTomorrowDate()}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition"
                />
                <p className="text-sm text-gray-500 mt-2">
                  📅 Horaires : Lun-Ven 9h-18h, Sam 9h-13h
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes / Informations complémentaires
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-0 outline-none transition resize-none"
                  placeholder="Allergies, préférences horaires, questions..."
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">À noter</p>
                    <p>
                      Cette demande sera confirmée par notre équipe. Vous recevrez un appel ou SMS 
                      pour valider votre rendez-vous dans les plus brefs délais.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold hover:border-gray-300 transition-all"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Confirmer le rendez-vous'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Contact footer */}
      <div className="bg-teal-50 border-t border-teal-100 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-700 mb-4">
            <strong>Besoin d'aide ?</strong> Notre équipe est là pour vous
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:+3221234567"
              className="flex items-center text-teal-600 hover:text-teal-700 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              02 123 45 67
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="mailto:contact@dentiste-stecatherine.be"
              className="flex items-center text-teal-600 hover:text-teal-700 font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@dentiste-stecatherine.be
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}