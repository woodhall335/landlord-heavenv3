import { describe, expect, it } from 'vitest';

import {
  deriveCanonicalInventoryState,
  inventoryCustomerStatus,
} from '@/lib/tenancy/inventory-state';

const completedRooms = [
  {
    name: 'Kitchen',
    items: [
      { name: 'Worktop', condition: 'Good', notes: 'Clean, one light mark' },
    ],
  },
];

describe('canonical inventory state', () => {
  it('derives a blank inventory as a template', () => {
    expect(deriveCanonicalInventoryState({}).lifecycleState).toBe('template_included');
  });

  it.each([
    [{ inventory_rooms: [{ name: 'Kitchen', items: [] }] }, 'partial empty rows'],
    [{ inventory_rooms: [{ name: 'Kitchen', items: [{ name: 'Wall', notes: '   ' }] }] }, 'whitespace rows'],
    [{ meter_reading_gas: '1234' }, 'meter readings only'],
    [{ number_of_front_door_keys: 2 }, 'keys only'],
  ])('does not call %s completed', (facts) => {
    expect(deriveCanonicalInventoryState(facts).lifecycleState).toBe('template_included');
  });

  it('derives meaningful structured conditions as completed', () => {
    expect(
      deriveCanonicalInventoryState({ inventory_rooms: completedRooms })
        .lifecycleState
    ).toBe('attached_completed');
  });

  it('does not infer a signature from PDF signature lines', () => {
    const state = deriveCanonicalInventoryState({ inventory_rooms: completedRooms });
    expect(state.signatureState).toBe('unsigned');
    expect(inventoryCustomerStatus(state)).toBe(
      'Completed inventory supplied; signatures pending'
    );
  });

  it('allows signed wording only with both signatures and dates', () => {
    const state = deriveCanonicalInventoryState({
      inventory_rooms: completedRooms,
      inventory_landlord_signature: 'signed-evidence-1',
      inventory_landlord_signature_date: '2026-09-01',
      inventory_tenant_signature: 'signed-evidence-2',
      inventory_tenant_signature_date: '2026-09-01',
    });
    expect(state.signatureState).toBe('fully_signed');
    expect(inventoryCustomerStatus(state)).toBe(
      'Yes - completed and signed inventory supplied'
    );
  });

  it('uses a future delivery date for a separate-later inventory', () => {
    const state = deriveCanonicalInventoryState({
      inventory_delivery_method: 'later',
      inventory_due_date: '2026-09-10',
    });
    expect(state.lifecycleState).toBe('separate_later');
    expect(state.dueDeliveryDate).toBe('2026-09-10');
  });

  it('fails closed when a client attachment Boolean has no structured rows', () => {
    const state = deriveCanonicalInventoryState({ inventory_attached: true });
    expect(state.lifecycleState).toBe('template_included');
    expect(state.warnings).toContain('LEGACY_INVENTORY_ATTACHMENT_FLAG_IGNORED');
  });

  it('creates the same ID and hash from the same immutable content', () => {
    const facts = Object.freeze({
      document_id: 'CERT-TEST',
      inventory_rooms: completedRooms,
    });
    expect(deriveCanonicalInventoryState(facts)).toEqual(
      deriveCanonicalInventoryState(facts)
    );
  });
});
