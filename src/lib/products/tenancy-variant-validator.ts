/**
 * Tenancy Agreement Variant Validator
 *
 * Deterministic validator that enforces the "2-variants only" rule:
 * - Standard: Base tenancy agreement ONLY, NO HMO clauses
 * - Premium: HMO-specific tenancy agreement with multi-occupancy clauses
 *
 * This validator ensures consistency between:
 * - pack-contents.ts (document lists)
 * - ast-generator.ts (template paths)
 * - Actual template content (HMO markers)
 */

import fs from 'fs';
import path from 'path';

// ============================================================================
// TYPES
// ============================================================================

export type TenancyJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';
export type TenancyTier = 'standard' | 'premium';

export interface TenancyVariantConfig {
  jurisdiction: TenancyJurisdiction;
  tier: TenancyTier;
  templatePath: string;
  documentKey: string;
  documentTitle: string;
  mustHaveHMO: boolean;  // Premium must have HMO
  mustNotHaveHMO: boolean; // Standard must NOT have HMO
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface JurisdictionVariants {
  jurisdiction: TenancyJurisdiction;
  standard: TenancyVariantConfig;
  premium: TenancyVariantConfig;
}

// ============================================================================
// CANONICAL CONFIGURATION (Source of Truth)
// ============================================================================

/**
 * Canonical configuration for all tenancy agreement variants.
 * This is the SINGLE SOURCE OF TRUTH for what variants exist.
 */
export const TENANCY_VARIANT_CONFIGS: Record<TenancyJurisdiction, JurisdictionVariants> = {
  england: {
    jurisdiction: 'england',
    standard: {
      jurisdiction: 'england',
      tier: 'standard',
      templatePath: 'uk/england/templates/standard_ast_formatted.hbs',
      documentKey: 'ast_agreement',
      documentTitle: 'Assured Shorthold Tenancy Agreement',
      mustHaveHMO: false,
      mustNotHaveHMO: true,
    },
    premium: {
      jurisdiction: 'england',
      tier: 'premium',
      templatePath: 'uk/england/templates/ast_hmo.hbs',
      documentKey: 'ast_agreement_hmo',
      documentTitle: 'HMO Tenancy Agreement',
      mustHaveHMO: true,
      mustNotHaveHMO: false,
    },
  },
  wales: {
    jurisdiction: 'wales',
    standard: {
      jurisdiction: 'wales',
      tier: 'standard',
      templatePath: 'uk/wales/templates/standard_occupation_contract.hbs',
      documentKey: 'soc_agreement',
      documentTitle: 'Standard Occupation Contract',
      mustHaveHMO: false,
      mustNotHaveHMO: true,
    },
    premium: {
      jurisdiction: 'wales',
      tier: 'premium',
      templatePath: 'uk/wales/templates/occupation_contract_hmo.hbs',
      documentKey: 'soc_agreement_hmo',
      documentTitle: 'HMO Occupation Contract',
      mustHaveHMO: true,
      mustNotHaveHMO: false,
    },
  },
  scotland: {
    jurisdiction: 'scotland',
    standard: {
      jurisdiction: 'scotland',
      tier: 'standard',
      templatePath: 'uk/scotland/templates/prt_agreement.hbs',
      documentKey: 'prt_agreement',
      documentTitle: 'Private Residential Tenancy Agreement',
      mustHaveHMO: false,
      mustNotHaveHMO: true,
    },
    premium: {
      jurisdiction: 'scotland',
      tier: 'premium',
      templatePath: 'uk/scotland/templates/prt_agreement_hmo.hbs',
      documentKey: 'prt_agreement_hmo',
      documentTitle: 'HMO Private Residential Tenancy Agreement',
      mustHaveHMO: true,
      mustNotHaveHMO: false,
    },
  },
  'northern-ireland': {
    jurisdiction: 'northern-ireland',
    standard: {
      jurisdiction: 'northern-ireland',
      tier: 'standard',
      templatePath: 'uk/northern-ireland/templates/private_tenancy_agreement.hbs',
      documentKey: 'private_tenancy_agreement',
      documentTitle: 'Private Tenancy Agreement',
      mustHaveHMO: false,
      mustNotHaveHMO: true,
    },
    premium: {
      jurisdiction: 'northern-ireland',
      tier: 'premium',
      templatePath: 'uk/northern-ireland/templates/private_tenancy_hmo.hbs',
      documentKey: 'private_tenancy_agreement_hmo',
      documentTitle: 'HMO Private Tenancy Agreement',
      mustHaveHMO: true,
      mustNotHaveHMO: false,
    },
  },
};

// ============================================================================
// HMO MARKERS (Keywords that indicate HMO clauses)
// ============================================================================

/**
 * Keywords that MUST appear in HMO templates
 */
export const HMO_REQUIRED_MARKERS = [
  'House in Multiple Occupation',
  'HMO',
  'Joint and Several Liability',
  'shared facilities',
  'multi-occupancy',
];

/**
 * Keywords that indicate HMO content (should NOT appear in standard templates)
 */
export const HMO_FORBIDDEN_IN_STANDARD = [
  '## HMO',
  'HMO CLAUSES',
  'House in Multiple Occupation (HMO) Provisions',
  'HMO Licensing',
  'hmo_licence',
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Check if a template file contains HMO markers
 */
export function templateContainsHMOMarkers(
  templateContent: string,
  markers: string[] = HMO_REQUIRED_MARKERS
): { found: boolean; markers: string[] } {
  const foundMarkers: string[] = [];
  for (const marker of markers) {
    if (templateContent.toLowerCase().includes(marker.toLowerCase())) {
      foundMarkers.push(marker);
    }
  }
  return {
    found: foundMarkers.length > 0,
    markers: foundMarkers,
  };
}

/**
 * Check if a template file contains forbidden HMO content for standard tier
 */
export function templateContainsForbiddenHMO(
  templateContent: string,
  forbiddenMarkers: string[] = HMO_FORBIDDEN_IN_STANDARD
): { found: boolean; markers: string[] } {
  const foundMarkers: string[] = [];
  for (const marker of forbiddenMarkers) {
    // Check for unconditional presence (not wrapped in {{#if}})
    // We're looking for hard-coded HMO sections, not conditional ones
    if (templateContent.includes(marker)) {
      // Make sure it's not inside a comment
      const index = templateContent.indexOf(marker);
      const beforeMarker = templateContent.slice(Math.max(0, index - 50), index);
      if (!beforeMarker.includes('{{!--') && !beforeMarker.includes('{{!')) {
        foundMarkers.push(marker);
      }
    }
  }
  return {
    found: foundMarkers.length > 0,
    markers: foundMarkers,
  };
}

/**
 * Validate a single tenancy variant configuration
 */
export function validateVariantConfig(
  config: TenancyVariantConfig,
  templateContent: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check HMO requirements for premium tier
  if (config.mustHaveHMO) {
    const hmoCheck = templateContainsHMOMarkers(templateContent);
    if (!hmoCheck.found) {
      errors.push(
        `[${config.jurisdiction}/${config.tier}] Template MUST contain HMO markers but none found. ` +
        `Expected at least one of: ${HMO_REQUIRED_MARKERS.join(', ')}`
      );
    } else if (hmoCheck.markers.length < 3) {
      warnings.push(
        `[${config.jurisdiction}/${config.tier}] Template has only ${hmoCheck.markers.length} HMO markers. ` +
        `Consider adding more for completeness. Found: ${hmoCheck.markers.join(', ')}`
      );
    }
  }

  // Check HMO exclusion for standard tier
  if (config.mustNotHaveHMO) {
    const forbiddenCheck = templateContainsForbiddenHMO(templateContent);
    if (forbiddenCheck.found) {
      errors.push(
        `[${config.jurisdiction}/${config.tier}] Standard template MUST NOT contain HMO clauses but found: ` +
        `${forbiddenCheck.markers.join(', ')}`
      );
    }
  }

  // Validate template path exists
  if (!config.templatePath) {
    errors.push(`[${config.jurisdiction}/${config.tier}] Template path is empty`);
  }

  // Validate document key format
  if (!config.documentKey) {
    errors.push(`[${config.jurisdiction}/${config.tier}] Document key is empty`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all tenancy variants for a jurisdiction
 */
export function validateJurisdiction(
  jurisdiction: TenancyJurisdiction,
  getTemplateContent: (templatePath: string) => string | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const variants = TENANCY_VARIANT_CONFIGS[jurisdiction];

  if (!variants) {
    errors.push(`Unknown jurisdiction: ${jurisdiction}`);
    return { valid: false, errors, warnings };
  }

  // Validate exactly 2 variants exist
  const tierCount = [variants.standard, variants.premium].filter(Boolean).length;
  if (tierCount !== 2) {
    errors.push(
      `[${jurisdiction}] Must have exactly 2 variants (standard + premium), found ${tierCount}`
    );
  }

  // Validate each tier
  for (const tier of ['standard', 'premium'] as const) {
    const config = variants[tier];
    if (!config) {
      errors.push(`[${jurisdiction}] Missing ${tier} variant configuration`);
      continue;
    }

    const templateContent = getTemplateContent(config.templatePath);
    if (templateContent === null) {
      errors.push(`[${jurisdiction}/${tier}] Template file not found: ${config.templatePath}`);
      continue;
    }

    const result = validateVariantConfig(config, templateContent);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate all jurisdictions
 */
export function validateAllJurisdictions(
  getTemplateContent: (templatePath: string) => string | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];

  for (const jurisdiction of jurisdictions) {
    const result = validateJurisdiction(jurisdiction, getTemplateContent);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get the canonical variant config for a jurisdiction and tier
 */
export function getVariantConfig(
  jurisdiction: TenancyJurisdiction,
  tier: TenancyTier
): TenancyVariantConfig | null {
  const variants = TENANCY_VARIANT_CONFIGS[jurisdiction];
  if (!variants) return null;
  return variants[tier] || null;
}

/**
 * Get all supported jurisdictions
 */
export function getSupportedJurisdictions(): TenancyJurisdiction[] {
  return Object.keys(TENANCY_VARIANT_CONFIGS) as TenancyJurisdiction[];
}

/**
 * Get all variants for a jurisdiction
 */
export function getJurisdictionVariants(jurisdiction: TenancyJurisdiction): JurisdictionVariants | null {
  return TENANCY_VARIANT_CONFIGS[jurisdiction] || null;
}

// ============================================================================
// FILE SYSTEM HELPERS (for runtime validation)
// ============================================================================

/**
 * Create a template content getter that reads from the file system
 */
export function createFileSystemTemplateGetter(baseDir: string): (templatePath: string) => string | null {
  return (templatePath: string): string | null => {
    try {
      const fullPath = path.join(baseDir, templatePath);
      return fs.readFileSync(fullPath, 'utf-8');
    } catch (err) {
      return null;
    }
  };
}

/**
 * Validate all variants using the file system
 */
export function validateFromFileSystem(configDir: string): ValidationResult {
  const getContent = createFileSystemTemplateGetter(configDir);
  return validateAllJurisdictions(getContent);
}
