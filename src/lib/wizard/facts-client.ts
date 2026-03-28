// src/lib/wizard/facts-client.ts
import { getSessionTokenHeaders } from '@/lib/session-token';

/**
 * Lightweight client helpers for loading / saving wizard facts
 * for use in the section-based Money Claim flow.
 *
 * These wrap your existing /api/wizard/case/[caseId] and /api/wizard/checkpoint routes.
 */

// What the checkpoint route needs (mirrors the route's Zod schema)
type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement' | null;
type Jurisdiction = 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
// Product includes both core products and tenancy agreement tier variants
type Product =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'tenancy_agreement'
  | 'ast_standard'
  | 'ast_premium'
  | 'england_standard_tenancy_agreement'
  | 'england_premium_tenancy_agreement'
  | 'england_student_tenancy_agreement'
  | 'england_hmo_shared_house_tenancy_agreement'
  | 'england_lodger_agreement'
  | 'guarantor_agreement'
  | 'residential_sublet_agreement'
  | 'lease_amendment'
  | 'lease_assignment_agreement'
  | 'rent_arrears_letter'
  | 'repayment_plan_agreement'
  | 'residential_tenancy_application'
  | 'rental_inspection_report'
  | 'inventory_schedule_condition'
  | 'flatmate_agreement'
  | 'renewal_tenancy_agreement'
  | null;

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
      headers: getSessionTokenHeaders(),
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

// Save facts via /api/wizard/save-facts, which persists to the database
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
    const res = await fetch('/api/wizard/save-facts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getSessionTokenHeaders(),
      },
      credentials: 'include',
      body: JSON.stringify({
        case_id: caseId,
        facts: enrichedFacts,
      }),
    });

    if (res.status === 401) {
      console.warn(
        '[wizard] Unauthorized saving wizard facts – likely unauthenticated. ' +
          'Changes will not be persisted.'
      );
      return;
    }

    if (!res.ok) {
      console.error(
        'Failed to save wizard facts:',
        res.status,
        res.statusText
      );
      return;
    }

    // Consume response to avoid unhandled promise rejections
    try {
      await res.json();
    } catch {
      // ignore non-JSON responses
    }
  } catch (err) {
    console.error('Error calling /api/wizard/save-facts:', err);
  }
}
