import { mockAnalyses } from "@/lib/mock-analyses"

export type AnalysisArtifact = (typeof mockAnalyses)[number]

export function getTrustState(analysis: AnalysisArtifact) {
  if (analysis.trust.refusalNeeded) {
    return {
      state: "refusal",
      label: "Question exceeds evidence",
      banner:
        "This question cannot be answered safely from the available evidence.",
      border: "border-red-400/30",
      bg: "bg-red-500/10",
      text: "text-red-200",
      accent: "text-red-300",
    }
  }

  if (analysis.trust.weakContextRisk === "High") {
    return {
      state: "conflicted",
      label: "Conflicting or unstable evidence",
      banner:
        "The evidence is mixed. Use this output for scenario planning, not final decisions.",
      border: "border-orange-400/30",
      bg: "bg-orange-500/10",
      text: "text-orange-100",
      accent: "text-orange-300",
    }
  }

  if (
    analysis.trust.weakContextRisk === "Medium-High" ||
    analysis.question.answerability === "partially_answerable"
  ) {
    return {
      state: "caution",
      label: "Use with caution",
      banner:
        "The evidence partially supports the question, but confidence should be limited.",
      border: "border-yellow-400/30",
      bg: "bg-yellow-500/10",
      text: "text-yellow-100",
      accent: "text-yellow-300",
    }
  }

  return {
    state: "trusted",
    label: "Evidence supports the question",
    banner:
      "The available evidence is adequate for an association-based interpretation.",
    border: "border-green-400/30",
    bg: "bg-green-500/10",
    text: "text-green-100",
    accent: "text-green-300",
  }
}