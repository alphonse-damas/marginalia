// src/components/analytics/TrustScoreCard.tsx

import {
  Shield,
  FileCheck,
  GitBranch,
  AlertTriangle,
  Ban,
} from "lucide-react"

import { mockAnalyses } from "@/lib/mock-analyses"
import { QuestionFitCard } from "@/components/analytics/QuestionFitCard"
import { EvidenceGapPanel } from "@/components/analytics/EvidenceGapPanel"

type TrustScoreCardProps = {
  analysis: (typeof mockAnalyses)[number]
}

function TrustRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-sm text-slate-300">{label}</span>

      <span className="text-sm font-medium text-violet-200">
        {value}
      </span>
    </div>
  )
}

export function TrustScoreCard({
  analysis,
}: TrustScoreCardProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-300" />

          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
            Trust Layer
          </h2>
        </div>

        <div className="mt-4 text-center">
          <div className="text-sm text-emerald-100/80">
            Trust Score
          </div>

          <div className="mt-1 text-6xl font-bold text-white">
            {analysis.trust.score}
          </div>

          <div className="mt-2 text-sm font-medium text-emerald-200">
            {analysis.trust.label}
          </div>
        </div>
      </div>

      <QuestionFitCard analysis={analysis} />

      <EvidenceGapPanel analysis={analysis} />

      <TrustRow
        label="Evidence Coverage"
        value={analysis.trust.evidenceCoverage}
      />

      <TrustRow
        label="Source Traceability"
        value={analysis.trust.sourceTraceability}
      />

      <TrustRow
        label="Weak Context Risk"
        value={analysis.trust.weakContextRisk}
      />

      <TrustRow
        label="Refusal Needed"
        value={analysis.trust.refusalNeeded ? "Yes" : "No"}
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-violet-300" />

          <h3 className="font-semibold text-white">
            Evidence Objects
          </h3>
        </div>

        <div className="space-y-2">
          {analysis.evidenceObjects.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-sm text-slate-300"
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400" />

              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-violet-300" />

          <h3 className="font-semibold text-white">
            Reasoning Trace
          </h3>
        </div>

        <ol className="space-y-3">
          {analysis.reasoningTrace.map((step, index) => (
            <li
              key={step}
              className="flex gap-3 text-sm text-slate-300"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">
                {index + 1}
              </div>

              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {analysis.trust.refusalNeeded && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
          <div className="flex items-start gap-3">
            <Ban className="mt-0.5 h-5 w-5 text-red-300" />

            <div>
              <h3 className="font-semibold text-red-100">
                Refusal Triggered
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-red-50/90">
                The available evidence does not safely support the
                requested claim or operational use case.
              </p>
            </div>
          </div>
        </div>
      )}

      {analysis.trust.weakContextRisk === "High" && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-300" />

            <div>
              <h3 className="font-semibold text-yellow-100">
                Weak Context Warning
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-yellow-50/90">
                The retrieved evidence may be incomplete, unstable,
                outdated, or insufficient for confident interpretation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}