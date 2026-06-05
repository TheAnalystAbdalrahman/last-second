'use client'

import { useCallback, useRef, useState } from 'react'
import { ArrowUp, FileIcon, Loader2, X } from 'lucide-react'
import { parseSTLFile } from '@/lib/stl-parser'
import { formatFileSize, formatVolume } from '@/lib/format'

export interface STLFileInfo {
  name: string
  size: number
  volumeCm3: number
  boundingBox: { l: number; w: number; h: number }
}

interface STLDropzoneProps {
  fileInfo: STLFileInfo | null
  onFileLoaded: (info: STLFileInfo) => void
  onClear: () => void
}

const MAX_SIZE = 50 * 1024 * 1024

export default function STLDropzone({ fileInfo, onFileLoaded, onClear }: STLDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [error, setError] = useState('')

  const processFile = useCallback(
    async (file: File) => {
      setError('')
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext !== 'stl') {
        setError('Only .STL files are supported.')
        return
      }
      if (file.size > MAX_SIZE) {
        setError('File exceeds the 50MB limit.')
        return
      }

      setParsing(true)
      try {
        const result = await parseSTLFile(file)
        onFileLoaded({
          name: file.name,
          size: file.size,
          volumeCm3: result.volumeCm3,
          boundingBox: result.boundingBox,
        })
      } catch {
        setError('Failed to parse STL file. Please check the file and try again.')
      } finally {
        setParsing(false)
      }
    },
    [onFileLoaded]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  if (fileInfo) {
    return (
      <div className="flex items-center gap-3 rounded-[12px] border border-hairline bg-paper px-4 py-3">
        <FileIcon size={18} className="shrink-0 text-graphite" />
        <span className="min-w-0 flex-1 truncate text-sm text-ink">{fileInfo.name}</span>
        <span className="text-sm text-graphite">—</span>
        <span className="text-sm text-graphite">{formatFileSize(fileInfo.size)}</span>
        <span className="text-sm text-graphite">—</span>
        <span className="text-sm text-graphite">Vol: {formatVolume(fileInfo.volumeCm3)}</span>
        <button
          type="button"
          onClick={onClear}
          className="ml-2 shrink-0 cursor-pointer border-none bg-transparent p-1 text-graphite"
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    )
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
        onClick={() => !parsing && inputRef.current?.click()}
        className={`cursor-pointer rounded-[12px] border-2 border-dashed px-6 py-12 text-center transition-colors duration-150 ${
          dragging
            ? 'border-graphite bg-paper'
            : 'border-hairline bg-canvas hover:border-graphite'
        } ${parsing ? 'pointer-events-none opacity-70' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".stl"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
            e.target.value = ''
          }}
        />
        {parsing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-graphite" />
            <p className="text-sm text-graphite">Analyzing file...</p>
          </div>
        ) : (
          <>
            <ArrowUp size={24} className="mx-auto mb-3 text-graphite" />
            <p className="text-base tracking-[-0.064px] text-graphite">
              Drop your STL file here
            </p>
            <p className="mt-1 text-sm text-graphite">or click to browse</p>
            <p className="mt-4 text-xs text-graphite">Supports .STL files up to 50MB</p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-vermillion">{error}</p>}
    </div>
  )
}
