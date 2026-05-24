import type { AnalysisArtifact } from "@/lib/artifacts"

import type {
  EvidenceCoverage,
  GovernanceEvaluation,
  QuestionFit,
  SourceTraceability,
  TrustLabel,
  WeakContextRisk,
} from "./types"

export function evaluateGovernance(
  artifact: AnalysisArtifact
): GovernanceEvaluation {
  const missingEvidence = deriveMissingEvidence(artifact)

  const evidenceCoverage =
    evaluateEvidenceCoverage(artifact, missingEvidence)

  const sourceTraceability =
    evaluateSourceTraceability(artifact)

  const questionFit =
    evaluateQuestionFit(artifact, missingEvidence)

  const weakContextRisk =
    evaluateWeakContextRisk({
      artifact,
      evidenceCoverage,
      sourceTraceability,
      questionFit,
      missingEvidence,
    })

  const refusalRecommended =
    shouldRecommendRefusal({
      artifact,
      evidenceCoverage,
      questionFit,
      weakContextRisk,
    })

  const requiresHumanReview =
    refusalRecommended ||
    artifact.question.stakes === "high" ||
    weakContextRisk === "high" ||
    evidenceCoverage === "none"

  const deploymentSupported =
    false

  const highStakesUseSupported =
    artifact.question.stakes === "high"
      ? false
      : null

  const causalClaimSupported =
    artifact.question.intent === "causal"
      ? false
      : null

  const trustScore = calculateTrustScore({
    evidenceCoverage,
    sourceTraceability,
    questionFit,
    weakContextRisk,
    refusalRecommended,
    missingEvidence,
  })

  const trustLabel = labelTrustScore(trustScore)

  const governanceFlags = deriveGovernanceFlags({
    artifact,
    evidenceCoverage,
    sourceTraceability,
    questionFit,
    weakContextRisk,
    refusalRecommended,
    missingEvidence,
  })

  const trustRationale = deriveTrustRationale({
    evidenceCoverage,
    sourceTraceability,
    questionFit,
    weakContextRisk,
    refusalRecommended,
    missingEvidence,
  })

  return {
    evidenceCoverage,
    sourceTraceability,
    questionFit,
    weakContextRisk,

    trustScore,
    trustLabel,

    refusalRecommended,
    requiresHumanReview,
    deploymentSupported,
    highStakesUseSupported,
    causalClaimSupported,

    missingEvidence,
    governanceFlags,
    trustRationale,
  }
}

function deriveMissingEvidence(
  artifact: AnalysisArtifact
): string[] {
  const missing = new Set<string>(
    artifact.missingEvidence ?? []
  )

  if (!artifact.model?.target) {
    missing.add("Target variable is missing.")
  }

  if (!artifact.data?.observations) {
    missing.add("Observation count is missing.")
  }

  if (!artifact.predictors?.length) {
    missing.add("Predictor-level evidence is missing.")
  }

  const hasAuc =
    artifact.metrics?.roc?.auc !== null &&
    artifact.metrics?.roc?.auc !== undefined

  const hasCStatistic =
    artifact.metrics?.association?.cStatistic !== null &&
    artifact.metrics?.association?.cStatistic !== undefined

  if (!hasAuc && !hasCStatistic) {
    missing.add("ROC/AUC evidence is missing.")
  }

  if (!artifact.diagnostics?.validationPerformed) {
    missing.add("Validation output is missing.")
  }

  return Array.from(missing)
}

function evaluateEvidenceCoverage(
  artifact: AnalysisArtifact,
  missingEvidence: string[]
): EvidenceCoverage {
  const hasTarget = Boolean(artifact.model?.target)
  const hasObservations = Boolean(artifact.data?.observations)
  const hasPredictors = Boolean(artifact.predictors?.length)

  const hasModelFit =
    artifact.metrics?.modelFit?.fullModel?.aic !== null ||
    artifact.metrics?.modelFit?.fullModel?.bic !== null ||
    artifact.metrics?.modelFit?.fullModel?.minus2LogLikelihood !== null

  const hasPerformance =
    artifact.metrics?.roc?.auc !== null ||
    artifact.metrics?.association?.cStatistic !== null ||
    artifact.metrics?.classification?.overallPercentCorrect !== null

  if (
    !hasTarget &&
    !hasObservations &&
    !hasPredictors &&
    !hasModelFit &&
    !hasPerformance
  ) {
    return "none"
  }

  if (!hasPredictors || !hasTarget || !hasObservations) {
    return "low"
  }

  if (
    hasModelFit &&
    hasPerformance &&
    hasPredictors &&
    missingEvidence.length <= 2
  ) {
    return artifact.diagnostics?.validationPerformed
      ? "strong"
      : "partial"
  }

  return "partial"
}

function evaluateSourceTraceability(
  artifact: AnalysisArtifact
): SourceTraceability {
  const format =
    artifact.metadata?.suspectedFormat ?? ""

  if (format.includes("canonical_csv")) {
    return "high"
  }

  if (
    format.includes("sas") ||
    format.includes("raw")
  ) {
    return "moderate"
  }

  return "low"
}

