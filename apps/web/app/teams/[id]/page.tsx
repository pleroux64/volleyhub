import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single()

  if (!team) notFound()

  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('team_id', id)
    .order('jersey_number', { ascending: true })

  const { data: rotationPlans } = await supabase
    .from('rotation_plans')
    .select('*')
    .eq('team_id', id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/teams" className="text-sm text-gray-500 hover:text-black">
          ← Back to teams
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {team.level && <span>{team.level}</span>}
              {team.level && team.season && <span> · </span>}
              {team.season && <span>{team.season}</span>}
            </p>
          </div>
          <Link
            href={`/teams/${id}/players/new`}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            Add Player
          </Link>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Roster</h2>

      {players && players.length > 0 ? (
        <div className="flex flex-col gap-3">
          {players.map(player => (
            <div
              key={player.id}
              className="border border-gray-200 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-gray-300 w-8 text-center">
                  {player.jersey_number || '—'}
                </span>
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-gray-500 text-sm">
                    {[player.position, player.gender, player.experience_level]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
              <Link
                href={`/teams/${id}/players/${player.id}/edit`}
                className="text-sm text-gray-500 hover:text-black"
              >
                Edit
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No players yet</p>
          <p className="text-sm mt-2">Add your first player to build the roster</p>
        </div>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Rotation Plans</h2>
          <Link
            href={`/teams/${id}/rotations/new`}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
          >
            New Plan
          </Link>
        </div>

        {rotationPlans && rotationPlans.length > 0 ? (
          <div className="flex flex-col gap-3">
            {rotationPlans.map(plan => (
              <Link
                key={plan.id}
                href={`/teams/${id}/rotations/${plan.id}`}
                className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-black transition-colors"
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {plan.is_published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <span className="text-gray-400 text-sm">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>No rotation plans yet</p>
          </div>
        )}
      </div>
    </main>
  )
}