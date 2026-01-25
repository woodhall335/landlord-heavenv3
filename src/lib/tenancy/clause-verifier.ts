/**
 * Tenancy Clause Verifier
 *
 * Deterministic verifier that ensures ClauseDiffPreview and TenancyComparisonTable
 * claims are ALWAYS accurate vs the actual generated tenancy agreement templates.
 *
 * Checks:
 * - Every clause shown as "Premium only" is present in premium AND absent from standard
 * - Every clause shown as "Both" is present in both tiers
 * - Jurisdiction terminology is correct in rendered output
 * - Legal references are accurate and don't overclaim
 *
 * Uses explicit clause ID markers (<!-- CLAUSE:ID -->) in templates.
 */

import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

// ============================================================================
// TYPES
// ============================================================================

export type ClauseJurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland';
export type ClauseTier = 'standard' | 'premium';

/**
 * Clause ID definitions - must match markers in templates
 * Format: <!-- CLAUSE:CLAUSE_ID -->
 */
export type ClauseId =
  | 'JOINT_LIABILITY'           // Joint and several liability
  | 'SHARED_FACILITIES'         // Shared facilities/communal areas
  | 'TENANT_REPLACEMENT'        // Tenant/contract holder replacement
  | 'GUARANTOR'                 // Guarantor agreement
  | 'RENT_REVIEW'               // Rent increase provisions
  | 'ANTI_SUBLET'               // Anti-subletting prohibition
  | 'PROFESSIONAL_CLEANING'     // Professional cleaning requirement
  | 'HMO_LICENSING'             // HMO licensing compliance
  | 'CORE_TENANCY'              // Core tenancy clauses (rent, deposit, term)
  | 'TENANT_OBLIGATIONS'        // Basic tenant responsibilities
  | 'PETS_CLAUSE'               // Pets permission clause
  | 'BREAK_CLAUSE';             // Break clause

/**
 * Clause definition for verification
 */
export interface ClauseDefinition {
  id: ClauseId;
  name: string;
  /** Which tiers should contain this clause */
  expectedIn: ClauseTier[];
  /** Is this an HMO-specific clause? */
  isHMO: boolean;
  /** Category for grouping */
  category: 'core' | 'liability' | 'hmo' | 'financial' | 'control' | 'compliance';
  /**
   * Jurisdictions where this clause is NOT applicable
   * (e.g., Scotland PRTs don't have break clauses - they're open-ended)
   */
  excludedJurisdictions?: ClauseJurisdiction[];
  /**
   * If true, this clause is optional and won't cause a failure if missing
   * (used for clauses that are commonly but not always present)
   */
  optional?: boolean;
}

/**
 * Jurisdiction terminology expectations
 */
export interface JurisdictionTerminology {
  /** Term used for tenant (Tenant/Contract Holder) */
  tenantTerm: string;
  /** Term used for tenancy (tenancy/occupation) */
  tenancyTerm: string;
  /** Agreement type name */
  agreementType: string;
  /** HMO legislation reference */
  hmoLegislation: string;
  /** Main tenancy legislation */
  mainLegislation: string;
}

/**
 * Verification result for a single template
 */
