'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { use } from 'react'
import NavHeader from '@/components/NavHeader'

const inputClass = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all bg-white"
const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5"

export default function NewPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params)
  const [name, setName] = useState('')
  const [jerseyNumber, setJerseyNumber] = useState('')
  const [position, setPosition] = useState('')
  const [gender, setGender] = useState('')
  const [height, setHeight] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [dominantHand, setDominantHand] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.from('players').insert({
      team_id: teamId, name,
      jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
      position, gender, height,
      experience_level: experienceLevel,
      dominant_hand: dominantHand
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/teams/${teamId}`)
    router.refresh()
  }

  return (
    <>
      <NavHeader />
      <main className="max-w-xl mx-auto px-6 py-10">
        <Link href={`/teams/${teamId}`} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
          ← Back to roster
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-8">Add Player</h1>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {/* Section: Identity */}
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50/50 to-white">
            <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">Player Info</p>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelClass}>Name <span className="text-red-400 normal-case">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Sarah Johnson" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Jersey No.</label>
                  <input type="number" value={jerseyNumber} onChange={e => setJerseyNumber(e.target.value)} placeholder="e.g. 10" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Height</label>
                  <input type="text" value={height} onChange={e => setHeight(e.target.value)} placeholder={"e.g. 5'10\""} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Position</label>
                  <select value={position} onChange={e => setPosition(e.target.value)} className={inputClass}>
                    <option value="">Select position</option>
                    {['Outside Hitter','Opposite','Middle Blocker','Setter','Libero','Defensive Specialist'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Experience</label>
                  <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className={inputClass}>
                    <option value="">Select level</option>
                    {['Beginner','Intermediate','Advanced','Elite'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Dominant Hand</label>
                  <select value={dominantHand} onChange={e => setDominantHand(e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 transition-all shadow-sm shadow-cyan-200 mt-1"
              >
                {loading ? 'Adding...' : 'Add Player'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
