import { describe, expect, it } from 'vitest';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';

function createCaseFactsWithEvidence(): CaseFacts {
  return {
    parties: {
      landlord: {
        name: 'Alex Landlord',
        co_claimant: null,
        address_line1: '1 High Street',
        address_line2: null,
        city: 'London',
        postcode: 'SW1A 1AA',
        email: null,
        phone: null,
      },
      tenants: [{ name: 'Sam Tenant' }],
    },
    property: {
      address_line1: '2 Rental Road',
      address_line2: null,
      city: 'London',
      postcode: 'SW1A 2AA',
    },
    tenancy: {
      rent_amount: 1200,
      rent_frequency: 'monthly',
      rent_due_day: 1,
      usual_payment_weekday: null,
      start_date: '2025-01-01',
      end_date: null,
    },
    issues: {
      rent_arrears: {
        total_arrears: 1200,
        arrears_items: [],
      },
    },
    money_claim: {
      payment_day: 1,
      damage_claim: null,
      damage_items: [],
      other_charges: [],
      charge_interest: false,
      interest_start_date: null,
      interest_rate: null,
      solicitor_costs: null,
      attempts_to_resolve: null,
      evidence_summary: null,
      evidence_items: [
        {
          type: 'rent_schedule',
          label: 'Rent schedule / arrears ledger',
          available: true,
          description: 'arrears schedule showing January rent unpaid',
        },
        {
          type: 'repair_quotes',
          label: 'Repair quotes / invoices',
          available: false,
        },
      ],
      evidence_types_available: ['rent_schedule'],
      basis_of_claim: null,
      arrears_schedule_confirmed: null,
    },
    court: {
      claimant_reference: null,
      claim_amount_costs: null,
      particulars_of_claim: null,
      court_name: null,
    },
    service_contact: {
      service_address_line1: null,
      service_address_line2: null,
      service_city: null,
      service_address_county: null,
      service_postcode: null,
      service_email: null,
      service_phone: null,
    },
  } as unknown as CaseFacts;
}

describe('money claim evidence checklist document output', () => {
  it('maps selected evidence descriptions into cautious claim output data', () => {
    const mapped = mapCaseFactsToMoneyClaimCase(createCaseFactsWithEvidence());

    expect(mapped.evidence_types_available).toEqual(['rent_schedule']);
    expect(mapped.evidence_items).toEqual([
      {
        type: 'rent_schedule',
        label: 'Rent schedule / arrears ledger',
        available: true,
        description: 'arrears schedule showing January rent unpaid',
      },
    ]);
    expect(mapped.evidence_summary).toContain(
      'The claimant says they have / will rely on Rent schedule / arrears ledger: arrears schedule showing January rent unpaid.'
    );
  });
});
