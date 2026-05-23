"use client"

import { useState } from "react"

import { mockAnalyses } from "@/lib/mock-analyses"
import { AnalysisUpload } from "./AnalysisUpload"

type AnalysisUploaderProps = {
  onAnalysisLoaded: (analysis: (typeof mockAnalyses)[number]) => void
}

const analysisOptions = [
  {
    label: "Strong Logistic Regression",
    description: "Answerable question with adequate evidence.",
    index: 0,
  },
  {
    label: "Weak Small Sample",
    description: "Partially answerable with weak evidence.",
    index: 1,
  },
  {
    label: "Refusal Example",
    description: "Question exceeds what the evidence can support.",
    index: 2,
  },
  {
    label: "Conflicting Evidence",
    description: "Mixed evidence and high weak-context risk.",
    index: 3,
  },
]

export function AnalysisUploader({
  onAnalysisLoaded,
}: AnalysisUploaderProps) {
  const [loadingLabel, setLoadingLabel] = useState<string | null>(null)

  const handleLoad = async (index: number, label: string) => {
    setLoadingLabel(label)

    await new Promise((resolve) => setTimeout(resolve, 900))

    onAnalysisLoaded(mockAnalyses[index])

    setLoadingLabel(null)
  }

  if (loadingLabel) {
    return (
      <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-8 text-center">
        <div className="text-lg font-semibold text-violet-200">
          Parsing {loadingLabel}...
        </div>

        <p className="mt-2 text-sm text-violet-300/80">
          Building structured evidence objects, question fit, and trust metadata.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-400 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <AnalysisUpload />

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-200">
          Load Scenario
        </h3>

        {analysisOptions.map((option) => (
          <button
            key={option.label}
            onClick={() => handleLoad(option.index, option.label)}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-violet-400/40 hover:bg-violet-500/10"
          >
            <div className="font-semibold text-white">
              {option.label}
            </div>

            <div className="mt-1 text-sm text-gray-400">
              {option.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}