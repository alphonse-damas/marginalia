import fs from "node:fs"

export type ParsedMetricLine = {
  metric_name: string
  metric_value: string
}

export function parseOllamaMetricFile(filePath: string): ParsedMetricLine[] {
  const raw = fs.readFileSync(filePath, "utf-8")

  return parseOllamaMetricText(raw)
}

export function parseOllamaMetricText(raw: string): ParsedMetricLine[] {
  const seen = new Set<string>()
  const metrics: ParsedMetricLine[] = []

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  for (const line of lines) {
    const probabilityModeledMatch = line.match(
      /^Probability modeled is\s+(.+?)\.?$/i
    )

    if (probabilityModeledMatch?.[1]) {
      const metricName = "Probability modeled"
      const metricValue = probabilityModeledMatch[1].trim().replace(/\.$/, "")
      const key = `${metricName}::${metricValue}`

      if (!seen.has(key)) {
        seen.add(key)

        metrics.push({
          metric_name: metricName,
          metric_value: metricValue,
        })
      }

      continue
    }

    const separatorIndex = line.indexOf(":")

    if (separatorIndex === -1) {
      continue
    }

    const metricName = line.slice(0, separatorIndex).trim()
    const metricValue = line.slice(separatorIndex + 1).trim()

    if (!metricName || !metricValue) {
      continue
    }

    if (isSectionHeader(metricName, metricValue)) {
      continue
    }

    if (isNarrativeLine(metricName)) {
      continue
    }

    const key = `${metricName}::${metricValue}`

    if (seen.has(key)) {
      continue
    }

    seen.add(key)

    metrics.push({
      metric_name: metricName,
      metric_value: metricValue,
    })
  }

  return metrics
}

function isSectionHeader(metricName: string, metricValue: string) {
  return (
    metricValue.length === 0 ||
    [
      "Response Profile",
      "Model Convergence Status",
      "Model Fit Statistics",
      "Testing Global Null Hypothesis",
      "Analysis of Maximum Likelihood Estimates",
      "Odds Ratio Estimates",
    ].includes(metricName)
  )
}

function isNarrativeLine(metricName: string) {
  return /^here are/i.test(metricName)
}