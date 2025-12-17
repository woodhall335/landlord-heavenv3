#!/usr/bin/env tsx
/**
 * NOTICE ONLY PDF AUDIT SCRIPT
 *
 * Recursively scans artifacts/notice_only/ for all PDF files and performs:
 * 1. Text extraction (using pdfjs-dist)
 * 2. Issue detection:
 *    - Missing fields (dates, names, addresses)
 *    - Template leaks ({{, }}, undefined, null)
 *    - Jurisdiction contamination
 *    - Logic red flags (notice periods, deposit contradictions, etc.)
 *    - PHRASE_RULES enforcement (required & forbidden phrases)
 *    - Global forbidden patterns (all PDFs)
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
    | 'missing_required_phrase'
    | 'global_forbidden_pattern';
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
// PHRASE RULES (Task 2)
// ============================================================================

export const PHRASE_RULES: Record<
  string,
  {
    required: string[];
    forbidden: string[];
    forbiddenPatterns?: RegExp[];
    logicChecks?: Array<{
      name: string;
      test: (text: string) => boolean;
      message: string;
      severity: "warning" | "critical";
    }>;
  }
> = {
  "england/section_21": {
    required: [
      "Form 6A",
      "Section 21",
      "Housing Act 1988",
      "Service Instructions",
      "Service and Validity Checklist"
    ],
    forbidden: [
      "Renting Homes (Wales) Act 2016",
      "contract holder",
      "First-tier Tribunal",
      "NOTICE TO LEAVE",
      "Section 8",
      "Next Steps",
      "Compliance Checklist"
    ],
    forbiddenPatterns: [
      /\*{4,}/g, // ****
      /The first anniversary is:\s*\*{4,}/g
    ]
  },

  "england/section_8": {
    required: [
      "NOTICE SEEKING POSSESSION",
      "Housing Act 1988",
      "Section 8",
      "Service Instructions",
      "Service and Validity Checklist"
    ],
    forbidden: [
      "Form 6A",
      "Section 21",
      "Renting Homes (Wales) Act 2016",
      "contract holder",
      "First-tier Tribunal",
      "Next Steps",
      "Compliance Checklist"
    ],
    logicChecks: [
      {
        name: "ground_8_threshold",
        test: (text) =>
          text.includes("Ground 8") &&
          /Current arrears:\s*£0\.00/.test(text),
        message:
          "Ground 8 included but arrears show £0.00 — threshold not satisfied",
        severity: "warning"
      }
    ]
  },

  "wales/wales_section_173": {
    required: [
      "Renting Homes (Wales) Act 2016",
      "Section 173",
      "contract-holder",
      "Rent Smart Wales",
      "Service Instructions",
      "Service and Validity Checklist"
    ],
    forbidden: [
      "Housing Act 1988",
      "Form 6A",
      "Section 21",
      "NOTICE SEEKING POSSESSION",
      "Notice Type: Section 8",
      "Landlord Heaven Notice Only Pack | England",
      "Next Steps",
      "tenant",
      "assured shorthold"
    ],
    forbiddenPatterns: [
      /\bon or after:\s*($|\n)/gi
    ]
  },

  "wales/wales_fault_based": {
    required: [
      "Renting Homes (Wales) Act 2016",
      "contract-holder",
      "Rent Smart Wales",
      "Service Instructions",
      "Service and Validity Checklist"
    ],
    forbidden: [
      "Housing Act 1988",
      "Form 6A",
      "Section 21",
      "Notice Type: Section 8",
      "Landlord Heaven Notice Only Pack | England",
      "Next Steps",
      "tenant",
      "assured shorthold",
      "Section 173"
    ],
    forbiddenPatterns: [
      /\brent_arrears\b/g
    ]
  },

  "scotland/notice_to_leave": {
    required: [
      "NOTICE TO LEAVE",
      "Private Housing (Tenancies) (Scotland) Act 2016",
      "First-tier Tribunal",
      "Service Instructions",
      "Service and Validity Checklist"
    ],
    forbidden: [
      "Housing Act 1988",
      "Form 6A",
      "Section 21",
      "Renting Homes (Wales) Act 2016",
      "contract holder",
      "possession order",
      "Tribunal Process Guide",
      "Next Steps"
    ],
    forbiddenPatterns: [
      /Total arrears:\s*£\s*as of/gi,
      /Total owed:\s*£\s*$/gi
    ]
  }
};

// ============================================================================
// GLOBAL FORBIDDEN PATTERNS (Task 3)
// ============================================================================

const GLOBAL_FORBIDDEN_PATTERNS = [
  { pattern: /\{\{/g, message: 'Handlebars template leak ({{)' },
  { pattern: /\}\}/g, message: 'Handlebars template leak (}})' },
  { pattern: /\*{4,}/g, message: 'Placeholder asterisks (****)' },
  { pattern: /\bundefined\b/gi, message: 'JavaScript undefined leaked' },
  { pattern: /\bnull\b/gi, message: 'Null value leaked' },
  { pattern: /\[object\s+Object\]/gi, message: 'Object toString leak' },
  { pattern: /Property:\s*,(?:\s*,)?/gi, message: 'Empty property field (Property: , or Property: , ,)' },
  { pattern: /Tenant:\s*(?:\n|$)/gi, message: 'Tenant: followed by blank content' },
];

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
  'Service and Validity Checklist': /Service\s+(and|&)\s+Validity\s+Checklist/i,
  'Witness Statement': /Witness\s+Statement/i,
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
// PDF PARSING (Task 1 - Reliable extraction using pdfjs-dist)
// ============================================================================

async function extractPDFText(pdfPath: string): Promise<{ text: string; error?: string }> {
  try {
    const pdfBuffer = await fs.readFile(pdfPath);

    // Validate PDF header
    const header = pdfBuffer.slice(0, 5).toString('utf-8');
    if (!header.startsWith('%PDF-')) {
      return { text: '', error: 'Invalid PDF header' };
    }

    // Try pdfjs-dist with canvas factory for Node
    try {
      // Import canvas for Node.js compatibility
      const { createCanvas } = await import('canvas');
      const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

      // Set up canvas factory for Node.js environment
      class NodeCanvasFactory {
        create(width: number, height: number) {
          const canvas = createCanvas(width, height);
          const context = canvas.getContext('2d');
          return { canvas, context };
        }
        reset(canvasAndContext: any, width: number, height: number) {
          canvasAndContext.canvas.width = width;
          canvasAndContext.canvas.height = height;
        }
        destroy(canvasAndContext: any) {
          canvasAndContext.canvas.width = 0;
          canvasAndContext.canvas.height = 0;
          canvasAndContext.canvas = null;
          canvasAndContext.context = null;
        }
      }

      // Disable worker (not needed for text extraction in Node)
      // Use empty string or null to disable worker completely
      if (!(pdfjsLib as any).GlobalWorkerOptions.workerSrc) {
        (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '';
      }

      // Load the PDF document with canvas factory
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useSystemFonts: true,
        verbosity: 0,
        canvasFactory: new NodeCanvasFactory() as any,
        useWorkerFetch: false,
        isEvalSupported: false,
      });

      const pdf = await loadingTask.promise;
      const textParts: string[] = [];

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Concatenate all text items
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');

        textParts.push(pageText);
      }

      const fullText = textParts.join('\n');
      return { text: fullText };

    } catch (pdfjsError: unknown) {
      // pdfjs failed - only try pdf-parse if it's available and callable
      try {
        const pdfParse = await tryLoadPdfParse();
        if (!pdfParse) {
          const pdfjsMsg = pdfjsError instanceof Error ? pdfjsError.message : String(pdfjsError);
          return { text: '', error: `pdfjs-dist failed (${pdfjsMsg}); pdf-parse not available` };
        }

        const result = await pdfParse(pdfBuffer);
        return { text: String(result?.text ?? '') };

      } catch (parseError: unknown) {
        const pdfjsMsg = pdfjsError instanceof Error ? pdfjsError.message : String(pdfjsError);
        const parseMsg = parseError instanceof Error ? parseError.message : String(parseError);
        return {
          text: '',
          error: `pdfjs-dist failed: ${pdfjsMsg}; pdf-parse failed: ${parseMsg}`
        };
      }
    }

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { text: '', error: `File read failed: ${msg}` };
  }
}

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

function detectGlobalForbiddenPatterns(text: string): PDFIssue[] {
  const issues: PDFIssue[] = [];

  for (const { pattern, message } of GLOBAL_FORBIDDEN_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const snippet = extractSnippet(text, match.index ?? 0);
      issues.push({
        type: 'global_forbidden_pattern',
        severity: 'critical',
        message,
        snippet,
      });
    }
  }

  return issues;
}

function detectPhraseRuleViolations(
  text: string,
  jurisdiction: string,
  noticeType: string
): PDFIssue[] {
  const issues: PDFIssue[] = [];
  const ruleKey = `${jurisdiction}/${noticeType}`;
  const rules = PHRASE_RULES[ruleKey];

  if (!rules) return issues;

  // Check required phrases
  for (const phrase of rules.required) {
    if (!text.includes(phrase)) {
      issues.push({
        type: 'missing_required_phrase',
        severity: 'critical',
        message: `Missing required phrase: "${phrase}"`,
      });
    }
  }

  // Check forbidden phrases
  for (const phrase of rules.forbidden) {
    if (text.includes(phrase)) {
      const index = text.indexOf(phrase);
      const snippet = extractSnippet(text, index);
      issues.push({
        type: 'forbidden_phrase',
        severity: 'critical',
        message: `Found forbidden phrase: "${phrase}"`,
        snippet,
      });
    }
  }

  // Check forbidden patterns
  if (rules.forbiddenPatterns) {
    for (const pattern of rules.forbiddenPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const snippet = extractSnippet(text, match.index ?? 0);
        issues.push({
          type: 'forbidden_phrase',
          severity: 'critical',
          message: `Found forbidden pattern: ${pattern.toString()}`,
          snippet,
        });
      }
    }
  }

  // Run logic checks
  if (rules.logicChecks) {
    for (const check of rules.logicChecks) {
      if (check.test(text)) {
        issues.push({
          type: 'logic_red_flag',
          severity: check.severity,
          message: check.message,
        });
      }
    }
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
      severity: 'critical',
      message: `Text extraction failed: ${error}`,
    });
  }

  const detectedTemplates = extractionSuccess ? detectTemplates(text) : [];

  // Run issue detection if extraction succeeded
  if (extractionSuccess && text) {
    issues.push(...detectGlobalForbiddenPatterns(text));
    issues.push(...detectPhraseRuleViolations(text, jurisdiction, noticeType));
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
    const criticalCount = result.issues.filter(i => i.severity === 'critical').length;
    const icon = criticalCount > 0 ? '❌' : issueCount > 0 ? '⚠️ ' : '✅';
    console.log(`   ${icon} ${issueCount} issue(s) found (${criticalCount} critical)`);
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

  // Task 5: Exit non-zero on critical issues
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
