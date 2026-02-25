export type LineupEntry = {
  playerId: string
  playerName: string
}

export type Lineup = {
  [slot: string]: LineupEntry
}

// Clockwise rotation order
const ROTATION_ORDER = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']

// Given a starting lineup, derive the lineup for a specific rotation number
// Rotation 1 = starting lineup as-is
// Rotation 2 = everyone shifts one clockwise
// etc.
export function getRotationLineup(startingLineup: Lineup, rotationNumber: number): Lineup {
  const shifts = rotationNumber - 1
  const result: Lineup = {}

  ROTATION_ORDER.forEach((slot, index) => {
    // Find which slot this player came from after shifting
    const sourceIndex = (index + shifts) % 6
    const sourceSlot = ROTATION_ORDER[sourceIndex]
    result[slot] = startingLineup[sourceSlot]
  })

  return result
}