function evaluateQuestionFit(
  artifact: AnalysisArtifact,
  missingEvidence: string[]
): QuestionFit {
  if (missingEvidence.includes("Target variable is missing.")) {
    return "none"
  }

  if (artifact.question.intent === "causal") {
    return "weak"
  }

  if (artifact.question.stakes === "high") {
    return "partial"
  }

  if (
    missingEvidence.includes(
      "Predictor-level evidence is missing."
    )
  ) {
    return "weak"
  }

  if (missingEvidence.length > 0) {
    return "partial"
  }

  return "strong"
}

function evaluateWeakContextRisk({
  evidenceCoverage,
  sourceTraceability,
  questionFit,
}: {
  artifact: AnalysisArtifact
  evidenceCoverage: EvidenceCoverage
  sourceTraceability: SourceTraceability
  questionFit: QuestionFit
  missingEvidence: string[]
}): WeakContextRisk {
  if (
    evidenceCoverage === "none" ||
    questionFit === "none" ||
    sourceTraceability === "low"
  ) {
    return "high"
  }

  if (
    evidenceCoverage === "low" ||
    questionFit === "weak" ||
    sourceTraceability === "moderate"
  ) {
    return "medium"
  }

  return "low"
}

function shouldRecommendRefusal({
  artifact,
  evidenceCoverage,
  questionFit,
  weakContextRisk,
}: {
  artifact: AnalysisArtifact
  evidenceCoverage: EvidenceCoverage
  questionFit: QuestionFit
  weakContextRisk: WeakContextRisk
}): boolean {
  if (evidenceCoverage === "none") return true
  if (questionFit === "none") return true
  if (artifact.question.intent === "causal") return true

  if (
    artifact.question.stakes === "high" &&
    weakContextRisk === "high"
  ) {
    return true
  }

  return false
}

function calculateTrustScore({
  evidenceCoverage,
  sourceTraceability,
  questionFit,
  weakContextRisk,
  refusalRecommended,
  missingEvidence,
}: {
  evidenceCoverage: EvidenceCoverage
  sourceTraceability: SourceTraceability
  questionFit: QuestionFit
  weakContextRisk: WeakContextRisk
  refusalRecommended: boolean
  missingEvidence: string[]
}): number {
  if (refusalRecommended) {
    return evidenceCoverage === "none" ? 10 : 25
  }

  let score = 50

  score +=
    evidenceCoverage === "strong"
      ? 25
      : evidenceCoverage === "partial"
        ? 15
        : evidenceCoverage === "low"
          ? 0
          : -35

  score +=
    sourceTraceability === "high"
      ? 10
      : sourceTraceability === "moderate"
        ? 3
        : -10

  score +=
    questionFit === "strong"
      ? 10
      : questionFit === "partial"
        ? 3
        : questionFit === "weak"
          ? -10
          : -25

  score -=
    weakContextRisk === "high"
      ? 25
      : weakContextRisk === "medium"
        ? 10
        : 0

  score -= Math.min(missingEvidence.length * 3, 15)

  return Math.max(0, Math.min(100, Math.round(score)))
}

function labelTrustScore(score: number): TrustLabel {
  if (score >= 90) return "High Confidence"
  if (score >= 75) return "Strong"
  if (score >= 50) return "Caution"
  if (score >= 25) return "Weak"
  return "Insufficient"
}

function deriveGovernanceFlags({
  artifact,
  evidenceCoverage,
  sourceTraceability,
  questionFit,
  weakContextRisk,
  refusalRecommended,
  missingEvidence,
}: {
  artifact: AnalysisArtifact
  evidenceCoverage: EvidenceCoverage
  sourceTraceability: SourceTraceability
  questionFit: QuestionFit
  weakContextRisk: WeakContextRisk
  refusalRecommended: boolean
  missingEvidence: string[]
}): string[] {
  const flags: string[] = []

  if (evidenceCoverage === "none") {
    flags.push("No usable evidence detected.")
  }

  if (sourceTraceability === "moderate") {
    flags.push("Evidence required raw-output extraction and repair.")
  }

  if (questionFit === "weak" || questionFit === "none") {
    flags.push("Question is weakly supported by supplied evidence.")
  }

  if (weakContextRisk === "high") {
    flags.push("High weak-context risk detected.")
  }

  if (artifact.question.intent === "causal") {
    flags.push("Causal claim unsupported by predictive evidence.")
  }

  if (!artifact.diagnostics?.validationPerformed) {
    flags.push("Validation evidence is missing.")
  }

  if (refusalRecommended) {
    flags.push("Refusal or strong qualification recommended.")
  }

  for (const item of missingEvidence) {
    flags.push(item)
  }

  return Array.from(new Set(flags))
}

function deriveTrustRationale({
  evidenceCoverage,
  sourceTraceability,
  questionFit,
  weakContextRisk,
  refusalRecommended,
  missingEvidence,
}: {
  evidenceCoverage: EvidenceCoverage
  sourceTraceability: SourceTraceability
  questionFit: QuestionFit
  weakContextRisk: WeakContextRisk
  refusalRecommended: boolean
  missingEvidence: string[]
}): string[] {
  return [
    `Evidence coverage: ${evidenceCoverage}.`,
    `Source traceability: ${sourceTraceability}.`,
    `Question fit: ${questionFit}.`,
    `Weak-context risk: ${weakContextRisk}.`,
    `Missing evidence count: ${missingEvidence.length}.`,
    refusalRecommended
      ? "Refusal or strong qualification is recommended."
      : "Interpretation is allowed with stated caveats.",
  ]
}