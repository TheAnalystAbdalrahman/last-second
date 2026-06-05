'use client'

import type { Material } from '@/lib/calculator'
import PillButton from './PillButton'

const MATERIALS: { id: Material; name: string; tech: string }[] = [
  { id: 'pla', name: 'PLA', tech: 'FDM' },
  { id: 'resin', name: 'Resin', tech: 'SLA' },
  { id: 'wood-fill-pla', name: 'Wood-fill PLA', tech: 'FDM' },
]

interface MaterialSelectorProps {
  material: Material
  onChange: (material: Material) => void
}

export default function MaterialSelector({ material, onChange }: MaterialSelectorProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium tracking-[-0.028px] text-graphite">
        Material
      </label>
      <div className="flex flex-wrap gap-2">
        {MATERIALS.map(({ id, name, tech }) => (
          <PillButton
            key={id}
            active={material === id}
            onClick={() => onChange(id)}
            size="lg"
          >
            <span className="flex flex-col items-center leading-tight">
              <span className="font-medium">{name}</span>
              <span className={`text-xs font-normal ${material === id ? 'text-paper/80' : 'text-graphite'}`}>
                {tech}
              </span>
            </span>
          </PillButton>
        ))}
      </div>
    </div>
  )
}
