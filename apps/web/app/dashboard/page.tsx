import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NavHeader from '@/components/NavHeader'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, level, season')
    .order('created_at', { ascending: false })

  return (
    <>
      <NavHeader />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">{user.email}</p>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-5 text-white shadow-sm shadow-cyan-200">
            <p className="text-3xl font-bold">{teams?.length || 0}</p>
            <p className="text-sm text-cyan-100 mt-0.5 font-medium">Teams</p>
          </div>
          <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-5 text-white shadow-sm shadow-violet-200">
            <p className="text-3xl font-bold">—</p>
            <p className="text-sm text-violet-100 mt-0.5 font-medium">Rotation Plans</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 col-span-2 sm:col-span-1">
            <Link
              href="/teams/new"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm shadow-cyan-200 flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">New Team</p>
                <p className="text-xs text-slate-400">Build your roster</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* My Teams */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-cyan-50/60 to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm shadow-cyan-200">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-slate-800">My Teams</h2>
              </div>
              <Link href="/teams/new" className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">
                + New
              </Link>
            </div>

            {teams && teams.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {teams.slice(0, 5).map(team => (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-100">
                        <span className="text-white text-xs font-bold">{team.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 group-hover:text-cyan-600 transition-colors">{team.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {[team.level, team.season].filter(Boolean).join(' · ') || 'No details'}
                        </p>
                      </div>
                    </div>
                    <span className="text-slate-300 group-hover:text-cyan-400 text-xs transition-colors">→</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 mb-4">No teams yet</p>
                <Link
                  href="/teams/new"
                  className="inline-flex px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl text-sm font-semibold hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-sm shadow-cyan-200"
                >
                  Create first team
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50/60 to-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm shadow-violet-200">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h2 className="font-semibold text-slate-800">Quick Actions</h2>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {[
                {
                  href: '/teams/new',
                  gradient: 'from-cyan-500 to-cyan-600',
                  shadow: 'shadow-cyan-200',
                  icon: (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  ),
                  title: 'New Team',
                  desc: 'Create a team and add players',
                  hover: 'hover:border-cyan-200 hover:bg-cyan-50',
                  titleHover: 'group-hover:text-cyan-700',
                },
                {
                  href: '/teams',
                  gradient: 'from-violet-500 to-violet-600',
                  shadow: 'shadow-violet-200',
                  icon: (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  ),
                  title: 'All Teams',
                  desc: 'Manage rosters and rotations',
                  hover: 'hover:border-violet-200 hover:bg-violet-50',
                  titleHover: 'group-hover:text-violet-700',
                },
              ].map(action => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 ${action.hover} transition-all group`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.gradient} shadow-sm ${action.shadow} flex items-center justify-center flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold text-slate-700 ${action.titleHover} transition-colors`}>{action.title}</p>
                    <p className="text-xs text-slate-400">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
