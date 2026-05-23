import type {
  CanonicalFixedMetricKey,
  CanonicalMetric,
  CanonicalPredictorMetricType,
} from "./types"

export function canonicalizeMetric({
  metricName,
  metricValue,
}: {
  metricName: string
  metricValue: string
}): CanonicalMetric {
  const fixedKey = canonicalizeFixedMetric(metricName)

  if (fixedKey) {
    return {
      kind: "fixed_model_metric",
      rawName: metricName,
      rawValue: metricValue,
      key: fixedKey,
    }
  }

  const predictorMetric = canonicalizePredictorMetric(metricName)

  if (predictorMetric) {
    return {
      kind: "predictor_metric",
      rawName: metricName,
      rawValue: metricValue,
      predictorName: predictorMetric.predictorName,
      metricType: predictorMetric.metricType,
    }
  }

  return {
    kind: "unknown",
    rawName: metricName,
    rawValue: metricValue,
  }
}

function canonicalizeFixedMetric(
  metricName: string
): CanonicalFixedMetricKey | null {
  const normalized = normalize(metricName)

  const aliases: Record<string, CanonicalFixedMetricKey> = {
    "data set": "data_set",

    "number of response levels": "number_of_response_levels",

    "number of observations read": "number_of_observations_read",
    "number of observations used": "number_of_observations_used",
    "number of observations": "number_of_observations_used",

    "response variable": "response_variable",
    "dependent variable": "response_variable",

    "probability modeled": "probability_modeled",

    model: "model",

    "optimization technique": "optimization_technique",

    "model convergence status": "convergence_status",
    "convergence criterion": "convergence_status",
    "convergence criterion gconv 1e 8": "convergence_status",

    "aic intercept only": "aic_intercept_only",
    "aic full model": "aic_full_model",
    "aic covariates": "aic_full_model",
    "aic intercept and covariates": "aic_full_model",

    "sc intercept only": "bic_intercept_only",
    "bic intercept only": "bic_intercept_only",
    "sc bic intercept only": "bic_intercept_only",

    "sc full model": "bic_full_model",
    "bic full model": "bic_full_model",
    "sc covariates": "bic_full_model",
    "sc intercept and covariates": "bic_full_model",
    "sc bic full model": "bic_full_model",

    "2 log l intercept only": "minus2_log_l_intercept_only",
    "2 log likelihood intercept only":
      "minus2_log_l_intercept_only",
    "minus2 log l intercept only":
      "minus2_log_l_intercept_only",
    "minus2 log likelihood intercept only":
      "minus2_log_l_intercept_only",

    "2 log l full model": "minus2_log_l_full_model",
    "2 log l covariates": "minus2_log_l_full_model",
    "2 log l intercept and covariates":
      "minus2_log_l_full_model",
    "2 log likelihood full model":
      "minus2_log_l_full_model",
    "minus2 log l full model":
      "minus2_log_l_full_model",
    "minus2 log likelihood full model":
      "minus2_log_l_full_model",
    "minus2 log l covariates":
      "minus2_log_l_full_model",
    "minus2 log l intercept and covariates":
      "minus2_log_l_full_model",

    "likelihood ratio chi square":
      "likelihood_ratio_chi_square",
    "chi square likelihood ratio test":
      "likelihood_ratio_chi_square",
    "likelihood ratio test chi square":
      "likelihood_ratio_chi_square",

    "likelihood ratio df": "likelihood_ratio_df",
    "df likelihood ratio": "likelihood_ratio_df",
    "df likelihood ratio test":
      "likelihood_ratio_df",
    "likelihood ratio test df":
      "likelihood_ratio_df",

    "likelihood ratio p value":
      "likelihood_ratio_p_value",
    "likelihood ratio pr chisq":
      "likelihood_ratio_p_value",
    "likelihood ratio pr > chisq":
      "likelihood_ratio_p_value",
    "pr > chisq likelihood ratio":
      "likelihood_ratio_p_value",
    "pr > chisq likelihood ratio test":
      "likelihood_ratio_p_value",

    "score chi square": "score_chi_square",
    "chi square score test": "score_chi_square",
    "score test chi square": "score_chi_square",

    "score df": "score_df",
    "df score": "score_df",
    "df score test": "score_df",
    "score test df": "score_df",

    "score p value": "score_p_value",
    "score pr chisq": "score_p_value",
    "score pr > chisq": "score_p_value",
    "pr > chisq score": "score_p_value",
    "pr > chisq score test": "score_p_value",

    "wald chi square": "wald_chi_square",
    "chi square wald test": "wald_chi_square",
    "wald test chi square": "wald_chi_square",

    "wald df": "wald_df",
    "df wald": "wald_df",
    "df wald test": "wald_df",
    "wald test df": "wald_df",

    "wald p value": "wald_p_value",
    "wald pr chisq": "wald_p_value",
    "wald pr > chisq": "wald_p_value",
    "pr > chisq wald": "wald_p_value",
    "pr > chisq wald test": "wald_p_value",

    "pseudo r squared": "pseudo_r_squared",
    "pseudo r squ": "pseudo_r_squared",

    "log likelihood": "log_likelihood",

    "ll null": "ll_null",

    "llr p value": "llr_p_value",

    auc: "auc",
    "area under the roc curve auc": "auc",
    "area under curve auc": "auc",
    "area under the roc curve": "auc",
    "area under curve": "auc",

    "standard error for auc":
      "auc_standard_error",
    "auc standard error":
      "auc_standard_error",

    "auc lower confidence limit":
      "auc_confidence_lower",

    "auc upper confidence limit":
      "auc_confidence_upper",

    "95 confidence limits for auc":
      "auc_confidence_interval",

    "95% confidence limits for auc":
      "auc_confidence_interval",

    "percent concordant":
      "percent_concordant",

    "percent discordant":
      "percent_discordant",

    "percent tied": "percent_tied",

    pairs: "pairs",

    "somers d": "somers_d",

    gamma: "gamma",

    "tau a": "tau_a",

    c: "c_statistic",
    "c statistic": "c_statistic",

    "overall percent correct":
      "overall_percent_correct",
  }

  return aliases[normalized] ?? null
}

