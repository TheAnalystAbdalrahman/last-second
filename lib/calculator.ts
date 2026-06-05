import type { CalculatorConfig } from './calculator-config.types'

export type Material = 'pla' | 'resin' | 'wood-fill-pla'
export type Infill = 'draft' | 'standard' | 'solid'
export type Unit = 'cm' | 'mm'

export interface QuickEstimateInputs {
  length: number
  width: number
  height: number
  unit: Unit
  scale: string
  material: Material
  infill: Infill
  quantity: number
}

export interface DetailedQuoteInputs extends QuickEstimateInputs {
  stlVolumeCm3?: number
}

export interface PriceResult {
  minUSD: number
  maxUSD: number
  materialCost: number
  laborCost: number
  platformFee: number
  printTimeHours: { min: number; max: number }
  materialWeightGrams: number
  material: Material
  quantity: number
  isValid: boolean
}

export const DEFAULT_PRICING_CONFIG = {
  materials: {
    pla: {
      label: 'PLA — FDM',
      densityGcm3: 1.24,
      costPerGram: 0.025,
      baseHourlyRate: 0.8,
    },
    resin: {
      label: 'Resin — SLA',
      densityGcm3: 1.1,
      costPerGram: 0.065,
      baseHourlyRate: 1.2,
    },
    'wood-fill-pla': {
      label: 'Wood-fill PLA',
      densityGcm3: 1.18,
      costPerGram: 0.045,
      baseHourlyRate: 0.8,
    },
  },
  infillMultiplier: {
    draft: 0.15,
    standard: 0.2,
    solid: 0.4,
  },
  platformMarginMultiplier: 1.35,
  priceRangeSpread: 0.2,
  printSpeedCm3PerHour: 8,
  resinSpeedCm3PerHour: 5,
} as const

export type PricingConfig = Pick<
  CalculatorConfig,
  | 'materials'
  | 'infillMultiplier'
  | 'platformMarginMultiplier'
  | 'priceRangeSpread'
  | 'minimumPriceFloor'
  | 'minimumMaxPriceFloor'
  | 'printSpeedCm3PerHour'
  | 'resinSpeedCm3PerHour'
  | 'surgePricingActive'
  | 'surgePercentage'
>

export function calculatePrice(
  inputs: QuickEstimateInputs | DetailedQuoteInputs,
  config?: PricingConfig
): PriceResult {
  const cfg = config ?? {
    materials: Object.fromEntries(
      Object.entries(DEFAULT_PRICING_CONFIG.materials).map(([key, value]) => [
        key,
        { ...value, active: true },
      ])
    ) as PricingConfig['materials'],
    infillMultiplier: DEFAULT_PRICING_CONFIG.infillMultiplier,
    platformMarginMultiplier: DEFAULT_PRICING_CONFIG.platformMarginMultiplier,
    priceRangeSpread: DEFAULT_PRICING_CONFIG.priceRangeSpread,
    minimumPriceFloor: 1.5,
    minimumMaxPriceFloor: 3,
    printSpeedCm3PerHour: DEFAULT_PRICING_CONFIG.printSpeedCm3PerHour,
    resinSpeedCm3PerHour: DEFAULT_PRICING_CONFIG.resinSpeedCm3PerHour,
    surgePricingActive: false,
    surgePercentage: 0.25,
  }

  const factor = inputs.unit === 'mm' ? 0.1 : 1
  const l = inputs.length * factor
  const w = inputs.width * factor
  const h = inputs.height * factor

  const boundingVolumeCm3 = l * w * h
  const material = cfg.materials[inputs.material]
  const infillRatio =
    inputs.material === 'resin' ? 1.0 : cfg.infillMultiplier[inputs.infill]

  const stlVolume = 'stlVolumeCm3' in inputs ? inputs.stlVolumeCm3 : undefined
  const volumeBase = stlVolume && stlVolume > 0 ? stlVolume : boundingVolumeCm3
  const effectiveVolumeCm3 = volumeBase * infillRatio * 0.65

  const weightGrams = effectiveVolumeCm3 * material.densityGcm3
  const materialCost = weightGrams * material.costPerGram

  const speedCm3PerHour =
    inputs.material === 'resin'
      ? cfg.resinSpeedCm3PerHour
      : cfg.printSpeedCm3PerHour
  const printHours = effectiveVolumeCm3 / speedCm3PerHour
  const laborCost = printHours * material.baseHourlyRate

  const unitBaseCost = materialCost + laborCost
  const qtyMaterialCost = materialCost * inputs.quantity
  const qtyLaborCost = laborCost * inputs.quantity
  const platformFee =
    unitBaseCost * (cfg.platformMarginMultiplier - 1) * inputs.quantity
  let totalWithMargin = unitBaseCost * inputs.quantity * cfg.platformMarginMultiplier

  if (cfg.surgePricingActive) {
    totalWithMargin *= 1 + cfg.surgePercentage
  }

  const spread = cfg.priceRangeSpread
  const minUSD = totalWithMargin * (1 - spread)
  const maxUSD = totalWithMargin * (1 + spread)

  return {
    minUSD: Math.max(minUSD, cfg.minimumPriceFloor),
    maxUSD: Math.max(maxUSD, cfg.minimumMaxPriceFloor),
    materialCost: parseFloat(qtyMaterialCost.toFixed(2)),
    laborCost: parseFloat(qtyLaborCost.toFixed(2)),
    platformFee: parseFloat(platformFee.toFixed(2)),
    printTimeHours: {
      min: Math.max(printHours * 0.8, 0.5),
      max: printHours * 1.3,
    },
    materialWeightGrams: weightGrams * inputs.quantity,
    material: inputs.material,
    quantity: inputs.quantity,
    isValid: l > 0 && w > 0 && h > 0,
  }
}
