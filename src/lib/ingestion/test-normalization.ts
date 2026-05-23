{
  name: "Raw SAS-style logistic dump without explicit source engine",
  rawText: sampleRawOutputs.rawSasLogisticDump,
  question: {
    primary: "Which factors predict honors completion?",
    intent: "explain" as const,
    stakes: "medium" as const,
  },
},