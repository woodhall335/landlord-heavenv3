/**
 * Outcome Confidence Indicator for Money Claims
 *
 * Rules-based scoring model that evaluates case strength based on:
 * - Evidence completeness
 * - Claim clarity
 * - PAP compliance
 *
 * Output: Strong / Moderate / Weak confidence rating
 *
 * This is NOT predictive AI - just a deterministic rules-based assessment
 * to help users understand their case strength before filing.
 */

import { buildEvidenceContext, type EvidenceContext } from '@/lib/evidence/money-claim-evidence-classifier';

export type ConfidenceLevel = 'strong' | 'moderate' | 'weak';

export interface ConfidenceScore {
  /** Overall confidence level */
  level: ConfidenceLevel;
  /** Numeric score out of 100 */
  score: number;
  /** Breakdown by category */
  breakdown: {
    evidence: CategoryScore;
    claimClarity: CategoryScore;
    papCompliance: CategoryScore;
  };
  /** Specific factors that contributed to the score */
  positiveFactors: string[];
  /** Specific factors that reduced the score */
  negativeFactors: string[];
  /** Suggestions to improve score */
  improvements: string[];
}

export interface CategoryScore {
  /** Score for this category (0-100) */
  score: number;
  /** Max possible score */
  maxScore: number;
  /** Weight applied to overall score */
  weight: number;
  /** Contributing factors */
  factors: string[];
}

export interface CaseFactsForScoring {
  // Claim types
  claiming_rent_arrears?: boolean;
  claiming_damages?: boolean;
  claiming_other?: boolean;
  money_claim?: {
    other_amounts_types?: string[];
    basis_of_claim?: string;
    damage_items?: Array<{ description?: string; amount?: number; category?: string }>;
    other_charges?: Array<{ description?: string; amount?: number }>;
    charge_interest?: boolean;
    interest_rate?: number;
    interest_start_date?: string;
    /** Flag indicating we will generate PAP documents for the user */
    generate_pap_documents?: boolean;
  };

  // Evidence
  uploaded_documents?: Array<{ id: string; name: string; type?: string }>;
  evidence_reviewed?: boolean;

  // PAP compliance
  letter_before_claim_sent?: boolean;
  pap_letter_date?: string;
  pap_response_received?: boolean;

  // Arrears
  arrears_items?: Array<{
    period_start?: string | null;
    period_end?: string | null;
    rent_due?: number | null;
    rent_paid?: number | null;
  }>;
  total_arrears?: number;

  // Tenancy
  tenancy_start_date?: string;
  tenancy_end_date?: string;
  rent_amount?: number;
  rent_frequency?: string;

  // Reviews
  timeline_reviewed?: boolean;
  enforcement_reviewed?: boolean;
}

/**
 * Calculate evidence score based on uploaded documents and claim types
 */
function calculateEvidenceScore(
  facts: CaseFactsForScoring,
  evidenceContext: EvidenceContext
): CategoryScore {
  const factors: string[] = [];
  let score = 0;
  const maxScore = 40; // Evidence is 40% of total

  const claimTypes = getClaimTypes(facts);
  const hasArrears = claimTypes.includes('rent_arrears');
  const hasDamages = claimTypes.includes('property_damage') || claimTypes.includes('cleaning');
  const hasUtilities = claimTypes.includes('unpaid_utilities');
  const hasCouncilTax = claimTypes.includes('unpaid_council_tax');

  // Base points for having any evidence
  if (facts.uploaded_documents && facts.uploaded_documents.length > 0) {
    score += 5;
    factors.push(`${facts.uploaded_documents.length} document(s) uploaded`);
  }

  // Tenancy agreement (important for all claims)
  if (evidenceContext.has_tenancy_agreement_evidence) {
    score += 8;
    factors.push('Tenancy agreement uploaded');
  }

  // Claim-type specific evidence
  if (hasArrears) {
    if (evidenceContext.has_rent_ledger_bank_statement_evidence) {
      score += 10;
      factors.push('Rent payment records provided');
    }
  }

  if (hasDamages) {
    if (evidenceContext.has_photo_evidence) {
      score += 8;
      factors.push('Photographic evidence provided');
    }
    if (evidenceContext.has_any_inventory_evidence) {
      score += 8;
      factors.push('Inventory report provided');
    }
    if (evidenceContext.has_invoice_quote_receipt_evidence) {
      score += 6;
      factors.push('Repair quotes/invoices provided');
    }
  }

  if (hasUtilities) {
    if (evidenceContext.has_utility_bill_evidence) {
      score += 8;
      factors.push('Utility bills provided');
    }
  }

  if (hasCouncilTax) {
    if (evidenceContext.has_council_tax_statement_evidence) {
      score += 8;
      factors.push('Council tax statement provided');
    }
  }

  // Correspondence evidence (helpful for all)
  if (evidenceContext.has_correspondence_evidence) {
    score += 3;
    factors.push('Correspondence records provided');
  }

  // Evidence reviewed flag
  if (facts.evidence_reviewed) {
    score += 2;
    factors.push('Evidence review completed');
  }

  // Cap at max score
  score = Math.min(score, maxScore);

  return {
    score,
    maxScore,
    weight: 0.4,
    factors,
  };
}

