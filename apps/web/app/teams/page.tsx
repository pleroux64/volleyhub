import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'

export default async function TeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <NavHeader />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Teams</h1>
            <p className="text-sm text-slate-400 mt-1">
              {teams?.length || 0} {teams?.length === 1 ? 'team' : 'teams'}
            </p>
          </div>
          <Link
            href="/teams/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-sm shadow-cyan-200"
          >
            + New Team
          </Link>
        </div>

        {teams && teams.length > 0 ? (
          <div className="flex flex-col gap-3">
            {teams.map(team => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="relative bg-white border border-slate-200 rounded-2xl p-5 hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-50 transition-all flex items-center justify-between group overflow-hidden"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-l-2xl" />
                <div className="flex items-center gap-4 pl-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-200">
                    <span className="text-white font-bold text-lg">{team.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-800 group-hover:text-cyan-700 transition-colors">{team.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      {team.level && (
                        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">{team.level}</span>
                      )}
                      {team.season && (
                        <span className="text-xs text-slate-400">{team.season}</span>
                      )}
                      {!team.level && !team.season && (
                        <span className="text-xs text-slate-400">No details</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-slate-300 group-hover:text-cyan-400 transition-colors text-sm mr-1">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-100 to-cyan-200 border border-cyan-200 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 mb-1">No teams yet</p>
            <p className="text-sm text-slate-400 mb-6">Create your first team to get started</p>
            <Link
              href="/teams/new"
              className="inline-flex px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-sm shadow-cyan-200"
            >
              Create Team
            </Link>
          </div>
        )}
      </main>
    </>
  )
}
