// src/lib/mock-analyses/refusal-example.ts

export const refusalExample = {
  id: "refusal-example-001",

  title: "Admissions Regression Used for Causal Decision Claim",

  question: {
    primary:
      "Does GPA cause admission, and should we use this model to automate admissions decisions?",

    intent: "causal",

    stakes: "high",

    requiredEvidence: [
      "Research design evidence",
      "Causal identification strategy",
      "Bias and fairness audit",
      "External validation",
      "Deployment risk assessment",
      "Policy approval evidence",
    ],

    answerability: "not_answerable",

    alignment:
      "The uploaded regression output does not provide enough evidence to answer a causal or high-stakes automation question.",
  },

  model: {
    type: "Logistic Regression",

    target: "ADMIT",

    targetDescription: "1 = Event",

    observations: 400,

    auc: 0.693,

    accuracy: 0.693,

    aic: 470.517,
  },

  predictors: [
    {
      variable: "GPA",

      oddsRatio: 2.235,

      confidenceInterval: [1.166, 4.282],

      interpretation:
        "GPA is associated with admission in this model, but this does not establish causality.",

      strength: "Association Only",
    },

    {
      variable: "GRE",

      oddsRatio: 1.002,

      confidenceInterval: [1.0, 1.004],

      interpretation:
        "GRE has a small association, but the output does not justify automated decision use.",

      strength: "Low",
    },
  ],

  evidence: [
    {
      id: "ev-201",

      label: "Model Summary",

      status: "available",

      sourceType: "Statistical Output",
    },

    {
      id: "ev-202",

      label: "Odds Ratio Table",

      status: "available",

      sourceType: "Model Output",
    },

    {
      id: "ev-203",

      label: "Causal Identification Strategy",

      status: "missing",

      sourceType: "Research Design Evidence",
    },

    {
      id: "ev-204",

      label: "Fairness Audit",

      status: "missing",

      sourceType: "Governance Evidence",
    },

    {
      id: "ev-205",

      label: "External Validation",

      status: "missing",

      sourceType: "Validation Evidence",
    },
  ],

  trust: {
    score: 24,

    label: "Insufficient",

    evidenceCoverage: "Low",

    sourceTraceability: "Partial",

    weakContextRisk: "High",

    refusalNeeded: true,
  },

  interpretation: {
    summary:
      "This output is not sufficient to answer the question as asked. The regression can support limited association-based observations, but it cannot establish causality or justify automated admissions decisions.",

    takeaways: [
      "The model output supports association, not causation.",

      "The question requires causal design evidence that is not present.",

      "The question also requires governance evidence, fairness review, validation, and deployment controls.",

      "A refusal or constrained answer is appropriate.",
    ],

    caveats: [
      "Do not describe GPA as causing admission based on this output alone.",

      "Do not recommend automated admissions decisions from this evidence.",

      "Additional causal, fairness, validation, and policy evidence would be required.",
    ],
  },

  evidenceObjects: [
    "Model Summary",
    "Odds Ratio Table",
    "Causal Identification Strategy",
    "Fairness Audit",
    "External Validation",
  ],

  evidenceGaps: [
    "Causal identification strategy is missing.",

    "Fairness and bias audit is missing.",

    "External validation evidence is missing.",

    "Deployment risk assessment is missing.",

    "Policy approval evidence is missing.",
  ],

  reasoningTrace: [
    "Parsed model output into structured artifacts.",

    "Detected that the user question asks for causality and operational deployment.",

    "Compared required evidence against available evidence.",

    "Identified missing causal identification, fairness audit, and validation evidence.",

    "Triggered refusal because the evidence does not support the requested conclusion.",
  ],
}