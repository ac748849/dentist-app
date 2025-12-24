'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        router.push('/dashboard/settings?error=access_denied')
        return
      }

      if (!code || !state) {
        router.push('/dashboard/settings?error=invalid_request')
        return
      }

      try {
        const response = await fetch('/api/auth/google/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, dentistId: state }),
        })

        if (response.ok) {
          router.push('/dashboard/settings?success=calendar_connected')
        } else {
          router.push('/dashboard/settings?error=callback_failed')
        }
      } catch (err) {
        console.error('Error during callback:', err)
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' ? (
          <>
            <svg className="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Connexion en cours...</p>
          </>
        ) : (
          <>
            <p className="text-gray-900 font-medium mb-2">Erreur de connexion</p>
            <a href="/dashboard/settings" className="text-indigo-600 hover:underline">
              Retour
            </a>
          </>
        )}
      </div>
    </div>
  )
}