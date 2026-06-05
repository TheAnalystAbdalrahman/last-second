'use client'

import { useCallback, useRef, useState } from 'react'
import { FileIcon, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getFileNameFromUrl, isImageUrl } from '@/lib/briefs'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'image/vnd.dwg', 'application/acad']
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.dwg']
const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024

export interface UploadedFile {
  url: string
  name: string
}

interface FileUploadZoneProps {
  files: UploadedFile[]
  onChange: (files: UploadedFile[]) => void
  userId: string
}

function isAcceptedFile(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_TYPES.includes(file.type)
}

export default function FileUploadZone({ files, onChange, userId }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const uploadFiles = useCallback(
    async (incoming: FileList | File[]) => {
      const fileArray = Array.from(incoming)
      if (fileArray.length === 0) return

      setError('')

      if (files.length + fileArray.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed.`)
        return
      }

      for (const file of fileArray) {
        if (!isAcceptedFile(file)) {
          setError('Only JPG, PNG, PDF, and DWG files are accepted.')
          return
        }
        if (file.size > MAX_SIZE) {
          setError(`"${file.name}" exceeds the 10MB limit.`)
          return
        }
      }

      setUploading(true)
      const supabase = createClient()
      const newFiles: UploadedFile[] = []

      for (const file of fileArray) {
        const fileId = crypto.randomUUID()
        const path = `${userId}/${fileId}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('brief-references')
          .upload(path, file)

        if (uploadError) {
          setError(uploadError.message)
          setUploading(false)
          return
        }

        const { data } = supabase.storage.from('brief-references').getPublicUrl(path)
        newFiles.push({ url: data.publicUrl, name: file.name })
      }

      onChange([...files, ...newFiles])
      setUploading(false)
    },
    [files, onChange, userId]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      uploadFiles(e.dataTransfer.files)
    },
    [uploadFiles]
  )

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1px dashed ${dragging ? '#000' : '#d1d5dc'}`,
          borderRadius: 4,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? '#f4f4f0' : '#ffffff',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <p style={{ margin: 0, fontSize: 14, color: '#242423' }}>
          {uploading ? 'Uploading…' : 'Drag and drop files here, or click to upload'}
        </p>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: '#242423' }}>
          JPG, PNG, PDF, DWG — max {MAX_FILES} files, 10MB each
        </p>
      </div>

      {error && (
        <p style={{ color: '#dc341e', fontSize: 14, marginTop: 12 }}>{error}</p>
      )}

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
          {files.map((file, index) => (
            <div
              key={file.url}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 12px',
                border: '1px solid #d1d5dc',
                borderRadius: 4,
                background: '#ffffff',
              }}
            >
              {isImageUrl(file.url) ? (
                <img
                  src={file.url}
                  alt={file.name}
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
              <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name || getFileNameFromUrl(file.url)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(index)
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
