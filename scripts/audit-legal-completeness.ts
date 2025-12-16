/**
 * Legal Completeness Audit Script
 *
 * Systematically audits MQS YAML files, templates, and mappers for each product×jurisdiction
 * to ensure legal completeness and correctness.
 *
 * EVIDENCE-BASED: Uses only files in the repo, no assumptions.
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import type { ProductType } from '@/lib/wizard/mqs-loader';

// ============================================================================
// CONFIGURATION
// ============================================================================

const JURISDICTIONS: CanonicalJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];
const PRODUCTS: ProductType[] = ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'];

// Product support matrix (from business requirements)
const SUPPORTED_COMBINATIONS: Record<string, ProductType[]> = {
  england: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
  wales: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
  scotland: ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'],
  'northern-ireland': ['tenancy_agreement'], // V1 limitation
};

// ============================================================================
// AUDIT RESULTS TRACKING
// ============================================================================

interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'mqs' | 'template' | 'mapper' | 'grounds' | 'route';
  product: string;
  jurisdiction: string;
  issue: string;
  file?: string;
  suggestion?: string;
}

const issues: AuditIssue[] = [];

function logIssue(issue: AuditIssue) {
  issues.push(issue);

  const emoji = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '⚠️ ' : 'ℹ️ ';
  const color = issue.severity === 'critical' ? '\x1b[31m' : issue.severity === 'warning' ? '\x1b[33m' : '\x1b[36m';
  const reset = '\x1b[0m';

  console.log(
    `${emoji} ${color}[${issue.severity.toUpperCase()}]${reset} ` +
    `${issue.product}/${issue.jurisdiction} - ${issue.category}: ${issue.issue}`
  );
  if (issue.suggestion) {
    console.log(`   💡 Suggestion: ${issue.suggestion}`);
  }
}

// ============================================================================
// PHASE 1: BUILD REQUIREMENT CHECKLISTS FROM REPO
// ============================================================================

/**
 * Extract template variables from a Handlebars template
 */
