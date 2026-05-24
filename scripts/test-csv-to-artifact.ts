import path from "node:path"

import { validateAnalysisArtifact } from "@/lib/artifacts"

import { csvToArtifact } from "./csv-to-artifact"
import { parseCsvFile } from "./parse-csv"

const modelPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "csv-intake",
  "templates",
  "logistic_regression_model.csv"
)

const predictorsPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "csv-intake",
  "templates",
  "logistic_regression_predictors.csv"
)

const modelRows = parseCsvFile(modelPath)
const predictorRows = parseCsvFile(predictorsPath)

const artifact = csvToArtifact({
  modelRows,
  predictorRows,
  question: {
    primary: "Which factors predict admission?",
    intent: "predictive",
    stakes: "medium",
  },
})

const validation = validateAnalysisArtifact(artifact)

console.log("\n========================================")
console.log("CANONICAL CSV → ANALYSIS ARTIFACT TEST")
console.log("========================================")

console.log("Model Rows:", modelRows.length)
console.log("Predictor Rows:", predictorRows.length)

console.log("\nMODEL")
console.log("Model:", artifact.model.name)
console.log("Target:", artifact.model.target)
console.log("Observations:", artifact.data.observations)
console.log("Predictors:", artifact.predictors.length)

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

console.log("\nGOVERNANCE")
console.log(artifact.governance)

console.log("\nVALIDATION")
console.log(validation)