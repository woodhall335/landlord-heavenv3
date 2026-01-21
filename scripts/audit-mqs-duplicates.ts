#!/usr/bin/env npx tsx
/**
 * MQS Duplicate Question Audit Script
 *
 * This script analyzes MQS (Master Question Set) config files to detect
 * duplicate questions that map to the same underlying fact key.
 *
 * Usage:
 *   npx tsx scripts/audit-mqs-duplicates.ts [config-path]
 *   # or via npm script:
 *   pnpm run audit:mqs-duplicates
 *
 * Default: config/mqs/complete_pack/england.yaml
 *
 * Output:
 *   - Console report of duplicates found
 *   - JSON audit file in docs/audits/
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

// ============================================================================
// TYPES
// ============================================================================

interface MQSField {
  id: string;
  label?: string;
  inputType?: string;
  maps_to?: string[];
  validation?: Record<string, any>;
  dependsOn?: {
    questionId?: string;
    fieldId?: string;
    value?: any;
    valueNotEqual?: any;
    contains?: string;
  };
}

interface MQSQuestion {
  id: string;
  section?: string;
  question?: string;
  inputType: string;
  fields?: MQSField[];
  maps_to?: string[];
  dependsOn?: {
    questionId?: string;
    value?: any;
    valueNotEqual?: any;
    contains?: string;
  };
  routes?: string[];
  validation?: Record<string, any>;
}

interface MQSConfig {
  __meta?: Record<string, any>;
  id: string;
  product: string;
  jurisdiction: string;
  version: string;
  questions: MQSQuestion[];
}

interface FactKeyMapping {
  factKey: string;
  questionId: string;
  questionText: string;
  section: string;
  fieldId?: string;
  fieldLabel?: string;
  inputType: string;
  routes?: string[];
  dependsOn?: any;
}

interface DuplicateGroup {
  factKey: string;
  occurrences: FactKeyMapping[];
  recommendation: string;
}

interface AuditReport {
  configPath: string;
  timestamp: string;
  product: string;
  jurisdiction: string;
  version: string;
  totalQuestions: number;
  totalFactKeys: number;
  duplicateGroups: DuplicateGroup[];
  summary: {
    duplicateCount: number;
    affectedFactKeys: number;
    criticalDuplicates: string[];
    recommendations: string[];
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extract the primary fact key for a question or field.
 * Priority: maps_to[0] > field.id > question.id
 */
function extractFactKey(
  questionId: string,
  mapsTo?: string[],
  fieldId?: string
): string {
  if (mapsTo && mapsTo.length > 0) {
    return mapsTo[0];
  }
  return fieldId || questionId;
}

/**
 * Extract all fact key mappings from a question, including group fields.
 */
function extractFactKeyMappings(question: MQSQuestion): FactKeyMapping[] {
  const mappings: FactKeyMapping[] = [];

  // For grouped inputs, extract each field's fact key
  if (question.inputType === 'group' && question.fields) {
    for (const field of question.fields) {
      const factKey = extractFactKey(question.id, field.maps_to, field.id);
      mappings.push({
        factKey,
        questionId: question.id,
        questionText: question.question || '',
        section: question.section || 'Unknown',
        fieldId: field.id,
        fieldLabel: field.label,
        inputType: field.inputType || 'text',
        routes: question.routes,
        dependsOn: question.dependsOn || field.dependsOn,
      });
    }
  } else {
    // For non-grouped inputs, use the question's maps_to
    if (question.maps_to) {
      for (const factKey of question.maps_to) {
        mappings.push({
          factKey,
          questionId: question.id,
          questionText: question.question || '',
          section: question.section || 'Unknown',
          inputType: question.inputType,
          routes: question.routes,
          dependsOn: question.dependsOn,
        });
      }
    } else {
      // Use question ID as fact key if no maps_to
      mappings.push({
        factKey: question.id,
        questionId: question.id,
        questionText: question.question || '',
        section: question.section || 'Unknown',
        inputType: question.inputType,
        routes: question.routes,
        dependsOn: question.dependsOn,
      });
    }
  }

  return mappings;
}

/**
 * Determine if duplicates are problematic and generate a recommendation.
 */
