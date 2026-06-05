'use client'

import type { PriceResult, QuickEstimateInputs } from '@/lib/calculator'
import DimensionInput from './DimensionInput'
import ScaleSelector from './ScaleSelector'
import MaterialSelector from './MaterialSelector'
import InfillSelector from './InfillSelector'
import ResultPanel from './ResultPanel'

interface QuickEstimateFormProps {
  inputs: QuickEstimateInputs
  onChange: (inputs: QuickEstimateInputs) => void
  result: PriceResult
  ctaHref: string
}

function InputsSection({
  inputs,
  update,
}: {
  inputs: QuickEstimateInputs
  update: (partial: Partial<QuickEstimateInputs>) => void
}) {
  return (
    <div className="space-y-6">
      <DimensionInput
        length={inputs.length}
        width={inputs.width}
        height={inputs.height}
        unit={inputs.unit}
        onLengthChange={(length) => update({ length })}
        onWidthChange={(width) => update({ width })}
        onHeightChange={(height) => update({ height })}
        onUnitChange={(unit) => update({ unit })}
      />

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
    </div>
  )
}

export default function QuickEstimateForm({
  inputs,
  onChange,
  result,
  ctaHref,
}: QuickEstimateFormProps) {
  const update = (partial: Partial<QuickEstimateInputs>) => {
    onChange({ ...inputs, ...partial })
  }

  return (
    <>
      {/* Desktop: 50/50 split with vertical divider */}
      <div className="hidden items-start md:grid md:grid-cols-[1fr_1px_1fr]">
        <div className="inputs-panel pr-10">
          <InputsSection inputs={inputs} update={update} />
        </div>
        <div className="w-px self-stretch bg-hairline" />
        <div className="result-panel pl-10">
          <ResultPanel result={result} ctaHref={ctaHref} />
        </div>
      </div>

      {/* Mobile: stacked with horizontal divider */}
      <div className="md:hidden">
        <div className="inputs-panel">
          <InputsSection inputs={inputs} update={update} />
        </div>
        <div className="my-8 h-px bg-hairline" />
        <div className="result-panel">
          <ResultPanel result={result} ctaHref={ctaHref} />
        </div>
      </div>
    </>
  )
}
