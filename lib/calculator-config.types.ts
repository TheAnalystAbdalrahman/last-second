import type { Material } from './calculator'

export interface MaterialConfig {
  label: string
  densityGcm3: number
  costPerGram: number
  baseHourlyRate: number
  active: boolean
}

export interface LocaleConfig {
  locale: string
  currency: string
  status: 'active' | 'coming-soon'
}

export type CtaRoute = 'submit-brief' | 'signup' | 'custom'

export interface CalculatorConfig {
  materials: Record<Material, MaterialConfig>
  infillMultiplier: {
    draft: number
    standard: number
    solid: number
  }
  platformMarginMultiplier: number
  priceRangeSpread: number
  minimumPriceFloor: number
  minimumMaxPriceFloor: number
  printSpeedCm3PerHour: number
  resinSpeedCm3PerHour: number
  surgePricingActive: boolean
  surgePercentage: number
  ctaRoute: CtaRoute
  ctaCustomUrl: string
  locales: LocaleConfig[]
}

export function getCtaHref(config: CalculatorConfig): string {
  switch (config.ctaRoute) {
    case 'submit-brief':
      return '/dashboard/client/new-brief'
    case 'signup':
      return '/sign-up'
    case 'custom':
      return config.ctaCustomUrl || '/dashboard/client/new-brief'
    default:
      return '/dashboard/client/new-brief'
  }
}
