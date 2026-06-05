'use client'

import type { Unit } from '@/lib/calculator'

interface DimensionInputProps {
  length: number
  width: number
  height: number
  unit: Unit
  onLengthChange: (value: number) => void
  onWidthChange: (value: number) => void
  onHeightChange: (value: number) => void
  onUnitChange: (unit: Unit) => void
}

const inputClass =
  'calculator-input w-full rounded-[8px] border border-hairline bg-paper py-3 pl-4 pr-9 text-base font-normal tracking-[-0.064px] text-ink'

function DimensionField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string
  value: number
  unit: Unit
  onChange: (value: number) => void
}) {
  return (
    <div>
      <span className="mb-1 block text-xs text-graphite">{label}</span>
      <div className="relative inline-flex w-full items-center">
        <input
          type="number"
          min={0}
          placeholder="0"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={inputClass}
        />
        <span className="pointer-events-none absolute right-3 select-none text-xs text-[#9ca3af]">
          {unit}
        </span>
      </div>
    </div>
  )
}

export default function DimensionInput({
  length,
  width,
  height,
  unit,
  onLengthChange,
  onWidthChange,
  onHeightChange,
  onUnitChange,
}: DimensionInputProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium tracking-[-0.028px] text-graphite">
          Model dimensions
        </label>
        <div className="inline-flex rounded-[4px] border border-hairline bg-paper p-0.5">
          {(['cm', 'mm'] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onUnitChange(u)}
              className={`rounded-[4px] px-3 py-1 text-xs font-medium tracking-[-0.028px] transition-all duration-150 ${
                unit === u ? 'bg-ink text-paper' : 'text-graphite'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <DimensionField label="L" value={length} unit={unit} onChange={onLengthChange} />
        <DimensionField label="W" value={width} unit={unit} onChange={onWidthChange} />
        <DimensionField label="H" value={height} unit={unit} onChange={onHeightChange} />
      </div>
    </div>
  )
}
