export type ParsedPredictor = {
  variable: string
  oddsRatio: number | null
  confidenceInterval: [number, number] | null
  pValue?: number | null
  strength: "High" | "Medium" | "Low" | "Unstable" | "Association Only"
}

export type ParsedLogisticRegression = {
  modelType: "Logistic Regression"
  target: string | null
  observations: number | null
  auc: number | null
  accuracy: number | null
  aic: number | null
  predictors: ParsedPredictor[]
  warnings: string[]
}

export function parseLogisticRegressionOutput(
  rawText: string
): ParsedLogisticRegression {
  const warnings: string[] = []

  const observations = extractNumber(rawText, /observations?\D+(\d+)/i)
  const auc = extractNumber(rawText, /auc\D+([0-9.]+)/i)
  const accuracy = extractNumber(rawText, /accuracy\D+([0-9.]+)/i)
  const aic = extractNumber(rawText, /aic\D+([0-9.]+)/i)

  if (!observations) {
    warnings.push("Observation count was not detected.")
  }

  if (!auc) {
    warnings.push("AUC was not detected.")
  }

  if (!accuracy) {
    warnings.push("Accuracy was not detected.")
  }

  const predictors = extractPredictors(rawText)

  if (predictors.length === 0) {
    warnings.push("No predictors were detected.")
  }

  return {
    modelType: "Logistic Regression",
    target: extractTarget(rawText),
    observations,
    auc,
    accuracy,
    aic,
    predictors,
    warnings,
  }
}

function extractNumber(
  text: string,
  pattern: RegExp
): number | null {
  const match = text.match(pattern)

  if (!match?.[1]) {
    return null
  }

  const value = Number(match[1])

  return Number.isFinite(value) ? value : null
}

function extractTarget(text: string): string | null {
  const match =
    text.match(/target\D+([A-Z_]+)/i) ||
    text.match(/dependent variable\D+([A-Z_]+)/i)

  return match?.[1] ?? null
}

function extractPredictors(text: string): ParsedPredictor[] {
  const predictors: ParsedPredictor[] = []

  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    const match = line.match(
      /([A-Za-z0-9_ ]+)\s+OR[:=]?\s*([0-9.]+)\s+CI[:=]?\s*\[?([0-9.-]+),\s*([0-9.-]+)\]?/i
    )

    if (!match) {
      continue
    }

    const variable = match[1].trim()
    const oddsRatio = Number(match[2])
    const lower = Number(match[3])
    const upper = Number(match[4])

    predictors.push({
      variable,
      oddsRatio,
      confidenceInterval: [lower, upper],
      strength: classifyStrength(oddsRatio, lower, upper),
    })
  }

  return predictors
}

function classifyStrength(
  oddsRatio: number,
  lower: number,
  upper: number
): ParsedPredictor["strength"] {
  const intervalWidth = upper - lower

  if (intervalWidth > 5) {
    return "Unstable"
  }

  if (lower <= 1 && upper >= 1) {
    return "Low"
  }

  if (oddsRatio >= 2) {
    return "High"
  }

  if (oddsRatio >= 1.25) {
    return "Medium"
  }

  return "Low"
}