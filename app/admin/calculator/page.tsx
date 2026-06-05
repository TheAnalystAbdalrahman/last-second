'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CalculatorConfig, CtaRoute } from '@/lib/calculator-config.types'
import type { Material } from '@/lib/calculator'

const MATERIAL_KEYS: Material[] = ['pla', 'resin', 'wood-fill-pla']

export default function AdminCalculatorPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [config, setConfig] = useState<CalculatorConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const loadConfig = useCallback(async () => {
    const res = await fetch('/api/admin/calculator')
    if (res.ok) {
      setConfig(await res.json())
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin/calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      await loadConfig()
    } else {
      const data = await res.json()
      setAuthError(data.error || 'Invalid password')
    }
  }

  const handleSave = async () => {
    if (!config) return
    setSaving(true)
    setSaveMessage('')
    const res = await fetch('/api/admin/calculator', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaving(false)
    setSaveMessage(res.ok ? 'Changes saved.' : 'Failed to save changes.')
  }

  const updateMaterial = (key: Material, field: string, value: string | boolean) => {
    if (!config) return
    setConfig({
      ...config,
      materials: {
        ...config.materials,
        [key]: {
          ...config.materials[key],
          [field]: typeof value === 'boolean' ? value : parseFloat(value as string) || 0,
        },
      },
    })
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-[12px] border border-hairline bg-paper p-8"
        >
          <h1 className="mb-6 text-2xl font-bold tracking-[-0.264px] text-ink">
            Calculator Admin
          </h1>
          <label className="mb-2 block text-sm font-medium text-graphite">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded-[8px] border border-hairline bg-paper px-4 py-3 text-sm outline-none"
          />
          {authError && <p className="mb-4 text-sm text-vermillion">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-[4px] bg-ink py-3 text-sm font-medium text-paper"
          >
            Sign in
          </button>
        </form>
      </div>
    )
  }

  if (!config) return null

  return (
    <div className="min-h-screen bg-canvas p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold tracking-[-0.39px] text-ink">
          Calculator Pricing Controls
        </h1>

        <section className="mb-10 rounded-[12px] border border-hairline bg-paper p-6">
          <h2 className="mb-4 text-lg font-medium text-ink">Material Pricing</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-graphite">
                  <th className="pb-3 pr-4 font-medium">Material</th>
                  <th className="pb-3 pr-4 font-medium">Density (g/cm³)</th>
                  <th className="pb-3 pr-4 font-medium">Cost per gram ($)</th>
                  <th className="pb-3 pr-4 font-medium">Hourly rate ($/hr)</th>
                  <th className="pb-3 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {MATERIAL_KEYS.map((key) => {
                  const m = config.materials[key]
                  return (
                    <tr key={key} className="border-b border-hairline last:border-0">
                      <td className="py-3 pr-4 text-ink">{m.label}</td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          step="0.01"
                          value={m.densityGcm3}
                          onChange={(e) => updateMaterial(key, 'densityGcm3', e.target.value)}
                          className="w-24 rounded-[8px] border border-hairline px-2 py-1"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          step="0.001"
                          value={m.costPerGram}
                          onChange={(e) => updateMaterial(key, 'costPerGram', e.target.value)}
                          className="w-24 rounded-[8px] border border-hairline px-2 py-1"
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          step="0.01"
                          value={m.baseHourlyRate}
                          onChange={(e) => updateMaterial(key, 'baseHourlyRate', e.target.value)}
                          className="w-24 rounded-[8px] border border-hairline px-2 py-1"
                        />
                      </td>
                      <td className="py-3">
                        <input
                          type="checkbox"
                          checked={m.active}
                          onChange={(e) => updateMaterial(key, 'active', e.target.checked)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10 rounded-[12px] border border-hairline bg-paper p-6">
          <h2 className="mb-4 text-lg font-medium text-ink">Platform Controls</h2>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm text-graphite">
                Platform margin (%)
                <input
                  type="number"
                  value={Math.round((config.platformMarginMultiplier - 1) * 100)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      platformMarginMultiplier: 1 + parseFloat(e.target.value) / 100,
                    })
                  }
                  className="mt-1 block w-full rounded-[8px] border border-hairline px-3 py-2"
                />
              </label>
              <label className="text-sm text-graphite">
                Price range spread (%)
                <input
                  type="number"
                  value={Math.round(config.priceRangeSpread * 100)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      priceRangeSpread: parseFloat(e.target.value) / 100,
                    })
                  }
                  className="mt-1 block w-full rounded-[8px] border border-hairline px-3 py-2"
                />
              </label>
              <label className="text-sm text-graphite">
                Minimum price floor ($)
                <input
                  type="number"
                  step="0.01"
                  value={config.minimumPriceFloor}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      minimumPriceFloor: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-[8px] border border-hairline px-3 py-2"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-graphite">Surge pricing</span>
              <button
                type="button"
                onClick={() =>
                  setConfig({ ...config, surgePricingActive: !config.surgePricingActive })
                }
                className={`rounded-pill border px-4 py-1.5 text-sm font-medium ${
                  config.surgePricingActive
                    ? 'border-vermillion bg-vermillion text-paper'
                    : 'border-hairline text-graphite'
                }`}
              >
                {config.surgePricingActive ? 'ON' : 'OFF'}
              </button>
              <label className="text-sm text-graphite">
                Surge %
                <input
                  type="number"
                  value={Math.round(config.surgePercentage * 100)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      surgePercentage: parseFloat(e.target.value) / 100,
                    })
                  }
                  className="ml-2 w-20 rounded-[8px] border border-hairline px-2 py-1"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-[12px] border border-hairline bg-paper p-6">
          <h2 className="mb-4 text-lg font-medium text-ink">Locale Settings</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-graphite">
                <th className="pb-3 text-left font-medium">Locale</th>
                <th className="pb-3 text-left font-medium">Currency</th>
                <th className="pb-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {config.locales.map((locale) => (
                <tr
                  key={locale.locale}
                  className={`border-b border-hairline last:border-0 ${
                    locale.status === 'coming-soon' ? 'opacity-40' : ''
                  }`}
                >
                  <td className="py-3 text-ink">{locale.locale}</td>
                  <td className="py-3 text-graphite">{locale.currency}</td>
                  <td className="py-3 text-graphite capitalize">
                    {locale.status === 'active' ? 'Active' : 'Coming soon'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-10 rounded-[12px] border border-hairline bg-paper p-6">
          <h2 className="mb-4 text-lg font-medium text-ink">CTA Routing</h2>
          <div className="space-y-3 text-sm text-graphite">
            {(
              [
                { value: 'submit-brief', label: 'Point to /submit-brief (new brief form)' },
                { value: 'signup', label: 'Point to /signup (account creation)' },
                { value: 'custom', label: 'Custom URL' },
              ] as { value: CtaRoute; label: string }[]
            ).map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="ctaRoute"
                  checked={config.ctaRoute === value}
                  onChange={() => setConfig({ ...config, ctaRoute: value })}
                />
                {label}
              </label>
            ))}
            {config.ctaRoute === 'custom' && (
              <input
                type="url"
                value={config.ctaCustomUrl}
                onChange={(e) => setConfig({ ...config, ctaCustomUrl: e.target.value })}
                placeholder="https://..."
                className="mt-2 w-full rounded-[8px] border border-hairline px-4 py-2"
              />
            )}
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-[4px] bg-ink px-6 py-3 text-sm font-medium text-paper disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          {saveMessage && <span className="text-sm text-graphite">{saveMessage}</span>}
        </div>
      </div>
    </div>
  )
}
