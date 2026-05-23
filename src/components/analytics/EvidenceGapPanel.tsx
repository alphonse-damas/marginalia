import { AlertCircle } from "lucide-react"

import { mockAnalyses } from "@/lib/mock-analyses"

type EvidenceGapPanelProps = {
  analysis: (typeof mockAnalyses)[number]
}

export function EvidenceGapPanel({ analysis }: EvidenceGapPanelProps) {
  return (
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5">
      <div className="mb-3 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-300" />

        <h3 className="font-semibold text-yellow-100">
          Evidence Gaps
        </h3>
      </div>

      <ul className="space-y-2 text-sm text-yellow-50/90">
        {analysis.evidenceGaps.map((gap) => (
          <li key={gap}>• {gap}</li>
        ))}
      </ul>
    </div>
  )
}