// experiments/governance/governance-demo.ts

import { buildGovernanceEvaluation } from "../../src/lib/governance/build-governance-evaluation";

const demos = {
  deploymentReadinessMissingGovernance: buildGovernanceEvaluation({
    questionType: "deployment_readiness",
    presentEvidence: ["performance_metrics", "predictor_estimates", "p_values"],
    evidenceCoverage: "partial",
    sourceTraceability: "moderate",
    weakContextRisk: "medium",
  }),

  strongPredictorInterpretation: buildGovernanceEvaluation({
    questionType: "predictor_importance",
    presentEvidence: [
      "predictor_estimates",
      "p_values",
      "confidence_intervals",
      "odds_ratios",
    ],
    evidenceCoverage: "strong",
    sourceTraceability: "high",
    weakContextRisk: "low",
  }),

  causalClaimWithoutCausalEvidence: buildGovernanceEvaluation({
    questionType: "causal_claim",
    presentEvidence: ["predictor_estimates", "p_values", "performance_metrics"],
    evidenceCoverage: "partial",
    sourceTraceability: "moderate",
    weakContextRisk: "high",
  }),

  descriptiveSummaryMinimalEvidence: buildGovernanceEvaluation({
    questionType: "descriptive_summary",
    presentEvidence: ["model_fit_statistics"],
    evidenceCoverage: "low",
    sourceTraceability: "moderate",
    weakContextRisk: "medium",
  }),
};

console.log(JSON.stringify(demos, null, 2));