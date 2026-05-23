import { Target } from "lucide-react"

import { mockAnalysis } from "@/lib/mock-analysis"

import { Badge } from "@/components/ui/badge"

type QuestionFitCardProps = {
  analysis: typeof mockAnalysis
}

export function QuestionFitCard({ analysis }: QuestionFitCardProps) {
  return (
    <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Target className="h-4 w-4 text-blue-300" />

        <h3 className="text-sm font-semibold text-blue-100">
          Question Fit
        </h3>
      </div>

      <Badge className="bg-green-500/15 text-green-300">
        {analysis.question.answerability}
      </Badge>

      <p className="mt-3 text-sm leading-relaxed text-gray-300">
        {analysis.question.alignment}
      </p>
    </div>
  )
}