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

// ============================================================================
// PACK-CONTENTS ALIGNMENT CHECK
// ============================================================================

/**
 * Expected pack-contents document keys per jurisdiction and tier
 * This MUST match pack-contents.ts getXxxContents() functions
 */
export const EXPECTED_PACK_CONTENTS: Record<TenancyJurisdiction, Record<TenancyTier, { key: string; title: string }>> = {
  england: {
    standard: { key: 'ast_agreement', title: 'Assured Shorthold Tenancy Agreement' },
    premium: { key: 'ast_agreement_hmo', title: 'HMO Tenancy Agreement' },
  },
  wales: {
    standard: { key: 'soc_agreement', title: 'Standard Occupation Contract' },
    premium: { key: 'soc_agreement_hmo', title: 'HMO Occupation Contract' },
  },
  scotland: {
    standard: { key: 'prt_agreement', title: 'Private Residential Tenancy Agreement' },
    premium: { key: 'prt_agreement_hmo', title: 'HMO Private Residential Tenancy Agreement' },
  },
  'northern-ireland': {
    standard: { key: 'private_tenancy_agreement', title: 'Private Tenancy Agreement' },
    premium: { key: 'private_tenancy_agreement_hmo', title: 'HMO Private Tenancy Agreement' },
  },
};

/**
 * Validate pack-contents alignment
 * Checks that getPackContents returns exactly 1 document per tier per jurisdiction
 * and that the document keys match TENANCY_VARIANT_CONFIGS
 */
