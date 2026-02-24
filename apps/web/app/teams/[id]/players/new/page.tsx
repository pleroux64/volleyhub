'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { use } from 'react'


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

    const { error } = await supabase
      .from('players')
      .insert({
        team_id: teamId,
        name,
        jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
        position,
        gender,
        height,
        experience_level: experienceLevel,
        dominant_hand: dominantHand
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/teams/${teamId}`)
    router.refresh()
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <div className="mb-8">
        <Link href={`/teams/${teamId}`} className="text-sm text-gray-500 hover:text-black">
          ← Back to roster
        </Link>
        <h1 className="text-3xl font-bold mt-4">Add Player</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            placeholder="e.g. Sarah Johnson"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Jersey Number</label>
          <input
            type="number"
            value={jerseyNumber}
            onChange={e => setJerseyNumber(e.target.value)}
            placeholder="e.g. 10"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <select
            value={position}
            onChange={e => setPosition(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Select position</option>
            <option value="Outside Hitter">Outside Hitter</option>
            <option value="Opposite">Opposite</option>
            <option value="Middle Blocker">Middle Blocker</option>
            <option value="Setter">Setter</option>
            <option value="Libero">Libero</option>
            <option value="Defensive Specialist">Defensive Specialist</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Select gender</option>
            <option value="M">M</option>
            <option value="F">F</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Height</label>
          <input
            type="text"
            value={height}
            onChange={e => setHeight(e.target.value)}
            placeholder="e.g. 5'10"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Experience Level</label>
          <select
            value={experienceLevel}
            onChange={e => setExperienceLevel(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Elite">Elite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dominant Hand</label>
          <select
            value={dominantHand}
            onChange={e => setDominantHand(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Select hand</option>
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Player'}
        </button>
      </form>
    </main>
  )
}
