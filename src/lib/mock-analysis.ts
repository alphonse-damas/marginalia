export const mockAnalysis = {
  id: "analysis-logistic-risk-001",

  title: "Logistic Regression Risk Model",

  question: {
  primary: "Which factors best predict admission?",
  intent: "predictive",
  stakes: "medium",
  requiredEvidence: [
    "Model summary",
    "Predictor table",
    "Odds ratios",
    "Confidence intervals",
    "Model performance metrics",
  ],
  answerability: "answerable",
  alignment:
    "The uploaded logistic regression output directly supports an association-based explanation of admission predictors.",
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
      variable: "GRE",
      oddsRatio: 1.002,
      confidenceInterval: [1.0, 1.004],
      interpretation:
        "GRE has a small positive association with the outcome, but its practical effect appears limited.",
      strength: "Low",
    },
    {
      variable: "GPA",
      oddsRatio: 2.235,
      confidenceInterval: [1.166, 4.282],
      interpretation:
        "GPA has a meaningful positive association with the outcome.",
      strength: "High",
    },
    {
      variable: "RANK 1 vs 4",
      oddsRatio: 4.718,
      confidenceInterval: [2.08, 10.701],
      interpretation:
        "Rank 1 compared with Rank 4 shows the strongest observed effect.",
      strength: "High",
    },
    {
      variable: "RANK 2 vs 4",
      oddsRatio: 2.401,
      confidenceInterval: [1.17, 4.927],
      interpretation:
        "Rank 2 compared with Rank 4 shows a meaningful positive association.",
      strength: "Medium",
    },
    {
      variable: "RANK 3 vs 4",
      oddsRatio: 1.235,
      confidenceInterval: [0.572, 2.668],
      interpretation:
        "Rank 3 compared with Rank 4 is not clearly distinguishable from no effect based on this interval.",
      strength: "Low",
    },
  ],

  evidence: [
    {
      id: "ev-001",
      label: "Model Summary",
      status: "available",
      sourceType: "Statistical Output",
    },
    {
      id: "ev-002",
      label: "Odds Ratio Table",
      status: "available",
      sourceType: "Model Output",
    },
    {
      id: "ev-003",
      label: "ROC/AUC Metrics",
      status: "available",
      sourceType: "Performance Output",
    },
    {
      id: "ev-004",
      label: "Predictor Significance Table",
      status: "available",
      sourceType: "Statistical Output",
    },
  ],

  trust: {
    score: 87,
    level: "Strong",
    evidenceCoverage: "High",
    sourceTraceability: "Available",
    weakContextRisk: "Low-Medium",
    refusalNeeded: false,
  },

  interpretation: {
    summary:
      "The model shows moderate predictive strength. GPA and rank appear to be stronger predictors than GRE based on odds ratios and confidence intervals.",

    takeaways: [
      "GPA has a meaningful positive association with admission.",
      "Rank 1 vs. Rank 4 has the strongest observed effect.",
      "GRE has a smaller effect and should not be overemphasized.",
      "Model performance is acceptable for explanation, but not strong enough for high-stakes automated decisions.",
    ],

    caveats: [
      "This output supports association-based interpretation, not causal claims.",
      "The model should not be used alone for high-stakes automated decisions.",
      "Additional validation would be needed before operational deployment.",
    ],
  },

  reasoningTrace: [
    "Parsed model output into structured artifacts.",
    "Identified target variable and model family.",
    "Compared predictors by effect size and confidence interval.",
    "Flagged interpretation caveats and weak-context risks.",
  ],
}