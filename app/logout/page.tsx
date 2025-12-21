import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LogoutPage() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
  
  // Cette ligne ne sera jamais exécutée (redirect arrête l'exécution)
  // Mais Next.js exige un retour JSX
  return null
}