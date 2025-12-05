/**
 * Law Monitor Module (READ-ONLY, Proposal-Only)
 *
 * Auto-monitors official legal sources and produces change suggestions.
 *
 * CRITICAL CONSTRAINTS:
 * - NEVER directly modifies decision_engine.yaml, MQS YAML, or templates
 * - Only produces snapshots and suggestions for human review
 * - All legal rule changes must be manual Git commits with legal review
 *
 * Phase 2.5 - Legal Change Framework
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SNAPSHOT_DIR = path.join(process.cwd(), 'data', 'law_snapshots');

// ============================================================================
// TYPES
// ============================================================================

export interface LawSource {
  id: string;              // e.g. 'ew_section21_guidance'
  jurisdiction: string;    // 'england-wales' | 'scotland' | 'northern-ireland'
  category: 'eviction' | 'tenancy' | 'procedure' | 'compliance';
  url: string;
  description: string;
}

export interface LawSnapshot {
  source_id: string;
  fetched_at: string;      // ISO date
  jurisdiction: string;
  category: string;
  raw_text: string;        // cleaned textual content
  hash: string;            // content hash for change detection
}

export interface LawChangeSuggestion {
  source_id: string;
  jurisdiction: string;
  category: string;
  summary: string;
  impact_area: 'decision_engine' | 'mqs' | 'templates' | 'docs';
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

// ============================================================================
// OFFICIAL LAW SOURCES REGISTRY
// ============================================================================

/**
 * Registry of official government and tribunal sources to monitor.
 * Add new sources here as needed, but keep them to authoritative sources only.
 */
export const OFFICIAL_LAW_SOURCES: LawSource[] = [
  // England & Wales - Eviction
  {
    id: 'ew_section21_guidance',
    jurisdiction: 'england-wales',
    category: 'eviction',
    url: 'https://www.gov.uk/evicting-tenants/section-21-and-section-8-notices',
    description: 'Gov.uk official guidance on Section 21 and Section 8 notices',
  },
  {
    id: 'ew_possession_procedure',
    jurisdiction: 'england-wales',
    category: 'procedure',
    url: 'https://www.gov.uk/possession-claim-online-recover-property',
    description: 'Gov.uk guidance on possession claims and court procedure',
  },
  {
    id: 'ew_deposit_protection',
    jurisdiction: 'england-wales',
    category: 'compliance',
    url: 'https://www.gov.uk/tenancy-deposit-protection',
    description: 'Gov.uk guidance on tenancy deposit protection schemes',
  },

  // Scotland - Eviction
  {
    id: 'scot_prt_guidance',
    jurisdiction: 'scotland',
    category: 'eviction',
    url: 'https://www.mygov.scot/private-residential-tenancies',
    description: 'MyGov Scotland guidance on Private Residential Tenancies',
  },
  {
    id: 'scot_tribunal_guidance',
    jurisdiction: 'scotland',
    category: 'procedure',
    url: 'https://www.housingandpropertychamber.scot/apply-tribunal/eviction',
    description: 'First-tier Tribunal Scotland eviction application guidance',
  },
  {
    id: 'scot_pre_action',
    jurisdiction: 'scotland',
    category: 'procedure',
    url: 'https://www.mygov.scot/landlord-pre-action-requirements',
    description: 'MyGov Scotland pre-action requirements for rent arrears',
  },
];

// ============================================================================
// SNAPSHOT FETCHING (STUB - TO BE IMPLEMENTED)
// ============================================================================

/**
 * Fetches content from an official law source and creates a snapshot.
 *
 * IMPORTANT: This is a STUB implementation for Phase 2.5 scaffolding.
 * Real implementation should:
 * - Use a proper HTTP client with retry logic
 * - Clean HTML to extract meaningful text content
 * - Handle rate limiting and respectful scraping
 * - Cache responses appropriately
 * - Handle errors gracefully
 *
 * TODO: Implement real HTTP fetching + HTML cleaning
 *
 * @param source - The law source to fetch
 * @returns Promise<LawSnapshot>
 */
