export type CanonicalMetricKind =
  | "fixed_model_metric"
  | "predictor_metric"
  | "unknown"

export type CanonicalFixedMetricKey =
  | "data_set"
  | "number_of_response_levels"
  | "number_of_observations_read"
  | "number_of_observations_used"
  | "response_variable"
  | "probability_modeled"
  | "model"
  | "optimization_technique"
  | "convergence_status"
  | "aic_intercept_only"
  | "aic_full_model"
  | "bic_intercept_only"
  | "bic_full_model"
  | "minus2_log_l_intercept_only"
  | "minus2_log_l_full_model"
  | "likelihood_ratio_chi_square"
  | "likelihood_ratio_df"
  | "likelihood_ratio_p_value"
  | "score_chi_square"
  | "score_df"
  | "score_p_value"
  | "wald_chi_square"
  | "wald_df"
  | "wald_p_value"
  | "pseudo_r_squared"
  | "log_likelihood"
  | "ll_null"
  | "llr_p_value"
  | "auc"
  | "auc_standard_error"
  | "auc_confidence_lower"
  | "auc_confidence_upper"
  | "auc_confidence_interval"
  | "percent_concordant"
  | "percent_discordant"
  | "percent_tied"
  | "pairs"
  | "somers_d"
  | "gamma"
  | "tau_a"
  | "c_statistic"
  | "overall_percent_correct"

export type CanonicalPredictorMetricType =
  | "df"
  | "estimate"
  | "standard_error"
  | "wald_chi_square"
  | "z"
  | "t"
  | "p_value"
  | "odds_ratio"
  | "confidence_lower"
  | "confidence_upper"
  | "confidence_interval"
  | "unknown"

export type CanonicalMetric =
  | {
      kind: "fixed_model_metric"
      rawName: string
      rawValue: string
      key: CanonicalFixedMetricKey
    }
  | {
      kind: "predictor_metric"
      rawName: string
      rawValue: string
      predictorName: string
      metricType: CanonicalPredictorMetricType
    }
  | {
      kind: "unknown"
      rawName: string
      rawValue: string
    }