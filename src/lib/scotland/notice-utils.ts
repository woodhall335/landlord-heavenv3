/**
 * Scotland Notice-Only Utilities
 *
 * Contains Scotland-specific utility functions for the notice_only product:
 * - Consecutive arrears streak calculation for Ground 18
 * - NaN-safe arrears amount calculation
 * - Stable service method key mapping
 *
 * These utilities are ONLY for Scotland notice_only and do NOT affect
 * England, Wales, or complete_pack flows.
 */

// Type for arrears items matching the canonical schema
interface ArrearsItem {
  period_start?: string;
  period_end?: string;
  rent_due?: number;
  rent_paid?: number;
  amount_owed?: number;
  // Allow other fields for flexibility
  [key: string]: unknown;
}

/**
 * Calculate the amount owed for an arrears item safely (no NaN).
 *
 * Handles undefined rent_due/rent_paid by treating them as 0.
 * Falls back to pre-computed amount_owed if available.
 *
 * @param item - The arrears item
 * @returns The amount owed (always a valid number >= 0)
 */
export function safeAmountOwed(item: ArrearsItem): number {
  // First try pre-computed amount_owed
  if (typeof item.amount_owed === 'number' && !isNaN(item.amount_owed)) {
    return Math.max(0, item.amount_owed);
  }

  // Compute from rent_due and rent_paid, treating undefined as 0
  const rentDue = typeof item.rent_due === 'number' && !isNaN(item.rent_due) ? item.rent_due : 0;
  const rentPaid = typeof item.rent_paid === 'number' && !isNaN(item.rent_paid) ? item.rent_paid : 0;

  return Math.max(0, rentDue - rentPaid);
}

/**
 * Normalize an arrears item to extract a sortable date and owed amount.
 *
 * Uses period_start as the primary date key for sorting.
 * Falls back to period_end or other date-like fields if period_start is missing.
 *
 * @param item - The arrears item
 * @returns Normalized item with dateKey (Date | null) and amountOwed (number)
 */
export function normalizeArrearsItem(item: ArrearsItem): {
  dateKey: Date | null;
  amountOwed: number;
  originalItem: ArrearsItem;
} {
  const amountOwed = safeAmountOwed(item);

  // Try to parse date from various possible fields (priority order)
  const dateFields = ['period_start', 'period_end', 'date', 'due_date', 'month'];
  let dateKey: Date | null = null;

  for (const field of dateFields) {
    const value = item[field];
    if (value && typeof value === 'string') {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        dateKey = parsed;
        break;
      }
    }
  }

  return { dateKey, amountOwed, originalItem: item };
}

/**
 * Calculate the maximum consecutive arrears streak for Scotland Ground 18.
 *
 * Ground 18 requires "3 or more consecutive months" of arrears.
 * This function computes the longest streak of consecutive rent periods
 * where the tenant owed money.
 *
 * Logic:
 * 1. Normalize all items to get date and amount owed
 * 2. Sort by date (ascending)
 * 3. Walk through sorted items, incrementing streak for each item with arrears > 0
 * 4. Reset streak when an item has arrears = 0
 * 5. Track the maximum streak seen
 *
 * NOTE: "Consecutive" here means adjacent items in the sorted schedule.
 * We assume each arrears item represents a rent period, so adjacency in the
 * sorted list implies consecutive periods. We do NOT check for calendar-month
 * gaps (e.g., missing a month in the schedule).
 *
 * If most items lack parseable dates, we fall back to the original array order.
 *
 * @param arrearsItems - Array of arrears items from facts
 * @returns Object with maxConsecutiveStreak and other stats
 */
