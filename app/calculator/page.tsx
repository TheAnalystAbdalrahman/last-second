import type { Metadata } from 'next'
import Link from 'next/link'
import { getCalculatorConfig } from '@/lib/calculator-config.server'
import { getCtaHref } from '@/lib/calculator-config.types'
import CalculatorApp from '@/components/calculator/CalculatorApp'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import './calculator.css'

export const metadata: Metadata = {
  title: 'Free 3D Print Cost Calculator for Architecture Students | Last Second',
  description:
    'Instantly estimate the cost of your 3D printed architecture model. Enter dimensions, pick your material and scale, get a price in seconds. No signup required.',
  openGraph: {
    title: '3D Print Cost Calculator — Last Second',
    description:
      'Free instant 3D printing cost estimates for architecture students. PLA, Resin, Wood-fill. FDM and SLA.',
  },
}

export default async function CalculatorPage() {
  const config = await getCalculatorConfig()
  const ctaHref = getCtaHref(config)

  return (
    <div className="calculator-page min-h-screen bg-canvas">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-12">
        <Link
          href="/calculator"
          className="text-lg font-medium tracking-[-0.108px] text-ink"
        >
          Last Second
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden rounded-[4px] px-4 py-2 text-sm font-medium tracking-[-0.028px] text-ink sm:inline-block"
          >
            How it works
          </Link>
          <Link
            href={ctaHref}
            className="rounded-[4px] bg-ink px-4 py-2 text-sm font-medium tracking-[-0.028px] text-paper"
          >
            Start a project →
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-[1200px] px-6 pb-12 md:px-12">
        <header className="mb-12 text-center">
          <h1 className="text-[48px] font-bold leading-[1.25] tracking-[-0.96px] text-ink">
            How much will your
            <br />
            3D print cost?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg tracking-[-0.108px] text-graphite">
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-pink" aria-hidden />
            Find out in seconds. No signup, no guesswork.
            <br />
            Architecture-grade pricing for FDM and resin models.
          </p>
        </header>

        <CalculatorApp config={config} />
      </main>

      <TestimonialsSection />

      <footer className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-6 py-8 text-sm tracking-[-0.028px] text-graphite sm:flex-row md:px-12">
        <span>© 2025 Last Second</span>
        <span>Privacy · Terms · Contact</span>
      </footer>
    </div>
  )
}
