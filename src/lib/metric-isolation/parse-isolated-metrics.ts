export type IsolatedMetricMap = Record<string, string>

export function parseIsolatedMetrics(
  isolatedText: string
): IsolatedMetricMap {
  const metrics: IsolatedMetricMap = {}

  const lines = isolatedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const separatorIndex = line.indexOf(":")

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (!key || !value) {
      continue
    }

    metrics[key] = value
  }

  return metrics
}

export function getMetricNumber(
  metrics: IsolatedMetricMap,
  key: string
): number | null {
  const raw = metrics[key]

  if (!raw) {
    return null
  }

  const normalized = raw.replace(/[,%]/g, "")
  const value = Number(normalized)

  return Number.isFinite(value) ? value : null
}

export function getMetricText(
  metrics: IsolatedMetricMap,
  key: string
): string | null {
  return metrics[key] ?? null
}