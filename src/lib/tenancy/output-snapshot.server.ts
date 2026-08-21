import 'server-only';

import { createHash } from 'node:crypto';
import { isResidentialLettingProductSku } from '@/lib/residential-letting/products';

export const TENANCY_SNAPSHOT_SCHEMA_VERSION = 'tenancy-output-snapshot.v1';
export const TENANCY_SNAPSHOT_SOURCE_VERSION = '2026-07-27';
export const TENANCY_SNAPSHOT_LEGACY_RECOVERY_SOURCE_VERSION =
  '2026-08-21-legacy-regeneration-recovery.v1';
export const TENANCY_SNAPSHOT_REGENERATION_SOURCE_VERSION =
  '2026-08-21-regeneration-revision.v1';

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
  revision_number: number;
  created_at: string;
}

export function isTenancyOutputProductSku(value: string): boolean {
  return (
    value === 'ast_standard' ||
    value === 'ast_premium' ||
    isResidentialLettingProductSku(value)
  );
}

export function toTenancyOutputSnapshotJurisdiction(
  value: unknown
): TenancyOutputSnapshot['jurisdiction'] {
  if (
    value === 'england' ||
    value === 'wales' ||
    value === 'scotland' ||
    value === 'northern-ireland'
  ) {
    return value;
  }

  throw new Error('Tenancy snapshot requires a valid case jurisdiction');
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
    .order('revision_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Unable to load tenancy output snapshot: ${error.message}`);
  return (data as TenancyOutputSnapshot | null) ?? null;
}

export async function getTenancyOutputSnapshotById(
  supabase: any,
  snapshotId: string
): Promise<TenancyOutputSnapshot | null> {
  const { data, error } = await supabase
    .from('tenancy_output_snapshots')
    .select('*')
    .eq('id', snapshotId)
    .maybeSingle();

  if (error) throw new Error(`Unable to load tenancy output snapshot: ${error.message}`);
  return (data as TenancyOutputSnapshot | null) ?? null;
}

export function doesTenancySnapshotMatchInput(
  snapshot: TenancyOutputSnapshot,
  input: {
    caseId: string;
    userId: string;
    productType: string;
    jurisdiction: TenancyOutputSnapshot['jurisdiction'];
    wizardAnswers: Record<string, unknown>;
  }
): boolean {
  return (
    snapshot.case_id === input.caseId &&
    snapshot.user_id === input.userId &&
    snapshot.product_type === input.productType &&
    snapshot.jurisdiction === input.jurisdiction &&
    JSON.stringify(stableValue(snapshot.wizard_answers)) ===
      JSON.stringify(stableValue(input.wizardAnswers))
  );
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
    sourceVersion?: string;
  }
): Promise<TenancyOutputSnapshot> {
  assertTenancySnapshotInputConsistency(input);

  const existing = await getTenancyOutputSnapshotByOrderId(supabase, input.orderId);
  if (existing) {
    assertTenancyOutputSnapshotIntegrity(existing);
    if (doesTenancySnapshotMatchInput(existing, input)) return existing;
  }

  return createTenancyOutputSnapshotRevision(supabase, input, existing?.revision_number ?? 0);
}

async function createTenancyOutputSnapshotRevision(
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
    sourceVersion?: string;
  },
  initialRevisionNumber: number
): Promise<TenancyOutputSnapshot> {
  let revisionNumber = initialRevisionNumber + 1;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const hashPayload = {
      order_id: input.orderId,
      case_id: input.caseId,
      user_id: input.userId,
      product_type: input.productType,
      jurisdiction: input.jurisdiction,
      schema_version: TENANCY_SNAPSHOT_SCHEMA_VERSION,
      source_version: input.sourceVersion || TENANCY_SNAPSHOT_SOURCE_VERSION,
      wizard_answers: stableValue(input.wizardAnswers),
      derived_fields: stableValue(input.derivedFields ?? {}),
      clause_decisions: stableValue(input.clauseDecisions ?? {}),
      attachment_states: stableValue(input.attachmentStates ?? {}),
      entitlement_reference: `order:${input.orderId}`,
    } as const;
    const contentSha256 = hashTenancySnapshotPayload(hashPayload);

    const { data, error } = await supabase
      .from('tenancy_output_snapshots')
      .insert({ ...hashPayload, revision_number: revisionNumber, content_sha256: contentSha256 })
      .select('*')
      .single();

    if (!error) return data as TenancyOutputSnapshot;

    if (error.code !== '23505') {
      throw new Error(`Unable to create tenancy output snapshot: ${error.message}`);
    }

    const latest = await getTenancyOutputSnapshotByOrderId(supabase, input.orderId);
    if (latest) {
      assertTenancyOutputSnapshotIntegrity(latest);
      if (doesTenancySnapshotMatchInput(latest, input)) return latest;
      revisionNumber = latest.revision_number + 1;
    }
  }

  throw new Error('Unable to create a unique tenancy output snapshot revision');
}

export async function ensureTenancyOutputSnapshotForRegeneration(
  supabase: any,
  input: {
    orderId: string;
    caseId: string;
    userId: string;
    productType: string;
    jurisdiction: TenancyOutputSnapshot['jurisdiction'];
    wizardAnswers: Record<string, unknown>;
    caseType?: string | null;
  }
): Promise<TenancyOutputSnapshot> {
  const existing = await getTenancyOutputSnapshotByOrderId(supabase, input.orderId);
  if (existing) {
    assertTenancyOutputSnapshotIntegrity(existing);
    return existing;
  }

  return createOrGetTenancyOutputSnapshot(supabase, {
    ...input,
    sourceVersion: TENANCY_SNAPSHOT_LEGACY_RECOVERY_SOURCE_VERSION,
    derivedFields: {
      case_type: input.caseType || null,
      snapshot_origin: 'legacy_regeneration_recovery',
    },
    clauseDecisions: {
      product_type: input.productType,
      jurisdiction: input.jurisdiction,
    },
    attachmentStates: {
      legacy_snapshot_backfilled_on_regeneration: true,
    },
  });
}

export async function prepareTenancyOutputSnapshotForRegeneration(
  supabase: any,
  input: {
    orderId: string;
    caseId: string;
    userId: string;
    productType: string;
    jurisdiction: TenancyOutputSnapshot['jurisdiction'];
    wizardAnswers: Record<string, unknown>;
    caseType?: string | null;
  }
): Promise<TenancyOutputSnapshot> {
  const existing = await getTenancyOutputSnapshotByOrderId(supabase, input.orderId);
  if (!existing) return ensureTenancyOutputSnapshotForRegeneration(supabase, input);

  assertTenancyOutputSnapshotIntegrity(existing);
  if (doesTenancySnapshotMatchInput(existing, input)) return existing;

  return createTenancyOutputSnapshotRevision(
    supabase,
    {
      ...input,
      sourceVersion: TENANCY_SNAPSHOT_REGENERATION_SOURCE_VERSION,
      derivedFields: {
        case_type: input.caseType || null,
        snapshot_origin: 'post_purchase_regeneration',
      },
      clauseDecisions: {
        product_type: input.productType,
        jurisdiction: input.jurisdiction,
      },
      attachmentStates: {
        regenerated_from_snapshot_id: existing.id,
      },
    },
    existing.revision_number
  );
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