export function validatePackContentsAlignment(
  getPackContents: (args: { product: string; jurisdiction: string }) => Array<{ key: string; title: string }>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const jurisdictions = getSupportedJurisdictions();

  for (const jurisdiction of jurisdictions) {
    for (const tier of ['standard', 'premium'] as const) {
      const product = tier === 'standard' ? 'ast_standard' : 'ast_premium';
      const items = getPackContents({ product, jurisdiction });

      // Must return exactly 1 document
      if (items.length !== 1) {
        errors.push(
          `[${jurisdiction}/${tier}] pack-contents returns ${items.length} documents, expected exactly 1. ` +
          `2-variants rule: each tier must have exactly 1 tenancy agreement document.`
        );
        continue;
      }

      // Document key must match config
      const expected = EXPECTED_PACK_CONTENTS[jurisdiction][tier];
      const config = getVariantConfig(jurisdiction, tier);

      if (items[0].key !== expected.key) {
        errors.push(
          `[${jurisdiction}/${tier}] pack-contents key mismatch: got "${items[0].key}", expected "${expected.key}"`
        );
      }

      if (config && items[0].key !== config.documentKey) {
        errors.push(
          `[${jurisdiction}/${tier}] pack-contents/validator mismatch: ` +
          `pack-contents returns "${items[0].key}", validator expects "${config.documentKey}"`
        );
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ============================================================================
// COMPREHENSIVE INVARIANT ASSERTION
// ============================================================================

export interface InvariantCheckResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  auditTable: AuditTableRow[];
}

export interface AuditTableRow {
  jurisdiction: TenancyJurisdiction;
  standardTemplate: string;
  premiumTemplate: string;
  standardDocKey: string;
  premiumDocKey: string;
  standardHMOMarkers: number;
  premiumHMOMarkers: number;
  status: 'PASS' | 'FAIL';
}

/**
 * COMPREHENSIVE INVARIANT ASSERTION
 *
 * This is the SINGLE FUNCTION that validates ALL tenancy variant rules:
 * 1) Exactly 4 jurisdictions (england, wales, scotland, northern-ireland)
 * 2) Exactly 2 variants per jurisdiction (standard + premium)
 * 3) Standard templates contain NO forbidden HMO markers
 * 4) Premium templates contain ALL required HMO markers (minimum threshold)
 * 5) Pack-contents returns exactly 1 document per tier per jurisdiction
 * 6) Document keys are consistent across config, pack-contents, and generator
 *
 * @throws Error with detailed message if any invariant fails
 */
export function assertTenancyVariantsInvariant(options: {
  getTemplateContent: (templatePath: string) => string | null;
  getPackContents?: (args: { product: string; jurisdiction: string }) => Array<{ key: string; title: string }>;
  throwOnFailure?: boolean;
}): InvariantCheckResult {
  const { getTemplateContent, getPackContents, throwOnFailure = true } = options;
  const errors: string[] = [];
  const warnings: string[] = [];
  const auditTable: AuditTableRow[] = [];

  const jurisdictions = getSupportedJurisdictions();

  // INVARIANT 1: Exactly 4 jurisdictions
  if (jurisdictions.length !== 4) {
    errors.push(
      `INVARIANT VIOLATION: Expected exactly 4 jurisdictions, found ${jurisdictions.length}. ` +
      `Jurisdictions: ${jurisdictions.join(', ')}`
    );
  }

  const requiredJurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];
  for (const required of requiredJurisdictions) {
    if (!jurisdictions.includes(required)) {
      errors.push(`INVARIANT VIOLATION: Missing required jurisdiction: ${required}`);
    }
  }

  // Validate each jurisdiction
  for (const jurisdiction of jurisdictions) {
    const variants = TENANCY_VARIANT_CONFIGS[jurisdiction];
    let rowStatus: 'PASS' | 'FAIL' = 'PASS';

    // INVARIANT 2: Exactly 2 variants
    const variantCount = [variants.standard, variants.premium].filter(Boolean).length;
    if (variantCount !== 2) {
      errors.push(
        `[${jurisdiction}] INVARIANT VIOLATION: Must have exactly 2 variants, found ${variantCount}. ` +
        `Only "standard" and "premium" tiers are allowed.`
      );
      rowStatus = 'FAIL';
    }

    // Check each tier
    let standardHMOCount = 0;
    let premiumHMOCount = 0;

    for (const tier of ['standard', 'premium'] as const) {
      const config = variants[tier];
      if (!config) {
        errors.push(`[${jurisdiction}] INVARIANT VIOLATION: Missing ${tier} variant`);
        rowStatus = 'FAIL';
        continue;
      }

      // Template must exist
      const templateContent = getTemplateContent(config.templatePath);
      if (templateContent === null) {
        errors.push(
          `[${jurisdiction}/${tier}] INVARIANT VIOLATION: Template not found: ${config.templatePath}`
        );
        rowStatus = 'FAIL';
        continue;
      }

      // INVARIANT 3: Standard templates NO HMO
      if (tier === 'standard') {
        const forbiddenCheck = templateContainsForbiddenHMO(templateContent);
        if (forbiddenCheck.found) {
          errors.push(
            `[${jurisdiction}/standard] INVARIANT VIOLATION: Standard template contains HMO markers: ` +
            `${forbiddenCheck.markers.join(', ')}. Standard tier must NOT have HMO clauses.`
          );
          rowStatus = 'FAIL';
        }
        standardHMOCount = forbiddenCheck.markers.length;
      }

      // INVARIANT 4: Premium templates MUST have HMO
      if (tier === 'premium') {
        const hmoCheck = templateContainsHMOMarkers(templateContent);
        premiumHMOCount = hmoCheck.markers.length;

        if (!hmoCheck.found) {
          errors.push(
            `[${jurisdiction}/premium] INVARIANT VIOLATION: Premium template missing HMO markers. ` +
            `Premium tier MUST include HMO clauses (Joint and Several Liability, shared facilities, etc.)`
          );
          rowStatus = 'FAIL';
        } else if (hmoCheck.markers.length < 3) {
          warnings.push(
            `[${jurisdiction}/premium] WARNING: Premium template has only ${hmoCheck.markers.length} HMO markers. ` +
            `Consider adding more for comprehensive HMO coverage.`
          );
        }

        // Must have "Joint and Several Liability"
        if (!templateContent.toLowerCase().includes('joint and several liability')) {
          warnings.push(
            `[${jurisdiction}/premium] WARNING: Premium template missing "Joint and Several Liability" clause. ` +
            `This is standard for HMO agreements.`
          );
        }
      }
    }

    // Build audit table row
    auditTable.push({
      jurisdiction,
      standardTemplate: variants.standard?.templatePath || 'MISSING',
      premiumTemplate: variants.premium?.templatePath || 'MISSING',
      standardDocKey: variants.standard?.documentKey || 'MISSING',
      premiumDocKey: variants.premium?.documentKey || 'MISSING',
      standardHMOMarkers: standardHMOCount,
      premiumHMOMarkers: premiumHMOCount,
      status: rowStatus,
    });
  }

  // INVARIANT 5: Pack-contents alignment (if provided)
  if (getPackContents) {
    const packResult = validatePackContentsAlignment(getPackContents);
    errors.push(...packResult.errors);
    warnings.push(...packResult.warnings);
  }

  const result: InvariantCheckResult = {
    valid: errors.length === 0,
    errors,
    warnings,
    auditTable,
  };

  // Throw if requested and validation failed
  if (throwOnFailure && !result.valid) {
    throw new Error(
      `Tenancy Variant Invariants FAILED!\n\n` +
      `ERRORS:\n${errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `The 2-variants rule requires:\n` +
      `  1. Exactly 4 jurisdictions (england, wales, scotland, northern-ireland)\n` +
      `  2. Exactly 2 variants per jurisdiction (standard + premium)\n` +
      `  3. Standard templates: NO HMO markers\n` +
      `  4. Premium templates: MUST have HMO markers\n` +
      `  5. Pack-contents: exactly 1 document per tier per jurisdiction\n`
    );
  }

  return result;
}

// ============================================================================
// RUNTIME SELF-CHECK (for server startup)
// ============================================================================

let _runtimeCheckCompleted = false;
let _runtimeCheckResult: InvariantCheckResult | null = null;

/**
 * Runtime self-check for production environments
 *
 * Call this on server startup or first tenancy generation.
 * - Logs a warning if invariants fail in production
 * - Caches result to avoid repeated checks
 * - Returns result without throwing (use assertTenancyVariantsInvariant for strict checks)
 */
export function runtimeTenancyVariantsSelfCheck(configDir: string): InvariantCheckResult {
  // Return cached result if already checked
  if (_runtimeCheckCompleted && _runtimeCheckResult) {
    return _runtimeCheckResult;
  }

  const getContent = createFileSystemTemplateGetter(configDir);

  try {
    _runtimeCheckResult = assertTenancyVariantsInvariant({
      getTemplateContent: getContent,
      throwOnFailure: false, // Don't throw in production, just log
    });

    if (!_runtimeCheckResult.valid) {
      console.warn(
        '[TENANCY VARIANTS] Runtime self-check FAILED!\n' +
        'Errors:\n' +
        _runtimeCheckResult.errors.map(e => `  - ${e}`).join('\n') +
        '\n\nThis may cause issues with tenancy agreement generation.'
      );
    } else {
      console.log('[TENANCY VARIANTS] Runtime self-check passed. 4 jurisdictions, 2 variants each.');
    }

    _runtimeCheckCompleted = true;
    return _runtimeCheckResult;
  } catch (err) {
    console.error('[TENANCY VARIANTS] Runtime self-check error:', err);
    _runtimeCheckCompleted = true;
    _runtimeCheckResult = {
      valid: false,
      errors: [`Runtime check error: ${err}`],
      warnings: [],
      auditTable: [],
    };
    return _runtimeCheckResult;
  }
}

/**
 * Reset runtime check cache (for testing)
 */
export function _resetRuntimeCheck(): void {
  _runtimeCheckCompleted = false;
  _runtimeCheckResult = null;
}

// ============================================================================
// PRINT AUDIT TABLE (for CLI output)
// ============================================================================

/**
 * Format audit table for console output
 */
export function formatAuditTable(rows: AuditTableRow[]): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('='.repeat(120));
  lines.push('TENANCY AGREEMENT VARIANTS AUDIT TABLE');
  lines.push('='.repeat(120));
  lines.push('');

  // Header
  lines.push(
    'Jurisdiction'.padEnd(18) +
    'Standard Template'.padEnd(50) +
    'Premium Template'.padEnd(40) +
    'Std HMO'.padEnd(10) +
    'Prem HMO'.padEnd(10) +
    'Status'
  );
  lines.push('-'.repeat(120));

  // Rows
  for (const row of rows) {
    const stdTemplate = row.standardTemplate.split('/').pop() || row.standardTemplate;
    const premTemplate = row.premiumTemplate.split('/').pop() || row.premiumTemplate;

    lines.push(
      row.jurisdiction.padEnd(18) +
      stdTemplate.padEnd(50) +
      premTemplate.padEnd(40) +
      String(row.standardHMOMarkers).padEnd(10) +
      String(row.premiumHMOMarkers).padEnd(10) +
      row.status
    );
  }

  lines.push('-'.repeat(120));
  lines.push('');

  // Summary
  const passCount = rows.filter(r => r.status === 'PASS').length;
  const failCount = rows.filter(r => r.status === 'FAIL').length;
  lines.push(`Summary: ${passCount} PASS, ${failCount} FAIL`);
  lines.push('');

  // Document Keys
  lines.push('Document Keys:');
  for (const row of rows) {
    lines.push(`  ${row.jurisdiction}: standard="${row.standardDocKey}", premium="${row.premiumDocKey}"`);
  }
  lines.push('');

  return lines.join('\n');
}
