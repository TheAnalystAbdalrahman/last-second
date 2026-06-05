import { redirect } from 'next/navigation'
import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/briefs'
import { getRoleLabel, roleBadgeStyles, type ProfileRole } from '@/lib/dashboard'
import { cardStyle } from '@/lib/styles'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, university, department, created_at')
    .order('created_at', { ascending: false })

  const thStyle: CSSProperties = {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: '#242423',
    borderBottom: '1px solid #d1d5dc',
  }

  const tdStyle: CSSProperties = {
    padding: '16px',
    fontSize: 14,
    color: '#000',
    borderBottom: '1px solid #d1d5dc',
    verticalAlign: 'middle',
  }

  return (
    <div>
      <h1
        style={{
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: '-0.02em',
          margin: '0 0 32px',
        }}
      >
        Users
      </h1>

      {error && (
        <div style={{ ...cardStyle, color: '#dc341e', marginBottom: 24 }}>
          Failed to load users: {error.message}
        </div>
      )}

      {!error && (!profiles || profiles.length === 0) && (
        <div
          style={{
            ...cardStyle,
            textAlign: 'center',
            padding: '48px 24px',
            color: '#242423',
          }}
        >
          No users found.
        </div>
      )}

      {!error && profiles && profiles.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #d1d5dc',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f4f4f0' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>University</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Joined date</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => {
                const role = profile.role as ProfileRole
                const badge = roleBadgeStyles(role)

                return (
                  <tr key={profile.id}>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{profile.full_name}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block',
                          background: badge.background,
                          color: badge.color,
                          borderRadius: 4,
                          padding: '4px 10px',
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {getRoleLabel(role)}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#242423' }}>{profile.university ?? '—'}</td>
                    <td style={{ ...tdStyle, color: '#242423' }}>{profile.department ?? '—'}</td>
                    <td style={{ ...tdStyle, color: '#242423' }}>
                      {formatDateTime(profile.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
