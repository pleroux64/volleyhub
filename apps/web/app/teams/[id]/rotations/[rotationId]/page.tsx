import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import CourtDiagramWrapper from './components/CourtDiagramWrapper'
import NavHeader from '@/components/NavHeader'

const TOKEN_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  P1: { bg: 'bg-slate-800',  text: 'text-white', dot: '#0F172A' },
  P2: { bg: 'bg-blue-600',   text: 'text-white', dot: '#1D4ED8' },
  P3: { bg: 'bg-emerald-600',text: 'text-white', dot: '#15803D' },
  P4: { bg: 'bg-rose-600',   text: 'text-white', dot: '#B91C1C' },
  P5: { bg: 'bg-violet-600', text: 'text-white', dot: '#7E22CE' },
  P6: { bg: 'bg-orange-600', text: 'text-white', dot: '#C2410C' },
}

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
    <>
      <NavHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/teams/${teamId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 mb-4 transition-colors"
          >
            ← Back to team
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{plan.name}</h1>
                {plan.description && (
                  <p className="text-sm text-slate-400 mt-0.5">{plan.description}</p>
                )}
              </div>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border mt-1 flex-shrink-0 ${
              plan.is_published
                ? 'border-emerald-200 text-emerald-600 bg-emerald-50'
                : 'border-slate-200 text-slate-500 bg-slate-50'
            }`}>
              {plan.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        {/* Starting lineup */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Starting Lineup</p>
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            {/* Net bar */}
            <div className="bg-gradient-to-r from-violet-50 to-white border-b border-slate-100 px-5 py-2.5">
              <p className="text-center text-xs text-violet-400 font-semibold tracking-widest uppercase">Net</p>
            </div>

            <div className="p-5">
              {/* Front row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['P4', 'P3', 'P2'].map(pos => {
                  const colors = TOKEN_COLORS[pos]
                  return (
                    <div key={pos} className="rounded-xl p-3.5 bg-slate-50 border border-slate-100 text-center">
                      <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                        <span className={`text-xs font-bold font-mono ${colors.text}`}>{pos}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {lineup[pos]?.playerName || <span className="text-slate-300">—</span>}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="border-t-2 border-dashed border-slate-200 my-4" />

              {/* Back row */}
              <div className="grid grid-cols-3 gap-3">
                {['P5', 'P6', 'P1'].map(pos => {
                  const colors = TOKEN_COLORS[pos]
                  return (
                    <div key={pos} className="rounded-xl p-3.5 bg-slate-50 border border-slate-100 text-center">
                      <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                        <span className={`text-xs font-bold font-mono ${colors.text}`}>{pos}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        {lineup[pos]?.playerName || <span className="text-slate-300">—</span>}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bench players */}
        {players && players.filter(p =>
          !Object.values(lineup).find((l: unknown) => (l as { playerId?: string })?.playerId === p.id)
        ).length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Available / Bench</p>
            <div className="flex flex-wrap gap-2">
              {players
                .filter(p => !Object.values(lineup).find((l: unknown) => (l as { playerId?: string })?.playerId === p.id))
                .map(player => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-white"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-500 font-bold text-xs font-mono">{player.jersey_number ?? '—'}</span>
                    </div>
                    <span className="text-slate-700 font-medium">{player.name}</span>
                    {player.position && (
                      <span className="text-slate-400 text-xs">· {player.position}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Formation editor */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
          <div className="bg-gradient-to-r from-violet-50/60 to-white border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-800">Formation Editor</h2>
            <p className="text-xs text-slate-400 mt-0.5">Drag players to set their court positions</p>
          </div>
          <div className="p-6">
            <CourtDiagramWrapper
              rotationPlanId={rotationId}
              startingLineup={plan.starting_lineup}
            />
          </div>
        </div>
      </main>
    </>
  )
}
