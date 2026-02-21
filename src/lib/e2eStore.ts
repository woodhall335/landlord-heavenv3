import { randomUUID } from 'node:crypto';

export type E2ESeedProduct = 'money_claim' | 'notice_only' | 'complete_pack' | 'tenancy_agreement';
export type E2ESeedJurisdiction = 'england' | 'wales' | 'scotland' | 'northern_ireland';

type E2ECaseRecord = {
  id: string;
  case_type: 'money_claim' | 'eviction' | 'tenancy_agreement';
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  status: 'draft';
  collected_facts: Record<string, unknown>;
  recommended_route: string | null;
  recommended_grounds: string[];
  created_at: string;
};

type E2EStoreState = Map<string, E2ECaseRecord>;

const e2eStoreSymbol = Symbol.for('landlord-heaven.e2eStore');

function getStore(): E2EStoreState {
  const globalWithStore = globalThis as typeof globalThis & { [e2eStoreSymbol]?: E2EStoreState };
  if (!globalWithStore[e2eStoreSymbol]) {
    globalWithStore[e2eStoreSymbol] = new Map<string, E2ECaseRecord>();
  }
  return globalWithStore[e2eStoreSymbol]!;
}

export function e2eEnabled(): boolean {
  return process.env.E2E_MODE === 'true';
}

function toCaseType(product: E2ESeedProduct): E2ECaseRecord['case_type'] {
  if (product === 'tenancy_agreement') return 'tenancy_agreement';
  if (product === 'money_claim') return 'money_claim';
  return 'eviction';
}

function normalizeJurisdiction(input: E2ESeedJurisdiction): E2ECaseRecord['jurisdiction'] {
  if (input === 'northern_ireland') return 'northern-ireland';
  return input;
}

function defaultFacts(product: E2ESeedProduct, jurisdiction: E2ECaseRecord['jurisdiction']) {
  return {
    __meta: {
      product,
      flow: product,
      seeded_by: 'api/e2e/seed-case',
    },
    selected_notice_route: product === 'notice_only' || product === 'complete_pack' ? 'section_8' : undefined,
    jurisdiction,
  };
}

export function seedCase(input: { product: E2ESeedProduct; jurisdiction: E2ESeedJurisdiction }): string {
  if (!e2eEnabled()) {
    throw new Error('E2E mode is disabled');
  }

  const id = randomUUID();
  const jurisdiction = normalizeJurisdiction(input.jurisdiction);

  const record: E2ECaseRecord = {
    id,
    case_type: toCaseType(input.product),
    jurisdiction,
    status: 'draft',
    collected_facts: defaultFacts(input.product, jurisdiction),
    recommended_route:
      input.product === 'notice_only' || input.product === 'complete_pack' ? 'section_8' : null,
    recommended_grounds:
      input.product === 'notice_only' || input.product === 'complete_pack' ? ['ground_8'] : [],
    created_at: new Date().toISOString(),
  };

  getStore().set(id, record);
  return id;
}

export function getCase(caseId: string): E2ECaseRecord | null {
  if (!e2eEnabled()) {
    return null;
  }

  return getStore().get(caseId) ?? null;
}
