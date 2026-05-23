import { Upload } from "lucide-react"

import { Button } from "@/components/ui/button"

type AnalysisUploadProps = {
  onSelectMockAnalysis?: () => void
}

export function AnalysisUpload({
  onSelectMockAnalysis,
}: AnalysisUploadProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-dashed border-violet-400/40 bg-violet-500/5 p-8 text-center">
        <Upload className="mx-auto mb-4 h-10 w-10 text-violet-300" />

        <h2 className="font-semibold text-white">
          Upload analysis output
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          SAS, Python, R, Excel, CSV, Tableau exports, or plain text.
        </p>

        <Button
          onClick={onSelectMockAnalysis}
          className="mt-5 bg-violet-600 hover:bg-violet-500"
        >
          Load Mock Analysis
        </Button>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-200">
          Supported Inputs
        </h3>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
          Regression output, model summaries, odds-ratio tables,
          confidence intervals, ROC/AUC metrics, CSV extracts,
          Excel sheets, and BI report exports.
        </div>
      </div>
    </div>
  )
}