import path from "node:path"

import { parseOllamaMetricFile } from "./parse-ollama-metric-file"

const metricFilePath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "outputs",
  "sas_logistic_with_predictors_01.metrics.txt"
)

const metrics = parseOllamaMetricFile(metricFilePath)

console.log("\n========================================")
console.log("PARSED OLLAMA METRIC FILE")
console.log("========================================")

console.log("Metric Count:", metrics.length)

for (const metric of metrics) {
  console.log(`${metric.metric_name}: ${metric.metric_value}`)
}