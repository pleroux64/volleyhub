'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Team = {
  id: string
  name: string
  level: string | null
}

export default function NavHeader() {
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsOpen, setTeamsOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const teamsRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || '')
      const { data } = await supabase
        .from('teams')
        .select('id, name, level')
        .order('created_at', { ascending: false })
      if (data) setTeams(data)
    }
    load()
  }, [pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (teamsRef.current && !teamsRef.current.contains(e.target as Node)) setTeamsOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const isDashboard = pathname === '/dashboard'
  const isTeams = pathname.startsWith('/teams')

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm shadow-cyan-200">
            <span className="text-white text-xs font-bold tracking-tight">VH</span>
          </div>
          <span className="font-bold text-slate-900 text-sm tracking-tight">VolleyHub</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          {/* Dashboard link */}
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isDashboard
                ? 'text-cyan-600 bg-cyan-50'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Dashboard
          </Link>

          {/* Teams dropdown */}
          <div className="relative" ref={teamsRef}>
            <button
              onClick={() => { setTeamsOpen(v => !v); setUserOpen(false) }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isTeams || teamsOpen
                  ? 'text-cyan-600 bg-cyan-50'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Teams
              <svg className={`w-3 h-3 transition-transform ${teamsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {teamsOpen && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 py-2 z-50">
                {teams.length > 0 ? (
                  <>
                    <p className="px-3 pt-1 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Your teams</p>
                    {teams.map(team => (
                      <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        onClick={() => setTeamsOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-cyan-200">
                          <span className="text-white text-xs font-bold">{team.name.charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{team.name}</p>
                          {team.level && <p className="text-xs text-slate-400">{team.level}</p>}
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <Link
                        href="/teams"
                        onClick={() => setTeamsOpen(false)}
                        className="block px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        View all teams
                      </Link>
                      <Link
                        href="/teams/new"
                        onClick={() => setTeamsOpen(false)}
                        className="block px-3 py-1.5 text-sm text-cyan-600 font-medium hover:bg-cyan-50 transition-colors"
                      >
                        + New team
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="px-3 py-5 text-center">
                    <p className="text-sm text-slate-400 mb-2">No teams yet</p>
                    <Link
                      href="/teams/new"
                      onClick={() => setTeamsOpen(false)}
                      className="text-sm text-cyan-600 font-semibold hover:text-cyan-700"
                    >
                      Create your first team →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative ml-1" ref={userRef}>
            <button
              onClick={() => { setUserOpen(v => !v); setTeamsOpen(false) }}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors ${
                userOpen ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-sm shadow-cyan-200">
                <span className="text-white text-xs font-bold">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <svg className={`w-3 h-3 text-slate-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userOpen && (
              <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/80 py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Signed in as</p>
                  <p className="text-xs text-slate-700 font-medium truncate">{userEmail}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
