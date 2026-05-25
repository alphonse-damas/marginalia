// src/lib/governance/build-governance-evaluation.ts

import {
  EvidenceCoverage,
  GovernanceEvaluation,
  QuestionFit,
  SourceTraceability,
  WeakContextRisk,
  getTrustBand,
  shouldRefuse,
  supportsDeployment,
} from "./governance-semantics-v1"

import { QuestionType } from "./question-requirements"
import { evaluateQuestionFit } from "./evaluate-question-fit"
import { applyHighConfidenceRules } from "./high-confidence-rules"

export type BuildGovernanceEvaluationInput = {
  questionType: QuestionType
  presentEvidence: string[]
  evidenceCoverage: EvidenceCoverage
  sourceTraceability: SourceTraceability
  weakContextRisk: WeakContextRisk
}

function normalizeEvidenceKey(key: string): string {
  const normalized = key.trim().toLowerCase()

  const aliases: Record<string, string> = {
    auc: "performance_metrics",
    accuracy: "performance_metrics",
    roc_auc: "performance_metrics",
    model_auc: "performance_metrics",
    classification_accuracy: "performance_metrics",
    overall_percent_correct: "performance_metrics",
    overallpercentcorrect: "performance_metrics",
    model_performance: "performance_metrics",
    predictive_performance: "performance_metrics",
    performance: "performance_metrics",

    predictor_metrics: "predictor_estimates",
    predictor_summary: "predictor_estimates",
    coefficient_estimates: "predictor_estimates",
    coefficients: "predictor_estimates",
    estimates: "predictor_estimates",

    p_value: "p_values",
    pvalue: "p_values",
    pvalues: "p_values",
    significance: "p_values",
    statistical_significance: "p_values",

    ci: "confidence_intervals",
    confidence_interval: "confidence_intervals",
    confidenceinterval: "confidence_intervals",

    or: "odds_ratios",
    odds_ratio: "odds_ratios",
    oddsratio: "odds_ratios",

    validation_output: "validation",
    validation_results: "validation",
    holdout_validation: "validation",
    holdout_testing: "validation",
    external_validation: "validation",

    calibration_metrics: "calibration",
    calibration_output: "calibration",

    fairness: "fairness_analysis",
    subgroup_analysis: "fairness_analysis",
    bias_assessment: "fairness_analysis",

    monitoring: "monitoring_plan",
    model_monitoring: "monitoring_plan",

    drift: "drift_assessment",
    drift_metrics: "drift_assessment",
  }

  return aliases[normalized] ?? normalized
}

function normalizePresentEvidence(presentEvidence: string[]): string[] {
  return Array.from(new Set(presentEvidence.map(normalizeEvidenceKey)))
}

function deriveQuestionFit(
  hasRequiredEvidence: boolean,
  missingRecommendedCount: number
): QuestionFit {
  if (!hasRequiredEvidence) return "weak"
  if (missingRecommendedCount > 0) return "partial"
  return "strong"
}

