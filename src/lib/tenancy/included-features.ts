/**
 * Tenancy Agreement Included Features - Single Source of Truth
 *
 * This file defines what's included in each tenancy agreement product
 * by jurisdiction and tier. It ensures consistency across:
 * - Product marketing pages
 * - Wizard review summary
 * - Preview page "What's Included" panel
 * - Generated PDF contents
 *
 * IMPORTANT: Do not hardcode copy elsewhere. Always reference this mapping.
 */

export type TenancyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';
export type TenancyTier = 'standard' | 'premium';

/**
 * Individual feature/document included in the agreement
 */
export interface IncludedFeature {
  /** Unique identifier for this feature */
  id: string;
  /** Display label for UI */
  label: string;
  /** Detailed description */
  description: string;
  /** Category for grouping */
  category: 'agreement' | 'schedule' | 'compliance' | 'guidance';
  /** Whether this is a premium-only feature */
  isPremiumOnly?: boolean;
  /** Whether this is tier-specific (e.g., different for standard vs premium) */
  tierVariant?: {
    standard: string;
    premium: string;
  };
}

/**
 * Jurisdiction-specific agreement metadata
 */
export interface JurisdictionAgreementInfo {
  /** The official agreement name for this jurisdiction */
  agreementName: string;
  /** Short name for UI */
  agreementShortName: string;
  /** Legal framework reference */
  legalFramework: string;
  /** Key legal reference for the agreement */
  legalReference: string;
}

/**
 * Agreement type names by jurisdiction
 */
export const JURISDICTION_AGREEMENT_INFO: Record<TenancyJurisdiction, JurisdictionAgreementInfo> = {
  england: {
    agreementName: 'Assured Shorthold Tenancy Agreement',
    agreementShortName: 'AST',
    legalFramework: 'Housing Act 1988',
    legalReference: 'Compliant with Housing Act 1988 & Deregulation Act 2015',
  },
  wales: {
    agreementName: 'Standard Occupation Contract',
    agreementShortName: 'Occupation Contract',
    legalFramework: 'Renting Homes (Wales) Act 2016',
    legalReference: 'Compliant with Renting Homes (Wales) Act 2016',
  },
  scotland: {
    agreementName: 'Private Residential Tenancy Agreement',
    agreementShortName: 'PRT',
    legalFramework: 'Private Housing (Tenancies) (Scotland) Act 2016',
    legalReference: 'Compliant with Private Housing (Tenancies) (Scotland) Act 2016',
  },
  'northern-ireland': {
    agreementName: 'Private Tenancy Agreement',
    agreementShortName: 'Private Tenancy',
    legalFramework: 'Private Tenancies Act (Northern Ireland) 2022',
    legalReference: 'Compliant with Private Tenancies Act (NI) 2022',
  },
};

/**
 * Common schedules included in all agreements (both tiers)
 */
const COMMON_SCHEDULES: IncludedFeature[] = [
  {
    id: 'schedule_property',
    label: 'Schedule 1: Property Details',
    description: 'Full property description, included areas, and parking arrangements',
    category: 'schedule',
  },
  {
    id: 'schedule_rent',
    label: 'Schedule 2: Rent & Deposit',
    description: 'Rent amount, payment terms, and deposit protection details',
    category: 'schedule',
  },
  {
    id: 'schedule_utilities',
    label: 'Schedule 3: Utilities & Bills',
    description: 'Responsibility for council tax, utilities, and other bills',
    category: 'schedule',
  },
  {
    id: 'schedule_house_rules',
    label: 'Schedule 5: House Rules',
    description: 'Property rules including pets, smoking, and access arrangements',
    category: 'schedule',
  },
];

/**
 * Inventory schedule - tier-specific behaviour
 */
const INVENTORY_SCHEDULE: IncludedFeature = {
  id: 'schedule_inventory',
  label: 'Schedule 4: Inventory & Schedule of Condition',
  description: 'Record of property contents and condition',
  category: 'schedule',
  tierVariant: {
    standard: 'Blank template (ready to complete)',
    premium: 'Wizard-completed inventory with rooms, items, and conditions',
  },
};

/**
 * Premium-only features
 */
const PREMIUM_FEATURES: IncludedFeature[] = [
  {
    id: 'guarantor_provisions',
    label: 'Guarantor Provisions',
    description: 'Third-party guarantee clauses with clear liability terms',
    category: 'agreement',
    isPremiumOnly: true,
  },
  {
    id: 'hmo_clauses',
    label: 'HMO-Specific Clauses',
    description: 'Joint & several liability, shared facilities rules, tenant replacement',
    category: 'agreement',
    isPremiumOnly: true,
  },
  {
    id: 'late_payment',
    label: 'Late Payment Terms',
    description: 'Contractual interest and grace period provisions',
    category: 'agreement',
    isPremiumOnly: true,
  },
  {
    id: 'emergency_contacts',
    label: 'Emergency Contacts & Procedures',
    description: 'Utility shut-off locations and emergency tradesperson contacts',
    category: 'agreement',
    isPremiumOnly: true,
  },
  {
    id: 'rent_review',
    label: 'Rent Review Mechanism',
    description: 'Contractual rent increase provisions (CPI/RPI-linked)',
    category: 'agreement',
    isPremiumOnly: true,
  },
  {
    id: 'anti_subletting',
    label: 'Anti-Subletting Clause',
    description: 'Prohibition on Airbnb-style subletting',
    category: 'agreement',
    isPremiumOnly: true,
  },
];

