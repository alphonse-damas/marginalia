import { validateAnalysisArtifact } from "@/lib/artifacts"
import { metricsToArtifact } from "./metrics-to-artifact"
import { parseIsolatedMetrics } from "./parse-isolated-metrics"

const isolatedMetricText = `
Number of Observations Read: 200
Number of Observations Used: 200
AIC (Intercept Only): 233.289
SC (Intercept Only): 236.587
-2 Log L (Intercept Only): 231.289
AIC (Covariates): 168.236
SC (Covariates): 181.430
-2 Log L (Covariates): 160.236
Likelihood Ratio Chi-Square: 71.0525
Likelihood Ratio DF: 3
Likelihood Ratio p-value: <.0001
Score Chi-Square: 61.7721
Score DF: 3
Score p-value: <.0001
Wald Chi-Square: 41.8176
Wald DF: 3
Wald p-value: <.0001
`

const metrics = parseIsolatedMetrics(isolatedMetricText)

const artifact = metricsToArtifact({
  metrics,
  question: {
    primary: "Which factors predict honors completion?",
    intent: "predictive",
    stakes: "medium",
  },
})

const validation = validateAnalysisArtifact(artifact)

console.log("\n========================================")
console.log("METRIC ISOLATION → ARTIFACT TEST")
console.log("========================================")
console.log("Parsed Metrics:", metrics)
console.log("Source Engine:", artifact.metadata.sourceEngine)
console.log("Target:", artifact.model.target)
console.log("Observations:", artifact.data.observations)
console.log("AIC Full Model:", artifact.metrics.modelFit.fullModel.aic)
console.log("BIC Full Model:", artifact.metrics.modelFit.fullModel.bic)
console.log(
  "-2 Log L Full Model:",
  artifact.metrics.modelFit.fullModel.minus2LogLikelihood
)
console.log("Likelihood Ratio:", artifact.metrics.significanceTests.likelihoodRatio)
console.log("Score:", artifact.metrics.significanceTests.score)
console.log("Wald:", artifact.metrics.significanceTests.wald)
console.log("Missing Evidence:", artifact.missingEvidence)
console.log("Trust:", artifact.trust.score, artifact.trust.label)
console.log("Validation:", validation)