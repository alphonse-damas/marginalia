import path from "node:path"

import { validateAnalysisArtifact } from "@/lib/artifacts"
import { parseOllamaMetricFile } from "@/lib/metric-isolation/parse-ollama-metric-file"
import { canonicalizeMetric } from "./canonicalize-metric"
import { canonicalMetricsToArtifact } from "./canonical-metrics-to-artifact"

const metricFilePath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "outputs",
  "sas_logistic_with_roc_01.metrics.txt"
)

const parsedMetrics = parseOllamaMetricFile(metricFilePath)

const canonicalMetrics = parsedMetrics.map((metric) =>
  canonicalizeMetric({
    metricName: metric.metric_name,
    metricValue: metric.metric_value,
  })
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

console.log("\n========================================")
console.log("CANONICAL METRICS → ANALYSIS ARTIFACT TEST")
console.log("========================================")

console.log("Parsed Metric Count:", parsedMetrics.length)
console.log("Canonical Metric Count:", canonicalMetrics.length)

console.log("\nUNKNOWN METRICS")
console.log(
  canonicalMetrics.filter((metric) => metric.kind === "unknown")
)

console.log("\nMODEL")
console.log("Model:", artifact.model.name)
console.log("Target:", artifact.model.target)
console.log("Observations:", artifact.data.observations)
console.log("Predictor Count:", artifact.predictors.length)

console.log("\nFIT")
console.log("AIC Full Model:", artifact.metrics.modelFit.fullModel.aic)
console.log("BIC Full Model:", artifact.metrics.modelFit.fullModel.bic)
console.log(
  "-2 Log L Full Model:",
  artifact.metrics.modelFit.fullModel.minus2LogLikelihood
)

console.log("\nROC / ASSOCIATION")
console.log("AUC:", artifact.metrics.roc.auc)
console.log("c-statistic:", artifact.metrics.association.cStatistic)
console.log("Percent Concordant:", artifact.metrics.association.percentConcordant)

console.log("\nTESTS")
console.log("Likelihood Ratio:", artifact.metrics.significanceTests.likelihoodRatio)
console.log("Score:", artifact.metrics.significanceTests.score)
console.log("Wald:", artifact.metrics.significanceTests.wald)

console.log("\nPREDICTORS")
console.log(
  artifact.predictors.map((predictor) => ({
    name: predictor.name,
    estimate: predictor.estimate,
    standardError: predictor.standardError,
    testStatistic: predictor.testStatistic,
    testStatisticType: predictor.testStatisticType,
    pValue: predictor.pValue,
    oddsRatio: predictor.oddsRatio,
    ci: predictor.confidenceInterval,
    significance: predictor.significance,
  }))
)

console.log("\nMISSING EVIDENCE")
console.log(artifact.missingEvidence)

console.log("\nTRUST")
console.log(artifact.trust.score, artifact.trust.label)

console.log("\nVALIDATION")
console.log(validation)