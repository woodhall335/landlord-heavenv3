import type { MasterQuestionSet } from './mqs-loader';
import type { ExtendedWizardQuestion } from './types';
import { questionIsApplicable } from './mqs-loader';

type ReviewNavigationResult = {
  nextQuestion: ExtendedWizardQuestion | null;
  isComplete: boolean;
};

export function getReviewNavigation(
  mqs: MasterQuestionSet,
  facts: Record<string, any>,
  currentQuestionId?: string | null,
): ReviewNavigationResult {
  const applicableQuestions = mqs.questions.filter((q) => questionIsApplicable(mqs, q, facts));

  if (applicableQuestions.length === 0) {
    return { nextQuestion: null, isComplete: true };
  }

  const currentIndex = currentQuestionId
    ? applicableQuestions.findIndex((q) => q.id === currentQuestionId)
    : -1;

  // If no cursor was provided, start from the first applicable question
  if (currentIndex === -1) {
    return { nextQuestion: applicableQuestions[0], isComplete: false };
  }

  const nextIndex = currentIndex + 1;

  if (nextIndex >= applicableQuestions.length) {
    return { nextQuestion: null, isComplete: true };
  }

  return { nextQuestion: applicableQuestions[nextIndex], isComplete: false };
}
