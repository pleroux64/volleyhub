'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'

export default function AuthForm({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  function toggleMode() {
    setMode(m => (m === 'login' ? 'signup' : 'login'))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-indigo-50">
        <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl border border-slate-200 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#16a34a" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
          <p className="mt-2 text-sm text-slate-600">We sent a confirmation link to</p>
          <p className="mt-1 text-sm font-medium text-slate-900 break-all">{email}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-indigo-50">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <circle cx="14" cy="14" r="13" stroke="currentColor" className="text-slate-900" strokeWidth="2" />
              <circle cx="14" cy="14" r="5" fill="currentColor" className="text-slate-900" />
              <line x1="14" y1="1" x2="14" y2="27" stroke="currentColor" className="text-slate-900" strokeWidth="1.5" />
              <line x1="1" y1="14" x2="27" y2="14" stroke="currentColor" className="text-slate-900" strokeWidth="1.5" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-slate-900">VolleyHub</span>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                         disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>

              {mode === 'login' && (
                <button
                  type="button"
                  className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-4"
                  onClick={() => {}}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <input
              id="password"
              type="password"
              placeholder={mode === 'login' ? 'Enter your password' : 'Min. 6 characters'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={mode === 'signup' ? 6 : undefined}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500
                         disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-semibold
                       hover:bg-slate-800 transition
                       disabled:opacity-60 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path
                    fill="currentColor"
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign in' : 'Create account'}</span>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-slate-900 hover:underline underline-offset-4"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}