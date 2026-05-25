// src/lib/governance/governance-semantics-v1.ts

import { ScoreAdjustment } from "./score-adjustments";

// ======================================================
// Governance Types
// ======================================================

export type EvidenceCoverage =
  | "none"
  | "low"
  | "partial"
  | "strong";

export type SourceTraceability =
  | "low"
  | "moderate"
  | "high";

export type QuestionFit =
  | "none"
  | "weak"
  | "partial"
  | "strong";

export type WeakContextRisk =
  | "low"
  | "medium"
  | "high";

export type TrustBand =
  | "insufficient"
  | "weak"
  | "caution"
  | "strong"
  | "high-confidence";

// ======================================================
// Score Breakdown
// ======================================================

export type ScorePenalty = {
  label: string;
  value: number;
  reason: string;
};

export type ScoreBreakdown = {
  startingScore: number;
  penalties: ScorePenalty[];
  finalScore: number;
};

// ======================================================
// High Confidence Status
// ======================================================

export type HighConfidenceStatus = {
  qualifiesForHighConfidence: boolean;
  capApplied: boolean;
  reasons: string[];
};

// ======================================================
// Governance Evaluation Object
// ======================================================

export type GovernanceEvaluation = {
  evidenceCoverage: EvidenceCoverage;
  sourceTraceability: SourceTraceability;
  questionFit: QuestionFit;
  weakContextRisk: WeakContextRisk;

  trustScore: number;
  trustBand: TrustBand;

  scoreBreakdown: ScoreBreakdown;

  scoreAdjustments: ScoreAdjustment[];

  highConfidenceStatus: HighConfidenceStatus;

  refusalRecommended: boolean;
  humanReviewRequired: boolean;
  deploymentSupported: boolean;

  missingEvidence: string[];
  unsupportedClaims: string[];
  governanceWarnings: string[];
  confidenceDrivers: string[];

  improvementRecommendations: string[];
};

// ======================================================
// Governance Functions
// ======================================================

export function getTrustBand(score: number): TrustBand {
  if (score <= 24) return "insufficient";

  if (score <= 49) return "weak";

  if (score <= 74) return "caution";

  if (score <= 89) return "strong";

  return "high-confidence";
}

export function shouldRefuse(
  evaluation: GovernanceEvaluation
): boolean {
  return (
    evaluation.evidenceCoverage === "none" ||
    evaluation.questionFit === "none" ||
    evaluation.weakContextRisk === "high" ||
    evaluation.unsupportedClaims.length > 0
  );
}

export function supportsDeployment(
  evaluation: GovernanceEvaluation
): boolean {
  return (
    evaluation.evidenceCoverage === "strong" &&
    evaluation.questionFit === "strong" &&
    evaluation.weakContextRisk === "low" &&
    evaluation.sourceTraceability !== "low" &&
    evaluation.missingEvidence.length === 0
  );
}