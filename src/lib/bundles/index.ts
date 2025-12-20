/**
 * Court & Tribunal Bundle Builder
 *
 * Main API for generating court/tribunal submission bundles.
 *
 * CRITICAL: This module is PURELY PRESENTATIONAL.
 * All legal rules come from:
 * - Decision engine (YAML configs)
 * - Case-intel module
 * - Existing form fillers
 *
 * NO NEW LEGAL RULES ARE CREATED HERE.
 */

import fs from 'fs';
import path from 'path';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { runDecisionEngine, type DecisionInput } from '@/lib/decision-engine';
import { analyzeCase, type CaseIntelligence } from '@/lib/case-intel';
import { buildEnglandWalesSections, buildScotlandSections } from './sections';
import type {
  BundleResult,
  BundleOptions,
  BundleMetadata,
  BundleSection,
  BundleSectionMetadata,
} from './types';

export * from './types';
export { generateEvidenceIndex, generateBundleTimeline } from './evidence-index';

/**
 * Generate court bundle for England & Wales
 */
export async function generateCourtBundle(
  caseFacts: CaseFacts,
  options: BundleOptions = {}
): Promise<BundleResult> {
  try {
    // Validate jurisdiction
    const jurisdiction = caseFacts.meta.jurisdiction;
    if (!jurisdiction) {
      return {
        success: false,
        error: 'Jurisdiction is required for bundle generation. England & Wales only for court bundles.',
      };
    }

    if (jurisdiction === 'northern-ireland') {
      return {
        success: false,
        error: 'Northern Ireland bundles are out of scope for V1. Tenancy agreements only are supported in NI.',
      };
    }

    if (jurisdiction !== 'england' && jurisdiction !== 'wales') {
      return {
        success: false,
        error: 'generateCourtBundle is for England & Wales only. Use generateTribunalBundle for Scotland.',
      };
    }

    // Set defaults
    const outputDir = options.output_dir || '/tmp/bundles';
    const caseId = caseFacts.meta.case_id || 'unknown';

    // Step 1: Run decision engine
    const decisionInput: DecisionInput = {
      jurisdiction: jurisdiction === 'wales' ? 'wales' : 'england', // Use canonical
      product: (caseFacts.meta.product as any) || 'complete_pack',
      case_type: 'eviction',
      facts: caseFacts,
    };
    const decisionOutput = runDecisionEngine(decisionInput);

    // Step 2: Run case intelligence (if requested)
    let caseIntel: CaseIntelligence;
    if (options.include_case_intel !== false) {
      caseIntel = await analyzeCase(caseFacts, {
        include_narrative: true,
        include_evidence: true,
        narrative_options: {
          target: 'n119',
        },
      });
    } else {
      // Minimal case intel without narratives
      caseIntel = await analyzeCase(caseFacts, {
        include_narrative: false,
        include_evidence: true,
      });
    }

    // Step 3: Build sections
    const sections = buildEnglandWalesSections(caseFacts, decisionOutput, caseIntel);

    // Step 4: Assemble bundle
    const bundleResult = await assembleBundlePDF(
      caseId,
      'court',
      jurisdiction, // Use actual jurisdiction (england or wales)
      sections,
      caseIntel,
      outputDir,
      options
    );

    return bundleResult;
  } catch (error) {
    console.error('Court bundle generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate tribunal bundle for Scotland
 */
export async function generateTribunalBundle(
  caseFacts: CaseFacts,
  options: BundleOptions = {}
): Promise<BundleResult> {
  try {
    // Validate jurisdiction
    const jurisdiction = caseFacts.meta.jurisdiction;
    if (!jurisdiction) {
      return {
        success: false,
        error: 'Jurisdiction is required for bundle generation. Scotland only for tribunal bundles.',
      };
    }

    if (jurisdiction === 'northern-ireland') {
      return {
        success: false,
        error: 'Northern Ireland bundles are out of scope for V1. Tenancy agreements only are supported in NI.',
      };
    }

    if (jurisdiction !== 'scotland') {
      return {
        success: false,
        error: 'generateTribunalBundle is for Scotland only. Use generateCourtBundle for England & Wales.',
      };
    }

    // Set defaults
    const outputDir = options.output_dir || '/tmp/bundles';
    const caseId = caseFacts.meta.case_id || 'unknown';

    // Step 1: Run decision engine
    const decisionInput: DecisionInput = {
      jurisdiction: 'scotland',
      product: (caseFacts.meta.product as any) || 'complete_pack',
      case_type: 'eviction',
      facts: caseFacts,
    };
    const decisionOutput = runDecisionEngine(decisionInput);

    // Step 2: Run case intelligence (if requested)
    let caseIntel: CaseIntelligence;
    if (options.include_case_intel !== false) {
      caseIntel = await analyzeCase(caseFacts, {
        include_narrative: true,
        include_evidence: true,
        narrative_options: {
          target: 'form_e',
        },
      });
    } else {
      caseIntel = await analyzeCase(caseFacts, {
        include_narrative: false,
        include_evidence: true,
      });
    }

    // Step 3: Build sections
    const sections = buildScotlandSections(caseFacts, decisionOutput, caseIntel);

    // Step 4: Assemble bundle
    const bundleResult = await assembleBundlePDF(
      caseId,
      'tribunal',
      'scotland',
      sections,
      caseIntel,
      outputDir,
      options
    );

    return bundleResult;
  } catch (error) {
    console.error('Tribunal bundle generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Assemble bundle sections into PDF
 *
 * NOTE: This is a simplified implementation that creates text files.
 * A production implementation would use a PDF library (e.g., pdfkit, pdf-lib)
 * to create proper formatted PDFs with page numbers, headers, etc.
 */
async function assembleBundlePDF(
  caseId: string,
  type: 'court' | 'tribunal',
  jurisdiction: string,
  sections: BundleSection[],
  caseIntel: CaseIntelligence,
  outputDir: string,
  options: BundleOptions
): Promise<BundleResult> {
  try {
    // Create output directory
    const bundleDir = path.join(outputDir, caseId);
    if (!fs.existsSync(bundleDir)) {
      fs.mkdirSync(bundleDir, { recursive: true });
    }

    // Generate bundle content as text (placeholder for PDF generation)
    let bundleContent = '';

    // Cover page
    bundleContent += generateCoverPage(caseId, type, jurisdiction, caseIntel, options);
    bundleContent += '\n\n' + '='.repeat(80) + '\n\n';

    // Add each section
    const sectionMetadata: BundleSectionMetadata[] = [];
    let currentPage = 2; // Cover page is page 1

    for (const section of sections) {
      bundleContent += `\n\n${'='.repeat(80)}\n`;
      bundleContent += `TAB ${section.tab}: ${section.title.toUpperCase()}\n`;
      bundleContent += `${'='.repeat(80)}\n\n`;

      const sectionText = renderSectionContent(section);
      bundleContent += sectionText;

      // Estimate page count (rough: 50 lines per page)
      const lineCount = sectionText.split('\n').length;
      const pageCount = Math.max(1, Math.ceil(lineCount / 50));

      sectionMetadata.push({
        tab: section.tab,
        title: section.title,
        start_page: currentPage,
        page_count: pageCount,
      });

      currentPage += pageCount;
    }

    // Write to file (text file as placeholder for PDF)
    const bundlePath = path.join(bundleDir, 'bundle.txt');
    fs.writeFileSync(bundlePath, bundleContent, 'utf8');

    // Get file size
    const stats = fs.statSync(bundlePath);

    // Create metadata
    const metadata: BundleMetadata = {
      bundle_id: `${caseId}-${Date.now()}`,
      case_id: caseId,
      jurisdiction: jurisdiction as any,
      type,
      generated_at: new Date().toISOString(),
      file_path: bundlePath,
      file_size: stats.size,
      page_count: currentPage - 1,
      sections: sectionMetadata,
    };

    // Write metadata
    const metadataPath = path.join(bundleDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

    return {
      success: true,
      metadata,
      warnings: [
        'Bundle generated as text file (placeholder). Production version would generate PDF.',
      ],
    };
  } catch (error) {
    console.error('Bundle assembly failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate cover page
 */
function generateCoverPage(
  caseId: string,
  type: 'court' | 'tribunal',
  jurisdiction: string,
  caseIntel: CaseIntelligence,
  options: BundleOptions
): string {
  const landlordName =
    caseIntel.case_facts.parties.landlord.name || 'Landlord Name Not Provided';
  const tenantNames =
    caseIntel.case_facts.parties.tenants?.map((t) => t.name).filter(Boolean).join(', ') ||
    'Tenant Name Not Provided';
  const propertyAddress =
    caseIntel.case_facts.property.address?.line1 || 'Property Address Not Provided';

  let cover = '';

  // Watermark if specified
  if (options.watermark) {
    cover += `\n\n*** ${options.watermark} ***\n\n`;
  }

  cover += `\n\n`;
  cover += `${'='.repeat(80)}\n`;
  cover += `${type === 'court' ? 'COURT BUNDLE' : 'TRIBUNAL BUNDLE'}\n`;
  cover += `${'='.repeat(80)}\n\n`;

  // Jurisdiction
  cover += `Jurisdiction: ${jurisdiction.toUpperCase()}\n`;
  cover += `Case Type: Possession / Eviction\n`;
  cover += `Case ID: ${caseId}\n`;
  cover += `Generated: ${new Date().toLocaleString('en-GB')}\n\n`;

  // Parties
  cover += `${'='.repeat(80)}\n`;
  cover += `PARTIES\n`;
  cover += `${'='.repeat(80)}\n\n`;
  cover += `CLAIMANT / APPLICANT:\n`;
  cover += `  ${landlordName}\n\n`;
  cover += `DEFENDANT / RESPONDENT:\n`;
  cover += `  ${tenantNames}\n\n`;

  // Property
  cover += `PROPERTY:\n`;
  cover += `  ${propertyAddress}\n`;
  if (caseIntel.case_facts.property.address?.postcode) {
    cover += `  ${caseIntel.case_facts.property.address.postcode}\n`;
  }
  cover += '\n';

  // Case summary
  cover += `${'='.repeat(80)}\n`;
  cover += `CASE OVERVIEW\n`;
  cover += `${'='.repeat(80)}\n\n`;

  // Routes and grounds from decision engine
  if (caseIntel.decision_engine_output.recommended_routes.length > 0) {
    cover += `Route(s): ${caseIntel.decision_engine_output.recommended_routes.map((r) => r.toUpperCase()).join(', ')}\n`;
  }

  if (caseIntel.decision_engine_output.recommended_grounds.length > 0) {
    cover += `Ground(s): `;
    cover += caseIntel.decision_engine_output.recommended_grounds
      .map((g) => `${g.code} (${g.title})`)
      .join(', ');
    cover += '\n';
  }

  cover += `\nCase Strength: ${caseIntel.score_report.score}/100\n`;

  // Custom cover text
  if (options.cover_page_text) {
    cover += `\n${options.cover_page_text}\n`;
  }

  cover += '\n';

  // Important notes
  cover += `${'='.repeat(80)}\n`;
  cover += `IMPORTANT NOTES\n`;
  cover += `${'='.repeat(80)}\n\n`;

  // Check for blocking issues
  const blockingIssues = caseIntel.decision_engine_output.blocking_issues.filter(
    (b) => b.severity === 'blocking'
  );
  if (blockingIssues.length > 0) {
    cover += `⚠️  BLOCKING ISSUES DETECTED:\n\n`;
    for (const block of blockingIssues) {
      cover += `  • ${block.route.toUpperCase()}: ${block.description}\n`;
    }
    cover += '\n';
  }

  // Warnings
  if (caseIntel.decision_engine_output.warnings.length > 0) {
    cover += `Warnings:\n`;
    for (const warning of caseIntel.decision_engine_output.warnings.slice(0, 5)) {
      cover += `  • ${warning}\n`;
    }
    cover += '\n';
  }

  cover += `\nThis bundle has been prepared using Landlord Heaven's automated system.\n`;
  cover += `All legal determinations are based on the decision engine and case intelligence.\n`;

  return cover;
}

/**
 * Render section content to text
 */
function renderSectionContent(section: BundleSection): string {
  const content = section.content;

  switch (content.type) {
    case 'narrative':
      return renderNarrativeContent(content as any);

    case 'index':
      return renderIndexContent(content as any);

    case 'evidence':
      return renderEvidenceContent(content as any);

    case 'form':
    case 'document':
      return `[${section.title} would be inserted here as PDF]\n\nPlaceholder for: ${section.title}\n`;

    default:
      return `[Unknown content type: ${(content as any).type}]\n`;
  }
}

/**
 * Render narrative content
 */
function renderNarrativeContent(content: { title?: string; text: string }): string {
  let output = '';

  if (content.title) {
    output += `${content.title}\n`;
    output += '='.repeat(content.title.length) + '\n\n';
  }

  output += content.text;
  output += '\n';

  return output;
}

/**
 * Render index content
 */
function renderIndexContent(content: { title: string; entries: any[] }): string {
  let output = `${content.title}\n`;
  output += '='.repeat(content.title.length) + '\n\n';

  for (const entry of content.entries) {
    output += `Tab ${entry.tab.padEnd(5)} Page ${entry.page.toString().padStart(3)}    ${entry.title}\n`;
  }

  return output;
}

/**
 * Render evidence content
 */
function renderEvidenceContent(content: { items: any[] }): string {
  let output = 'EVIDENCE\n';
  output += '========\n\n';

  output += `Total Items: ${content.items.length}\n\n`;

  for (let i = 0; i < content.items.length; i++) {
    const item = content.items[i];
    output += `${i + 1}. ${item.content}\n`;
    if (item.dates && item.dates.length > 0) {
      output += `   Date(s): ${item.dates.join(', ')}\n`;
    }
    if (item.quality) {
      output += `   Quality: ${item.quality}\n`;
    }
    output += '\n';
  }

  return output;
}

/**
 * Quick validation before bundle generation
 */
export function validateBundleReadiness(caseFacts: CaseFacts): {
  ready: boolean;
  issues: string[];
  warnings: string[];
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check basic required fields
  if (!caseFacts.parties.landlord.name) {
    issues.push('Landlord name is required');
  }

  if (!caseFacts.parties.tenants || caseFacts.parties.tenants.length === 0) {
    issues.push('At least one tenant is required');
  }

  if (!caseFacts.property.address?.line1) {
    issues.push('Property address is required');
  }

  if (!caseFacts.tenancy.start_date) {
    issues.push('Tenancy start date is required');
  }

  if (!caseFacts.notice.service_date) {
    warnings.push('Notice service date not recorded');
  }

  // Check jurisdiction is supported
  const jurisdiction = caseFacts.meta.jurisdiction;
  if (jurisdiction === 'northern-ireland') {
    issues.push('Northern Ireland bundles not yet supported');
  }

  return {
    ready: issues.length === 0,
    issues,
    warnings,
  };
}
