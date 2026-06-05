export function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatTime(hours: { min: number; max: number }): string {
  const fmt = (h: number) =>
    h < 1 ? `${Math.round(h * 60)}min` : `${h.toFixed(1)}h`
  return `${fmt(hours.min)} – ${fmt(hours.max)}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatVolume(cm3: number): string {
  return `${cm3.toFixed(1)} cm³`
}

export function formatWeight(grams: number): string {
  return `${Math.round(grams)}g`
}
