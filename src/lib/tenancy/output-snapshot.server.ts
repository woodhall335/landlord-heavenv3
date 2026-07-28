import 'server-only';

import { createHash } from 'node:crypto';

export const TENANCY_SNAPSHOT_SCHEMA_VERSION = 'tenancy-output-snapshot.v1';
export const TENANCY_SNAPSHOT_SOURCE_VERSION = '2026-07-27';

export interface TenancyOutputSnapshot {
  id: string;
  order_id: string;
  case_id: string;
  user_id: string;
  product_type: string;
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland';
  schema_version: string;
  source_version: string;
  wizard_answers: Record<string, unknown>;
  derived_fields: Record<string, unknown>;
  clause_decisions: Record<string, unknown>;
  attachment_states: Record<string, unknown>;
  entitlement_reference: string;
  content_sha256: string;
  created_at: string;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)])
    );
  }
  return value;
}

export function hashTenancySnapshotPayload(payload: Record<string, unknown>): string {
  return createHash('sha256')
    .update(JSON.stringify(stableValue(payload)))
    .digest('hex');
}

function payloadForHash(snapshot: Omit<TenancyOutputSnapshot, 'id' | 'created_at' | 'content_sha256'>) {
  return {
    order_id: snapshot.order_id,
    case_id: snapshot.case_id,
    user_id: snapshot.user_id,
    product_type: snapshot.product_type,
    jurisdiction: snapshot.jurisdiction,
    schema_version: snapshot.schema_version,
    source_version: snapshot.source_version,
    wizard_answers: snapshot.wizard_answers,
    derived_fields: snapshot.derived_fields,
    clause_decisions: snapshot.clause_decisions,
    attachment_states: snapshot.attachment_states,
    entitlement_reference: snapshot.entitlement_reference,
  };
}

export function assertTenancySnapshotInputConsistency(input: {
  productType: string;
  jurisdiction: TenancyOutputSnapshot['jurisdiction'];
  wizardAnswers: Record<string, unknown>;
}): void {
  const answerJurisdiction = input.wizardAnswers.jurisdiction;
  if (
    typeof answerJurisdiction === 'string' &&
    answerJurisdiction !== input.jurisdiction
  ) {
    throw new Error(
      `Tenancy snapshot jurisdiction mismatch: case is ${input.jurisdiction}, answers are ${answerJurisdiction}`
    );
  }

  if (
    input.jurisdiction !== 'england' &&
    (input.productType === 'ast_premium' ||
      input.productType.endsWith('_premium') ||
      input.productType.startsWith('england_'))
  ) {
    throw new Error(
      `Tenancy snapshot product ${input.productType} is not available for ${input.jurisdiction}`
    );
  }

  const contractType = input.wizardAnswers.contract_type;
  if (
    input.jurisdiction !== 'wales' &&
    (contractType === 'fixed' || contractType === 'periodic')
  ) {
    throw new Error('Welsh occupation-contract type cannot be used outside Wales');
  }

  if (input.jurisdiction === 'wales') {
    if (contractType !== 'fixed' && contractType !== 'periodic') {
      throw new Error('Wales tenancy snapshot requires a fixed or periodic contract type');
    }

    const isFixedTerm = input.wizardAnswers.is_fixed_term;
    if (
      typeof isFixedTerm === 'boolean' &&
      isFixedTerm !== (contractType === 'fixed')
    ) {
      throw new Error('Wales contract type conflicts with the fixed-term wizard answer');
    }
  }
}

export async function getTenancyOutputSnapshotByOrderId(
  supabase: any,
  orderId: string
): Promise<TenancyOutputSnapshot | null> {
  const { data, error } = await supabase
    .from('tenancy_output_snapshots')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) throw new Error(`Unable to load tenancy output snapshot: ${error.message}`);
  return (data as TenancyOutputSnapshot | null) ?? null;
}

export async function createOrGetTenancyOutputSnapshot(
  supabase: any,
  input: {
    orderId: string;
    caseId: string;
    userId: string;
    productType: string;
    jurisdiction: TenancyOutputSnapshot['jurisdiction'];
    wizardAnswers: Record<string, unknown>;
    derivedFields?: Record<string, unknown>;
    clauseDecisions?: Record<string, unknown>;
    attachmentStates?: Record<string, unknown>;
  }
): Promise<TenancyOutputSnapshot> {
  assertTenancySnapshotInputConsistency(input);

  const hashPayload = {
    order_id: input.orderId,
    case_id: input.caseId,
    user_id: input.userId,
    product_type: input.productType,
    jurisdiction: input.jurisdiction,
    schema_version: TENANCY_SNAPSHOT_SCHEMA_VERSION,
    source_version: TENANCY_SNAPSHOT_SOURCE_VERSION,
    wizard_answers: stableValue(input.wizardAnswers),
    derived_fields: stableValue(input.derivedFields ?? {}),
    clause_decisions: stableValue(input.clauseDecisions ?? {}),
    attachment_states: stableValue(input.attachmentStates ?? {}),
    entitlement_reference: `order:${input.orderId}`,
  } as const;
  const contentSha256 = hashTenancySnapshotPayload(hashPayload);
  const existing = await getTenancyOutputSnapshotByOrderId(supabase, input.orderId);
  if (existing) {
    assertTenancyOutputSnapshotIntegrity(existing);
    if (existing.content_sha256 !== contentSha256) {
      throw new Error(
        'The answers changed after this checkout order was frozen; start a new checkout order'
      );
    }
    return existing;
  }

  const { data, error } = await supabase
    .from('tenancy_output_snapshots')
    .insert({ ...hashPayload, content_sha256: contentSha256 })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      const raced = await getTenancyOutputSnapshotByOrderId(supabase, input.orderId);
      if (raced) return raced;
    }
    throw new Error(`Unable to create tenancy output snapshot: ${error.message}`);
  }

  return data as TenancyOutputSnapshot;
}

export function assertTenancyOutputSnapshotIntegrity(snapshot: TenancyOutputSnapshot): void {
  const expectedHash = hashTenancySnapshotPayload(payloadForHash(snapshot));
  if (expectedHash !== snapshot.content_sha256) {
    throw new Error(`Tenancy output snapshot integrity check failed for order ${snapshot.order_id}`);
  }
  if (snapshot.entitlement_reference !== `order:${snapshot.order_id}`) {
    throw new Error(`Tenancy output snapshot entitlement mismatch for order ${snapshot.order_id}`);
  }
}
