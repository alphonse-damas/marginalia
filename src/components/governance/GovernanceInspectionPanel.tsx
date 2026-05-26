import { GovernanceEvaluation } from "@/lib/governance/governance-semantics-v1"
import { GovernanceExplanationPanel } from "./GovernanceExplanationPanel"

type Props = {
  evaluation: GovernanceEvaluation
}

export function GovernanceInspectionPanel({ evaluation }: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Governance Inspection
        </p>

        <h2 className="mt-1 text-3xl font-semibold">
          Governance Trust Score: {evaluation.trustScore}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Band: {evaluation.trustBand}
        </p>
      </div>

      <div className="space-y-4">
        <GovernanceExplanationPanel
          title="Evidence Coverage"
          summary="Evidence coverage reflects how much relevant analytical evidence was detected relative to what is expected for the question type."
          items={[
            {
              label: "Coverage Level",
              value: evaluation.evidenceCoverage,
              reason:
                evaluation.evidenceCoverage === "strong"
                  ? "Strong usable analytical evidence was detected for this question type."
                  : evaluation.evidenceCoverage === "partial"
                    ? "Some required analytical evidence was detected, but governance-critical evidence remains missing."
                    : evaluation.evidenceCoverage === "low"
                      ? "Only minimal usable evidence was detected."
                      : "No usable analytical evidence was detected.",
            },
            {
              label: "Missing Evidence Count",
              value: evaluation.missingEvidence.length,
              reason:
                evaluation.missingEvidence.length > 0
                  ? "Governance penalties were applied because required or recommended evidence was not detected."
                  : "No major evidence gaps were detected.",
            },
          ]}
        />

        <GovernanceExplanationPanel
          title="Weak Context Risk"
          summary="Weak-context risk measures how unstable, ambiguous, incomplete, or extraction-dependent the interpretation pathway may be."
          items={[
            {
              label: "Weak Context Risk",
              value: evaluation.weakContextRisk,
              reason:
                evaluation.weakContextRisk === "low"
                  ? "The evidence appears structured, stable, and sufficiently contextualized."
                  : evaluation.weakContextRisk === "medium"
                    ? "The evidence required interpretive extraction or lacked some governance-critical context."
                    : "The evidence appears incomplete, unstable, or highly ambiguous.",
            },
            {
              label: "Source Traceability",
              value: evaluation.sourceTraceability,
              reason:
                evaluation.sourceTraceability === "high"
                  ? "The platform detected structured and reproducible evidence."
                  : evaluation.sourceTraceability === "moderate"
                    ? "The evidence required partial extraction or reconstruction."
                    : "The source could not be reliably traced or reconstructed.",
            },
          ]}
        />

        <GovernanceExplanationPanel
          title="Question Fit"
          summary="Question fit measures whether the uploaded evidence can reasonably support the analytical question being asked."
          items={[
            {
              label: "Question Fit",
              value: evaluation.questionFit,
              reason:
                evaluation.questionFit === "strong"
                  ? "The detected evidence strongly aligns with the requested analytical interpretation."
                  : evaluation.questionFit === "partial"
                    ? "The evidence partially supports the requested interpretation."
                    : evaluation.questionFit === "weak"
                      ? "The uploaded evidence is missing required support for the selected question type."
                      : "The uploaded evidence does not support the requested interpretation.",
            },
          ]}
        />

        <details className="rounded-xl border border-slate-800 p-4">
          <summary className="cursor-pointer font-medium">
            Score Breakdown
          </summary>

          <div className="mt-3 space-y-2 text-sm">
            <p>
              Starting Score:{" "}
              {evaluation.scoreBreakdown.startingScore}
            </p>

            {evaluation.scoreBreakdown.penalties.length === 0 ? (
              <p className="text-emerald-400">
                No penalties applied.
              </p>
            ) : (
              <ul className="space-y-2">
                {evaluation.scoreBreakdown.penalties.map(
                  (penalty, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-slate-900 p-3"
                    >
                      <p className="font-medium">
                        {penalty.label}: {penalty.value}
                      </p>

                      <p className="text-slate-400">
                        {penalty.reason}
                      </p>
                    </li>
                  )
                )}
              </ul>
            )}

            <p>
              Final Score:{" "}
              {evaluation.scoreBreakdown.finalScore}
            </p>
          </div>
        </details>

        <details className="rounded-xl border border-slate-800 p-4">
          <summary className="cursor-pointer font-medium">
            Score Adjustments
          </summary>

          <div className="mt-3 text-sm">
            {evaluation.scoreAdjustments.length === 0 ? (
              <p className="text-slate-400">
                No score adjustments applied.
              </p>
            ) : (
              <ul className="space-y-2">
                {evaluation.scoreAdjustments.map(
                  (adjustment, index) => (
                    <li
                      key={index}
                      className="rounded-lg bg-slate-900 p-3"
                    >
                      <p className="font-medium">
                        {adjustment.type}: {adjustment.from} →{" "}
                        {adjustment.to}
                      </p>

                      <p className="text-slate-400">
                        {adjustment.reason}
                      </p>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        </details>

        <details className="rounded-xl border border-slate-800 p-4">
          <summary className="cursor-pointer font-medium">
            Missing Evidence
          </summary>

          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {evaluation.missingEvidence.length === 0 ? (
              <li>No missing evidence detected.</li>
            ) : (
              evaluation.missingEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))
            )}
          </ul>
        </details>

        <details className="rounded-xl border border-slate-800 p-4">
          <summary className="cursor-pointer font-medium">
            Governance Warnings
          </summary>

          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {evaluation.governanceWarnings.length === 0 ? (
              <li>No governance warnings.</li>
            ) : (
              evaluation.governanceWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))
            )}
          </ul>
        </details>

        <details className="rounded-xl border border-slate-800 p-4">
          <summary className="cursor-pointer font-medium">
            Improvement Recommendations
          </summary>

          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
            {evaluation.improvementRecommendations.length === 0 ? (
              <li>No improvement recommendations.</li>
            ) : (
              evaluation.improvementRecommendations.map(
                (recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                )
              )
            )}
          </ul>
        </details>
      </div>
    </section>
  )
}