'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isLogin = mode === 'login'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
        <div className="w-full max-w-[400px] rounded-xl border border-[#e5e5e5] bg-[#ffffff] px-8 py-10 text-center shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">
              Check your email
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-[#6b6b6b]">
            We sent a confirmation link to{' '}
            <span className="font-medium text-[#0a0a0a]">{email}</span>. Click
            it to activate your account.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm font-medium text-[#0a0a0a] underline underline-offset-4 transition-colors hover:text-[#6b6b6b]"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-[400px] rounded-xl border border-[#e5e5e5] bg-[#ffffff] px-8 py-10 shadow-sm">
        {/* Logo / App Name */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">
            VolleyHub
          </h1>
          <p className="mt-1.5 text-sm text-[#6b6b6b]">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#0a0a0a]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="h-10 w-full rounded-lg border border-[#e5e5e5] bg-[#ffffff] px-3 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] outline-none transition-colors focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#0a0a0a]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={isLogin ? 'Enter your password' : 'Min. 6 characters'}
              className="h-10 w-full rounded-lg border border-[#e5e5e5] bg-[#ffffff] px-3 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] outline-none transition-colors focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="rounded-lg bg-[#fef2f2] px-3 py-2 text-sm text-[#dc2626]">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-10 w-full rounded-lg bg-[#0a0a0a] text-sm font-medium text-[#fafafa] transition-colors hover:bg-[#262626] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? isLogin
                ? 'Signing in...'
                : 'Creating account...'
              : isLogin
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        {/* Toggle link */}
        <p className="mt-6 text-center text-sm text-[#6b6b6b]">
          {isLogin ? (
            <>
              {"Don't have an account? "}
              <Link
                href="/auth/signup"
                className="font-medium text-[#0a0a0a] underline underline-offset-4 transition-colors hover:text-[#6b6b6b]"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              {'Already have an account? '}
              <Link
                href="/auth/login"
                className="font-medium text-[#0a0a0a] underline underline-offset-4 transition-colors hover:text-[#6b6b6b]"
              >
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  )
}
