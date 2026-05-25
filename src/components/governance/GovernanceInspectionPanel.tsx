// src/components/governance/GovernanceInspectionPanel.tsx

import { GovernanceEvaluation } from "@/lib/governance/governance-semantics-v1";

type Props = {
  evaluation: GovernanceEvaluation;
};

export function GovernanceInspectionPanel({ evaluation }: Props) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-slate-100">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Governance Inspection
        </p>
        <h2 className="text-2xl font-semibold">
          Trust Score: {evaluation.trustScore}
        </h2>
        <p className="text-sm text-slate-400">
          Band: {evaluation.trustBand}
        </p>
      </div>

      <div className="space-y-4">
        <details className="rounded-xl border border-slate-800 p-4">
          <summary className="cursor-pointer font-medium">
            Score Breakdown
          </summary>

          <div className="mt-3 space-y-2 text-sm">
            <p>Starting Score: {evaluation.scoreBreakdown.startingScore}</p>

            {evaluation.scoreBreakdown.penalties.length === 0 ? (
              <p className="text-emerald-400">No penalties applied.</p>
            ) : (
              <ul className="space-y-2">
                {evaluation.scoreBreakdown.penalties.map((penalty, index) => (
                  <li key={index} className="rounded-lg bg-slate-900 p-3">
                    <p className="font-medium">
                      {penalty.label}: {penalty.value}
                    </p>
                    <p className="text-slate-400">{penalty.reason}</p>
                  </li>
                ))}
              </ul>
            )}

            <p>Final Score: {evaluation.scoreBreakdown.finalScore}</p>
          </div>
        </details>

        <details className="rounded-xl border border-slate-800 p-4">
          <summary className="cursor-pointer font-medium">
            Score Adjustments
          </summary>

          <div className="mt-3 text-sm">
            {evaluation.scoreAdjustments.length === 0 ? (
              <p className="text-slate-400">No score adjustments applied.</p>
            ) : (
              <ul className="space-y-2">
                {evaluation.scoreAdjustments.map((adjustment, index) => (
                  <li key={index} className="rounded-lg bg-slate-900 p-3">
                    <p className="font-medium">
                      {adjustment.type}: {adjustment.from} → {adjustment.to}
                    </p>
                    <p className="text-slate-400">{adjustment.reason}</p>
                  </li>
                ))}
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
              evaluation.improvementRecommendations.map((recommendation) => (
                <li key={recommendation}>{recommendation}</li>
              ))
            )}
          </ul>
        </details>
      </div>
    </section>
  );
}