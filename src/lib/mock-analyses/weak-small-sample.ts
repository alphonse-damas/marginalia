// src/lib/mock-analyses/weak-small-sample.ts

export const weakSmallSample = {
  id: "weak-small-sample-001",

  title: "Small Sample Logistic Regression Model",

  question: {
    primary: "Which factors best predict program completion?",

    intent: "explain",

    stakes: "medium",

    requiredEvidence: [
      "Model summary",
      "Predictor table",
      "Confidence intervals",
      "Model performance metrics",
      "Sample size information",
    ],

    answerability: "partially_answerable",

    alignment:
      "The output can suggest possible associations, but the small sample and unstable intervals weaken confidence in the answer.",
  },

  model: {
    type: "Logistic Regression",

    target: "COMPLETION",

    targetDescription: "1 = Completed",

    observations: 42,

    auc: 0.61,

    accuracy: 0.62,

    aic: 88.4,
  },

  predictors: [
    {
      variable: "Prior GPA",

      oddsRatio: 1.42,

      confidenceInterval: [0.72, 2.91],

      interpretation:
        "Prior GPA may be positively associated with completion, but the interval is wide and includes weak evidence.",

      strength: "Low",
    },

    {
      variable: "Attendance Rate",

      oddsRatio: 1.18,

      confidenceInterval: [0.98, 1.67],

      interpretation:
        "Attendance shows a possible positive association, but the evidence is not strong enough to treat as reliable.",

      strength: "Low-Medium",
    },

    {
      variable: "Advisor Contact",

      oddsRatio: 2.65,

      confidenceInterval: [0.81, 8.92],

      interpretation:
        "Advisor contact has a large estimated effect, but the wide interval suggests instability.",

      strength: "Unstable",
    },
  ],

  evidence: [
    {
      id: "ev-101",

      label: "Model Summary",

      status: "available",

      sourceType: "Statistical Output",
    },

    {
      id: "ev-102",

      label: "Predictor Table",

      status: "available",

      sourceType: "Model Output",
    },

    {
      id: "ev-103",

      label: "Sample Size",

      status: "available",

      sourceType: "Model Metadata",
    },

    {
      id: "ev-104",

      label: "Validation Output",

      status: "missing",

      sourceType: "Performance Output",
    },
  ],

  trust: {
    score: 58,

    label: "Caution",

    evidenceCoverage: "Partial",

    sourceTraceability: "Available",

    weakContextRisk: "Medium-High",

    refusalNeeded: false,
  },

  interpretation: {
    summary:
      "The model provides a limited association-based view of possible completion predictors, but the small sample size and wide confidence intervals reduce confidence.",

    takeaways: [
      "The output may help generate hypotheses, not firm conclusions.",

      "Advisor contact appears promising but is statistically unstable.",

      "Attendance may matter, but additional evidence is needed.",

      "The model should not be used for operational decisions without validation.",
    ],

    caveats: [
      "Small sample size limits reliability.",

      "Several confidence intervals are wide or inconclusive.",

      "Validation evidence is missing.",

      "The system should avoid overstating predictor importance.",
    ],
  },

  evidenceObjects: [
    "Model Summary",
    "Predictor Table",
    "Sample Size",
    "Validation Output",
  ],

  evidenceGaps: [
    "Larger sample size is needed.",

    "Independent validation output is missing.",

    "Confidence intervals should be narrowed through additional data.",

    "Stability testing should be performed before operational use.",
  ],

  reasoningTrace: [
    "Parsed model output into structured artifacts.",

    "Detected low sample size.",

    "Checked predictor intervals for instability.",

    "Flagged missing validation evidence.",

    "Reduced trust score because the evidence only partially answers the question.",
  ],
}