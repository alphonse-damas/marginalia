import { NextResponse } from "next/server"

export async function GET() {
  const mockArtifact = {
    id: "csv-artifact-demo",
    metadata: {
      title: "Canonical CSV Evidence Artifact",
      sourceType: "spreadsheet",
      modelType: "logistic_regression",
      generatedAt: new Date().toISOString(),
    },

    question: {
      primary: "Which factors predict admission?",
      intent: "predictive",
      stakes: "medium",
      answerability: "partially_answerable",
    },

    model: {
      family: "logistic_regression",
      target: "ADMIT",
      observations: 400,
      predictors: 5,
    },

    performance: {
      auc: 0.7,
      overallPercentCorrect: 75.8,
    },

    predictors: [
      {
        name: "GRE",
        oddsRatio: 1.002,
        pValue: 0.0387,
        significance: "moderate",
      },
      {
        name: "GPA",
        oddsRatio: 2.235,
        pValue: 0.0154,
        significance: "moderate",
      },
      {
        name: "RANK 2",
        oddsRatio: 0.509,
        pValue: 0.0329,
        significance: "moderate",
      },
      {
        name: "RANK 3",
        oddsRatio: 0.262,
        pValue: 0.0001,
        significance: "strong",
      },
      {
        name: "RANK 4",
        oddsRatio: 0.212,
        pValue: 0.0002,
        significance: "strong",
      },
    ],

    trust: {
      score: 75,
      label: "Strong",
      evidenceCoverage: "partial",
      sourceTraceability: "available",
      weakContextRisk: "low-medium",
      refusalNeeded: false,
    },

    governance: {
      causalClaimSupported: false,
      deploymentSupported: false,
      highStakesUseSupported: false,
      requiresHumanReview: true,
    },

    evidenceObjects: [
      "Canonical Model Metrics CSV",
      "Canonical Predictor Metrics CSV",
    ],

    reasoningTrace: [
      "Loaded canonical model CSV.",
      "Loaded canonical predictor CSV.",
      "Mapped deterministic CSV fields into AnalysisArtifact.",
      "Evaluated evidence coverage and governance state.",
    ],

    interpretation: {
      summary:
        "Canonical CSV evidence was normalized into the Marginalia AnalysisArtifact schema.",
      takeaways: [
        "Structured model-level metrics were loaded deterministically.",
        "Structured predictor-level metrics were loaded deterministically.",
        "No LLM extraction was required.",
      ],
      caveats: [
        "Validation output is missing.",
      ],
    },
  }

  return NextResponse.json(mockArtifact)
}