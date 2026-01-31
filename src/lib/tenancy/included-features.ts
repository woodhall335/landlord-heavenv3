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
 *
 * LEGAL NOTES:
 * - Premium ≠ HMO. Premium tier includes enhanced features; HMO clauses are
 *   only included when the property is actually an HMO (isHMO context flag).
 * - All cleaning language must be Tenant Fees Act 2019 compliant.
 * - Hardcoded dates should be avoided; use "as required by law" for canonical
 *   mapping. Specific dates belong in jurisdiction checklist partials.
 */

export type TenancyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';
export type TenancyTier = 'standard' | 'premium';

/**
 * Context for feature generation
 * Used to customize features based on property characteristics
 */
export interface FeatureContext {
  /** Is this property an HMO? Only adds HMO clauses when true */
  isHMO?: boolean;
  /** Was inventory data provided via wizard? */
  hasInventoryData?: boolean;
}

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
  /** Whether this feature is HMO-specific (only included when isHMO=true) */
  isHMOSpecific?: boolean;
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
 * Required schedule IDs that must be present in every tenancy agreement
 */
export const REQUIRED_SCHEDULE_IDS = [
  'schedule_property',
  'schedule_rent',
  'schedule_utilities',
  'schedule_inventory',
  'schedule_house_rules',
] as const;

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
    premium: 'Wizard-completed inventory (falls back to blank template if not completed)',
  },
};

/**
 * Base subletting clause - included in BOTH tiers
 * Standard tier: baseline prohibition requiring landlord consent
 * Premium tier: enhanced controls for short-lets/Airbnb
 */
const SUBLETTING_CLAUSE: IncludedFeature = {
  id: 'subletting_prohibition',
  label: 'Subletting & Assignment Clause',
  description: 'Prohibition on subletting without landlord consent',
  category: 'agreement',
  tierVariant: {
    standard: 'Subletting and assignment prohibited without written landlord consent',
    premium: 'Enhanced subletting controls including short-let and Airbnb restrictions',
  },
};

/**
 * Premium-only features
 * Note: HMO clauses are only included when isHMO=true in context
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
    isHMOSpecific: true, // Only included when isHMO=true
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
    id: 'short_let_controls',
    label: 'Short-Let & Airbnb Controls',
    description: 'Enhanced restrictions on short-term subletting and holiday lets',
    category: 'agreement',
    isPremiumOnly: true,
  },
  {
    id: 'condition_standards',
    label: 'End-of-Tenancy Condition Standards',
    description: 'Property to be returned in the same condition as at check-in, fair wear and tear excepted',
    category: 'agreement',
    isPremiumOnly: true,
  },
];

/**
 * Compliance checklist names by jurisdiction
 * Note: Avoid hardcoded dates - use "as required by law" for canonical mapping.
 * Specific dates belong in jurisdiction checklist partial templates.
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
    description: 'Non-contractual guidance covering landlord registration, deposit protection, legionella risk, gas safety, and electrical safety / Repairing Standard obligations',
  },
  'northern-ireland': {
    title: 'Pre-Tenancy Compliance Checklist (Northern Ireland)',
    description: 'Non-contractual guidance covering landlord registration, deposit protection, gas safety, EPC, and electrical safety as required by law',
  },
};

/**
 * Get all features included for a specific jurisdiction and tier
 *
 * @param jurisdiction - The jurisdiction for the agreement
 * @param tier - The product tier (standard or premium)
 * @param context - Optional context for feature customization (isHMO, hasInventoryData)
 */
