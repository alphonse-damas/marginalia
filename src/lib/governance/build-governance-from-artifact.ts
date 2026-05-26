// src/lib/governance/build-governance-from-artifact.ts

import { buildGovernanceEvaluation } from "./build-governance-evaluation"
import { QuestionType } from "./question-requirements"
import { detectValidationEvidence } from "./validation-evidence"

type ArtifactLike = {
  trustScore?: number

  auc?: number | null
  accuracy?: number | null

  evidenceCount?: number

  source?: string

  metadata?: {
    sourceType?: string | null
    suspectedFormat?: string | null
    sourceEngine?: string | null
  }

  model?:
    | string
    | {
        type?: string
        family?: string
        name?: string | null
        target?: string | null
        observations?: number | null
        auc?: number | null
        accuracy?: number | null
        aic?: number | null
        predictors?: string[]
      }

  data?: {
    observations?: number | null
    trainingRows?: number | null
    validationRows?: number | null
    testRows?: number | null
  }

  validation?: {
    holdoutTesting?: boolean | null
    externalValidation?: boolean | null
    testSetMetrics?: Record<string, unknown> | null
    trainTestSplit?: boolean | null
    validationSampleSize?: number | null
    confusionMatrix?: unknown
    auc?: number | null
    accuracy?: number | null
  }

  predictors?: unknown[]
  coefficients?: unknown[]

  evidence?: unknown[]
  evidenceObjects?: unknown[]

  metrics?: {
    performance?: {
      auc?: number | null
      accuracy?: number | null
      precision?: number | null
      recall?: number | null
      f1?: number | null
      pseudoRSquared?: number | null
      validationAuc?: number | null
      validationAccuracy?: number | null
      testAuc?: number | null
      testAccuracy?: number | null
      [key: string]: unknown
    }

    validation?: {
      auc?: number | null
      accuracy?: number | null
      confusionMatrix?: unknown
      [key: string]: unknown
    }

    roc?: {
      auc?: number | null
      aucStandardError?: number | null
      aucConfidenceInterval?: unknown
      [key: string]: unknown
    }

    classification?: {
      overallPercentCorrect?: number | null
      [key: string]: unknown
    }

    association?: {
      cStatistic?: number | null
      percentConcordant?: number | null
      percentDiscordant?: number | null
      somersD?: number | null
      gamma?: number | null
      tauA?: number | null
      [key: string]: unknown
    }

    significanceTests?: Record<string, unknown>

    [key: string]: unknown
  }

  diagnostics?: {
    validationPerformed?: boolean | null
    calibrationChecked?: boolean | null
    fairnessChecked?: boolean | null
    driftChecked?: boolean | null
    [key: string]: unknown
  }

  trust?: {
    score?: number
    label?: string
    level?: string
    evidenceCoverage?: string
    sourceTraceability?: string
    weakContextRisk?: string
    refusalNeeded?: boolean
  }

  governance?: {
    requiresHumanReview?: boolean
    deploymentSupported?: boolean
  }

  question?: {
    primary?: string
    intent?: string
    stakes?: string
    answerability?: string
    alignment?: string
    requiredEvidence?: string[]
  }

  interpretation?: {
    caveats?: string[]
  }

  caveats?: string[]
  warnings?: unknown[]
  reasoningTrace?: string[]
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== ""
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values))
}

function firstValue<T>(values: T[]): T | null {
  for (const value of values) {
    if (hasValue(value)) return value
  }

  return null
}

function getModelObject(
  artifact: ArtifactLike
): Exclude<ArtifactLike["model"], string | undefined> | null {
  if (
    artifact.model &&
    typeof artifact.model === "object"
  ) {
    return artifact.model
  }

  return null
}

function normalizeCoverage(value: string | undefined) {
  const normalized = value?.toLowerCase()

  if (
    normalized === "high" ||
    normalized === "strong" ||
    normalized === "available"
  ) {
    return "partial"
  }

  if (
    normalized === "partial" ||
    normalized === "medium" ||
    normalized === "low-medium"
  ) {
    return "partial"
  }

  if (normalized === "low") {
    return "low"
  }

  if (normalized === "none") {
    return "none"
  }

  return null
}

function normalizeTraceability(value: string | undefined) {
  const normalized = value?.toLowerCase()

  if (
    normalized === "available" ||
    normalized === "high" ||
    normalized === "strong"
  ) {
    return "high"
  }

  if (
    normalized === "moderate" ||
    normalized === "medium" ||
    normalized === "low-medium"
  ) {
    return "moderate"
  }

  if (normalized === "low") {
    return "low"
  }

  return null
}

function normalizeWeakContextRisk(value: string | undefined) {
  const normalized = value?.toLowerCase()

  if (normalized === "low") {
    return "low"
  }

  if (
    normalized === "low-medium" ||
    normalized === "medium" ||
    normalized === "moderate"
  ) {
    return "medium"
  }

  if (normalized === "high") {
    return "high"
  }

  return null
}

function inferQuestionType(artifact: ArtifactLike): QuestionType {
  const intent = artifact.question?.intent?.toLowerCase() ?? ""
  const primary = artifact.question?.primary?.toLowerCase() ?? ""
  const combined = `${intent} ${primary}`

  if (
    combined.includes("deploy") ||
    combined.includes("production") ||
    combined.includes("operational") ||
    combined.includes("decision") ||
    combined.includes("use case")
  ) {
    return "deployment_readiness"
  }

  if (
    combined.includes("cause") ||
    combined.includes("causal") ||
    combined.includes("impact") ||
    combined.includes("effect of")
  ) {
    return "causal_claim"
  }

  return "descriptive_summary"
}

