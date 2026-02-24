'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="mt-4 bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800"
    >
      Sign out
    </button>
  )
}
