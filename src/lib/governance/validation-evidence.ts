// src/lib/governance/validation-evidence.ts

export type ValidationEvidenceSignal = {
  key: string
  present: boolean
  evidenceType:
    | "holdout_testing"
    | "external_validation"
    | "test_set_metrics"
    | "train_test_split"
    | "validation_sample_size"
    | "confusion_matrix"
    | "validation_auc"
    | "validation_accuracy"
  reason: string
}

export type ValidationEvidenceSummary = {
  hasValidationEvidence: boolean
  signals: ValidationEvidenceSignal[]
  presentEvidenceKeys: string[]
  missingValidationSignals: string[]
}

type ValidationArtifactLike = {
  validation?: {
    holdoutTesting?: boolean | null
    externalValidation?: boolean | null
    testSetMetrics?: Record<string, unknown> | null
    trainTestSplit?: boolean | null
    validationSampleSize?: number | null
    confusionMatrix?: unknown
    auc?: number | null
    accuracy?: number | null
  }

  diagnostics?: {
    validationPerformed?: boolean | null
  }

  data?: {
    trainingRows?: number | null
    validationRows?: number | null
    testRows?: number | null
  }

  metrics?: {
    validation?: {
      auc?: number | null
      accuracy?: number | null
      confusionMatrix?: unknown
      [key: string]: unknown
    }

    performance?: {
      validationAuc?: number | null
      validationAccuracy?: number | null
      testAuc?: number | null
      testAccuracy?: number | null
      [key: string]: unknown
    }

    [key: string]: unknown
  }
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== ""
}

function addSignal(
  signals: ValidationEvidenceSignal[],
  signal: ValidationEvidenceSignal
) {
  if (!signals.some((item) => item.key === signal.key)) {
    signals.push(signal)
  }
}

export function detectValidationEvidence(
  artifact: ValidationArtifactLike
): ValidationEvidenceSummary {
  const signals: ValidationEvidenceSignal[] = []

  if (
    artifact.validation?.holdoutTesting === true ||
    artifact.diagnostics?.validationPerformed === true
  ) {
    addSignal(signals, {
      key: "validation",
      present: true,
      evidenceType: "holdout_testing",
      reason:
        "Holdout validation or explicit validation-performed flag was detected.",
    })
  }

  if (artifact.validation?.externalValidation === true) {
    addSignal(signals, {
      key: "external_validation",
      present: true,
      evidenceType: "external_validation",
      reason: "External validation evidence was detected.",
    })
  }

  if (
    artifact.validation?.testSetMetrics ||
    artifact.metrics?.validation ||
    hasValue(artifact.metrics?.performance?.testAuc) ||
    hasValue(artifact.metrics?.performance?.testAccuracy)
  ) {
    addSignal(signals, {
      key: "validation",
      present: true,
      evidenceType: "test_set_metrics",
      reason: "Validation or test-set metrics were detected.",
    })
  }

  if (
    artifact.validation?.trainTestSplit === true ||
    hasValue(artifact.data?.trainingRows) ||
    hasValue(artifact.data?.validationRows) ||
    hasValue(artifact.data?.testRows)
  ) {
    addSignal(signals, {
      key: "validation",
      present: true,
      evidenceType: "train_test_split",
      reason: "Train/test or validation split evidence was detected.",
    })
  }

  if (hasValue(artifact.validation?.validationSampleSize)) {
    addSignal(signals, {
      key: "validation_sample_size",
      present: true,
      evidenceType: "validation_sample_size",
      reason: "Validation sample size was detected.",
    })
  }

  if (
    artifact.validation?.confusionMatrix ||
    artifact.metrics?.validation?.confusionMatrix
  ) {
    addSignal(signals, {
      key: "confusion_matrix",
      present: true,
      evidenceType: "confusion_matrix",
      reason: "Validation confusion matrix evidence was detected.",
    })
  }

  if (
    hasValue(artifact.validation?.auc) ||
    hasValue(artifact.metrics?.validation?.auc) ||
    hasValue(artifact.metrics?.performance?.validationAuc) ||
    hasValue(artifact.metrics?.performance?.testAuc)
  ) {
    addSignal(signals, {
      key: "validation",
      present: true,
      evidenceType: "validation_auc",
      reason: "Validation AUC was detected.",
    })
  }

  if (
    hasValue(artifact.validation?.accuracy) ||
    hasValue(artifact.metrics?.validation?.accuracy) ||
    hasValue(artifact.metrics?.performance?.validationAccuracy) ||
    hasValue(artifact.metrics?.performance?.testAccuracy)
  ) {
    addSignal(signals, {
      key: "validation",
      present: true,
      evidenceType: "validation_accuracy",
      reason: "Validation accuracy was detected.",
    })
  }

  const presentEvidenceKeys = Array.from(
    new Set(signals.map((signal) => signal.key))
  )

  return {
    hasValidationEvidence: presentEvidenceKeys.includes("validation"),
    signals,
    presentEvidenceKeys,
    missingValidationSignals:
      presentEvidenceKeys.length > 0
        ? []
        : [
            "holdout_testing",
            "external_validation",
            "test_set_metrics",
            "train_test_split",
          ],
  }
}