'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ghostButtonStyle, primaryButtonStyle } from '@/lib/styles'

interface DeliverableReviewActionsProps {
  deliverableId: string
  briefId: string
  briefTitle: string
  clientId: string
  providerId: string
}

export default function DeliverableReviewActions({
  deliverableId,
  briefId,
  briefTitle,
  clientId,
  providerId,
}: DeliverableReviewActionsProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState<'approve' | 'revision' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async () => {
    setSubmitting('approve')
    setError(null)
    const supabase = createClient()

    const { error: deliverableError } = await supabase
      .from('deliverables')
      .update({ status: 'approved' })
      .eq('id', deliverableId)

    if (deliverableError) {
      setError(deliverableError.message)
      setSubmitting(null)
      return
    }

    const { error: briefError } = await supabase
      .from('briefs')
      .update({ status: 'completed' })
      .eq('id', briefId)

    if (briefError) {
      setError(briefError.message)
      setSubmitting(null)
      return
    }

    const payload = { brief_id: briefId, title: briefTitle }

    const { error: clientNotifError } = await supabase.from('notifications').insert({
      user_id: clientId,
      type: 'brief_completed',
      payload,
    })

    if (clientNotifError) {
      setError(clientNotifError.message)
      setSubmitting(null)
      return
    }

    const { error: providerNotifError } = await supabase.from('notifications').insert({
      user_id: providerId,
      type: 'brief_completed',
      payload,
    })

    if (providerNotifError) {
      setError(providerNotifError.message)
      setSubmitting(null)
      return
    }

    setSubmitting(null)
    router.refresh()
  }

  const handleRequestRevision = async () => {
    setSubmitting('revision')
    setError(null)
    const supabase = createClient()

    const { error: deliverableError } = await supabase
      .from('deliverables')
      .update({ status: 'rejected' })
      .eq('id', deliverableId)

    if (deliverableError) {
      setError(deliverableError.message)
      setSubmitting(null)
      return
    }

    const { error: briefError } = await supabase
      .from('briefs')
      .update({ status: 'in_progress' })
      .eq('id', briefId)

    if (briefError) {
      setError(briefError.message)
      setSubmitting(null)
      return
    }

    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: providerId,
      type: 'revision_requested',
      payload: { brief_id: briefId, title: briefTitle },
    })

    if (notifError) {
      setError(notifError.message)
      setSubmitting(null)
      return
    }

    setSubmitting(null)
    router.refresh()
  }

  return (
    <div style={{ marginTop: 24 }}>
      {error && (
        <p style={{ color: '#dc341e', fontSize: 14, margin: '0 0 12px' }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleApprove}
          disabled={submitting !== null}
          style={{
            ...primaryButtonStyle,
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting === 'approve' ? 'Approving…' : 'Approve'}
        </button>
        <button
          type="button"
          onClick={handleRequestRevision}
          disabled={submitting !== null}
          style={{
            ...ghostButtonStyle,
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting === 'revision' ? 'Sending…' : 'Request Revision'}
        </button>
      </div>
    </div>
  )
}
