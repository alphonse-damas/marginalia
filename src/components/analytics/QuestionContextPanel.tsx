import { HelpCircle } from "lucide-react"

import { mockAnalysis } from "@/lib/mock-analysis"

import { Badge } from "@/components/ui/badge"

type QuestionContextPanelProps = {
  analysis: typeof mockAnalysis
}

export function QuestionContextPanel({ analysis }: QuestionContextPanelProps) {
  return (
    <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
      <div className="mb-2 flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-violet-300" />
        <h3 className="text-sm font-semibold text-violet-100">
          Question Context
        </h3>
      </div>

      <p className="text-base font-semibold text-white">
        {analysis.question.primary}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge className="bg-white/10 text-violet-200">
          Intent: {analysis.question.intent}
        </Badge>

        <Badge className="bg-white/10 text-violet-200">
          Stakes: {analysis.question.stakes}
        </Badge>

        <Badge className="bg-green-500/15 text-green-300">
          {analysis.question.answerability}
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-300">
        {analysis.question.alignment}
      </p>
    </div>
  )
}