function calculateTrustScoreWithBreakdown(input: {
  evidenceCoverage: EvidenceCoverage
  questionFit: QuestionFit
  sourceTraceability: SourceTraceability
  weakContextRisk: WeakContextRisk
  missingRequiredEvidence: string[]
  missingRecommendedEvidence: string[]
}) {
  const startingScore = 100

  const penalties: {
    label: string
    value: number
    reason: string
  }[] = []

  function addPenalty(label: string, value: number, reason: string) {
    penalties.push({ label, value, reason })
  }

  if (input.evidenceCoverage === "none") {
    addPenalty(
      "Evidence coverage: none",
      -70,
      "No usable analytical evidence was detected."
    )
  }

  if (input.evidenceCoverage === "low") {
    addPenalty(
      "Evidence coverage: low",
      -45,
      "Only minimal usable evidence was detected."
    )
  }

  if (input.evidenceCoverage === "partial") {
    addPenalty(
      "Evidence coverage: partial",
      -20,
      "Evidence is usable but incomplete."
    )
  }

  if (input.questionFit === "none") {
    addPenalty(
      "Question fit: none",
      -70,
      "The evidence does not answer the question."
    )
  }

  if (input.questionFit === "weak") {
    addPenalty(
      "Question fit: weak",
      -20,
      "The evidence is missing required support for the question."
    )
  }

  if (input.questionFit === "partial") {
    addPenalty(
      "Question fit: partial",
      -10,
      "The evidence only partially supports the question."
    )
  }

  if (input.sourceTraceability === "low") {
    addPenalty(
      "Source traceability: low",
      -30,
      "The interpreted values are not clearly traceable."
    )
  }

  if (input.sourceTraceability === "moderate") {
    addPenalty(
      "Source traceability: moderate",
      -10,
      "The evidence required extraction or repair."
    )
  }

  if (input.weakContextRisk === "high") {
    addPenalty(
      "Weak-context risk: high",
      -45,
      "The system is at high risk of overinterpreting sparse or unstable evidence."
    )
  }

  if (input.weakContextRisk === "medium") {
    addPenalty(
      "Weak-context risk: medium",
      -20,
      "Some evidence is missing or context is incomplete."
    )
  }

  for (const item of input.missingRequiredEvidence) {
    addPenalty(
      `Missing required evidence: ${item}`,
      -15,
      "Required evidence for this question type is missing."
    )
  }

  for (const item of input.missingRecommendedEvidence) {
    addPenalty(
      `Missing recommended evidence: ${item}`,
      -5,
      "Recommended evidence for stronger interpretation is missing."
    )
  }

  const rawScore =
    startingScore + penalties.reduce((sum, penalty) => sum + penalty.value, 0)

  const finalScore = Math.max(0, Math.min(100, rawScore))

  return {
    trustScore: finalScore,
    scoreBreakdown: {
      startingScore,
      penalties,
      finalScore,
    },
  }
}

function buildImprovementRecommendations(input: {
  missingEvidence: string[]
  highConfidenceReasons: string[]
  refusalRecommended: boolean
  deploymentSupported: boolean
  questionType: QuestionType
}): string[] {
  const recommendations: string[] = []

  for (const item of input.missingEvidence) {
    recommendations.push(`Provide ${item} evidence to improve trust scoring.`)
  }

  for (const reason of input.highConfidenceReasons) {
    recommendations.push(reason)
  }

  if (
    input.questionType === "deployment_readiness" &&
    !input.deploymentSupported
  ) {
    recommendations.push(
      "For deployment support, provide validation, calibration, fairness/subgroup analysis, monitoring, and drift assessment evidence."
    )
  }

  if (input.questionType === "causal_claim") {
    recommendations.push(
      "For causal claims, provide causal design, confounder handling, identification strategy, and sensitivity checks."
    )
  }

  if (input.refusalRecommended) {
    recommendations.push(
      "Reduce refusal risk by supplying the required evidence for the selected question type."
    )
  }

  return Array.from(new Set(recommendations))
}

