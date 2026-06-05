import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCalculatorConfig, saveCalculatorConfig } from '@/lib/calculator-config.server'
import type { CalculatorConfig } from '@/lib/calculator-config.types'

const ADMIN_COOKIE = 'calculator_admin_auth'

function isAuthorized(cookieStore: Awaited<ReturnType<typeof cookies>>): boolean {
  const expected = process.env.CALCULATOR_ADMIN_PASSWORD
  if (!expected) return false
  return cookieStore.get(ADMIN_COOKIE)?.value === expected
}

export async function GET() {
  const cookieStore = await cookies()
  if (!isAuthorized(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const config = await getCalculatorConfig()
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  if (!isAuthorized(cookieStore)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as CalculatorConfig
    await saveCalculatorConfig(body)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as { password?: string }
  const expected = process.env.CALCULATOR_ADMIN_PASSWORD

  if (!expected) {
    return NextResponse.json(
      { error: 'Admin password not configured. Set CALCULATOR_ADMIN_PASSWORD in .env.local' },
      { status: 500 }
    )
  }

  if (body.password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, expected, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE)
  return NextResponse.json({ success: true })
}
