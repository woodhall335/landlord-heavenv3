/**
 * Court-Credible Arrears Ledger
 *
 * This module generates a court-ready arrears schedule with:
 * - Correct rent periods based on tenancy start day (e.g., 14th→13th)
 * - Pro-rata calculation for partial final periods (using rent-period length)
 * - FIFO payment allocation (oldest arrears paid first)
 * - Running balance column
 * - Ground 8 threshold snapshots
 *
 * This is the authoritative arrears calculation for court submissions.
 *
 * @module court-arrears-ledger
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Payment {
  date: string; // YYYY-MM-DD
  amount: number;
  reference?: string;
}

export interface LedgerCharge {
  kind: 'charge';
  date: string; // Due date (start of period)
  amount: number;
  label: string;
  periodStart: string;
  periodEnd: string;
  isProRated?: boolean;
}

export interface LedgerPayment {
  kind: 'payment';
  date: string;
  amount: number;
  label: string;
}

export type LedgerEntry = LedgerCharge | LedgerPayment;

export interface PaymentAllocation {
  paymentDate: string;
  paymentAmount: number;
  appliedTo: string;
  amountApplied: number;
}

export interface ChargeWithBalance {
  charge: LedgerCharge;
  originalAmount: number;
  remaining: number;
  allocations: PaymentAllocation[];
}

export interface ArrearsLedgerResult {
  /** All charge entries (rent periods) */
  charges: LedgerCharge[];
  /** All payment entries */
  payments: LedgerPayment[];
  /** Charges with FIFO-allocated balances */
  chargesWithBalance: ChargeWithBalance[];
  /** Payment allocation details for audit trail */
  allocations: PaymentAllocation[];
  /** Total arrears (sum of remaining on all charges) */
  totalArrears: number;
  /** Arrears at notice service date (frozen snapshot) */
  arrearsAtNoticeDate: number | null;
  /** Arrears at schedule generation date */
  arrearsAtScheduleDate: number;
  /** Ground 8 threshold validation */
  ground8Validation: {
    threshold: string; // "2 months" or "8 weeks"
    thresholdAmount: number;
    meetsThresholdAtNotice: boolean;
    meetsThresholdAtSchedule: boolean;
  };
}

export interface CourtArrearsScheduleRow {
  period: string;
  dueDate: string;
  rentDue: number;
  payment: number;
  arrears: number;
  runningBalance: number;
  notes?: string;
}

export interface CourtArrearsSchedule {
  rows: CourtArrearsScheduleRow[];
  totalRentDue: number;
  totalPayments: number;
  totalArrears: number;
  arrearsAtNoticeDate: number | null;
  arrearsAtScheduleDate: number;
  noticeDate: string | null;
  scheduleDate: string;
  ground8: {
    monthlyThreshold: number;
    meetsThresholdAtNotice: boolean;
    meetsThresholdNow: boolean;
  };
}

