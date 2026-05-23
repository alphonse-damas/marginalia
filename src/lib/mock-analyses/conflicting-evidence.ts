// src/lib/mock-analyses/conflicting-evidence.ts

export const conflictingEvidence = {
  id: "conflicting-evidence-001",

  title: "Revenue Forecast Model With Conflicting Evidence",

  question: {
    primary:
      "Should we trust this model to guide next-quarter revenue planning?",

    intent: "decide",

    stakes: "high",

    requiredEvidence: [
      "Model performance metrics",
      "Backtesting results",
      "Recent data validation",
      "Business context notes",
      "Assumption checks",
      "Outlier review",
    ],

    answerability: "partially_answerable",

    alignment:
      "The model output contains useful performance metrics, but conflicting backtesting and recent data drift prevent a fully confident recommendation.",
  },

  model: {
    type: "Revenue Forecast Model",

    target: "NEXT_QUARTER_REVENUE",

    targetDescription: "Projected quarterly revenue",

    observations: 36,

    auc: null,

    accuracy: 0.74,

    aic: null,
  },

  predictors: [
    {
      variable: "Prior Quarter Revenue",

      oddsRatio: null,

      confidenceInterval: [0.61, 0.88],

      interpretation:
        "Historical revenue is predictive, but recent deviations suggest the relationship may be weakening.",

      strength: "Medium",
    },

    {
      variable: "Marketing Spend",

      oddsRatio: null,

      confidenceInterval: [0.12, 0.52],

      interpretation:
        "Marketing spend appears positively related to revenue, but effect estimates vary across time windows.",

      strength: "Medium",
    },

    {
      variable: "Promotion Intensity",

      oddsRatio: null,

      confidenceInterval: [-0.18, 0.41],

      interpretation:
        "Promotion intensity has inconsistent evidence and may be unstable.",

      strength: "Conflicting",
    },
  ],

  evidence: [
    {
      id: "ev-301",

      label: "Model Performance Metrics",

      status: "available",

      sourceType: "Model Output",
    },

    {
      id: "ev-302",

      label: "Backtesting Results",

      status: "available_conflicting",

      sourceType: "Validation Evidence",
    },

    {
      id: "ev-303",

      label: "Recent Data Drift Report",

      status: "available_warning",

      sourceType: "Data Quality Evidence",
    },

    {
      id: "ev-304",

      label: "Business Context Notes",

      status: "missing",

      sourceType: "Planning Context",
    },
  ],

  trust: {
    score: 46,

    label: "Mixed",

    evidenceCoverage: "Partial",

    sourceTraceability: "Available",

    weakContextRisk: "High",

    refusalNeeded: false,
  },

  interpretation: {
    summary:
      "The forecast model provides some useful evidence, but conflicting backtesting results and recent data drift reduce confidence. It may support scenario planning, but should not be the sole basis for next-quarter revenue decisions.",

    takeaways: [
      "The model has moderate apparent performance, but validation evidence is mixed.",

      "Recent data drift suggests the model may not generalize well to the current quarter.",

      "Promotion effects appear unstable across time windows.",

      "Use this output for scenario discussion, not as a single authoritative planning input.",
    ],

    caveats: [
      "Conflicting validation evidence should be resolved before operational reliance.",

      "Recent data drift may weaken the relevance of historical patterns.",

      "Missing business context limits decision usefulness.",

      "A human planning review is recommended before using this forecast.",
    ],
  },

  evidenceObjects: [
    "Model Performance Metrics",
    "Backtesting Results",
    "Recent Data Drift Report",
    "Business Context Notes",
  ],

  evidenceGaps: [
    "Conflicting backtesting results need resolution.",

    "Recent data drift requires investigation.",

    "Business context notes are missing.",

    "Assumption checks should be reviewed.",

    "Outlier review should be completed.",
  ],

  reasoningTrace: [
    "Parsed model and validation evidence into structured artifacts.",

    "Detected conflict between reported performance and backtesting results.",

    "Detected recent data drift warning.",

    "Compared available evidence against the high-stakes planning question.",

    "Reduced trust score and limited the recommendation to scenario planning.",
  ],
}