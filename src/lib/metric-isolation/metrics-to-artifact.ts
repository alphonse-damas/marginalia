import type { AnalysisArtifact } from "@/lib/artifacts"

import {
  getMetricNumber,
  getMetricText,
  type IsolatedMetricMap,
} from "./parse-isolated-metrics"

type MetricsToArtifactInput = {
  metrics: IsolatedMetricMap
  question: {
    primary: string
    intent: AnalysisArtifact["question"]["intent"]
    stakes: AnalysisArtifact["question"]["stakes"]
  }
}

export function metricsToArtifact({
  metrics,
  question,
}: MetricsToArtifactInput): AnalysisArtifact {
  const observations =
    getMetricNumber(metrics, "Observations Used") ??
    getMetricNumber(metrics, "Number of Observations Used")

  const target =
    getMetricText(metrics, "Response Variable") ??
    extractModeledVariable(getMetricText(metrics, "Probability Modeled"))

  const missingEvidence = buildMissingEvidence(metrics)

  const refusalRecommended =
    question.intent === "causal" ||
    (question.stakes === "high" && missingEvidence.length >= 2)

  const trustScore = computeTrustScore({
    observations,
    missingEvidenceCount: missingEvidence.length,
    refusalRecommended,
  })

  return {
    id: `artifact-${Date.now()}`,

    metadata: {
      title: "Normalized Regression Artifact",
      sourceEngine: null,
      suspectedFormat: null,
      sourceType: "raw_text",
      extractedAt: new Date().toISOString(),
    },

    question: {
      primary: question.primary,
      intent: question.intent,
      stakes: question.stakes,
      answerability: refusalRecommended
        ? "not_answerable"
        : missingEvidence.length > 0
          ? "partially_answerable"
          : "answerable",
      alignment: refusalRecommended
        ? "The question asks for a conclusion that the available metrics cannot safely support."
        : missingEvidence.length > 0
          ? "The isolated metrics partially support the question, but some required evidence is missing."
          : "The isolated metrics support a basic association-based interpretation.",
    },

    model: {
      family: "logistic_regression",
      name: getMetricText(metrics, "Model"),
      target,
      targetType: "binary",
      predictors: [],
    },

    data: {
      observations,
      trainingRows: null,
      validationRows: null,
      testRows: null,
      missingnessReported: null,
      classBalanceReported:
        getMetricText(metrics, "honcomp = 1 Frequency") !== null ||
        getMetricText(metrics, "honcomp = 0 Frequency") !== null,
    },

    metrics: {
      modelFit: {
        interceptOnly: {
          aic: getMetricNumber(metrics, "AIC (Intercept Only)"),
          bic:
            getMetricNumber(metrics, "SC/BIC (Intercept Only)") ??
            getMetricNumber(metrics, "SC (Intercept Only)"),
          minus2LogLikelihood:
            getMetricNumber(metrics, "-2 Log Likelihood (Intercept Only)") ??
            getMetricNumber(metrics, "-2 Log L (Intercept Only)"),
        },

        fullModel: {
          aic:
            getMetricNumber(metrics, "AIC (Full Model)") ??
            getMetricNumber(metrics, "AIC (Covariates)"),
          bic:
            getMetricNumber(metrics, "SC/BIC (Full Model)") ??
            getMetricNumber(metrics, "SC (Covariates)"),
          minus2LogLikelihood:
            getMetricNumber(metrics, "-2 Log Likelihood (Full Model)") ??
            getMetricNumber(metrics, "-2 Log L (Covariates)"),
        },
      },

      performance: {
        auc: getMetricNumber(metrics, "AUC"),
        accuracy: getMetricNumber(metrics, "Accuracy"),
        precision: null,
        recall: null,
        f1: null,
        rmse: null,
        mae: null,
      },

      significanceTests: {
        likelihoodRatio: {
          chiSquare: getMetricNumber(metrics, "Likelihood Ratio Chi-Square"),
          df: getMetricNumber(metrics, "Likelihood Ratio DF"),
          pValue: getMetricText(metrics, "Likelihood Ratio p-value"),
        },

        score: {
          chiSquare: getMetricNumber(metrics, "Score Chi-Square"),
          df: getMetricNumber(metrics, "Score DF"),
          pValue: getMetricText(metrics, "Score p-value"),
        },

        wald: {
          chiSquare: getMetricNumber(metrics, "Wald Chi-Square"),
          df: getMetricNumber(metrics, "Wald DF"),
          pValue: getMetricText(metrics, "Wald p-value"),
        },
      },
    },

    predictors: [],

    diagnostics: {
      assumptionsChecked: null,
      multicollinearityChecked: null,
      residualsChecked: null,
      calibrationChecked: null,
      validationPerformed: false,
      driftChecked: false,
      fairnessChecked: false,
    },

    evidence: [
      {
        id: "ev-metric-list",
        label: "Isolated Metric List",
        status: "available",
        sourceType: "model_summary",
      },
      {
        id: "ev-model-fit",
        label: "Model Fit Statistics",
        status:
          getMetricNumber(metrics, "AIC (Full Model)") !== null ||
          getMetricNumber(metrics, "AIC (Covariates)") !== null
            ? "available"
            : "missing",
        sourceType: "performance_metric",
      },
      {
        id: "ev-global-tests",
        label: "Global Significance Tests",
        status:
          getMetricNumber(metrics, "Likelihood Ratio Chi-Square") !== null
            ? "available"
            : "missing",
        sourceType: "diagnostic",
      },
    ],

    missingEvidence,

    governance: {
      causalClaimSupported: question.intent === "causal" ? false : null,
      deploymentSupported: false,
      highStakesUseSupported: question.stakes === "high" ? false : null,
      requiresHumanReview: question.stakes === "high" || trustScore < 70,
      refusalRecommended,
    },

    trust: {
      score: trustScore,
      label:
        trustScore >= 80
          ? "Strong"
          : trustScore >= 60
            ? "Caution"
            : trustScore >= 40
              ? "Weak"
              : "Insufficient",
      evidenceCoverage:
        missingEvidence.length === 0
          ? "High"
          : missingEvidence.length <= 2
            ? "Partial"
            : "Low",
      sourceTraceability: "Available",
      weakContextRisk:
        refusalRecommended
          ? "High"
          : missingEvidence.length >= 3
            ? "Medium-High"
            : missingEvidence.length >= 1
              ? "Medium"
              : "Low-Medium",
      refusalNeeded: refusalRecommended,
    },

    interpretation: {
      summary:
        "The isolated metrics were mapped into a normalized regression artifact for trust evaluation.",
      takeaways: [
        "Model-level fit statistics were preserved where available.",
        "Global significance tests were preserved where available.",
        missingEvidence.length > 0
          ? "Some evidence required for deeper interpretation is missing."
          : "The metric list supports basic model-level interpretation.",
      ],
      caveats: missingEvidence,
    },

    reasoningTrace: [
      "Received isolated metric list.",
      "Mapped metric names into normalized artifact fields.",
      "Preserved comparison structure for intercept-only and full-model statistics.",
      "Evaluated missing evidence.",
      "Prepared artifact for validation and trust scoring.",
    ],
  }
}

function extractModeledVariable(
  probabilityModeled: string | null
): string | null {
  if (!probabilityModeled) return null

  const match = probabilityModeled.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/)

  return match?.[1] ?? null
}

function buildMissingEvidence(metrics: IsolatedMetricMap): string[] {
  const missing: string[] = []

  const hasPredictorEvidence =
    Object.keys(metrics).some((key) =>
      /odds ratio|coefficient|estimate|parameter/i.test(key)
    )

  if (!hasPredictorEvidence) {
    missing.push("Predictor-level odds ratios or coefficient table is missing.")
  }

  if (
    getMetricNumber(metrics, "AUC") === null &&
    getMetricNumber(metrics, "Accuracy") === null
  ) {
    missing.push("Classification performance metrics are missing.")
  }

  missing.push("Validation output is missing.")

  return missing
}

function computeTrustScore({
  observations,
  missingEvidenceCount,
  refusalRecommended,
}: {
  observations: number | null
  missingEvidenceCount: number
  refusalRecommended: boolean
}) {
  let score = 85

  if (!observations) score -= 15
  if (observations !== null && observations < 100) score -= 15

  score -= missingEvidenceCount * 7

  if (refusalRecommended) score -= 25

  return Math.max(0, Math.min(100, score))
}