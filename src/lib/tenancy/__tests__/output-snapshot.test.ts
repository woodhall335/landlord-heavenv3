import { describe, expect, it } from 'vitest';
import {
  assertTenancySnapshotInputConsistency,
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

  it.each([
    { paidType: 'fixed', paidFlag: true, manipulatedFlag: false },
    { paidType: 'periodic', paidFlag: false, manipulatedFlag: true },
  ])(
    'rejects changing a paid Wales $paidType contract to the other contract type',
    ({ paidFlag, manipulatedFlag }) => {
      const paidSnapshot = snapshot();
      paidSnapshot.jurisdiction = 'wales';
      paidSnapshot.wizard_answers = {
        ...paidSnapshot.wizard_answers,
        is_fixed_term: paidFlag,
      };

      const core = {
        order_id: paidSnapshot.order_id,
        case_id: paidSnapshot.case_id,
        user_id: paidSnapshot.user_id,
        product_type: paidSnapshot.product_type,
        jurisdiction: paidSnapshot.jurisdiction,
        schema_version: paidSnapshot.schema_version,
        source_version: paidSnapshot.source_version,
        wizard_answers: paidSnapshot.wizard_answers,
        derived_fields: paidSnapshot.derived_fields,
        clause_decisions: paidSnapshot.clause_decisions,
        attachment_states: paidSnapshot.attachment_states,
        entitlement_reference: paidSnapshot.entitlement_reference,
      };
      paidSnapshot.content_sha256 = hashTenancySnapshotPayload(core);
      expect(() => assertTenancyOutputSnapshotIntegrity(paidSnapshot)).not.toThrow();

      paidSnapshot.wizard_answers = {
        ...paidSnapshot.wizard_answers,
        is_fixed_term: manipulatedFlag,
      };
      expect(() => assertTenancyOutputSnapshotIntegrity(paidSnapshot)).toThrow(
        /integrity check failed/
      );
    }
  );

  it('rejects a Scotland case carrying Wales wizard state', () => {
    expect(() =>
      assertTenancySnapshotInputConsistency({
        productType: 'ast_standard',
        jurisdiction: 'scotland',
        wizardAnswers: {
          jurisdiction: 'wales',
          contract_type: 'periodic',
        },
      })
    ).toThrow(/jurisdiction mismatch/i);
  });

  it('rejects England and Premium products for a non-England snapshot', () => {
    expect(() =>
      assertTenancySnapshotInputConsistency({
        productType: 'england_standard_tenancy_agreement',
        jurisdiction: 'northern-ireland',
        wizardAnswers: { jurisdiction: 'northern-ireland' },
      })
    ).toThrow(/not available/i);

    expect(() =>
      assertTenancySnapshotInputConsistency({
        productType: 'ast_premium',
        jurisdiction: 'wales',
        wizardAnswers: {
          jurisdiction: 'wales',
          contract_type: 'fixed',
          is_fixed_term: true,
        },
      })
    ).toThrow(/not available/i);
  });

  it('requires a consistent Wales fixed or periodic selection', () => {
    expect(() =>
      assertTenancySnapshotInputConsistency({
        productType: 'ast_standard',
        jurisdiction: 'wales',
        wizardAnswers: {
          jurisdiction: 'wales',
          contract_type: 'fixed',
          is_fixed_term: false,
        },
      })
    ).toThrow(/conflicts/i);
  });
});
