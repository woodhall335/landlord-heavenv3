/**
 * Premium Tenancy Agreement Recommendation Logic
 *
 * Detects signals in wizard responses that suggest the Premium tier
 * is appropriate for the landlord's situation.
 *
 * This logic is jurisdiction-aware and uses legally accurate language.
 * It NEVER claims Premium is "required" unless it genuinely is.
 * Uses "recommended", "appropriate", or "commonly required" language.
 */

import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';

/**
 * Reason flags for Premium recommendation (analytics-safe, no PII)
 */
export type PremiumRecommendationReason =
  | 'multiple_tenants'           // 3+ tenants
  | 'unrelated_tenants'          // Tenants confirmed as unrelated
  | 'separate_rent_payments'     // Rent paid separately by tenants
  | 'room_by_room_let'           // Room-by-room occupation
  | 'shared_facilities'          // Shared kitchen/bathroom
  | 'hmo_property'               // Property explicitly marked as HMO
  | 'hmo_licensed'               // Property already HMO licensed
  | 'student_let'                // Student accommodation
  | 'guarantor_needed'           // Guarantor is required
  | 'rent_review_needed'         // Rent increase provisions needed
  | 'high_value_property';       // High rent/value property

/**
 * Premium recommendation result
 */
export interface PremiumRecommendationResult {
  /** Whether Premium is recommended */
  isRecommended: boolean;
  /** Strength of recommendation */
  strength: 'strong' | 'moderate' | 'none';
  /** Reason flags (for analytics, no PII) */
  reasons: PremiumRecommendationReason[];
  /** Jurisdiction-specific message to display */
  message: string;
  /** Detailed rationale with legal context (expandable) */
  rationale: string;
  /** Legal framework reference */
  legalReference?: string;
}

/**
 * Jurisdiction-specific legal framework references for HMO/Premium
 */
const JURISDICTION_LEGAL_CONTEXT: Record<CanonicalJurisdiction, {
  hmoAct: string;
  hmoDescription: string;
  jointLiabilityNote: string;
}> = {
  england: {
    hmoAct: 'Housing Act 2004',
    hmoDescription: 'Houses in Multiple Occupation (HMO) are defined under the Housing Act 2004. Properties with 5+ people forming 2+ households require mandatory licensing.',
    jointLiabilityNote: 'Joint and several liability ensures each tenant is fully responsible for the entire rent, protecting landlords when letting to multiple tenants.',
  },
  wales: {
    hmoAct: 'Housing (Wales) Act 2014',
    hmoDescription: 'HMO licensing in Wales follows the Housing (Wales) Act 2014. Properties must meet additional safety standards under the Renting Homes (Wales) Act 2016.',
    jointLiabilityNote: 'Joint liability clauses protect contract-holders and landlords equally under Welsh occupation contracts.',
  },
  scotland: {
    hmoAct: 'Civic Government (Scotland) Act 1982',
    hmoDescription: 'HMO licensing in Scotland is governed by the Civic Government (Scotland) Act 1982. Properties with 3+ tenants from 2+ families require mandatory licensing.',
    jointLiabilityNote: 'Joint and several liability in Private Residential Tenancies ensures shared responsibility among multiple tenants.',
  },
  'northern-ireland': {
    hmoAct: 'Housing (NI) Order 1992',
    hmoDescription: 'HMO registration in Northern Ireland is managed by local councils under the Housing (NI) Order 1992.',
    jointLiabilityNote: 'Joint liability provisions are commonly used for multiple-occupancy private tenancies.',
  },
};

/**
 * Detection thresholds
 */
const THRESHOLDS = {
  /** Number of tenants that triggers HMO consideration */
  HMO_TENANT_THRESHOLD: 3,
  /** High-value property monthly rent threshold (GBP) */
  HIGH_VALUE_RENT_THRESHOLD: 2000,
  /** Number of tenants that suggests shared occupancy */
  SHARED_OCCUPANCY_THRESHOLD: 2,
};

/**
 * Detect if Premium tier should be recommended based on wizard facts
 *
 * @param facts - Collected wizard facts
 * @param jurisdiction - The jurisdiction (affects legal context)
 * @returns Premium recommendation result
 */
