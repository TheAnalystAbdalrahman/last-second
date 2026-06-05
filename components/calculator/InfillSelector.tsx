'use client'

import type { Infill } from '@/lib/calculator'
import PillButton from './PillButton'

const INFILL_OPTIONS: { id: Infill; label: string; percent: string }[] = [
  { id: 'draft', label: 'Draft', percent: '15%' },
  { id: 'standard', label: 'Standard', percent: '20%' },
  { id: 'solid', label: 'Solid', percent: '40%' },
]

interface InfillSelectorProps {
  infill: Infill
  onChange: (infill: Infill) => void
}

export default function InfillSelector({ infill, onChange }: InfillSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium tracking-[-0.028px] text-graphite">
        Infill density
      </label>
      <div className="flex flex-wrap gap-2">
        {INFILL_OPTIONS.map(({ id, label, percent }) => (
          <PillButton key={id} active={infill === id} onClick={() => onChange(id)} size="md">
            {label}{' '}
            <span className={infill === id ? 'text-paper/70' : 'text-graphite'}>{percent}</span>
          </PillButton>
        ))}
      </div>
      <p className="mt-2 text-xs tracking-[-0.028px] text-graphite">
        Higher infill = stronger model, higher cost
      </p>
    </div>
  )
}
