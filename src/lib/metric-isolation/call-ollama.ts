import fs from "node:fs"
import path from "node:path"

const rawPath = path.join(
  process.cwd(),
  "src/lib/ingestion/raw/sample_03.txt"
)

const promptPath = path.join(
  process.cwd(),
  "src/lib/metric-isolation/ollama-isolation-prompt.txt"
)

const rawText = fs.readFileSync(rawPath, "utf-8")
const prompt = fs.readFileSync(promptPath, "utf-8")

async function main() {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.1:8b",
      prompt: `${prompt}

Raw analytical output:

${rawText}`,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`)
  }

  const data = await response.json()

  console.log(data.response)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})