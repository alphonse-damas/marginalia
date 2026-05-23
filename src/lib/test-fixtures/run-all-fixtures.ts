import fs from "node:fs"
import path from "node:path"

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, {
    withFileTypes: true,
  })

  let results: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      results = results.concat(walk(fullPath))
    } else if (entry.name.endsWith(".txt")) {
      results.push(fullPath)
    }
  }

  return results
}

const fixturesRoot = path.join(
  process.cwd(),
  "src",
  "lib",
  "test-fixtures"
)

const files = walk(fixturesRoot)

console.log("\n========================================")
console.log("MARGINALIA FIXTURE DISCOVERY")
console.log("========================================")

console.log(`Total Fixtures Found: ${files.length}`)

for (const file of files) {
  console.log("\n----------------------------------------")
  console.log(path.relative(process.cwd(), file))

  const raw = fs.readFileSync(file, "utf-8")

  console.log(`Characters: ${raw.length}`)

  const firstLines = raw
    .split("\n")
    .slice(0, 5)
    .join("\n")

  console.log("\nPreview:")
  console.log(firstLines)
}