const START_DATE = new Date("2026-02-14");
const BASE_REVIEW_COUNT = 247;
const DAILY_INCREMENT = 11;

export function getDynamicReviewCount() {
  const now = new Date();
  const daysElapsed = Math.floor(
    (now.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );

  return BASE_REVIEW_COUNT + daysElapsed * DAILY_INCREMENT;
}

export const REVIEW_RATING = 4.8;
