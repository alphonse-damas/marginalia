import path from "node:path"

import { parseCsvFile } from "./parse-csv"

const modelPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "csv-intake",
  "templates",
  "logistic_regression_model.csv"
)

const predictorsPath = path.join(
  process.cwd(),
  "src",
  "lib",
  "csv-intake",
  "templates",
  "logistic_regression_predictors.csv"
)

console.log("\n========================================")
console.log("CSV INTAKE PARSER TEST")
console.log("========================================")

console.log("\nMODEL CSV")
console.log(parseCsvFile(modelPath))

console.log("\nPREDICTORS CSV")
console.log(parseCsvFile(predictorsPath))