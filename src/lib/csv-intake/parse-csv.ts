import fs from "node:fs"

export type CsvRow = Record<string, string>

export function parseCsvFile(filePath: string): CsvRow[] {
  const raw = fs.readFileSync(filePath, "utf-8")
  return parseCsvText(raw)
}

export function parseCsvText(raw: string): CsvRow[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  const headers = splitCsvLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)

    return headers.reduce<CsvRow>((row, header, index) => {
      row[header] = values[index]?.trim() ?? ""
      return row
    }, {})
  })
}

function splitCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === "," && !inQuotes) {
      values.push(current)
      current = ""
      continue
    }

    current += char
  }

  values.push(current)

  return values
}