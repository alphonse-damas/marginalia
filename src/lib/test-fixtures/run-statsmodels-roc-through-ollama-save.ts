import fs from "node:fs"
import path from "node:path"

const fixturePath = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "statsmodels",
  "statsmodels_logit_standard_with_roc_01.txt"
)

const promptPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "metric-isolation",
  "ollama-isolation-prompt.txt"
)

const outputDir = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures",
  "outputs"
)

const outputPath = path.join(
  outputDir,
  "statsmodels_logit_standard_with_roc_01.metrics.txt"
)

const raw = fs.readFileSync(fixturePath, "utf-8")
const prompt = fs.readFileSync(promptPath, "utf-8")

async function main() {
  fs.mkdirSync(outputDir, { recursive: true })

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.1:8b",
      prompt: `${prompt}

Raw analytical output:

${raw}`,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`)
  }

  const data = await response.json()
  const isolatedMetrics = String(data.response).trim()

  fs.writeFileSync(outputPath, isolatedMetrics, "utf-8")

  console.log("\n========================================")
  console.log("STATSMODELS ROC OLLAMA METRIC ISOLATION SAVED")
  console.log("========================================")
  console.log("Input Fixture:", fixturePath)
  console.log("Output File:", outputPath)
  console.log("\nPreview:\n")
  console.log(isolatedMetrics.slice(0, 1600))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})