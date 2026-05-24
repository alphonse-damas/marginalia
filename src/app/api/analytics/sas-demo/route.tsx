import path from "node:path"
import { NextResponse } from "next/server"

import { canonicalMetricsToArtifact } from "@/lib/metric-canonicalization/canonical-metrics-to-artifact"
import { canonicalizeMetric } from "@/lib/metric-canonicalization/canonicalize-metric"
import { parseOllamaMetricText } from "@/lib/metric-isolation/parse-ollama-metric-file"
import { repairOllamaMetricText } from "@/lib/metric-isolation/repair-ollama-metric-text"

const OLLAMA_URL = "http://localhost:11434/api/generate"
const OLLAMA_MODEL = "llama3.1:8b"

export async function GET() {
  try {
    const rawSasPath = path.join(
      process.cwd(),
      "src",
      "lib",
      "csv-intake",
      "templates",
      "sas_logistic_with_roc_01.txt"
    )

    const fs = await import("node:fs/promises")
    const rawSasText = await fs.readFile(rawSasPath, "utf-8")

    const prompt = `
You are extracting analytical metrics from SAS PROC LOGISTIC output.

Return one metric per line using this exact format:

Metric Name: Metric Value

Do not summarize.
Do not explain.
Do not invent missing values.
If a metric is not present, omit it.

Extract all available:
- Data Set
- Response Variable
- Number of Response Levels
- Model
- Optimization Technique
- Number of Observations Read
- Number of Observations Used
- Probability modeled
- AIC Intercept Only
- AIC Intercept and Covariates
- SC Intercept Only
- SC Intercept and Covariates
- -2 Log L Intercept Only
- -2 Log L Intercept and Covariates
- Likelihood Ratio Chi-Square
- Likelihood Ratio DF
- Likelihood Ratio Pr > ChiSq
- Score Chi-Square
- Score DF
- Score Pr > ChiSq
- Wald Chi-Square
- Wald DF
- Wald Pr > ChiSq
- predictor estimates
- predictor standard errors
- predictor Wald chi-square
- predictor Pr > ChiSq
- odds ratios
- confidence intervals
- Percent Concordant
- Percent Discordant
- Percent Tied
- Somers' D
- Gamma
- Tau-a
- c
- AUC
- Standard Error for AUC
- 95% Confidence Limits for AUC
- Overall Percent Correct

Raw SAS output:

${rawSasText}
`

    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")

      return NextResponse.json(
        {
          error: `Ollama request failed: ${response.status}`,
          detail: errorText,
        },
        { status: 500 }
      )
    }

    const data = await response.json()

    const rawMetricText = String(data.response ?? "").trim()
    const repairedMetricText = repairOllamaMetricText(rawMetricText)

    const parsedMetrics = parseOllamaMetricText(repairedMetricText)

    const canonicalMetrics = parsedMetrics.map((metric) =>
      canonicalizeMetric({
        metricName: metric.metric_name,
        metricValue: metric.metric_value,
      })
    )

    const artifact = canonicalMetricsToArtifact({
      canonicalMetrics,
      suspectedFormat: "sas_logistic_raw_demo",
      question: {
        primary: "Which factors predict the target outcome?",
        intent: "predictive",
        stakes: "medium",
      },
    })

    return NextResponse.json({
      artifact,
      audit: {
        demoFile: "sas_logistic_with_roc_01.txt",
        parsedMetricCount: parsedMetrics.length,
        canonicalMetricCount: canonicalMetrics.length,
        rawMetricText,
        repairedMetricText,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process example raw SAS evidence.",
      },
      { status: 500 }
    )
  }
}