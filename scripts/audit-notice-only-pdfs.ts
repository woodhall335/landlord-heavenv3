#!/usr/bin/env tsx
/**
 * NOTICE ONLY PDF AUDIT SCRIPT
 *
 * Recursively scans artifacts/notice_only/**/*.pdf and performs:
 * 1. Text extraction (using pdf-parse)
 * 2. Issue detection:
 *    - Missing fields (dates, names, addresses)
 *    - Template leaks ({{, }}, undefined, null)
 *    - Jurisdiction contamination
 *    - Logic red flags (notice periods, deposit contradictions, etc.)
 * 3. Report generation (JSON + Markdown)
 *
 * Usage:
 *   npx tsx scripts/audit-notice-only-pdfs.ts
 *
 * Output:
 *   artifacts/notice_only/_reports/pdf-audit.json
 *   artifacts/notice_only/_reports/pdf-audit.md
 */

import fs from 'fs/promises';
import path from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface PDFIssue {
  type:
    | 'missing_field'
    | 'template_leak'
    | 'jurisdiction_contamination'
    | 'logic_red_flag'
    | 'forbidden_phrase'
    | 'missing_required_phrase';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  snippet?: string;
}

interface PDFAuditResult {
  path: string;
  relativePath: string;
  jurisdiction: string;
  noticeType: string;
  bytes: number;
  detectedTemplates: string[];
  extractionSuccess: boolean;
  extractionError?: string;
  issues: PDFIssue[];
  textSample?: string;
}