export function buildGovernanceEvaluation(
  input: BuildGovernanceEvaluationInput
): GovernanceEvaluation {
  const normalizedPresentEvidence = normalizePresentEvidence(
    input.presentEvidence
  )

  const questionFitEvaluation = evaluateQuestionFit(
    input.questionType,
    normalizedPresentEvidence
  )

  const questionFit = deriveQuestionFit(
    questionFitEvaluation.hasRequiredEvidence,
    questionFitEvaluation.missingRecommendedEvidence.length
  )

  const missingEvidence = [
    ...questionFitEvaluation.missingRequiredEvidence,
    ...questionFitEvaluation.missingRecommendedEvidence,
  ]

  const governanceWarnings: string[] = []

  if (input.weakContextRisk === "high") {
    governanceWarnings.push("Weak-context risk is high.")
  }

  if (input.evidenceCoverage === "none") {
    governanceWarnings.push("No usable analytical evidence was detected.")
  }

  if (!questionFitEvaluation.hasRequiredEvidence) {
    governanceWarnings.push(
      "Required evidence is missing for the selected question type."
    )
  }

  const confidenceDrivers: string[] = []

  if (input.evidenceCoverage === "strong") {
    confidenceDrivers.push("Strong evidence coverage detected.")
  }

  if (questionFit === "strong") {
    confidenceDrivers.push("Evidence strongly fits the question type.")
  }

  if (input.sourceTraceability === "high") {
    confidenceDrivers.push("Source traceability is high.")
  }

  if (normalizedPresentEvidence.includes("performance_metrics")) {
    confidenceDrivers.push("Performance metrics were detected.")
  }

  const unsupportedClaims: string[] = []

  if (
    input.questionType === "deployment_readiness" &&
    missingEvidence.length > 0
  ) {
    unsupportedClaims.push(
      "Deployment readiness cannot be supported without validation, calibration, fairness, monitoring, and drift evidence."
    )
  }

  if (input.questionType === "causal_claim" && missingEvidence.length > 0) {
    unsupportedClaims.push(
      "Causal claims cannot be supported without causal design and confounder controls."
    )
  }

  const { trustScore, scoreBreakdown } = calculateTrustScoreWithBreakdown({
    evidenceCoverage: input.evidenceCoverage,
    questionFit,
    sourceTraceability: input.sourceTraceability,
    weakContextRisk: input.weakContextRisk,
    missingRequiredEvidence: questionFitEvaluation.missingRequiredEvidence,
    missingRecommendedEvidence: questionFitEvaluation.missingRecommendedEvidence,
  })

  const preliminaryEvaluation: GovernanceEvaluation = {
    evidenceCoverage: input.evidenceCoverage,
    sourceTraceability: input.sourceTraceability,
    questionFit,
    weakContextRisk: input.weakContextRisk,

    trustScore,
    trustBand: getTrustBand(trustScore),
    scoreBreakdown,
    scoreAdjustments: [],

    highConfidenceStatus: {
      qualifiesForHighConfidence: false,
      capApplied: false,
      reasons: [],
    },

    refusalRecommended: false,
    humanReviewRequired: false,
    deploymentSupported: false,

    missingEvidence,
    unsupportedClaims,
    governanceWarnings,
    confidenceDrivers,
    improvementRecommendations: [],
  }

  const highConfidenceQualification = applyHighConfidenceRules({
    questionType: input.questionType,
    evaluation: preliminaryEvaluation,
    presentEvidence: normalizedPresentEvidence,
  })

  const adjustedTrustScore = highConfidenceQualification.cappedScore

  const scoreAdjustments = highConfidenceQualification.capApplied
    ? [
        {
          type: "high_confidence_cap" as const,
          from: trustScore,
          to: adjustedTrustScore,
          reason: highConfidenceQualification.reasons.join(" "),
        },
      ]
    : []

  const adjustedEvaluation: GovernanceEvaluation = {
    ...preliminaryEvaluation,
    trustScore: adjustedTrustScore,
    trustBand: getTrustBand(adjustedTrustScore),
    scoreBreakdown: {
      ...preliminaryEvaluation.scoreBreakdown,
      finalScore: adjustedTrustScore,
    },
    scoreAdjustments,
    highConfidenceStatus: {
      qualifiesForHighConfidence:
        highConfidenceQualification.qualifiesForHighConfidence,
      capApplied: highConfidenceQualification.capApplied,
      reasons: highConfidenceQualification.reasons,
    },
  }

  const refusalRecommended = shouldRefuse(adjustedEvaluation)

  const deploymentSupported =
    input.questionType === "deployment_readiness" &&
    supportsDeployment(adjustedEvaluation)

  const improvementRecommendations = buildImprovementRecommendations({
    missingEvidence,
    highConfidenceReasons: highConfidenceQualification.reasons,
    refusalRecommended,
    deploymentSupported,
    questionType: input.questionType,
  })

  return {
    ...adjustedEvaluation,
    refusalRecommended,
    deploymentSupported,
    humanReviewRequired:
      refusalRecommended ||
      input.weakContextRisk !== "low" ||
      input.evidenceCoverage !== "strong",
    improvementRecommendations,
  }
}