function analyzeAndRecommend(occurrences: FactKeyMapping[]): string {
  // If all occurrences are from different routes, this may be intentional
  const routes = new Set<string>();
  let allHaveRoutes = true;
  for (const occ of occurrences) {
    if (occ.routes && occ.routes.length > 0) {
      occ.routes.forEach((r) => routes.add(r));
    } else {
      allHaveRoutes = false;
    }
  }

  // Check if all are route-specific and mutually exclusive
  if (allHaveRoutes && routes.size === occurrences.length) {
    return 'OK: Route-specific questions for different eviction routes (mutually exclusive).';
  }

  // Check if it's just conditional follow-up fields
  const hasDependent = occurrences.some((o) => o.dependsOn);
  const hasNonDependent = occurrences.some((o) => !o.dependsOn);

  if (hasDependent && hasNonDependent) {
    return 'INVESTIGATE: Mix of base questions and conditional follow-ups writing to same fact.';
  }

  // Same section = likely true duplicate
  const sections = new Set(occurrences.map((o) => o.section));
  if (sections.size === 1) {
    return 'FIX: Duplicate questions in same section. Consolidate into single question.';
  }

  // Different sections asking same info
  return 'FIX: Different sections collecting same data. Consider reusing existing fact or adding "review/edit" mode.';
}

/**
 * Find critical duplicates that could cause data overwrites.
 */
function findCriticalDuplicates(groups: DuplicateGroup[]): string[] {
  const critical: string[] = [];

  for (const group of groups) {
    // Critical if: non-route-specific duplicates exist
    const nonRouteSpecific = group.occurrences.filter(
      (o) => !o.routes || o.routes.length === 0
    );
    if (nonRouteSpecific.length > 1) {
      critical.push(
        `${group.factKey}: ${nonRouteSpecific.length} questions can overwrite each other`
      );
    }

    // Also critical if route-specific questions overlap with non-route-specific
    if (nonRouteSpecific.length > 0 && group.occurrences.length > nonRouteSpecific.length) {
      critical.push(
        `${group.factKey}: Mix of route-specific and general questions`
      );
    }
  }

  return critical;
}

// ============================================================================
// MAIN AUDIT FUNCTION
// ============================================================================

function runAudit(configPath: string): AuditReport {
  // Load and parse YAML config
  const content = fs.readFileSync(configPath, 'utf-8');
  const config = yaml.load(content) as MQSConfig;

  if (!config.questions || !Array.isArray(config.questions)) {
    throw new Error(`Invalid MQS config: no questions array found in ${configPath}`);
  }

  // Extract all fact key mappings
  const allMappings: FactKeyMapping[] = [];
  for (const question of config.questions) {
    // Skip info-only questions
    if (question.inputType === 'info') continue;

    const mappings = extractFactKeyMappings(question);
    allMappings.push(...mappings);
  }

  // Group by fact key
  const factKeyGroups = new Map<string, FactKeyMapping[]>();
  for (const mapping of allMappings) {
    const existing = factKeyGroups.get(mapping.factKey) || [];
    existing.push(mapping);
    factKeyGroups.set(mapping.factKey, existing);
  }

  // Find duplicates (more than one mapping to same fact key)
  const duplicateGroups: DuplicateGroup[] = [];
  for (const [factKey, occurrences] of factKeyGroups) {
    if (occurrences.length > 1) {
      duplicateGroups.push({
        factKey,
        occurrences,
        recommendation: analyzeAndRecommend(occurrences),
      });
    }
  }

  // Sort by severity (FIX first, then INVESTIGATE, then OK)
  duplicateGroups.sort((a, b) => {
    const severity = (r: string) => {
      if (r.startsWith('FIX')) return 0;
      if (r.startsWith('INVESTIGATE')) return 1;
      return 2;
    };
    return severity(a.recommendation) - severity(b.recommendation);
  });

  // Generate summary
  const criticalDuplicates = findCriticalDuplicates(duplicateGroups);
  const recommendations: string[] = [];

  if (duplicateGroups.some((g) => g.recommendation.startsWith('FIX'))) {
    recommendations.push('Review and consolidate duplicate questions marked with FIX.');
  }
  if (duplicateGroups.some((g) => g.recommendation.startsWith('INVESTIGATE'))) {
    recommendations.push('Investigate mixed base/conditional questions writing to same fact.');
  }
  if (criticalDuplicates.length > 0) {
    recommendations.push('Address critical duplicates that could cause data overwrites.');
  }
  if (duplicateGroups.length === 0) {
    recommendations.push('No duplicates found. Config is clean.');
  }

  return {
    configPath,
    timestamp: new Date().toISOString(),
    product: config.product,
    jurisdiction: config.jurisdiction,
    version: config.version,
    totalQuestions: config.questions.filter((q) => q.inputType !== 'info').length,
    totalFactKeys: factKeyGroups.size,
    duplicateGroups,
    summary: {
      duplicateCount: duplicateGroups.length,
      affectedFactKeys: duplicateGroups.length,
      criticalDuplicates,
      recommendations,
    },
  };
}