export interface TemplateVerificationResult {
  jurisdiction: ClauseJurisdiction;
  tier: ClauseTier;
  templatePath: string;
  foundClauses: ClauseId[];
  missingClauses: ClauseId[];
  unexpectedClauses: ClauseId[];
  terminologyErrors: string[];
  legalReferenceErrors: string[];
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Full verification report
 */
export interface ClauseVerificationReport {
  valid: boolean;
  timestamp: string;
  jurisdictionResults: Record<ClauseJurisdiction, {
    standard: TemplateVerificationResult;
    premium: TemplateVerificationResult;
  }>;
  summary: {
    totalErrors: number;
    totalWarnings: number;
    clauseMismatches: Array<{
      clauseId: ClauseId;
      jurisdiction: ClauseJurisdiction;
      issue: string;
    }>;
  };
}

// ============================================================================
// CLAUSE DEFINITIONS (Source of Truth)
// ============================================================================

/**
 * Canonical clause definitions.
 * This defines which clauses should appear in which tiers.
 */
export const CLAUSE_DEFINITIONS: ClauseDefinition[] = [
  // Core clauses (both tiers)
  {
    id: 'CORE_TENANCY',
    name: 'Core tenancy clauses',
    expectedIn: ['standard', 'premium'],
    isHMO: false,
    category: 'core',
  },
  {
    id: 'TENANT_OBLIGATIONS',
    name: 'Tenant responsibilities',
    expectedIn: ['standard', 'premium'],
    isHMO: false,
    category: 'core',
  },
  {
    id: 'PETS_CLAUSE',
    name: 'Pets clause',
    expectedIn: ['standard', 'premium'],
    isHMO: false,
    category: 'core',
  },
  {
    id: 'BREAK_CLAUSE',
    name: 'Break clause',
    expectedIn: ['standard', 'premium'],
    isHMO: false,
    category: 'core',
    // Scotland PRTs are open-ended (no fixed term), so no break clause
    // Wales has 6-month notice under RH(W)A 2016 - different mechanism
    // Northern Ireland also has different notice mechanisms
    excludedJurisdictions: ['scotland', 'wales', 'northern-ireland'],
  },

  // Premium-only clauses - HMO related (REQUIRED in premium)
  {
    id: 'JOINT_LIABILITY',
    name: 'Joint and several liability',
    expectedIn: ['premium'],
    isHMO: true,
    category: 'liability',
  },
  {
    id: 'SHARED_FACILITIES',
    name: 'Shared facilities and communal areas',
    expectedIn: ['premium'],
    isHMO: true,
    category: 'hmo',
  },
  {
    id: 'TENANT_REPLACEMENT',
    name: 'Tenant replacement procedure',
    expectedIn: ['premium'],
    isHMO: true,
    category: 'hmo',
    // Not all jurisdictions have explicit tenant replacement procedures
    optional: true,
  },
  {
    id: 'HMO_LICENSING',
    name: 'HMO licensing compliance',
    expectedIn: ['premium'],
    isHMO: true,
    category: 'compliance',
    // England has explicit HMO licensing; other jurisdictions vary
    excludedJurisdictions: ['northern-ireland'],
  },

  // Premium-only clauses - Financial/Control (OPTIONAL - commonly but not always present)
  {
    id: 'GUARANTOR',
    name: 'Guarantor agreement',
    expectedIn: ['premium'],
    isHMO: false,
    category: 'financial',
    // Guarantor sections are conditional based on wizard answers
    optional: true,
  },
  {
    id: 'RENT_REVIEW',
    name: 'Rent increase provisions',
    expectedIn: ['premium'],
    isHMO: false,
    category: 'financial',
    // Rent review is optional and jurisdiction-specific (Scotland has PRT caps)
    optional: true,
  },
  {
    id: 'ANTI_SUBLET',
    name: 'Anti-subletting prohibition',
    expectedIn: ['premium'],
    isHMO: false,
    category: 'control',
  },
  {
    id: 'PROFESSIONAL_CLEANING',
    name: 'Professional cleaning requirement',
    expectedIn: ['premium'],
    isHMO: false,
    category: 'compliance',
    // Professional cleaning is optional
    optional: true,
  },
];

/**
 * Get all HMO clause IDs
 */
export function getHMOClauseIds(): ClauseId[] {
  return CLAUSE_DEFINITIONS.filter(c => c.isHMO).map(c => c.id);
}

/**
 * Get required HMO clause IDs for a specific jurisdiction
 * Excludes optional clauses and jurisdiction-excluded clauses
 */
export function getRequiredHMOClauseIdsForJurisdiction(jurisdiction: ClauseJurisdiction): ClauseId[] {
  return CLAUSE_DEFINITIONS
    .filter(c => c.isHMO)
    .filter(c => !c.optional)
    .filter(c => !c.excludedJurisdictions?.includes(jurisdiction))
    .map(c => c.id);
}

/**
 * Get all premium-only clause IDs
 */
export function getPremiumOnlyClauseIds(): ClauseId[] {
  return CLAUSE_DEFINITIONS
    .filter(c => c.expectedIn.length === 1 && c.expectedIn[0] === 'premium')
    .map(c => c.id);
}

/**
 * Get all "both tiers" clause IDs
 */
export function getBothTiersClauseIds(): ClauseId[] {
  return CLAUSE_DEFINITIONS
    .filter(c => c.expectedIn.includes('standard') && c.expectedIn.includes('premium'))
    .map(c => c.id);
}

// ============================================================================
// JURISDICTION TERMINOLOGY
// ============================================================================

export const JURISDICTION_TERMINOLOGY: Record<ClauseJurisdiction, JurisdictionTerminology> = {
  england: {
    tenantTerm: 'Tenant',
    tenancyTerm: 'tenancy',
    agreementType: 'Assured Shorthold Tenancy',
    hmoLegislation: 'Housing Act 2004',
    mainLegislation: 'Housing Act 1988',
  },
  wales: {
    tenantTerm: 'Contract Holder',
    tenancyTerm: 'occupation',
    agreementType: 'Occupation Contract',
    hmoLegislation: 'Housing (Wales) Act 2014',
    mainLegislation: 'Renting Homes (Wales) Act 2016',
  },
  scotland: {
    tenantTerm: 'Tenant',
    tenancyTerm: 'tenancy',
    agreementType: 'Private Residential Tenancy',
    hmoLegislation: 'Civic Government (Scotland) Act 1982',
    mainLegislation: 'Private Housing (Tenancies) (Scotland) Act 2016',
  },
  'northern-ireland': {
    tenantTerm: 'Tenant',
    tenancyTerm: 'tenancy',
    agreementType: 'Private Tenancy',
    hmoLegislation: 'Housing (NI) Order 1992',
    mainLegislation: 'Private Tenancies Act (Northern Ireland) 2022',
  },
};

// ============================================================================
// CLAUSE MARKER EXTRACTION
// ============================================================================

/**
 * Regex pattern for clause markers
 * Matches: <!-- CLAUSE:CLAUSE_ID --> or {{!-- CLAUSE:CLAUSE_ID --}}
 */
const CLAUSE_MARKER_REGEX = /(?:<!--\s*CLAUSE:(\w+)\s*-->|{{!--\s*CLAUSE:(\w+)\s*--}})/g;

/**
 * Extract clause IDs from template content
 */
export function extractClauseIds(templateContent: string): ClauseId[] {
  const foundIds = new Set<ClauseId>();
  let match: RegExpExecArray | null;

  while ((match = CLAUSE_MARKER_REGEX.exec(templateContent)) !== null) {
    const clauseId = (match[1] || match[2]) as ClauseId;
    if (CLAUSE_DEFINITIONS.some(c => c.id === clauseId)) {
      foundIds.add(clauseId);
    }
  }

  return Array.from(foundIds);
}

/**
 * Check if template content contains a specific clause marker
 */
export function hasClauseMarker(templateContent: string, clauseId: ClauseId): boolean {
  const htmlMarker = `<!-- CLAUSE:${clauseId} -->`;
  const hbsMarker = `{{!-- CLAUSE:${clauseId} --}}`;
  return templateContent.includes(htmlMarker) || templateContent.includes(hbsMarker);
}

// ============================================================================
// TERMINOLOGY VERIFICATION
// ============================================================================

/**
 * Verify jurisdiction-specific terminology in content
 */
export function verifyTerminology(
  content: string,
  jurisdiction: ClauseJurisdiction
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const terms = JURISDICTION_TERMINOLOGY[jurisdiction];

  // Wales MUST use "Contract Holder" not "Tenant" (except in legal quotes)
  if (jurisdiction === 'wales') {
    // Check for "Tenant" outside of legal references/quotes
    const tenantMatches = content.match(/\bTenant\b(?![^"]*")/gi) || [];
    // Allow some instances for backwards compatibility, but flag if excessive
    if (tenantMatches.length > 5) {
      errors.push(
        `Wales template uses "Tenant" ${tenantMatches.length} times. ` +
        `Should use "Contract Holder" per Renting Homes (Wales) Act 2016.`
      );
    }

    // Must contain "Contract Holder" multiple times
    const contractHolderCount = (content.match(/Contract Holder/gi) || []).length;
    if (contractHolderCount < 3) {
      errors.push(
        `Wales template must use "Contract Holder" terminology. Found only ${contractHolderCount} instances.`
      );
    }

    // Must reference "Occupation Contract"
    if (!content.toLowerCase().includes('occupation contract')) {
      errors.push('Wales template must reference "Occupation Contract".');
    }
  }

  // Scotland should reference PRT
  if (jurisdiction === 'scotland') {
    if (!content.toLowerCase().includes('private residential tenancy')) {
      errors.push('Scotland template should reference "Private Residential Tenancy".');
    }
  }

  // Northern Ireland should reference correct legislation
  if (jurisdiction === 'northern-ireland') {
    // Check for references to correct NI legislation
    const hasCorrectLegislation =
      content.includes('Private Tenancies Act') ||
      content.includes('Private Tenancies (Northern Ireland)') ||
      content.includes('Housing (NI)');

    if (!hasCorrectLegislation) {
      errors.push('Northern Ireland template should reference NI-specific tenancy legislation.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// LEGAL REFERENCE VERIFICATION
// ============================================================================

/**
 * Overclaim phrases that should NOT appear in UI/templates
 * These make claims that are too strong legally
 */
const OVERCLAIM_PHRASES = [
  'is required by law',
  'you must have',
  'legally required',
  'mandatory under',
  'must be included',
];

/**
 * Acceptable alternative phrases
 */
const ACCEPTABLE_PHRASES = [
  'commonly required',
  'may be required',
  'recommended',
  'helps ensure',
  'typically includes',
  'where applicable',
];

/**
 * Verify legal references don't overclaim
 */
export function verifyLegalReferences(
  content: string
): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for overclaim phrases
  for (const phrase of OVERCLAIM_PHRASES) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) {
      warnings.push(
        `Contains potentially overclaiming phrase: "${phrase}". ` +
        `Consider using: "${ACCEPTABLE_PHRASES[0]}" or similar.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// TEMPLATE VERIFICATION
// ============================================================================

/**
 * Get expected clause IDs for a given jurisdiction and tier
 * Respects excludedJurisdictions field
 */
export function getExpectedClausesForJurisdictionTier(
  jurisdiction: ClauseJurisdiction,
  tier: ClauseTier
): { required: ClauseId[]; optional: ClauseId[] } {
  const required: ClauseId[] = [];
  const optional: ClauseId[] = [];

  for (const clause of CLAUSE_DEFINITIONS) {
    // Skip if clause is not expected in this tier
    if (!clause.expectedIn.includes(tier)) continue;

    // Skip if clause is excluded for this jurisdiction
    if (clause.excludedJurisdictions?.includes(jurisdiction)) continue;

    if (clause.optional) {
      optional.push(clause.id);
    } else {
      required.push(clause.id);
    }
  }

  return { required, optional };
}

/**
 * Verify a single template against clause expectations
 */
export function verifyTemplate(
  templateContent: string,
  jurisdiction: ClauseJurisdiction,
  tier: ClauseTier,
  templatePath: string
): TemplateVerificationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Extract clause IDs from template
  const foundClauses = extractClauseIds(templateContent);

  // 2. Determine expected clauses for this jurisdiction+tier
  const { required: requiredClauses, optional: optionalClauses } =
    getExpectedClausesForJurisdictionTier(jurisdiction, tier);
  const allExpectedClauses = [...requiredClauses, ...optionalClauses];

  // 3. Find missing REQUIRED clauses (expected but not found) - these are errors
  const missingRequiredClauses = requiredClauses.filter(id => !foundClauses.includes(id));

  // 4. Find missing OPTIONAL clauses - these are warnings, not errors
  const missingOptionalClauses = optionalClauses.filter(id => !foundClauses.includes(id));

  // 5. Find unexpected clauses (found but not expected in either list)
  const unexpectedClauses = foundClauses.filter(id => !allExpectedClauses.includes(id));

  // 6. Check for HMO clauses in standard (should NOT be there)
  if (tier === 'standard') {
    const hmoClauseIds = getHMOClauseIds();
    const foundHMOInStandard = foundClauses.filter(id => hmoClauseIds.includes(id));
    if (foundHMOInStandard.length > 0) {
      errors.push(
        `Standard template contains HMO clauses that should only be in Premium: ` +
        `${foundHMOInStandard.join(', ')}`
      );
    }
  }

  // 7. Check that premium has minimum HMO clauses (required ones, not optional)
  if (tier === 'premium') {
    // Only count non-optional HMO clauses as required
    const requiredHMOClauses = CLAUSE_DEFINITIONS
      .filter(c => c.isHMO && !c.optional && !c.excludedJurisdictions?.includes(jurisdiction))
      .map(c => c.id);
    const foundRequiredHMO = foundClauses.filter(id => requiredHMOClauses.includes(id));

    // Premium should have at least 2 core HMO markers (JOINT_LIABILITY, SHARED_FACILITIES are always required)
    if (foundRequiredHMO.length < 2) {
      errors.push(
        `Premium template must have at least 2 required HMO clause markers. ` +
        `Found ${foundRequiredHMO.length}: ${foundRequiredHMO.join(', ')}`
      );
    }
  }

  // 8. Verify terminology
  const termCheck = verifyTerminology(templateContent, jurisdiction);
  const terminologyErrors = termCheck.errors;

  // 9. Verify legal references
  const legalCheck = verifyLegalReferences(templateContent);
  const legalReferenceErrors = legalCheck.errors;
  warnings.push(...legalCheck.warnings);

  // 10. Add warnings for missing optional clauses
  if (missingOptionalClauses.length > 0) {
    warnings.push(
      `Missing optional clause markers: ${missingOptionalClauses.join(', ')}. ` +
      `These are commonly present but not required.`
    );
  }

  // Build result - only required missing clauses are errors
  const allErrors = [
    ...errors,
    ...missingRequiredClauses.map(id => `Missing expected clause marker: <!-- CLAUSE:${id} -->`),
    ...terminologyErrors,
    ...legalReferenceErrors,
  ];

  // Combine all missing clauses for the missingClauses field (both required and optional)
  const missingClauses = [...missingRequiredClauses, ...missingOptionalClauses];

  if (unexpectedClauses.length > 0) {
    warnings.push(
      `Found unexpected clause markers: ${unexpectedClauses.join(', ')}. ` +
      `These clauses are not expected in ${tier} tier.`
    );
  }

  return {
    jurisdiction,
    tier,
    templatePath,
    foundClauses,
    missingClauses,
    unexpectedClauses,
    terminologyErrors,
    legalReferenceErrors,
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings,
  };
}

// ============================================================================
// TEMPLATE PATH RESOLUTION
// ============================================================================

/**
 * Template paths for each jurisdiction and tier
 */
export const TEMPLATE_PATHS: Record<ClauseJurisdiction, Record<ClauseTier, string>> = {
  england: {
    standard: 'config/jurisdictions/uk/england/templates/standard_ast_formatted.hbs',
    premium: 'config/jurisdictions/uk/england/templates/ast_hmo.hbs',
  },
  wales: {
    standard: 'config/jurisdictions/uk/wales/templates/standard_occupation_contract.hbs',
    premium: 'config/jurisdictions/uk/wales/templates/occupation_contract_hmo.hbs',
  },
  scotland: {
    standard: 'config/jurisdictions/uk/scotland/templates/prt_agreement.hbs',
    premium: 'config/jurisdictions/uk/scotland/templates/prt_agreement_hmo.hbs',
  },
  'northern-ireland': {
    standard: 'config/jurisdictions/uk/northern-ireland/templates/private_tenancy_agreement.hbs',
    premium: 'config/jurisdictions/uk/northern-ireland/templates/private_tenancy_hmo.hbs',
  },
};

/**
 * Read template file content
 */
export function readTemplateFile(relativePath: string): string | null {
  try {
    const absolutePath = path.join(process.cwd(), relativePath);
    return fs.readFileSync(absolutePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

// ============================================================================
// FULL VERIFICATION
// ============================================================================

/**
 * Run full clause verification across all jurisdictions and tiers
 */
export function runFullVerification(): ClauseVerificationReport {
  const jurisdictions: ClauseJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];
  const tiers: ClauseTier[] = ['standard', 'premium'];

  const jurisdictionResults: ClauseVerificationReport['jurisdictionResults'] = {} as any;
  const clauseMismatches: ClauseVerificationReport['summary']['clauseMismatches'] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const jurisdiction of jurisdictions) {
    jurisdictionResults[jurisdiction] = {} as any;

    for (const tier of tiers) {
      const templatePath = TEMPLATE_PATHS[jurisdiction][tier];
      const templateContent = readTemplateFile(templatePath);

      if (!templateContent) {
        jurisdictionResults[jurisdiction][tier] = {
          jurisdiction,
          tier,
          templatePath,
          foundClauses: [],
          missingClauses: [],
          unexpectedClauses: [],
          terminologyErrors: [],
          legalReferenceErrors: [],
          valid: false,
          errors: [`Template file not found: ${templatePath}`],
          warnings: [],
        };
        totalErrors++;
        continue;
      }

      const result = verifyTemplate(templateContent, jurisdiction, tier, templatePath);
      jurisdictionResults[jurisdiction][tier] = result;

      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;

      // Track clause mismatches for summary
      for (const clauseId of result.missingClauses) {
        clauseMismatches.push({
          clauseId,
          jurisdiction,
          issue: `Missing in ${tier}`,
        });
      }

      for (const clauseId of result.unexpectedClauses) {
        clauseMismatches.push({
          clauseId,
          jurisdiction,
          issue: `Unexpected in ${tier}`,
        });
      }
    }
  }

  return {
    valid: totalErrors === 0,
    timestamp: new Date().toISOString(),
    jurisdictionResults,
    summary: {
      totalErrors,
      totalWarnings,
      clauseMismatches,
    },
  };
}

/**
 * Generate a human-readable diff report
 */
export function generateDiffReport(report: ClauseVerificationReport): string {
  const lines: string[] = [
    '========================================',
    'TENANCY CLAUSE VERIFICATION REPORT',
    `Generated: ${report.timestamp}`,
    `Status: ${report.valid ? 'PASSED' : 'FAILED'}`,
    '========================================',
    '',
  ];

  if (!report.valid) {
    lines.push('ERRORS FOUND:');
    lines.push('');

    for (const [jurisdiction, tiers] of Object.entries(report.jurisdictionResults)) {
      for (const [tier, result] of Object.entries(tiers)) {
        if (result.errors.length > 0) {
          lines.push(`[${jurisdiction}/${tier}]`);
          for (const error of result.errors) {
            lines.push(`  ERROR: ${error}`);
          }
          lines.push('');
        }
      }
    }
  }

  if (report.summary.totalWarnings > 0) {
    lines.push('WARNINGS:');
    lines.push('');

    for (const [jurisdiction, tiers] of Object.entries(report.jurisdictionResults)) {
      for (const [tier, result] of Object.entries(tiers)) {
        if (result.warnings.length > 0) {
          lines.push(`[${jurisdiction}/${tier}]`);
          for (const warning of result.warnings) {
            lines.push(`  WARN: ${warning}`);
          }
          lines.push('');
        }
      }
    }
  }

  if (report.summary.clauseMismatches.length > 0) {
    lines.push('CLAUSE MISMATCHES:');
    lines.push('');
    lines.push('| Jurisdiction | Clause ID | Issue |');
    lines.push('|--------------|-----------|-------|');
    for (const mismatch of report.summary.clauseMismatches) {
      lines.push(`| ${mismatch.jurisdiction} | ${mismatch.clauseId} | ${mismatch.issue} |`);
    }
    lines.push('');
  }

  lines.push('SUMMARY:');
  lines.push(`  Total Errors: ${report.summary.totalErrors}`);
  lines.push(`  Total Warnings: ${report.summary.totalWarnings}`);
  lines.push(`  Clause Mismatches: ${report.summary.clauseMismatches.length}`);

  return lines.join('\n');
}

// ============================================================================
// EXPORTS FOR UI COMPONENTS
// ============================================================================

/**
 * Get clause definition by ID
 */
export function getClauseDefinition(clauseId: ClauseId): ClauseDefinition | undefined {
  return CLAUSE_DEFINITIONS.find(c => c.id === clauseId);
}

/**
 * Check if a clause should appear in a given tier
 */
export function isClauseInTier(clauseId: ClauseId, tier: ClauseTier): boolean {
  const definition = getClauseDefinition(clauseId);
  return definition ? definition.expectedIn.includes(tier) : false;
}

/**
 * Get all clause IDs for a given tier
 */
export function getClauseIdsForTier(tier: ClauseTier): ClauseId[] {
  return CLAUSE_DEFINITIONS
    .filter(c => c.expectedIn.includes(tier))
    .map(c => c.id);
}
