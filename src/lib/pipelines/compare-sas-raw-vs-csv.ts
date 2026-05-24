import path from "node:path"

import { validateAnalysisArtifact } from "@/lib/artifacts"
import { parseOllamaMetricFile } from "@/lib/metric-isolation/parse-ollama-metric-file"
import { canonicalizeMetric } from "@/lib/metric-canonicalization/canonicalize-metric"
import { canonicalMetricsToArtifact } from "@/lib/metric-canonicalization/canonical-metrics-to-artifact"
import { parseCsvFile } from "@/lib/csv-intake/parse-csv"
import { csvToArtifact } from "@/lib/csv-intake/csv-to-artifact"

const rawRepairedMetricPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "outputs",
  "latest-sas-raw-ollama-output.repaired.metrics.txt"
)

const csvModelPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "csv-intake",
  "templates",
  "logistic_regression_model.csv"
)

const csvPredictorsPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "csv-intake",
  "templates",
  "logistic_regression_predictors.csv"
)

const question = {
  primary: "Which factors predict admission?",
  intent: "predictive" as const,
  stakes: "medium" as const,
}

const rawParsedMetrics = parseOllamaMetricFile(rawRepairedMetricPath)

const rawCanonicalMetrics = rawParsedMetrics.map((metric) =>
  canonicalizeMetric({
    metricName: metric.metric_name,
    metricValue: metric.metric_value,
  })
)

const rawArtifact = canonicalMetricsToArtifact({
  canonicalMetrics: rawCanonicalMetrics,
  suspectedFormat: "sas_logistic_raw_ingestion",
  question,
})

const csvArtifact = csvToArtifact({
  modelRows: parseCsvFile(csvModelPath),
  predictorRows: parseCsvFile(csvPredictorsPath),
  question,
})

const rawValidation = validateAnalysisArtifact(rawArtifact)
const csvValidation = validateAnalysisArtifact(csvArtifact)

function summarizeArtifact(label: string, artifact: typeof rawArtifact) {
  const predictorsExcludingIntercept = artifact.predictors.filter(
    (predictor) => predictor.name.toLowerCase() !== "intercept"
  ).length

  return {
    label,
    target: artifact.model.target,
    observations: artifact.data.observations,
    predictorsExcludingIntercept,
    aicFullModel: artifact.metrics.modelFit.fullModel.aic,
    bicFullModel: artifact.metrics.modelFit.fullModel.bic,
    minus2LogLFullModel:
      artifact.metrics.modelFit.fullModel.minus2LogLikelihood,
    auc: artifact.metrics.roc.auc,
    aucSE: artifact.metrics.roc.aucStandardError,
    aucCI: artifact.metrics.roc.aucConfidenceInterval,
    cStatistic: artifact.metrics.association.cStatistic,
    percentConcordant: artifact.metrics.association.percentConcordant,
    overallPercentCorrect:
      artifact.metrics.classification.overallPercentCorrect,
    likelihoodRatio: artifact.metrics.significanceTests.likelihoodRatio,
    score: artifact.metrics.significanceTests.score,
    wald: artifact.metrics.significanceTests.wald,
    missingEvidence: artifact.missingEvidence,
    trustScore: artifact.trust.score,
    trustLabel: artifact.trust.label,
    requiresHumanReview: artifact.governance.requiresHumanReview,
  }
}

console.log("\n========================================")
console.log("TRACK A VS TRACK B COMPARISON")
console.log("========================================")

console.log("\nTRACK A — RAW SAS INGESTION")
console.log(summarizeArtifact("Raw SAS", rawArtifact))

console.log("\nRAW VALIDATION")
console.log(rawValidation)

console.log("\nTRACK B — CANONICAL CSV INTAKE")
console.log(summarizeArtifact("Canonical CSV", csvArtifact))

console.log("\nCSV VALIDATION")
console.log(csvValidation)

console.log("\nKEY COMPARISON")
console.log({
  rawTrust: `${rawArtifact.trust.score} ${rawArtifact.trust.label}`,
  csvTrust: `${csvArtifact.trust.score} ${csvArtifact.trust.label}`,
  rawMissingEvidence: rawArtifact.missingEvidence,
  csvMissingEvidence: csvArtifact.missingEvidence,
  rawTraceability: rawArtifact.trust.sourceTraceability,
  csvTraceability: csvArtifact.trust.sourceTraceability,
  rawPipelineRisk:
    "Depends on Ollama extraction quality plus repair/canonicalization.",
  csvPipelineRisk:
    "Depends on user-entered structured evidence and CSV validation.",
})

console.log("\nCONCLUSION")
console.log(
  "Track A proves Marginalia can interpret raw SAS evidence, but Track B is more stable, deterministic, and governance-ready."
)