import { describe, expect, it } from 'vitest';
import {
  assertTenancyOutputSnapshotIntegrity,
  hashTenancySnapshotPayload,
  type TenancyOutputSnapshot,
} from '../output-snapshot.server';

function snapshot(): TenancyOutputSnapshot {
  const core = {
    order_id: '11111111-1111-4111-8111-111111111111',
    case_id: '22222222-2222-4222-8222-222222222222',
    user_id: '33333333-3333-4333-8333-333333333333',
    product_type: 'ast_standard',
    jurisdiction: 'northern-ireland' as const,
    schema_version: 'tenancy-output-snapshot.v1',
    source_version: '2026-07-27',
    wizard_answers: { tenant: 'Sentinel Tenant', rent: 875, nested: { b: 2, a: 1 } },
    derived_fields: { rates: 'landlord_included' },
    clause_decisions: { deposit: 'expected' },
    attachment_states: { inventory: 'later' },
    entitlement_reference: 'order:11111111-1111-4111-8111-111111111111',
  };

  return {
    id: '44444444-4444-4444-8444-444444444444',
    ...core,
    content_sha256: hashTenancySnapshotPayload(core),
    created_at: '2026-07-27T12:00:00.000Z',
  };
}

describe('tenancy output snapshot integrity', () => {
  it('hashes object keys deterministically', () => {
    expect(hashTenancySnapshotPayload({ a: 1, b: { x: 2, y: 3 } })).toBe(
      hashTenancySnapshotPayload({ b: { y: 3, x: 2 }, a: 1 })
    );
  });

  it('accepts an unchanged order-bound snapshot', () => {
    expect(() => assertTenancyOutputSnapshotIntegrity(snapshot())).not.toThrow();
  });

  it('rejects answer drift and entitlement drift', () => {
    const changedAnswers = snapshot();
    changedAnswers.wizard_answers = { tenant: 'Different Tenant' };
    expect(() => assertTenancyOutputSnapshotIntegrity(changedAnswers)).toThrow(
      /integrity check failed/
    );

    const changedEntitlement = snapshot();
    changedEntitlement.entitlement_reference = 'order:different';
    expect(() => assertTenancyOutputSnapshotIntegrity(changedEntitlement)).toThrow(
      /integrity check failed|entitlement mismatch/
    );
  });
});
