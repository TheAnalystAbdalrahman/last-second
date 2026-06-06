'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  animateCounter,
  useIntersectionObserver,
} from '@/lib/animations'

interface Testimonial {
  id: string
  quote: string
  authorName: string
  authorMeta: string
  avatarInitial: string
  avatarBg: string
  tagLabel: string
  tagDotColor: string
  featured?: boolean
  tall?: boolean
}

interface Stat {
  value: number
  unit: string
  label: string
  decimals?: number
}

const MARQUEE_ITEMS = [
  'Delivered in 18 hours — insane',
  'Best money I spent this semester',
  'My jury loved the model',
  'Found a provider in minutes',
  'Saved my final project',
  'Clean delivery, no drama',
  'The 3D print was perfect',
  'They understood the brief immediately',
  'Worth every lira',
  'Submitted Thursday night, done Friday morning',
]

const STATS: Stat[] = [
  { value: 200, unit: '+', label: 'Projects delivered' },
  { value: 4.9, unit: '★', label: 'Avg rating', decimals: 1 },
  { value: 24, unit: 'h', label: 'Turnaround avg' },
  { value: 98, unit: '%', label: 'On-time delivery' },
]

const testimonials: Testimonial[] = [
  {
    id: 'featured',
    quote:
      'I had 36 hours until jury and my model was a disaster. Last Second matched me with someone in under 10 minutes. They delivered a clean 1:200 site model the next morning. I passed. I literally cried.',
    authorName: 'Lara K.',
    authorMeta: 'Arch. student, Istanbul',
    avatarInitial: 'L',
    avatarBg: '#ff90e8',
    tagLabel: 'Architecture · 3rd year',
    tagDotColor: '#ff90e8',
    featured: true,
  },
  {
    id: 'standard-1',
    quote:
      "The Rhino file they sent back was cleaner than what I would've made myself. Worth every lira.",
    authorName: 'Mehmet A.',
    authorMeta: 'Arch. student, Ankara',
    avatarInitial: 'M',
    avatarBg: '#ffc900',
    tagLabel: '3D Model',
    tagDotColor: '#ffc900',
    tall: true,
  },
  {
    id: 'standard-2',
    quote:
      "Ordered a print on Tuesday night. Had it in my hands Wednesday afternoon. I don't know how they do it.",
    authorName: 'Selin Y.',
    authorMeta: 'Arch. student, Mersin',
    avatarInitial: 'S',
    avatarBg: '#f1f333',
    tagLabel: '3D Print',
    tagDotColor: '#f1f333',
  },
  {
    id: 'standard-3',
    quote:
      "I was skeptical at first — paying someone else felt like cheating. But they explained it's like hiring a model maker. Totally changed how I think about this.",
    authorName: 'Burak D.',
    authorMeta: '4th year, Izmir',
    avatarInitial: 'B',
    avatarBg: '#f4f4f0',
    tagLabel: 'Full project',
    tagDotColor: '#dc341e',
  },
  {
    id: 'standard-4',
    quote:
      "Got a full concept diagram set done overnight. The provider actually understood the design intent — didn't just draw boxes.",
    authorName: 'Nour H.',
    authorMeta: '2nd year, Beirut',
    avatarInitial: 'N',
    avatarBg: '#ff90e8',
    tagLabel: 'Diagram set',
    tagDotColor: '#ff90e8',
  },
]

function StarRow() {
  return (
    <div className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="inline-block h-3.5 w-3.5 bg-ink"
          style={{
            clipPath:
              'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          }}
        />
      ))}
    </div>
  )
}

function TagChip({ label, dotColor }: { label: string; dotColor: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-hairline bg-canvas px-3 py-1 text-xs font-medium text-graphite">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full border border-ink"
        style={{ backgroundColor: dotColor }}
        aria-hidden
      />
      {label}
    </span>
  )
}

