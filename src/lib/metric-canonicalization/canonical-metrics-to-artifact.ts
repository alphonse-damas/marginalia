import type { AnalysisArtifact } from "@/lib/artifacts"
import type { CanonicalMetric } from "./types"

export function canonicalMetricsToArtifact({
  canonicalMetrics,
  question,
  suspectedFormat,
}: {
  canonicalMetrics: CanonicalMetric[]
  suspectedFormat: string | null
  question: {
    primary: string
    intent: AnalysisArtifact["question"]["intent"]
    stakes: AnalysisArtifact["question"]["stakes"]
  }
}): AnalysisArtifact {
  const fixed = buildFixedMap(canonicalMetrics)
  const predictors = buildPredictors(canonicalMetrics)

  const observations =
    getNumber(fixed, "number_of_observations_used") ??
    getNumber(fixed, "number_of_observations_read")

  const missingEvidence: string[] = []

  if (predictors.length === 0) {
    missingEvidence.push("Predictor-level evidence is missing.")
  }

  if (
    getNumber(fixed, "auc") === null &&
    getNumber(fixed, "c_statistic") === null
  ) {
    missingEvidence.push("ROC/AUC evidence is missing.")
  }

  missingEvidence.push("Validation output is missing.")

  const trustScore = Math.max(0, 85 - missingEvidence.length * 7)

  const aucInterval =
    getNumber(fixed, "auc_confidence_lower") !== null &&
    getNumber(fixed, "auc_confidence_upper") !== null
      ? [
          getNumber(fixed, "auc_confidence_lower")!,
          getNumber(fixed, "auc_confidence_upper")!,
        ] as [number, number]
      : parseConfidenceInterval(
          getText(fixed, "auc_confidence_interval") ?? undefined
        )

  return {
    id: `canonical-artifact-${Date.now()}`,

    metadata: {
      title: "Canonical Metric Artifact",
      sourceEngine: null,
      suspectedFormat,
      sourceType: "raw_text",
      extractedAt: new Date().toISOString(),
    },

    question: {
      primary: question.primary,
      intent: question.intent,
      stakes: question.stakes,

      answerability:
        missingEvidence.length > 0
          ? "partially_answerable"
          : "answerable",

      alignment:
        missingEvidence.length > 0
          ? "The canonical metrics partially support the question, but some evidence is missing."
          : "The canonical metrics support a basic model interpretation.",
    },

    model: {
      family: "logistic_regression",

      name: getText(fixed, "model"),

      target:
        getText(fixed, "response_variable") ??
        extractTargetFromProbability(
          getText(fixed, "probability_modeled")
        ),

      targetType: "binary",

      predictors: predictors.map((p) => p.name),
    },

    data: {
      observations,

      trainingRows: null,
      validationRows: null,
      testRows: null,

      missingnessReported: null,

      classBalanceReported:
        getNumber(fixed, "number_of_response_levels") !==
        null,
    },

    metrics: {
      modelFit: {
        interceptOnly: {
          aic: getNumber(
            fixed,
            "aic_intercept_only"
          ),

          bic: getNumber(
            fixed,
            "bic_intercept_only"
          ),

          minus2LogLikelihood: getNumber(
            fixed,
            "minus2_log_l_intercept_only"
          ),
        },

        fullModel: {
          aic: getNumber(
            fixed,
            "aic_full_model"
          ),

          bic: getNumber(
            fixed,
            "bic_full_model"
          ),

          minus2LogLikelihood: getNumber(
            fixed,
            "minus2_log_l_full_model"
          ),
        },

        additional: {
          dataSet: getText(fixed, "data_set"),

          responseLevels: getNumber(
            fixed,
            "number_of_response_levels"
          ),

          logLikelihood: getNumber(
            fixed,
            "log_likelihood"
          ),

          llNull: getNumber(
            fixed,
            "ll_null"
          ),

          llrPValue: getText(
            fixed,
            "llr_p_value"
          ),

          convergenceStatus: getText(
            fixed,
            "convergence_status"
          ),
        },
      },

      performance: {
        auc:
          getNumber(fixed, "auc") ??
          getNumber(fixed, "c_statistic"),

        accuracy: getNumber(
          fixed,
          "overall_percent_correct"
        ),

        precision: null,
        recall: null,
        f1: null,

        rmse: null,
        mae: null,

        pseudoRSquared: getNumber(
          fixed,
          "pseudo_r_squared"
        ),

        additional: {},
      },

      roc: {
        auc:
          getNumber(fixed, "auc") ??
          getNumber(fixed, "c_statistic"),

        aucStandardError: getNumber(
          fixed,
          "auc_standard_error"
        ),

        aucConfidenceInterval: aucInterval,

        coordinates: [],
      },

      classification: {
        confusionMatrix: {
          trueNegative: null,
          falsePositive: null,
          falseNegative: null,
          truePositive: null,
        },

        overallPercentCorrect: getNumber(
          fixed,
          "overall_percent_correct"
        ),

        classPercentCorrect: [],
      },

      association: {
        percentConcordant: getNumber(
          fixed,
          "percent_concordant"
        ),

        percentDiscordant: getNumber(
          fixed,
          "percent_discordant"
        ),

        percentTied: getNumber(
          fixed,
          "percent_tied"
        ),

        pairs: getNumber(
          fixed,
          "pairs"
        ),

        somersD: getNumber(
          fixed,
          "somers_d"
        ),

        gamma: getNumber(
          fixed,
          "gamma"
        ),

        tauA: getNumber(
          fixed,
          "tau_a"
        ),

        cStatistic: getNumber(
          fixed,
          "c_statistic"
        ),
      },

      significanceTests: {
        likelihoodRatio: {
          chiSquare: getNumber(
            fixed,
            "likelihood_ratio_chi_square"
          ),

          df: getNumber(
            fixed,
            "likelihood_ratio_df"
          ),

          pValue: getText(
            fixed,
            "likelihood_ratio_p_value"
          ),
        },

        score: {
          chiSquare: getNumber(
            fixed,
            "score_chi_square"
          ),

          df: getNumber(
            fixed,
            "score_df"
          ),

          pValue: getText(
            fixed,
            "score_p_value"
          ),
        },

        wald: {
          chiSquare: getNumber(
            fixed,
            "wald_chi_square"
          ),

          df: getNumber(
            fixed,
            "wald_df"
          ),

          pValue: getText(
            fixed,
            "wald_p_value"
          ),
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

      additional: {},
    },

    evidence: [
      {
        id: "ev-canonical-metrics",

        label: "Canonical Metrics",

        status: "available",

        sourceType: "model_summary",
      },
    ],

    missingEvidence,

    governance: {
      causalClaimSupported:
        question.intent === "causal"
          ? false
          : null,

      deploymentSupported: false,

      highStakesUseSupported:
        question.stakes === "high"
          ? false
          : null,

      requiresHumanReview:
        question.stakes === "high" ||
        trustScore < 70,

      refusalRecommended:
        question.intent === "causal",
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
        missingEvidence.length > 1
          ? "Medium"
          : "Low-Medium",

      refusalNeeded:
        question.intent === "causal",
    },

    interpretation: {
      summary:
        "Canonicalized metrics were normalized into the Marginalia AnalysisArtifact schema.",

      takeaways: [
        "Fixed model metrics and predictor-level metrics were separated.",
        "Model fit, ROC, association, and predictor evidence were mapped where available.",
      ],

      caveats: missingEvidence,
    },

    warnings: [],

    reasoningTrace: [
      "Received canonical metric array.",
      "Separated fixed model metrics from predictor metrics.",
      "Mapped canonical fields into AnalysisArtifact.",
      "Prepared artifact for validation and trust scoring.",
    ],
  }
}

function buildFixedMap(
  canonicalMetrics: CanonicalMetric[]
) {
  return canonicalMetrics.reduce<Record<string, string>>(
    (acc, metric) => {
      if (metric.kind === "fixed_model_metric") {
        acc[metric.key] = metric.rawValue
      }

      return acc
    },
    {}
  )
}

function buildPredictors(
  canonicalMetrics: CanonicalMetric[]
): AnalysisArtifact["predictors"] {
  const grouped = new Map<
    string,
    Record<string, string>
  >()

  for (const metric of canonicalMetrics) {
    if (metric.kind !== "predictor_metric") continue

    const current =
      grouped.get(metric.predictorName) ?? {}

    current[metric.metricType] =
      metric.rawValue

    grouped.set(metric.predictorName, current)
  }

  return Array.from(grouped.entries()).map(
    ([name, values]) => {
      const estimate = parseNumber(
        values.estimate
      )

      const pValue = parseNumber(
        values.p_value
      )

      const explicitLower = parseNumber(
        values.confidence_lower
      )

      const explicitUpper = parseNumber(
        values.confidence_upper
      )

      const parsedInterval =
        parseConfidenceInterval(
          values.confidence_interval
        )

      const lower =
        explicitLower ??
        parsedInterval?.[0] ??
        null

      const upper =
        explicitUpper ??
        parsedInterval?.[1] ??
        null

      return {
        name,

        estimate,

        standardError: parseNumber(
          values.standard_error
        ),

        pValue,

        testStatistic:
          parseNumber(
            values.wald_chi_square
          ) ??
          parseNumber(values.z) ??
          parseNumber(values.t),

        testStatisticType:
          values.wald_chi_square
            ? "chi_square"
            : values.z
              ? "z"
              : values.t
                ? "t"
                : "unknown",

        oddsRatio: parseNumber(
          values.odds_ratio
        ),

        confidenceInterval:
          lower !== null &&
          upper !== null
            ? [lower, upper]
            : null,

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
          "Predictor metric normalized from canonical metric layer.",

        additionalMetrics: {
          df: parseNumber(values.df),
        },
      }
    }
  )
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

function parseNumber(
  value: string | undefined
): number | null {
  if (!value) return null

  const parsed = Number(
    value.replace(/[,%]/g, "")
  )

  return Number.isFinite(parsed)
    ? parsed
    : null
}

function parseConfidenceInterval(
  value: string | undefined
): [number, number] | null {
  if (!value) return null

  const match = value.match(
    /\(?\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)\s*\)?/
  )

  if (!match?.[1] || !match?.[2]) {
    return null
  }

  const lower = Number(match[1])
  const upper = Number(match[2])

  if (
    !Number.isFinite(lower) ||
    !Number.isFinite(upper)
  ) {
    return null
  }

  return [lower, upper]
}

function extractTargetFromProbability(
  value: string | null
): string | null {
  if (!value) return null

  const match = value.match(
    /^([A-Za-z_][A-Za-z0-9_]*)\s*=/
  )

  return match?.[1] ?? null
}