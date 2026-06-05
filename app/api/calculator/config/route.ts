import { NextResponse } from 'next/server'
import { getCalculatorConfig } from '@/lib/calculator-config.server'

export async function GET() {
  try {
    const config = await getCalculatorConfig()
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
  }
}