export function detectPremiumRecommendation(
  facts: Record<string, any>,
  jurisdiction: CanonicalJurisdiction
): PremiumRecommendationResult {
  const reasons: PremiumRecommendationReason[] = [];
  const legalContext = JURISDICTION_LEGAL_CONTEXT[jurisdiction];

  // Extract relevant facts
  const tenantCount = extractTenantCount(facts);
  const unrelatedTenants = facts.unrelated_tenants || facts.tenants_unrelated || false;
  const separateRentPayments = facts.separate_rent_payments || facts.rent_paid_separately || false;
  const roomByRoom = facts.room_by_room || facts.room_by_room_let || facts.is_room_let || false;
  const sharedFacilities = facts.shared_facilities || facts.sharing_facilities || false;
  const isHMO = facts.is_hmo || facts.property_is_hmo || false;
  const hmoLicensed = facts.hmo_license || facts.has_hmo_license || facts.hmo_licence_status === 'Currently licensed';
  const isStudentLet = facts.is_student_let || facts.student_accommodation || facts.tenant_type === 'students';
  const guarantorNeeded = facts.guarantor_required || facts.needs_guarantor || false;
  const rentReviewNeeded = facts.rent_increase_clause || facts.needs_rent_review || false;
  const monthlyRent = parseFloat(facts.rent_amount || '0');
  const rentPeriod = facts.rent_period || 'month';

  // Calculate monthly equivalent for high-value check
  const monthlyEquivalent = calculateMonthlyRent(monthlyRent, rentPeriod);

  // =========================================================================
  // Detection Logic (ordered by strength)
  // =========================================================================

  // 1. STRONG: Explicit HMO indicators
  if (isHMO) {
    reasons.push('hmo_property');
  }

  if (hmoLicensed) {
    reasons.push('hmo_licensed');
  }

  // 2. STRONG: 3+ tenants (potential HMO)
  if (tenantCount >= THRESHOLDS.HMO_TENANT_THRESHOLD) {
    reasons.push('multiple_tenants');
  }

  // 3. STRONG: Unrelated tenants (HMO definition)
  if (unrelatedTenants && tenantCount >= 2) {
    reasons.push('unrelated_tenants');
  }

  // 4. STRONG: Room-by-room occupation
  if (roomByRoom) {
    reasons.push('room_by_room_let');
  }

  // 5. MODERATE: Separate rent payments (suggests room-by-room)
  if (separateRentPayments) {
    reasons.push('separate_rent_payments');
  }

  // 6. MODERATE: Shared facilities with multiple tenants
  if (sharedFacilities && tenantCount >= THRESHOLDS.SHARED_OCCUPANCY_THRESHOLD) {
    reasons.push('shared_facilities');
  }

  // 7. MODERATE: Student let (commonly requires guarantor + specific clauses)
  if (isStudentLet) {
    reasons.push('student_let');
  }

  // 8. MODERATE: Guarantor requirement
  if (guarantorNeeded) {
    reasons.push('guarantor_needed');
  }

  // 9. MODERATE: Rent review provisions
  if (rentReviewNeeded) {
    reasons.push('rent_review_needed');
  }

  // 10. LOW: High-value property
  if (monthlyEquivalent >= THRESHOLDS.HIGH_VALUE_RENT_THRESHOLD) {
    reasons.push('high_value_property');
  }

  // =========================================================================
  // Calculate strength and generate message
  // =========================================================================

  const hasStrongIndicator = reasons.some(r =>
    ['hmo_property', 'hmo_licensed', 'multiple_tenants', 'unrelated_tenants', 'room_by_room_let'].includes(r)
  );

  const hasModerateIndicator = reasons.some(r =>
    ['separate_rent_payments', 'shared_facilities', 'student_let', 'guarantor_needed', 'rent_review_needed'].includes(r)
  );

  let strength: 'strong' | 'moderate' | 'none' = 'none';
  if (hasStrongIndicator || reasons.length >= 3) {
    strength = 'strong';
  } else if (hasModerateIndicator || reasons.length >= 2) {
    strength = 'moderate';
  }

  const isRecommended = strength !== 'none';

  // Generate jurisdiction-specific message
  const message = generateMessage(reasons, jurisdiction, strength);
  const rationale = generateRationale(reasons, jurisdiction, legalContext);
  const legalReference = hasStrongIndicator ? legalContext.hmoAct : undefined;

  return {
    isRecommended,
    strength,
    reasons,
    message,
    rationale,
    legalReference,
  };
}

/**
 * Extract tenant count from various fact formats
 */
function extractTenantCount(facts: Record<string, any>): number {
  if (typeof facts.number_of_tenants === 'number') {
    return facts.number_of_tenants;
  }
  if (typeof facts.number_of_tenants === 'string') {
    return parseInt(facts.number_of_tenants, 10) || 0;
  }
  if (typeof facts.tenant_count === 'number') {
    return facts.tenant_count;
  }
  if (Array.isArray(facts.tenants)) {
    return facts.tenants.length;
  }
  return 0;
}

/**
 * Calculate monthly rent equivalent
 */
function calculateMonthlyRent(amount: number, period: string): number {
  switch (period.toLowerCase()) {
    case 'week':
      return amount * 52 / 12;
    case 'month':
      return amount;
    case 'quarter':
      return amount / 3;
    case 'year':
      return amount / 12;
    default:
      return amount;
  }
}

/**
 * Generate user-facing recommendation message
 */