function canonicalizePredictorMetric(
  metricName: string
): {
  predictorName: string
  metricType: CanonicalPredictorMetricType
} | null {
  const prefixStylePatterns: Array<{
    pattern: RegExp
    metricType: CanonicalPredictorMetricType
  }> = [
    { pattern: /^(.+?)\s+df$/i, metricType: "df" },

    {
      pattern: /^(.+?)\s+point estimate$/i,
      metricType: "odds_ratio",
    },

    {
      pattern: /^(.+?)\s+estimate$/i,
      metricType: "estimate",
    },

    {
      pattern: /^(.+?)\s+coef$/i,
      metricType: "estimate",
    },

    {
      pattern: /^(.+?)\s+standard error$/i,
      metricType: "standard_error",
    },

    {
      pattern: /^(.+?)\s+std err$/i,
      metricType: "standard_error",
    },

    {
      pattern: /^(.+?)\s+wald chi-square$/i,
      metricType: "wald_chi_square",
    },

    {
      pattern: /^(.+?)\s+wald chi square$/i,
      metricType: "wald_chi_square",
    },

    {
      pattern: /^(.+?)\s+z$/i,
      metricType: "z",
    },

    {
      pattern: /^(.+?)\s+t$/i,
      metricType: "t",
    },

    {
      pattern: /^(.+?)\s+p>\|z\|$/i,
      metricType: "p_value",
    },

    {
      pattern: /^(.+?)\s+pr > chisq$/i,
      metricType: "p_value",
    },

    {
      pattern: /^(.+?)\s+p-value$/i,
      metricType: "p_value",
    },

    {
      pattern: /^(.+?)\s+p value$/i,
      metricType: "p_value",
    },

    {
      pattern: /^(.+?)\s+odds ratio$/i,
      metricType: "odds_ratio",
    },

    {
      pattern: /^(.+?)\s+95% wald confidence limits$/i,
      metricType: "confidence_interval",
    },

    {
      pattern:
        /^(.+?)\s+95% wald confidence limits lower$/i,
      metricType: "confidence_lower",
    },

    {
      pattern:
        /^(.+?)\s+95% wald confidence limits upper$/i,
      metricType: "confidence_upper",
    },

    {
      pattern: /^(.+?)\s+0\.025 ci$/i,
      metricType: "confidence_lower",
    },

    {
      pattern: /^(.+?)\s+0\.975 ci$/i,
      metricType: "confidence_upper",
    },
  ]

  for (const item of prefixStylePatterns) {
    const match = metricName.match(item.pattern)

    if (match?.[1]) {
      return {
        predictorName: match[1].trim(),
        metricType: item.metricType,
      }
    }
  }

  const parentheticalStylePatterns: Array<{
    pattern: RegExp
    metricType: CanonicalPredictorMetricType
  }> = [
    {
      pattern:
        /^standard estimate\s+\((.+?)\)$/i,
      metricType: "estimate",
    },

    {
      pattern: /^estimate\s+\((.+?)\)$/i,
      metricType: "estimate",
    },

    {
      pattern: /^coef\s+\((.+?)\)$/i,
      metricType: "estimate",
    },

    {
      pattern:
        /^standard error\s+\((.+?)\)$/i,
      metricType: "standard_error",
    },

    {
      pattern: /^std err\s+\((.+?)\)$/i,
      metricType: "standard_error",
    },

    {
      pattern:
        /^chi-square\s+\((.+?)\)$/i,
      metricType: "wald_chi_square",
    },

    {
      pattern:
        /^chi square\s+\((.+?)\)$/i,
      metricType: "wald_chi_square",
    },

    {
      pattern:
        /^wald chi-square\s+\((.+?)\)$/i,
      metricType: "wald_chi_square",
    },

    {
      pattern:
        /^wald chi square\s+\((.+?)\)$/i,
      metricType: "wald_chi_square",
    },

    {
      pattern:
        /^pr > chisq\s+\((.+?)\)$/i,
      metricType: "p_value",
    },

    {
      pattern:
        /^p>\|z\|\s+\((.+?)\)$/i,
      metricType: "p_value",
    },

    {
      pattern:
        /^p-value\s+\((.+?)\)$/i,
      metricType: "p_value",
    },

    {
      pattern:
        /^p value\s+\((.+?)\)$/i,
      metricType: "p_value",
    },

    {
      pattern:
        /^point estimate\s+\((.+?)\)$/i,
      metricType: "odds_ratio",
    },

    {
      pattern:
        /^odds ratio\s+\((.+?)\)$/i,
      metricType: "odds_ratio",
    },

    {
      pattern:
        /^95% wald confidence limits\s+\((.+?)\)$/i,
      metricType: "confidence_interval",
    },
  ]

  for (const item of parentheticalStylePatterns) {
    const match = metricName.match(item.pattern)

    if (match?.[1]) {
      return {
        predictorName: match[1].trim(),
        metricType: item.metricType,
      }
    }
  }

  return null
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[():']/g, " ")
    .replace(/=/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}