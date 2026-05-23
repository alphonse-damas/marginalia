import { validateAnalysisArtifact } from "@/lib/artifacts"

import { loadLatestMetricRun } from "./load-latest-metric-run"
import { metricRunToAnalysisArtifact } from "./metric-run-to-analysis-artifact"

const latestRun = loadLatestMetricRun()

const artifact = metricRunToAnalysisArtifact({
  run: latestRun,
  question: {
    primary: "Which factors are associated with the target outcome?",
    intent: "explain",
    stakes: "medium",
  },
})

const validation = validateAnalysisArtifact(artifact)

console.log("\n========================================")
console.log("LATEST METRIC RUN → ANALYSIS ARTIFACT TEST")
console.log("========================================")

console.log("PID:", artifact.id)
console.log("Suspected Format:", artifact.metadata.suspectedFormat)
console.log("Source Engine:", artifact.metadata.sourceEngine)
console.log("Question:", artifact.question.primary)
console.log("Answerability:", artifact.question.answerability)

console.log("\nMODEL")
console.log("Model Family:", artifact.model.family)
console.log("Model Name:", artifact.model.name)
console.log("Target:", artifact.model.target)
console.log("Predictor Count:", artifact.predictors.length)

console.log("\nDATA")
console.log("Observations:", artifact.data.observations)

console.log("\nMODEL FIT")
console.log("AIC Intercept Only:", artifact.metrics.modelFit.interceptOnly.aic)
console.log("AIC Full Model:", artifact.metrics.modelFit.fullModel.aic)
console.log("BIC/SC Intercept Only:", artifact.metrics.modelFit.interceptOnly.bic)
console.log("BIC/SC Full Model:", artifact.metrics.modelFit.fullModel.bic)
console.log(
  "-2 Log L Intercept Only:",
  artifact.metrics.modelFit.interceptOnly.minus2LogLikelihood
)
console.log(
  "-2 Log L Full Model:",
  artifact.metrics.modelFit.fullModel.minus2LogLikelihood
)
console.log("Pseudo R-squared:", artifact.metrics.performance.pseudoRSquared)
console.log("Log-Likelihood:", artifact.metrics.modelFit.additional.logLikelihood)
console.log("LL-Null:", artifact.metrics.modelFit.additional.llNull)
console.log("LLR p-value:", artifact.metrics.modelFit.additional.llrPValue)

console.log("\nSIGNIFICANCE TESTS")
console.log("Likelihood Ratio:", artifact.metrics.significanceTests.likelihoodRatio)
console.log("Score:", artifact.metrics.significanceTests.score)
console.log("Wald:", artifact.metrics.significanceTests.wald)

console.log("\nPREDICTORS")
console.log(
  artifact.predictors.map((predictor) => ({
    name: predictor.name,
    estimate: predictor.estimate,
    standardError: predictor.standardError,
    z: predictor.testStatistic,
    pValue: predictor.pValue,
    ci: predictor.confidenceInterval,
    significance: predictor.significance,
  }))
)

console.log("\nWARNINGS")
console.log(artifact.warnings)

console.log("\nMISSING EVIDENCE")
console.log(artifact.missingEvidence)

console.log("\nTRUST")
console.log(artifact.trust.score, artifact.trust.label)

console.log("\nVALIDATION")
console.log(validation)