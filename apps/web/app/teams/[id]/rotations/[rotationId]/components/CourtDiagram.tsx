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

const TOKEN_COLORS: { [key: string]: string } = {
  P1: '#1a1a1a',
  P2: '#2563eb',
  P3: '#16a34a',
  P4: '#dc2626',
  P5: '#9333ea',
  P6: '#ea580c',
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
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-center">{label}</p>
      <div className="border-2 border-gray-800 rounded-lg overflow-hidden bg-amber-50">
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
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="#92400e" strokeWidth="0.5" />
          <line x1="2" y1="5" x2="98" y2="5" stroke="#1a1a1a" strokeWidth="1" />
          <text x="50" y="3.5" textAnchor="middle" fontSize="2.5" fill="#666">NET</text>
          <line x1="2" y1="33" x2="98" y2="33" stroke="#92400e" strokeWidth="0.3" strokeDasharray="2,2" />

          {positions.map(player => (
            <g
              key={player.rotationSlot}
              transform={`translate(${player.x}, ${player.y})`}
              onMouseDown={() => setDragging(player.rotationSlot)}
              style={{ cursor: 'grab' }}
            >
              <circle cx="0.5" cy="0.5" r="6" fill="rgba(0,0,0,0.15)" />
              <circle
                cx="0" cy="0" r="6"
                fill={TOKEN_COLORS[player.rotationSlot]}
                stroke="white" strokeWidth="0.8"
              />
              <text
                x="0" y="0.8"
                textAnchor="middle" fontSize="2.8"
                fill="white" fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {player.playerName.length > 6
                  ? player.playerName.slice(0, 6) + '.'
                  : player.playerName}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}