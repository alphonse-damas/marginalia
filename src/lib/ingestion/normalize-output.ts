import type {
  AnalysisArtifact,
  SourceEngine,
} from "@/lib/artifacts"

type NormalizeInput = {
  rawText: string

  sourceEngine?: SourceEngine | null

  question: {
    primary: string

    intent: AnalysisArtifact["question"]["intent"]

    stakes: AnalysisArtifact["question"]["stakes"]
  }
}

export function normalizeOutputToArtifact({
  rawText,
  sourceEngine,
  question,
}: NormalizeInput): AnalysisArtifact {
  const detectedSource = sourceEngine ?? null

  const observations = extractNumber(
    rawText,
    /(?:observations|number of observations used)\D+(\d+)/i
  )

  const target = extractTarget(rawText)

  const modelName = extractModelName(rawText)

  const predictors = extractPredictors(rawText)

  const missingEvidence = buildMissingEvidence({
    predictorsCount: predictors.length,
  })

  return {
    id: `artifact-${Date.now()}`,

    metadata: {
      title: "Normalized Regression Artifact",

      sourceEngine: detectedSource,

      suspectedFormat: detectSuspectedFormat(rawText),

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
          ? "The output partially supports the question."
          : "The output supports a basic association-based interpretation.",
    },

    model: {
      family: "logistic_regression",

      name: modelName,

      target,

      targetType: "binary",

      predictors: predictors.map((p) => p.name),
    },

    data: {
      observations,

      trainingRows: null,

      validationRows: null,

      testRows: null,

      missingnessReported: null,

      classBalanceReported: /response profile/i.test(rawText)
        ? true
        : null,
    },

    metrics: {
      modelFit: {
        interceptOnly: {
          aic: extractMetricPair(rawText, "AIC").interceptOnly,

          bic: extractMetricPair(rawText, "SC").interceptOnly,

          minus2LogLikelihood:
            extractMetricPair(rawText, "-2 Log L")
              .interceptOnly,
        },

        fullModel: {
          aic: extractMetricPair(rawText, "AIC").fullModel,

          bic: extractMetricPair(rawText, "SC").fullModel,

          minus2LogLikelihood:
            extractMetricPair(rawText, "-2 Log L")
              .fullModel,
        },
      },

      performance: {
        auc:
          extractNumber(rawText, /\bc\s*=\s*([0-9.]+)/i),

        accuracy: null,

        precision: null,

        recall: null,

        f1: null,

        rmse: null,

        mae: null,
      },

      significanceTests: {
        likelihoodRatio: extractSignificanceTest(
          rawText,
          "Likelihood Ratio"
        ),

        score: extractSignificanceTest(rawText, "Score"),

        wald: extractSignificanceTest(rawText, "Wald"),
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
    },

    evidence: [
      {
        id: "ev-model-summary",

        label: "Model Summary",

        status: "available",

        sourceType: "model_summary",
      },

      {
        id: "ev-fit-statistics",

        label: "Model Fit Statistics",

        status: "available",

        sourceType: "performance_metric",
      },

      {
        id: "ev-significance-tests",

        label: "Global Significance Tests",

        status: "available",

        sourceType: "diagnostic",
      },
    ],

    missingEvidence,

    governance: {
      causalClaimSupported: null,

      deploymentSupported: false,

      highStakesUseSupported: false,

      requiresHumanReview: true,

      refusalRecommended: false,
    },

    trust: {
      score: 72,

      label: "Partial",

      evidenceCoverage: "Partial",

      sourceTraceability: "Available",

      weakContextRisk: "Medium",

      refusalNeeded: false,
    },

    interpretation: {
      summary:
        "The regression output was partially normalized into the artifact schema.",

      takeaways: [
        "Model fit statistics were detected.",

        "Global significance tests were detected.",

        predictors.length === 0
          ? "Predictor-level interpretation is unavailable."
          : "Predictor-level evidence was detected.",
      ],

      caveats: missingEvidence,
    },

    reasoningTrace: [
      "Read raw text dump.",

      "Extracted model-level metrics.",

      "Preserved comparison fit statistics.",

      "Detected significance tests.",

      "Mapped available evidence into normalized schema.",
    ],
  }
}

function detectSuspectedFormat(
  text: string
): string | null {
  if (/the logistic procedure/i.test(text)) {
    return "SAS_LOGISTIC_PROCEDURE"
  }

  return null
}

function extractTarget(text: string): string | null {
  const match =
    text.match(/response variable\s+([A-Za-z_]+)/i) ||
    text.match(/probability modeled is\s+([A-Za-z_]+)/i)

  return match?.[1] ?? null
}

function extractModelName(text: string): string | null {
  const match = text.match(/model\s+(.+)/i)

  return match?.[1]?.trim() ?? null
}

function extractNumber(
  text: string,
  pattern: RegExp
): number | null {
  const match = text.match(pattern)

  if (!match?.[1]) return null

  const value = Number(match[1])

  return Number.isFinite(value) ? value : null
}

function extractMetricPair(
  text: string,
  metricName: string
): {
  interceptOnly: number | null
  fullModel: number | null
} {
  const escaped = metricName.replace(
    /[-/\\^$*+?.()|[\]{}]/g,
    "\\$&"
  )

  const pattern = new RegExp(
    `${escaped}\\s+([0-9.]+)\\s+([0-9.]+)`,
    "i"
  )

  const match = text.match(pattern)

  return {
    interceptOnly: match?.[1]
      ? Number(match[1])
      : null,

    fullModel: match?.[2]
      ? Number(match[2])
      : null,
  }
}

function extractSignificanceTest(
  text: string,
  label: string
) {
  const escaped = label.replace(
    /[-/\\^$*+?.()|[\]{}]/g,
    "\\$&"
  )

  const pattern = new RegExp(
    `${escaped}\\s+([0-9.]+)\\s+(\\d+)\\s+([<>=.0-9a-zA-Z]+)`,
    "i"
  )

  const match = text.match(pattern)

  return {
    chiSquare: match?.[1]
      ? Number(match[1])
      : null,

    df: match?.[2]
      ? Number(match[2])
      : null,

    pValue: match?.[3] ?? null,
  }
}

function extractPredictors(
  text: string
): AnalysisArtifact["predictors"] {
  const predictors: AnalysisArtifact["predictors"] = []

  const oddsRatioPattern =
    /([A-Za-z0-9_ ]+)\s+OR[:=]?\s*([0-9.]+)/gi

  let match

  while ((match = oddsRatioPattern.exec(text)) !== null) {
    predictors.push({
      name: match[1].trim(),

      estimate: null,

      standardError: null,

      pValue: null,

      oddsRatio: Number(match[2]),

      confidenceInterval: null,

      effectDirection: "unknown",

      significance: "unknown",

      interpretation:
        "Predictor extracted from raw output.",
    })
  }

  return predictors
}

function buildMissingEvidence({
  predictorsCount,
}: {
  predictorsCount: number
}) {
  const missing: string[] = []

  if (predictorsCount === 0) {
    missing.push(
      "Predictor-level odds ratios or coefficient table is missing."
    )
  }

  missing.push("Validation output is missing.")

  return missing
}