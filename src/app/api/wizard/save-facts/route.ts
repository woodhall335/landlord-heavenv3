// src/lib/wizard/facts-client.ts

/**
 * Lightweight client helpers for loading / saving wizard facts
 * for use in the section-based wizard flows (money claim, eviction, tenancy).
 *
 * - getCaseFacts: GET /api/wizard/case/[id]
 *   Returns whatever the API exposes, normalised to a facts object.
 *
 * - saveCaseFacts: POST /api/wizard/save-facts
 *   Pure persistence only – merges into cases.collected_facts on the server.
 *
 * The decision / analysis endpoint remains:
 *   POST /api/wizard/checkpoint
 * and should be called explicitly from places that need live analysis
 * (e.g. Ask Heaven, review panels), not on every keystroke.
 */

// These are still useful for callers that want to run checkpoint analysis.
export type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement' | null;
export type Jurisdiction = 'england-wales' | 'scotland' | 'northern-ireland' | null;
export type Product =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'tenancy_agreement'
  | null;

export interface SaveFactsMeta {
  jurisdiction: Jurisdiction;
  caseType: CaseType;
  product: Product;
}

/**
 * Load current facts for a wizard case
 */
export async function getCaseFacts(caseId: string): Promise<any> {
  const res = await fetch(`/api/wizard/case/${encodeURIComponent(caseId)}`, {
    method: 'GET',
  });

  if (!res.ok) {
    console.error('Failed to load wizard case:', res.status, res.statusText);
    throw new Error('Failed to load wizard case');
  }

  const data = await res.json();

  // The route may return either:
  // - { success, case: {...} }
  // - or the case row directly
  const caseRow = data?.case ?? data;

  return (
    caseRow?.wizard_facts ||
    caseRow?.collected_facts ||
    caseRow?.facts ||
    caseRow?.case_facts ||
    {}
  );
}

/**
 * Persist wizard facts.
 *
 * This hits /api/wizard/save-facts which:
 * - loads the case row
 * - deep-merges into collected_facts
 * - keeps __meta.case_id / __meta.jurisdiction coherent
 */
export async function saveCaseFacts(caseId: string, facts: any): Promise<void> {
  try {
    const res = await fetch('/api/wizard/save-facts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        case_id: caseId,
        facts,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        'Failed to save wizard facts:',
        res.status,
        res.statusText,
        text
      );
    }
  } catch (err) {
    console.error('Error calling /api/wizard/save-facts:', err);
  }
}

/**
 * Optional helper: run the decision-engine checkpoint explicitly.
 * Call this from places that want live legal analysis (e.g. Ask Heaven).
 */
export async function runCheckpoint(
  facts: any,
  meta: SaveFactsMeta
): Promise<any | null> {
  const { jurisdiction, caseType, product } = meta;

  if (!jurisdiction) {
    console.warn(
      'runCheckpoint called without jurisdiction – skipping checkpoint call.'
    );
    return null;
  }

  try {
    const res = await fetch('/api/wizard/checkpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        facts,
        jurisdiction,
        case_type: caseType,
        product,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(
        'Checkpoint call failed:',
        res.status,
        res.statusText,
        text
      );
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Error calling /api/wizard/checkpoint:', err);
    return null;
  }
}
