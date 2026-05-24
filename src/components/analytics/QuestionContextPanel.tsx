import { FileQuestion } from "lucide-react"

type Props = {
  analysis: any
}

export function QuestionContextPanel({ analysis }: Props) {
  const question = normalizeQuestion(analysis)

  const sourceType =
    analysis.metadata?.sourceType ??
    analysis.sourceType ??
    "Unknown"

  const modelType =
    analysis.model?.family ??
    analysis.model?.name ??
    "Unknown model"

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileQuestion className="h-5 w-5 text-violet-300" />

        <h3 className="font-semibold text-white">
          Analysis Context
        </h3>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-slate-400">
            Question:
          </span>

          <p className="mt-1 text-slate-200">
            {question}
          </p>
        </div>

        <div className="flex gap-6">
          <div>
            <span className="text-slate-400">
              Source:
            </span>

            <div className="text-slate-200">
              {sourceType}
            </div>
          </div>

          <div>
            <span className="text-slate-400">
              Model:
            </span>

            <div className="text-slate-200">
              {modelType}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function normalizeQuestion(analysis: any): string {
  const question = analysis.question ?? analysis.context?.question

  if (!question) {
    return "No analytical question provided."
  }

  if (typeof question === "string") {
    return question
  }

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