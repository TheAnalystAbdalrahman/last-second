import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  formatDateTime,
  formatDeadline,
  getDeliverableLabel,
  getFileNameFromUrl,
  isImageUrl,
  type BriefStatus,
  type BriefUrgency,
  type DeliverableType,
} from '@/lib/briefs'
import { cardStyle, pillStyle, primaryButtonStyle } from '@/lib/styles'
import StatusBadge from '@/components/briefs/StatusBadge'
import DeliverableReviewActions from '@/components/admin/DeliverableReviewActions'

interface AdminBriefDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminBriefDetailPage({ params }: AdminBriefDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: brief, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !brief) {
    notFound()
  }

  const [{ data: client }, { data: assignment }, { data: deliverable }] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, university, department')
      .eq('id', brief.client_id)
      .single(),
    supabase
      .from('assignments')
      .select('*, provider:profiles!provider_id(full_name)')
      .eq('brief_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('deliverables')
      .select('*')
      .eq('brief_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const status = brief.status as BriefStatus
  const urgency = (brief.urgency as BriefUrgency) ?? 'normal'
  const referenceFiles: string[] = brief.reference_files ?? []
  const deliverableFiles: string[] = deliverable?.files ?? []

  return (
    <div>
      <Link
        href="/dashboard/admin"
        style={{
          fontSize: 14,
          color: '#242423',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 24,
        }}
      >
        ← Back to overview
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* Left column */}
        <div>
          <div style={cardStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                marginBottom: 16,
                flexWrap: 'wrap',
              }}
            >
              <h1
                style={{
                  fontSize: 36,
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  textDecoration: status === 'cancelled' ? 'line-through' : 'none',
                }}
              >
                {brief.title}
              </h1>
              <StatusBadge status={status} />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <span style={pillStyle}>
                {getDeliverableLabel(brief.deliverable_type as DeliverableType)}
              </span>
              <span style={pillStyle}>{formatDeadline(brief.deadline)}</span>
              {brief.budget != null && (
                <span style={pillStyle}>${Number(brief.budget).toFixed(2)}</span>
              )}
              <span
                style={{
                  ...pillStyle,
                  background: urgency === 'urgent' ? '#ff90e8' : '#f4f4f0',
                }}
              >
                {urgency === 'urgent' ? 'Urgent' : 'Normal'}
              </span>
            </div>

            <p style={{ fontSize: 18, fontWeight: 400, color: '#242423', margin: 0, lineHeight: 1.6 }}>
              {brief.description}
            </p>
          </div>

          {referenceFiles.length > 0 && (
            <div style={{ ...cardStyle, marginTop: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>Reference files</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {referenceFiles.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5dc',
                        borderRadius: 8,
                        padding: 8,
                        width: 120,
                      }}
                    >
                      {isImageUrl(url) ? (
                        <img
                          src={url}
                          alt={getFileNameFromUrl(url)}
                          style={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 80,
                            gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 24 }}>📄</span>
                          <span
                            style={{
                              fontSize: 11,
                              color: '#242423',
                              textAlign: 'center',
                              wordBreak: 'break-all',
                            }}
                          >
                            {getFileNameFromUrl(url)}
                          </span>
                        </div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 12px' }}>Assignment</h2>
            {assignment ? (
              <div style={{ fontSize: 14, color: '#242423', lineHeight: 1.6 }}>
                <p style={{ margin: '0 0 4px' }}>
                  <strong style={{ color: '#000' }}>
                    {(assignment.provider as { full_name: string } | null)?.full_name ?? 'Unknown'}
                  </strong>
                </p>
                <p style={{ margin: '0 0 8px', fontSize: 13 }}>
                  Assigned {formatDateTime(assignment.created_at)}
                </p>
                {assignment.notes && (
                  <p style={{ margin: 0, fontSize: 13, fontStyle: 'italic' }}>{assignment.notes}</p>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: '#242423', margin: '0 0 12px' }}>Not yet assigned</p>
                <Link
                  href={`/dashboard/admin?highlight=${brief.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <span style={{ ...primaryButtonStyle, display: 'inline-block', fontSize: 13, padding: '8px 16px' }}>
                    Assign Now
                  </span>
                </Link>
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 12px' }}>Client</h2>
            <div style={{ fontSize: 14, color: '#242423', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 4px', fontWeight: 500, color: '#000' }}>
                {client?.full_name ?? 'Unknown'}
              </p>
              {client?.university && <p style={{ margin: '0 0 2px' }}>{client.university}</p>}
              {client?.department && <p style={{ margin: 0 }}>{client.department}</p>}
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 16px' }}>Timeline</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TimelineItem
                label="Brief submitted"
                timestamp={formatDateTime(brief.created_at)}
                isLast={!assignment && !deliverable && status !== 'completed'}
              />
              {assignment && (
                <TimelineItem
                  label={`Assigned to ${(assignment.provider as { full_name: string } | null)?.full_name ?? 'provider'}`}
                  timestamp={formatDateTime(assignment.created_at)}
                  isLast={!deliverable && status !== 'completed'}
                />
              )}
              {deliverable && (
                <TimelineItem
                  label="Deliverable uploaded"
                  timestamp={formatDateTime(deliverable.created_at)}
                  isLast={status !== 'completed'}
                />
              )}
              {status === 'completed' && (
                <TimelineItem label="Completed" timestamp={null} isLast />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deliverable section */}
      {deliverable && (
        <div style={{ ...cardStyle, marginTop: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>Deliverable</h2>
          {deliverable.message && (
            <p style={{ fontSize: 15, color: '#242423', margin: '0 0 16px', lineHeight: 1.5 }}>
              {deliverable.message}
            </p>
          )}
          {deliverableFiles.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {deliverableFiles.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #d1d5dc',
                      borderRadius: 8,
                      padding: 8,
                      width: 120,
                    }}
                  >
                    {isImageUrl(url) ? (
                      <img
                        src={url}
                        alt={getFileNameFromUrl(url)}
                        style={{
                          width: '100%',
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 80,
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 24 }}>📄</span>
                        <span
                          style={{
                            fontSize: 11,
                            color: '#242423',
                            textAlign: 'center',
                            wordBreak: 'break-all',
                          }}
                        >
                          {getFileNameFromUrl(url)}
                        </span>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
          {deliverable.status === 'pending_review' && assignment && (
            <DeliverableReviewActions
              deliverableId={deliverable.id}
              briefId={brief.id}
              briefTitle={brief.title}
              clientId={brief.client_id}
              providerId={deliverable.provider_id}
            />
          )}
        </div>
      )}
    </div>
  )
}

function TimelineItem({
  label,
  timestamp,
  isLast,
}: {
  label: string
  timestamp: string | null
  isLast: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#000',
            flexShrink: 0,
            marginTop: 5,
          }}
        />
        {!isLast && (
          <div style={{ width: 1, flex: 1, background: '#d1d5dc', minHeight: 24 }} />
        )}
      </div>
      <div style={{ paddingBottom: isLast ? 0 : 16 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{label}</p>
        {timestamp && (
          <p style={{ margin: '2px 0 0', fontSize: 13, color: '#242423' }}>{timestamp}</p>
        )}
      </div>
    </div>
  )
}
