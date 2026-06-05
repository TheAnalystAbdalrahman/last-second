'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getDashboardPath } from '@/lib/dashboard'

type Role = 'client' | 'provider' | 'both'

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'client' as Role,
    university: '',
    department: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Something went wrong')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: form.fullName,
      role: form.role,
      university: form.university || null,
      department: form.department || null,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push(getDashboardPath(form.role))
  }

  return (
    <main
      style={{ background: '#f4f4f0', minHeight: '100vh' }}
      className="flex items-center justify-center p-6"
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
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
            Create your account
          </h1>
          <p style={{ color: '#242423', fontSize: 14, margin: 0, marginBottom: 28 }}>
            Join the architecture project marketplace.
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
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  name="fullName"
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your name"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
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

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  style={inputStyle}
                />
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>I am a</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  {(['client', 'provider', 'both'] as Role[]).map((r) => (
                    <label
                      key={r}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '10px 12px',
                        border: `1px solid ${form.role === r ? '#000' : '#d1d5dc'}`,
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: form.role === r ? 600 : 400,
                        background: form.role === r ? '#000' : '#fff',
                        color: form.role === r ? '#fff' : '#000',
                        transition: 'all 0.1s',
                      }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={form.role === r}
                        onChange={handleChange}
                        style={{ display: 'none' }}
                      />
                      {r === 'client' ? 'Client' : r === 'provider' ? 'Provider' : 'Both'}
                    </label>
                  ))}
                </div>
              </div>

              {/* University */}
              <div>
                <label style={labelStyle}>University <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
                <input
                  name="university"
                  type="text"
                  value={form.university}
                  onChange={handleChange}
                  placeholder="e.g. ETH Zurich"
                  style={inputStyle}
                />
              </div>

              {/* Department */}
              <div>
                <label style={labelStyle}>Department <span style={{ color: '#888', fontWeight: 400 }}>(optional)</span></label>
                <input
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Architecture"
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
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, marginTop: 20, color: '#242423' }}>
            Already have an account?{' '}
            <Link
              href="/sign-in"
              style={{ color: '#000', fontWeight: 600, textDecoration: 'underline' }}
            >
              Sign in
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
