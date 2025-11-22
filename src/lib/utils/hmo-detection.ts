/**
 * HMO Detection Utility
 *
 * Detects if a property is likely an HMO based on wizard responses
 * Triggers HMO Pro upsell when appropriate
 */

export interface HMODetectionResult {
  isLikelyHMO: boolean;
  confidence: 'high' | 'medium' | 'low';
  reasons: string[];
  tenantCount?: number;
  propertyAddress?: string;
}

/**
 * Detect if property is likely an HMO based on collected facts
 */
export function detectHMO(collectedFacts: Record<string, any>): HMODetectionResult {
  const reasons: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'low';
  let isLikelyHMO = false;

  // Extract relevant facts
  const tenantCount =
    collectedFacts.tenant_count ||
    collectedFacts.number_of_tenants ||
    collectedFacts.tenants?.length ||
    0;

  const propertyType = collectedFacts.property_type?.toLowerCase() || '';
  const livingArrangement = collectedFacts.living_arrangement?.toLowerCase() || '';
  const sharedFacilities = collectedFacts.shared_facilities || collectedFacts.sharing_facilities;
  const propertyAddress = collectedFacts.property_address || collectedFacts.address;
  const unrelatedTenants =
    collectedFacts.unrelated_tenants || collectedFacts.tenants_unrelated || false;

  // Detection logic

  // 1. EXPLICIT: 3+ tenants who share facilities
  if (tenantCount >= 3 && (sharedFacilities || livingArrangement.includes('shared'))) {
    isLikelyHMO = true;
    confidence = 'high';
    reasons.push(`${tenantCount} tenants sharing facilities`);
  }

  // 2. EXPLICIT: User mentioned "HMO" in responses
  const factsString = JSON.stringify(collectedFacts).toLowerCase();
  if (factsString.includes('hmo') || factsString.includes('house in multiple occupation')) {
    isLikelyHMO = true;
    confidence = 'high';
    reasons.push('Property explicitly mentioned as HMO');
  }

  // 3. STRONG INDICATOR: 3+ unrelated tenants
  if (tenantCount >= 3 && unrelatedTenants) {
    isLikelyHMO = true;
    confidence = 'high';
    reasons.push('3+ unrelated tenants detected');
  }

  // 4. PROPERTY TYPE: Explicitly stated as HMO
  if (propertyType.includes('hmo') || propertyType.includes('multiple occupation')) {
    isLikelyHMO = true;
    confidence = 'high';
    reasons.push('Property type is HMO');
  }

  // 5. MEDIUM CONFIDENCE: 3+ tenants (unconfirmed if related)
  if (tenantCount >= 3 && !isLikelyHMO) {
    isLikelyHMO = true;
    confidence = 'medium';
    reasons.push(`${tenantCount} tenants (may be HMO if unrelated)`);
  }

  // 6. LOW CONFIDENCE: Shared living indicators with 2 tenants
  if (
    tenantCount === 2 &&
    (sharedFacilities || livingArrangement.includes('shared')) &&
    !isLikelyHMO
  ) {
    isLikelyHMO = false; // Not HMO with only 2 tenants, but might expand
    confidence = 'low';
    reasons.push('2 tenants sharing (could become HMO if more added)');
  }

  // 7. PROPERTY LAYOUT: Multiple self-contained units
  if (collectedFacts.self_contained_units && collectedFacts.units_count >= 3) {
    isLikelyHMO = true;
    confidence = 'high';
    reasons.push(`${collectedFacts.units_count} self-contained units`);
  }

  // 8. LICENSING MENTIONED: User already has HMO license
  if (
    collectedFacts.hmo_license ||
    collectedFacts.has_hmo_license ||
    collectedFacts.licensed_hmo
  ) {
    isLikelyHMO = true;
    confidence = 'high';
    reasons.push('Property already HMO licensed');
  }

  return {
    isLikelyHMO,
    confidence,
    reasons,
    tenantCount: tenantCount > 0 ? tenantCount : undefined,
    propertyAddress,
  };
}

/**
 * Determine if HMO upsell should be shown
 * Only show for high/medium confidence HMO detection
 */
export function shouldShowHMOUpsell(detectionResult: HMODetectionResult): boolean {
  return (
    detectionResult.isLikelyHMO &&
    (detectionResult.confidence === 'high' || detectionResult.confidence === 'medium')
  );
}

/**
 * Format HMO detection reasons for display
 */
export function formatHMOReasons(reasons: string[]): string {
  if (reasons.length === 0) return 'No HMO indicators detected';
  if (reasons.length === 1) return reasons[0];

  return reasons.join(', ');
}

/**
 * Get HMO upsell message based on detection
 */
export function getHMOUpsellMessage(detectionResult: HMODetectionResult): string {
  const { tenantCount, confidence } = detectionResult;

  if (confidence === 'high') {
    return `Your property appears to be an HMO with ${tenantCount || 3}+ unrelated tenants. HMO Pro helps you stay compliant and avoid fines.`;
  }

  if (confidence === 'medium') {
    return `You have ${tenantCount || 'multiple'} tenants. If they're unrelated, this is an HMO and requires special compliance. Let HMO Pro handle the complexity.`;
  }

  return 'HMO Pro helps landlords manage compliance for properties with multiple unrelated tenants.';
}
