'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ appointmentId }: { appointmentId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }

      router.refresh()
    } catch (error) {
      alert('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={deleting} className="text-red-600 hover:text-red-900 disabled:text-gray-400">
      {deleting ? 'Suppression...' : 'Supprimer'}
    </button>
  )
}