import type { AnalysisArtifact } from "./types"

export type ArtifactValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export function validateAnalysisArtifact(
  artifact: AnalysisArtifact
): ArtifactValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!artifact.id) {
    errors.push("Artifact is missing an id.")
  }

  if (!artifact.metadata.title) {
    errors.push("Artifact is missing a title.")
  }

  if (!artifact.question.primary) {
    errors.push("Artifact is missing a primary question.")
  }

  if (!artifact.model.target) {
    warnings.push("Model target is missing.")
  }

  if (artifact.data.observations === null) {
    warnings.push("Observation count is missing.")
  }

  if (!hasAnyModelFitEvidence(artifact)) {
    warnings.push("No model fit evidence was detected.")
  }

  if (!hasAnyPredictorEvidence(artifact)) {
    warnings.push("No predictor-level evidence detected.")
  }

  if (artifact.missingEvidence.length > 0) {
    warnings.push("Some required evidence is missing.")
  }

  if (artifact.warnings.some((warning) => warning.severity === "critical")) {
    warnings.push("Critical model warning detected.")
  }

  if (
    artifact.question.intent === "causal" &&
    artifact.governance.causalClaimSupported !== true
  ) {
    warnings.push("Causal question is not supported by the available evidence.")
  }

  if (
    artifact.question.stakes === "high" &&
    artifact.governance.highStakesUseSupported !== true
  ) {
    warnings.push("High-stakes use is not fully supported.")
  }

  if (
    artifact.governance.refusalRecommended &&
    !artifact.trust.refusalNeeded
  ) {
    warnings.push(
      "Governance refusal state and trust refusal state are misaligned."
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function hasAnyModelFitEvidence(artifact: AnalysisArtifact): boolean {
  return [
    artifact.metrics.modelFit.interceptOnly.aic,
    artifact.metrics.modelFit.interceptOnly.bic,
    artifact.metrics.modelFit.interceptOnly.minus2LogLikelihood,
    artifact.metrics.modelFit.fullModel.aic,
    artifact.metrics.modelFit.fullModel.bic,
    artifact.metrics.modelFit.fullModel.minus2LogLikelihood,
    artifact.metrics.modelFit.additional.pseudoRSquared,
    artifact.metrics.modelFit.additional.logLikelihood,
    artifact.metrics.modelFit.additional.llNull,
    artifact.metrics.modelFit.additional.llrPValue,
    artifact.metrics.performance.pseudoRSquared,
  ].some((value) => value !== null && value !== undefined)
}

function hasAnyPredictorEvidence(artifact: AnalysisArtifact): boolean {
  return artifact.predictors.length > 0
}