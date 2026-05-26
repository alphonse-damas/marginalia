"use client"

import { useState } from "react"

import {
  AlertTriangle,
  Database,
  FileSpreadsheet,
  FileText,
  Loader2,
  Shield,
} from "lucide-react"

import { mockAnalyses } from "@/lib/mock-analyses"
import { buildGovernanceFromArtifact } from "@/lib/governance/build-governance-from-artifact"

import { InterpretationPanel } from "@/components/analytics/InterpretationPanel"
import { TrustScoreCard } from "@/components/analytics/TrustScoreCard"
import { GovernanceInspectionPanel } from "@/components/governance/GovernanceInspectionPanel"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type IntakeMode = "raw_sas" | "canonical_csv"
type WorkspaceAnalysis = (typeof mockAnalyses)[number]

export default function AnalyticsWorkspacePage() {
  const [analysis, setAnalysis] = useState<WorkspaceAnalysis | null>(null)
  const [intakeMode, setIntakeMode] = useState<IntakeMode>("raw_sas")

  const [isLoadingCsvDemo, setIsLoadingCsvDemo] = useState(false)
  const [csvDemoError, setCsvDemoError] = useState<string | null>(null)

  const [modelCsvFile, setModelCsvFile] = useState<File | null>(null)
  const [predictorCsvFile, setPredictorCsvFile] = useState<File | null>(null)
  const [isUploadingCsv, setIsUploadingCsv] = useState(false)
  const [csvUploadError, setCsvUploadError] = useState<string | null>(null)

  const [sasFile, setSasFile] = useState<File | null>(null)
  const [isUploadingSas, setIsUploadingSas] = useState(false)
  const [isLoadingSasDemo, setIsLoadingSasDemo] = useState(false)
  const [sasUploadError, setSasUploadError] = useState<string | null>(null)

  const governanceEvaluation = analysis
    ? buildGovernanceFromArtifact(analysis as any)
    : null

  function startNewAnalysis() {
    setAnalysis(null)

    setCsvDemoError(null)
    setCsvUploadError(null)
    setSasUploadError(null)

    setModelCsvFile(null)
    setPredictorCsvFile(null)
    setSasFile(null)

    setIsLoadingCsvDemo(false)
    setIsUploadingCsv(false)
    setIsUploadingSas(false)
    setIsLoadingSasDemo(false)
  }

  async function loadCanonicalCsvDemo() {
    try {
      setIsLoadingCsvDemo(true)
      setCsvDemoError(null)
      setCsvUploadError(null)

      const response = await fetch("/api/analytics/csv-demo")

      if (!response.ok) {
        throw new Error("Failed to load example CSV evidence.")
      }

      const artifact = await response.json()
      setAnalysis(artifact)
    } catch (error) {
      setCsvDemoError(
        error instanceof Error
          ? error.message
          : "Failed to load example CSV evidence."
      )
    } finally {
      setIsLoadingCsvDemo(false)
    }
  }

  async function loadRawSasDemo() {
    try {
      setIsLoadingSasDemo(true)
      setSasUploadError(null)

      const response = await fetch("/api/analytics/sas-demo")

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(
          errorData?.error ?? "Failed to load example raw SAS evidence."
        )
      }

      const result = await response.json()
      setAnalysis(result.artifact ?? result)
    } catch (error) {
      setSasUploadError(
        error instanceof Error
          ? error.message
          : "Failed to load example raw SAS evidence."
      )
    } finally {
      setIsLoadingSasDemo(false)
    }
  }

  async function uploadCanonicalCsvEvidence() {
    try {
      setIsUploadingCsv(true)
      setCsvUploadError(null)
      setCsvDemoError(null)

      if (!modelCsvFile || !predictorCsvFile) {
        throw new Error("Please select both the model CSV and predictor CSV.")
      }

      const formData = new FormData()
      formData.append("modelCsv", modelCsvFile)
      formData.append("predictorCsv", predictorCsvFile)

      const response = await fetch("/api/analytics/upload-csv", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(
          errorData?.error ?? "Failed to upload canonical CSV evidence."
        )
      }

      const artifact = await response.json()
      setAnalysis(artifact)
    } catch (error) {
      setCsvUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload canonical CSV evidence."
      )
    } finally {
      setIsUploadingCsv(false)
    }
  }

  async function uploadRawSasEvidence() {
    try {
      setIsUploadingSas(true)
      setSasUploadError(null)

      if (!sasFile) {
        throw new Error("Please select a raw SAS output file.")
      }

      const formData = new FormData()
      formData.append("sasFile", sasFile)

      const response = await fetch("/api/analytics/upload-sas", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)

        throw new Error(
          errorData?.error ?? "Failed to upload raw SAS evidence."
        )
      }

      const result = await response.json()
      setAnalysis(result.artifact)
    } catch (error) {
      setSasUploadError(
        error instanceof Error
          ? error.message
          : "Failed to upload raw SAS evidence."
      )
    } finally {
      setIsUploadingSas(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.20),transparent_45%)]" />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Badge className="mb-3 border-white/10 bg-white/5 text-violet-200">
              Marginalia Analytics Workspace
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight">
              Interpret analytical outputs with evidence.
            </h1>

            <p className="mt-3 max-w-3xl text-gray-300">
              Marginalia converts statistical outputs, model summaries, BI
              reports, and analytical evidence into governed interpretations
              with trust scoring, reasoning traces, and weak-context warnings.
            </p>
          </div>

          <Button
            onClick={startNewAnalysis}
            className="bg-violet-600 hover:bg-violet-500"
          >
            New Analysis
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr_0.9fr]">
          <Card className="border-white/10 bg-[#07101f]/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-300" />
                Evidence Intake
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
                <button
                  onClick={() => setIntakeMode("raw_sas")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    intakeMode === "raw_sas"
                      ? "bg-violet-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Raw SAS
                </button>

                <button
                  onClick={() => setIntakeMode("canonical_csv")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    intakeMode === "canonical_csv"
                      ? "bg-emerald-600 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Canonical CSV
                </button>
              </div>

              {intakeMode === "raw_sas" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-violet-400/20 bg-violet-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Database className="h-5 w-5 text-violet-300" />

                      <div className="font-semibold">
                        Raw SAS Output Ingestion
                      </div>
                    </div>

                    <p className="text-sm text-gray-300">
                      Upload raw SAS analytical output for AI-assisted metric
                      extraction, repair, canonicalization, trust scoring, and
                      governance interpretation.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-200">
                        Flexible
                      </Badge>

                      <Badge className="bg-yellow-500/20 text-yellow-200">
                        Exploratory
                      </Badge>

                      <Badge className="bg-yellow-500/20 text-yellow-200">
                        Higher Ambiguity Risk
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 text-sm font-semibold text-violet-200">
                      Interpretive AI Pipeline
                    </div>

                    <div className="space-y-1 text-sm text-gray-300">
                      <div>Raw SAS Output</div>
                      <div>↓</div>
                      <div>LLM Metric Isolation</div>
                      <div>↓</div>
                      <div>Repair + Canonicalization</div>
                      <div>↓</div>
                      <div>AnalysisArtifact Generation</div>
                      <div>↓</div>
                      <div>Trust & Governance Interpretation</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-violet-400/30 bg-violet-500/[0.03] p-6 text-center">
                    <Database className="mx-auto mb-3 h-10 w-10 text-violet-300" />

                    <div className="font-medium">Upload Raw SAS Output</div>

                    <p className="mt-2 text-sm text-gray-400">
                      Upload a plain text SAS PROC LOGISTIC output file.
                    </p>

                    <div className="mt-5 space-y-3">
                      <label className="block rounded-xl border border-violet-400/20 bg-white/[0.03] p-3 text-left text-sm">
                        <div className="mb-2 font-medium text-violet-200">
                          SAS Output File
                        </div>

                        <input
                          type="file"
                          accept=".txt,.log,text/plain"
                          onChange={(event) =>
                            setSasFile(event.target.files?.[0] ?? null)
                          }
                          className="block w-full text-xs text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-violet-500"
                        />

                        {sasFile && (
                          <div className="mt-2 text-xs text-violet-300">
                            Selected: {sasFile.name}
                          </div>
                        )}
                      </label>

                      <Button
                        onClick={uploadRawSasEvidence}
                        disabled={isUploadingSas || isLoadingSasDemo}
                        className="w-full bg-violet-600 text-white hover:bg-violet-500"
                      >
                        {isUploadingSas ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing Raw SAS Evidence...
                          </span>
                        ) : (
                          "Analyze Raw SAS Evidence"
                        )}
                      </Button>

                      <Button
                        onClick={loadRawSasDemo}
                        disabled={isUploadingSas || isLoadingSasDemo}
                        variant="outline"
                        className="w-full border-violet-400/30 bg-transparent text-violet-200 hover:bg-violet-500/10"
                      >
                        {isLoadingSasDemo ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading Example Evidence...
                          </span>
                        ) : (
                          "Try Example Evidence"
                        )}
                      </Button>

                      {(isUploadingSas || isLoadingSasDemo) && (
                        <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-4 text-left text-sm text-violet-100">
                          <div className="mb-1 font-semibold">
                            Marginalia is processing raw SAS evidence.
                          </div>

                          <div className="text-violet-100/80">
                            This path uses Ollama to isolate metrics, so it may
                            take longer than the deterministic CSV workflow.
                            The interpretation will appear automatically when
                            processing completes.
                          </div>
                        </div>
                      )}

                      {sasUploadError && (
                        <div className="text-sm text-red-300">
                          {sasUploadError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                    <div className="mb-2 flex items-center gap-2 font-semibold">
                      <AlertTriangle className="h-4 w-4" />
                      Interpretive Ingestion Warning
                    </div>

                    Raw analytical outputs provide flexibility and real-world
                    compatibility, but may introduce ambiguity, extraction
                    drift, parser instability, or incomplete evidence coverage.
                  </div>
                </div>
              )}

              {intakeMode === "canonical_csv" && (
                <div className="space-y-5">
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-300" />

                      <div className="font-semibold">
                        Canonical CSV Evidence
                      </div>
                    </div>

                    <p className="text-sm text-gray-300">
                      Download the templates, replace the demo values with your
                      own model evidence, then upload both CSV files for
                      deterministic trust evaluation.
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="bg-emerald-500/20 text-emerald-200">
                        Deterministic
                      </Badge>

                      <Badge className="bg-emerald-500/20 text-emerald-200">
                        Governance-Ready
                      </Badge>

                      <Badge className="bg-emerald-500/20 text-emerald-200">
                        Higher Trust
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="mb-3 text-sm font-semibold text-emerald-200">
                      Deterministic Governance Pipeline
                    </div>

                    <div className="space-y-1 text-sm text-gray-300">
                      <div>Canonical CSV Evidence</div>
                      <div>↓</div>
                      <div>Schema Validation</div>
                      <div>↓</div>
                      <div>Deterministic Artifact Builder</div>
                      <div>↓</div>
                      <div>Trust & Governance Interpretation</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-500/[0.03] p-6 text-center">
                    <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-emerald-300" />

                    <div className="font-medium">
                      Upload Canonical CSV Evidence
                    </div>

                    <p className="mt-2 text-sm text-gray-400">
                      Use the strict Marginalia template format:
                    </p>

                    <div className="mt-3 space-y-1 text-sm text-gray-300">
                      <div>• logistic_regression_model.csv</div>
                      <div>• logistic_regression_predictors.csv</div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <label className="block rounded-xl border border-emerald-400/20 bg-white/[0.03] p-3 text-left text-sm">
                        <div className="mb-2 font-medium text-emerald-200">
                          Model CSV
                        </div>

                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(event) =>
                            setModelCsvFile(event.target.files?.[0] ?? null)
                          }
                          className="block w-full text-xs text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-emerald-500"
                        />

                        {modelCsvFile && (
                          <div className="mt-2 text-xs text-emerald-300">
                            Selected: {modelCsvFile.name}
                          </div>
                        )}
                      </label>

                      <label className="block rounded-xl border border-emerald-400/20 bg-white/[0.03] p-3 text-left text-sm">
                        <div className="mb-2 font-medium text-emerald-200">
                          Predictor CSV
                        </div>

                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(event) =>
                            setPredictorCsvFile(
                              event.target.files?.[0] ?? null
                            )
                          }
                          className="block w-full text-xs text-gray-300 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-emerald-500"
                        />

                        {predictorCsvFile && (
                          <div className="mt-2 text-xs text-emerald-300">
                            Selected: {predictorCsvFile.name}
                          </div>
                        )}
                      </label>

                      <Button
                        onClick={uploadCanonicalCsvEvidence}
                        disabled={isUploadingCsv}
                        className="w-full bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        {isUploadingCsv
                          ? "Uploading CSV Evidence..."
                          : "Analyze Uploaded CSV Evidence"}
                      </Button>

                      <Button
                        onClick={loadCanonicalCsvDemo}
                        disabled={isLoadingCsvDemo}
                        variant="outline"
                        className="w-full border-emerald-400/30 bg-transparent text-emerald-200 hover:bg-emerald-500/10"
                      >
                        {isLoadingCsvDemo
                          ? "Loading Example Evidence..."
                          : "Try Example Evidence"}
                      </Button>

                      {(csvDemoError || csvUploadError) && (
                        <div className="text-sm text-red-300">
                          {csvUploadError ?? csvDemoError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    <div className="mb-2 flex items-center gap-2 font-semibold">
                      <Shield className="h-4 w-4" />
                      Deterministic Governance Intake
                    </div>

                    Canonical CSV evidence minimizes ambiguity and maximizes
                    auditability, reproducibility, governance stability, and
                    executive trust.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {analysis ? (
            <>
              <InterpretationPanel analysis={analysis} />

              <div className="space-y-6">
                <TrustScoreCard analysis={analysis} />

                {governanceEvaluation && (
                  <GovernanceInspectionPanel
                    evaluation={governanceEvaluation}
                  />
                )}
              </div>
            </>
          ) : (
            <EmptyWorkspaceState />
          )}
        </div>
      </section>
    </main>
  )
}

function EmptyWorkspaceState() {
  return (
    <div className="lg:col-span-2">
      <Card className="h-full border-white/10 bg-[#07101f]/90">
        <CardContent className="flex min-h-[520px] flex-col items-center justify-center text-center">
          <Shield className="mb-5 h-14 w-14 text-violet-300" />

          <h2 className="text-2xl font-semibold">
            No analysis loaded yet
          </h2>

          <p className="mt-3 max-w-xl text-gray-300">
            Load evidence into Marginalia to simulate the trust workflow.
            Different analytical situations dynamically affect: interpretation
            behavior, trust scoring, weak-context risk, refusal behavior,
            governance confidence, and evidence adequacy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}