import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  formatDateTime,
  formatDeadline,
  getDaysRemaining,
  getDeadlineCountdownColor,
  getDeliverableLabel,
  getDeliverableStatusLabel,
  getFileNameFromUrl,
  isImageUrl,
  type BriefStatus,
  type BriefUrgency,
  type DeliverableReviewStatus,
  type DeliverableType,
} from '@/lib/briefs'
import { cardStyle, pillStyle } from '@/lib/styles'
import StatusBadge from '@/components/briefs/StatusBadge'
import DeliverableUploadForm from '@/components/DeliverableUploadForm'

interface ProviderBriefDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ProviderBriefDetailPage({ params }: ProviderBriefDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from('assignments')
    .select('*')
    .eq('brief_id', id)
    .eq('provider_id', user.id)
    .single()

  if (assignmentError || !assignment) {
    notFound()
  }

  const [{ data: brief, error: briefError }, { data: deliverable }] = await Promise.all([
    supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('deliverables')
      .select('*')
      .eq('brief_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (briefError || !brief) {
    notFound()
  }

  const { data: client } = await supabase
    .from('profiles')
    .select('full_name, university, department')
    .eq('id', brief.client_id)
    .single()

  const status = brief.status as BriefStatus
  const urgency = (brief.urgency as BriefUrgency) ?? 'normal'
  const referenceFiles: string[] = brief.reference_files ?? []
  const deliverableFiles: string[] = deliverable?.files ?? []
  const daysRemaining = getDaysRemaining(brief.deadline)
  const countdownColor = getDeadlineCountdownColor(daysRemaining)

  const showUploadForm =
    (!deliverable && (status === 'assigned' || status === 'in_progress')) ||
    deliverable?.status === 'rejected'

  return (
    <div>
      <Link
        href="/dashboard/provider"
        style={{
          fontSize: 14,
          color: '#242423',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 24,
        }}
      >
        ← Back to assignments
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
            <p style={{ fontSize: 14, color: '#242423', margin: '0 0 8px' }}>
              Assigned {formatDateTime(assignment.created_at)}
            </p>
            {assignment.notes && (
              <p style={{ fontSize: 14, color: '#242423', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                {assignment.notes}
              </p>
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
            <h2 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>Deadline</h2>
            <p
              style={{
                fontSize: 48,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1,
                color: countdownColor,
                letterSpacing: '-0.02em',
              }}
            >
              {daysRemaining}
            </p>
            <p style={{ fontSize: 14, color: '#242423', margin: '8px 0 0' }}>
              {daysRemaining === 1 ? 'day remaining' : 'days remaining'}
            </p>
          </div>
        </div>
      </div>

      {/* Deliverable section */}
      {showUploadForm && !deliverable && (
        <div id="upload" style={{ ...cardStyle, marginTop: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>Upload Deliverable</h2>
          <DeliverableUploadForm
            briefId={brief.id}
            assignmentId={assignment.id}
            providerId={user.id}
            briefTitle={brief.title}
            clientId={brief.client_id}
          />
        </div>
      )}

      {deliverable && (
        <div style={{ ...cardStyle, marginTop: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Deliverable</h2>
            <DeliverableStatusPill status={deliverable.status as DeliverableReviewStatus} />
          </div>

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

          {deliverable.status === 'rejected' && (
            <div id="upload" style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, margin: '0 0 16px' }}>
                Upload Revised Deliverable
              </h3>
              <DeliverableUploadForm
                briefId={brief.id}
                assignmentId={assignment.id}
                providerId={user.id}
                briefTitle={brief.title}
                clientId={brief.client_id}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DeliverableStatusPill({ status }: { status: DeliverableReviewStatus }) {
  const styles = {
    pending_review: { background: '#f1f333', color: '#000000' },
    approved: { background: '#000000', color: '#ffffff' },
    rejected: { background: '#fff0ee', color: '#dc341e' },
  }[status]

  return (
    <span
      style={{
        display: 'inline-block',
        background: styles.background,
        color: styles.color,
        borderRadius: 4,
        padding: '4px 10px',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      {getDeliverableStatusLabel(status)}
    </span>
  )
}