function inferSourceTraceability(artifact: ArtifactLike) {
  const sourceType =
    artifact.metadata?.sourceType?.toLowerCase() ??
    artifact.source?.toLowerCase() ??
    ""

  if (
    sourceType === "spreadsheet" ||
    sourceType === "canonical_csv"
  ) {
    return "high"
  }

  if (
    sourceType === "raw_text" ||
    sourceType === "raw_sas" ||
    sourceType === "sas"
  ) {
    return "moderate"
  }

  return (
    normalizeTraceability(artifact.trust?.sourceTraceability) ??
    "moderate"
  )
}

export function buildGovernanceFromArtifact(artifact: ArtifactLike) {
  const presentEvidence: string[] = []
  const model = getModelObject(artifact)

  const auc = firstValue([
    artifact.auc,
    model?.auc,
    artifact.metrics?.performance?.auc,
    artifact.metrics?.roc?.auc,
    artifact.metrics?.association?.cStatistic,
  ])

  const accuracy = firstValue([
    artifact.accuracy,
    model?.accuracy,
    artifact.metrics?.performance?.accuracy,
    artifact.metrics?.classification?.overallPercentCorrect,
  ])

  if (hasValue(auc) || hasValue(accuracy)) {
    presentEvidence.push("performance_metrics")
  }

  if (
    hasValue(artifact.metrics?.performance?.pseudoRSquared) ||
    hasValue(artifact.metrics?.association?.percentConcordant) ||
    hasValue(artifact.metrics?.association?.somersD) ||
    hasValue(artifact.metrics?.association?.gamma)
  ) {
    presentEvidence.push("performance_metrics")
  }

  if (
    Array.isArray(artifact.predictors) &&
    artifact.predictors.length > 0
  ) {
    presentEvidence.push("predictor_estimates")

    const hasStatisticalDetail = artifact.predictors.some((predictor) => {
      if (
        predictor === null ||
        typeof predictor !== "object"
      ) {
        return false
      }

      const item = predictor as Record<string, unknown>

      return (
        hasValue(item.pValue) ||
        hasValue(item.p_value) ||
        hasValue(item.pvalue) ||
        hasValue(item.significance) ||
        hasValue(item.oddsRatio) ||
        hasValue(item.odds_ratio) ||
        hasValue(item.confidenceInterval) ||
        hasValue(item.confidence_interval)
      )
    })

    if (hasStatisticalDetail) {
      presentEvidence.push("p_values")
    }

    const hasOddsRatios = artifact.predictors.some((predictor) => {
      if (
        predictor === null ||
        typeof predictor !== "object"
      ) {
        return false
      }

      const item = predictor as Record<string, unknown>

      return (
        hasValue(item.oddsRatio) ||
        hasValue(item.odds_ratio)
      )
    })

    if (hasOddsRatios) {
      presentEvidence.push("odds_ratios")
    }

    const hasConfidenceIntervals = artifact.predictors.some((predictor) => {
      if (
        predictor === null ||
        typeof predictor !== "object"
      ) {
        return false
      }

      const item = predictor as Record<string, unknown>

      return (
        hasValue(item.confidenceInterval) ||
        hasValue(item.confidence_interval)
      )
    })

    if (hasConfidenceIntervals) {
      presentEvidence.push("confidence_intervals")
    }
  }

  if (
    Array.isArray(artifact.coefficients) &&
    artifact.coefficients.length > 0
  ) {
    presentEvidence.push("predictor_estimates")
  }

  if (
    Array.isArray(model?.predictors) &&
    model.predictors.length > 0
  ) {
    presentEvidence.push("predictor_estimates")
  }

  if (
    artifact.metrics?.significanceTests &&
    Object.keys(artifact.metrics.significanceTests).length > 0
  ) {
    presentEvidence.push("p_values")
  }

  const validationEvidence =
    detectValidationEvidence(artifact)

  presentEvidence.push(
    ...validationEvidence.presentEvidenceKeys
  )

  if (artifact.diagnostics?.calibrationChecked === true) {
    presentEvidence.push("calibration")
  }

  if (artifact.diagnostics?.fairnessChecked === true) {
    presentEvidence.push("fairness_analysis")
  }

  if (artifact.diagnostics?.driftChecked === true) {
    presentEvidence.push("drift_assessment")
  }

  const normalizedPresentEvidence = unique(presentEvidence)

  const evidenceObjectCount =
    artifact.evidenceCount ??
    artifact.evidenceObjects?.length ??
    artifact.evidence?.length ??
    0

  const usableEvidenceCount = Math.max(
    evidenceObjectCount,
    normalizedPresentEvidence.length
  )

  const normalizedTrustCoverage =
    normalizeCoverage(artifact.trust?.evidenceCoverage)

  const evidenceCoverage =
    normalizedTrustCoverage ??
    (usableEvidenceCount <= 0
      ? "none"
      : usableEvidenceCount <= 1
        ? "low"
        : normalizedPresentEvidence.includes("predictor_estimates") &&
            normalizedPresentEvidence.includes("performance_metrics")
          ? "partial"
          : "low")

  const sourceTraceability =
    inferSourceTraceability(artifact)

  const normalizedWeakContextRisk =
    normalizeWeakContextRisk(artifact.trust?.weakContextRisk)

  const weakContextRisk =
    normalizedWeakContextRisk ??
    (sourceTraceability === "high" &&
    evidenceCoverage !== "none"
      ? "low"
      : sourceTraceability === "moderate" &&
          evidenceCoverage === "partial"
        ? "medium"
        : evidenceCoverage === "none" ||
            evidenceCoverage === "low"
          ? "high"
          : "medium")

  return buildGovernanceEvaluation({
    questionType: inferQuestionType(artifact),
    presentEvidence: normalizedPresentEvidence,
    evidenceCoverage,
    sourceTraceability,
    weakContextRisk,
  })
}