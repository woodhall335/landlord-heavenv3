// src/lib/wizard/facts-client.ts

/**
 * Lightweight client helpers for loading / saving wizard facts
 * for use in the section-based Money Claim flow.
 *
 * These wrap your existing /api/wizard/case/[caseId] and /api/wizard/checkpoint routes.
 */

// What the checkpoint route needs (mirrors the route’s Zod schema)
type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement' | null;
type Jurisdiction = 'england-wales' | 'scotland' | 'northern-ireland' | null;
type Product = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement' | null;

interface SaveFactsMeta {
  jurisdiction: Jurisdiction;
  caseType: CaseType;
  product: Product;
}

// Load current facts for a wizard case
export async function getCaseFacts(caseId: string): Promise<any> {
  try {
    const res = await fetch(`/api/wizard/case/${encodeURIComponent(caseId)}`, {
      method: 'GET',
      credentials: 'include', // send cookies / session to Next API route
    });

    // Unauthenticated or missing case → treat as "no saved facts yet"
    if (res.status === 401 || res.status === 404) {
      console.info(
        '[wizard] No existing wizard case facts (status',
        res.status,
        ') – starting with empty facts'
      );
      return {};
    }

    if (!res.ok) {
      console.error('Failed to load wizard case:', res.status, res.statusText);
      throw new Error(`Failed to load wizard case (${res.status})`);
    }

    const data = await res.json();

    // Route returns { success, case }, but be tolerant if this changes
    const caseRow = data?.case ?? data;

    return (
      caseRow?.wizard_facts ||
      caseRow?.collected_facts ||
      caseRow?.facts ||
      caseRow?.case_facts ||
      {}
    );
  } catch (err) {
    // Network/unexpected error – log once and fall back to empty
    console.error('Error calling /api/wizard/case:', err);
    return {};
  }
}

// Save facts via /api/wizard/checkpoint, in the shape that route expects
export async function saveCaseFacts(
  caseId: string,
  facts: any,
  meta: SaveFactsMeta
): Promise<void> {
  const { jurisdiction, caseType, product } = meta;

  // Ensure __meta is populated for downstream generators / audit
  const enrichedFacts = {
    ...facts,
    __meta: {
      ...(facts?.__meta || {}),
      case_id: caseId,
      jurisdiction,
      case_type: caseType,
      product,
    },
  };

  try {
    const res = await fetch('/api/wizard/checkpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        facts: enrichedFacts,
        jurisdiction,
        case_type: caseType,
        product,
      }),
    });

    // Note: your checkpoint route does NOT enforce auth, so 401 here
    // would only happen if you later add auth middleware.
    if (res.status === 401) {
      console.warn(
        '[wizard] Unauthorized saving wizard checkpoint – likely unauthenticated. ' +
          'Changes will not be persisted.'
      );
      return;
    }

    if (!res.ok) {
      console.error(
        'Failed to save wizard checkpoint:',
        res.status,
        res.statusText
      );
      return;
    }

    // We don't actually care about the response body in the wizard UI,
    // but consume it to avoid unhandled promise rejections.
    try {
      await res.json();
    } catch {
      // ignore non-JSON responses
    }
  } catch (err) {
    console.error('Error calling /api/wizard/checkpoint:', err);
  }
}
