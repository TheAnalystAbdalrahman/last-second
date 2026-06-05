'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Fragment, useState, type CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  formatDeadline,
  getDeliverableLabel,
  type BriefStatus,
  type DeliverableType,
} from '@/lib/briefs'
import { ghostButtonStyle, inputStyle, primaryButtonStyle, textareaStyle } from '@/lib/styles'
import StatusBadge from '@/components/briefs/StatusBadge'

interface BriefRow {
  id: string
  title: string
  description: string
  deliverable_type: string
  deadline: string
  status: string
  client_id: string
  client: { full_name: string } | null
}

interface Provider {
  id: string
  full_name: string
}

interface BriefsTableProps {
  briefs: BriefRow[]
  adminId: string
  highlightId?: string
}

const smallPrimaryButton: CSSProperties = {
  ...primaryButtonStyle,
  padding: '8px 16px',
  fontSize: 13,
  display: 'inline-block',
  textDecoration: 'none',
}

const smallGhostButton: CSSProperties = {
  ...ghostButtonStyle,
  padding: '8px 16px',
  fontSize: 13,
  display: 'inline-block',
  textDecoration: 'none',
}

function getActionButton(status: BriefStatus): {
  label: string
  variant: 'primary' | 'ghost' | 'assign'
} {
  if (status === 'open') return { label: 'Assign', variant: 'assign' }
  if (status === 'assigned' || status === 'in_progress') return { label: 'View', variant: 'ghost' }
  if (status === 'delivered') return { label: 'Review', variant: 'primary' }
  return { label: 'View', variant: 'ghost' }
}