export interface LedgerInput {
  tenancyStartDate: string; // YYYY-MM-DD
  rentAmount: number;
  rentFrequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  /** Optional: cut-off date for schedule (defaults to today) */
  scheduleEndDate?: string;
  /** Notice service date for Ground 8 snapshot */
  noticeDate?: string;
  /** Payments received */
  payments: Payment[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get start of day for a date (midnight UTC).
 */
function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Count days inclusive between two dates.
 * E.g., Jan 1 to Jan 3 = 3 days
 */
function daysInclusive(a: Date, b: Date): number {
  const aStart = startOfDay(a).getTime();
  const bStart = startOfDay(b).getTime();
  return Math.floor((bStart - aStart) / MS_PER_DAY) + 1;
}

/**
 * Add months to a date, preserving the day if possible.
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, date.getUTCDate()));
  // Handle day overflow (e.g., Jan 31 + 1 month)
  const expectedMonth = (date.getUTCMonth() + months) % 12;
  if (result.getUTCMonth() !== expectedMonth) {
    // Went into next month, go back to last day of intended month
    result.setUTCDate(0);
  }
  return result;
}

/**
 * Add days to a date.
 */
function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

/**
 * Parse a YYYY-MM-DD string to Date.
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Format a Date to YYYY-MM-DD string.
 */
function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date to UK legal format (e.g., "15 January 2026")
 */
function formatUKDate(dateStr: string): string {
  const date = parseDate(dateStr);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * Format date range in short format (e.g., "14 Jan – 13 Feb 2026")
 */
function formatPeriodShort(startStr: string, endStr: string): string {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const startDay = start.getUTCDate();
  const startMonth = months[start.getUTCMonth()];
  const endDay = end.getUTCDate();
  const endMonth = months[end.getUTCMonth()];
  const endYear = end.getUTCFullYear();

  // If same month/year, simplify
  if (start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear()) {
    return `${startDay}–${endDay} ${endMonth} ${endYear}`;
  }

  // If same year, omit year from start
  if (start.getUTCFullYear() === end.getUTCFullYear()) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear}`;
  }

  // Different years
  return `${startDay} ${startMonth} ${start.getUTCFullYear()} – ${endDay} ${endMonth} ${endYear}`;
}

// ============================================================================
// CHARGE GENERATION
// ============================================================================

/**
 * Build monthly rent charges from tenancy start to end date.
 *
 * CRITICAL: Rent periods are based on the tenancy start day, NOT calendar months.
 * E.g., if tenancy starts on the 14th:
 * - Period 1: 14th Jan → 13th Feb
 * - Period 2: 14th Feb → 13th Mar
 * etc.
 *
 * The final period is pro-rated if the schedule end date falls within it.
 * Pro-rata is calculated using the rent-period length (not calendar month days).
 */
export function buildChargesMonthly(
  tenancyStartStr: string,
  endExclusiveStr: string,
  monthlyRent: number
): LedgerCharge[] {
  const charges: LedgerCharge[] = [];
  let periodStart = parseDate(tenancyStartStr);
  const endExclusive = parseDate(endExclusiveStr);

  while (periodStart < endExclusive) {
    // Full period end is one month later, minus one day
    // E.g., 14th Jan → (14th Feb - 1 day) = 13th Feb
    const fullPeriodEnd = addDays(addMonths(periodStart, 1), -1);
    let periodEnd = fullPeriodEnd;
    let chargeAmount = monthlyRent;
    let isProRated = false;

    // Check if the period extends beyond the schedule end date
    if (addDays(fullPeriodEnd, 1) > endExclusive) {
      // Final period is partial - pro-rate
      const partialEnd = addDays(endExclusive, -1);

      // Only pro-rate if we actually have a partial period
      if (partialEnd < fullPeriodEnd) {
        const fullPeriodDays = daysInclusive(periodStart, fullPeriodEnd);
        const partialDays = daysInclusive(periodStart, partialEnd);

        // Pro-rate: (rent / full period days) * partial days
        chargeAmount = (monthlyRent / fullPeriodDays) * partialDays;
        periodEnd = partialEnd;
        isProRated = true;
      }
    }

    const periodLabel = isProRated
      ? `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))} (pro-rated)`
      : `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))}`;

    charges.push({
      kind: 'charge',
      date: formatDate(periodStart), // Due date = first day of rent period
      amount: Math.round(chargeAmount * 100) / 100, // Round to 2dp
      label: periodLabel,
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      isProRated,
    });

    // Move to next period (day after this period ends)
    periodStart = addDays(periodEnd, 1);
  }

  return charges;
}

/**
 * Build weekly rent charges.
 */
export function buildChargesWeekly(
  tenancyStartStr: string,
  endExclusiveStr: string,
  weeklyRent: number
): LedgerCharge[] {
  const charges: LedgerCharge[] = [];
  let periodStart = parseDate(tenancyStartStr);
  const endExclusive = parseDate(endExclusiveStr);

  while (periodStart < endExclusive) {
    // Weekly period: 7 days (6 days after start)
    const fullPeriodEnd = addDays(periodStart, 6);
    let periodEnd = fullPeriodEnd;
    let chargeAmount = weeklyRent;
    let isProRated = false;

    if (addDays(fullPeriodEnd, 1) > endExclusive) {
      const partialEnd = addDays(endExclusive, -1);
      if (partialEnd < fullPeriodEnd) {
        const fullPeriodDays = 7;
        const partialDays = daysInclusive(periodStart, partialEnd);
        chargeAmount = (weeklyRent / fullPeriodDays) * partialDays;
        periodEnd = partialEnd;
        isProRated = true;
      }
    }

    const periodLabel = isProRated
      ? `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))} (pro-rated)`
      : `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))}`;

    charges.push({
      kind: 'charge',
      date: formatDate(periodStart),
      amount: Math.round(chargeAmount * 100) / 100,
      label: periodLabel,
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      isProRated,
    });

    periodStart = addDays(periodEnd, 1);
  }

  return charges;
}

/**
 * Build rent charges for any frequency.
 */
export function buildCharges(input: LedgerInput): LedgerCharge[] {
  const endDate = input.scheduleEndDate || formatDate(new Date());
  // End exclusive = day after the schedule end date
  const endExclusive = formatDate(addDays(parseDate(endDate), 1));

  switch (input.rentFrequency) {
    case 'weekly':
      return buildChargesWeekly(input.tenancyStartDate, endExclusive, input.rentAmount);
    case 'fortnightly':
      // Fortnightly = 14 days
      return buildChargesFortnightly(input.tenancyStartDate, endExclusive, input.rentAmount);
    case 'monthly':
      return buildChargesMonthly(input.tenancyStartDate, endExclusive, input.rentAmount);
    case 'quarterly':
      return buildChargesQuarterly(input.tenancyStartDate, endExclusive, input.rentAmount);
    case 'yearly':
      return buildChargesYearly(input.tenancyStartDate, endExclusive, input.rentAmount);
    default:
      return buildChargesMonthly(input.tenancyStartDate, endExclusive, input.rentAmount);
  }
}

function buildChargesFortnightly(
  tenancyStartStr: string,
  endExclusiveStr: string,
  fortnightlyRent: number
): LedgerCharge[] {
  const charges: LedgerCharge[] = [];
  let periodStart = parseDate(tenancyStartStr);
  const endExclusive = parseDate(endExclusiveStr);

  while (periodStart < endExclusive) {
    const fullPeriodEnd = addDays(periodStart, 13); // 14 days = 13 days after start
    let periodEnd = fullPeriodEnd;
    let chargeAmount = fortnightlyRent;
    let isProRated = false;

    if (addDays(fullPeriodEnd, 1) > endExclusive) {
      const partialEnd = addDays(endExclusive, -1);
      if (partialEnd < fullPeriodEnd) {
        const fullPeriodDays = 14;
        const partialDays = daysInclusive(periodStart, partialEnd);
        chargeAmount = (fortnightlyRent / fullPeriodDays) * partialDays;
        periodEnd = partialEnd;
        isProRated = true;
      }
    }

    const periodLabel = isProRated
      ? `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))} (pro-rated)`
      : `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))}`;

    charges.push({
      kind: 'charge',
      date: formatDate(periodStart),
      amount: Math.round(chargeAmount * 100) / 100,
      label: periodLabel,
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      isProRated,
    });

    periodStart = addDays(periodEnd, 1);
  }

  return charges;
}

function buildChargesQuarterly(
  tenancyStartStr: string,
  endExclusiveStr: string,
  quarterlyRent: number
): LedgerCharge[] {
  const charges: LedgerCharge[] = [];
  let periodStart = parseDate(tenancyStartStr);
  const endExclusive = parseDate(endExclusiveStr);

  while (periodStart < endExclusive) {
    const fullPeriodEnd = addDays(addMonths(periodStart, 3), -1);
    let periodEnd = fullPeriodEnd;
    let chargeAmount = quarterlyRent;
    let isProRated = false;

    if (addDays(fullPeriodEnd, 1) > endExclusive) {
      const partialEnd = addDays(endExclusive, -1);
      if (partialEnd < fullPeriodEnd) {
        const fullPeriodDays = daysInclusive(periodStart, fullPeriodEnd);
        const partialDays = daysInclusive(periodStart, partialEnd);
        chargeAmount = (quarterlyRent / fullPeriodDays) * partialDays;
        periodEnd = partialEnd;
        isProRated = true;
      }
    }

    const periodLabel = isProRated
      ? `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))} (pro-rated)`
      : `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))}`;

    charges.push({
      kind: 'charge',
      date: formatDate(periodStart),
      amount: Math.round(chargeAmount * 100) / 100,
      label: periodLabel,
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      isProRated,
    });

    periodStart = addDays(periodEnd, 1);
  }

  return charges;
}

function buildChargesYearly(
  tenancyStartStr: string,
  endExclusiveStr: string,
  yearlyRent: number
): LedgerCharge[] {
  const charges: LedgerCharge[] = [];
  let periodStart = parseDate(tenancyStartStr);
  const endExclusive = parseDate(endExclusiveStr);

  while (periodStart < endExclusive) {
    const fullPeriodEnd = addDays(addMonths(periodStart, 12), -1);
    let periodEnd = fullPeriodEnd;
    let chargeAmount = yearlyRent;
    let isProRated = false;

    if (addDays(fullPeriodEnd, 1) > endExclusive) {
      const partialEnd = addDays(endExclusive, -1);
      if (partialEnd < fullPeriodEnd) {
        const fullPeriodDays = daysInclusive(periodStart, fullPeriodEnd);
        const partialDays = daysInclusive(periodStart, partialEnd);
        chargeAmount = (yearlyRent / fullPeriodDays) * partialDays;
        periodEnd = partialEnd;
        isProRated = true;
      }
    }

    const periodLabel = isProRated
      ? `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))} (pro-rated)`
      : `Rent ${formatPeriodShort(formatDate(periodStart), formatDate(periodEnd))}`;

    charges.push({
      kind: 'charge',
      date: formatDate(periodStart),
      amount: Math.round(chargeAmount * 100) / 100,
      label: periodLabel,
      periodStart: formatDate(periodStart),
      periodEnd: formatDate(periodEnd),
      isProRated,
    });

    periodStart = addDays(periodEnd, 1);
  }

  return charges;
}

// ============================================================================
// FIFO PAYMENT ALLOCATION
// ============================================================================

/**
 * Apply payments to charges using FIFO (First In First Out).
 *
 * Payments are applied to the oldest outstanding charges first.
 * This is the standard court-expected method for allocating payments.
 *
 * @param charges - Array of rent charges sorted by date (oldest first)
 * @param payments - Array of payments sorted by date
 * @returns Charges with remaining balances and allocation details
 */
export function applyPaymentsFIFO(
  charges: LedgerCharge[],
  payments: Payment[]
): { chargesWithBalance: ChargeWithBalance[]; allocations: PaymentAllocation[] } {
  // Initialize outstanding amounts for each charge
  const chargesWithBalance: ChargeWithBalance[] = charges.map(charge => ({
    charge,
    originalAmount: charge.amount,
    remaining: charge.amount,
    allocations: [],
  }));

  const allocations: PaymentAllocation[] = [];

  // Sort payments by date (oldest first)
  const sortedPayments = [...payments].sort(
    (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
  );

  // Apply each payment to oldest outstanding charges
  for (const payment of sortedPayments) {
    let remainingPayment = payment.amount;

    for (const chargeEntry of chargesWithBalance) {
      if (remainingPayment <= 0) break;
      if (chargeEntry.remaining <= 0) continue;

      // Apply payment to this charge
      const amountToApply = Math.min(chargeEntry.remaining, remainingPayment);
      chargeEntry.remaining = Math.round((chargeEntry.remaining - amountToApply) * 100) / 100;
      remainingPayment = Math.round((remainingPayment - amountToApply) * 100) / 100;

      const allocation: PaymentAllocation = {
        paymentDate: payment.date,
        paymentAmount: payment.amount,
        appliedTo: chargeEntry.charge.label,
        amountApplied: amountToApply,
      };

      chargeEntry.allocations.push(allocation);
      allocations.push(allocation);
    }

    // If there's remaining payment after all charges, it's a credit (ignore for arrears calc)
  }

  return { chargesWithBalance, allocations };
}

// ============================================================================
// ARREARS CALCULATION
// ============================================================================

/**
 * Calculate arrears at a specific date.
 *
 * This considers only charges due on or before the date,
 * and payments received on or before the date.
 */
export function calculateArrearsAtDate(
  charges: LedgerCharge[],
  payments: Payment[],
  atDate: string
): number {
  const atDateTime = parseDate(atDate).getTime();

  // Filter charges due on or before the date
  const chargesAtDate = charges.filter(
    c => parseDate(c.date).getTime() <= atDateTime
  );

  // Filter payments received on or before the date
  const paymentsAtDate = payments.filter(
    p => parseDate(p.date).getTime() <= atDateTime
  );

  // Apply FIFO to get remaining balances
  const { chargesWithBalance } = applyPaymentsFIFO(chargesAtDate, paymentsAtDate);

  // Sum remaining balances
  const totalArrears = chargesWithBalance.reduce(
    (sum, c) => sum + c.remaining,
    0
  );

  return Math.round(totalArrears * 100) / 100;
}

/**
 * Calculate Ground 8 threshold.
 *
 * Ground 8 requires:
 * - Monthly rent: at least 2 months' rent unpaid
 * - Weekly rent: at least 8 weeks' rent unpaid
 */
export function calculateGround8Threshold(
  rentAmount: number,
  rentFrequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly'
): { threshold: string; amount: number } {
  switch (rentFrequency) {
    case 'weekly':
      return { threshold: '8 weeks', amount: rentAmount * 8 };
    case 'fortnightly':
      return { threshold: '4 fortnights (8 weeks)', amount: rentAmount * 4 };
    case 'monthly':
      return { threshold: '2 months', amount: rentAmount * 2 };
    case 'quarterly':
      return { threshold: '2/3 of quarterly rent (2 months)', amount: (rentAmount / 3) * 2 };
    case 'yearly':
      return { threshold: '1/6 of annual rent (2 months)', amount: rentAmount / 6 };
    default:
      return { threshold: '2 months', amount: rentAmount * 2 };
  }
}

// ============================================================================
// MAIN LEDGER GENERATOR
// ============================================================================

/**
 * Generate a complete court-credible arrears ledger.
 */
export function generateArrearsLedger(input: LedgerInput): ArrearsLedgerResult {
  // Build charges
  const charges = buildCharges(input);

  // Convert payments to ledger format
  const ledgerPayments: LedgerPayment[] = input.payments.map((p, i) => ({
    kind: 'payment' as const,
    date: p.date,
    amount: p.amount,
    label: p.reference || `Payment ${i + 1}`,
  }));

  // Apply FIFO
  const { chargesWithBalance, allocations } = applyPaymentsFIFO(charges, input.payments);

  // Calculate totals
  const totalArrears = chargesWithBalance.reduce((sum, c) => sum + c.remaining, 0);

  // Calculate arrears at notice date (if provided)
  const arrearsAtNoticeDate = input.noticeDate
    ? calculateArrearsAtDate(charges, input.payments, input.noticeDate)
    : null;

  // Calculate arrears at schedule date
  const scheduleDate = input.scheduleEndDate || formatDate(new Date());
  const arrearsAtScheduleDate = totalArrears;

  // Ground 8 validation
  const ground8 = calculateGround8Threshold(input.rentAmount, input.rentFrequency);

  return {
    charges,
    payments: ledgerPayments,
    chargesWithBalance,
    allocations,
    totalArrears: Math.round(totalArrears * 100) / 100,
    arrearsAtNoticeDate,
    arrearsAtScheduleDate: Math.round(arrearsAtScheduleDate * 100) / 100,
    ground8Validation: {
      threshold: ground8.threshold,
      thresholdAmount: ground8.amount,
      meetsThresholdAtNotice: arrearsAtNoticeDate !== null && arrearsAtNoticeDate >= ground8.amount,
      meetsThresholdAtSchedule: arrearsAtScheduleDate >= ground8.amount,
    },
  };
}

/**
 * Generate a court-ready arrears schedule with running balance.
 */
export function generateCourtArrearsSchedule(input: LedgerInput): CourtArrearsSchedule {
  const ledger = generateArrearsLedger(input);

  // Build schedule rows with running balance
  const rows: CourtArrearsScheduleRow[] = [];
  let runningBalance = 0;

  for (const chargeEntry of ledger.chargesWithBalance) {
    const charge = chargeEntry.charge;
    const payment = chargeEntry.originalAmount - chargeEntry.remaining;
    const arrears = chargeEntry.remaining;

    runningBalance += arrears;

    rows.push({
      period: `${formatUKDate(charge.periodStart)} to ${formatUKDate(charge.periodEnd)}`,
      dueDate: formatUKDate(charge.date),
      rentDue: charge.amount,
      payment: Math.round(payment * 100) / 100,
      arrears: Math.round(arrears * 100) / 100,
      runningBalance: Math.round(runningBalance * 100) / 100,
      notes: charge.isProRated ? 'Pro-rated' : undefined,
    });
  }

  // Calculate totals
  const totalRentDue = ledger.charges.reduce((sum, c) => sum + c.amount, 0);
  const totalPayments = ledger.payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    rows,
    totalRentDue: Math.round(totalRentDue * 100) / 100,
    totalPayments: Math.round(totalPayments * 100) / 100,
    totalArrears: ledger.totalArrears,
    arrearsAtNoticeDate: ledger.arrearsAtNoticeDate,
    arrearsAtScheduleDate: ledger.arrearsAtScheduleDate,
    noticeDate: input.noticeDate || null,
    scheduleDate: input.scheduleEndDate || formatDate(new Date()),
    ground8: {
      monthlyThreshold: ledger.ground8Validation.thresholdAmount,
      meetsThresholdAtNotice: ledger.ground8Validation.meetsThresholdAtNotice,
      meetsThresholdNow: ledger.ground8Validation.meetsThresholdAtSchedule,
    },
  };
}
