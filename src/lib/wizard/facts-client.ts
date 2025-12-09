// src/lib/wizard/facts-client.ts

/**
 * Lightweight client helpers for loading / saving wizard facts
 * for use in the section-based Money Claim flow.
 *
 * These wrap your existing /api/wizard/case/[id] and /api/wizard/checkpoint routes.
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
  const res = await fetch(`/api/wizard/case/${encodeURIComponent(caseId)}`, {
    method: 'GET',
  });

  if (!res.ok) {
    console.error('Failed to load wizard case:', res.status, res.statusText);
    throw new Error('Failed to load wizard case');
  }

  const data = await res.json();

  // The route returns { success, case }, with facts nested under case
  const caseRow = data?.case ?? data;

  return (
    caseRow?.wizard_facts ||
    caseRow?.collected_facts ||
    caseRow?.facts ||
    caseRow?.case_facts ||
    {}
  );
}

// Save facts via /api/wizard/checkpoint, in the shape that route expects
export async function saveCaseFacts(
  caseId: string,
  facts: any,
  meta: SaveFactsMeta
): Promise<void> {
  const { jurisdiction, caseType, product } = meta;

  // Make sure __meta is populated – this is useful later for generators
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
      body: JSON.stringify({
        facts: enrichedFacts,
        jurisdiction,
        case_type: caseType,
        product,
      }),
    });

    if (!res.ok) {
      console.error('Failed to save wizard checkpoint:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('Error calling /api/wizard/checkpoint:', err);
  }
}
