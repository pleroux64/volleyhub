'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import CourtDiagram, { PlayerPosition } from './CourtDiagram'
import { getRotationLineup } from '@volleyhub/engine'

type StartingLineupEntry = {
  playerId: string
  playerName: string
}

type Props = {
  rotationPlanId: string
  startingLineup: { [slot: string]: StartingLineupEntry }
}

const ROTATIONS = [1, 2, 3, 4, 5, 6]

const DEFAULT_XY: { [key: string]: { x: number; y: number } } = {
  P4: { x: 20, y: 25 },
  P3: { x: 50, y: 25 },
  P2: { x: 80, y: 25 },
  P5: { x: 20, y: 75 },
  P6: { x: 50, y: 75 },
  P1: { x: 80, y: 75 },
}

function buildDefaultPositions(
  startingLineup: { [slot: string]: StartingLineupEntry },
  rotationNumber: number
): PlayerPosition[] {
  const rotatedLineup = getRotationLineup(startingLineup, rotationNumber)
  return Object.entries(rotatedLineup).map(([slot, player]) => ({
    playerId: player.playerId,
    playerName: player.playerName,
    rotationSlot: slot,
    x: DEFAULT_XY[slot]?.x ?? 50,
    y: DEFAULT_XY[slot]?.y ?? 50,
  }))
}

export default function CourtDiagramWrapper({ rotationPlanId, startingLineup }: Props) {
  const [activeRotation, setActiveRotation] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [serveResetKey, setServeResetKey] = useState(0)
  const [receiveResetKey, setReceiveResetKey] = useState(0)

  const [allFormations, setAllFormations] = useState<{ [key: string]: PlayerPosition[] }>(() => {
    const initial: { [key: string]: PlayerPosition[] } = {}
    ROTATIONS.forEach(r => {
      initial[`${r}-serve`] = buildDefaultPositions(startingLineup, r)
      initial[`${r}-receive`] = buildDefaultPositions(startingLineup, r)
    })
    return initial
  })

  const supabase = createClient()

  useEffect(() => {
    async function loadFormations() {
      const { data } = await supabase
        .from('rotation_formations')
        .select('*')
        .eq('rotation_plan_id', rotationPlanId)

      if (data && data.length > 0) {
        setAllFormations(prev => {
          const updated = { ...prev }
          data.forEach(formation => {
            const key = `${formation.rotation_number}-${formation.situation}`
            updated[key] = formation.positions
          })
          return updated
        })
      }
      setLoading(false)
    }
    loadFormations()
  }, [rotationPlanId])

  function handleChange(rotationNumber: number, situation: 'serve' | 'receive', positions: PlayerPosition[]) {
    setAllFormations(prev => ({
      ...prev,
      [`${rotationNumber}-${situation}`]: positions
    }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')

    const { error } = await supabase
      .from('rotation_formations')
      .upsert([
        {
          rotation_plan_id: rotationPlanId,
          rotation_number: activeRotation,
          situation: 'serve',
          positions: allFormations[`${activeRotation}-serve`]
        },
        {
          rotation_plan_id: rotationPlanId,
          rotation_number: activeRotation,
          situation: 'receive',
          positions: allFormations[`${activeRotation}-receive`]
        }
      ], { onConflict: 'rotation_plan_id,rotation_number,situation' })

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Formation Editor</h3>
          <p className="text-xs text-slate-400 mt-0.5">Drag players to tactical positions</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-slate-900 text-white hover:bg-slate-700'
          } disabled:opacity-40`}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : `Save R${activeRotation}`}
        </button>
      </div>

      {/* Rotation tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {ROTATIONS.map(r => (
          <button
            key={r}
            onClick={() => setActiveRotation(r)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeRotation === r
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            R{r}
          </button>
        ))}
      </div>

      {/* Courts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading formations...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Serve</span>
              <button
                onClick={() => {
                  setAllFormations(prev => ({
                    ...prev,
                    [`${activeRotation}-serve`]: buildDefaultPositions(startingLineup, activeRotation),
                  }))
                  setServeResetKey(prev => prev + 1)
                }}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Reset
              </button>
            </div>
            <CourtDiagram
              key={`${activeRotation}-serve-${serveResetKey}`}
              label=""
              initialPositions={allFormations[`${activeRotation}-serve`]}
              onChange={(positions) => handleChange(activeRotation, 'serve', positions)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receive</span>
              <button
                onClick={() => {
                  setAllFormations(prev => ({
                    ...prev,
                    [`${activeRotation}-receive`]: buildDefaultPositions(startingLineup, activeRotation),
                  }))
                  setReceiveResetKey(prev => prev + 1)
                }}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Reset
              </button>
            </div>
            <CourtDiagram
              key={`${activeRotation}-receive-${receiveResetKey}`}
              label=""
              initialPositions={allFormations[`${activeRotation}-receive`]}
              onChange={(positions) => handleChange(activeRotation, 'receive', positions)}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  )
}