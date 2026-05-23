import fs from "node:fs"
import path from "node:path"

import { validateAnalysisArtifact } from "@/lib/artifacts"

import { normalizeOutputToArtifact } from "./normalize-output"

const rawPath = path.join(
  process.cwd(),
  "src/lib/ingestion/raw/sample_01.txt"
)

const rawText = fs.readFileSync(rawPath, "utf-8")

const artifact = normalizeOutputToArtifact({
  rawText,

  question: {
    primary:
      "Which factors predict honors completion?",

    intent: "explain",

    stakes: "medium",
  },
})

const validation =
  validateAnalysisArtifact(artifact)

console.log("\n========================================")

console.log("RAW FILE INGESTION TEST")

console.log("========================================")

console.log("File:", rawPath)

console.log(
  "Source Engine:",
  artifact.metadata.sourceEngine
)

console.log(
  "Suspected Format:",
  artifact.metadata.suspectedFormat
)

console.log(
  "Question:",
  artifact.question.primary
)

console.log(
  "Answerability:",
  artifact.question.answerability
)

console.log(
  "Observations:",
  artifact.data.observations
)

console.log(
  "Target:",
  artifact.model.target
)

console.log(
  "Model:",
  artifact.model.name
)

console.log(
  "AIC (Intercept Only):",
  artifact.metrics.modelFit.interceptOnly.aic
)

console.log(
  "AIC (Full Model):",
  artifact.metrics.modelFit.fullModel.aic
)

console.log(
  "SC/BIC (Intercept Only):",
  artifact.metrics.modelFit.interceptOnly.bic
)

console.log(
  "SC/BIC (Full Model):",
  artifact.metrics.modelFit.fullModel.bic
)

console.log(
  "-2 Log Likelihood (Intercept Only):",
  artifact.metrics.modelFit.interceptOnly
      .minus2LogLikelihood
)

console.log(
  "-2 Log Likelihood (Full Model):",
  artifact.metrics.modelFit.fullModel
      .minus2LogLikelihood
)

console.log(
  "Likelihood Ratio:",
  artifact.metrics.significanceTests
    .likelihoodRatio
)

console.log(
  "Score:",
  artifact.metrics.significanceTests.score
)

console.log(
  "Wald:",
  artifact.metrics.significanceTests.wald
)

console.log(
  "Predictors:",
  artifact.predictors.map((p) => p.name)
)

console.log(
  "Missing Evidence:",
  artifact.missingEvidence
)

console.log("Validation:", validation)