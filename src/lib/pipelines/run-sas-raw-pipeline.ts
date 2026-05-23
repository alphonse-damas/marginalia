import fs from "node:fs"
import path from "node:path"

import { validateAnalysisArtifact } from "@/lib/artifacts"
import { canonicalMetricsToArtifact } from "@/lib/metric-canonicalization/canonical-metrics-to-artifact"
import { canonicalizeMetric } from "@/lib/metric-canonicalization/canonicalize-metric"
import { parseOllamaMetricText } from "@/lib/metric-isolation/parse-ollama-metric-file"
import { repairOllamaMetricText } from "@/lib/metric-isolation/repair-ollama-metric-text"

const rawFixturePath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "sas",
  "sas_logistic_with_roc_01.txt"
)

const promptPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "metric-isolation",
  "ollama-isolation-prompt.txt"
)

const latestOutputPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "outputs",
  "latest-sas-raw-ollama-output.metrics.txt"
)

const repairedOutputPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "outputs",
  "latest-sas-raw-ollama-output.repaired.metrics.txt"
)

async function main() {
  const rawOutput = fs.readFileSync(rawFixturePath, "utf-8")
  const prompt = fs.readFileSync(promptPath, "utf-8")

  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, 1000 * 60 * 5)

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    signal: controller.signal,
    body: JSON.stringify({
      model: "llama3.1:8b",
      prompt: `${prompt}

Raw analytical output:

${rawOutput}`,
      stream: false,
    }),
  })

  if (!response.ok) {
    clearTimeout(timeout)

    const errorText = await response.text().catch(() => "")

    throw new Error(`Ollama request failed: ${response.status}\n${errorText}`)
  }

  const data = await response.json()

  clearTimeout(timeout)

  const rawIsolatedMetricText = String(data.response).trim()

  const isolatedMetricText = repairOllamaMetricText(rawIsolatedMetricText)

  fs.mkdirSync(path.dirname(latestOutputPath), {
    recursive: true,
  })

  fs.writeFileSync(latestOutputPath, rawIsolatedMetricText, "utf-8")

  fs.writeFileSync(repairedOutputPath, isolatedMetricText, "utf-8")

  const parsedMetrics = parseOllamaMetricText(isolatedMetricText)

  const canonicalMetrics = parsedMetrics.map((metric) =>
    canonicalizeMetric({
      metricName: metric.metric_name,
      metricValue: metric.metric_value,
    })
  )

  const unknownMetrics = canonicalMetrics.filter(
    (metric) => metric.kind === "unknown"
  )

  const artifact = canonicalMetricsToArtifact({
    canonicalMetrics,
    suspectedFormat: "sas_logistic",
    question: {
      primary: "Which factors predict admission?",
      intent: "explain",
      stakes: "medium",
    },
  })

  const validation = validateAnalysisArtifact(artifact)

  const predictorsExcludingIntercept = artifact.predictors.filter(
    (predictor) => predictor.name.toLowerCase() !== "intercept"
  ).length

  console.log("\n========================================")
  console.log("SAS RAW INGESTION PIPELINE")
  console.log("========================================")

  console.log("Raw Fixture:", rawFixturePath)
  console.log("Saved Ollama Output:", latestOutputPath)
  console.log("Saved Repaired Output:", repairedOutputPath)

  console.log("Parsed Metrics:", parsedMetrics.length)
  console.log("Canonical Metrics:", canonicalMetrics.length)
  console.log("Unknown Metrics:", unknownMetrics.length)

  console.log("\nMODEL")
  console.log("Model:", artifact.model.name)
  console.log("Target:", artifact.model.target)
  console.log("Observations:", artifact.data.observations)
  console.log("Predictors (excluding intercept):", predictorsExcludingIntercept)

  console.log("\nFIT")
  console.log("AIC Full Model:", artifact.metrics.modelFit.fullModel.aic)
  console.log("BIC Full Model:", artifact.metrics.modelFit.fullModel.bic)
  console.log(
    "-2 Log L Full Model:",
    artifact.metrics.modelFit.fullModel.minus2LogLikelihood
  )

  console.log("\nROC / ASSOCIATION")
  console.log("AUC:", artifact.metrics.roc.auc)
  console.log("AUC SE:", artifact.metrics.roc.aucStandardError)
  console.log("AUC CI:", artifact.metrics.roc.aucConfidenceInterval)
  console.log("c-statistic:", artifact.metrics.association.cStatistic)
  console.log(
    "Percent Concordant:",
    artifact.metrics.association.percentConcordant
  )
  console.log(
    "Overall Percent Correct:",
    artifact.metrics.classification.overallPercentCorrect
  )

  console.log("\nSIGNIFICANCE TESTS")
  console.log(
    "Likelihood Ratio:",
    artifact.metrics.significanceTests.likelihoodRatio
  )
  console.log("Score:", artifact.metrics.significanceTests.score)
  console.log("Wald:", artifact.metrics.significanceTests.wald)

  console.log("\nUNKNOWN METRICS")
  console.log(
    unknownMetrics.map((metric) => ({
      rawName: metric.rawName,
      rawValue: metric.rawValue,
    }))
  )

  console.log("\nMISSING EVIDENCE")
  console.log(artifact.missingEvidence)

  console.log("\nTRUST")
  console.log(artifact.trust.score, artifact.trust.label)

  console.log("\nGOVERNANCE")
  console.log(artifact.governance)

  console.log("\nVALIDATION")
  console.log(validation)

  console.log("\nPIPELINE COMPLETE")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})