/**
 * Compliance checklist names by jurisdiction
 */
export const COMPLIANCE_CHECKLIST_INFO: Record<TenancyJurisdiction, {
  title: string;
  description: string;
}> = {
  england: {
    title: 'Pre-Tenancy Compliance Checklist (England)',
    description: 'Non-contractual guidance covering deposit protection, gas safety, EPC, EICR, How to Rent Guide, and Right to Rent requirements',
  },
  wales: {
    title: 'Pre-Tenancy Compliance Checklist (Wales)',
    description: 'Non-contractual guidance covering Rent Smart Wales registration, deposit protection, gas safety, EPC, and EICR requirements',
  },
  scotland: {
    title: 'Pre-Tenancy Compliance Checklist (Scotland)',
    description: 'Non-contractual guidance covering landlord registration, deposit protection, legionella risk, gas safety, and repairing standard obligations',
  },
  'northern-ireland': {
    title: 'Pre-Tenancy Compliance Checklist (Northern Ireland)',
    description: 'Non-contractual guidance covering landlord registration, deposit protection, gas safety, EPC, and electrical safety (from April 2025)',
  },
};

/**
 * Get all features included for a specific jurisdiction and tier
 */
export function getIncludedFeatures(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): IncludedFeature[] {
  const agreementInfo = JURISDICTION_AGREEMENT_INFO[jurisdiction];
  const complianceInfo = COMPLIANCE_CHECKLIST_INFO[jurisdiction];

  const features: IncludedFeature[] = [];

  // 1. Main agreement
  features.push({
    id: 'main_agreement',
    label: tier === 'premium'
      ? `HMO ${agreementInfo.agreementName}`
      : agreementInfo.agreementName,
    description: tier === 'premium'
      ? `HMO-specific agreement with multi-occupancy clauses. ${agreementInfo.legalReference}.`
      : `Core tenancy agreement. ${agreementInfo.legalReference}.`,
    category: 'agreement',
  });

  // 2. Definitions section
  features.push({
    id: 'definitions',
    label: 'Definitions & Interpretation',
    description: 'Clear definitions of legal terms used throughout the agreement',
    category: 'agreement',
  });

  // 3. All common schedules
  features.push(...COMMON_SCHEDULES);

  // 4. Inventory schedule (with tier-specific variant)
  features.push({
    ...INVENTORY_SCHEDULE,
    description: tier === 'premium'
      ? INVENTORY_SCHEDULE.tierVariant!.premium
      : INVENTORY_SCHEDULE.tierVariant!.standard,
  });

  // 5. Premium-only features (if premium tier)
  if (tier === 'premium') {
    features.push(...PREMIUM_FEATURES);
  }

  // 6. Compliance checklist (both tiers)
  features.push({
    id: 'compliance_checklist',
    label: complianceInfo.title,
    description: complianceInfo.description,
    category: 'compliance',
  });

  // 7. Signature blocks
  features.push({
    id: 'signature_blocks',
    label: 'Tenant & Landlord Signature Blocks',
    description: 'Legally formatted signature sections for all parties',
    category: 'agreement',
  });

  return features;
}

/**
 * Get features grouped by category for display
 */
export function getIncludedFeaturesGrouped(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): Record<string, IncludedFeature[]> {
  const features = getIncludedFeatures(jurisdiction, tier);

  return features.reduce((groups, feature) => {
    const category = feature.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(feature);
    return groups;
  }, {} as Record<string, IncludedFeature[]>);
}

/**
 * Get a human-readable summary of what's included for marketing pages
 */
export interface IncludedSummary {
  /** Main headline items */
  headline: string[];
  /** Detailed breakdown */
  details: Array<{
    category: string;
    items: string[];
  }>;
  /** Key difference from other tier */
  tierDifference: string;
}