export function calculateConsecutiveArrearsStreak(arrearsItems: ArrearsItem[]): {
  maxConsecutiveStreak: number;
  currentStreak: number;
  periodsWithArrears: number;
  totalPeriods: number;
  hasValidDates: boolean;
} {
  if (!Array.isArray(arrearsItems) || arrearsItems.length === 0) {
    return {
      maxConsecutiveStreak: 0,
      currentStreak: 0,
      periodsWithArrears: 0,
      totalPeriods: 0,
      hasValidDates: false,
    };
  }

  // Normalize all items
  const normalizedItems = arrearsItems.map(normalizeArrearsItem);

  // Count how many have valid dates
  const itemsWithDates = normalizedItems.filter(item => item.dateKey !== null);
  const hasValidDates = itemsWithDates.length >= normalizedItems.length / 2; // At least half have dates

  // Sort by date if we have enough valid dates, otherwise use original order
  let sortedItems: typeof normalizedItems;
  if (hasValidDates && itemsWithDates.length > 0) {
    // Sort items with dates first, then items without dates at the end
    sortedItems = [...normalizedItems].sort((a, b) => {
      if (a.dateKey === null && b.dateKey === null) return 0;
      if (a.dateKey === null) return 1; // null dates go to end
      if (b.dateKey === null) return -1;
      return a.dateKey.getTime() - b.dateKey.getTime();
    });
  } else {
    // Use original order if dates are unreliable
    sortedItems = normalizedItems;
  }

  // Calculate streaks
  let maxConsecutiveStreak = 0;
  let currentStreak = 0;
  let periodsWithArrears = 0;

  for (const item of sortedItems) {
    if (item.amountOwed > 0) {
      periodsWithArrears++;
      currentStreak++;
      maxConsecutiveStreak = Math.max(maxConsecutiveStreak, currentStreak);
    } else {
      // Reset streak on a fully-paid period
      currentStreak = 0;
    }
  }

  return {
    maxConsecutiveStreak,
    currentStreak,
    periodsWithArrears,
    totalPeriods: arrearsItems.length,
    hasValidDates,
  };
}

/**
 * Check if Ground 18 threshold is met (3+ consecutive months of arrears).
 *
 * @param arrearsItems - Array of arrears items from facts
 * @returns True if the consecutive arrears streak meets or exceeds 3
 */
export function isGround18ThresholdMet(arrearsItems: ArrearsItem[]): boolean {
  const { maxConsecutiveStreak } = calculateConsecutiveArrearsStreak(arrearsItems);
  return maxConsecutiveStreak >= 3;
}

/**
 * Mapping of Scotland service method labels to stable keys.
 *
 * These keys are used internally and in downstream generation/preview.
 * Labels come from config.noticeRequirements.serviceMethods.
 */
const SCOTLAND_SERVICE_METHOD_MAP: Record<string, string> = {
  // Exact matches from config (case-insensitive matching applied below)
  'handed to tenant in person': 'hand_delivered',
  'left in tenant\'s possession at property': 'left_at_property',
  'sent by recorded delivery post': 'recorded_delivery_post',
  'sent by registered post': 'registered_post',
  'deposited at property and followed by ordinary post': 'deposit_and_follow_up_post',

  // Common variations / abbreviated versions that might appear
  'hand delivered': 'hand_delivered',
  'hand delivery': 'hand_delivered',
  'in person': 'hand_delivered',
  'recorded delivery': 'recorded_delivery_post',
  'recorded post': 'recorded_delivery_post',
  'registered delivery': 'registered_post',
  'first class post': 'first_class_post', // fallback for test mocks
  'first-class post': 'first_class_post',
  'deposited and posted': 'deposit_and_follow_up_post',
};

/**
 * Map a Scotland service method label to a stable key.
 *
 * This function maps the human-readable service method labels from config
 * to stable, snake_case keys that are used consistently in:
 * - Fact storage
 * - Document generation
 * - Preview rendering
 *
 * For Scotland notice_only ONLY. Does NOT affect England/Wales.
 *
 * @param label - The service method label from config or user selection
 * @returns A stable snake_case key for the service method
 */
export function mapScotlandServiceMethodToKey(label: string): string {
  if (!label) return '';

  // Normalize label for lookup
  const normalizedLabel = label.toLowerCase().trim();

  // Try exact match in our mapping
  const mappedKey = SCOTLAND_SERVICE_METHOD_MAP[normalizedLabel];
  if (mappedKey) {
    return mappedKey;
  }

  // Fallback: use the existing normalization (lowercase + underscore)
  // This handles any future service methods not yet in our mapping
  // NOTE: If this fallback is used, consider adding the method to the map above
  const fallbackKey = normalizedLabel.replace(/\s+/g, '_');

  // Log a comment for developers if using fallback (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.debug(
      `[Scotland Notice] Unknown service method label "${label}" - using fallback normalization: "${fallbackKey}". Consider adding to SCOTLAND_SERVICE_METHOD_MAP.`
    );
  }

  return fallbackKey;
}

/**
 * Get the display label for a stable service method key.
 *
 * Reverse lookup from key to label for display purposes.
 *
 * @param key - The stable snake_case key
 * @param availableMethods - Array of available method labels from config
 * @returns The display label, or the key formatted for display if not found
 */
export function getServiceMethodLabel(key: string, availableMethods: string[]): string {
  if (!key) return '';

  // Find the method in availableMethods whose key matches
  for (const method of availableMethods) {
    if (mapScotlandServiceMethodToKey(method) === key) {
      return method;
    }
  }

  // Fallback: convert key to title case for display
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
