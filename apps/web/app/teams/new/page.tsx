'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewTeamPage() {
  const [name, setName] = useState('')
  const [level, setLevel] = useState('')
  const [season, setSeason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { error } = await supabase
      .from('teams')
      .insert({
        name,
        level,
        season,
        coach_id: user.id
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/teams')
    router.refresh()
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/teams" className="text-sm text-gray-500 hover:text-black">
          ← Back to teams
        </Link>
        <h1 className="text-3xl font-bold mt-4">New Team</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Valley Volleyball Club"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Level</label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Select level</option>
            <option value="Recreational">Recreational</option>
            <option value="Club">Club</option>
            <option value="High School">High School</option>
            <option value="College">College</option>
            <option value="Adult League">Adult League</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Season</label>
          <input
            type="text"
            value={season}
            onChange={e => setSeason(e.target.value)}
            placeholder="e.g. Fall 2025"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </main>
  )
}