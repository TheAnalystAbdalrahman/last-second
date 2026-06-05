'use client'

import { useState } from 'react'
import type { DetailedQuoteInputs } from '@/lib/calculator'
import STLDropzone, { type STLFileInfo } from './STLDropzone'
import ScaleSelector from './ScaleSelector'
import MaterialSelector from './MaterialSelector'
import InfillSelector from './InfillSelector'

interface DetailedQuoteFormProps {
  inputs: DetailedQuoteInputs
  onChange: (inputs: DetailedQuoteInputs) => void
}

export default function DetailedQuoteForm({ inputs, onChange }: DetailedQuoteFormProps) {
  const [fileInfo, setFileInfo] = useState<STLFileInfo | null>(null)

  const update = (partial: Partial<DetailedQuoteInputs>) => {
    onChange({ ...inputs, ...partial })
  }

  const handleFileLoaded = (info: STLFileInfo) => {
    setFileInfo(info)
    onChange({
      ...inputs,
      length: info.boundingBox.l,
      width: info.boundingBox.w,
      height: info.boundingBox.h,
      unit: 'mm',
      scale: '1:1',
      stlVolumeCm3: info.volumeCm3,
    })
  }

  const handleClear = () => {
    setFileInfo(null)
    onChange({
      ...inputs,
      length: 0,
      width: 0,
      height: 0,
      stlVolumeCm3: undefined,
    })
  }

  return (
    <div className="space-y-6">
      <STLDropzone fileInfo={fileInfo} onFileLoaded={handleFileLoaded} onClear={handleClear} />

      {fileInfo && (
        <>
          <ScaleSelector scale={inputs.scale} onChange={(scale) => update({ scale })} />

          <MaterialSelector
            material={inputs.material}
            onChange={(material) => update({ material })}
          />

          {inputs.material !== 'resin' && (
            <InfillSelector infill={inputs.infill} onChange={(infill) => update({ infill })} />
          )}

          <div>
            <label className="mb-2 block text-sm font-medium tracking-[-0.028px] text-graphite">
              Quantity
            </label>
            <div className="inline-flex items-center gap-3">
              <button
                type="button"
                onClick={() => update({ quantity: Math.max(1, inputs.quantity - 1) })}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[4px] border border-hairline bg-paper text-lg text-graphite"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-[2rem] text-center text-base font-medium text-ink">
                {inputs.quantity}
              </span>
              <button
                type="button"
                onClick={() => update({ quantity: Math.min(99, inputs.quantity + 1) })}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[4px] border border-hairline bg-paper text-lg text-graphite"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
