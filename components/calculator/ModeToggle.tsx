'use client'

import { useEffect, useRef, useState } from 'react'

export type CalculatorMode = 'quick' | 'detailed'

interface ModeToggleProps {
  mode: CalculatorMode
  onChange: (mode: CalculatorMode) => void
}

const modes: { id: CalculatorMode; label: string }[] = [
  { id: 'quick', label: 'Quick Estimate' },
  { id: 'detailed', label: 'Detailed Quote' },
]

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isStuck, setIsStuck] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden />
      <div
        className="sticky top-0 z-10 flex justify-center bg-canvas px-6 py-4"
        style={{ borderBottom: isStuck ? '1px solid #d1d5dc' : 'none' }}
      >
        <div className="inline-flex rounded-pill border border-hairline bg-paper p-1">
          {modes.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={`rounded-pill px-5 py-2 text-sm font-medium tracking-[-0.028px] transition-all duration-150 ease-in-out ${
                mode === id ? 'bg-ink text-paper' : 'bg-transparent text-graphite'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
