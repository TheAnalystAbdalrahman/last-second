'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getDashboardPath } from '@/lib/dashboard'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError || !data.user) {
      setError(signInError?.message ?? 'Invalid credentials')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push(getDashboardPath(profile.role))
  }

  return (
    <main
      style={{ background: '#f4f4f0', minHeight: '100vh' }}
      className="flex items-center justify-center p-6"
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand coin */}
        <div className="flex justify-center mb-8">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#ff90e8',
              border: '1.5px solid #000',
              transform: 'rotate(-8deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 22,
              color: '#000',
              letterSpacing: '-0.03em',
              userSelect: 'none',
            }}
          >
            G
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #d1d5dc',
            borderRadius: 16,
            padding: '40px 36px',
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              margin: 0,
              marginBottom: 6,
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: '#242423', fontSize: 14, margin: 0, marginBottom: 28 }}>
            Sign in to your Last Second account.
          </p>

          {error && (
            <div
              style={{
                background: '#fff0ee',
                border: '1px solid #dc341e',
                borderRadius: 4,
                padding: '10px 14px',
                marginBottom: 20,
                fontSize: 14,
                color: '#dc341e',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@university.edu"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  background: loading ? '#242423' : '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  letterSpacing: '-0.01em',
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 20, color: '#242423' }}>
            No account yet?{' '}
            <Link
              href="/sign-up"
              style={{ color: '#000', fontWeight: 600, textDecoration: 'underline' }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  marginBottom: 6,
  color: '#000',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#ffffff',
  border: '1px solid #d1d5dc',
  borderRadius: 4,
  padding: '12px 16px',
  fontSize: 14,
  color: '#000',
  outline: 'none',
  boxSizing: 'border-box',
}