export async function fetchLawSource(source: LawSource): Promise<LawSnapshot> {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent':
        'Landlord Heaven Law Monitor (compliance@landlordheaven.co.uk)',
      Accept: 'text/html,application/xhtml+xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const cleanedText = cleanHTML(html);

  const snapshot: LawSnapshot = {
    source_id: source.id,
    fetched_at: new Date().toISOString(),
    jurisdiction: source.jurisdiction,
    category: source.category,
    raw_text: cleanedText,
    hash: computeContentHash(cleanedText),
  };

  ensureSnapshotDir();
  const timestamp = snapshot.fetched_at.substring(0, 19).replace(/:/g, '-');
  const filename = `${source.id}-${timestamp}.json`;
  fs.writeFileSync(path.join(SNAPSHOT_DIR, filename), JSON.stringify(snapshot, null, 2), 'utf8');

  return snapshot;
}

/**
 * Compute SHA-256 hash of content for change detection.
 */
export function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function ensureSnapshotDir() {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
  }
}

function cleanHTML(html: string): string {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  const withoutStyles = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, '');
  const withBreaks = withoutStyles.replace(/<(p|br|li|div|section|h[1-6])[^>]*>/gi, '\n');
  const strippedTags = withBreaks.replace(/<[^>]+>/g, ' ');
  return strippedTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r?\n+/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

// ============================================================================
// CHANGE DETECTION & SUGGESTIONS (HEURISTIC ONLY)
// ============================================================================

/**
 * Compares a law snapshot with existing decision engine rules and
 * generates high-level suggestions for human review.
 *
 * IMPORTANT: This function ONLY returns suggestions.
 * It NEVER modifies any config files directly.
 *
 * The suggestions are heuristic and textual - they help humans identify
 * what might need updating, but all changes must be manual.
 *
 * @param snapshot - The fetched law snapshot
 * @param jurisdiction - The jurisdiction to check rules for
 * @returns Array of suggestions for human review
 */
