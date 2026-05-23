export type MetricArtifact = {
  pid: string

  created_at: string

  prompt_file?: string

  raw_data_file?: string

  input_file?: string

  detected_source_type: string | null

  metric_count: number

  instructions_snapshot?: string

  metrics: MetricEntry[]
}

export type MetricEntry = {
  metric_name: string

  metric_value: string

  section: string

  source_type: string
}