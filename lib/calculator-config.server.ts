import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import type { CalculatorConfig } from './calculator-config.types'

const CONFIG_PATH = path.join(process.cwd(), 'data', 'calculator-config.json')

export async function getCalculatorConfig(): Promise<CalculatorConfig> {
  const raw = await readFile(CONFIG_PATH, 'utf-8')
  return JSON.parse(raw) as CalculatorConfig
}

export async function saveCalculatorConfig(config: CalculatorConfig): Promise<void> {
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

export type { CalculatorConfig, CtaRoute, LocaleConfig, MaterialConfig } from './calculator-config.types'
export { getCtaHref } from './calculator-config.types'
