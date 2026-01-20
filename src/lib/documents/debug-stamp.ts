/**
 * Debug Stamp Utilities
 *
 * Adds debug information to generated PDFs for tracing generation source.
 * Only active in development mode (NODE_ENV !== 'production').
 *
 * Debug stamp includes:
 * - Git commit SHA
 * - Generator name (e.g., eviction-pack-generator.ts)
 * - Template file name(s) used
 * - Case ID
 */

import { execSync } from 'child_process';

// ============================================================================
// GIT SHA RETRIEVAL
// ============================================================================

let cachedGitSha: string | null = null;

/**
 * Get the current git commit SHA.
 * Cached for performance (won't change during a single process run).
 */
export function getGitSha(): string {
  if (cachedGitSha) {
    return cachedGitSha;
  }

  try {
    cachedGitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    return cachedGitSha;
  } catch (error) {
    console.warn('[DEBUG_STAMP] Could not retrieve git SHA:', error);
    cachedGitSha = 'unknown';
    return cachedGitSha;
  }
}

/**
 * Get short git SHA (first 7 characters).
 */
export function getGitShaShort(): string {
  return getGitSha().substring(0, 7);
}

// ============================================================================
// DEBUG STAMP CONFIGURATION
// ============================================================================

export interface DebugStampInfo {
  gitSha: string;
  gitShaShort: string;
  generatorName: string;
  templateFiles: string[];
  caseId: string;
  generatedAt: string;
}

/**
 * Check if debug stamps should be added to PDFs.
 * Only enabled in development/test environments.
 */
export function isDebugStampEnabled(): boolean {
  // Enable in dev, test, or when explicitly enabled
  return (
    process.env.NODE_ENV !== 'production' ||
    process.env.PDF_DEBUG_STAMP === '1' ||
    process.env.DEBUG_PDF === '1'
  );
}

/**
 * Build debug stamp information.
 */
export function buildDebugStampInfo(params: {
  generatorName: string;
  templateFiles: string[];
  caseId?: string;
}): DebugStampInfo {
  const { generatorName, templateFiles, caseId } = params;

  return {
    gitSha: getGitSha(),
    gitShaShort: getGitShaShort(),
    generatorName,
    templateFiles,
    caseId: caseId || 'unknown',
    generatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// HTML DEBUG FOOTER INJECTION
// ============================================================================

/**
 * CSS styles for debug footer.
 */
const DEBUG_FOOTER_STYLES = `
  .debug-stamp-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #f0f0f0;
    border-top: 1px solid #ccc;
    padding: 4px 8px;
    font-family: monospace;
    font-size: 7pt;
    color: #666;
    z-index: 9999;
    page-break-inside: avoid;
  }
  .debug-stamp-footer .sha { color: #0066cc; font-weight: bold; }
  .debug-stamp-footer .generator { color: #006600; }
  .debug-stamp-footer .template { color: #660066; }
  .debug-stamp-footer .case-id { color: #cc6600; }
  @media print {
    .debug-stamp-footer {
      position: fixed;
      bottom: 5mm;
      left: 10mm;
      right: 10mm;
    }
  }
`;

/**
 * Generate debug footer HTML.
 */
export function generateDebugFooterHtml(info: DebugStampInfo): string {
  const templateList = info.templateFiles.length > 0
    ? info.templateFiles.join(', ')
    : 'N/A';

  return `
<style>${DEBUG_FOOTER_STYLES}</style>
<div class="debug-stamp-footer">
  <span class="sha">SHA: ${info.gitShaShort}</span> |
  <span class="generator">Gen: ${info.generatorName}</span> |
  <span class="template">Templates: ${templateList}</span> |
  <span class="case-id">Case: ${info.caseId}</span> |
  Generated: ${info.generatedAt}
</div>
`;
}

/**
 * Inject debug footer into HTML content.
 * Inserts before </body> if present, otherwise appends to end.
 */
export function injectDebugFooter(html: string, info: DebugStampInfo): string {
  if (!isDebugStampEnabled()) {
    return html;
  }

  const footerHtml = generateDebugFooterHtml(info);

  // Try to inject before </body>
  if (html.toLowerCase().includes('</body>')) {
    return html.replace(/<\/body>/i, `${footerHtml}</body>`);
  }

  // Fallback: append to end
  return html + footerHtml;
}

/**
 * Convenience function to inject debug stamp with common parameters.
 */
export function addDebugStampToHtml(
  html: string,
  params: {
    generatorName: string;
    templateFiles: string[];
    caseId?: string;
  }
): string {
  if (!isDebugStampEnabled()) {
    return html;
  }

  const info = buildDebugStampInfo(params);
  return injectDebugFooter(html, info);
}

// ============================================================================
// DEBUG LOGGING FOR ARREARS
// ============================================================================

export interface ArrearsDebugLog {
  timestamp: string;
  caseId: string;
  wizardFactsPaths: {
    'wizardFacts.arrears.total_arrears': number | null | undefined;
    'wizardFacts.total_arrears': number | null | undefined;
    'wizardFacts.arrears_total': number | null | undefined;
    'wizardFacts.issues.rent_arrears.total_arrears': number | null | undefined;
    'evictionCase.total_arrears': number | null | undefined;
    'evictionCase.current_arrears': number | null | undefined;
  };
  arrearsScheduleData: {
    total: number;
    itemCount: number;
    isAuthoritative: boolean;
  } | null;
  finalComputedValue: number | null | undefined;
  sourceUsed: string;
}

/**
 * Log arrears data paths for debugging.
 */
export function logArrearsDebug(params: {
  caseId: string;
  wizardFacts: any;
  evictionCase: any;
  arrearsScheduleData?: {
    total: number;
    itemCount: number;
    isAuthoritative: boolean;
  } | null;
  finalValue: number | null | undefined;
  sourceUsed: string;
}): ArrearsDebugLog {
  const { caseId, wizardFacts, evictionCase, arrearsScheduleData, finalValue, sourceUsed } = params;

  const log: ArrearsDebugLog = {
    timestamp: new Date().toISOString(),
    caseId,
    wizardFactsPaths: {
      'wizardFacts.arrears.total_arrears': wizardFacts?.arrears?.total_arrears,
      'wizardFacts.total_arrears': wizardFacts?.total_arrears,
      'wizardFacts.arrears_total': wizardFacts?.arrears_total,
      'wizardFacts.issues.rent_arrears.total_arrears': wizardFacts?.issues?.rent_arrears?.total_arrears,
      'evictionCase.total_arrears': evictionCase?.total_arrears,
      'evictionCase.current_arrears': evictionCase?.current_arrears,
    },
    arrearsScheduleData,
    finalComputedValue: finalValue,
    sourceUsed,
  };

  console.log('[ARREARS_DEBUG]', JSON.stringify(log, null, 2));

  return log;
}

// ============================================================================
// VERIFY SHA
// ============================================================================

/**
 * Verify that the stamped SHA matches HEAD.
 * Throws an error if there's a mismatch (indicates deployment/cache issue).
 */
export function verifyShaMatchesHead(stampedSha: string): { matches: boolean; currentSha: string; stampedSha: string } {
  const currentSha = getGitSha();
  const matches = currentSha === stampedSha || currentSha.startsWith(stampedSha) || stampedSha.startsWith(currentSha.substring(0, 7));

  if (!matches) {
    console.error(`[SHA_MISMATCH] Stamped SHA (${stampedSha}) does not match current HEAD (${currentSha})`);
    console.error('[SHA_MISMATCH] This indicates a deployment/build cache issue!');
  }

  return {
    matches,
    currentSha,
    stampedSha,
  };
}
