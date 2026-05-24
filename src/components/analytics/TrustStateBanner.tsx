import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from "lucide-react"

type Props = {
  analysis: any
}

export function TrustStateBanner({
  analysis,
}: Props) {
  const trust = analysis.trust ?? {}

  const score = trust.score ?? 0

  let Icon = ShieldAlert
  let label = "Caution"
  let style =
    "border-yellow-400/20 bg-yellow-500/10 text-yellow-100"

  if (score >= 85) {
    Icon = ShieldCheck
    label = "Strong Trust"
    style =
      "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
  }

  if (score <= 50) {
    Icon = ShieldX
    label = "Low Trust"
    style =
      "border-red-400/20 bg-red-500/10 text-red-100"
  }

  return (
    <div className={`rounded-2xl border p-5 ${style}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5" />

        <div>
          <div className="font-semibold">
            {label}
          </div>

          <div className="text-sm opacity-90">
            Trust Score: {trust.score ?? "N/A"}
          </div>
        </div>
      </div>
    </div>
  )
}