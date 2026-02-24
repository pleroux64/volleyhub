import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TeamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Teams</h1>
        <Link
          href="/teams/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
        >
          New Team
        </Link>
      </div>

      {teams && teams.length > 0 ? (
        <div className="flex flex-col gap-4">
          {teams.map(team => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="border border-gray-200 rounded-xl p-6 hover:border-black transition-colors"
            >
              <h2 className="text-xl font-bold">{team.name}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {team.level && <span>{team.level}</span>}
                {team.level && team.season && <span> · </span>}
                {team.season && <span>{team.season}</span>}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No teams yet</p>
          <p className="text-sm mt-2">Create your first team to get started</p>
        </div>
      )}
    </main>
  )
}