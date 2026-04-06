/**
 * HMCTS Court Fees Calculator
 *
 * Official fee structure for England & Wales civil claims.
 * Source: https://www.gov.uk/court-fees-what-they-are
 *
 * Last updated: April 2026
 *
 * IMPORTANT: Fees are subject to change. Check HMCTS website for current rates.
 */

// =============================================================================
// FEE CONSTANTS (EX50A November 2025 / GOV.UK current fee pages)
// =============================================================================

/**
 * Fixed fees for possession claims
 */
export const POSSESSION_FEES = {
  /** Standard possession claim (N5) - Housing Act 1988 */
  STANDARD_POSSESSION: 404,

  /** Accelerated possession (N5B) - Section 21 only */
  ACCELERATED_POSSESSION: 404,

  /** Online possession claim (if using PCOL) */
  ONLINE_POSSESSION: 404,
} as const;

/**
 * Money claim fee bands (for arrears claims)
 * Fee applies to the claim value (arrears amount)
 */
export const MONEY_CLAIM_FEE_BANDS = [
  { maxAmount: 300, fee: 35 },
  { maxAmount: 500, fee: 50 },
  { maxAmount: 1000, fee: 70 },
  { maxAmount: 1500, fee: 80 },
  { maxAmount: 3000, fee: 115 },
  { maxAmount: 5000, fee: 205 },
  { maxAmount: 10000, fee: 455 },
  { maxAmount: 200000, percentageRate: 0.05 }, // 5% of claim value
  { maxAmount: Infinity, percentageRate: 0.05, maxFee: 10000 }, // Capped at £10,000
] as const;

// =============================================================================
// FEE CALCULATION FUNCTIONS
// =============================================================================

export interface CourtFeeBreakdown {
  /** Base possession claim fee */
  possessionFee: number;

  /** Additional fee for money claim (arrears) */
  moneyClaimFee: number;

  /** Total court fee */
  totalFee: number;

  /** Description of fees */
  description: string;

  /** Whether online discount applies */
  onlineDiscount: boolean;
}

/**
 * Calculate the money claim fee based on claim amount
 */
export function calculateMoneyClaimFee(claimAmount: number): number {
  if (claimAmount <= 0) return 0;

  for (const band of MONEY_CLAIM_FEE_BANDS) {
    if (claimAmount <= band.maxAmount) {
      if ('fee' in band) {
        return band.fee;
      } else if ('percentageRate' in band) {
        const calculatedFee = Math.ceil(claimAmount * band.percentageRate);
        return 'maxFee' in band ? Math.min(calculatedFee, band.maxFee) : calculatedFee;
      }
    }
  }

  // Fallback for amounts over £200,000
  return 10000;
}

/**
 * Calculate total court fees for a possession claim
 *
 * @param claimType - 'section_8' | 'section_21' | 'accelerated_section21'
 * @param arrearsAmount - Total rent arrears being claimed (retained for API compatibility)
 * @param isOnline - Whether filing online (PCOL) - currently no discount difference
 * @returns Fee breakdown
 */
export function calculatePossessionFees(
  claimType: 'section_8' | 'section_21' | 'accelerated_section21' | 'accelerated_possession',
  arrearsAmount: number = 0,
  isOnline: boolean = false
): CourtFeeBreakdown {
  // Base possession fee
  const isAccelerated = claimType === 'accelerated_section21' || claimType === 'accelerated_possession';
  const possessionFee = isAccelerated
    ? POSSESSION_FEES.ACCELERATED_POSSESSION
    : POSSESSION_FEES.STANDARD_POSSESSION;

  // Recovery-of-land claims use the fixed issue fee even where rent arrears
  // are pursued in the same possession proceedings.
  const moneyClaimFee = 0;

  // Total
  const totalFee = possessionFee + moneyClaimFee;

  // Build description
  let description = isAccelerated
    ? `Accelerated possession claim: £${possessionFee}`
    : `Standard possession claim: £${possessionFee}`;

  if (arrearsAmount > 0) {
    description += ` + Money claim (£${arrearsAmount.toFixed(2)} arrears): £${moneyClaimFee}`;
  }

  if (arrearsAmount > 0) {
    description = `${isAccelerated ? 'Accelerated' : 'Standard'} possession claim: £${possessionFee} (including any rent arrears sought within the same possession claim)`;
  }

  return {
    possessionFee,
    moneyClaimFee,
    totalFee,
    description,
    onlineDiscount: false, // Currently no online discount for possession claims
  };
}

/**
 * Format fee for display on court forms
 */
export function formatFeeForForm(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Get the standard possession fee (for cases where we just need the base fee)
 */
export function getStandardPossessionFee(): number {
  return POSSESSION_FEES.STANDARD_POSSESSION;
}

/**
 * Example usage and fee table documentation
 */
export const FEE_EXAMPLES = {
  'Possession only (no arrears)': calculatePossessionFees('section_8', 0),
  'Section 8 with £1,500 arrears': calculatePossessionFees('section_8', 1500),
  'Section 8 with £5,000 arrears': calculatePossessionFees('section_8', 5000),
  'Section 21 accelerated (no arrears)': calculatePossessionFees('accelerated_section21', 0),
} as const;
