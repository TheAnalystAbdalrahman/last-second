'use client'

import PillButton from './PillButton'

const PRESETS = ['1:50', '1:100', '1:200', 'Custom'] as const

interface ScaleSelectorProps {
  scale: string
  onChange: (scale: string) => void
}

export default function ScaleSelector({ scale, onChange }: ScaleSelectorProps) {
  const isCustom = !PRESETS.slice(0, 3).includes(scale as (typeof PRESETS)[number])

  return (
    <div>
      <label className="mb-2 block text-sm font-medium tracking-[-0.028px] text-graphite">
        Project scale
      </label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <PillButton
            key={preset}
            active={preset === 'Custom' ? isCustom : scale === preset}
            onClick={() => onChange(preset === 'Custom' ? '1:75' : preset)}
            size="md"
          >
            {preset}
          </PillButton>
        ))}
      </div>
      {isCustom && (
        <input
          type="text"
          value={scale}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter scale ratio (e.g. 1:75)"
          className="mt-3 w-full rounded-[8px] border border-hairline bg-paper px-4 py-3 text-sm tracking-[-0.028px] text-ink outline-none focus:border-graphite"
        />
      )}
    </div>
  )
}
