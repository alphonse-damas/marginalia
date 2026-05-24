import type { AnalysisArtifact } from "@/lib/artifacts"

import { evaluateGovernance } from "@/lib/governance/evaluate-governance"

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

  const predictors = predictorRows
    .filter((row) => row.predictor?.trim())
    .map(toPredictor)

  const validationPerformed =
    getText(model, "validation_performed")?.toLowerCase() ===
    "true"

  const baseArtifact: AnalysisArtifact = {
    id: `csv-artifact-${Date.now()}`,

    metadata: {
      title: "Canonical CSV Evidence Artifact",
      sourceEngine: null,
      suspectedFormat:
        "canonical_csv_logistic_regression",
      sourceType: "spreadsheet",
      extractedAt: new Date().toISOString(),
    },

    question: {
      primary: question.primary,
      intent: question.intent,
      stakes: question.stakes,
      answerability: "partially_answerable",
      alignment:
        "Question-to-evidence alignment has not yet been evaluated.",
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
          aic: getNumber(
            model,
            "aic_intercept_only"
          ),

          bic: getNumber(
            model,
            "bic_intercept_only"
          ),

          minus2LogLikelihood: getNumber(
            model,
            "minus2_log_l_intercept_only"
          ),
        },

        fullModel: {
          aic: getNumber(model, "aic_full_model"),

          bic: getNumber(model, "bic_full_model"),

          minus2LogLikelihood: getNumber(
            model,
            "minus2_log_l_full_model"
          ),
        },

        additional: {},
      },

      performance: {
        auc:
          getNumber(model, "auc") ??
          getNumber(model, "c_statistic"),

        accuracy: getNumber(
          model,
          "overall_percent_correct"
        ),

        precision: null,
        recall: null,
        f1: null,
        rmse: null,
        mae: null,

        pseudoRSquared: getNumber(
          model,
          "pseudo_r_squared"
        ),

        additional: {},
      },

      roc: {
        auc:
          getNumber(model, "auc") ??
          getNumber(model, "c_statistic"),

        aucStandardError: getNumber(
          model,
          "auc_standard_error"
        ),

        aucConfidenceInterval:
          getNumber(
            model,
            "auc_confidence_lower"
          ) !== null &&
          getNumber(
            model,
            "auc_confidence_upper"
          ) !== null
            ? [
                getNumber(
                  model,
                  "auc_confidence_lower"
                )!,
                getNumber(
                  model,
                  "auc_confidence_upper"
                )!,
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

        overallPercentCorrect: getNumber(
          model,
          "overall_percent_correct"
        ),

        classPercentCorrect: [],
      },

      association: {
        percentConcordant: getNumber(
          model,
          "percent_concordant"
        ),

        percentDiscordant: getNumber(
          model,
          "percent_discordant"
        ),

        percentTied: getNumber(
          model,
          "percent_tied"
        ),

        pairs: getNumber(model, "pairs"),

        somersD: getNumber(model, "somers_d"),

        gamma: getNumber(model, "gamma"),

        tauA: getNumber(model, "tau_a"),

        cStatistic: getNumber(
          model,
          "c_statistic"
        ),
      },

      significanceTests: {
        likelihoodRatio: {
          chiSquare: getNumber(
            model,
            "likelihood_ratio_chi_square"
          ),

          df: getNumber(
            model,
            "likelihood_ratio_df"
          ),

          pValue: getText(
            model,
            "likelihood_ratio_p_value"
          ),
        },

        score: {
          chiSquare: getNumber(
            model,
            "score_chi_square"
          ),

          df: getNumber(model, "score_df"),

          pValue: getText(
            model,
            "score_p_value"
          ),
        },

        wald: {
          chiSquare: getNumber(
            model,
            "wald_chi_square"
          ),

          df: getNumber(model, "wald_df"),

          pValue: getText(
            model,
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
        status:
          predictors.length > 0
            ? "available"
            : "missing",
        sourceType: "coefficient_table",
      },
    ],

    missingEvidence: [],

    governance: {
      causalClaimSupported: null,
      deploymentSupported: false,
      highStakesUseSupported: null,
      requiresHumanReview: false,
      refusalRecommended: false,
    },

    trust: {
      score: 0,
      label: "Insufficient",
      evidenceCoverage: "Low",
      sourceTraceability: "Available",
      weakContextRisk: "High",
      refusalNeeded: false,
    },

    interpretation: {
      summary:
        "Canonical CSV evidence was normalized into the Marginalia AnalysisArtifact schema.",

      takeaways: [
        "Structured model-level metrics were loaded deterministically.",
        "Structured predictor-level metrics were loaded deterministically.",
        "No LLM extraction was required.",
      ],

      caveats: [],
    },

    warnings: [],

    reasoningTrace: [
      "Loaded canonical model CSV.",
      "Loaded canonical predictor CSV.",
      "Mapped deterministic CSV fields into AnalysisArtifact.",
      "Governance evaluation completed.",
    ],
  }

  const governance =
    evaluateGovernance(baseArtifact)

  baseArtifact.missingEvidence =
    governance.missingEvidence

  baseArtifact.governance = {
    causalClaimSupported:
      governance.causalClaimSupported,

    deploymentSupported:
      governance.deploymentSupported,

    highStakesUseSupported:
      governance.highStakesUseSupported,

    requiresHumanReview:
      governance.requiresHumanReview,

    refusalRecommended:
      governance.refusalRecommended,
  }

  baseArtifact.trust = {
    score: governance.trustScore,

    label: mapTrustLabel(
      governance.trustLabel
    ),

    evidenceCoverage:
      mapEvidenceCoverage(
        governance.evidenceCoverage
      ),

    sourceTraceability:
      mapSourceTraceability(
        governance.sourceTraceability
      ),

    weakContextRisk:
      mapWeakContextRisk(
        governance.weakContextRisk
      ),

    refusalNeeded:
      governance.refusalRecommended,
  }

  baseArtifact.question.answerability =
    governance.questionFit === "none"
      ? "not_answerable"
      : governance.questionFit === "weak"
        ? "partially_answerable"
        : "answerable"

  baseArtifact.question.alignment =
    governance.questionFit === "strong"
      ? "The supplied evidence strongly supports the analytical question."
      : governance.questionFit === "partial"
        ? "The supplied evidence partially supports the analytical question."
        : governance.questionFit === "weak"
          ? "The supplied evidence weakly supports the analytical question."
          : "The supplied evidence does not adequately support the analytical question."

  baseArtifact.interpretation.caveats =
    governance.governanceFlags

  baseArtifact.warnings =
    governance.governanceFlags.map((message) => ({
      message,
      severity: mapWarningSeverity(message),
    }))

  baseArtifact.reasoningTrace.push(
    ...governance.trustRationale
  )

  return baseArtifact
}

