'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DELIVERABLE_OPTIONS,
  type BriefUrgency,
  type DeliverableType,
} from '@/lib/briefs'
import {
  errorBoxStyle,
  ghostButtonStyle,
  inputStyle,
  labelStyle,
  primaryButtonStyle,
  textareaStyle,
} from '@/lib/styles'
import ProgressIndicator from './ProgressIndicator'
import FileUploadZone, { type UploadedFile } from './FileUploadZone'

interface NewBriefFormProps {
  userId: string
}

interface FormData {
  title: string
  deliverableType: DeliverableType | ''
  description: string
  deadline: string
  budget: string
  urgency: BriefUrgency
  referenceFiles: UploadedFile[]
}

const initialForm: FormData = {
  title: '',
  deliverableType: '',
  description: '',
  deadline: '',
  budget: '',
  urgency: 'normal',
  referenceFiles: [],
}

export default function NewBriefForm({ userId }: NewBriefFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateStep1 = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.deliverableType) next.deliverableType = 'Please select a deliverable type.'
    if (!form.description.trim()) {
      next.description = 'Description is required.'
    } else if (form.description.trim().length < 50) {
      next.description = 'Description must be at least 50 characters.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const validateStep2 = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.deadline) {
      next.deadline = 'Deadline is required.'
    } else {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selected = new Date(form.deadline + 'T00:00:00')
      if (selected <= today) {
        next.deadline = 'Deadline must be in the future.'
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    if (step === 2 && validateStep2()) setStep(3)
  }

  const handleBack = () => {
    setErrors({})
    setStep((s) => Math.max(1, s - 1))
  }

  const handleSubmit = async () => {
    setSubmitError('')
    setSubmitting(true)

    const supabase = createClient()
    const referenceUrls = form.referenceFiles.map((f) => f.url)

    const { data: newBrief, error: briefError } = await supabase
      .from('briefs')
      .insert({
        client_id: userId,
        title: form.title.trim(),
        description: form.description.trim(),
        deliverable_type: form.deliverableType,
        deadline: form.deadline,
        budget: form.budget ? parseFloat(form.budget) : null,
        urgency: form.urgency,
        reference_files: referenceUrls.length > 0 ? referenceUrls : null,
        status: 'open',
      })
      .select()
      .single()

    if (briefError || !newBrief) {
      setSubmitError(briefError?.message ?? 'Failed to submit brief.')
      setSubmitting(false)
      return
    }

    const { error: notifError } = await supabase.from('notifications').insert({
      user_id: userId,
      type: 'brief_submitted',
      payload: { brief_id: newBrief.id, title: newBrief.title },
    })

    if (notifError) {
      setSubmitError(notifError.message)
      setSubmitting(false)
      return
    }

    router.refresh()
    router.push('/dashboard/client')
  }

  return (
    <div>
      <ProgressIndicator currentStep={step} />

      {submitError && (
        <div style={{ ...errorBoxStyle, marginBottom: 20 }}>{submitError}</div>
      )}

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Project title"
              style={{
                ...inputStyle,
                borderColor: errors.title ? '#dc341e' : '#d1d5dc',
              }}
            />
            {errors.title && (
              <p style={{ color: '#dc341e', fontSize: 13, marginTop: 4 }}>{errors.title}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Deliverable type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DELIVERABLE_OPTIONS.map((option) => {
                const selected = form.deliverableType === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, deliverableType: option.value }))
                    }
                    style={{
                      background: '#ffffff',
                      border: selected ? '1px solid #000000' : '1px solid #d1d5dc',
                      borderRadius: 4,
                      padding: '14px 16px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 500, color: '#000' }}>
                      {option.label}
                    </div>
                    <div style={{ fontSize: 13, color: '#242423', marginTop: 4 }}>
                      {option.description}
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.deliverableType && (
              <p style={{ color: '#dc341e', fontSize: 13, marginTop: 4 }}>
                {errors.deliverableType}
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe your project requirements (min. 50 characters)"
              style={{
                ...textareaStyle,
                borderColor: errors.description ? '#dc341e' : '#d1d5dc',
              }}
            />
            {errors.description && (
              <p style={{ color: '#dc341e', fontSize: 13, marginTop: 4 }}>
                {errors.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" onClick={handleNext} style={primaryButtonStyle}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Deadline</label>
            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
              style={{
                ...inputStyle,
                borderColor: errors.deadline ? '#dc341e' : '#d1d5dc',
              }}
            />
            {errors.deadline && (
              <p style={{ color: '#dc341e', fontSize: 13, marginTop: 4 }}>{errors.deadline}</p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Budget</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.budget}
              onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
              placeholder="Leave empty if flexible"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Urgency</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['urgent', 'normal'] as BriefUrgency[]).map((value) => {
                const selected = form.urgency === value
                const label = value === 'urgent' ? 'Last Second (urgent)' : 'Normal'
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, urgency: value }))}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 9999,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: selected ? '#000' : 'transparent',
                      color: selected ? '#fff' : '#000',
                      border: selected ? 'none' : '1px solid #d1d5dc',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button type="button" onClick={handleBack} style={ghostButtonStyle}>
              Back
            </button>
            <button type="button" onClick={handleNext} style={primaryButtonStyle}>
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Reference files</label>
            <FileUploadZone
              files={form.referenceFiles}
              onChange={(referenceFiles) => setForm((f) => ({ ...f, referenceFiles }))}
              userId={userId}
            />
          </div>

          <button type="button" onClick={handleBack} style={ghostButtonStyle}>
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              ...primaryButtonStyle,
              width: '100%',
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Brief'}
          </button>
        </div>
      )}
    </div>
  )
}
