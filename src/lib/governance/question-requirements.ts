// src/lib/governance/question-requirements.ts

// ======================================================
// Question Types
// ======================================================

export type QuestionType =
  | "predictor_importance"
  | "predictive_quality"
  | "deployment_readiness"
  | "causal_claim"
  | "generalization"
  | "fairness"
  | "calibration"
  | "model_fit"
  | "descriptive_summary";

// ======================================================
// Evidence Requirements
// ======================================================

export type EvidenceRequirement = {
  required: string[];
  recommended?: string[];
  refusalTriggers?: string[];
};

// ======================================================
// Question Requirement Registry
// ======================================================

export const QUESTION_REQUIREMENTS: Record<QuestionType, EvidenceRequirement> = {
  predictor_importance: {
    required: ["predictor_estimates", "p_values"],
    recommended: ["confidence_intervals", "odds_ratios"],
  },

  predictive_quality: {
    required: ["performance_metrics"],
    recommended: ["auc", "validation"],
  },

  deployment_readiness: {
    required: ["validation", "performance_metrics"],
    recommended: [
      "calibration",
      "fairness_analysis",
      "monitoring_plan",
      "drift_assessment",
    ],
    refusalTriggers: ["missing_validation"],
  },

  causal_claim: {
    required: ["causal_design", "confounder_controls"],
    refusalTriggers: ["observational_only"],
  },

  generalization: {
    required: ["validation"],
    recommended: ["external_validation", "holdout_testing"],
  },

  fairness: {
    required: ["subgroup_analysis"],
    recommended: ["bias_assessment"],
  },

  calibration: {
    required: ["calibration_metrics"],
  },

  model_fit: {
    required: ["model_fit_statistics"],
  },

  descriptive_summary: {
    required: [],
  },
};