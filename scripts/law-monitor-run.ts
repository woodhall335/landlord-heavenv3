#!/usr/bin/env ts-node
/**
 * Law Monitor CLI Script
 *
 * Fetches official legal sources, creates snapshots, and generates change reports.
 *
 * CRITICAL: This script NEVER modifies config files or deploys changes.
 * It only produces:
 * - JSON snapshots in data/law_snapshots/
 * - Markdown reports in docs/law-change-reports/
 *
 * Usage:
 *   npm run law-monitor
 *   OR
 *   ts-node scripts/law-monitor-run.ts
 *
 * Phase 2.5 - Legal Change Framework
 */

import {
  fetchLawSource,
  compareSnapshotWithRules,
  OFFICIAL_LAW_SOURCES,
  hasContentChanged,
  loadPreviousSnapshot,
  type LawSource,
  type LawSnapshot,
} from '../src/lib/law-monitor';
import fs from 'fs';
import path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SNAPSHOTS_DIR = path.join(process.cwd(), 'data', 'law_snapshots');
const REPORTS_DIR = path.join(process.cwd(), 'docs', 'law-change-reports');

// ============================================================================
// MAIN SCRIPT
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('Law Monitor - Official Source Tracking (READ-ONLY)');
  console.log('='.repeat(80));
  console.log();
  console.log('CRITICAL: This script does NOT modify any config files.');
  console.log('It only generates snapshots and reports for human review.');
  console.log();

  // Ensure output directories exist
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });

  const sources = OFFICIAL_LAW_SOURCES;
  console.log(`Monitoring ${sources.length} official law sources...`);
  console.log();

  for (const source of sources) {
    console.log(`[${source.id}] ${source.description}`);
    console.log(`  URL: ${source.url}`);
    console.log(`  Jurisdiction: ${source.jurisdiction}`);
    console.log(`  Category: ${source.category}`);

    try {
      // Fetch current snapshot
      console.log('  Fetching...');
      const snapshot = await fetchLawSource(source);

      // Load previous snapshot for comparison
      // TODO: Pass source.id when loadPreviousSnapshot is implemented
      const previousSnapshot = loadPreviousSnapshot();
      const changed = hasContentChanged(snapshot, previousSnapshot);

      if (changed) {
        console.log('  ✅ Content changed (or first fetch)');
      } else {
        console.log('  ⏭️  No changes detected since last fetch');
      }

      // Save snapshot
      const timestamp = snapshot.fetched_at.substring(0, 19).replace(/:/g, '-');
      const snapshotFilename = `${source.id}-${timestamp}.json`;
      const snapshotPath = path.join(SNAPSHOTS_DIR, snapshotFilename);

      fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf8');
      console.log(`  Snapshot saved: ${snapshotFilename}`);

      // Generate change suggestions
      const suggestions = compareSnapshotWithRules(
        snapshot,
        source.jurisdiction
      );

      // Generate Markdown report
      const reportFilename = `${source.id}-${timestamp}.md`;
      const reportPath = path.join(REPORTS_DIR, reportFilename);

      const markdown = generateMarkdownReport(source, snapshot, suggestions, changed);
      fs.writeFileSync(reportPath, markdown, 'utf8');

      console.log(`  Report generated: ${reportFilename}`);
      console.log(`  Suggestions: ${suggestions.length}`);
      console.log();
    } catch (err) {
      console.error(`  ❌ ERROR: ${err instanceof Error ? err.message : String(err)}`);
      console.log();
      continue;
    }
  }

  console.log('='.repeat(80));
  console.log('Law Monitor Complete');
  console.log('='.repeat(80));
  console.log();
  console.log(`Snapshots saved to: ${SNAPSHOTS_DIR}`);
  console.log(`Reports saved to: ${REPORTS_DIR}`);
  console.log();
  console.log('Next steps:');
  console.log('1. Review generated reports in docs/law-change-reports/');
  console.log('2. If changes detected, consult with legal team');
  console.log('3. Manually update config files as needed');
  console.log('4. Bump version in src/lib/law-profile/index.ts');
  console.log('5. Update metadata in decision_engine.yaml');
  console.log();
}

// ============================================================================
// REPORT GENERATION
// ============================================================================

function generateMarkdownReport(
  source: LawSource,
  snapshot: LawSnapshot,
  suggestions: any[],
  contentChanged: boolean
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# Law Change Report – ${source.id}`);
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');

  // Source info
  lines.push('## Source Information');
  lines.push('');
  lines.push(`- **URL:** ${source.url}`);
  lines.push(`- **Jurisdiction:** ${source.jurisdiction}`);
  lines.push(`- **Category:** ${source.category}`);
  lines.push(`- **Description:** ${source.description}`);
  lines.push(`- **Fetched at:** ${snapshot.fetched_at}`);
  lines.push(`- **Content hash:** \`${snapshot.hash}\``);
  lines.push('');

  // Change status
  lines.push('## Change Status');
  lines.push('');
  if (contentChanged) {
    lines.push('🔴 **CONTENT CHANGED** – Review required');
  } else {
    lines.push('🟢 **NO CHANGES DETECTED** – Content matches previous snapshot');
  }
  lines.push('');

  // Suggestions
  lines.push('## Suggested Areas to Review');
  lines.push('');

  if (suggestions.length === 0) {
    lines.push('- *No automated suggestions generated*');
  } else {
    for (const suggestion of suggestions) {
      const severityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢',
      }[suggestion.severity] || '⚪';

      lines.push(`### ${severityEmoji} ${suggestion.summary}`);
      lines.push('');
      lines.push(`- **Severity:** ${suggestion.severity.toUpperCase()}`);
      lines.push(`- **Impact Area:** ${suggestion.impact_area}`);
      lines.push(`- **Notes:** ${suggestion.notes}`);
      lines.push('');
    }
  }

  // Disclaimer
  lines.push('---');
  lines.push('');
  lines.push('## ⚠️ IMPORTANT DISCLAIMER');
  lines.push('');
  lines.push('**This report does NOT change any rules.**');
  lines.push('');
  lines.push('All changes must be:');
  lines.push('1. Reviewed by qualified legal professionals');
  lines.push('2. Manually applied to config files via Git commits');
  lines.push('3. Tested thoroughly before deployment');
  lines.push('4. Documented with version bumps and metadata updates');
  lines.push('');
  lines.push('Automated suggestions are heuristic and may produce false positives.');
  lines.push('Always verify against authoritative sources and seek legal counsel.');
  lines.push('');

  return lines.join('\n');
}

// ============================================================================
// RUN
// ============================================================================

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
