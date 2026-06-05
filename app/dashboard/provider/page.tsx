import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  formatDeadline,
  getDeliverableLabel,
  isDeadlineUrgent,
  type BriefStatus,
  type DeliverableType,
} from '@/lib/briefs'
import { cardStyle, ghostButtonStyle, pillStyle, primaryButtonStyle } from '@/lib/styles'
import StatusBadge from '@/components/briefs/StatusBadge'

interface BriefRow {
  id: string
  title: string
  deliverable_type: string
  deadline: string
  status: string
  client_id: string
}

interface ClientProfile {
  full_name: string
}

function normalizeClient(
  client: ClientProfile | ClientProfile[] | null
): ClientProfile | null {
  if (!client) return null
  return Array.isArray(client) ? (client[0] ?? null) : client
}

function normalizeBrief(
  brief: BriefRow & { client: ClientProfile | ClientProfile[] | null }
): BriefRow & { client: ClientProfile | null } {
  return {
    ...brief,
    client: normalizeClient(brief.client),
  }
}

const smallPrimaryButton = {
  ...primaryButtonStyle,
  padding: '8px 16px',
  fontSize: 13,
  display: 'inline-block',
  textDecoration: 'none',
} as const

const smallGhostButton = {
  ...ghostButtonStyle,
  padding: '8px 16px',
  fontSize: 13,
  display: 'inline-block',
  textDecoration: 'none',
} as const

export default async function ProviderDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const [{ data: profile, error: profileError }, { data: assignments, error: assignmentsError }] =
    await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', user.id).single(),
      supabase
        .from('assignments')
        .select(
          `
          id,
          brief_id,
          created_at,
          brief:briefs(
            id,
            title,
            deliverable_type,
            deadline,
            status,
            client_id,
            client:profiles!client_id(full_name)
          )
        `
        )
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false }),
    ])

  const fetchError = profileError?.message ?? assignmentsError?.message

  const normalized = (assignments ?? [])
    .map((a) => {
      const brief = Array.isArray(a.brief) ? a.brief[0] : a.brief
      if (!brief) return null
      return {
        id: a.id as string,
        brief_id: a.brief_id as string,
        created_at: a.created_at as string,
        brief: normalizeBrief(brief as BriefRow & { client: ClientProfile | ClientProfile[] | null }),
      }
    })
    .filter((a): a is NonNullable<typeof a> => a !== null)

  const activeCount = normalized.filter((a) =>
    ['assigned', 'in_progress'].includes(a.brief.status)
  ).length
  const deliveredCount = normalized.filter((a) => a.brief.status === 'delivered').length
  const completedCount = normalized.filter((a) => a.brief.status === 'completed').length

  const stats = [
    { label: 'Active Assignments', value: activeCount },
    { label: 'Delivered', value: deliveredCount },
    { label: 'Completed', value: completedCount },
  ]

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
        Welcome back, {profile?.full_name ?? 'there'}
      </h1>

      {fetchError && (
        <div style={{ ...cardStyle, color: '#dc341e', marginBottom: 24 }}>
          Failed to load dashboard: {fetchError}
        </div>
      )}

      {!fetchError && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#ffffff',
                  border: '1px solid #d1d5dc',
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <p
                  style={{
                    fontSize: 48,
                    fontWeight: 500,
                    margin: '0 0 4px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: 14, fontWeight: 400, color: '#242423', margin: 0 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <h2
            style={{
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: '-0.01em',
              margin: '0 0 16px',
            }}
          >
            My assignments
          </h2>

          {normalized.length === 0 ? (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                padding: '48px 24px',
                color: '#242423',
              }}
            >
              No assignments yet. Check back soon.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {normalized.map((assignment) => {
                const brief = assignment.brief
                const status = brief.status as BriefStatus
                const canUpload = status === 'assigned' || status === 'in_progress'
                const urgent = isDeadlineUrgent(brief.deadline)

                return (
                  <div key={assignment.id} style={{ ...cardStyle, padding: '20px 24px' }}>
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
                        <h3
                          style={{
                            fontSize: 18,
                            fontWeight: 500,
                            margin: '0 0 6px',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {brief.title}
                        </h3>
                        <p style={{ fontSize: 14, color: '#242423', margin: '0 0 10px' }}>
                          {brief.client?.full_name ?? 'Unknown client'}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 8,
                            alignItems: 'center',
                          }}
                        >
                          <span style={pillStyle}>
                            {getDeliverableLabel(brief.deliverable_type as DeliverableType)}
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              color: urgent ? '#dc341e' : '#242423',
                              fontWeight: urgent ? 500 : 400,
                            }}
                          >
                            {formatDeadline(brief.deadline)}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        marginTop: 16,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Link
                        href={`/dashboard/provider/briefs/${brief.id}`}
                        style={smallGhostButton}
                      >
                        View Brief
                      </Link>
                      {canUpload && (
                        <Link
                          href={`/dashboard/provider/briefs/${brief.id}#upload`}
                          style={smallPrimaryButton}
                        >
                          Upload Deliverable
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