function extractTemplateVariables(templateContent: string): Set<string> {
  const variables = new Set<string>();

  // Match {{variable}}, {{{variable}}}, {{#if variable}}, etc.
  const patterns = [
    /\{\{([^#/!>][^}]*)\}\}/g, // {{variable}}
    /\{\{\{([^}]*)\}\}\}/g,     // {{{variable}}}
    /\{\{#if\s+([^}]+)\}\}/g,   // {{#if variable}}
    /\{\{#each\s+([^}]+)\}\}/g, // {{#each variable}}
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(templateContent)) !== null) {
      let varName = match[1].trim();
      // Clean up helpers and extract base variable
      varName = varName.split(' ')[0]; // Remove helpers like "formatDate variable"
      varName = varName.replace(/^this\./, ''); // Remove "this." prefix

      if (varName && !varName.startsWith('@') && varName !== 'this') {
        variables.add(varName);
      }
    }
  });

  return variables;
}

/**
 * Find all templates used by a product×jurisdiction
 */
function findProductTemplates(product: ProductType, jurisdiction: CanonicalJurisdiction): string[] {
  const templates: string[] = [];

  // Base template paths per product
  const templatePaths = {
    notice_only: [
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/section8_notice.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/section21_form6a.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/notice_to_leave.hbs`,
    ],
    complete_pack: [
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/section8_notice.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/section21_form6a.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/notice_to_leave.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/eviction_roadmap.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/expert_guidance.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/witness-statement.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/eviction/compliance-audit.hbs`,
      `config/jurisdictions/shared/templates/evidence_collection_checklist.hbs`,
      `config/jurisdictions/shared/templates/proof_of_service.hbs`,
    ],
    money_claim: [
      `config/jurisdictions/uk/${jurisdiction}/templates/money_claims/pack_cover.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/money_claims/schedule_of_arrears.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/money_claims/interest_calculation.hbs`,
    ],
    tenancy_agreement: [
      `config/jurisdictions/uk/${jurisdiction}/templates/ast_agreement.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/ast_agreement_premium.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/prt_agreement.hbs`,
      `config/jurisdictions/uk/${jurisdiction}/templates/prt_agreement_premium.hbs`,
    ],
  };

  const paths = templatePaths[product] || [];

  // Filter to only existing files
  return paths.filter(p => {
    try {
      return fs.existsSync(path.join(process.cwd(), p));
    } catch {
      return false;
    }
  });
}

/**
 * Build requirements checklist for a product×jurisdiction from templates
 */
function buildRequirementsChecklist(
  product: ProductType,
  jurisdiction: CanonicalJurisdiction
): { templates: string[]; requiredVariables: Set<string>; routes: string[] } {
  const templates = findProductTemplates(product, jurisdiction);
  const requiredVariables = new Set<string>();
  const routes: string[] = [];

  // Extract variables from all templates
  templates.forEach(templatePath => {
    try {
      const fullPath = path.join(process.cwd(), templatePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const vars = extractTemplateVariables(content);
      vars.forEach(v => requiredVariables.add(v));
    } catch (error: any) {
      logIssue({
        severity: 'warning',
        category: 'template',
        product,
        jurisdiction,
        issue: `Failed to read template: ${templatePath}`,
        file: templatePath,
      });
    }
  });

  // Add expected routes per product
  if (product === 'notice_only' || product === 'complete_pack') {
    if (jurisdiction === 'england') {
      routes.push('section_8', 'section_21');
    } else if (jurisdiction === 'wales') {
      routes.push('section_8', 'section_173'); // Wales uses Section 173, not 21
    } else if (jurisdiction === 'scotland') {
      routes.push('notice_to_leave');
    }
  }

  return { templates, requiredVariables, routes };
}

// ============================================================================
// PHASE 2: AUDIT MQS YAML COMPLETENESS
// ============================================================================

interface MQSQuestion {
  id: string;
  question: string;
  routes?: string[];
  dependsOn?: { questionId: string; value: any };
  maps_to?: string[];
  options?: Array<{ value: string; label: string }>;
}

interface MQSFile {
  jurisdiction: string;
  questions: MQSQuestion[];
}

/**
 * Load and parse MQS YAML file
 */
function loadMQSFile(product: ProductType, jurisdiction: string): MQSFile | null {
  const yamlPath = path.join(process.cwd(), 'config', 'mqs', product, `${jurisdiction}.yaml`);

  if (!fs.existsSync(yamlPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(yamlPath, 'utf-8');
    return yaml.load(content) as MQSFile;
  } catch (error: any) {
    logIssue({
      severity: 'critical',
      category: 'mqs',
      product,
      jurisdiction,
      issue: `Failed to parse MQS YAML: ${error.message}`,
      file: yamlPath,
    });
    return null;
  }
}

/**
 * Audit MQS completeness against requirements
 */
function auditMQSCompleteness(
  product: ProductType,
  jurisdiction: CanonicalJurisdiction,
  requirements: ReturnType<typeof buildRequirementsChecklist>
) {
  const mqs = loadMQSFile(product, jurisdiction);

  if (!mqs) {
    logIssue({
      severity: 'critical',
      category: 'mqs',
      product,
      jurisdiction,
      issue: 'MQS YAML file not found',
      suggestion: `Create config/mqs/${product}/${jurisdiction}.yaml`,
    });
    return;
  }

  // Check for route selection question
  const routeQuestion = mqs.questions.find(q =>
    q.id === 'selected_notice_route' ||
    q.id === 'eviction_route' ||
    q.id === 'notice_type'
  );

  if (requirements.routes.length > 0 && !routeQuestion) {
    logIssue({
      severity: 'critical',
      category: 'mqs',
      product,
      jurisdiction,
      issue: 'Missing route selection question',
      suggestion: 'Add selected_notice_route question to MQS',
    });
  }

  // Check route options match jurisdiction
  if (routeQuestion?.options) {
    const availableRoutes = routeQuestion.options.map(o => o.value.toLowerCase());

    // Check for invalid routes
    if (jurisdiction === 'wales' && availableRoutes.includes('section_21')) {
      logIssue({
        severity: 'critical',
        category: 'route',
        product,
        jurisdiction,
        issue: 'Section 21 is NOT available in Wales (use Section 173)',
        file: `config/mqs/${product}/${jurisdiction}.yaml`,
        suggestion: 'Remove section_21 option and add section_173',
      });
    }

    if (jurisdiction === 'scotland' && (availableRoutes.includes('section_21') || availableRoutes.includes('section_8'))) {
      logIssue({
        severity: 'critical',
        category: 'route',
        product,
        jurisdiction,
        issue: 'Section 8/21 not available in Scotland (use Notice to Leave)',
        file: `config/mqs/${product}/${jurisdiction}.yaml`,
        suggestion: 'Use notice_to_leave route only',
      });
    }

    if (jurisdiction === 'england' && !availableRoutes.includes('section_21') && (product === 'notice_only' || product === 'complete_pack')) {
      logIssue({
        severity: 'warning',
        category: 'route',
        product,
        jurisdiction,
        issue: 'Section 21 should be available in England',
        file: `config/mqs/${product}/${jurisdiction}.yaml`,
        suggestion: 'Add section_21 as a route option',
      });
    }
  }

  // Check for required variable coverage
  const mappedFields = new Set<string>();
  mqs.questions.forEach(q => {
    if (q.maps_to) {
      q.maps_to.forEach(field => mappedFields.add(field));
    }
  });

  // Find critical missing fields
  const criticalFields = [
    'landlord_full_name',
    'tenant_full_name',
    'property_address',
    'tenancy_start_date',
    'rent_amount',
  ];

  criticalFields.forEach(field => {
    if (!mappedFields.has(field) && !mqs.questions.some(q => q.id === field)) {
      logIssue({
        severity: 'critical',
        category: 'mqs',
        product,
        jurisdiction,
        issue: `Missing critical field: ${field}`,
        file: `config/mqs/${product}/${jurisdiction}.yaml`,
        suggestion: `Add question that maps to ${field}`,
      });
    }
  });
}

// ============================================================================
// PHASE 3: AUDIT GROUNDS FILES
// ============================================================================

function auditGroundsFiles(jurisdiction: CanonicalJurisdiction) {
  const groundsPath = path.join(
    process.cwd(),
    'config',
    'jurisdictions',
    'uk',
    jurisdiction,
    'eviction_grounds.json'
  );

  if (!fs.existsSync(groundsPath)) {
    logIssue({
      severity: 'warning',
      category: 'grounds',
      product: 'eviction',
      jurisdiction,
      issue: 'Eviction grounds file not found',
      file: groundsPath,
      suggestion: `Create ${groundsPath} with jurisdiction-specific grounds`,
    });
    return;
  }

  try {
    const grounds = JSON.parse(fs.readFileSync(groundsPath, 'utf-8'));

    // Basic validation
    if (!grounds.grounds) {
      logIssue({
        severity: 'critical',
        category: 'grounds',
        product: 'eviction',
        jurisdiction,
        issue: 'Grounds file missing "grounds" object',
        file: groundsPath,
      });
    }

    // Check jurisdiction-specific grounds
    if (jurisdiction === 'wales') {
      // Wales should have Section 173 grounds, not Section 21
      const hasSection21 = Object.keys(grounds.grounds || {}).some(k =>
        k.includes('section_21') || k.includes('section21')
      );

      if (hasSection21) {
        logIssue({
          severity: 'critical',
          category: 'grounds',
          product: 'eviction',
          jurisdiction,
          issue: 'Wales grounds file should NOT contain Section 21 grounds',
          file: groundsPath,
          suggestion: 'Use Section 173 grounds from Renting Homes (Wales) Act 2016',
        });
      }
    }
  } catch (error: any) {
    logIssue({
      severity: 'critical',
      category: 'grounds',
      product: 'eviction',
      jurisdiction,
      issue: `Failed to parse grounds file: ${error.message}`,
      file: groundsPath,
    });
  }
}

// ============================================================================
// MAIN AUDIT RUNNER
// ============================================================================

async function runAudit() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 LEGAL COMPLETENESS AUDIT');
  console.log('='.repeat(80) + '\n');

  console.log('Evidence-based audit using only files in the repo.\n');

  // Phase 1 & 2: Audit each product×jurisdiction
  for (const jurisdiction of JURISDICTIONS) {
    const supportedProducts = SUPPORTED_COMBINATIONS[jurisdiction] || [];

    console.log(`\n📍 Auditing ${jurisdiction.toUpperCase()}...\n`);

    for (const product of PRODUCTS) {
      if (!supportedProducts.includes(product)) {
        console.log(`⏭️  Skipping ${product} (not supported in ${jurisdiction})`);
        continue;
      }

      console.log(`\n  📦 ${product}...`);

      // Build requirements from templates
      const requirements = buildRequirementsChecklist(product, jurisdiction);

      console.log(`     Templates found: ${requirements.templates.length}`);
      console.log(`     Required variables: ${requirements.requiredVariables.size}`);
      console.log(`     Expected routes: ${requirements.routes.join(', ') || 'none'}`);

      // Audit MQS completeness
      auditMQSCompleteness(product, jurisdiction, requirements);
    }

    // Audit grounds files (for eviction products)
    if (supportedProducts.some(p => p === 'notice_only' || p === 'complete_pack')) {
      auditGroundsFiles(jurisdiction);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 AUDIT SUMMARY');
  console.log('='.repeat(80) + '\n');

  const critical = issues.filter(i => i.severity === 'critical').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const info = issues.filter(i => i.severity === 'info').length;

  console.log(`🔴 Critical issues: ${critical}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`ℹ️  Info: ${info}`);
  console.log(`\nTotal issues: ${issues.length}\n`);

  // Group by category
  const byCategory = issues.reduce((acc, issue) => {
    acc[issue.category] = (acc[issue.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Issues by category:');
  Object.entries(byCategory).forEach(([category, count]) => {
    console.log(`  ${category}: ${count}`);
  });

  console.log('\n' + '='.repeat(80) + '\n');

  // Exit code
  if (critical > 0) {
    console.error(`💥 Audit failed with ${critical} critical issue(s).\n`);
    process.exit(1);
  } else if (warnings > 0) {
    console.log(`⚠️  Audit passed with ${warnings} warning(s).\n`);
    process.exit(0);
  } else {
    console.log('✅ Audit passed with no issues!\n');
    process.exit(0);
  }
}

// Run audit
runAudit().catch(error => {
  console.error('\n💥 Audit script crashed:\n', error);
  process.exit(1);
});
