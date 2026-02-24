import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from './signout-button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">VolleyHub</h1>
        <SignOutButton />
      </div>

      <p className="text-gray-500 mb-8">Welcome, {user.email}</p>

      <div className="flex flex-col gap-4">
        <Link
          href="/teams"
          className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors"
        >
          <h2 className="text-xl font-bold">My Teams</h2>
          <p className="text-gray-500 text-sm mt-1">Manage your rosters and rotation plans</p>
        </Link>
      </div>
    </main>
  )
}