export default function BriefsTable({ briefs, adminId, highlightId }: BriefsTableProps) {
  const router = useRouter()
  const [openBriefId, setOpenBriefId] = useState<string | null>(highlightId ?? null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [providersLoading, setProvidersLoading] = useState(false)
  const [selectedProviderId, setSelectedProviderId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProviders = async () => {
    if (providers.length > 0) return
    setProvidersLoading(true)
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['provider', 'both'])
      .order('full_name')

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProviders(data ?? [])
    }
    setProvidersLoading(false)
  }

  const handleAssignClick = async (briefId: string) => {
    if (openBriefId === briefId) {
      setOpenBriefId(null)
      setSelectedProviderId('')
      setNotes('')
      setError(null)
      return
    }
    setOpenBriefId(briefId)
    setSelectedProviderId('')
    setNotes('')
    setError(null)
    await loadProviders()
  }

  const handleConfirmAssignment = async (brief: BriefRow) => {
    if (!selectedProviderId) {
      setError('Please select a provider.')
      return
    }

    setSubmitting(true)
    setError(null)
    const supabase = createClient()

    const { error: assignmentError } = await supabase.from('assignments').insert({
      brief_id: brief.id,
      provider_id: selectedProviderId,
      assigned_by: adminId,
      notes: notes.trim() || null,
    })

    if (assignmentError) {
      setError(assignmentError.message)
      setSubmitting(false)
      return
    }

    const { error: briefError } = await supabase
      .from('briefs')
      .update({ status: 'assigned' })
      .eq('id', brief.id)

    if (briefError) {
      setError(briefError.message)
      setSubmitting(false)
      return
    }

    const notificationPayload = { brief_id: brief.id, title: brief.title }

    const { error: providerNotifError } = await supabase.from('notifications').insert({
      user_id: selectedProviderId,
      type: 'brief_assigned',
      payload: notificationPayload,
    })

    if (providerNotifError) {
      setError(providerNotifError.message)
      setSubmitting(false)
      return
    }

    const { error: clientNotifError } = await supabase.from('notifications').insert({
      user_id: brief.client_id,
      type: 'brief_assigned',
      payload: notificationPayload,
    })

    if (clientNotifError) {
      setError(clientNotifError.message)
      setSubmitting(false)
      return
    }

    setOpenBriefId(null)
    setSelectedProviderId('')
    setNotes('')
    setSubmitting(false)
    router.refresh()
  }

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
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Client name</th>
            <th style={thStyle}>Deliverable type</th>
            <th style={thStyle}>Deadline</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {briefs.map((brief) => {
            const status = brief.status as BriefStatus
            const action = getActionButton(status)
            const isHighlighted = highlightId === brief.id
            const isPanelOpen = openBriefId === brief.id

            return (
              <Fragment key={brief.id}>
                <tr
                  style={{
                    background: isHighlighted ? '#fffef5' : '#ffffff',
                  }}
                >
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{brief.title}</td>
                  <td style={tdStyle}>{brief.client?.full_name ?? '—'}</td>
                  <td style={tdStyle}>
                    {getDeliverableLabel(brief.deliverable_type as DeliverableType)}
                  </td>
                  <td style={{ ...tdStyle, color: '#242423' }}>{formatDeadline(brief.deadline)}</td>
                  <td style={tdStyle}>
                    <StatusBadge status={status} />
                  </td>
                  <td style={tdStyle}>
                    {action.variant === 'assign' ? (
                      <button
                        type="button"
                        onClick={() => handleAssignClick(brief.id)}
                        style={{
                          ...smallPrimaryButton,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Assign
                      </button>
                    ) : action.variant === 'primary' ? (
                      <Link href={`/dashboard/admin/briefs/${brief.id}`} style={smallPrimaryButton}>
                        Review
                      </Link>
                    ) : (
                      <Link href={`/dashboard/admin/briefs/${brief.id}`} style={smallGhostButton}>
                        View
                      </Link>
                    )}
                  </td>
                </tr>
                {isPanelOpen && (
                  <tr>
                    <td colSpan={6} style={{ padding: 0, borderBottom: '1px solid #d1d5dc' }}>
                      <div
                        style={{
                          background: '#f4f4f0',
                          padding: 24,
                          borderTop: '1px solid #d1d5dc',
                        }}
                      >
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 500,
                            margin: '0 0 8px',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {brief.title}
                        </h3>
                        <p
                          style={{
                            fontSize: 14,
                            color: '#242423',
                            margin: '0 0 20px',
                            lineHeight: 1.5,
                            maxWidth: 640,
                          }}
                        >
                          {brief.description}
                        </p>

                        {error && (
                          <p style={{ color: '#dc341e', fontSize: 14, margin: '0 0 16px' }}>{error}</p>
                        )}

                        <div style={{ marginBottom: 16, maxWidth: 400 }}>
                          <label
                            htmlFor={`provider-${brief.id}`}
                            style={{
                              display: 'block',
                              fontSize: 14,
                              fontWeight: 500,
                              marginBottom: 6,
                              color: '#242423',
                            }}
                          >
                            Provider
                          </label>
                          <select
                            id={`provider-${brief.id}`}
                            value={selectedProviderId}
                            onChange={(e) => setSelectedProviderId(e.target.value)}
                            disabled={providersLoading || submitting}
                            style={{
                              ...inputStyle,
                              cursor: 'pointer',
                              appearance: 'auto',
                            }}
                          >
                            <option value="">
                              {providersLoading ? 'Loading providers…' : 'Select a provider'}
                            </option>
                            {providers.map((provider) => (
                              <option key={provider.id} value={provider.id}>
                                {provider.full_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div style={{ marginBottom: 20, maxWidth: 480 }}>
                          <label
                            htmlFor={`notes-${brief.id}`}
                            style={{
                              display: 'block',
                              fontSize: 14,
                              fontWeight: 500,
                              marginBottom: 6,
                              color: '#242423',
                            }}
                          >
                            Notes
                          </label>
                          <textarea
                            id={`notes-${brief.id}`}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Internal notes about this assignment"
                            disabled={submitting}
                            style={{ ...textareaStyle, minHeight: 80 }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <button
                            type="button"
                            onClick={() => handleConfirmAssignment(brief)}
                            disabled={submitting}
                            style={{
                              ...primaryButtonStyle,
                              padding: '8px 16px',
                              fontSize: 13,
                              opacity: submitting ? 0.6 : 1,
                              cursor: submitting ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {submitting ? 'Assigning…' : 'Confirm Assignment'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenBriefId(null)
                              setSelectedProviderId('')
                              setNotes('')
                              setError(null)
                            }}
                            disabled={submitting}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              fontSize: 14,
                              color: '#242423',
                              cursor: submitting ? 'not-allowed' : 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
