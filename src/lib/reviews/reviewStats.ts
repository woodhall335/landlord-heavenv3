const START_DATE_UTC = Date.UTC(2026, 1, 14);
const BASE_REVIEW_COUNT = 247;
const DAILY_INCREMENT = 11;

export function getDynamicReviewCount() {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysElapsed = Math.max(0, Math.floor((todayUTC - START_DATE_UTC) / 86400000));

  return BASE_REVIEW_COUNT + daysElapsed * DAILY_INCREMENT;
}

export const REVIEW_RATING = 4.8;
