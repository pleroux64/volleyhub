import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'

const POSITION_COLORS: Record<string, string> = {
  'Outside Hitter':       'bg-violet-50 text-violet-600 border-violet-200',
  'Opposite':             'bg-rose-50 text-rose-600 border-rose-200',
  'Middle Blocker':       'bg-blue-50 text-blue-600 border-blue-200',
  'Setter':               'bg-cyan-50 text-cyan-600 border-cyan-200',
  'Libero':               'bg-amber-50 text-amber-600 border-amber-200',
  'Defensive Specialist': 'bg-emerald-50 text-emerald-600 border-emerald-200',
}

const EXPERIENCE_COLORS: Record<string, string> = {
  'Beginner':     'bg-slate-50 text-slate-500 border-slate-200',
  'Intermediate': 'bg-blue-50 text-blue-500 border-blue-200',
  'Advanced':     'bg-violet-50 text-violet-600 border-violet-200',
  'Elite':        'bg-amber-50 text-amber-600 border-amber-200',
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: team } = await supabase.from('teams').select('*').eq('id', id).single()
  if (!team) notFound()

  const { data: players } = await supabase
    .from('players').select('*').eq('team_id', id).order('jersey_number', { ascending: true })

  const { data: rotationPlans } = await supabase
    .from('rotation_plans').select('*').eq('team_id', id).order('created_at', { ascending: false })

  return (
    <>
      <NavHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/teams" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Teams
          </Link>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-200">
              <span className="text-white font-bold text-2xl">{team.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {team.level && (
                  <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2.5 py-0.5 font-medium">{team.level}</span>
                )}
                {team.season && (
                  <span className="text-xs text-slate-400">{team.season}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {/* Roster */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600" />
                <div>
                  <h2 className="font-semibold text-slate-800">Roster</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{players?.length || 0} players</p>
                </div>
              </div>
              <Link
                href={`/teams/${id}/players/new`}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg text-xs font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-sm shadow-cyan-200"
              >
                + Add Player
              </Link>
            </div>

            {players && players.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {players.map(player => (
                  <div key={player.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Jersey badge */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm shadow-cyan-200 flex-shrink-0">
                        <span className="font-mono font-bold text-white text-sm tabular-nums">
                          {player.jersey_number ?? '—'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{player.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {player.position && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${POSITION_COLORS[player.position] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {player.position}
                            </span>
                          )}
                          {player.experience_level && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${EXPERIENCE_COLORS[player.experience_level] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {player.experience_level}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/teams/${id}/players/${player.id}/edit`}
                      className="text-xs text-slate-400 hover:text-cyan-600 border border-slate-200 hover:border-cyan-200 hover:bg-cyan-50 px-2.5 py-1 rounded-lg transition-all font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-6">
                <p className="text-sm text-slate-400 mb-2">No players yet</p>
                <Link href={`/teams/${id}/players/new`} className="text-sm text-cyan-600 font-semibold hover:text-cyan-700">
                  Add your first player →
                </Link>
              </div>
            )}
          </div>

          {/* Rotation Plans */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-violet-500 to-violet-600" />
                <div>
                  <h2 className="font-semibold text-slate-800">Rotation Plans</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{rotationPlans?.length || 0} plans</p>
                </div>
              </div>
              <Link
                href={`/teams/${id}/rotations/new`}
                className="px-3.5 py-1.5 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-lg text-xs font-semibold hover:from-violet-600 hover:to-violet-700 transition-all shadow-sm shadow-violet-200"
              >
                + New Plan
              </Link>
            </div>

            {rotationPlans && rotationPlans.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {rotationPlans.map(plan => (
                  <Link
                    key={plan.id}
                    href={`/teams/${id}/rotations/${plan.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm shadow-violet-200 flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">{plan.name}</p>
                        {plan.description && <p className="text-xs text-slate-400 mt-0.5">{plan.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                        plan.is_published
                          ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                          : 'border-slate-200 text-slate-400 bg-slate-50'
                      }`}>
                        {plan.is_published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-slate-300 group-hover:text-violet-400 transition-colors text-sm">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-6">
                <p className="text-sm text-slate-400 mb-2">No rotation plans yet</p>
                <Link href={`/teams/${id}/rotations/new`} className="text-sm text-violet-600 font-semibold hover:text-violet-700">
                  Create first plan →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