function AuthorRow({
  initial,
  bg,
  name,
  meta,
  bordered,
}: {
  initial: string
  bg: string
  name: string
  meta: string
  bordered?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium text-ink ${bordered ? 'border border-hairline' : ''}`}
        style={{ backgroundColor: bg }}
      >
        {initial}
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{name}</p>
        <p className="text-xs text-graphite">{meta}</p>
      </div>
    </div>
  )
}

function SectionHeader() {
  const ref = useRef<HTMLElement>(null)
  const isVisible = useIntersectionObserver(ref)

  return (
    <header ref={ref} className="mb-10 md:mb-12">
      <div
        className="mb-4 flex items-center gap-2 transition-all duration-500"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
          transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
        }}
      >
        <span
          className="inline-block h-2 w-2 rounded-full border border-ink bg-pink"
          aria-hidden
        />
        <span className="text-sm font-medium tracking-caption text-graphite">
          Student reviews
        </span>
      </div>

      <h2 className="text-[48px] font-bold leading-[1.1] tracking-display text-ink">
        <span
          className="block transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: isVisible ? '80ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        >
          The semester doesn&apos;t wait.
        </span>
        <span
          className="relative mt-1 inline-block transition-all duration-500"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
            transitionDelay: isVisible ? '160ms' : '0ms',
            transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        >
          Neither do we.
          <span
            className="absolute -bottom-1 left-0 h-[3px] bg-pink"
            style={{
              width: isVisible ? '100%' : '0%',
              transition: isVisible
                ? 'width 400ms cubic-bezier(0.33, 1, 0.68, 1) 240ms'
                : 'width 0ms',
            }}
            aria-hidden
          />
        </span>
      </h2>
    </header>
  )
}

function MarqueeStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(ref)
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div
      ref={ref}
      className="overflow-hidden border-y border-hairline bg-paper transition-all duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(-24px)',
        transitionDelay: isVisible ? '200ms' : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
      }}
    >
      <div className="group flex w-max animate-marquee py-3.5 hover:[animation-play-state:paused]">
        {items.map((text, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2 border-r border-hairline px-6 text-sm text-ink"
          >
            <span className="tracking-wide" aria-hidden>
              ★★★★★
            </span>
            {text}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatItem({
  stat,
  index,
  isVisible,
}: {
  stat: Stat
  index: number
  isVisible: boolean
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimated.current) return
    hasAnimated.current = true

    const delay = index * 80
    const timer = setTimeout(() => {
      animateCounter(0, stat.value, 800, (value) => {
        setDisplayValue(value)
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [isVisible, index, stat.value])

  const formatted =
    stat.decimals != null
      ? displayValue.toFixed(stat.decimals)
      : Math.round(displayValue).toString()

  return (
    <div
      className={`flex flex-col items-center px-4 py-6 text-center md:py-8 ${
        index % 2 === 0 ? 'border-r border-hairline' : ''
      } ${index < 2 ? 'border-b border-hairline lg:border-b-0' : ''} ${
        index < 3 ? 'lg:border-r lg:border-hairline' : 'lg:border-r-0'
      }`}
    >
      <div className="flex items-end gap-0.5">
        <span className="text-[36px] font-bold leading-none tracking-heading text-ink">
          {formatted}
        </span>
        <span className="pb-0.5 text-xl font-medium text-ink">{stat.unit}</span>
      </div>
      <p className="mt-2 text-sm text-graphite">{stat.label}</p>
    </div>
  )
}

function StatStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(ref, { threshold: 0.3 })

  return (
    <div
      ref={ref}
      className="my-10 overflow-hidden rounded-card border border-hairline bg-paper md:my-12"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <StatItem key={stat.label} stat={stat} index={i} isVisible={isVisible} />
        ))}
      </div>
    </div>
  )
}

function FeaturedCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="relative overflow-hidden rounded-card border border-hairline bg-paper p-8 lg:col-span-2">
      <TagChip label={testimonial.tagLabel} dotColor={testimonial.tagDotColor} />
      <div className="mt-4">
        <StarRow />
      </div>
      <span
        className="mt-4 block text-[48px] font-bold leading-none text-[#e8e8e4]"
        aria-hidden
      >
        &ldquo;
      </span>
      <blockquote className="relative z-10 mt-2 max-w-[400px] text-xl font-medium leading-[1.4] tracking-[-0.008em] text-ink">
        {testimonial.quote}
      </blockquote>
      <div className="relative z-10 mt-8">
        <AuthorRow
          initial={testimonial.avatarInitial}
          bg={testimonial.avatarBg}
          name={testimonial.authorName}
          meta={testimonial.authorMeta}
        />
      </div>
      <div
        className="absolute -bottom-[18px] -right-[18px] z-0 flex h-20 w-[100px] rotate-[-20deg] items-center justify-center rounded-full border-2 border-ink bg-pink text-[28px] font-bold text-ink"
        aria-hidden
      >
        G
      </div>
    </article>
  )
}

function StandardCard({
  testimonial,
  index,
  isVisible,
}: {
  testimonial: Testimonial
  index: number
  isVisible: boolean
}) {
  const delay = index * 60

  return (
    <article
      className={`rounded-card border border-hairline bg-paper px-7 pb-6 pt-7 transition-[border-color] duration-[160ms] ease-out hover:border-ink ${
        testimonial.tall ? 'lg:row-span-2' : ''
      }`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition: isVisible
          ? `opacity 320ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms, transform 320ms cubic-bezier(0.33, 1, 0.68, 1) ${delay}ms, border-color 160ms ease-out`
          : 'opacity 0ms, transform 0ms, border-color 160ms ease-out',
      }}
    >
      <TagChip label={testimonial.tagLabel} dotColor={testimonial.tagDotColor} />
      <div className="mt-3">
        <StarRow />
      </div>
      <span
        className="mt-3 block text-[48px] font-bold leading-none text-hairline"
        aria-hidden
      >
        &ldquo;
      </span>
      <blockquote className="mt-1 text-base leading-normal text-graphite">
        {testimonial.quote}
      </blockquote>
      <div className="mt-6">
        <AuthorRow
          initial={testimonial.avatarInitial}
          bg={testimonial.avatarBg}
          name={testimonial.authorName}
          meta={testimonial.authorMeta}
          bordered={testimonial.avatarBg === '#f4f4f0'}
        />
      </div>
    </article>
  )
}

function TestimonialGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(ref)
  const featured = testimonials.find((t) => t.featured)!
  const standard = testimonials.filter((t) => !t.featured)

  return (
    <div ref={ref} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        className="md:col-span-2 lg:col-span-2"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: isVisible
            ? 'opacity 320ms cubic-bezier(0.33, 1, 0.68, 1), transform 320ms cubic-bezier(0.33, 1, 0.68, 1)'
            : 'opacity 0ms, transform 0ms',
        }}
      >
        <FeaturedCard testimonial={featured} />
      </div>
      {standard.map((t, i) => (
        <StandardCard
          key={t.id}
          testimonial={t}
          index={i + 1}
          isVisible={isVisible}
        />
      ))}
    </div>
  )
}

function CTABanner() {
  const ref = useRef<HTMLDivElement>(null)
  const isVisible = useIntersectionObserver(ref)

  return (
    <div
      ref={ref}
      className="mt-10 flex flex-col items-start justify-between gap-6 rounded-card bg-ink px-7 py-7 md:mt-12 md:flex-row md:items-center md:px-8"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: isVisible
          ? 'opacity 200ms ease-out, transform 200ms ease-out'
          : 'opacity 0ms, transform 0ms',
      }}
    >
      <div>
        <h3 className="text-2xl font-bold tracking-subheading text-paper">
          Deadline in 48 hours?
        </h3>
        <p className="mt-1 text-sm text-[#999999]">
          Tell us what you need. We&apos;ll find someone who can deliver it.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/calculator"
          className="rounded-btn border border-[#444444] px-6 py-3 text-center text-base font-medium text-[#999999] transition-[border-color,color] duration-[120ms] hover:border-[#888888] hover:text-paper"
        >
          See how it works
        </Link>
        <Link
          href="/sign-up"
          className="rounded-btn bg-paper px-6 py-3 text-center text-base font-medium text-ink transition-opacity duration-[120ms] hover:opacity-[0.88]"
        >
          Submit your brief →
        </Link>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  return (
    <section className="bg-canvas py-12 md:py-16 lg:py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <SectionHeader />
      </div>

      <MarqueeStrip />

      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <StatStrip />
        <TestimonialGrid />
        <CTABanner />
      </div>
    </section>
  )
}
