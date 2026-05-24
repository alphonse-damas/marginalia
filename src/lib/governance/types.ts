export type EvidenceCoverage =
  | "none"
  | "low"
  | "partial"
  | "strong"

export type SourceTraceability =
  | "low"
  | "moderate"
  | "high"

export type QuestionFit =
  | "none"
  | "weak"
  | "partial"
  | "strong"

export type WeakContextRisk =
  | "low"
  | "medium"
  | "high"

export type TrustLabel =
  | "Insufficient"
  | "Weak"
  | "Caution"
  | "Strong"
  | "High Confidence"

export type GovernanceEvaluation = {
  evidenceCoverage: EvidenceCoverage
  sourceTraceability: SourceTraceability
  questionFit: QuestionFit
  weakContextRisk: WeakContextRisk

  trustScore: number
  trustLabel: TrustLabel

  refusalRecommended: boolean
  requiresHumanReview: boolean
  deploymentSupported: boolean
  highStakesUseSupported: boolean | null
  causalClaimSupported: boolean | null

  missingEvidence: string[]
  governanceFlags: string[]
  trustRationale: string[]
}