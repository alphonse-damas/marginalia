export function repairOllamaMetricText(
  rawText: string
): string {
  let repaired = rawText

  repaired = repaired.replace(
    /Likelihood Ratio Chi-Square:\s*([^,]+),\s*DF:\s*([^,]+),\s*Pr > ChiSq:\s*([^\n]+)/gi,
    [
      "Likelihood Ratio Chi-Square: $1",
      "Likelihood Ratio DF: $2",
      "Likelihood Ratio Pr > ChiSq: $3",
    ].join("\n")
  )

  repaired = repaired.replace(
    /Score Chi-Square:\s*([^,]+),\s*DF:\s*([^,]+),\s*Pr > ChiSq:\s*([^\n]+)/gi,
    [
      "Score Chi-Square: $1",
      "Score DF: $2",
      "Score Pr > ChiSq: $3",
    ].join("\n")
  )

  repaired = repaired.replace(
    /Wald Chi-Square:\s*([^,]+),\s*DF:\s*([^,]+),\s*Pr > ChiSq:\s*([^\n]+)/gi,
    [
      "Wald Chi-Square: $1",
      "Wald DF: $2",
      "Wald Pr > ChiSq: $3",
    ].join("\n")
  )

  repaired = repaired.replace(
    /(.+?) Wald Chi-Square:\s*([^,]+),\s*Pr > ChiSq:\s*([^\n]+)/gi,
    [
      "$1 Wald Chi-Square: $2",
      "$1 Pr > ChiSq: $3",
    ].join("\n")
  )

  repaired = repaired.replace(
    /95% Confidence Limits:\s*\(([^,]+),\s*([^)]+)\)/gi,
    "95% Confidence Limits for AUC: ($1, $2)"
  )

  return repaired
}