/**
 * Calculate claim clarity score based on completeness of claim details
 */
function calculateClaimClarityScore(facts: CaseFactsForScoring): CategoryScore {
  const factors: string[] = [];
  let score = 0;
  const maxScore = 35; // Claim clarity is 35% of total

  const claimTypes = getClaimTypes(facts);
  const hasArrears = claimTypes.includes('rent_arrears');
  const hasDamages =
    claimTypes.includes('property_damage') ||
    claimTypes.includes('cleaning') ||
    claimTypes.includes('unpaid_utilities') ||
    claimTypes.includes('unpaid_council_tax') ||
    claimTypes.includes('other_tenant_debt');

  // Basis of claim
  const basisOfClaim = facts.money_claim?.basis_of_claim || '';
  if (basisOfClaim.length >= 100) {
    score += 10;
    factors.push('Detailed basis of claim provided');
  } else if (basisOfClaim.length >= 50) {
    score += 5;
    factors.push('Basic basis of claim provided');
  }

  // Arrears schedule completeness
  if (hasArrears && facts.arrears_items && facts.arrears_items.length > 0) {
    const completeItems = facts.arrears_items.filter(
      (item) => item.period_start && item.period_end && item.rent_due !== null
    );
    const completionRate = completeItems.length / facts.arrears_items.length;

    if (completionRate === 1) {
      score += 10;
      factors.push('All arrears entries complete');
    } else if (completionRate >= 0.8) {
      score += 6;
      factors.push('Most arrears entries complete');
    } else if (completionRate >= 0.5) {
      score += 3;
      factors.push('Some arrears entries complete');
    }

    // Rent amount matches tenancy
    if (facts.rent_amount && facts.rent_frequency) {
      score += 3;
      factors.push('Rent terms documented');
    }
  }

  // Damage/other items clarity
  if (hasDamages) {
    const damageItems = facts.money_claim?.damage_items || [];
    const otherCharges = facts.money_claim?.other_charges || [];
    const allItems = [...damageItems, ...otherCharges];

    if (allItems.length > 0) {
      const itemsWithBoth = allItems.filter(
        (item) => item.description && item.description.length > 10 && item.amount && item.amount > 0
      );
      const completionRate = itemsWithBoth.length / allItems.length;

      if (completionRate === 1) {
        score += 8;
        factors.push('All damage/cost items clearly described');
      } else if (completionRate >= 0.8) {
        score += 5;
        factors.push('Most damage/cost items clearly described');
      }
    }
  }

  // Interest claimed correctly
  if (facts.money_claim?.charge_interest === true) {
    if (facts.money_claim.interest_rate && facts.money_claim.interest_start_date) {
      score += 4;
      factors.push('Interest calculation complete');
    }
  } else if (facts.money_claim?.charge_interest === false) {
    score += 2;
    factors.push('Interest decision made');
  }

  // Cap at max score
  score = Math.min(score, maxScore);

  return {
    score,
    maxScore,
    weight: 0.35,
    factors,
  };
}

