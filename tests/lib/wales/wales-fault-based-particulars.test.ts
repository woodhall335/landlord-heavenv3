import { describe, expect, it } from 'vitest';
import { generateNoticeOnlyPack } from '@/lib/documents/eviction-pack-generator';

describe('Wales fault-based particulars guardrails', () => {
  const baseWalesFacts = {
    __meta: {
      case_id: 'test-wales-fault-particulars',
      jurisdiction: 'wales',
    },
    jurisdiction: 'wales',
    selected_notice_route: 'wales_fault_based',
    landlord_full_name: 'John Smith',
    landlord_address: '123 Main St, Cardiff, CF10 1AA',
    tenant_full_name: 'Jane Doe',
    contract_holder_full_name: 'Jane Doe',
    property_address: '456 Rental Ave, Cardiff, CF10 2BB',
    tenancy_start_date: '2023-01-01',
    contract_start_date: '2023-01-01',
    rent_amount: 1000,
    rent_frequency: 'monthly',
    service_date: '2024-04-01',
    notice_date: '2024-04-01',
    rent_smart_wales_registered: true,
    deposit_protected: true,
  };

  it('allows arrears-only grounds without particulars', async () => {
    const wizardFacts = {
      ...baseWalesFacts,
      wales_fault_grounds: ['rent_arrears_serious'],
      arrears_items: [
        { period_start: '2024-01-01', amount_due: 1000, amount_paid: 0 },
        { period_start: '2024-02-01', amount_due: 1000, amount_paid: 0 },
      ],
      total_arrears: 2000,
    };

    await expect(generateNoticeOnlyPack(wizardFacts)).resolves.toBeDefined();
  });

  it('blocks non-arrears grounds without particulars', async () => {
    const wizardFacts = {
      ...baseWalesFacts,
      wales_fault_grounds: ['antisocial_behaviour'],
    };

    await expect(generateNoticeOnlyPack(wizardFacts)).rejects.toThrow(
      /requires particulars for non-arrears grounds/
    );
  });

  it('allows non-arrears grounds when Wales-specific particulars are provided', async () => {
    const wizardFacts = {
      ...baseWalesFacts,
      wales_fault_grounds: ['breach_of_contract'],
      wales_breach_particulars: 'Tenant has breached clause 4 by subletting.',
    };

    await expect(generateNoticeOnlyPack(wizardFacts)).resolves.toBeDefined();
  });
});
