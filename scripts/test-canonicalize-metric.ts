import { canonicalizeMetric } from "./canonicalize-metric"

const samples = [
  // =====================================================
  // GLOBAL MODEL METRICS
  // =====================================================

  "Likelihood Ratio Chi-Square",
  "Chi-Square (Likelihood Ratio Test)",

  "Likelihood Ratio Pr > ChiSq",
  "Pr > ChiSq (Likelihood Ratio Test)",

  "AIC Intercept and Covariates",
  "AIC (Intercept and Covariates)",

  "SC Intercept and Covariates",
  "SC (Intercept and Covariates)",

  "-2 Log L Intercept and Covariates",
  "-2 Log L (Intercept and Covariates)",

  // =====================================================
  // ROC / ASSOCIATION METRICS
  // =====================================================

  "Area Under the ROC Curve (AUC)",
  "Area Under Curve (AUC)",
  "AUC",

  "Standard Error for AUC",

  "Percent Concordant",
  "Percent Discordant",
  "Percent Tied",

  "Pairs",

  "Somers' D",
  "Gamma",
  "Tau-a",

  "c",

  "Overall Percent Correct",

  // =====================================================
  // PREFIX STYLE PREDICTOR METRICS
  // =====================================================

  "GRE Estimate",
  "GRE Standard Error",
  "GRE Wald Chi-Square",
  "GRE Pr > ChiSq",
  "GRE Odds Ratio",
  "GRE Point Estimate",

  "GRE 95% Wald Confidence Limits Lower",
  "GRE 95% Wald Confidence Limits Upper",

  // =====================================================
  // PARENTHETICAL STYLE PREDICTOR METRICS
  // =====================================================

  "Standard Estimate (GRE)",
  "Standard Error (GRE)",
  "Chi-Square (GRE)",
  "Pr > ChiSq (GRE)",
  "Point Estimate (GRE)",

  // =====================================================
  // STATSMODELS STYLE
  // =====================================================

  "mean_texture coef",
  "mean_texture std err",
  "mean_texture z",
  "mean_texture P>|z|",
  "mean_texture 0.025 CI",
  "mean_texture 0.975 CI",
]

console.log("\n========================================")
console.log("METRIC CANONICALIZATION TEST")
console.log("========================================")

for (const sample of samples) {
  console.log(
    sample,
    "=>",
    canonicalizeMetric({
      metricName: sample,
      metricValue: "123",
    })
  )
}