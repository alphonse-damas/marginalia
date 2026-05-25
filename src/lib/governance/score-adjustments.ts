// src/lib/governance/score-adjustments.ts

export type ScoreAdjustmentType =
  | "high_confidence_cap"
  | "policy_override"
  | "calibration_adjustment";

export type ScoreAdjustment = {
  type: ScoreAdjustmentType;
  from: number;
  to: number;
  reason: string;
};