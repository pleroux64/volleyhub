import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CourtDiagramWrapper from './components/CourtDiagramWrapper'

export default async function RotationPlanPage({
  params
}: {
  params: Promise<{ id: string, rotationId: string }>
}) {
  const { id: teamId, rotationId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: plan } = await supabase
    .from('rotation_plans')
    .select('*')
    .eq('id', rotationId)
    .single()

  if (!plan) notFound()

  const { data: players } = await supabase
    .from('players')
    .select('id, name, jersey_number, position')
    .eq('team_id', teamId)

  const lineup = plan.starting_lineup

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <Link href={`/teams/${teamId}`} className="text-sm text-gray-500 hover:text-black">
          ← Back to team
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold">{plan.name}</h1>
            {plan.description && (
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
            )}
          </div>
          <span className={`text-sm font-medium px-3 py-1 rounded-full border ${
            plan.is_published
              ? 'border-green-300 text-green-600 bg-green-50'
              : 'border-gray-300 text-gray-500'
          }`}>
            {plan.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Starting lineup */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Starting Lineup</h2>

        {/* Visual court layout */}
        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
          <p className="text-center text-xs text-gray-400 mb-4 font-medium">NET ↑</p>

          {/* Front row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {['P4', 'P3', 'P2'].map(pos => (
              <div key={pos} className="border border-gray-200 rounded-xl p-3 bg-white text-center">
                <p className="text-xs text-gray-400 font-medium mb-1">{pos}</p>
                <p className="font-bold text-sm">
                  {lineup[pos]?.playerName || '—'}
                </p>
              </div>
            ))}
          </div>

          {/* Back row */}
          <div className="grid grid-cols-3 gap-4">
            {['P5', 'P6', 'P1'].map(pos => (
              <div key={pos} className="border border-gray-200 rounded-xl p-3 bg-white text-center">
                <p className="text-xs text-gray-400 font-medium mb-1">{pos}</p>
                <p className="font-bold text-sm">
                  {lineup[pos]?.playerName || '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bench / available players */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Players</h2>
        <div className="flex flex-wrap gap-2">
          {players && players
            .filter(p => !Object.values(lineup).find((l: any) => l?.playerId === p.id))
            .map(player => (
              <div
                key={player.id}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {player.jersey_number ? `#${player.jersey_number} ` : ''}
                {player.name}
                {player.position ? ` — ${player.position}` : ''}
              </div>
            ))
          }
          {players && players.filter(p =>
            !Object.values(lineup).find((l: any) => l?.playerId === p.id)
          ).length === 0 && (
            <p className="text-gray-400 text-sm">All players are in the starting lineup</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <CourtDiagramWrapper
          rotationPlanId={rotationId}
          startingLineup={plan.starting_lineup}
        />
      </div>
    </main>
  )
}
