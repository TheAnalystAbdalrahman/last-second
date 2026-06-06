import Link from 'next/link'
import TestimonialsSection from '@/components/sections/TestimonialsSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-12">
        <Link
          href="/"
          className="text-lg font-medium tracking-[-0.108px] text-ink"
        >
          Last Second
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/calculator"
            className="hidden rounded-[4px] px-4 py-2 text-sm font-medium tracking-[-0.028px] text-ink sm:inline-block"
          >
            Calculator
          </Link>
          <Link
            href="/sign-up"
            className="rounded-[4px] bg-ink px-4 py-2 text-sm font-medium tracking-[-0.028px] text-paper"
          >
            Start a project →
          </Link>
        </div>
      </nav>

      <main>
        <TestimonialsSection />
      </main>

      <footer className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-6 py-8 text-sm tracking-[-0.028px] text-graphite sm:flex-row md:px-12">
        <span>© 2025 Last Second</span>
        <span>Privacy · Terms · Contact</span>
      </footer>
    </div>
  )
}
