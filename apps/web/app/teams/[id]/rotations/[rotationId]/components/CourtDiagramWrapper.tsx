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
const supabase = createClient()

function buildDefaultPositions(
  startingLineup: { [slot: string]: StartingLineupEntry },
  rotationNumber: number
): PlayerPosition[] {
  const defaults: { [key: string]: { x: number; y: number } } = {
    P4: { x: 20, y: 25 },
    P3: { x: 50, y: 25 },
    P2: { x: 80, y: 25 },
    P5: { x: 20, y: 75 },
    P6: { x: 50, y: 75 },
    P1: { x: 80, y: 75 },
  }

  const rotatedLineup = getRotationLineup(startingLineup, rotationNumber)

  return Object.entries(rotatedLineup).map(([slot, player]) => ({
    playerId: player.playerId,
    playerName: player.playerName,
    rotationSlot: slot,
    x: defaults[slot]?.x ?? 50,
    y: defaults[slot]?.y ?? 50,
  }))
}

export default function CourtDiagramWrapper({ rotationPlanId, startingLineup }: Props) {
  const [activeRotation, setActiveRotation] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [serveResetKey, setServeResetKey] = useState(0)
  const [receiveResetKey, setReceiveResetKey] = useState(0)
  const [loading, setLoading] = useState(true)

  // Store positions for all rotations and both situations
  // Key format: `${rotationNumber}-serve` or `${rotationNumber}-receive`
  const [allFormations, setAllFormations] = useState<{ [key: string]: PlayerPosition[] }>(() => {
    const initial: { [key: string]: PlayerPosition[] } = {}
    ROTATIONS.forEach(r => {
      initial[`${r}-serve`] = buildDefaultPositions(startingLineup, r)
      initial[`${r}-receive`] = buildDefaultPositions(startingLineup, r)
    })
    return initial
  })

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

    const servePositions = allFormations[`${activeRotation}-serve`]
    const receivePositions = allFormations[`${activeRotation}-receive`]

    console.log('Saving:', { rotationPlanId, activeRotation })

    const { data, error } = await supabase
      .from('rotation_formations')
      .upsert([
        {
          rotation_plan_id: rotationPlanId,
          rotation_number: activeRotation,
          situation: 'serve',
          positions: servePositions
        },
        {
          rotation_plan_id: rotationPlanId,
          rotation_number: activeRotation,
          situation: 'receive',
          positions: receivePositions
        }
      ], {
        onConflict: 'rotation_plan_id,rotation_number,situation'
      })

    console.log('Result:', { data, error })

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
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Formation Editor</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : `Save Rotation ${activeRotation}`}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <p>Loading formations...</p>
        </div>
      ) : (
        <>
          {/* Rotation tabs */}
          <div className="flex gap-2">
            {ROTATIONS.map(r => (
              <button
                key={r}
                onClick={() => setActiveRotation(r)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  activeRotation === r
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-black'
                }`}
              >
                R{r}
              </button>
            ))}
          </div>

          {/* Two courts side by side */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Serve</p>
                <button
                  onClick={() => {
                    setAllFormations(prev => ({
                      ...prev,
                      [`${activeRotation}-serve`]: buildDefaultPositions(startingLineup, activeRotation),
                    }))
                    setServeResetKey(prev => prev + 1)
                  }}
                  className="text-xs text-gray-400 hover:text-black underline"
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
                <p className="text-sm font-medium text-gray-600">Receive</p>
                <button
                  onClick={() => {
                    setAllFormations(prev => ({
                      ...prev,
                      [`${activeRotation}-receive`]: buildDefaultPositions(startingLineup, activeRotation),
                    }))
                    setReceiveResetKey(prev => prev + 1)
                  }}
                  className="text-xs text-gray-400 hover:text-black underline"
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
        </>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}