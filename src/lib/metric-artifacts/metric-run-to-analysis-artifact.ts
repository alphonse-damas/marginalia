import type { AnalysisArtifact } from "@/lib/artifacts"
import type { MetricArtifact, MetricEntry } from "./types"

export function metricRunToAnalysisArtifact({
  run,
  question,
}: {
  run: MetricArtifact
  question: {
    primary: string
    intent: AnalysisArtifact["question"]["intent"]
    stakes: AnalysisArtifact["question"]["stakes"]
  }
}): AnalysisArtifact {
  const metricMap = toMetricMap(run.metrics)

  const suspectedFormat = run.detected_source_type ?? null
  const isStatsmodels = suspectedFormat === "python_statsmodels_logit"
  const isSasLogistic = suspectedFormat === "sas_logistic"

  const predictors = isStatsmodels
    ? extractStatsmodelsPredictors(run.metrics)
    : []

  const warnings = extractWarnings(run.metrics)

  const missingEvidence = buildMissingEvidence({
    predictorsCount: predictors.length,
    hasValidation: false,
    hasPerformance:
      hasMetric(metricMap, "Pseudo R-squared") ||
      hasMetric(metricMap, "AIC Intercept and Covariates") ||
      hasMetric(metricMap, "Log-Likelihood"),
  })

  const refusalRecommended =
    question.intent === "causal" ||
    (question.stakes === "high" && missingEvidence.length >= 2)

  const trustScore = computeTrustScore({
    observations:
      getNumber(metricMap, "Number of Observations") ??
      getNumber(metricMap, "Number of Observations Used"),
    predictorsCount: predictors.length,
    warningsCount: warnings.length,
    missingEvidenceCount: missingEvidence.length,
    refusalRecommended,
  })

  return {
    id: run.pid,

    metadata: {
      title: "Normalized Metric Artifact",
      sourceEngine: null,
      suspectedFormat,
      sourceType: "raw_text",
      extractedAt: run.created_at,
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
        ? "The question asks for a claim or use case that the extracted metrics cannot safely support."
        : missingEvidence.length > 0
          ? "The extracted metrics partially support the question, but some required evidence is missing."
          : "The extracted metrics support a basic interpretation of the model output.",
    },

    model: {
      family: "logistic_regression",
      name:
        getText(metricMap, "Model") ??
        (isStatsmodels ? "Logit" : isSasLogistic ? "binary logit" : null),
      target:
        getText(metricMap, "Response Variable") ??
        getText(metricMap, "Dependent Variable") ??
        extractTargetFromProbability(getText(metricMap, "Probability modeled")),
      targetType: "binary",
      predictors: predictors.map((p) => p.name),
    },

    data: {
      observations:
        getNumber(metricMap, "Number of Observations") ??
        getNumber(metricMap, "Number of Observations Used"),
      trainingRows: null,
      validationRows: null,
      testRows: null,
      missingnessReported: null,
      classBalanceReported:
        hasMetric(metricMap, "Probability modeled") ||
        hasMetric(metricMap, "Number of Response Levels"),
    },

    metrics: {
      modelFit: {
        interceptOnly: {
          aic: getNumber(metricMap, "AIC Intercept Only"),
          bic: getNumber(metricMap, "SC Intercept Only"),
          minus2LogLikelihood: getNumber(
            metricMap,
            "-2 Log L Intercept Only"
          ),
        },

        fullModel: {
          aic: getNumber(metricMap, "AIC Intercept and Covariates"),
          bic: getNumber(metricMap, "SC Intercept and Covariates"),
          minus2LogLikelihood: getNumber(
            metricMap,
            "-2 Log L Intercept and Covariates"
          ),
        },

        additional: {
          pseudoRSquared: getNumber(metricMap, "Pseudo R-squared"),
          logLikelihood: getNumber(metricMap, "Log-Likelihood"),
          llNull: getNumber(metricMap, "LL-Null"),
          llrPValue: getText(metricMap, "LLR p-value"),
          dfResiduals: getNumber(metricMap, "Df Residuals"),
          dfModel: getNumber(metricMap, "Df Model"),
          method: getText(metricMap, "Method"),
          covarianceType: getText(metricMap, "Covariance Type"),
          converged: getText(metricMap, "Converged"),
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
        pseudoRSquared: getNumber(metricMap, "Pseudo R-squared"),
        additional: {},
      },

      significanceTests: {
        likelihoodRatio: {
          chiSquare: getNumber(metricMap, "Likelihood Ratio Chi-Square"),
          df: getNumber(metricMap, "Likelihood Ratio DF"),
          pValue: getText(metricMap, "Likelihood Ratio Pr > ChiSq"),
        },

        score: {
          chiSquare: getNumber(metricMap, "Score Chi-Square"),
          df: getNumber(metricMap, "Score DF"),
          pValue: getText(metricMap, "Score Pr > ChiSq"),
        },

        wald: {
          chiSquare: getNumber(metricMap, "Wald Chi-Square"),
          df: getNumber(metricMap, "Wald DF"),
          pValue: getText(metricMap, "Wald Pr > ChiSq"),
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
        convergenceStatus:
          getText(metricMap, "Model Convergence Status") ??
          getText(metricMap, "Converged"),
        quasiSeparationWarning: warnings.some((warning) =>
          /quasi-separation/i.test(warning.message)
        ),
      },
    },

    evidence: [
      {
        id: "ev-metric-artifact-store",
        label: "Metric Artifact Store",
        status: "available",
        sourceType: "model_summary",
      },
      {
        id: "ev-model-fit",
        label: "Model Fit Metrics",
        status:
          getNumber(metricMap, "AIC Intercept and Covariates") !== null ||
          getNumber(metricMap, "Log-Likelihood") !== null
            ? "available"
            : "missing",
        sourceType: "performance_metric",
      },
      {
        id: "ev-parameter-estimates",
        label: "Parameter Estimates",
        status: predictors.length > 0 ? "available" : "missing",
        sourceType: "coefficient_table",
      },
      {
        id: "ev-warnings",
        label: "Warnings",
        status: warnings.length > 0 ? "warning" : "available",
        sourceType: "warning",
      },
    ],

    missingEvidence,

    governance: {
      causalClaimSupported: question.intent === "causal" ? false : null,
      deploymentSupported: false,
      highStakesUseSupported: question.stakes === "high" ? false : null,
      requiresHumanReview:
        question.stakes === "high" || trustScore < 70 || warnings.length > 0,
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
        refusalRecommended || warnings.length > 0
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
        "The extracted metric artifact was normalized into the Marginalia AnalysisArtifact schema.",
      takeaways: [
        predictors.length > 0
          ? "Predictor-level parameter estimates were detected."
          : "Predictor-level estimates were not detected.",
        warnings.length > 0
          ? "Warnings were detected and should be reviewed before relying on the model."
          : "No parser-level warning was detected.",
        missingEvidence.length > 0
          ? "Some evidence required for stronger interpretation is missing."
          : "The extracted metrics support basic model interpretation.",
      ],
      caveats: missingEvidence,
    },

    warnings,

    reasoningTrace: [
      "Loaded metric run from metrics_artifact_store.json.",
      "Mapped extracted metrics into the normalized AnalysisArtifact schema.",
      "Grouped statsmodels parameter estimates into predictor objects when available.",
      "Preserved suspected format separately from verified source engine.",
      "Evaluated missing evidence, warnings, and governance constraints.",
    ],
  }
}

function toMetricMap(metrics: MetricEntry[]) {
  return metrics.reduce<Record<string, string>>((acc, metric) => {
    acc[metric.metric_name] = metric.metric_value
    return acc
  }, {})
}

function getText(
  metricMap: Record<string, string>,
  key: string
): string | null {
  return metricMap[key] ?? null
}

function getNumber(
  metricMap: Record<string, string>,
  key: string
): number | null {
  const raw = metricMap[key]

  if (!raw) {
    return null
  }

  const value = Number(raw.replace(/[,%]/g, ""))

  return Number.isFinite(value) ? value : null
}

function hasMetric(
  metricMap: Record<string, string>,
  key: string
): boolean {
  return metricMap[key] !== undefined
}

function extractTargetFromProbability(
  probabilityModeled: string | null
): string | null {
  if (!probabilityModeled) {
    return null
  }

  const match = probabilityModeled.match(/^([A-Za-z_][A-Za-z0-9_]*)=/)

  return match?.[1] ?? null
}

function extractStatsmodelsPredictors(
  metrics: MetricEntry[]
): AnalysisArtifact["predictors"] {
  const grouped = new Map<
    string,
    Record<string, string>
  >()

  for (const metric of metrics) {
    const match = metric.metric_name.match(
      /^(.+?)\s+(coef|std err|z|P>\|z\||0\.025 CI|0\.975 CI)$/
    )

    if (!match) {
      continue
    }

    const variable = match[1]
    const field = match[2]

    const current = grouped.get(variable) ?? {}
    current[field] = metric.metric_value
    grouped.set(variable, current)
  }

  return Array.from(grouped.entries()).map(([name, values]) => {
    const estimate = parseNumber(values["coef"])
    const lower = parseNumber(values["0.025 CI"])
    const upper = parseNumber(values["0.975 CI"])

    return {
      name,
      estimate,
      standardError: parseNumber(values["std err"]),
      pValue: parseNumber(values["P>|z|"]),
      testStatistic: parseNumber(values["z"]),
      testStatisticType: "z",
      oddsRatio: null,
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
        parseNumber(values["P>|z|"]) === null
          ? "unknown"
          : Number(values["P>|z|"]) < 0.01
            ? "strong"
            : Number(values["P>|z|"]) < 0.05
              ? "moderate"
              : Number(values["P>|z|"]) < 0.1
                ? "weak"
                : "not_significant",
      interpretation:
        "Predictor parameter estimate extracted from statsmodels output.",
      additionalMetrics: {},
    }
  })
}

function extractWarnings(
  metrics: MetricEntry[]
): AnalysisArtifact["warnings"] {
  return metrics
    .filter((metric) => metric.metric_name === "Warning")
    .map((metric) => ({
      message: metric.metric_value,
      severity: /quasi-separation|complete separation/i.test(
        metric.metric_value
      )
        ? "critical"
        : "warning",
    }))
}

function buildMissingEvidence({
  predictorsCount,
  hasValidation,
  hasPerformance,
}: {
  predictorsCount: number
  hasValidation: boolean
  hasPerformance: boolean
}) {
  const missing: string[] = []

  if (predictorsCount === 0) {
    missing.push(
      "Predictor-level odds ratios or coefficient table is missing."
    )
  }

  if (!hasPerformance) {
    missing.push("Model fit or performance metrics are missing.")
  }

  if (!hasValidation) {
    missing.push("Validation output is missing.")
  }

  return missing
}

function computeTrustScore({
  observations,
  predictorsCount,
  warningsCount,
  missingEvidenceCount,
  refusalRecommended,
}: {
  observations: number | null
  predictorsCount: number
  warningsCount: number
  missingEvidenceCount: number
  refusalRecommended: boolean
}) {
  let score = 85

  if (!observations) score -= 15
  if (observations !== null && observations < 100) score -= 15
  if (predictorsCount === 0) score -= 15
  if (warningsCount > 0) score -= 20
  score -= missingEvidenceCount * 7
  if (refusalRecommended) score -= 25

  return Math.max(0, Math.min(100, score))
}

function parseNumber(value: string | undefined): number | null {
  if (value === undefined) {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}