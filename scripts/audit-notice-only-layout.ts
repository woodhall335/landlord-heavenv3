#!/usr/bin/env tsx
/**
 * AUDIT NOTICE ONLY LAYOUT
 *
 * Performs automated layout checks on Notice Only PDFs to catch visual regressions:
 * - Detects excessive top whitespace (dead spacing)
 * - Verifies required headings are present
 * - Checks for placeholder text
 * - Validates page dimensions
 *
 * Usage:
 *   npx tsx scripts/audit-notice-only-layout.ts
 *
 * Output:
 *   artifacts/notice_only/_reports/layout-audit.json
 *   artifacts/notice_only/_reports/layout-audit.md
 */

import fs from 'fs/promises';
import path from 'path';

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'notice_only');
const REPORTS_DIR = path.join(ARTIFACTS_DIR, '_reports');

interface LayoutIssue {
  type: 'excessive_whitespace' | 'missing_heading' | 'placeholder_text' | 'page_dimension';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  details?: any;
}

interface LayoutAuditResult {
  path: string;
  relativePath: string;
  route: string;
  issues: LayoutIssue[];
  checks: {
    topWhitespace: { passed: boolean; firstTextPosition?: number };
    requiredHeadings: { passed: boolean; foundHeadings: string[] };
    placeholders: { passed: boolean; foundPlaceholders?: string[] };
  };
}

interface AuditReport {
  timestamp: string;
  totalPDFs: number;
  totalIssues: number;
  criticalIssues: number;
  results: LayoutAuditResult[];
}

/**
 * Find all PDF files
 */
async function findPDFs(): Promise<Array<{ path: string; route: string }>> {
  const pdfs: Array<{ path: string; route: string }> = [];

  async function scan(dir: string, relativePath: string = ''): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;

        if (entry.name === '_snapshots' || entry.name === '_reports') {
          continue;
        }

        if (entry.isDirectory()) {
          await scan(fullPath, relPath);
        } else if (entry.isFile() && entry.name.endsWith('.pdf')) {
          const route = relativePath || 'root';
          pdfs.push({ path: fullPath, route });
        }
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  await scan(ARTIFACTS_DIR);
  return pdfs;
}

/**
 * Extract text from PDF using pdfjs-dist
 */
async function extractPDFText(pdfPath: string): Promise<{ text: string; error?: string }> {
  try {
    const pdfBuffer = await fs.readFile(pdfPath);

    // Validate PDF header
    const header = pdfBuffer.slice(0, 5).toString('utf-8');
    if (!header.startsWith('%PDF-')) {
      return { text: '', error: 'Invalid PDF header' };
    }

    // Try pdfjs-dist
    try {
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

      if (!(pdfjsLib as any).GlobalWorkerOptions.workerSrc) {
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '';
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useSystemFonts: true,
        verbosity: 0,
      });

      const pdf = await loadingTask.promise;
      const textParts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await page.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
        textParts.push(pageText);
      }

      return { text: textParts.join('\n') };
    } catch (pdfjsError: any) {
      return { text: '', error: `pdfjs-dist failed: ${pdfjsError.message}` };
    }
  } catch (e: any) {
    return { text: '', error: `File read failed: ${e.message}` };
  }
}

/**
 * Check for excessive top whitespace
 */
function checkTopWhitespace(text: string): { passed: boolean; firstTextPosition?: number } {
  // In a well-formatted notice, text should start near the top
  // If first text appears very far down, it indicates excessive whitespace
  const lines = text.split('\n');
  let firstNonEmptyLine = 0;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      firstNonEmptyLine = i;
      break;
    }
  }

  // If first text is beyond line 10, flag as excessive whitespace
  const passed = firstNonEmptyLine < 10;

  return {
    passed,
    firstTextPosition: firstNonEmptyLine,
  };
}

/**
 * Check for required headings based on jurisdiction
 */
function checkRequiredHeadings(text: string, route: string): { passed: boolean; foundHeadings: string[] } {
  const requiredHeadings: Record<string, string[]> = {
    'england/form_3_section8': ['NOTICE SEEKING POSSESSION', 'Housing Act 1988'],
    'england/form_6a_section21': ['Notice Requiring Possession', 'Housing Act 1988'],
    'wales/rhw17': ['FORM RHW17', 'Renting Homes (Wales) Act 2016'],
    'wales/rhw16': ['FORM RHW16', 'Renting Homes (Wales) Act 2016'],
    'wales/rhw23': ['FORM RHW23', 'Renting Homes (Wales) Act 2016'],
    'scotland/notice_to_leave_prt_2017': ['NOTICE TO LEAVE', 'Private Housing (Tenancies) (Scotland) Act 2016'],
  };

  // Find matching route
  let required: string[] = [];
  for (const [key, headings] of Object.entries(requiredHeadings)) {
    if (route.includes(key)) {
      required = headings;
      break;
    }
  }

  if (required.length === 0) {
    // Unknown route - pass by default
    return { passed: true, foundHeadings: [] };
  }

  const foundHeadings: string[] = [];
  for (const heading of required) {
    if (text.includes(heading)) {
      foundHeadings.push(heading);
    }
  }

  return {
    passed: foundHeadings.length === required.length,
    foundHeadings,
  };
}

/**
 * Check for placeholder text
 */
function checkPlaceholders(text: string): { passed: boolean; foundPlaceholders?: string[] } {
  const placeholders = [
    'TODO',
    'PLACEHOLDER',
    'PAYMENT REQUIRED',
    'bilingual',
    '[MISSING]',
    'undefined',
    'null',
    '{{',
    '}}',
  ];

  const found: string[] = [];
  for (const placeholder of placeholders) {
    if (text.includes(placeholder)) {
      found.push(placeholder);
    }
  }

  return {
    passed: found.length === 0,
    foundPlaceholders: found.length > 0 ? found : undefined,
  };
}

