/**
 * Jurisdiction Configuration Validator
 *
 * Ensures required directories and files exist for each jurisdiction/product combination
 * before attempting to generate documents.
 */

import fs from 'fs';
import path from 'path';

import { normalizeJurisdiction, type CanonicalJurisdiction } from '../types/jurisdiction';

export interface JurisdictionValidationError {
  jurisdiction: string;
  product: string;
  missingPaths: string[];
  message: string;
}

export interface JurisdictionValidationResult {
  valid: boolean;
  errors: JurisdictionValidationError[];
  warnings: string[];
}

const JURISDICTIONS_BASE = path.join(process.cwd(), 'config', 'jurisdictions', 'uk');

/**
 * Check if a directory exists
 */
function directoryExists(dirPath: string): boolean {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Validate jurisdiction configuration for Notice Only product
 */
export function validateNoticeOnlyJurisdiction(
  jurisdiction: string
): JurisdictionValidationResult {
  const errors: JurisdictionValidationError[] = [];
  const warnings: string[] = [];

  const canonical = normalizeJurisdiction(jurisdiction);

  if (!canonical) {
    errors.push({
      jurisdiction,
      product: 'notice_only',
      missingPaths: [],
      message: `Unknown jurisdiction: ${jurisdiction}. Valid jurisdictions: england, wales, scotland, northern-ireland`,
    });
    return { valid: false, errors, warnings };
  }

  if (jurisdiction === 'england-wales') {
    warnings.push('Legacy jurisdiction "england-wales" was normalized to "england"');
  }

  // Map jurisdiction to folder name
  const jurisdictionPath = path.join(JURISDICTIONS_BASE, canonical);
  const missingPaths: string[] = [];

  // Check if jurisdiction directory exists
  if (!directoryExists(jurisdictionPath)) {
    missingPaths.push(jurisdictionPath);
    errors.push({
      jurisdiction,
      product: 'notice_only',
      missingPaths: [jurisdictionPath],
      message: `Jurisdiction directory not found: ${jurisdictionPath}`,
    });
    return { valid: false, errors, warnings };
  }

  // Check for rules directory (required for decision engine)
  const rulesPath = path.join(jurisdictionPath, 'rules');
  if (!directoryExists(rulesPath)) {
    missingPaths.push(rulesPath);
    warnings.push(`Rules directory not found: ${rulesPath} (decision engine may not work)`);
  }

  // Check for grounds directory (required for England/Scotland eviction grounds)
  if (canonical === 'england' || canonical === 'scotland') {
    const groundsPath = path.join(jurisdictionPath, 'grounds');
    if (!directoryExists(groundsPath)) {
      missingPaths.push(groundsPath);
      warnings.push(`Grounds directory not found: ${groundsPath} (eviction grounds may not be available)`);
    }
  }

  // Check for templates directory (required for document generation)
  const templatesPath = path.join(jurisdictionPath, 'templates');
  if (!directoryExists(templatesPath)) {
    missingPaths.push(templatesPath);
    errors.push({
      jurisdiction,
      product: 'notice_only',
      missingPaths: [templatesPath],
      message: `Templates directory not found: ${templatesPath}`,
    });
  }

  // Check for eviction templates specifically
  if (directoryExists(templatesPath)) {
    const evictionPath = path.join(templatesPath, 'eviction');
    if (!directoryExists(evictionPath)) {
      missingPaths.push(evictionPath);
      errors.push({
        jurisdiction,
        product: 'notice_only',
        missingPaths: [evictionPath],
        message: `Eviction templates directory not found: ${evictionPath}`,
      });
    }
  }

  // If we found missing critical paths, mark as invalid
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  return { valid: true, errors, warnings };
}

/**
 * Validate multiple jurisdictions at once (for startup checks)
 */
export function validateAllJurisdictions(): JurisdictionValidationResult {
  const jurisdictions: CanonicalJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];
  const allErrors: JurisdictionValidationError[] = [];
  const allWarnings: string[] = [];

  for (const jurisdiction of jurisdictions) {
    const result = validateNoticeOnlyJurisdiction(jurisdiction);
    allErrors.push(...result.errors);
    allWarnings.push(...result.warnings);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

/**
 * Format validation errors for console output
 */
export function formatValidationErrors(result: JurisdictionValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('❌ JURISDICTION CONFIGURATION ERRORS:');
    for (const error of result.errors) {
      lines.push(`  • [${error.jurisdiction}] ${error.message}`);
      if (error.missingPaths.length > 0) {
        lines.push(`    Missing: ${error.missingPaths.join(', ')}`);
      }
    }
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('⚠️  JURISDICTION CONFIGURATION WARNINGS:');
    for (const warning of result.warnings) {
      lines.push(`  • ${warning}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
