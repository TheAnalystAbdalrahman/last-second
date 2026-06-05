import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cardStyle } from '@/lib/styles'
import BriefsTable from '@/components/admin/BriefsTable'

interface AdminDashboardPageProps {
  searchParams: Promise<{ highlight?: string }>
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const { highlight } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const [
    { count: totalBriefs, error: totalError },
    { count: openCount, error: openError },
    { count: inProgressCount, error: inProgressError },
    { count: completedCount, error: completedError },
    { data: briefs, error: briefsError },
  ] = await Promise.all([
    supabase.from('briefs').select('*', { count: 'exact', head: true }),
    supabase.from('briefs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase
      .from('briefs')
      .select('*', { count: 'exact', head: true })
      .in('status', ['assigned', 'in_progress']),
    supabase.from('briefs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase
      .from('briefs')
      .select('id, title, description, deliverable_type, deadline, status, client_id, client:profiles!client_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const fetchError =
    totalError?.message ??
    openError?.message ??
    inProgressError?.message ??
    completedError?.message ??
    briefsError?.message

  const stats = [
    { label: 'Total Briefs', value: totalBriefs ?? 0 },
    { label: 'Open', value: openCount ?? 0 },
    { label: 'In Progress', value: inProgressCount ?? 0 },
    { label: 'Completed', value: completedCount ?? 0 },
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
        Overview
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
              gridTemplateColumns: 'repeat(4, 1fr)',
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
            Recent briefs
          </h2>

          {!briefs || briefs.length === 0 ? (
            <div
              style={{
                ...cardStyle,
                textAlign: 'center',
                padding: '48px 24px',
                color: '#242423',
              }}
            >
              No briefs yet.
            </div>
          ) : (
            <BriefsTable
              briefs={briefs.map((b) => ({
                ...b,
                client: Array.isArray(b.client) ? (b.client[0] ?? null) : b.client,
              }))}
              adminId={user.id}
              highlightId={highlight}
            />
          )}
        </>
      )}
    </div>
  )
}