export function compareSnapshotWithRules(
  snapshot: LawSnapshot,
  jurisdiction: string,
  previousSnapshot: LawSnapshot | null = null
): LawChangeSuggestion[] {
  const suggestions: LawChangeSuggestion[] = [];

  const normalizedCurrent = snapshot.raw_text.toLowerCase();
  const normalizedPrevious = previousSnapshot?.raw_text.toLowerCase() ?? '';

  // Heuristic 1: detect any hash change compared to previous snapshot
  if (previousSnapshot && snapshot.hash !== previousSnapshot.hash) {
    suggestions.push({
      source_id: snapshot.source_id,
      jurisdiction: snapshot.jurisdiction,
      category: snapshot.category,
      summary: 'Content hash changed since last snapshot',
      impact_area: 'docs',
      severity: 'medium',
      notes: 'Review source content and update decision engine/templates if necessary.',
    });
  }

  // Heuristic 2: detect added/removed lines
  if (previousSnapshot) {
    const currentLines = new Set(normalizedCurrent.split(/\n+/).map((l) => l.trim()).filter(Boolean));
    const previousLines = new Set(normalizedPrevious.split(/\n+/).map((l) => l.trim()).filter(Boolean));

    const additions = Array.from(currentLines).filter((line) => !previousLines.has(line));
    const removals = Array.from(previousLines).filter((line) => !currentLines.has(line));

    if (additions.length > 0) {
      suggestions.push({
        source_id: snapshot.source_id,
        jurisdiction: snapshot.jurisdiction,
        category: snapshot.category,
        summary: 'New content detected in source guidance',
        impact_area: 'decision_engine',
        severity: 'medium',
        notes: `Sample additions: ${additions.slice(0, 3).join(' | ')}`,
      });
    }

    if (removals.length > 0) {
      suggestions.push({
        source_id: snapshot.source_id,
        jurisdiction: snapshot.jurisdiction,
        category: snapshot.category,
        summary: 'Content removed since previous snapshot',
        impact_area: 'docs',
        severity: 'low',
        notes: `Sample removals: ${removals.slice(0, 3).join(' | ')}`,
      });
    }
  }

  // Heuristic 3: watch for new legal requirement phrasing
  if (normalizedCurrent.includes('new requirement')) {
    suggestions.push({
      source_id: snapshot.source_id,
      jurisdiction: snapshot.jurisdiction,
      category: snapshot.category,
      summary: 'Potential new legal requirement detected in guidance',
      impact_area: 'decision_engine',
      severity: 'high',
      notes: 'Manual review required to determine if decision engine rules need updating.',
    });
  }

  // Heuristic 4: notice periods
  if (snapshot.raw_text.match(/\d+\s+(days?|weeks?|months?)\s+notice/i)) {
    suggestions.push({
      source_id: snapshot.source_id,
      jurisdiction: snapshot.jurisdiction,
      category: snapshot.category,
      summary: 'Notice period information detected - verify against current rules',
      impact_area: 'decision_engine',
      severity: 'medium',
      notes: 'Check if notice period calculations in decision engine are still accurate.',
    });
  }

  // Heuristic 5: forms/procedure references
  if (normalizedCurrent.includes('form') && snapshot.category === 'procedure') {
    suggestions.push({
      source_id: snapshot.source_id,
      jurisdiction: snapshot.jurisdiction,
      category: snapshot.category,
      summary: 'Form or procedure information detected',
      impact_area: 'templates',
      severity: 'medium',
      notes: 'Verify that form templates match current official forms.',
    });
  }

  // Heuristic 6: Scotland pre-action requirements
  if (jurisdiction === 'scotland' && normalizedCurrent.includes('pre-action')) {
    suggestions.push({
      source_id: snapshot.source_id,
      jurisdiction: snapshot.jurisdiction,
      category: snapshot.category,
      summary: 'Pre-action requirements mentioned - verify compliance checks',
      impact_area: 'decision_engine',
      severity: 'high',
      notes: 'Scotland pre-action requirements are mandatory for Ground 1. Ensure decision engine checks are current.',
    });
  }

  // Heuristic 7: Deposit protection / fees
  if (jurisdiction === 'england-wales' && snapshot.category === 'compliance') {
    if (normalizedCurrent.includes('deposit') || normalizedCurrent.includes('tenancy fees')) {
      suggestions.push({
        source_id: snapshot.source_id,
        jurisdiction: snapshot.jurisdiction,
        category: snapshot.category,
        summary: 'Deposit or fee compliance information detected',
        impact_area: 'decision_engine',
        severity: 'medium',
        notes: 'Review Section 21 blocking conditions related to deposit protection and prescribed information.',
      });
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      source_id: snapshot.source_id,
      jurisdiction: snapshot.jurisdiction,
      category: snapshot.category,
      summary: 'No automatic changes detected by heuristics',
      impact_area: 'docs',
      severity: 'low',
      notes: 'Manual legal review still required. Heuristics may not catch all changes.',
    });
  }

  return suggestions;
}

/**
 * Load previous snapshot for comparison (if it exists).
 * This helps detect actual changes rather than just analyzing content.
 */
export function loadPreviousSnapshot(sourceId: string): LawSnapshot | null {
  if (!fs.existsSync(SNAPSHOT_DIR)) {
    return null;
  }

  const files = fs
    .readdirSync(SNAPSHOT_DIR)
    .filter((file) => file.startsWith(`${sourceId}-`) && file.endsWith('.json'))
    .sort();

  if (files.length === 0) return null;

  const latestFile = files[files.length - 1];
  const content = fs.readFileSync(path.join(SNAPSHOT_DIR, latestFile), 'utf8');
  try {
    return JSON.parse(content) as LawSnapshot;
  } catch (error) {
    console.error('Failed to parse previous snapshot', error);
    return null;
  }
}

/**
 * Detect if content has changed since last snapshot.
 */
export function hasContentChanged(
  current: LawSnapshot,
  previous: LawSnapshot | null
): boolean {
  if (!previous) return true; // First snapshot, treat as changed
  return current.hash !== previous.hash;
}
