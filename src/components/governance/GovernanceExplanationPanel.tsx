type ExplanationItem = {
  label: string
  value?: string | number
  reason: string
}

type GovernanceExplanationPanelProps = {
  title: string
  summary: string
  items: ExplanationItem[]
}

export function GovernanceExplanationPanel({
  title,
  summary,
  items,
}: GovernanceExplanationPanelProps) {
  return (
    <details className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <summary className="cursor-pointer list-none text-sm font-semibold text-white">
        <div className="flex items-center justify-between">
          <span>Explain This Score: {title}</span>

          <span className="text-xs text-slate-400">
            Click to expand
          </span>
        </div>
      </summary>

      <div className="mt-4">
        <p className="text-sm leading-relaxed text-slate-300">
          {summary}
        </p>

        <div className="mt-4 space-y-3">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-lg border border-white/10 bg-slate-900/60 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-slate-100">
                  {item.label}
                </div>

                {item.value !== undefined && (
                  <div className="text-sm font-semibold text-violet-200">
                    {item.value}
                  </div>
                )}
              </div>

              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      </div>
    </details>
  )
}