import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  formatDeadline,
  getDeliverableLabel,
  type BriefStatus,
  type DeliverableType,
} from '@/lib/briefs'
import { cardStyle, pillStyle, primaryButtonStyle } from '@/lib/styles'
import StatusBadge from '@/components/briefs/StatusBadge'

export default async function ClientDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: briefs, error: briefsError } = await supabase
    .from('briefs')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  const fetchError = profileError?.message ?? briefsError?.message

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <h1
          style={{
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Welcome back, {profile?.full_name ?? 'there'}
        </h1>
        <Link href="/dashboard/client/new-brief" style={{ textDecoration: 'none' }}>
          <span style={primaryButtonStyle}>New Brief</span>
        </Link>
      </div>

      {fetchError && (
        <div
          style={{
            ...cardStyle,
            color: '#dc341e',
            marginBottom: 24,
          }}
        >
          Failed to load dashboard: {fetchError}
        </div>
      )}

      {!fetchError && (!briefs || briefs.length === 0) && (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
          }}
        >
          <p style={{ fontSize: 18, color: '#242423', margin: 0, marginBottom: 12 }}>
            No projects yet.
          </p>
          <Link
            href="/dashboard/client/new-brief"
            style={{
              color: '#000',
              fontWeight: 500,
              fontSize: 15,
              textDecoration: 'underline',
            }}
          >
            Submit your first brief →
          </Link>
        </div>
      )}

      {briefs && briefs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {briefs.map((brief) => {
            const status = brief.status as BriefStatus
            const isCancelled = status === 'cancelled'

            return (
              <Link
                key={brief.id}
                href={`/dashboard/client/briefs/${brief.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    ...cardStyle,
                    padding: '20px 24px',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h2
                        style={{
                          fontSize: 18,
                          fontWeight: 500,
                          margin: 0,
                          marginBottom: 8,
                          textDecoration: isCancelled ? 'line-through' : 'none',
                        }}
                      >
                        {brief.title}
                      </h2>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <span style={pillStyle}>
                          {getDeliverableLabel(brief.deliverable_type as DeliverableType)}
                        </span>
                        <span style={{ fontSize: 14, color: '#242423' }}>
                          {formatDeadline(brief.deadline)}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