interface AuditReport {
  timestamp: string;
  totalPDFs: number;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  results: PDFAuditResult[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const ARTIFACTS_DIR = path.join(process.cwd(), 'artifacts', 'notice_only');
const REPORTS_DIR = path.join(ARTIFACTS_DIR, '_reports');

const MIN_PDF_SIZE = 5000; // 5KB minimum

// Template detection patterns
const TEMPLATE_PATTERNS = {
  'Form 6A': /Form\s+6A|Section\s+21\s+Notice/i,
  'Form 3': /Form\s+3|Section\s+8.*Notice/i,
  'Notice Seeking Possession': /Notice\s+Seeking\s+Possession/i,
  'Notice to Leave': /Notice\s+to\s+Leave/i,
  'Section 173': /Section\s+173|Landlord'?s\s+Notice/i,
  'Renting Homes (Wales) Act': /Renting\s+Homes.*Wales.*Act\s+2016/i,
  'Service Instructions': /Service\s+Instructions/i,
  'Compliance Checklist': /Compliance\s+Checklist/i,
  'Next Steps': /Next\s+Steps/i,
  'Tribunal Guide': /Tribunal.*Guide|First-tier\s+Tribunal/i,
  'Pre-Action': /Pre-Action\s+Requirements/i,
  'Witness Statement': /Witness\s+Statement/i,
};

// Missing field patterns
const MISSING_FIELD_PATTERNS = [
  { pattern: /as\s+of\s*:?\s*$/im, message: 'Missing date after "as of"' },
  { pattern: /on\s+or\s+after\s*:?\s*$/im, message: 'Missing date after "on or after"' },
  { pattern: /\*\*\*\*/g, message: 'Placeholder asterisks (****)' },
  { pattern: /\{\{/g, message: 'Handlebars template leak ({{)' },
  { pattern: /\}\}/g, message: 'Handlebars template leak (}})' },
  { pattern: /\bundefined\b/gi, message: 'JavaScript undefined leaked' },
  { pattern: /\bnull\b/gi, message: 'Null value leaked' },
  { pattern: /\[object\s+Object\]/gi, message: 'Object toString leak' },
  {
    pattern: /The\s+first\s+anniversary\s+is\s*:?\s*\*\*\*\*/i,
    message: 'Missing anniversary date',
  },
];

// Jurisdiction contamination patterns
const CONTAMINATION_PATTERNS = {
  england: {
    forbidden: [
      { pattern: /Renting\s+Homes.*Wales/i, phrase: 'Renting Homes (Wales) Act' },
      { pattern: /contract\s+holder/gi, phrase: 'contract holder' },
      { pattern: /occupation\s+contract/gi, phrase: 'occupation contract' },
      { pattern: /First-tier\s+Tribunal/i, phrase: 'First-tier Tribunal (Scotland)' },
      { pattern: /Private\s+Housing.*Scotland/i, phrase: 'Private Housing (Scotland) Act' },
    ],
  },
  wales: {
    forbidden: [
      { pattern: /Housing\s+Act\s+1988/i, phrase: 'Housing Act 1988' },
      { pattern: /Form\s+6A/i, phrase: 'Form 6A' },
      { pattern: /Form\s+3/i, phrase: 'Form 3' },
      { pattern: /assured\s+shorthold/gi, phrase: 'assured shorthold tenancy' },
      { pattern: /\btenant\b(?!\s+fees)/gi, phrase: 'tenant (should be contract holder)' },
    ],
  },
  scotland: {
    forbidden: [
      { pattern: /Housing\s+Act\s+1988/i, phrase: 'Housing Act 1988' },
      { pattern: /Form\s+6A/i, phrase: 'Form 6A' },
      { pattern: /Form\s+3/i, phrase: 'Form 3' },
      { pattern: /Section\s+21/i, phrase: 'Section 21' },
      { pattern: /Section\s+8.*Housing\s+Act/i, phrase: 'Section 8 (Housing Act)' },
      { pattern: /possession\s+order/gi, phrase: 'possession order (should be eviction order)' },
    ],
  },
};

// Required phrases by jurisdiction and notice type
const REQUIRED_PHRASES = {
  england: {
    section_8: [
      'NOTICE SEEKING POSSESSION',
      'Housing Act 1988',
      'Section 8',
      'Ground',
    ],
    section_21: ['Section 21', 'Housing Act 1988', 'two months'],
  },
  wales: {
    wales_section_173: [
      'Section 173',
      'Renting Homes (Wales) Act 2016',
      'contract holder',
    ],
    wales_fault_based: [
      'Renting Homes (Wales) Act 2016',
      'contract holder',
      'breach',
    ],
  },
  scotland: {
    notice_to_leave: [
      'NOTICE TO LEAVE',
      'Private Housing (Tenancies) (Scotland) Act 2016',
      'First-tier Tribunal',
    ],
  },
};

// ============================================================================
// FILE SCANNING
// ============================================================================

async function findPDFs(dir: string, results: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip _reports directory
    if (entry.name === '_reports') continue;

    if (entry.isDirectory()) {
      await findPDFs(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith('.pdf')) {
      results.push(fullPath);
    }
  }

  return results;
}

// ============================================================================
// PDF PARSING
// ============================================================================

async function tryLoadPdfParse(): Promise<((data: Buffer) => Promise<{ text?: string }>) | null> {
  try {
    const mod: any = await import('pdf-parse');

    // Try classic function export
    const fnCandidates = [mod?.default, mod, mod?.default?.default];
    const fn = fnCandidates.find((c) => typeof c === 'function');
    if (fn) {
      return async (data: Buffer) => fn(data);
    }

    // Try class export (PDFParse)
    if (typeof mod?.PDFParse === 'function') {
      return async (data: Buffer) => {
        const verbosity =
          mod?.VerbosityLevel?.ERRORS ??
          mod?.VerbosityLevel?.WARNINGS ??
          mod?.VerbosityLevel?.SILENT ??
          0;

        const parser = new mod.PDFParse({ verbosity });
        const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data);

        // Try getText with different input shapes
        if (typeof parser.getText === 'function') {
          const shapes = [uint8, data, { data: uint8 }, { data }, { buffer: uint8 }, { buffer: data }];

          for (const shape of shapes) {
            try {
              const result = await parser.getText(shape);
              return result;
            } catch {
              continue;
            }
          }
        }

        // Try load + getText pattern
        if (typeof parser.load === 'function' && typeof parser.getText === 'function') {
          const shapes = [uint8, data, { data: uint8 }, { data }];

          for (const shape of shapes) {
            try {
              await parser.load(shape);
              const result = await parser.getText();
              return result;
            } catch {
              continue;
            }
          }
        }

        throw new Error('PDFParse class found but no compatible method signature');
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function extractPDFText(pdfPath: string): Promise<{ text: string; error?: string }> {
  try {
    const pdfBuffer = await fs.readFile(pdfPath);

    // Validate PDF header
    const header = pdfBuffer.slice(0, 5).toString('utf-8');
    if (!header.startsWith('%PDF-')) {
      return { text: '', error: 'Invalid PDF header' };
    }

    // Try pdf-parse
    const pdfParse = await tryLoadPdfParse();
    if (!pdfParse) {
      return { text: '', error: 'pdf-parse not available' };
    }

    try {
      const result = await pdfParse(pdfBuffer);
      return { text: String(result?.text ?? '') };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { text: '', error: `pdf-parse failed: ${msg}` };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { text: '', error: `File read failed: ${msg}` };
  }
}

// ============================================================================
// ISSUE DETECTION
// ============================================================================

function detectTemplates(text: string): string[] {
  const detected: string[] = [];
  for (const [name, pattern] of Object.entries(TEMPLATE_PATTERNS)) {
    if (pattern.test(text)) {
      detected.push(name);
    }
  }
  return detected;
}

function detectMissingFields(text: string): PDFIssue[] {
  const issues: PDFIssue[] = [];

  for (const { pattern, message } of MISSING_FIELD_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const snippet = extractSnippet(text, match.index ?? 0);
      issues.push({
        type: 'missing_field',
        severity: 'critical',
        message,
        snippet,
      });
    }
  }

  return issues;
}

function detectJurisdictionContamination(
  text: string,
  jurisdiction: string
): PDFIssue[] {
  const issues: PDFIssue[] = [];
  const rules = CONTAMINATION_PATTERNS[jurisdiction as keyof typeof CONTAMINATION_PATTERNS];

  if (!rules) return issues;

  for (const { pattern, phrase } of rules.forbidden) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      const snippet = match ? extractSnippet(text, text.indexOf(match[0])) : undefined;
      issues.push({
        type: 'jurisdiction_contamination',
        severity: 'critical',
        message: `Found ${jurisdiction}-forbidden phrase: "${phrase}"`,
        snippet,
      });
    }
  }

  return issues;
}

function detectMissingRequiredPhrases(
  text: string,
  jurisdiction: string,
  noticeType: string
): PDFIssue[] {
  const issues: PDFIssue[] = [];
  const rules = REQUIRED_PHRASES[jurisdiction as keyof typeof REQUIRED_PHRASES];

  if (!rules) return issues;

  const required = rules[noticeType as keyof typeof rules];
  if (!required) return issues;

  for (const phrase of required) {
    if (!text.includes(phrase)) {
      issues.push({
        type: 'missing_required_phrase',
        severity: 'critical',
        message: `Missing required phrase: "${phrase}"`,
      });
    }
  }

  return issues;
}

function detectLogicRedFlags(text: string, jurisdiction: string, noticeType: string): PDFIssue[] {
  const issues: PDFIssue[] = [];

  // Section 21 notice period check
  if (noticeType === 'section_21') {
    if (text.match(/notice.*date.*possession.*date/is)) {
      // Try to extract dates and check if they're < 2 months apart
      // This is a heuristic - would need actual date parsing for accuracy
      if (text.match(/\b(1|2[0-9]|3[0-1])\s+days?\b/i)) {
        issues.push({
          type: 'logic_red_flag',
          severity: 'warning',
          message: 'Possible Section 21 notice period < 2 months',
        });
      }
    }
  }

  // Ground 8 arrears check
  if (noticeType === 'section_8' && text.includes('Ground 8')) {
    if (text.match(/arrears.*£0|£0.*arrears/i)) {
      issues.push({
        type: 'logic_red_flag',
        severity: 'critical',
        message: 'Ground 8 (serious arrears) included with £0 arrears',
      });
    }
  }

  // Deposit contradictions
  if (text.match(/deposit.*protected/i) && text.match(/no\s+deposit.*taken/i)) {
    issues.push({
      type: 'logic_red_flag',
      severity: 'warning',
      message: 'Contradictory deposit statements (protected + not taken)',
    });
  }

  return issues;
}

function extractSnippet(text: string, position: number, context: number = 50): string {
  const start = Math.max(0, position - context);
  const end = Math.min(text.length, position + context);
  let snippet = text.slice(start, end).trim();

  // Clean up whitespace
  snippet = snippet.replace(/\s+/g, ' ');

  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}

// ============================================================================
// AUDIT LOGIC
// ============================================================================

async function auditPDF(pdfPath: string): Promise<PDFAuditResult> {
  const relativePath = path.relative(ARTIFACTS_DIR, pdfPath);
  const parts = relativePath.split(path.sep);

  // Infer jurisdiction and notice type from path
  const jurisdiction = parts[0] || 'unknown';
  const filename = path.basename(pdfPath, '.pdf');
  const noticeType = filename;

  const stats = await fs.stat(pdfPath);
  const bytes = stats.size;

  const issues: PDFIssue[] = [];

  // Size check
  if (bytes < MIN_PDF_SIZE) {
    issues.push({
      type: 'missing_field',
      severity: 'critical',
      message: `PDF too small (${bytes} bytes) - likely generation error`,
    });
  }

  // Extract text
  const { text, error } = await extractPDFText(pdfPath);
  const extractionSuccess = !error;

  if (error) {
    issues.push({
      type: 'missing_field',
      severity: 'warning',
      message: `Text extraction failed: ${error}`,
    });
  }

  const detectedTemplates = extractionSuccess ? detectTemplates(text) : [];

  // Run issue detection if extraction succeeded
  if (extractionSuccess && text) {
    issues.push(...detectMissingFields(text));
    issues.push(...detectJurisdictionContamination(text, jurisdiction));
    issues.push(...detectMissingRequiredPhrases(text, jurisdiction, noticeType));
    issues.push(...detectLogicRedFlags(text, jurisdiction, noticeType));
  }

  // Get text sample for debugging
  const textSample = text ? text.slice(0, 500).replace(/\s+/g, ' ').trim() : undefined;

  return {
    path: pdfPath,
    relativePath,
    jurisdiction,
    noticeType,
    bytes,
    detectedTemplates,
    extractionSuccess,
    extractionError: error,
    issues,
    textSample,
  };
}

// ============================================================================
// REPORTING
// ============================================================================

function generateMarkdownReport(report: AuditReport): string {
  let md = '# Notice Only PDF Audit Report\n\n';
  md += `**Generated:** ${report.timestamp}\n\n`;
  md += `**Total PDFs:** ${report.totalPDFs}\n`;
  md += `**Total Issues:** ${report.totalIssues}\n`;
  md += `**Critical Issues:** ${report.criticalIssues}\n`;
  md += `**Warning Issues:** ${report.warningIssues}\n\n`;

  md += '---\n\n';

  // Group by jurisdiction
  const byJurisdiction = new Map<string, PDFAuditResult[]>();
  for (const result of report.results) {
    const list = byJurisdiction.get(result.jurisdiction) || [];
    list.push(result);
    byJurisdiction.set(result.jurisdiction, list);
  }

  for (const [jurisdiction, results] of byJurisdiction.entries()) {
    md += `## ${jurisdiction.toUpperCase()}\n\n`;

    for (const result of results) {
      const icon = result.issues.length > 0 ? '❌' : '✅';
      md += `### ${icon} ${result.noticeType}\n\n`;
      md += `- **Path:** \`${result.relativePath}\`\n`;
      md += `- **Size:** ${result.bytes} bytes\n`;
      md += `- **Extraction:** ${result.extractionSuccess ? '✅ Success' : '❌ Failed'}\n`;

      if (result.extractionError) {
        md += `- **Error:** ${result.extractionError}\n`;
      }

      if (result.detectedTemplates.length > 0) {
        md += `- **Detected Templates:** ${result.detectedTemplates.join(', ')}\n`;
      }

      if (result.issues.length > 0) {
        md += `\n**Issues (${result.issues.length}):**\n\n`;

        // Group by severity
        const critical = result.issues.filter((i) => i.severity === 'critical');
        const warnings = result.issues.filter((i) => i.severity === 'warning');

        if (critical.length > 0) {
          md += `#### 🚨 Critical Issues (${critical.length})\n\n`;
          for (const issue of critical) {
            md += `- **[${issue.type}]** ${issue.message}\n`;
            if (issue.snippet) {
              md += `  - Snippet: \`${issue.snippet}\`\n`;
            }
          }
          md += '\n';
        }

        if (warnings.length > 0) {
          md += `#### ⚠️ Warnings (${warnings.length})\n\n`;
          for (const issue of warnings) {
            md += `- **[${issue.type}]** ${issue.message}\n`;
            if (issue.snippet) {
              md += `  - Snippet: \`${issue.snippet}\`\n`;
            }
          }
          md += '\n';
        }
      } else {
        md += `\n✅ **No issues detected**\n\n`;
      }

      if (result.textSample) {
        md += `<details>\n<summary>Text Sample (first 500 chars)</summary>\n\n`;
        md += `\`\`\`\n${result.textSample}\n\`\`\`\n\n`;
        md += `</details>\n\n`;
      }

      md += '---\n\n';
    }
  }

  return md;
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         NOTICE ONLY PDF AUDIT                                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Ensure reports directory exists
  await fs.mkdir(REPORTS_DIR, { recursive: true });

  // Find all PDFs
  console.log(`📁 Scanning: ${ARTIFACTS_DIR}`);

  let pdfFiles: string[] = [];
  try {
    pdfFiles = await findPDFs(ARTIFACTS_DIR);
  } catch (e: unknown) {
    // Directory might not exist
    if ((e as any).code === 'ENOENT') {
      pdfFiles = [];
    } else {
      throw e;
    }
  }

  console.log(`📄 Found ${pdfFiles.length} PDF(s)\n`);

  if (pdfFiles.length === 0) {
    console.log('⚠️  No PDFs found. Run the E2E test first:');
    console.log('   npx tsx scripts/prove-notice-only-e2e.ts\n');
    process.exit(0);
  }

  // Audit each PDF
  const results: PDFAuditResult[] = [];

  for (const pdfPath of pdfFiles) {
    const relativePath = path.relative(ARTIFACTS_DIR, pdfPath);
    console.log(`🔍 Auditing: ${relativePath}`);

    const result = await auditPDF(pdfPath);
    results.push(result);

    const issueCount = result.issues.length;
    const icon = issueCount === 0 ? '✅' : issueCount < 3 ? '⚠️ ' : '❌';
    console.log(`   ${icon} ${issueCount} issue(s) found`);
  }

  console.log('');

  // Generate report
  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  const criticalIssues = results.reduce(
    (sum, r) => sum + r.issues.filter((i) => i.severity === 'critical').length,
    0
  );
  const warningIssues = results.reduce(
    (sum, r) => sum + r.issues.filter((i) => i.severity === 'warning').length,
    0
  );

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalPDFs: results.length,
    totalIssues,
    criticalIssues,
    warningIssues,
    results,
  };

  // Write JSON report
  const jsonPath = path.join(REPORTS_DIR, 'pdf-audit.json');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`📊 JSON report saved: ${jsonPath}`);

  // Write Markdown report
  const mdReport = generateMarkdownReport(report);
  const mdPath = path.join(REPORTS_DIR, 'pdf-audit.md');
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
  console.log(`  Warnings:        ${warningIssues}`);
  console.log('');

  if (criticalIssues > 0) {
    console.log('❌ CRITICAL ISSUES FOUND - Review the report for details');
    process.exit(1);
  } else if (warningIssues > 0) {
    console.log('⚠️  WARNINGS FOUND - Review the report for details');
    process.exit(0);
  } else {
    console.log('✅ No critical issues found!');
    process.exit(0);
  }
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error('Fatal error:', msg);
  process.exit(1);
});
