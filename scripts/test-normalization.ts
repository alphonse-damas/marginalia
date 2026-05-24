import { normalizeOutputToArtifact } from "./normalize-output"
import { sampleRawOutput } from "./sample-raw-outputs"

const artifact = normalizeOutputToArtifact({
  rawText: sampleRawOutput,
  sourceEngine: null,
  question: {
    primary: "Which factors predict honors completion?",
    intent: "predictive",
    stakes: "medium",
  },
})

console.log("\n========================================")
console.log("NORMALIZATION TEST")
console.log("========================================")

console.log("Model:", artifact.model.name)
console.log("Target:", artifact.model.target)
console.log("Observations:", artifact.data.observations)
console.log("Trust:", artifact.trust.score, artifact.trust.label)
console.log("Missing Evidence:", artifact.missingEvidence)