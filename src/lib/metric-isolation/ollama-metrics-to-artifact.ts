import type { AnalysisArtifact } from "@/lib/artifacts"
import { canonicalizeMetric } from "@/lib/metric-canonicalization/canonicalize-metric"
import type { CanonicalMetric } from "@/lib/metric-canonicalization/types"

import type { ParsedMetricLine } from "./parse-ollama-metric-file"

export function ollamaMetricsToArtifact({
  metrics,
  question,
}: {
  metrics: ParsedMetricLine[]
  question: {
    primary: string
    intent: AnalysisArtifact["question"]["intent"]
    stakes: AnalysisArtifact["question"]["stakes"]
  }
}): AnalysisArtifact {
  const canonicalMetrics = metrics.map((metric) =>
    canonicalizeMetric({
      metricName: metric.metric_name,
      metricValue: metric.metric_value,
    })
  )

  const fixed = buildFixedMetricMap(canonicalMetrics)
  const predictors = buildPredictors(canonicalMetrics)

  const observations =
    getNumber(fixed, "number_of_observations_used") ??
    getNumber(fixed, "number_of_observations_read")

  const missingEvidence = buildMissingEvidence({
    predictorsCount: predictors.length,
    hasValidation: false,
  })

  const refusalRecommended =
    question.intent === "causal" ||
    (question.stakes === "high" && missingEvidence.length >= 2)

  const trustScore = computeTrustScore({
    observations,
    predictorsCount: predictors.length,
    missingEvidenceCount: missingEvidence.length,
    refusalRecommended,
  })

  return {
    id: `ollama-artifact-${Date.now()}`,

    metadata: {
      title: "Ollama-Isolated Metric Artifact",
      sourceEngine: null,
      suspectedFormat: "sas_logistic",
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
        ? "The requested question exceeds what the isolated metrics can safely support."
        : missingEvidence.length > 0
          ? "The isolated metrics partially support the question, but some required evidence is missing."
          : "The isolated metrics support a basic model-level interpretation.",
    },

    model: {
      family: "logistic_regression",
      name: getText(fixed, "model"),
      target:
        getText(fixed, "response_variable") ??
        extractTargetFromProbability(getText(fixed, "probability_modeled")),
      targetType: "binary",
      predictors: predictors.map((predictor) => predictor.name),
    },

    data: {
      observations,
      trainingRows: null,
      validationRows: null,
      testRows: null,
      missingnessReported: null,
      classBalanceReported: true,
    },

    metrics: {
      modelFit: {
        interceptOnly: {
          aic: getNumber(fixed, "aic_intercept_only"),
          bic: getNumber(fixed, "bic_intercept_only"),
          minus2LogLikelihood: getNumber(
            fixed,
            "minus2_log_l_intercept_only"
          ),
        },

        fullModel: {
          aic: getNumber(fixed, "aic_full_model"),
          bic: getNumber(fixed, "bic_full_model"),
          minus2LogLikelihood: getNumber(
            fixed,
            "minus2_log_l_full_model"
          ),
        },

        additional: {
          convergenceStatus: getText(fixed, "convergence_status"),
        },
      },

      performance: {
        auc: null,
        accuracy: null,
        precision: null,
        recall: null,
        f1: null,
        rmse: null,
        mae: null,
        pseudoRSquared: getNumber(fixed, "pseudo_r_squared"),
        additional: {},
      },

      significanceTests: {
        likelihoodRatio: {
          chiSquare: getNumber(fixed, "likelihood_ratio_chi_square"),
          df: getNumber(fixed, "likelihood_ratio_df"),
          pValue: getText(fixed, "likelihood_ratio_p_value"),
        },

        score: {
          chiSquare: getNumber(fixed, "score_chi_square"),
          df: getNumber(fixed, "score_df"),
          pValue: getText(fixed, "score_p_value"),
        },

        wald: {
          chiSquare: getNumber(fixed, "wald_chi_square"),
          df: getNumber(fixed, "wald_df"),
          pValue: getText(fixed, "wald_p_value"),
        },

        additional: {},
      },
    },

    predictors,

    diagnostics: {
      assumptionsChecked: null,
      multicollinearityChecked: null,
      residualsChecked: null,
      calibrationChecked: null,
      validationPerformed: false,
      driftChecked: false,
      fairnessChecked: false,
      additional: {
        convergenceStatus: getText(fixed, "convergence_status"),
      },
    },

    evidence: [
      {
        id: "ev-ollama-isolated-metrics",
        label: "Ollama Isolated Metrics",
        status: "available",
        sourceType: "model_summary",
      },
      {
        id: "ev-model-fit",
        label: "Model Fit Statistics",
        status:
          getNumber(fixed, "aic_full_model") !== null ||
          getNumber(fixed, "minus2_log_l_full_model") !== null
            ? "available"
            : "missing",
        sourceType: "performance_metric",
      },
      {
        id: "ev-global-tests",
        label: "Global Significance Tests",
        status:
          getNumber(fixed, "likelihood_ratio_chi_square") !== null
            ? "available"
            : "missing",
        sourceType: "diagnostic",
      },
      {
        id: "ev-predictors",
        label: "Predictor-Level Estimates",
        status: predictors.length > 0 ? "available" : "missing",
        sourceType: "coefficient_table",
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
        "The Ollama-isolated metric file was canonicalized and normalized into the Marginalia AnalysisArtifact schema.",
      takeaways: [
        "Model fit statistics were detected.",
        "Global model significance tests were detected.",
        predictors.length > 0
          ? "Predictor-level estimates and odds ratios were detected."
          : "Predictor-level evidence was not detected.",
      ],
      caveats: missingEvidence,
    },

    warnings: [],

    reasoningTrace: [
      "Loaded saved Ollama-isolated metric file.",
      "Parsed clean metric lines.",
      "Canonicalized fixed model metrics and dynamic predictor metrics.",
      "Mapped canonical metrics into normalized AnalysisArtifact fields.",
      "Evaluated missing evidence and trust state.",
    ],
  }
}

function buildFixedMetricMap(canonicalMetrics: CanonicalMetric[]) {
  return canonicalMetrics.reduce<Record<string, string>>((acc, metric) => {
    if (metric.kind === "fixed_model_metric") {
      acc[metric.key] = metric.rawValue
    }

    return acc
  }, {})
}

function buildPredictors(
  canonicalMetrics: CanonicalMetric[]
): AnalysisArtifact["predictors"] {
  const grouped = new Map<string, Record<string, string>>()

  for (const metric of canonicalMetrics) {
    if (metric.kind !== "predictor_metric") {
      continue
    }

    const current = grouped.get(metric.predictorName) ?? {}
    current[metric.metricType] = metric.rawValue
    grouped.set(metric.predictorName, current)
  }

  return Array.from(grouped.entries()).map(([name, values]) => {
    const estimate = parseNumber(values.estimate)
    const pValue = parseNumber(values.p_value)
    const lower = parseNumber(values.confidence_lower)
    const upper = parseNumber(values.confidence_upper)

    return {
      name,
      estimate,
      standardError: parseNumber(values.standard_error),
      pValue,
      testStatistic:
        parseNumber(values.wald_chi_square) ??
        parseNumber(values.z) ??
        parseNumber(values.t),
      testStatisticType: values.wald_chi_square
        ? "chi_square"
        : values.z
          ? "z"
          : values.t
            ? "t"
            : "unknown",
      oddsRatio: parseNumber(values.odds_ratio),
      confidenceInterval:
        lower !== null && upper !== null ? [lower, upper] : null,
      effectDirection:
        estimate === null
          ? "unknown"
          : estimate > 0
            ? "positive"
            : estimate < 0
              ? "negative"
              : "neutral",
      significance:
        pValue === null
          ? "unknown"
          : pValue < 0.01
            ? "strong"
            : pValue < 0.05
              ? "moderate"
              : pValue < 0.1
                ? "weak"
                : "not_significant",
      interpretation:
        "Predictor extracted from canonicalized Ollama-isolated metrics.",
      additionalMetrics: {
        df: parseNumber(values.df),
      },
    }
  })
}

function getText(
  fixed: Record<string, string>,
  key: string
): string | null {
  return fixed[key] ?? null
}

function getNumber(
  fixed: Record<string, string>,
  key: string
): number | null {
  return parseNumber(fixed[key])
}

function parseNumber(value: string | undefined): number | null {
  if (!value) {
    return null
  }

  const parsed = Number(value.replace(/[,%]/g, ""))

  return Number.isFinite(parsed) ? parsed : null
}

function extractTargetFromProbability(
  probabilityModeled: string | null
): string | null {
  if (!probabilityModeled) {
    return null
  }

  const match = probabilityModeled.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/)

  return match?.[1] ?? null
}

function buildMissingEvidence({
  predictorsCount,
  hasValidation,
}: {
  predictorsCount: number
  hasValidation: boolean
}) {
  const missing: string[] = []

  if (predictorsCount === 0) {
    missing.push(
      "Predictor-level odds ratios or coefficient table is missing."
    )
  }

  if (!hasValidation) {
    missing.push("Validation output is missing.")
  }

  return missing
}

function computeTrustScore({
  observations,
  predictorsCount,
  missingEvidenceCount,
  refusalRecommended,
}: {
  observations: number | null
  predictorsCount: number
  missingEvidenceCount: number
  refusalRecommended: boolean
}) {
  let score = 85

  if (!observations) score -= 15
  if (observations !== null && observations < 100) score -= 15
  if (predictorsCount === 0) score -= 15
  score -= missingEvidenceCount * 7
  if (refusalRecommended) score -= 25

  return Math.max(0, Math.min(100, score))
}