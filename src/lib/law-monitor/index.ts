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
  // STUB: Real implementation would use fetch() or axios
  // For now, throw to make it clear this is not implemented
  throw new Error(
    `fetchLawSource not implemented – wiring for future use only.\n` +
    `To implement: fetch ${source.url}, clean HTML, extract text, and return snapshot.\n` +
    `This is intentionally left as a stub to prevent accidental auto-scraping without proper review.`
  );

  // Example implementation (commented out):
  /*
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Landlord Heaven Law Monitor (compliance@landlordheaven.co.uk)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}: ${response.statusText}`);
  }

  const html = await response.text();
  const cleaned_text = cleanHTML(html); // Extract meaningful text from HTML

  const snapshot: LawSnapshot = {
    source_id: source.id,
    fetched_at: new Date().toISOString(),
    jurisdiction: source.jurisdiction,
    category: source.category,
    raw_text: cleaned_text,
    hash: computeContentHash(cleaned_text),
  };

  return snapshot;
  */
}

/**
 * Compute SHA-256 hash of content for change detection.
 */
export function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
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
 * @param caseType - The case type (eviction, tenancy_agreement, etc.)
 * @returns Array of suggestions for human review
 */
export function compareSnapshotWithRules(
  snapshot: LawSnapshot,
  jurisdiction: string,
  caseType: string
): LawChangeSuggestion[] {
  const suggestions: LawChangeSuggestion[] = [];

  // TODO: Load current decision_engine.yaml for this jurisdiction
  // TODO: Parse existing rules and metadata
  // TODO: Compare with snapshot content using heuristics

  // Example heuristic checks (to be implemented):

  // 1. Check for new legal terminology
  if (snapshot.raw_text.toLowerCase().includes('new requirement')) {
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

  // 2. Check for changes to notice periods
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

  // 3. Check for form changes
  if (snapshot.raw_text.toLowerCase().includes('form') && snapshot.category === 'procedure') {
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

  // 4. Scotland-specific: Pre-action requirements
  if (jurisdiction === 'scotland' && snapshot.raw_text.toLowerCase().includes('pre-action')) {
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

  // 5. England & Wales: Deposit protection
  if (jurisdiction === 'england-wales' && snapshot.category === 'compliance') {
    if (snapshot.raw_text.toLowerCase().includes('deposit') ||
        snapshot.raw_text.toLowerCase().includes('tenancy fees')) {
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

  // If no heuristic suggestions triggered, add a generic note
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
 *
 * TODO: Implement snapshot storage and retrieval
 */
export function loadPreviousSnapshot(sourceId: string): LawSnapshot | null {
  // TODO: Load from data/law_snapshots/ directory
  // TODO: Parse JSON and return most recent snapshot for this source
  return null;
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
