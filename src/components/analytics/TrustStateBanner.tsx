import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react"

import { getTrustState, type AnalysisArtifact } from "@/lib/trust-state"

type TrustStateBannerProps = {
  analysis: AnalysisArtifact
}

export function TrustStateBanner({ analysis }: TrustStateBannerProps) {
  const trustState = getTrustState(analysis)

  const Icon =
    trustState.state === "trusted"
      ? CheckCircle2
      : trustState.state === "refusal"
        ? ShieldAlert
        : AlertTriangle

  return (
    <div
      className={`rounded-2xl border ${trustState.border} ${trustState.bg} p-4`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 ${trustState.accent}`} />

        <div>
          <h3 className={`font-semibold ${trustState.text}`}>
            {trustState.label}
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-gray-300">
            {trustState.banner}
          </p>
        </div>
      </div>
    </div>
  )
}