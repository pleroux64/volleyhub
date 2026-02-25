'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'

type Player = {
  id: string
  name: string
  jersey_number: number | null
  position: string | null
}

type StartingLineup = {
  [key: string]: { playerId: string; playerName: string } | null
}

const POSITIONS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']
const POSITION_LABELS: { [key: string]: string } = {
  P1: 'P1 — Back Right (Server)',
  P2: 'P2 — Front Right',
  P3: 'P3 — Front Center',
  P4: 'P4 — Front Left',
  P5: 'P5 — Back Left',
  P6: 'P6 — Back Center',
}

const inputClass = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500'

export default function NewRotationPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [lineup, setLineup] = useState<StartingLineup>({
    P1: null, P2: null, P3: null, P4: null, P5: null, P6: null
  })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchPlayers() {
      const { data } = await supabase
        .from('players')
        .select('id, name, jersey_number, position')
        .eq('team_id', teamId)
        .order('jersey_number', { ascending: true })

      if (data) setPlayers(data)
      setFetching(false)
    }
    fetchPlayers()
  }, [teamId])

  function assignPlayer(position: string, playerId: string) {
    const player = players.find(p => p.id === playerId)
    if (!player) return

    // Remove this player from any other position first
    const newLineup = { ...lineup }
    Object.keys(newLineup).forEach(pos => {
      if (newLineup[pos]?.playerId === playerId) {
        newLineup[pos] = null
      }
    })

    newLineup[position] = { playerId: player.id, playerName: player.name }
    setLineup(newLineup)
  }

  function clearPosition(position: string) {
    setLineup(prev => ({ ...prev, [position]: null }))
  }

  function getAssignedPlayerIds() {
    return Object.values(lineup)
      .filter(Boolean)
      .map(p => p!.playerId)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check all 6 positions are filled
    const unfilled = POSITIONS.filter(p => !lineup[p])
    if (unfilled.length > 0) {
      setError(`Please assign players to: ${unfilled.join(', ')}`)
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from('rotation_plans')
      .insert({
        team_id: teamId,
        name,
        description,
        starting_lineup: lineup
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(`/teams/${teamId}`)
    router.refresh()
  }

  if (fetching) {
    return (
      <>
        <NavHeader />
        <main className="max-w-2xl mx-auto px-6 py-10">
          <p className="text-slate-400 text-sm">Loading roster...</p>
        </main>
      </>
    )
  }

  if (players.length < 6) {
    return (
      <>
        <NavHeader />
        <main className="max-w-2xl mx-auto px-6 py-10">
          <Link
            href={`/teams/${teamId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 mb-4 transition-colors"
          >
            ← Back to team
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mt-4 mb-4">New Rotation Plan</h1>
          <div className="border border-red-200 rounded-xl p-6 bg-red-50">
            <p className="text-red-600 font-medium">Not enough players</p>
            <p className="text-red-500 text-sm mt-1">
              You need at least 6 players on your roster to create a rotation plan.
              You currently have {players.length}.
            </p>
            <Link
              href={`/teams/${teamId}/players/new`}
              className="inline-block mt-4 bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-cyan-700"
            >
              Add Players
            </Link>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <NavHeader />
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link
            href={`/teams/${teamId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 mb-4 transition-colors"
          >
            ← Back to team
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mt-4">New Rotation Plan</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* Plan details */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. Base Rotation, Rotation vs Tall Blockers"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional notes about this rotation plan"
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Starting lineup */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-1">Starting Lineup</h2>
            <p className="text-slate-400 text-sm mb-4">
              Assign players to their starting rotation positions.
              P1 is back-right (server), front row is P2-P4, back row is P1, P5-P6.
            </p>

            {/* Court diagram hint */}
            <div className="border border-slate-200 rounded-xl p-4 mb-4 bg-slate-50">
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400 mb-2">
                <span>P4 (FL)</span>
                <span>P3 (FC)</span>
                <span>P2 (FR)</span>
              </div>
              <div className="border-t border-dashed border-slate-200 my-2" />
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
                <span>P5 (BL)</span>
                <span>P6 (BC)</span>
                <span>P1 (BR)</span>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">↑ Net</p>
            </div>

            <div className="flex flex-col gap-3">
              {POSITIONS.map(pos => (
                <div key={pos} className="flex items-center gap-3">
                  <div className="w-40 text-sm font-medium text-slate-700">
                    {POSITION_LABELS[pos]}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <select
                      value={lineup[pos]?.playerId || ''}
                      onChange={e => {
                        if (e.target.value === '') {
                          clearPosition(pos)
                        } else {
                          assignPlayer(pos, e.target.value)
                        }
                      }}
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select player</option>
                      {players.map(player => {
                        const isAssigned = getAssignedPlayerIds().includes(player.id)
                        const isThisPosition = lineup[pos]?.playerId === player.id
                        return (
                          <option
                            key={player.id}
                            value={player.id}
                            disabled={isAssigned && !isThisPosition}
                          >
                            {player.jersey_number ? `#${player.jersey_number} ` : ''}
                            {player.name}
                            {player.position ? ` — ${player.position}` : ''}
                            {isAssigned && !isThisPosition ? ' (assigned)' : ''}
                          </option>
                        )
                      })}
                    </select>
                    {lineup[pos] && (
                      <button
                        type="button"
                        onClick={() => clearPosition(pos)}
                        className="text-slate-400 hover:text-slate-700 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-cyan-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Rotation Plan'}
          </button>
        </form>
      </main>
    </>
  )
}