function toModelMap(rows: CsvRow[]) {
  return rows.reduce<Record<string, string>>(
    (acc, row) => {
      if (row.metric_name) {
        acc[row.metric_name] = row.value ?? ""
      }

      return acc
    },
    {}
  )
}

function toPredictor(
  row: CsvRow
): AnalysisArtifact["predictors"][number] {
  const estimate = parseNumber(row.estimate)

  const pValue = parseNumber(row.p_value)

  const lower = parseNumber(row.ci_lower)

  const upper = parseNumber(row.ci_upper)

  return {
    name: row.predictor,

    estimate,

    standardError: parseNumber(row.std_error),

    pValue,

    testStatistic: parseNumber(
      row.test_statistic
    ),

    testStatisticType:
      row.test_statistic_type === "z" ||
      row.test_statistic_type === "t" ||
      row.test_statistic_type ===
        "chi_square"
        ? row.test_statistic_type
        : "unknown",

    oddsRatio: parseNumber(row.odds_ratio),

    confidenceInterval:
      lower !== null && upper !== null
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
      "Predictor metric loaded from canonical CSV evidence.",

    additionalMetrics: {},
  }
}

function getText(
  model: Record<string, string>,
  key: string
): string | null {
  return model[key] || null
}

function getNumber(
  model: Record<string, string>,
  key: string
): number | null {
  return parseNumber(model[key])
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

function mapTrustLabel(
  label: string
): AnalysisArtifact["trust"]["label"] {
  if (label === "High Confidence") return "Strong"
  if (label === "Strong") return "Strong"
  if (label === "Caution") return "Caution"
  if (label === "Weak") return "Weak"

  return "Insufficient"
}

function mapEvidenceCoverage(
  coverage: string
): AnalysisArtifact["trust"]["evidenceCoverage"] {
  if (coverage === "strong") return "High"
  if (coverage === "partial") return "Partial"

  return "Low"
}

function mapSourceTraceability(
  traceability: string
): AnalysisArtifact["trust"]["sourceTraceability"] {
  if (traceability === "high") return "Available"

  if (traceability === "moderate")
    return "Available"

  return "Partial"
}

function mapWeakContextRisk(
  risk: string
): AnalysisArtifact["trust"]["weakContextRisk"] {
  if (risk === "low") return "Low"
  if (risk === "medium") return "Medium"

  return "High"
}

function mapWarningSeverity(
  message: string
): AnalysisArtifact["warnings"][number]["severity"] {
  const lower = message.toLowerCase()

  if (
    lower.includes("no usable evidence") ||
    lower.includes("refusal") ||
    lower.includes("causal claim unsupported")
  ) {
    return "critical"
  }

  if (
    lower.includes("missing") ||
    lower.includes("high weak-context")
  ) {
    return "high"
  }

  if (
    lower.includes("validation") ||
    lower.includes("raw-output extraction")
  ) {
    return "medium"
  }

  return "low"
}