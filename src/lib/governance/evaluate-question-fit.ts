// src/lib/governance/evaluate-question-fit.ts

import {
  QUESTION_REQUIREMENTS,
  QuestionType,
} from "./question-requirements";

export type QuestionFitEvaluation = {
  questionType: QuestionType;
  requiredEvidence: string[];
  recommendedEvidence: string[];
  presentEvidence: string[];
  missingRequiredEvidence: string[];
  missingRecommendedEvidence: string[];
  hasRequiredEvidence: boolean;
};

export function evaluateQuestionFit(
  questionType: QuestionType,
  presentEvidence: string[]
): QuestionFitEvaluation {
  const requirements = QUESTION_REQUIREMENTS[questionType];

  const requiredEvidence = requirements.required;
  const recommendedEvidence = requirements.recommended ?? [];

  const missingRequiredEvidence = requiredEvidence.filter(
    (item) => !presentEvidence.includes(item)
  );

  const missingRecommendedEvidence = recommendedEvidence.filter(
    (item) => !presentEvidence.includes(item)
  );

  return {
    questionType,
    requiredEvidence,
    recommendedEvidence,
    presentEvidence,
    missingRequiredEvidence,
    missingRecommendedEvidence,
    hasRequiredEvidence: missingRequiredEvidence.length === 0,
  };
}