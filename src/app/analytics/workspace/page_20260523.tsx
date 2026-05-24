"use client"

import { useState } from "react"

import {
  AlertTriangle,
  FileText,
  Shield,
} from "lucide-react"

import { mockAnalyses } from "@/lib/mock-analyses"

import { AnalysisUploader } from "@/components/analytics/AnalysisUploader"
import { InterpretationPanel } from "@/components/analytics/InterpretationPanel"
import { TrustScoreCard } from "@/components/analytics/TrustScoreCard"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AnalyticsWorkspacePage() {
  const [analysis, setAnalysis] = useState<
    (typeof mockAnalyses)[number] | null
  >(null)

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.20),transparent_45%)] pointer-events-none" />

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
              Upload or paste model outputs, statistical tables, BI reports, or
              analytical summaries. Marginalia converts them into structured
              interpretations with trust scoring, reasoning traces, and
              weak-context warnings.
            </p>
          </div>

          <Button className="bg-violet-600 hover:bg-violet-500">
            New Analysis
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr_0.9fr]">
          {/* LEFT PANEL */}
          <Card className="border-white/10 bg-[#07101f]/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-violet-300" />
                Input
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <AnalysisUploader onAnalysisLoaded={setAnalysis} />

              <div className="rounded-xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-100">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  MVP Note
                </div>

                This version uses structured mock artifacts first. Real parsing
                and ingestion pipelines come after the trust architecture
                stabilizes.
              </div>
            </CardContent>
          </Card>

          {/* CENTER + RIGHT */}
          {analysis ? (
            <>
              <InterpretationPanel analysis={analysis} />

              <TrustScoreCard analysis={analysis} />
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
            Load one of the mock analyses to simulate the Marginalia trust
            workflow. Different analytical situations will dynamically change:
            interpretation behavior, trust scoring, question adequacy,
            weak-context risk, and refusal behavior.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}