export function getIncludedSummary(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): IncludedSummary {
  const agreementInfo = JURISDICTION_AGREEMENT_INFO[jurisdiction];

  const headline: string[] = [
    tier === 'premium'
      ? `A solicitor-grade HMO ${agreementInfo.agreementShortName}`
      : `A solicitor-grade ${agreementInfo.agreementShortName}`,
    tier === 'premium'
      ? 'Wizard-completed inventory'
      : 'Structured inventory schedule (ready to complete)',
    'Jurisdiction-specific compliance checklist',
    'All required schedules and signature sections',
  ];

  const details = [
    {
      category: 'Agreement',
      items: tier === 'premium'
        ? [
          agreementInfo.agreementName,
          'Definitions & Interpretation',
          'HMO-specific clauses',
          'Guarantor provisions (if added)',
          'Late payment & rent review terms',
        ]
        : [
          agreementInfo.agreementName,
          'Definitions & Interpretation',
          'Core tenancy clauses',
        ],
    },
    {
      category: 'Schedules',
      items: [
        'Property Details',
        'Rent & Deposit',
        'Utilities & Bills',
        tier === 'premium' ? 'Inventory (wizard-completed)' : 'Inventory (blank template)',
        'House Rules',
      ],
    },
    {
      category: 'Compliance',
      items: [
        COMPLIANCE_CHECKLIST_INFO[jurisdiction].title,
        'Tenant & Landlord signature blocks',
      ],
    },
  ];

  const tierDifference = tier === 'premium'
    ? 'Includes wizard-completed inventory, HMO clauses, guarantor provisions, and premium terms'
    : 'Includes blank inventory template for manual completion';

  return { headline, details, tierDifference };
}

/**
 * Get inventory behaviour description for a tier
 */
export function getInventoryBehaviour(tier: TenancyTier): {
  label: string;
  description: string;
  wizardRequired: boolean;
} {
  if (tier === 'premium') {
    return {
      label: 'Wizard-Completed Inventory',
      description: 'Inventory completed via the wizard with rooms, items, conditions, and notes',
      wizardRequired: true,
    };
  }
  return {
    label: 'Blank Inventory Template',
    description: 'Structured inventory schedule ready for manual completion',
    wizardRequired: false,
  };
}

/**
 * Validate that PDF contents match what's advertised
 * Used in consistency tests
 */
export function validatePDFMatchesAdvertised(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier,
  pdfContents: {
    hasAgreement: boolean;
    hasInventory: boolean;
    inventoryIsCompleted: boolean;
    hasComplianceChecklist: boolean;
    hasSignatureBlocks: boolean;
    scheduleCount: number;
  }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Agreement must always be present
  if (!pdfContents.hasAgreement) {
    errors.push('PDF missing main tenancy agreement');
  }

  // Inventory must always be present
  if (!pdfContents.hasInventory) {
    errors.push('PDF missing inventory schedule');
  }

  // Inventory completion status must match tier
  if (tier === 'premium' && !pdfContents.inventoryIsCompleted) {
    errors.push('Premium PDF has blank inventory but should have wizard-completed inventory');
  }
  // Note: Standard tier CAN have completed inventory if user filled in data, but it's optional
  // So we don't check inventoryIsCompleted === false for standard

  // Compliance checklist must always be present
  if (!pdfContents.hasComplianceChecklist) {
    errors.push('PDF missing compliance checklist');
  }

  // Signature blocks must always be present
  if (!pdfContents.hasSignatureBlocks) {
    errors.push('PDF missing signature blocks');
  }

  // Must have at least 5 schedules (Property, Rent, Utilities, Inventory, House Rules)
  if (pdfContents.scheduleCount < 5) {
    errors.push(`PDF has ${pdfContents.scheduleCount} schedules but should have at least 5`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a feature is included for a given tier
 */
export function isFeatureIncluded(
  featureId: string,
  tier: TenancyTier
): boolean {
  // Premium-only features
  const premiumOnlyIds = PREMIUM_FEATURES.map(f => f.id);
  if (premiumOnlyIds.includes(featureId)) {
    return tier === 'premium';
  }
  // All other features are included in both tiers
  return true;
}

/**
 * Get tier recommendation based on property characteristics
 */
export function getTierRecommendation(propertyInfo: {
  tenantCount?: number;
  isHMO?: boolean;
  isStudentLet?: boolean;
  hasGuarantor?: boolean;
}): {
  recommendedTier: TenancyTier;
  reason: string;
} {
  const { tenantCount, isHMO, isStudentLet, hasGuarantor } = propertyInfo;

  // HMO properties should use premium
  if (isHMO) {
    return {
      recommendedTier: 'premium',
      reason: 'HMO properties require HMO-specific clauses included in Premium',
    };
  }

  // 3+ tenants suggests HMO
  if (tenantCount && tenantCount >= 3) {
    return {
      recommendedTier: 'premium',
      reason: 'Properties with 3+ tenants benefit from HMO clauses',
    };
  }

  // Student lets benefit from guarantor clauses
  if (isStudentLet) {
    return {
      recommendedTier: 'premium',
      reason: 'Student lets benefit from guarantor and professional cleaning clauses',
    };
  }

  // If guarantor is needed
  if (hasGuarantor) {
    return {
      recommendedTier: 'premium',
      reason: 'Guarantor provisions are included in Premium',
    };
  }

  // Default to standard
  return {
    recommendedTier: 'standard',
    reason: 'Standard is suitable for single households and standard residential lets',
  };
}
