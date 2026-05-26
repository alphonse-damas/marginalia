import {
  AlertTriangle,
  Ban,
  FileCheck,
  GitBranch,
  HelpCircle,
  Shield,
} from "lucide-react"

import { GovernanceExplanationPanel } from "@/components/governance/GovernanceExplanationPanel"

type TrustScoreCardProps = {
  analysis: any
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
  const trust = analysis?.trust ?? {}
  const governance = analysis?.governance ?? {}
  const question = normalizeQuestion(analysis)

  const trustScore = trust.score ?? 0
  const trustLabel = trust.label ?? "Unknown"
  const normalizedTrustLabel = String(trustLabel).toLowerCase()

  const evidenceObjects =
    analysis?.evidenceObjects ??
    governance?.evidenceObjects ??
    analysis?.evidence?.map((item: any) =>
      typeof item === "string"
        ? item
        : item.label ??
          item.name ??
          item.type ??
          "Evidence object"
    ) ??
    []

  const reasoningTrace =
    analysis?.reasoningTrace ??
    governance?.reasoningTrace ??
    analysis?.warnings ??
    []

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-6">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-300" />

          <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
            Interpretation Reliability
          </h2>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
          This score reflects how reliably Marginalia can interpret the
          submitted analytical evidence. It is separate from Governance
          Inspection, which evaluates deployment readiness and evidence
          sufficiency.
        </p>

        <div className="mt-5 text-center">
          <div className="text-sm text-emerald-100/80">
            Interpretation Score
          </div>

          <div className="mt-1 text-6xl font-bold text-white">
            {trustScore}
          </div>

          <div className="mt-2 text-sm font-medium text-emerald-200">
            {trustLabel}
          </div>
        </div>

        <div className="mt-5">
          <GovernanceExplanationPanel
            title={`Interpretation Reliability: ${trustLabel}`}
            summary="This explains why Marginalia assigned this interpretation score and reliability band."
            items={[
              {
                label: "Interpretation Score",
                value: trustScore,
                reason:
                  trustScore >= 80
                    ? "The submitted evidence strongly supports stable interpretation."
                    : trustScore >= 60
                      ? "The submitted evidence supports interpretation, but governance caveats remain."
                      : "The submitted evidence is too incomplete or unstable for reliable interpretation.",
              },
              {
                label: "Interpretation Band",
                value: trustLabel,
                reason:
                  normalizedTrustLabel === "strong"
                    ? "Interpretation stability is considered strong."
                    : normalizedTrustLabel === "caution"
                      ? "Interpretation is possible, but governance caveats are present."
                      : "Interpretation reliability is currently weak or unsafe.",
              },
              {
                label: "Evidence Coverage",
                value: trust.evidenceCoverage ?? "Unknown",
                reason:
                  String(
                    trust.evidenceCoverage ?? ""
                  ).toLowerCase() === "partial"
                    ? "Some usable evidence was detected, but the evidence package is incomplete."
                    : String(
                          trust.evidenceCoverage ?? ""
                        ).toLowerCase() === "strong"
                      ? "The artifact contains broad usable evidence for interpretation."
                      : "The evidence package appears limited or incomplete.",
              },
              {
                label: "Weak Context Risk",
                value: trust.weakContextRisk ?? "Unknown",
                reason:
                  String(
                    trust.weakContextRisk ?? ""
                  ).toLowerCase() === "low"
                    ? "The evidence appears structured, traceable, and sufficiently contextualized."
                    : "The evidence may require qualification because context, validation, traceability, or completeness is limited.",
              },
            ]}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-violet-300" />

          <h3 className="font-semibold text-white">
            Question Fit
          </h3>
        </div>

        <p className="text-sm leading-relaxed text-slate-300">
          {question}
        </p>

        <div className="mt-3 text-sm text-slate-400">
          Answerability:{" "}
          <span className="font-medium text-violet-200">
            {analysis?.question?.answerability ??
              analysis?.questionAnswerable ??
              "Undetermined"}
          </span>
        </div>
      </div>

      <TrustRow
        label="Evidence Coverage"
        value={trust.evidenceCoverage ?? "Unknown"}
      />

      <TrustRow
        label="Source Traceability"
        value={trust.sourceTraceability ?? "Unknown"}
      />

      <TrustRow
        label="Weak Context Risk"
        value={trust.weakContextRisk ?? "Unknown"}
      />

      <TrustRow
        label="Human Review Required"
        value={governance.requiresHumanReview ? "Yes" : "No"}
      />

      <TrustRow
        label="Deployment Supported"
        value={governance.deploymentSupported ? "Yes" : "No"}
      />

      <TrustRow
        label="Refusal Needed"
        value={trust.refusalNeeded ? "Yes" : "No"}
      />

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-violet-300" />

          <h3 className="font-semibold text-white">
            Evidence Objects
          </h3>
        </div>

        <div className="space-y-2">
          {evidenceObjects.length === 0 ? (
            <p className="text-sm text-slate-400">
              No evidence objects detected.
            </p>
          ) : (
            evidenceObjects.map((item: string, index: number) => (
              <div
                key={`${item}-${index}`}
                className="flex items-center gap-2 text-sm text-slate-300"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-400" />

                <span>{item}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-violet-300" />

          <h3 className="font-semibold text-white">
            Reasoning Trace
          </h3>
        </div>

        {reasoningTrace.length === 0 ? (
          <p className="text-sm text-slate-400">
            No reasoning trace available.
          </p>
        ) : (
          <ol className="space-y-3">
            {reasoningTrace.map((step: string, index: number) => (
              <li
                key={`${step}-${index}`}
                className="flex gap-3 text-sm text-slate-300"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-violet-200">
                  {index + 1}
                </div>

                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      {trust.refusalNeeded && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
          <div className="flex items-start gap-3">
            <Ban className="mt-0.5 h-5 w-5 text-red-300" />

            <div>
              <h3 className="font-semibold text-red-100">
                Refusal Triggered
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-red-50/90">
                The available evidence does not safely support the requested
                claim or operational use case.
              </p>
            </div>
          </div>
        </div>
      )}

      {String(
        trust.weakContextRisk ?? ""
      ).toLowerCase() === "high" && (
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-300" />

            <div>
              <h3 className="font-semibold text-yellow-100">
                Weak Context Warning
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-yellow-50/90">
                The retrieved evidence may be incomplete, unstable, outdated,
                or insufficient for confident interpretation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function normalizeQuestion(analysis: any): string {
  const question =
    analysis?.question ??
    analysis?.context?.question

  if (!question) return "No analytical question provided."

  if (typeof question === "string") return question

  if (typeof question === "object") {
    return (
      question.primary ??
      question.text ??
      question.prompt ??
      "No analytical question provided."
    )
  }

  return String(question)
}