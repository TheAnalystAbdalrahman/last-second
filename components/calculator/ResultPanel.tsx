'use client'

import Link from 'next/link'
import type { Material, PriceResult } from '@/lib/calculator'
import { formatTime } from '@/lib/format'
import { AnimatedPrice } from './AnimatedPrice'

interface ResultPanelProps {
  result: PriceResult
  ctaHref: string
}

const MATERIAL_LABELS: Record<Material, string> = {
  pla: 'PLA',
  resin: 'Resin',
  'wood-fill-pla': 'Wood-fill PLA',
}

function materialLabel(material: Material): string {
  return MATERIAL_LABELS[material]
}

function BreakdownRow({
  label,
  dot,
  value,
}: {
  label: string
  dot: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            background: dot,
            border: dot === '#d1d5dc' ? '1px solid #b0b7c0' : 'none',
          }}
        />
        <span className="text-sm tracking-[-0.028px] text-graphite">{label}</span>
      </div>
      <span className="text-sm font-medium tabular-nums tracking-[-0.028px] text-ink">
        {value}
      </span>
    </div>
  )
}

function DetailChip({
  icon,
  label,
  value,
}: {
  icon: string
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-[0.04em] text-[#9ca3af]">{label}</span>
      <span className="text-sm font-medium tracking-[-0.028px] text-graphite">
        {icon} {value}
      </span>
    </div>
  )
}

export default function ResultPanel({ result, ctaHref }: ResultPanelProps) {
  const handleCtaClick = () => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      ;(window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.(
        'event',
        'calculator_cta_click',
        { event_category: 'calculator' }
      )
    }
  }

  if (!result.isValid) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-hairline bg-canvas text-xl">
          ◎
        </div>
        <p className="m-0 text-base font-medium tracking-[-0.064px] text-graphite">
          Enter your dimensions
        </p>
        <p className="m-0 text-sm leading-normal tracking-[-0.028px] text-[#6b7280]">
          Your estimate will appear here
          <br />
          as you fill in the form
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[320px] flex-col">
      <p className="mb-3 mt-0 text-xs font-medium uppercase tracking-[0.08em] text-[#6b7280]">
        Estimated cost
      </p>

      <div className="mb-1 flex flex-wrap items-baseline gap-2">
        <span
          className="price-hero text-[48px] font-bold leading-none tracking-[-0.96px] text-ink tabular-nums"
          style={{ fontFamily: "'ABC Favorit', 'Inter', sans-serif" }}
        >
          <AnimatedPrice value={result.minUSD} /> — <AnimatedPrice value={result.maxUSD} />
        </span>
        <span className="rounded-pill border border-hairline px-2 py-0.5 text-[13px] font-medium tracking-[0.02em] text-[#6b7280]">
          USD
        </span>
      </div>

      <p className="mb-7 mt-0 text-[13px] tracking-[-0.028px] text-[#6b7280]">
        Price range based on standard parameters
      </p>

      <div className="mb-5 h-px bg-hairline" />

      <div className="mb-7 flex flex-col gap-3">
        <BreakdownRow
          label="Material cost"
          dot="#ff90e8"
          value={`$${result.materialCost.toFixed(2)}`}
        />
        <BreakdownRow
          label={`Print time (~${formatTime(result.printTimeHours)})`}
          dot="#ffc900"
          value={`$${result.laborCost.toFixed(2)}`}
        />
        <BreakdownRow
          label="Platform fee"
          dot="#f1f333"
          value={`$${result.platformFee.toFixed(2)}`}
        />
        {result.quantity > 1 && (
          <BreakdownRow
            label={`Quantity ×${result.quantity}`}
            dot="#d1d5dc"
            value={`×${result.quantity}`}
          />
        )}
      </div>

      <div className="mb-5 h-px bg-hairline" />

      <div className="mb-7 flex flex-wrap gap-4">
        <DetailChip icon="⏱" label="Print time" value={formatTime(result.printTimeHours)} />
        <DetailChip
          icon="⚖"
          label="Weight"
          value={`~${Math.round(result.materialWeightGrams)}g`}
        />
        <DetailChip icon="▦" label="Material" value={materialLabel(result.material)} />
      </div>

      <Link
        href={ctaHref}
        onClick={handleCtaClick}
        className="w-full rounded-[4px] bg-ink px-6 py-3.5 text-center text-base font-medium tracking-[-0.064px] text-paper transition-opacity duration-[120ms] ease-in-out hover:opacity-[0.88]"
        style={{ fontFamily: "'ABC Favorit', 'Inter', sans-serif" }}
      >
        Order via Last Second →
      </Link>

      <p className="mb-0 mt-2.5 text-center text-xs leading-normal tracking-[-0.024px] text-[#9ca3af]">
        Final price confirmed by your provider
      </p>
    </div>
  )
}
