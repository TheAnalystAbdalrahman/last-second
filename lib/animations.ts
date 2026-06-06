'use client'

import React from 'react'

export const easeOutCubic = (t: number): number =>
  1 - Math.pow(1 - t, 3)

export function animateCounter(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void
) {
  const startTime = performance.now()
  const range = to - from

  function tick(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeOutCubic(progress)
    onUpdate(from + range * eased)
    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      onComplete?.()
    }
  }

  requestAnimationFrame(tick)
}

export function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options?: IntersectionObserverInit
): boolean {
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.15, ...options })

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return isVisible
}
