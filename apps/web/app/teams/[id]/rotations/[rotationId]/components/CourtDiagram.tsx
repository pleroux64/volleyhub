'use client'

import { useState, useRef } from 'react'

const DEFAULT_POSITIONS: { [key: string]: { x: number; y: number } } = {
  P4: { x: 20, y: 25 },
  P3: { x: 50, y: 25 },
  P2: { x: 80, y: 25 },
  P5: { x: 20, y: 75 },
  P6: { x: 50, y: 75 },
  P1: { x: 80, y: 75 },
}

type Constraint = 'in-front' | 'behind' | 'left-of' | 'right-of'
type Relationship = { neighbor: string; constraint: Constraint }

const OVERLAP_RULES: { [key: string]: Relationship[] } = {
  P1: [
    { neighbor: 'P2', constraint: 'behind' },
    { neighbor: 'P6', constraint: 'right-of' },
  ],
  P2: [
    { neighbor: 'P1', constraint: 'in-front' },
    { neighbor: 'P3', constraint: 'right-of' },
  ],
  P3: [
    { neighbor: 'P6', constraint: 'in-front' },
    { neighbor: 'P2', constraint: 'left-of' },
    { neighbor: 'P4', constraint: 'right-of' },
  ],
  P4: [
    { neighbor: 'P5', constraint: 'in-front' },
    { neighbor: 'P3', constraint: 'left-of' },
  ],
  P5: [
    { neighbor: 'P4', constraint: 'behind' },
    { neighbor: 'P6', constraint: 'left-of' },
  ],
  P6: [
    { neighbor: 'P3', constraint: 'behind' },
    { neighbor: 'P5', constraint: 'right-of' },
    { neighbor: 'P1', constraint: 'left-of' },
  ],
}

const MARGIN = 5

export type PlayerPosition = {
  playerId: string
  playerName: string
  rotationSlot: string
  x: number
  y: number
}

type Props = {
  label: string
  initialPositions: PlayerPosition[]
  onChange: (positions: PlayerPosition[]) => void
}

// Professional color palette — muted, distinct
const TOKEN_COLORS: { [key: string]: string } = {
  P1: '#0F172A', // slate-900
  P2: '#1D4ED8', // blue-700
  P3: '#15803D', // green-700
  P4: '#B91C1C', // red-700
  P5: '#7E22CE', // purple-700
  P6: '#C2410C', // orange-700
}

export default function CourtDiagram({ label, initialPositions, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [positions, setPositions] = useState<PlayerPosition[]>(initialPositions)

  function getPos(slot: string) {
    return positions.find(p => p.rotationSlot === slot)
  }

  function isValidPosition(slot: string, newX: number, newY: number): boolean {
    const rules = OVERLAP_RULES[slot]
    if (!rules) return true
    for (const rule of rules) {
      const neighbor = getPos(rule.neighbor)
      if (!neighbor) continue
      switch (rule.constraint) {
        case 'in-front':
          if (newY >= neighbor.y - MARGIN) return false
          break
        case 'behind':
          if (newY <= neighbor.y + MARGIN) return false
          break
        case 'left-of':
          if (newX >= neighbor.x - MARGIN) return false
          break
        case 'right-of':
          if (newX <= neighbor.x + MARGIN) return false
          break
      }
    }
    return true
  }

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!dragging || !svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100))

    if (isValidPosition(dragging, x, y)) {
      const newPositions = positions.map(p =>
        p.rotationSlot === dragging ? { ...p, x, y } : p
      )
      setPositions(newPositions)
      onChange(newPositions)
    }
  }

  return (
    <div
      className="border border-slate-200 rounded-xl overflow-hidden bg-white"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)' }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full"
        style={{ aspectRatio: '1/1', cursor: dragging ? 'grabbing' : 'default' }}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
      >
        {/* Court background */}
        <rect x="0" y="0" width="100" height="100" fill="#FAFAFA" />

        {/* Court boundary */}
        <rect x="4" y="6" width="92" height="90" fill="white" stroke="#E2E8F0" strokeWidth="0.6" rx="0.5" />

        {/* Net */}
        <line x1="4" y1="10" x2="96" y2="10" stroke="#94A3B8" strokeWidth="1.2" />
        <text x="50" y="8.5" textAnchor="middle" fontSize="2.8" fill="#94A3B8" fontWeight="500" letterSpacing="0.5">NET</text>

        {/* Attack line */}
        <line x1="4" y1="36" x2="96" y2="36" stroke="#CBD5E1" strokeWidth="0.4" strokeDasharray="2,2" />

        {/* Zone grid lines — very subtle */}
        <line x1="36" y1="10" x2="36" y2="96" stroke="#F1F5F9" strokeWidth="0.4" />
        <line x1="64" y1="10" x2="64" y2="96" stroke="#F1F5F9" strokeWidth="0.4" />
        <line x1="4" y1="53" x2="96" y2="53" stroke="#F1F5F9" strokeWidth="0.4" />

        {/* Player tokens */}
        {positions.map(player => (
          <g
            key={player.rotationSlot}
            transform={`translate(${player.x}, ${player.y})`}
            onMouseDown={() => setDragging(player.rotationSlot)}
            style={{ cursor: dragging === player.rotationSlot ? 'grabbing' : 'grab' }}
          >
            {/* Drop shadow */}
            <circle
              cx="0.3" cy="0.6" r="5.5"
              fill="rgba(0,0,0,0.08)"
            />
            {/* Token */}
            <circle
              cx="0" cy="0" r="5.5"
              fill={TOKEN_COLORS[player.rotationSlot]}
            />
            {/* Player initials/name */}
            <text
              x="0" y="0.9"
              textAnchor="middle"
              fontSize="2.6"
              fill="white"
              fontWeight="600"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {player.playerName.length > 5
                ? player.playerName.slice(0, 5)
                : player.playerName}
            </text>
            {/* Slot badge */}
            <text
              x="0" y="9.5"
              textAnchor="middle"
              fontSize="1.8"
              fill={TOKEN_COLORS[player.rotationSlot]}
              fontWeight="500"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {player.rotationSlot}
            </text>
          </g>
        ))}
      </svg>

      {/* Player legend */}
      <div className="px-3 py-2 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1">
        {positions.map(player => (
          <div key={player.rotationSlot} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: TOKEN_COLORS[player.rotationSlot] }}
            />
            <span className="text-xs text-slate-400 font-mono">{player.rotationSlot}</span>
            <span className="text-xs text-slate-600">{player.playerName}</span>
          </div>
        ))}
      </div>
    </div>
  )
}