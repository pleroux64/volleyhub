'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'

const inputClass = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"

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
      .insert({ name, level, season, coach_id: user.id })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/teams')
    router.refresh()
  }

  return (
    <>
      <NavHeader />
      <main className="max-w-xl mx-auto px-6 py-10">
        <Link href="/teams" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          ← Back to teams
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-8">New Team</h1>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className={labelClass}>
                Team Name <span className="text-red-400 normal-case">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Valley Volleyball Club"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className={inputClass}
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
              <label className={labelClass}>Season</label>
              <input
                type="text"
                value={season}
                onChange={e => setSeason(e.target.value)}
                placeholder="e.g. Fall 2025"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 transition-all shadow-sm shadow-cyan-200 mt-1"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
