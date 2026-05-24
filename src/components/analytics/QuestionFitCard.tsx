import { HelpCircle } from "lucide-react"

type Props = {
  analysis: any
}

export function QuestionFitCard({ analysis }: Props) {
  const question =
    analysis.question ??
    analysis.context?.question ??
    "No question supplied."

  const answerable =
    analysis.questionAnswerable ??
    analysis.governance?.answerable ??
    null

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-violet-300" />

        <h3 className="font-semibold text-white">
          Question Context
        </h3>
      </div>

      <p className="text-sm leading-relaxed text-slate-300">
        {question}
      </p>

      <div className="mt-4 text-sm">
        <span className="text-slate-400">
          Answerability:
        </span>{" "}

        <span className="font-medium text-violet-200">
          {answerable === true
            ? "Supported"
            : answerable === false
            ? "Not supported"
            : "Undetermined"}
        </span>
      </div>
    </div>
  )
}