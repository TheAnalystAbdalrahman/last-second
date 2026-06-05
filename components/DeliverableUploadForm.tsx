'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileIcon, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isImageUrl } from '@/lib/briefs'
import { errorBoxStyle, primaryButtonStyle, textareaStyle } from '@/lib/styles'

const MAX_FILES = 10
const MAX_SIZE = 50 * 1024 * 1024

interface UploadedFile {
  url: string
  name: string
}

interface PendingFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
  uploaded?: UploadedFile
}

interface DeliverableUploadFormProps {
  briefId: string
  assignmentId: string
  providerId: string
  briefTitle: string
  clientId: string
}

export default function DeliverableUploadForm({
  briefId,
  assignmentId,
  providerId,
  briefTitle,
  clientId,
}: DeliverableUploadFormProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const hasFiles = pendingFiles.some((f) => f.status === 'pending' || f.status === 'done')

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const fileArray = Array.from(incoming)
      if (fileArray.length === 0) return

      setError('')

      const currentCount = pendingFiles.filter((f) => f.status !== 'error').length
      if (currentCount + fileArray.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`)
        return
      }

      for (const file of fileArray) {
        if (file.size > MAX_SIZE) {
          setError(`"${file.name}" exceeds the 50MB limit.`)
          return
        }
      }

      const newPending: PendingFile[] = fileArray.map((file) => ({
        id: crypto.randomUUID(),
        file,
        progress: 0,
        status: 'pending',
      }))

      setPendingFiles((prev) => [...prev, ...newPending])
    },
    [pendingFiles]
  )

  const uploadFile = async (pending: PendingFile): Promise<UploadedFile | null> => {
    const supabase = createClient()
    const fileId = crypto.randomUUID()
    const path = `${providerId}/${fileId}-${pending.file.name}`

    setPendingFiles((prev) =>
      prev.map((f) => (f.id === pending.id ? { ...f, status: 'uploading', progress: 0 } : f))
    )

    const { error: uploadError } = await supabase.storage.from('deliverables').upload(path, pending.file)

    if (uploadError) {
      setPendingFiles((prev) =>
        prev.map((f) =>
          f.id === pending.id ? { ...f, status: 'error', error: uploadError.message } : f
        )
      )
      return null
    }

    const { data } = supabase.storage.from('deliverables').getPublicUrl(path)
    const uploaded: UploadedFile = { url: data.publicUrl, name: pending.file.name }

    setPendingFiles((prev) =>
      prev.map((f) =>
        f.id === pending.id ? { ...f, status: 'done', progress: 100, uploaded } : f
      )
    )

    return uploaded
  }

  const handleRemove = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const toUpload = pendingFiles.filter((f) => f.status === 'pending')
    const alreadyUploaded = pendingFiles
      .filter((f) => f.status === 'done' && f.uploaded)
      .map((f) => f.uploaded!)

    if (toUpload.length === 0 && alreadyUploaded.length === 0) {
      setError('Please upload at least one file.')
      return
    }

    setSubmitting(true)

    const newUploads: UploadedFile[] = []
    for (const pending of toUpload) {
      const result = await uploadFile(pending)
      if (!result) {
        setError('One or more files failed to upload.')
        setSubmitting(false)
        return
      }
      newUploads.push(result)
    }

    const allFiles = [...alreadyUploaded, ...newUploads]
    const supabase = createClient()

    const { error: deliverableError } = await supabase.from('deliverables').insert({
      brief_id: briefId,
      assignment_id: assignmentId,
      provider_id: providerId,
      files: allFiles.map((f) => f.url),
      message: message.trim() || null,
      status: 'pending_review',
    })

    if (deliverableError) {
      setError(deliverableError.message)
      setSubmitting(false)
      return
    }

    const { error: briefError } = await supabase
      .from('briefs')
      .update({ status: 'delivered' })
      .eq('id', briefId)

    if (briefError) {
      setError(briefError.message)
      setSubmitting(false)
      return
    }

    const payload = { brief_id: briefId, title: briefTitle }

    const { error: clientNotifError } = await supabase.from('notifications').insert({
      user_id: clientId,
      type: 'deliverable_uploaded',
      payload,
    })

    if (clientNotifError) {
      setError(clientNotifError.message)
      setSubmitting(false)
      return
    }

    const { data: admin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .maybeSingle()

    if (admin) {
      const { error: adminNotifError } = await supabase.from('notifications').insert({
        user_id: admin.id,
        type: 'deliverable_uploaded',
        payload,
      })

      if (adminNotifError) {
        setError(adminNotifError.message)
        setSubmitting(false)
        return
      }
    }

    router.push(`/dashboard/provider/briefs/${briefId}`)
    router.refresh()
  }

  const isUploading = pendingFiles.some((f) => f.status === 'uploading')

  return (
    <form onSubmit={handleSubmit}>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => !submitting && !isUploading && inputRef.current?.click()}
        style={{
          border: `1px dashed ${dragging ? '#000' : '#d1d5dc'}`,
          borderRadius: 4,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: submitting || isUploading ? 'not-allowed' : 'pointer',
          background: dragging ? '#f4f4f0' : '#ffffff',
          opacity: submitting || isUploading ? 0.6 : 1,
          marginBottom: 16,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <p style={{ margin: 0, fontSize: 14, color: '#242423' }}>
          Drag and drop files here, or click to upload
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#242423' }}>
          All file types — max {MAX_FILES} files, 50MB each
        </p>
      </div>

      {pendingFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {pendingFiles.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5dc',
                borderRadius: 4,
                background: '#ffffff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {item.uploaded && isImageUrl(item.uploaded.url) ? (
                  <img
                    src={item.uploaded.url}
                    alt={item.file.name}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid #d1d5dc',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #d1d5dc',
                      borderRadius: 4,
                    }}
                  >
                    <FileIcon size={18} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 14,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                    }}
                  >
                    {item.file.name}
                  </span>
                  {item.status === 'uploading' && (
                    <div
                      style={{
                        marginTop: 6,
                        height: 4,
                        background: '#f4f4f0',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: item.progress > 0 ? `${item.progress}%` : '40%',
                          background: '#000',
                          transition: 'width 0.2s',
                          animation: item.progress === 0 ? 'none' : undefined,
                        }}
                      />
                    </div>
                  )}
                  {item.status === 'uploading' && item.progress === 0 && (
                    <span style={{ fontSize: 12, color: '#242423' }}>Uploading…</span>
                  )}
                  {item.status === 'error' && (
                    <span style={{ fontSize: 12, color: '#dc341e' }}>{item.error}</span>
                  )}
                </div>
                {item.status !== 'uploading' && !submitting && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(item.id)
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: '#242423',
                    }}
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a note for the client or admin about this delivery"
        disabled={submitting}
        style={{ ...textareaStyle, marginBottom: 16 }}
      />

      {error && (
        <div style={{ ...errorBoxStyle, marginBottom: 16 }}>{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting || isUploading || !hasFiles}
        style={{
          ...primaryButtonStyle,
          width: '100%',
          boxSizing: 'border-box',
          opacity: submitting || isUploading ? 0.6 : 1,
          cursor: submitting || isUploading ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Submitting…' : 'Submit Deliverable'}
      </button>
    </form>
  )
}