/**
 * Calculate PAP compliance score
 */
function calculatePAPComplianceScore(facts: CaseFactsForScoring): CategoryScore {
  const factors: string[] = [];
  let score = 0;
  const maxScore = 25; // PAP compliance is 25% of total

  // Check if user has addressed the PAP requirement
  const hasAlreadySentLetter = facts.letter_before_claim_sent || facts.pap_letter_date;
  const willGenerateLetter = facts.money_claim?.generate_pap_documents === true;

  if (hasAlreadySentLetter) {
    // Letter Before Claim already sent
    score += 15;
    factors.push('Letter Before Claim sent');

    // Calculate days since PAP letter
    if (facts.pap_letter_date) {
      const letterDate = new Date(facts.pap_letter_date);
      const today = new Date();
      const daysSince = Math.floor(
        (today.getTime() - letterDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince >= 30) {
        score += 8;
        factors.push('30-day response period elapsed');
      } else if (daysSince >= 14) {
        score += 4;
        factors.push(`${daysSince} days since PAP letter (30 required)`);
      }
    }

    // Response received
    if (facts.pap_response_received !== undefined) {
      score += 2;
      factors.push(
        facts.pap_response_received
          ? 'Tenant response documented'
          : 'No tenant response recorded'
      );
    }
  } else if (willGenerateLetter) {
    // User has chosen to have us generate the letter
    // Give partial credit - they've addressed PAP but still need to send and wait
    score += 10;
    factors.push('Pre-Action Letter will be generated');
  }

  // Cap at max score
  score = Math.min(score, maxScore);

  return {
    score,
    maxScore,
    weight: 0.25,
    factors,
  };
}

/**
 * Get claim types from facts
 */
function getClaimTypes(facts: CaseFactsForScoring): string[] {
  const types: string[] = [];

  if (facts.claiming_rent_arrears === true) {
    types.push('rent_arrears');
  }

  const otherTypes = facts.money_claim?.other_amounts_types || [];

  if (otherTypes.includes('property_damage') || facts.claiming_damages === true) {
    types.push('property_damage');
  }
  if (otherTypes.includes('cleaning')) {
    types.push('cleaning');
  }
  if (otherTypes.includes('unpaid_utilities')) {
    types.push('unpaid_utilities');
  }
  if (otherTypes.includes('unpaid_council_tax')) {
    types.push('unpaid_council_tax');
  }
  if (otherTypes.includes('other_charges') || facts.claiming_other === true) {
    types.push('other_tenant_debt');
  }

  return types;
}

/**
 * Generate improvement suggestions based on score breakdown
 */
function generateImprovements(
  facts: CaseFactsForScoring,
  evidenceScore: CategoryScore,
  clarityScore: CategoryScore,
  papScore: CategoryScore,
  evidenceContext: EvidenceContext
): string[] {
  const improvements: string[] = [];
  const claimTypes = getClaimTypes(facts);

  // Evidence improvements
  if (evidenceScore.score < evidenceScore.maxScore * 0.7) {
    if (!evidenceContext.has_tenancy_agreement_evidence) {
      improvements.push('Upload your tenancy agreement');
    }

    if (claimTypes.includes('rent_arrears') && !evidenceContext.has_rent_ledger_bank_statement_evidence) {
      improvements.push('Upload rent payment records or bank statements');
    }

    if (
      (claimTypes.includes('property_damage') || claimTypes.includes('cleaning')) &&
      !evidenceContext.has_photo_evidence
    ) {
      improvements.push('Add photos showing the damage or condition');
    }

    if (
      (claimTypes.includes('property_damage') || claimTypes.includes('cleaning')) &&
      !evidenceContext.has_any_inventory_evidence
    ) {
      improvements.push('Upload check-in/check-out inventory if available');
    }

    if (
      (claimTypes.includes('property_damage') || claimTypes.includes('cleaning')) &&
      !evidenceContext.has_invoice_quote_receipt_evidence
    ) {
      improvements.push('Get repair quotes or invoices');
    }
  }

  // Clarity improvements
  if (clarityScore.score < clarityScore.maxScore * 0.7) {
    const basisOfClaim = facts.money_claim?.basis_of_claim || '';
    if (basisOfClaim.length < 100) {
      improvements.push('Add more detail to your basis of claim explanation');
    }

    if (claimTypes.includes('rent_arrears') && facts.arrears_items) {
      const incomplete = facts.arrears_items.filter(
        (item) => !item.period_start || !item.period_end || item.rent_due === null
      );
      if (incomplete.length > 0) {
        improvements.push(`Complete ${incomplete.length} arrears entries with dates and amounts`);
      }
    }
  }

  // PAP improvements
  if (papScore.score < papScore.maxScore * 0.8) {
    const hasAlreadySentLetter = facts.letter_before_claim_sent || facts.pap_letter_date;
    const willGenerateLetter = facts.money_claim?.generate_pap_documents === true;

    if (!hasAlreadySentLetter && !willGenerateLetter) {
      improvements.push('Indicate whether you have sent a Pre-Action Letter or need us to generate one');
    } else if (willGenerateLetter) {
      improvements.push('After generating your pack, send the Pre-Action Letter and wait 30 days before filing');
    } else if (facts.pap_letter_date) {
      const letterDate = new Date(facts.pap_letter_date);
      const today = new Date();
      const daysSince = Math.floor(
        (today.getTime() - letterDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 30) {
        improvements.push(`Wait ${30 - daysSince} more days for 30-day PAP period to elapse`);
      }
    }
  }

  return improvements;
}

/**
 * Calculate overall outcome confidence score
 *
 * @param facts - Case facts to evaluate
 * @returns Confidence score with breakdown
 */
export function calculateOutcomeConfidence(facts: CaseFactsForScoring): ConfidenceScore {
  // Build evidence context
  const evidenceContext = buildEvidenceContext(facts.uploaded_documents);

  // Calculate category scores
  const evidenceScore = calculateEvidenceScore(facts, evidenceContext);
  const clarityScore = calculateClaimClarityScore(facts);
  const papScore = calculatePAPComplianceScore(facts);

  // Calculate weighted total
  const totalScore =
    evidenceScore.score * evidenceScore.weight +
    clarityScore.score * clarityScore.weight +
    papScore.score * papScore.weight;

  // Normalize to 0-100
  const normalizedScore = Math.round(totalScore);

  // Determine confidence level
  let level: ConfidenceLevel;
  if (normalizedScore >= 70) {
    level = 'strong';
  } else if (normalizedScore >= 45) {
    level = 'moderate';
  } else {
    level = 'weak';
  }

  // Collect all positive factors
  const positiveFactors = [
    ...evidenceScore.factors,
    ...clarityScore.factors,
    ...papScore.factors,
  ];

  // Generate negative factors (what's missing)
  const negativeFactors: string[] = [];
  if (evidenceScore.score < evidenceScore.maxScore * 0.5) {
    negativeFactors.push('Limited supporting evidence');
  }
  if (clarityScore.score < clarityScore.maxScore * 0.5) {
    negativeFactors.push('Claim details need more clarity');
  }
  if (papScore.score < papScore.maxScore * 0.5) {
    negativeFactors.push('PAP compliance incomplete');
  }

  // Generate improvements
  const improvements = generateImprovements(
    facts,
    evidenceScore,
    clarityScore,
    papScore,
    evidenceContext
  );

  return {
    level,
    score: normalizedScore,
    breakdown: {
      evidence: evidenceScore,
      claimClarity: clarityScore,
      papCompliance: papScore,
    },
    positiveFactors,
    negativeFactors,
    improvements,
  };
}

/**
 * Get display label for confidence level
 */
export function getConfidenceLevelLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'strong':
      return 'Strong';
    case 'moderate':
      return 'Moderate';
    case 'weak':
      return 'Weak';
  }
}

/**
 * Get color class for confidence level
 */
export function getConfidenceLevelColor(level: ConfidenceLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (level) {
    case 'strong':
      return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
      };
    case 'moderate':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
      };
    case 'weak':
      return {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-200',
      };
  }
}
