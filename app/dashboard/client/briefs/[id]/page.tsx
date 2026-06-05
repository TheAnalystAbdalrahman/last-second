import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  formatDateTime,
  formatDeadline,
  getDeliverableLabel,
  getFileNameFromUrl,
  getStatusLabel,
  isImageUrl,
  type BriefStatus,
  type BriefUrgency,
  type DeliverableType,
} from '@/lib/briefs'
import { cardStyle, pillStyle, primaryButtonStyle } from '@/lib/styles'
import StatusBadge from '@/components/briefs/StatusBadge'

interface BriefDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BriefDetailPage({ params }: BriefDetailPageProps) {
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
    .eq('client_id', user.id)
    .single()

  if (error || !brief) {
    notFound()
  }

  const status = brief.status as BriefStatus
  const { data: deliverable } = await supabase
    .from('deliverables')
    .select('*')
    .eq('brief_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const referenceFiles: string[] = brief.reference_files ?? []
  const urgency = (brief.urgency as BriefUrgency) ?? 'normal'

  return (
    <div style={{ maxWidth: 800 }}>
      <Link
        href="/dashboard/client"
        style={{
          fontSize: 14,
          color: '#242423',
          textDecoration: 'none',
          display: 'inline-block',
          marginBottom: 24,
        }}
      >
        ← Back to projects
      </Link>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 24,
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, color: '#242423', margin: '0 0 4px', fontWeight: 500 }}>
              Description
            </p>
            <p style={{ fontSize: 15, color: '#000', margin: 0, lineHeight: 1.5 }}>
              {brief.description}
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <span style={pillStyle}>
              {getDeliverableLabel(brief.deliverable_type as DeliverableType)}
            </span>
            <span style={pillStyle}>{formatDeadline(brief.deadline)}</span>
            <span style={pillStyle}>
              Budget: {brief.budget != null ? `$${Number(brief.budget).toFixed(2)}` : 'Flexible'}
            </span>
            <span style={pillStyle}>
              {urgency === 'urgent' ? 'Last Second (urgent)' : 'Normal'}
            </span>
          </div>
        </div>

        {status === 'delivered' && deliverable && (
          <a href="#deliverable" style={{ textDecoration: 'none', display: 'block', marginTop: 24 }}>
            <span
              style={{
                ...primaryButtonStyle,
                display: 'block',
                textAlign: 'center',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              Review Deliverable
            </span>
          </a>
        )}
      </div>

      {referenceFiles.length > 0 && (
        <div style={{ ...cardStyle, marginBottom: 16 }}>
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
                {isImageUrl(url) ? (
                  <img
                    src={url}
                    alt={getFileNameFromUrl(url)}
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid #d1d5dc',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d1d5dc',
                      borderRadius: 4,
                      fontSize: 14,
                      background: '#ffffff',
                    }}
                  >
                    {getFileNameFromUrl(url)}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 20px' }}>Timeline</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#000',
                  flexShrink: 0,
                }}
              />
              <div style={{ width: 1, flex: 1, background: '#d1d5dc', minHeight: 32 }} />
            </div>
            <div style={{ paddingBottom: 24 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Brief submitted</p>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#242423' }}>
                {formatDateTime(brief.created_at)}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#000',
                flexShrink: 0,
                marginTop: 2,
              }}
            />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                Current status: {getStatusLabel(status)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {status === 'delivered' && deliverable && (
        <div id="deliverable" style={cardStyle}>
          <h2 style={{ fontSize: 18, fontWeight: 500, margin: '0 0 16px' }}>Deliverable</h2>
          {deliverable.message && (
            <p style={{ fontSize: 15, color: '#242423', margin: '0 0 16px', lineHeight: 1.5 }}>
              {deliverable.message}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {(deliverable.files as string[]).map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {isImageUrl(url) ? (
                  <img
                    src={url}
                    alt={getFileNameFromUrl(url)}
                    style={{
                      width: 120,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid #d1d5dc',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d1d5dc',
                      borderRadius: 4,
                      fontSize: 14,
                      background: '#ffffff',
                    }}
                  >
                    {getFileNameFromUrl(url)}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
