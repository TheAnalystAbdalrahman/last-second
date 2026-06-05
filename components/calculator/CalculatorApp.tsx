'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { CalculatorConfig } from '@/lib/calculator-config.types'
import { getCtaHref } from '@/lib/calculator-config.types'
import {
  calculatePrice,
  type DetailedQuoteInputs,
  type QuickEstimateInputs,
} from '@/lib/calculator'
import ModeToggle, { type CalculatorMode } from './ModeToggle'
import QuickEstimateForm from './QuickEstimateForm'
import DetailedQuoteForm from './DetailedQuoteForm'
import ResultPanel from './ResultPanel'

const DEFAULT_INPUTS: QuickEstimateInputs = {
  length: 0,
  width: 0,
  height: 0,
  unit: 'cm',
  scale: '1:100',
  material: 'pla',
  infill: 'standard',
  quantity: 1,
}

interface CalculatorAppProps {
  config: CalculatorConfig
}

export default function CalculatorApp({ config }: CalculatorAppProps) {
  const [mode, setMode] = useState<CalculatorMode>('quick')
  const [inputs, setInputs] = useState<QuickEstimateInputs>(DEFAULT_INPUTS)
  const [detailedInputs, setDetailedInputs] = useState<DetailedQuoteInputs>({
    ...DEFAULT_INPUTS,
    scale: '1:1',
  })

  const activeInputs = mode === 'quick' ? inputs : detailedInputs
  const ctaHref = getCtaHref(config)

  const result = useMemo(
    () => calculatePrice(activeInputs, config),
    [activeInputs, config]
  )

  return (
    <>
      <div className="mb-12">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <div className="calculator-card mx-auto max-w-[880px] rounded-[16px] bg-paper p-10">
        {mode === 'quick' ? (
          <QuickEstimateForm
            inputs={inputs}
            onChange={setInputs}
            result={result}
            ctaHref={ctaHref}
          />
        ) : (
          <div className="space-y-8">
            <DetailedQuoteForm inputs={detailedInputs} onChange={setDetailedInputs} />
            <div className="h-px bg-hairline md:hidden" />
            <ResultPanel result={result} ctaHref={ctaHref} />
          </div>
        )}
      </div>

      <section className="mt-12 border-y border-hairline bg-paper py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center md:px-12">
          <div className="max-w-xl">
            <h2 className="text-[30px] font-bold leading-tight tracking-[-0.39px] text-ink">
              Architecture students in Turkey?
            </h2>
            <p className="mt-3 text-lg tracking-[-0.108px] text-graphite">
              Last Second connects you with skilled providers who can print, model, and deliver
              your project — before the deadline.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={ctaHref}
              className="rounded-[4px] bg-ink px-6 py-3 text-sm font-medium tracking-[-0.028px] text-paper"
            >
              Start a project
            </Link>
            <Link
              href="/sign-in"
              className="rounded-[4px] border border-hairline bg-transparent px-6 py-3 text-sm font-medium tracking-[-0.028px] text-ink"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
