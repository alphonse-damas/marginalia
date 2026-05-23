import fs from "node:fs"
import path from "node:path"

import type { MetricArtifact } from "./types"

export function loadMetricArtifactStore(): MetricArtifact[] {
  const filePath = path.join(
    process.cwd(),
    "metrics_artifact_store.json"
  )

  const raw = fs.readFileSync(filePath, "utf-8")

  return JSON.parse(raw)
}

export function loadLatestMetricRun(): MetricArtifact {
  const runs = loadMetricArtifactStore()

  if (!Array.isArray(runs) || runs.length === 0) {
    throw new Error(
      "metrics_artifact_store.json contains no runs."
    )
  }

  return runs[runs.length - 1]
}