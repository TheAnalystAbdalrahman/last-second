'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedPriceProps {
  value: number
  prefix?: string
  decimals?: number
}

export function AnimatedPrice({
  value,
  decimals = 2,
}: AnimatedPriceProps) {
  const [displayed, setDisplayed] = useState(value)
  const prevRef = useRef(value)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const DURATION = 500

  useEffect(() => {
    const from = prevRef.current
    const to = value

    if (from === to) return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    startTimeRef.current = null

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3)
    }

    function tick(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = easeOutCubic(progress)
      const current = from + (to - from) * eased

      setDisplayed(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setDisplayed(to)
        prevRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [value])

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayed)

  return <span>{formatted}</span>
}
