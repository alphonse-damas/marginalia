import { AlertTriangle } from "lucide-react"

type Props = {
  analysis: any
}

export function EvidenceGapPanel({ analysis }: Props) {
  const evidenceGaps =
    analysis.evidenceGaps ??
    analysis.missingEvidence ??
    []

  if (!evidenceGaps.length) {
    return null
  }

  return (
    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-300" />

        <h3 className="font-semibold text-yellow-100">
          Evidence Gaps
        </h3>
      </div>

      <ul className="space-y-2 text-sm text-yellow-50/90">
        {evidenceGaps.map((gap: string, index: number) => (
          <li key={`${gap}-${index}`}>
            • {gap}
          </li>
        ))}
      </ul>
    </div>
  )
}