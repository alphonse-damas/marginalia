import type { AnalysisArtifact } from "@/lib/artifacts"

import type { CsvRow } from "./parse-csv"

export function csvToArtifact({
  modelRows,
  predictorRows,
  question,
}: {
  modelRows: CsvRow[]
  predictorRows: CsvRow[]
  question: {
    primary: string
    intent: AnalysisArtifact["question"]["intent"]
    stakes: AnalysisArtifact["question"]["stakes"]
  }
}): AnalysisArtifact {
  const model = toModelMap(modelRows)
  const predictors = predictorRows.map(toPredictor)

  const validationPerformed =
    getText(model, "validation_performed")?.toLowerCase() === "true"

  const missingEvidence: string[] = []

  if (predictors.length === 0) {
    missingEvidence.push("Predictor-level evidence is missing.")
  }

  if (getNumber(model, "auc") === null && getNumber(model, "c_statistic") === null) {
    missingEvidence.push("ROC/AUC evidence is missing.")
  }

  if (!validationPerformed) {
    missingEvidence.push("Validation output is missing.")
  }

  const trustScore = Math.max(0, 90 - missingEvidence.length * 7)

  return {
    id: `csv-artifact-${Date.now()}`,

    metadata: {
      title: "Canonical CSV Evidence Artifact",
      sourceEngine: null,
      suspectedFormat: "canonical_csv_logistic_regression",
      sourceType: "spreadsheet",
      extractedAt: new Date().toISOString(),
    },

    question: {
      primary: question.primary,
      intent: question.intent,
      stakes: question.stakes,
      answerability:
        missingEvidence.length > 0 ? "partially_answerable" : "answerable",
      alignment:
        missingEvidence.length > 0
          ? "The CSV evidence partially supports the question, but some evidence is missing."
          : "The CSV evidence supports a structured model interpretation.",
    },

    model: {
      family: "logistic_regression",
      name: getText(model, "model_name"),
      target: getText(model, "target_variable"),
      targetType: "binary",
      predictors: predictors.map((p) => p.name),
    },

    data: {
      observations: getNumber(model, "observations"),
      trainingRows: null,
      validationRows: null,
      testRows: null,
      missingnessReported: null,
      classBalanceReported: true,
    },

    metrics: {
      modelFit: {
        interceptOnly: {
          aic: getNumber(model, "aic_intercept_only"),
          bic: getNumber(model, "bic_intercept_only"),
          minus2LogLikelihood: getNumber(
            model,
            "minus2_log_l_intercept_only"
          ),
        },
        fullModel: {
          aic: getNumber(model, "aic_full_model"),
          bic: getNumber(model, "bic_full_model"),
          minus2LogLikelihood: getNumber(model, "minus2_log_l_full_model"),
        },
        additional: {},
      },

      performance: {
        auc: getNumber(model, "auc") ?? getNumber(model, "c_statistic"),
        accuracy: getNumber(model, "overall_percent_correct"),
        precision: null,
        recall: null,
        f1: null,
        rmse: null,
        mae: null,
        pseudoRSquared: getNumber(model, "pseudo_r_squared"),
        additional: {},
      },

      roc: {
        auc: getNumber(model, "auc") ?? getNumber(model, "c_statistic"),
        aucStandardError: getNumber(model, "auc_standard_error"),
        aucConfidenceInterval:
          getNumber(model, "auc_confidence_lower") !== null &&
          getNumber(model, "auc_confidence_upper") !== null
            ? [
                getNumber(model, "auc_confidence_lower")!,
                getNumber(model, "auc_confidence_upper")!,
              ]
            : null,
        coordinates: [],
      },

      classification: {
        confusionMatrix: {
          trueNegative: null,
          falsePositive: null,
          falseNegative: null,
          truePositive: null,
        },
        overallPercentCorrect: getNumber(model, "overall_percent_correct"),
        classPercentCorrect: [],
      },

      association: {
        percentConcordant: getNumber(model, "percent_concordant"),
        percentDiscordant: getNumber(model, "percent_discordant"),
        percentTied: getNumber(model, "percent_tied"),
        pairs: getNumber(model, "pairs"),
        somersD: getNumber(model, "somers_d"),
        gamma: getNumber(model, "gamma"),
        tauA: getNumber(model, "tau_a"),
        cStatistic: getNumber(model, "c_statistic"),
      },

      significanceTests: {
        likelihoodRatio: {
          chiSquare: getNumber(model, "likelihood_ratio_chi_square"),
          df: getNumber(model, "likelihood_ratio_df"),
          pValue: getText(model, "likelihood_ratio_p_value"),
        },
        score: {
          chiSquare: getNumber(model, "score_chi_square"),
          df: getNumber(model, "score_df"),
          pValue: getText(model, "score_p_value"),
        },
        wald: {
          chiSquare: getNumber(model, "wald_chi_square"),
          df: getNumber(model, "wald_df"),
          pValue: getText(model, "wald_p_value"),
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
      validationPerformed,
      driftChecked: false,
      fairnessChecked: false,
      additional: {},
    },

    evidence: [
      {
        id: "ev-csv-model",
        label: "Canonical Model Metrics CSV",
        status: "available",
        sourceType: "model_summary",
      },
      {
        id: "ev-csv-predictors",
        label: "Canonical Predictor Metrics CSV",
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
      refusalRecommended: question.intent === "causal",
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
      weakContextRisk: missingEvidence.length > 1 ? "Medium" : "Low-Medium",
      refusalNeeded: question.intent === "causal",
    },

    interpretation: {
      summary:
        "Canonical CSV evidence was normalized into the Marginalia AnalysisArtifact schema.",
      takeaways: [
        "Structured model-level metrics were loaded deterministically.",
        "Structured predictor-level metrics were loaded deterministically.",
        "No LLM extraction was required.",
      ],
      caveats: missingEvidence,
    },

    warnings: [],

    reasoningTrace: [
      "Loaded canonical model CSV.",
      "Loaded canonical predictor CSV.",
      "Mapped deterministic CSV fields into AnalysisArtifact.",
      "Evaluated missing evidence and trust state.",
    ],
  }
}

function toModelMap(rows: CsvRow[]) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    if (row.metric_name) {
      acc[row.metric_name] = row.value ?? ""
    }

    return acc
  }, {})
}

function toPredictor(row: CsvRow): AnalysisArtifact["predictors"][number] {
  const estimate = parseNumber(row.estimate)
  const pValue = parseNumber(row.p_value)
  const lower = parseNumber(row.ci_lower)
  const upper = parseNumber(row.ci_upper)

  return {
    name: row.predictor,
    estimate,
    standardError: parseNumber(row.std_error),
    pValue,
    testStatistic: parseNumber(row.test_statistic),
    testStatisticType:
      row.test_statistic_type === "z" ||
      row.test_statistic_type === "t" ||
      row.test_statistic_type === "chi_square"
        ? row.test_statistic_type
        : "unknown",
    oddsRatio: parseNumber(row.odds_ratio),
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
    interpretation: "Predictor metric loaded from canonical CSV evidence.",
    additionalMetrics: {},
  }
}

function getText(model: Record<string, string>, key: string): string | null {
  return model[key] || null
}

function getNumber(model: Record<string, string>, key: string): number | null {
  return parseNumber(model[key])
}

function parseNumber(value: string | undefined): number | null {
  if (!value) return null

  const parsed = Number(value.replace(/[,%]/g, ""))

  return Number.isFinite(parsed) ? parsed : null
}