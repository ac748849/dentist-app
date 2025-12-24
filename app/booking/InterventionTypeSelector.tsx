'use client'

import { useState } from 'react'

type InterventionOption = {
  value: string
  label: string
  duration: string
  icon: string
}

type Props = {
  onSelect: (type: string, ageCategory: string) => void
  selectedType?: string
}

export default function InterventionTypeSelector({ onSelect, selectedType }: Props) {
  const [ageCategory, setAgeCategory] = useState<string>('')
  const [showTypes, setShowTypes] = useState(false)

  const ageCategories = [
    { value: 'ENFANT', label: '👶 Enfant (0-12 ans)', color: 'bg-pink-50 border-pink-200' },
    { value: 'ADOLESCENT', label: '👦 Adolescent (13-17 ans)', color: 'bg-blue-50 border-blue-200' },
    { value: 'ADULTE', label: '👤 Adulte (18-64 ans)', color: 'bg-green-50 border-green-200' },
    { value: 'SENIOR', label: '👴 Senior (65+ ans)', color: 'bg-purple-50 border-purple-200' },
  ]

  const interventionsByAge: Record<string, InterventionOption[]> = {
    ENFANT: [
      { value: 'PEDIATRIE_CONTROLE', label: 'Contrôle dentaire', duration: '20 min', icon: '🔍' },
      { value: 'PEDIATRIE_SOIN', label: 'Soin dentaire', duration: '30 min', icon: '🦷' },
      { value: 'PEDIATRIE_PREVENTION', label: 'Prévention / Éducation', duration: '15 min', icon: '📚' },
    ],
    ADOLESCENT: [
      { value: 'PEDIATRIE_CONTROLE', label: 'Contrôle dentaire', duration: '20 min', icon: '🔍' },
      { value: 'ORTHODONTIE_CONSULTATION', label: 'Consultation orthodontie', duration: '30 min', icon: '🦷' },
      { value: 'ORTHODONTIE_SUIVI', label: 'Suivi appareil', duration: '20 min', icon: '📊' },
      { value: 'DETARTRAGE', label: 'Détartrage', duration: '45 min', icon: '✨' },
      { value: 'URGENCE', label: 'Urgence / Douleur', duration: '30 min', icon: '🚨' },
    ],
    ADULTE: [
      { value: 'CONTROLE', label: 'Contrôle / Check-up', duration: '30 min', icon: '🔍' },
      { value: 'URGENCE', label: 'Urgence / Douleur', duration: '30 min', icon: '🚨' },
      { value: 'DETARTRAGE', label: 'Détartrage / Nettoyage', duration: '45 min', icon: '✨' },
      { value: 'CARIE', label: 'Traitement carie', duration: '45 min', icon: '🦷' },
      { value: 'DEVITALISATION', label: 'Dévitalisation', duration: '90 min', icon: '💉' },
      { value: 'EXTRACTION', label: 'Extraction dentaire', duration: '30 min', icon: '🪥' },
      { value: 'COURONNE', label: 'Couronne', duration: '60 min', icon: '👑' },
      { value: 'IMPLANT', label: 'Implant dentaire', duration: '120 min', icon: '🔩' },
      { value: 'BLANCHIMENT', label: 'Blanchiment', duration: '60 min', icon: '⭐' },
      { value: 'ORTHODONTIE_CONSULTATION', label: 'Consultation orthodontie', duration: '30 min', icon: '🦷' },
      { value: 'AUTRE', label: 'Autre intervention', duration: '30 min', icon: '❓' },
    ],
    SENIOR: [
      { value: 'CONTROLE', label: 'Contrôle / Check-up', duration: '30 min', icon: '🔍' },
      { value: 'URGENCE', label: 'Urgence / Douleur', duration: '30 min', icon: '🚨' },
      { value: 'DETARTRAGE', label: 'Détartrage', duration: '45 min', icon: '✨' },
      { value: 'PROTHESE_COMPLETE', label: 'Dentier complet', duration: '90 min', icon: '🦷' },
      { value: 'PROTHESE_PARTIELLE', label: 'Dentier partiel', duration: '60 min', icon: '🪥' },
      { value: 'IMPLANT', label: 'Implant dentaire', duration: '120 min', icon: '🔩' },
      { value: 'COURONNE', label: 'Couronne', duration: '60 min', icon: '👑' },
      { value: 'EXTRACTION', label: 'Extraction', duration: '30 min', icon: '🪥' },
    ],
  }

  function handleAgeSelect(age: string) {
    setAgeCategory(age)
    setShowTypes(true)
  }

  function handleTypeSelect(type: string) {
    onSelect(type, ageCategory)
  }

  return (
    <div className="space-y-6">
      {/* Étape 1 : Sélection âge */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pour qui est le rendez-vous ? *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {ageCategories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleAgeSelect(cat.value)}
              className={`
                p-4 rounded-lg border-2 text-left transition
                ${ageCategory === cat.value 
                  ? `border-indigo-600 ${cat.color}` 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              <p className="font-medium text-gray-900">{cat.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Étape 2 : Sélection type d'intervention */}
      {showTypes && (
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Type d'intervention *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {interventionsByAge[ageCategory]?.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeSelect(type.value)}
                className={`
                  p-4 rounded-lg border-2 text-left transition
                  ${selectedType === type.value
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                  }
                `}
              >
                <div className="flex items-start">
                  <span className="text-3xl mr-3">{type.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{type.label}</p>
                    <p className="text-sm text-gray-500">⏱️ {type.duration}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}