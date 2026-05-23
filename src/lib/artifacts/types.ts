export type AnalysisArtifact = {
  id: string

  metadata: {
    title: string

    sourceEngine: string | null

    suspectedFormat: string | null

    sourceType:
      | "raw_text"
      | "pdf"
      | "spreadsheet"
      | "database"
      | "api"
      | "unknown"

    extractedAt: string
  }

  question: {
    primary: string

    intent:
      | "descriptive"
      | "predictive"
      | "causal"
      | "diagnostic"
      | "exploratory"

    stakes:
      | "low"
      | "medium"
      | "high"

    answerability:
      | "answerable"
      | "partially_answerable"
      | "not_answerable"

    alignment: string
  }

  model: {
    family:
      | "logistic_regression"
      | "linear_regression"
      | "multilevel_model"
      | "classification"
      | "clustering"
      | "unknown"

    name: string | null

    target: string | null

    targetType:
      | "binary"
      | "continuous"
      | "multiclass"
      | "ordinal"
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

      additional: Record<string, unknown>
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

      additional: Record<string, unknown>
    }

    roc: {
      auc: number | null

      aucStandardError: number | null

      aucConfidenceInterval: [number, number] | null

      coordinates: Array<{
        threshold: number | null
        tpr: number | null
        fpr: number | null
      }>
    }

    classification: {
      confusionMatrix: {
        trueNegative: number | null

        falsePositive: number | null

        falseNegative: number | null

        truePositive: number | null
      }

      overallPercentCorrect: number | null

      classPercentCorrect: Array<{
        classLabel: string
        percentCorrect: number | null
      }>
    }

    association: {
      percentConcordant: number | null

      percentDiscordant: number | null

      percentTied: number | null

      pairs: number | null

      somersD: number | null

      gamma: number | null

      tauA: number | null

      cStatistic: number | null
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

      additional: Record<string, unknown>
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

    additionalMetrics: Record<string, unknown>
  }>

  diagnostics: {
    assumptionsChecked: boolean | null

    multicollinearityChecked: boolean | null

    residualsChecked: boolean | null

    calibrationChecked: boolean | null

    validationPerformed: boolean | null

    driftChecked: boolean | null

    fairnessChecked: boolean | null

    additional: Record<string, unknown>
  }

  evidence: Array<{
    id: string

    label: string

    status:
      | "available"
      | "missing"
      | "partial"

    sourceType:
      | "coefficient_table"
      | "performance_metric"
      | "validation_output"
      | "diagnostic"
      | "model_summary"
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

    label:
      | "Strong"
      | "Caution"
      | "Weak"
      | "Insufficient"

    evidenceCoverage:
      | "High"
      | "Partial"
      | "Low"

    sourceTraceability:
      | "Available"
      | "Partial"
      | "Missing"

    weakContextRisk:
      | "Low"
      | "Low-Medium"
      | "Medium"
      | "Medium-High"
      | "High"

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
      | "low"
      | "medium"
      | "high"
      | "critical"
  }>

  reasoningTrace: string[]
}