export function getIncludedFeatures(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier,
  context?: FeatureContext
): IncludedFeature[] {
  const agreementInfo = JURISDICTION_AGREEMENT_INFO[jurisdiction];
  const complianceInfo = COMPLIANCE_CHECKLIST_INFO[jurisdiction];
  const isHMO = context?.isHMO ?? false;
  const hasInventoryData = context?.hasInventoryData ?? false;

  const features: IncludedFeature[] = [];

  // 1. Main agreement - only label as HMO when isHMO is true
  const isHMOAgreement = tier === 'premium' && isHMO;
  features.push({
    id: 'main_agreement',
    label: isHMOAgreement
      ? `HMO ${agreementInfo.agreementName}`
      : agreementInfo.agreementName,
    description: isHMOAgreement
      ? `HMO-specific agreement with multi-occupancy clauses. ${agreementInfo.legalReference}.`
      : tier === 'premium'
        ? `Premium tenancy agreement with enhanced terms. ${agreementInfo.legalReference}.`
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

  // 4. Inventory schedule (with tier and context-specific variant)
  let inventoryDescription: string;
  if (tier === 'premium') {
    inventoryDescription = hasInventoryData
      ? 'Wizard-completed inventory'
      : 'Inventory schedule ready to complete (fill in via wizard or manually)';
  } else {
    inventoryDescription = INVENTORY_SCHEDULE.tierVariant!.standard;
  }
  features.push({
    ...INVENTORY_SCHEDULE,
    description: inventoryDescription,
  });

  // 5. Subletting clause - included in BOTH tiers with tier-specific wording
  features.push({
    ...SUBLETTING_CLAUSE,
    description: tier === 'premium'
      ? SUBLETTING_CLAUSE.tierVariant!.premium
      : SUBLETTING_CLAUSE.tierVariant!.standard,
  });

  // 6. Premium-only features (if premium tier)
  if (tier === 'premium') {
    // Filter: only include HMO-specific features when isHMO is true
    const applicableFeatures = PREMIUM_FEATURES.filter(f => {
      if (f.isHMOSpecific) {
        return isHMO;
      }
      return true;
    });
    features.push(...applicableFeatures);
  }

  // 7. Compliance checklist (both tiers)
  features.push({
    id: 'compliance_checklist',
    label: complianceInfo.title,
    description: complianceInfo.description,
    category: 'compliance',
  });

  // 8. Signature blocks
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
  tier: TenancyTier,
  context?: FeatureContext
): Record<string, IncludedFeature[]> {
  const features = getIncludedFeatures(jurisdiction, tier, context);

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
  tier: TenancyTier,
  context?: FeatureContext
): IncludedSummary {
  const agreementInfo = JURISDICTION_AGREEMENT_INFO[jurisdiction];
  const isHMO = context?.isHMO ?? false;
  const hasInventoryData = context?.hasInventoryData ?? false;
  const isHMOAgreement = tier === 'premium' && isHMO;

  // Inventory headline based on tier and context
  let inventoryHeadline: string;
  if (tier === 'premium') {
    inventoryHeadline = hasInventoryData
      ? 'Wizard-completed inventory'
      : 'Inventory schedule ready to complete (fill in via wizard or manually)';
  } else {
    inventoryHeadline = 'Structured inventory schedule (ready to complete)';
  }

  const headline: string[] = [
    isHMOAgreement
      ? `A solicitor-grade HMO ${agreementInfo.agreementShortName}`
      : `A solicitor-grade ${agreementInfo.agreementShortName}`,
    inventoryHeadline,
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
            ...(isHMO ? ['HMO-specific clauses'] : []),
            'Guarantor provisions (activates when guarantor details are provided)',
            'Late payment & rent review terms',
            'Enhanced subletting controls',
          ]
        : [
            agreementInfo.agreementName,
            'Definitions & Interpretation',
            'Core tenancy clauses',
            'Subletting prohibition clause',
          ],
    },
    {
      category: 'Schedules',
      items: [
        'Property Details',
        'Rent & Deposit',
        'Utilities & Bills',
        tier === 'premium'
          ? (hasInventoryData ? 'Inventory (wizard-completed)' : 'Inventory (ready to complete)')
          : 'Inventory (blank template)',
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

  let tierDifference: string;
  if (tier === 'premium') {
    const inventoryNote = hasInventoryData
      ? 'wizard-completed inventory'
      : 'inventory schedule (ready to complete)';
    tierDifference = isHMO
      ? `Includes ${inventoryNote}, HMO clauses, guarantor provisions, and premium terms`
      : `Includes ${inventoryNote}, guarantor provisions, enhanced subletting controls, and premium terms`;
  } else {
    tierDifference = 'Includes blank inventory template for manual completion';
  }

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
 * PDF validation input structure
 */
export interface PDFValidationInput {
  hasAgreement: boolean;
  hasInventory: boolean;
  /** Whether inventory contains completed data (rooms/items) */
  inventoryIsCompleted: boolean;
  /** Whether user explicitly completed the inventory wizard step */
  inventoryWizardStepCompleted?: boolean;
  hasComplianceChecklist: boolean;
  hasSignatureBlocks: boolean;
  /** IDs of schedules present in the PDF */
  scheduleIds: string[];
  /** @deprecated Use scheduleIds instead */
  scheduleCount?: number;
}

/**
 * Validate that PDF contents match what's advertised
 * Used in consistency tests
 *
 * Validation rules:
 * - Standard: inventory always present, always allowed to be blank
 * - Premium: inventory always present; completed only required when
 *   inventory data exists OR user completed the wizard step
 */
export function validatePDFMatchesAdvertised(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier,
  pdfContents: PDFValidationInput
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Agreement must always be present
  if (!pdfContents.hasAgreement) {
    errors.push('PDF missing main tenancy agreement');
  }

  // Inventory must always be present (both tiers)
  if (!pdfContents.hasInventory) {
    errors.push('PDF missing inventory schedule');
  }

  // Premium inventory validation:
  // - If user completed wizard step AND inventory is blank, that's an error
  // - If inventory has no data (fallback scenario), blank is acceptable
  if (tier === 'premium' && pdfContents.inventoryWizardStepCompleted === true) {
    if (!pdfContents.inventoryIsCompleted) {
      errors.push('Premium PDF has blank inventory but wizard step was completed - inventory should be populated');
    }
  }
  // Note: For premium tier without explicit wizard completion flag,
  // we allow blank inventory as a legitimate fallback (user skipped step)

  // Compliance checklist must always be present
  if (!pdfContents.hasComplianceChecklist) {
    errors.push('PDF missing compliance checklist');
  }

  // Signature blocks must always be present
  if (!pdfContents.hasSignatureBlocks) {
    errors.push('PDF missing signature blocks');
  }

  // Validate required schedules by ID (not just count)
  if (pdfContents.scheduleIds && pdfContents.scheduleIds.length > 0) {
    const missingSchedules = REQUIRED_SCHEDULE_IDS.filter(
      id => !pdfContents.scheduleIds.includes(id)
    );
    if (missingSchedules.length > 0) {
      errors.push(`PDF missing required schedules: ${missingSchedules.join(', ')}`);
    }
  } else if (pdfContents.scheduleCount !== undefined) {
    // Fallback to count-based validation for backwards compatibility
    if (pdfContents.scheduleCount < REQUIRED_SCHEDULE_IDS.length) {
      errors.push(`PDF has ${pdfContents.scheduleCount} schedules but should have at least ${REQUIRED_SCHEDULE_IDS.length}`);
    }
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
  tier: TenancyTier,
  context?: FeatureContext
): boolean {
  // Subletting prohibition is included in BOTH tiers
  if (featureId === 'subletting_prohibition') {
    return true;
  }

  // HMO-specific features require isHMO context
  const hmoFeature = PREMIUM_FEATURES.find(f => f.id === featureId && f.isHMOSpecific);
  if (hmoFeature) {
    return tier === 'premium' && (context?.isHMO ?? false);
  }

  // Premium-only features (non-HMO-specific)
  const premiumOnlyFeature = PREMIUM_FEATURES.find(f => f.id === featureId && f.isPremiumOnly && !f.isHMOSpecific);
  if (premiumOnlyFeature) {
    return tier === 'premium';
  }

  // All other features are included in both tiers
  return true;
}

/**
 * Get tier recommendation based on property characteristics
 *
 * Note: Language must be Tenant Fees Act 2019 compliant.
 * "Professional cleaning" as a requirement is banned - use
 * "clean to a professional standard" or "end-of-tenancy condition standards".
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

  // Student lets benefit from guarantor clauses and condition standards
  if (isStudentLet) {
    return {
      recommendedTier: 'premium',
      reason: 'Student lets benefit from guarantor provisions and end-of-tenancy condition standards',
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
