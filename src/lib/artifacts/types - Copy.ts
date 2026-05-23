export type SourceEngine =
  | "SAS"
  | "Python"
  | "R"
  | "Excel"
  | "Tableau"
  | "SPSS"
  | "Stata"

export type AnalysisIntent =
  | "describe"
  | "explain"
  | "predict"
  | "compare"
  | "decide"
  | "causal"
  | "audit"

export type Answerability =
  | "answerable"
  | "partially_answerable"
  | "not_answerable"
  | "unknown"

export type ModelFamily =
  | "linear_regression"
  | "logistic_regression"
  | "multinomial_logit"
  | "poisson_regression"
  | "cox_regression"
  | "other"
  | "unknown"

export type EvidenceStatus =
  | "available"
  | "missing"
  | "conflicting"
  | "warning"

export type AnalysisArtifact = {
  id: string

  metadata: {
    title: string

    sourceEngine: SourceEngine | null

    suspectedFormat: string | null

    sourceType:
      | "raw_text"
      | "table"
      | "csv"
      | "json"
      | "pdf"
      | "image"
      | "unknown"

    extractedAt: string
  }

  question: {
    primary: string

    intent: AnalysisIntent

    stakes: "low" | "medium" | "high"

    answerability: Answerability

    alignment: string
  }

  model: {
    family: ModelFamily

    name: string | null

    target: string | null

    targetType:
      | "continuous"
      | "binary"
      | "multiclass"
      | "count"
      | "time_to_event"
      | "unknown"

    predictors: string[]
  }

  data: {
    observations: number | null

    trainingRows: number | null

    validationRows: number | null

    testRows: number | null

    missingnessReported: boolean | null

    classBalanceReported: boolean | null
  }

  metrics: {
    modelFit: {
      interceptOnly: {
        aic: number | null

        bic: number | null

        minus2LogLikelihood: number | null
      }

      fullModel: {
        aic: number | null

        bic: number | null

        minus2LogLikelihood: number | null
      }

      additional: Record<
        string,
        number | string | boolean | null
      >
    }

    performance: {
      auc: number | null

      accuracy: number | null

      precision: number | null

      recall: number | null

      f1: number | null

      rmse: number | null

      mae: number | null

      pseudoRSquared: number | null

      additional: Record<
        string,
        number | string | boolean | null
      >
    }

    significanceTests: {
      likelihoodRatio: {
        chiSquare: number | null

        df: number | null

        pValue: string | null
      }

      score: {
        chiSquare: number | null

        df: number | null

        pValue: string | null
      }

      wald: {
        chiSquare: number | null

        df: number | null

        pValue: string | null
      }

      additional: Record<
        string,
        number | string | boolean | null
      >
    }
  }

  predictors: Array<{
    name: string

    estimate: number | null

    standardError: number | null

    pValue: number | null

    testStatistic: number | null

    testStatisticType:
      | "z"
      | "t"
      | "chi_square"
      | "unknown"

    oddsRatio: number | null

    confidenceInterval: [number, number] | null

    effectDirection:
      | "positive"
      | "negative"
      | "neutral"
      | "unknown"

    significance:
      | "strong"
      | "moderate"
      | "weak"
      | "not_significant"
      | "unknown"

    interpretation: string

    additionalMetrics: Record<
      string,
      number | string | boolean | null
    >
  }>

  diagnostics: {
    assumptionsChecked: boolean | null

    multicollinearityChecked: boolean | null

    residualsChecked: boolean | null

    calibrationChecked: boolean | null

    validationPerformed: boolean | null

    driftChecked: boolean | null

    fairnessChecked: boolean | null

    additional: Record<
      string,
      number | string | boolean | null
    >
  }

  evidence: Array<{
    id: string

    label: string

    status: EvidenceStatus

    sourceType:
      | "model_summary"
      | "coefficient_table"
      | "performance_metric"
      | "diagnostic"
      | "validation"
      | "governance"
      | "data_quality"
      | "warning"
      | "unknown"
  }>

  missingEvidence: string[]

  governance: {
    causalClaimSupported: boolean | null

    deploymentSupported: boolean | null

    highStakesUseSupported: boolean | null

    requiresHumanReview: boolean

    refusalRecommended: boolean
  }

  trust: {
    score: number

    label: string

    evidenceCoverage: string

    sourceTraceability: string

    weakContextRisk: string

    refusalNeeded: boolean
  }

  interpretation: {
    summary: string

    takeaways: string[]

    caveats: string[]
  }

  warnings: Array<{
    message: string

    severity:
      | "info"
      | "warning"
      | "critical"
      | "unknown"
  }>

  reasoningTrace: string[]
}