import { NextRequest, NextResponse } from "next/server"

import { csvToArtifact } from "@/lib/csv-intake/csv-to-artifact"
import { parseCsvText } from "@/lib/csv-intake/parse-csv"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const modelFile = formData.get("modelCsv") as File | null
    const predictorFile = formData.get("predictorCsv") as File | null

    if (!modelFile || !predictorFile) {
      return NextResponse.json(
        {
          error:
            "Both modelCsv and predictorCsv files are required.",
        },
        { status: 400 }
      )
    }

    const modelCsvText = await modelFile.text()
    const predictorCsvText = await predictorFile.text()

    const artifact = csvToArtifact({
      modelRows: parseCsvText(modelCsvText),
      predictorRows: parseCsvText(predictorCsvText),
      question: {
        primary: "Which factors predict the target outcome?",
        intent: "predictive",
        stakes: "medium",
      },
    })

    return NextResponse.json(artifact)
  } catch (error) {
    console.error("CSV upload route failed:", error)

    return NextResponse.json(
      {
        error:
          "Failed to process canonical CSV upload.",
      },
      { status: 500 }
    )
  }
}