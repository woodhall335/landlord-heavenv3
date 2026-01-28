/**
 * Court Fee Estimator for Money Claims
 *
 * Calculates estimated County Court fees based on claim amount.
 * Uses official HMCTS fee bands for money claims in England & Wales.
 *
 * Fee source: HMCTS Civil Proceedings Fees (as of 2024)
 * Note: Fees are subject to change. This is for estimation only.
 */

export interface CourtFeeEstimate {
  /** The claim amount used for calculation */
  claimAmount: number;
  /** Court issue fee for paper filing */
  paperFee: number;
  /** Court issue fee for online filing (MCOL) - 10% discount */
  onlineFee: number;
  /** Fee band description */
  band: string;
  /** Whether the online fee includes a discount */
  hasOnlineDiscount: boolean;
  /** Disclaimer text */
  disclaimer: string;
}

/**
 * HMCTS Money Claim Fee Bands (2024)
 * Paper filing fees - online (MCOL) gets 10% discount on most bands
 */
const FEE_BANDS: Array<{
  maxAmount: number;
  paperFee: number;
  onlineFee: number;
  band: string;
}> = [
  { maxAmount: 300, paperFee: 35, onlineFee: 35, band: 'Up to £300' },
  { maxAmount: 500, paperFee: 50, onlineFee: 50, band: '£300.01 to £500' },
  { maxAmount: 1000, paperFee: 70, onlineFee: 70, band: '£500.01 to £1,000' },
  { maxAmount: 1500, paperFee: 80, onlineFee: 80, band: '£1,000.01 to £1,500' },
  { maxAmount: 3000, paperFee: 115, onlineFee: 115, band: '£1,500.01 to £3,000' },
  { maxAmount: 5000, paperFee: 205, onlineFee: 185, band: '£3,000.01 to £5,000' },
  { maxAmount: 10000, paperFee: 455, onlineFee: 410, band: '£5,000.01 to £10,000' },
  { maxAmount: 25000, paperFee: 455, onlineFee: 410, band: '£10,000.01 to £25,000' },
  { maxAmount: 50000, paperFee: 455, onlineFee: 410, band: '£25,000.01 to £50,000' },
  { maxAmount: 100000, paperFee: 455, onlineFee: 410, band: '£50,000.01 to £100,000' },
  // For claims over £100,000, fee is 5% of claim up to max £10,000
  { maxAmount: Infinity, paperFee: -1, onlineFee: -1, band: 'Over £100,000 (5% of claim)' },
];

/**
 * Calculate court fee estimate for a money claim
 *
 * @param claimAmount - Total claim amount in pounds
 * @returns Court fee estimate with paper and online fees
 */
export function calculateCourtFee(claimAmount: number): CourtFeeEstimate {
  // Handle edge cases
  if (claimAmount <= 0) {
    return {
      claimAmount: 0,
      paperFee: 0,
      onlineFee: 0,
      band: 'No claim amount',
      hasOnlineDiscount: false,
      disclaimer: 'Enter a claim amount to see estimated court fees.',
    };
  }

  // Find the appropriate fee band
  const band = FEE_BANDS.find((b) => claimAmount <= b.maxAmount);

  if (!band) {
    // Should never happen due to Infinity band
    return {
      claimAmount,
      paperFee: 0,
      onlineFee: 0,
      band: 'Unknown',
      hasOnlineDiscount: false,
      disclaimer: 'Unable to calculate fee for this amount.',
    };
  }

  // Handle claims over £100,000 (5% of claim, max £10,000)
  if (band.paperFee === -1) {
    const percentageFee = Math.min(claimAmount * 0.05, 10000);
    return {
      claimAmount,
      paperFee: Math.round(percentageFee * 100) / 100,
      onlineFee: Math.round(percentageFee * 100) / 100,
      band: band.band,
      hasOnlineDiscount: false,
      disclaimer:
        'For claims over £100,000, the fee is 5% of the claim value (max £10,000). MCOL has a £100,000 limit - larger claims must be filed on paper at the County Court.',
    };
  }

  const hasOnlineDiscount = band.paperFee !== band.onlineFee;

  return {
    claimAmount,
    paperFee: band.paperFee,
    onlineFee: band.onlineFee,
    band: band.band,
    hasOnlineDiscount,
    disclaimer:
      'Court fees are set by HMCTS and may change. Online filing via Money Claims Online (MCOL) is typically cheaper for claims under £100,000. These fees are for issuing the claim only - additional fees apply for hearings, enforcement, etc.',
  };
}

/**
 * Format fee as currency string
 */
export function formatFee(fee: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(fee);
}

/**
 * Get fee breakdown summary for display
 */
export function getFeeSummary(claimAmount: number): {
  recommended: 'online' | 'paper';
  savings: number;
  totalWithFee: number;
  estimate: CourtFeeEstimate;
} {
  const estimate = calculateCourtFee(claimAmount);

  // For claims over £100k, paper is required
  if (claimAmount > 100000) {
    return {
      recommended: 'paper',
      savings: 0,
      totalWithFee: claimAmount + estimate.paperFee,
      estimate,
    };
  }

  const savings = estimate.paperFee - estimate.onlineFee;

  return {
    recommended: 'online',
    savings,
    totalWithFee: claimAmount + estimate.onlineFee,
    estimate,
  };
}

/**
 * Check if claim amount is within MCOL limits
 */
export function isWithinMCOLLimit(claimAmount: number): boolean {
  return claimAmount <= 100000;
}

/**
 * Get additional fees information
 */
export function getAdditionalFeesInfo(): Array<{ description: string; fee: string }> {
  return [
    { description: 'Hearing fee (small claims track, up to £300)', fee: '£0' },
    { description: 'Hearing fee (small claims track, £300.01-£500)', fee: '£55' },
    { description: 'Hearing fee (small claims track, £500.01-£1,000)', fee: '£85' },
    { description: 'Hearing fee (small claims track, £1,000.01-£1,500)', fee: '£125' },
    { description: 'Hearing fee (small claims track, over £1,500)', fee: '£181' },
    { description: 'Warrant of control (bailiff enforcement)', fee: '£77' },
    { description: 'Attachment of earnings order', fee: '£110' },
    { description: 'Third party debt order', fee: '£110' },
    { description: 'Charging order', fee: '£110' },
  ];
}
