import { describe, expect, it } from 'vitest';
import { validateMoneyClaimClient } from '@/lib/validation/money-claim-client-validator';

describe('money claim evidence checklist validation', () => {
  it('treats selected checklist evidence as evidence without requiring uploads', () => {
    const result = validateMoneyClaimClient({
      landlord_full_name: 'Alex Landlord',
      landlord_address_line1: '1 High Street',
      landlord_address_postcode: 'SW1A 1AA',
      tenant_full_name: 'Sam Tenant',
      defendant_address_line1: '2 Rental Road',
      tenancy_start_date: '2025-01-01',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      claiming_rent_arrears: true,
      arrears_items: [
        {
          period_start: '2026-01-01',
          period_end: '2026-01-31',
          rent_due: 1200,
          rent_paid: 0,
        },
      ],
      letter_before_claim_sent: true,
      pap_letter_date: '2026-01-01',
      evidence_reviewed: true,
      money_claim: {
        charge_interest: false,
        evidence_items: [
          {
            type: 'rent_schedule',
            label: 'Rent schedule / arrears ledger',
            available: true,
            description: 'arrears schedule showing January rent unpaid',
          },
        ],
        evidence_types_available: ['rent_schedule'],
      },
    });

    expect(result.warnings.map((warning) => warning.id)).not.toContain('no_evidence_uploaded');
    expect(result.suggestions.map((suggestion) => suggestion.id)).not.toContain('arrears_evidence_suggested');
  });

  it('frames missing key evidence as warnings, not blockers', () => {
    const result = validateMoneyClaimClient({
      landlord_full_name: 'Alex Landlord',
      landlord_address_line1: '1 High Street',
      landlord_address_postcode: 'SW1A 1AA',
      tenant_full_name: 'Sam Tenant',
      defendant_address_line1: '2 Rental Road',
      tenancy_start_date: '2025-01-01',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      claiming_damages: true,
      evidence_reviewed: true,
      money_claim: {
        charge_interest: false,
        other_amounts_types: ['property_damage'],
        damage_items: [{ description: 'Broken door', amount: 250 }],
        evidence_items: [],
      },
    });

    expect(result.warnings.map((warning) => warning.id)).toContain('property_damage_evidence_warning');
    expect(result.blockers.map((blocker) => blocker.id)).not.toContain('property_damage_evidence_warning');
  });
});