function generateMessage(
  reasons: PremiumRecommendationReason[],
  jurisdiction: CanonicalJurisdiction,
  strength: 'strong' | 'moderate' | 'none'
): string {
  if (strength === 'none') {
    return '';
  }

  // Strong HMO indicators
  if (reasons.includes('hmo_property') || reasons.includes('hmo_licensed')) {
    return 'Based on your answers, the Premium agreement is strongly recommended. HMO properties require specific clauses for joint liability, shared facilities, and licensing compliance.';
  }

  if (reasons.includes('multiple_tenants') && reasons.includes('unrelated_tenants')) {
    return 'Based on your answers, the Premium agreement is strongly recommended. Letting to 3+ unrelated tenants commonly requires HMO-specific clauses under UK housing legislation.';
  }

  if (reasons.includes('room_by_room_let')) {
    return 'Based on your answers, the Premium agreement is strongly recommended. Room-by-room lettings require specific clauses for shared facilities, individual liability, and tenant replacement.';
  }

  // Multiple tenants (potential HMO)
  if (reasons.includes('multiple_tenants')) {
    return 'Based on your answers, the Premium agreement is recommended. Properties with multiple tenants benefit from joint and several liability clauses and shared facility rules.';
  }

  // Student let
  if (reasons.includes('student_let')) {
    return 'Based on your answers, the Premium agreement is recommended for student lettings. It includes guarantor clauses, anti-subletting provisions, and professional cleaning requirements commonly needed for student lets.';
  }

  // Guarantor + rent review
  if (reasons.includes('guarantor_needed') || reasons.includes('rent_review_needed')) {
    return 'Based on your answers, the Premium agreement is recommended. It includes guarantor clauses and rent increase provisions that Standard does not.';
  }

  // High value or shared facilities
  return 'Based on your answers, the Premium agreement is recommended for additional landlord protection and clearer tenant obligations.';
}

/**
 * Generate detailed legal rationale (for expandable section)
 */
function generateRationale(
  reasons: PremiumRecommendationReason[],
  jurisdiction: CanonicalJurisdiction,
  legalContext: typeof JURISDICTION_LEGAL_CONTEXT[CanonicalJurisdiction]
): string {
  const parts: string[] = [];

  if (reasons.includes('hmo_property') || reasons.includes('hmo_licensed') || reasons.includes('multiple_tenants')) {
    parts.push(legalContext.hmoDescription);
  }

  if (reasons.includes('unrelated_tenants') || reasons.includes('multiple_tenants')) {
    parts.push(legalContext.jointLiabilityNote);
  }

  if (reasons.includes('room_by_room_let') || reasons.includes('separate_rent_payments')) {
    parts.push('Room-by-room or separate rent arrangements require clear clauses defining individual and shared responsibilities, tenant replacement procedures, and communal area maintenance.');
  }

  if (reasons.includes('student_let')) {
    parts.push('Student lettings typically require guarantor provisions, stricter subletting controls, and end-of-tenancy cleaning requirements to protect the landlord.');
  }

  if (reasons.includes('guarantor_needed')) {
    parts.push('Guarantor agreements provide an additional layer of financial security when a tenant\'s income or credit history is insufficient.');
  }

  if (reasons.includes('rent_review_needed')) {
    parts.push('Rent review clauses (CPI/RPI-linked or fixed increases) allow for predictable rent adjustments without serving formal notices.');
  }

  if (reasons.includes('high_value_property')) {
    parts.push('Higher-value properties benefit from comprehensive insurance requirements, detailed maintenance schedules, and stronger termination clauses.');
  }

  return parts.join(' ');
}

/**
 * Get Premium feature highlights for a jurisdiction
 */
export function getPremiumFeatures(jurisdiction: CanonicalJurisdiction): {
  feature: string;
  description: string;
  legalBasis?: string;
}[] {
  const features = [
    {
      feature: 'Joint and Several Liability',
      description: 'Each tenant is fully responsible for the entire rent, protecting you if one tenant defaults.',
      legalBasis: 'Common law principle, explicitly stated in agreement',
    },
    {
      feature: 'HMO-Ready Clauses',
      description: 'Clauses for shared facilities, communal area maintenance, and tenant replacement.',
      legalBasis: JURISDICTION_LEGAL_CONTEXT[jurisdiction].hmoAct,
    },
    {
      feature: 'Guarantor Agreement',
      description: 'Built-in guarantor provisions with clear liability terms.',
    },
    {
      feature: 'Rent Increase Provisions',
      description: 'CPI/RPI-linked or fixed rent review clauses.',
    },
    {
      feature: 'Anti-Subletting Clause',
      description: 'Explicit prohibition on subletting and Airbnb-style short lets.',
    },
    {
      feature: 'Professional Cleaning Requirement',
      description: 'Enforceable end-of-tenancy professional cleaning clause.',
    },
  ];

  return features;
}

/**
 * Check if a specific reason should trigger strong recommendation
 */
export function isStrongRecommendationReason(reason: PremiumRecommendationReason): boolean {
  return [
    'hmo_property',
    'hmo_licensed',
    'multiple_tenants',
    'unrelated_tenants',
    'room_by_room_let',
  ].includes(reason);
}
