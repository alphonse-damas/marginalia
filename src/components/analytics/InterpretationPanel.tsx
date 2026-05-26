import { AlertTriangle, BarChart3 } from "lucide-react"

import { mockAnalyses } from "@/lib/mock-analyses"

import { GovernanceExplanationPanel } from "@/components/governance/GovernanceExplanationPanel"
import { QuestionContextPanel } from "@/components/analytics/QuestionContextPanel"
import { TrustStateBanner } from "@/components/analytics/TrustStateBanner"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type InterpretationPanelProps = {
  analysis: (typeof mockAnalyses)[number] | any
}

export function InterpretationPanel({
  analysis,
}: InterpretationPanelProps) {
  const auc =
    analysis.model?.auc ??
    analysis.metrics?.roc?.auc ??
    analysis.metrics?.performance?.auc ??
    null

  const accuracy =
    analysis.model?.accuracy ??
    analysis.metrics?.classification?.overallPercentCorrect ??
    analysis.metrics?.performance?.accuracy ??
    null

  const trustScore =
    analysis.trust?.score ??
    analysis.trustScore ??
    0

  const trustBand =
    analysis.trust?.label ??
    analysis.trust?.level ??
    analysis.trustBand ??
    "Unknown"

  const normalizedTrustBand = String(
    trustBand ?? "unknown"
  ).toLowerCase()

  return (
    <Card className="border-white/10 bg-[#07101f]/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-300" />
          Interpretation
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        <QuestionContextPanel analysis={analysis} />

        <TrustStateBanner analysis={analysis} />

        <GovernanceExplanationPanel
          title={`${trustBand}: Trust Score ${trustScore}`}
          summary="This trust score reflects whether Marginalia can safely interpret the submitted analytical evidence in the current context."
          items={[
            {
              label: "Trust Score",
              value: trustScore,
              reason:
                trustScore >= 80
                  ? "The submitted evidence supports a strong interpretation with limited caveats."
                  : trustScore >= 60
                    ? "The submitted evidence supports interpretation, but caveats or governance limits remain."
                    : "The submitted evidence is too incomplete or unstable for reliable interpretation.",
            },

            {
              label: "Trust Band",
              value: trustBand,
              reason:
                normalizedTrustBand === "strong"
                  ? "The interpretation pathway is relatively stable and evidence-supported."
                  : normalizedTrustBand === "caution"
                    ? "Interpretation is allowed, but the system detected evidence gaps, ambiguity, or governance caveats."
                    : "The system detected substantial risk or insufficient evidence.",
            },

            {
              label: "Weak Context Risk",
              value:
                analysis.trust?.weakContextRisk ??
                "Unknown",
              reason:
                String(
                  analysis.trust?.weakContextRisk ?? ""
                ).toLowerCase() === "low"
                  ? "The evidence appears structured, traceable, and sufficiently contextualized."
                  : "The evidence may require qualification because context, validation, traceability, or completeness is limited.",
            },

            {
              label: "Evidence Coverage",
              value:
                analysis.trust?.evidenceCoverage ??
                "Unknown",
              reason:
                String(
                  analysis.trust?.evidenceCoverage ?? ""
                ).toLowerCase() === "high"
                  ? "The artifact contains broad usable evidence for interpretation."
                  : String(
                      analysis.trust?.evidenceCoverage ?? ""
                    ).toLowerCase() === "partial"
                    ? "Some usable evidence was detected, but the evidence package is incomplete."
                    : "The evidence package appears limited or incomplete.",
            },
          ]}
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {analysis.title ??
                analysis.metadata?.title ??
                "Analysis Artifact"}
            </h2>

            <Badge className="bg-green-500/15 text-green-300">
              Interpretable
            </Badge>
          </div>

          <p className="leading-relaxed text-gray-300">
            {analysis.interpretation?.summary ??
              "No summary available."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MiniStat
            label="AUC"
            value={auc !== null ? String(auc) : "N/A"}
            note="Predictive strength"
          />

          <MiniStat
            label="Accuracy"
            value={
              accuracy !== null
                ? accuracy > 1
                  ? `${accuracy}%`
                  : `${Math.round(accuracy * 1000) / 10}%`
                : "N/A"
            }
            note="Observed performance"
          />

          <MiniStat
            label="Evidence"
            value={String(
              analysis.evidence?.length ?? 0
            )}
            note="Sources parsed"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-3 font-semibold">
            Key Takeaways
          </h3>

          <ul className="space-y-3 text-sm text-gray-300">
            {(analysis.interpretation?.takeaways ?? []).map(
              (takeaway: string) => (
                <li key={takeaway}>
                  • {takeaway}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-3 font-semibold">
            Predictor Summary
          </h3>

          <div className="space-y-3">
            {(analysis.predictors ?? []).map(
              (predictor: any) => {
                const predictorName =
                  predictor.variable ??
                  predictor.name ??
                  "Unknown predictor"

                return (
                  <div
                    key={predictorName}
                    className="rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">
                        {predictorName}
                      </span>

                      <Badge
                        variant="outline"
                        className="border-violet-400/40 text-violet-300"
                      >
                        {predictor.oddsRatio !== null &&
                        predictor.oddsRatio !== undefined
                          ? `OR ${predictor.oddsRatio}`
                          : predictor.strength ??
                            predictor.significance ??
                            "N/A"}
                      </Badge>
                    </div>

                    <p className="mt-2 text-sm text-gray-300">
                      {predictor.interpretation ??
                        "Predictor evidence loaded from analysis artifact."}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      CI:{" "}
                      {predictor.confidenceInterval
                        ? `[${predictor.confidenceInterval[0]}, ${predictor.confidenceInterval[1]}]`
                        : "Not reported"}
                    </p>
                  </div>
                )
              }
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-red-200">
            <AlertTriangle className="h-4 w-4" />
            Caveats
          </h3>

          <ul className="space-y-2 text-sm leading-relaxed text-red-100/90">
            {(analysis.interpretation?.caveats ?? []).map(
              (caveat: string) => (
                <li key={caveat}>
                  • {caveat}
                </li>
              )
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function MiniStat({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-gray-400">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-gray-400">
        {note}
      </div>
    </div>
  )
}