import path from "node:path"

import { validateAnalysisArtifact } from "@/lib/artifacts"

import { parseOllamaMetricFile } from "./parse-ollama-metric-file"
import { ollamaMetricsToArtifact } from "./ollama-metrics-to-artifact"

const metricFilePath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "outputs",
  "sas_logistic_with_predictors_01.metrics.txt"
)

const metrics = parseOllamaMetricFile(metricFilePath)

const artifact = ollamaMetricsToArtifact({
  metrics,
  question: {
    primary: "Which factors predict admission?",
    intent: "predictive",
    stakes: "medium",
  },
})

const validation = validateAnalysisArtifact(artifact)

console.log("\n========================================")
console.log("OLLAMA METRICS → ANALYSIS ARTIFACT TEST")
console.log("========================================")

console.log("Metric Count:", metrics.length)
console.log("Source Engine:", artifact.metadata.sourceEngine)
console.log("Suspected Format:", artifact.metadata.suspectedFormat)
console.log("Question:", artifact.question.primary)
console.log("Answerability:", artifact.question.answerability)

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
    chiSquare: predictor.testStatistic,
    pValue: predictor.pValue,
    oddsRatio: predictor.oddsRatio,
    significance: predictor.significance,
  }))
)

console.log("\nMISSING EVIDENCE")
console.log(artifact.missingEvidence)

console.log("\nTRUST")
console.log(artifact.trust.score, artifact.trust.label)

console.log("\nVALIDATION")
console.log(validation)