// ============================================================================
// REPORT OUTPUT
// ============================================================================

function printReport(report: AuditReport): void {
  console.log('');
  console.log('='.repeat(80));
  console.log('MQS DUPLICATE QUESTION AUDIT REPORT');
  console.log('='.repeat(80));
  console.log('');
  console.log(`Config: ${report.configPath}`);
  console.log(`Product: ${report.product}`);
  console.log(`Jurisdiction: ${report.jurisdiction}`);
  console.log(`Version: ${report.version}`);
  console.log(`Audit Date: ${report.timestamp}`);
  console.log('');
  console.log('-'.repeat(80));
  console.log('SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Questions: ${report.totalQuestions}`);
  console.log(`Unique Fact Keys: ${report.totalFactKeys}`);
  console.log(`Duplicate Groups: ${report.summary.duplicateCount}`);
  console.log('');

  if (report.summary.criticalDuplicates.length > 0) {
    console.log('CRITICAL DUPLICATES (may cause data overwrites):');
    for (const crit of report.summary.criticalDuplicates) {
      console.log(`  - ${crit}`);
    }
    console.log('');
  }

  console.log('RECOMMENDATIONS:');
  for (const rec of report.summary.recommendations) {
    console.log(`  - ${rec}`);
  }
  console.log('');

  if (report.duplicateGroups.length > 0) {
    console.log('-'.repeat(80));
    console.log('DUPLICATE DETAILS');
    console.log('-'.repeat(80));

    for (const group of report.duplicateGroups) {
      console.log('');
      console.log(`Fact Key: ${group.factKey}`);
      console.log(`Status: ${group.recommendation}`);
      console.log(`Occurrences (${group.occurrences.length}):`);

      for (const occ of group.occurrences) {
        const routeInfo = occ.routes ? ` [routes: ${occ.routes.join(', ')}]` : '';
        const fieldInfo = occ.fieldId ? ` -> field: ${occ.fieldId}` : '';
        const depInfo = occ.dependsOn ? ' (conditional)' : '';
        console.log(`  - ${occ.section} / ${occ.questionId}${fieldInfo}${routeInfo}${depInfo}`);
        if (occ.questionText) {
          console.log(`    "${occ.questionText.substring(0, 60)}${occ.questionText.length > 60 ? '...' : ''}"`);
        }
      }
    }
  }

  console.log('');
  console.log('='.repeat(80));
}

function saveReport(report: AuditReport): string {
  const outputDir = path.join(process.cwd(), 'docs', 'audits');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filename = `mqs-duplicates-${report.jurisdiction}-${new Date().toISOString().split('T')[0]}.json`;
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  return outputPath;
}

// ============================================================================
// ENTRY POINT
// ============================================================================

const configPath = process.argv[2] || path.join(
  process.cwd(),
  'config',
  'mqs',
  'complete_pack',
  'england.yaml'
);

if (!fs.existsSync(configPath)) {
  console.error(`Error: Config file not found: ${configPath}`);
  process.exit(1);
}

try {
  const report = runAudit(configPath);
  printReport(report);

  const savedPath = saveReport(report);
  console.log(`Report saved to: ${savedPath}`);
  console.log('');
} catch (error) {
  console.error('Audit failed:', error);
  process.exit(1);
}