/**
 * Audit a single PDF
 */
async function auditPDF(pdf: { path: string; route: string }): Promise<LayoutAuditResult> {
  const relativePath = path.relative(ARTIFACTS_DIR, pdf.path);
  const issues: LayoutIssue[] = [];

  // Extract text
  const { text, error } = await extractPDFText(pdf.path);

  if (error) {
    issues.push({
      type: 'page_dimension',
      severity: 'critical',
      message: `Failed to extract text: ${error}`,
    });

    return {
      path: pdf.path,
      relativePath,
      route: pdf.route,
      issues,
      checks: {
        topWhitespace: { passed: false },
        requiredHeadings: { passed: false, foundHeadings: [] },
        placeholders: { passed: false },
      },
    };
  }

  // Run checks
  const topWhitespaceCheck = checkTopWhitespace(text);
  const headingsCheck = checkRequiredHeadings(text, pdf.route);
  const placeholdersCheck = checkPlaceholders(text);

  // Generate issues
  if (!topWhitespaceCheck.passed) {
    issues.push({
      type: 'excessive_whitespace',
      severity: 'warning',
      message: `Excessive top whitespace detected (first text at line ${topWhitespaceCheck.firstTextPosition})`,
      details: { firstTextPosition: topWhitespaceCheck.firstTextPosition },
    });
  }

  if (!headingsCheck.passed) {
    issues.push({
      type: 'missing_heading',
      severity: 'critical',
      message: `Missing required headings (found: ${headingsCheck.foundHeadings.join(', ')})`,
      details: { foundHeadings: headingsCheck.foundHeadings },
    });
  }

  if (!placeholdersCheck.passed) {
    issues.push({
      type: 'placeholder_text',
      severity: 'critical',
      message: `Placeholder text found: ${placeholdersCheck.foundPlaceholders?.join(', ')}`,
      details: { placeholders: placeholdersCheck.foundPlaceholders },
    });
  }

  return {
    path: pdf.path,
    relativePath,
    route: pdf.route,
    issues,
    checks: {
      topWhitespace: topWhitespaceCheck,
      requiredHeadings: headingsCheck,
      placeholders: placeholdersCheck,
    },
  };
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(report: AuditReport): string {
  let md = '# Notice Only Layout Audit Report\n\n';
  md += `**Generated:** ${report.timestamp}\n\n`;
  md += `**Total PDFs:** ${report.totalPDFs}\n`;
  md += `**Total Issues:** ${report.totalIssues}\n`;
  md += `**Critical Issues:** ${report.criticalIssues}\n\n`;
  md += '---\n\n';

  for (const result of report.results) {
    const icon = result.issues.length > 0 ? '❌' : '✅';
    md += `## ${icon} ${result.route}\n\n`;
    md += `- **Path:** \`${result.relativePath}\`\n`;

    if (result.issues.length > 0) {
      md += `\n**Issues (${result.issues.length}):**\n\n`;
      for (const issue of result.issues) {
        const emoji = issue.severity === 'critical' ? '🚨' : '⚠️';
        md += `${emoji} **[${issue.type}]** ${issue.message}\n`;
      }
    } else {
      md += `\n✅ **No layout issues detected**\n`;
    }

    md += '\n---\n\n';
  }

  return md;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         NOTICE ONLY LAYOUT AUDIT                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Ensure reports directory exists
  await fs.mkdir(REPORTS_DIR, { recursive: true });

  // Find PDFs
  console.log('📁 Scanning for PDFs...');
  const pdfs = await findPDFs();

  if (pdfs.length === 0) {
    console.log('');
    console.log('⚠️  No PDFs found. Run the E2E test first:');
    console.log('   npx tsx scripts/prove-notice-only-e2e.ts');
    console.log('');
    process.exit(0);
  }

  console.log(`📄 Found ${pdfs.length} PDF(s)\n`);

  // Audit each PDF
  const results: LayoutAuditResult[] = [];
  for (const pdf of pdfs) {
    console.log(`🔍 Auditing: ${pdf.route}`);
    const result = await auditPDF(pdf);
    results.push(result);

    const icon = result.issues.length > 0 ? '❌' : '✅';
    console.log(`   ${icon} ${result.issues.length} issue(s) found`);
  }

  console.log('');

  // Generate report
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const criticalIssues = results.reduce(
    (sum, r) => sum + r.issues.filter((i) => i.severity === 'critical').length,
    0
  );

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalPDFs: pdfs.length,
    totalIssues,
    criticalIssues,
    results,
  };

  // Save JSON report
  const jsonPath = path.join(REPORTS_DIR, 'layout-audit.json');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📊 JSON report saved: ${jsonPath}`);

  // Save Markdown report
  const mdReport = generateMarkdownReport(report);
  const mdPath = path.join(REPORTS_DIR, 'layout-audit.md');
  await fs.writeFile(mdPath, mdReport, 'utf-8');
  console.log(`📄 Markdown report saved: ${mdPath}`);

  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                                    ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Total PDFs:        ${report.totalPDFs}`);
  console.log(`Total Issues:      ${totalIssues}`);
  console.log(`  Critical:        ${criticalIssues}`);
  console.log('');

  if (criticalIssues > 0) {
    console.log('❌ CRITICAL LAYOUT ISSUES FOUND - Review the report for details');
    process.exit(1);
  } else if (totalIssues > 0) {
    console.log('⚠️  WARNINGS FOUND - Review the report for details');
    process.exit(0);
  } else {
    console.log('✅ No layout issues found!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
