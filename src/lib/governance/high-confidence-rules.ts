// src/lib/governance/high-confidence-rules.ts

import { GovernanceEvaluation } from "./governance-semantics-v1";
import { QuestionType } from "./question-requirements";

export type HighConfidenceQualification = {
  qualifiesForHighConfidence: boolean;
  capApplied: boolean;
  cappedScore: number;
  reasons: string[];
};

export function applyHighConfidenceRules(input: {
  questionType: QuestionType;
  evaluation: GovernanceEvaluation;
  presentEvidence: string[];
}): HighConfidenceQualification {
  const reasons: string[] = [];

  const hasValidationEvidence =
    input.presentEvidence.includes("validation") ||
    input.presentEvidence.includes("holdout_testing") ||
    input.presentEvidence.includes("external_validation");

  const hasCalibrationEvidence =
    input.presentEvidence.includes("calibration") ||
    input.presentEvidence.includes("calibration_metrics");

  const noMissingEvidence = input.evaluation.missingEvidence.length === 0;

  const lowWeakContextRisk = input.evaluation.weakContextRisk === "low";

  const strongTraceability = input.evaluation.sourceTraceability === "high";

  if (!hasValidationEvidence) {
    reasons.push(
      "High confidence requires validation, holdout testing, or external validation evidence."
    );
  }

  if (
    input.questionType === "deployment_readiness" &&
    !hasCalibrationEvidence
  ) {
    reasons.push("Deployment high confidence requires calibration evidence.");
  }

  if (!noMissingEvidence) {
    reasons.push(
      "High confidence requires no missing required or recommended evidence."
    );
  }

  if (!lowWeakContextRisk) {
    reasons.push("High confidence requires low weak-context risk.");
  }

  if (!strongTraceability) {
    reasons.push("High confidence requires high source traceability.");
  }

  const qualifiesForHighConfidence = reasons.length === 0;

  if (qualifiesForHighConfidence) {
    return {
      qualifiesForHighConfidence: true,
      capApplied: false,
      cappedScore: input.evaluation.trustScore,
      reasons: [],
    };
  }

  const cappedScore =
    input.evaluation.trustScore >= 90 ? 89 : input.evaluation.trustScore;

  return {
    qualifiesForHighConfidence: false,
    capApplied: input.evaluation.trustScore !== cappedScore,
    cappedScore,
    reasons,
  };
}