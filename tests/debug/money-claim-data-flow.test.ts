import { describe, test, expect } from 'vitest';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';

describe('Money claim data flow debugging', () => {
  test('trace wizard facts → caseFacts → moneyClaimCase', () => {
    // Simulate what the wizard stores after answering all questions
    // This matches the test data from tests/integration/money-claim-wizard-flow.test.ts
    const wizardFacts = {
      claimant_full_name: 'Alice Landlord',
      claimant_email: 'alice@example.com',
      claimant_phone: '01234567890',
      'claimant_address.address_line1': '1 High Street',
      'claimant_address.address_line2': '',
      'claimant_address.city': 'London',
      'claimant_address.postcode': 'N1 1AA',
      defendant_full_name: 'Tom Tenant',
      'property_address.address_line1': '2 Rental Road',
      'property_address.address_line2': '',
      'property_address.city': 'London',
      'property_address.postcode': 'N2 2BB',
      'property_address.country': 'england',
      tenancy_start_date: '2024-01-01',
      rent_amount: 750,
      rent_frequency: 'monthly',
      claim_type: ['rent_arrears'],
      arrears_total: 1200,
      'arrears_schedule_upload.rent_schedule_uploaded': true,
      'arrears_schedule_upload.arrears_items': [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 600, rent_paid: 0 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 600, rent_paid: 0 },
      ],
      charge_interest: 'yes',
      interest_start_date: '2024-01-01',
      interest_rate: '8',
      preferred_court: 'London County Court',
      particulars_of_claim: 'Rent arrears for January and February 2024.',
      payment_attempts: 'Chased via email and SMS.',
      lba_sent: 'yes',
      lba_date: '2024-03-01',
      lba_method: ['email'],
      signatory_name: 'Alice Landlord',
    } as any;

    console.log('\n========================================');
    console.log('STEP 1: wizardFacts (from DB)');
    console.log('========================================');
    console.log('Keys:', Object.keys(wizardFacts));

    console.log('\n========================================');
    console.log('STEP 2: wizardFactsToCaseFacts()');
    console.log('========================================');
    const caseFacts = wizardFactsToCaseFacts(wizardFacts);
    console.log('Landlord name:', caseFacts.parties.landlord.name);
    console.log('Landlord email:', caseFacts.parties.landlord.email);
    console.log('Landlord phone:', caseFacts.parties.landlord.phone);
    console.log('Landlord address_line1:', caseFacts.parties.landlord.address_line1);
    console.log('Landlord city:', caseFacts.parties.landlord.city);
    console.log('Landlord postcode:', caseFacts.parties.landlord.postcode);
    console.log('Tenant name:', caseFacts.parties.tenants[0]?.name);
    console.log('Property address_line1:', caseFacts.property.address_line1);
    console.log('Property city:', caseFacts.property.city);
    console.log('Property postcode:', caseFacts.property.postcode);
    console.log('Rent amount:', caseFacts.tenancy.rent_amount);
    console.log('Rent frequency:', caseFacts.tenancy.rent_frequency);
    console.log('Tenancy start:', caseFacts.tenancy.start_date);
    console.log('Arrears total:', caseFacts.issues.rent_arrears.total_arrears);

    console.log('\n========================================');
    console.log('STEP 3: mapCaseFactsToMoneyClaimCase()');
    console.log('========================================');
    const moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);
    console.log('landlord_full_name:', moneyClaimCase.landlord_full_name);
    console.log('landlord_address:', moneyClaimCase.landlord_address);
    console.log('landlord_postcode:', moneyClaimCase.landlord_postcode);
    console.log('landlord_email:', moneyClaimCase.landlord_email);
    console.log('landlord_phone:', moneyClaimCase.landlord_phone);
    console.log('tenant_full_name:', moneyClaimCase.tenant_full_name);
    console.log('property_address:', moneyClaimCase.property_address);
    console.log('property_postcode:', moneyClaimCase.property_postcode);
    console.log('rent_amount:', moneyClaimCase.rent_amount);
    console.log('rent_frequency:', moneyClaimCase.rent_frequency);
    console.log('tenancy_start_date:', moneyClaimCase.tenancy_start_date);
    console.log('arrears_total:', moneyClaimCase.arrears_total);

    // Assert that data flows correctly
    expect(caseFacts.parties.landlord.name).toBe('Alice Landlord');
    expect(caseFacts.parties.tenants[0]?.name).toBe('Tom Tenant');
    expect(caseFacts.property.address_line1).toBe('2 Rental Road');
    expect(caseFacts.tenancy.rent_amount).toBe(750);

    expect(moneyClaimCase.landlord_full_name).toBe('Alice Landlord');
    expect(moneyClaimCase.tenant_full_name).toBe('Tom Tenant');
    expect(moneyClaimCase.property_address).toContain('2 Rental Road');
    expect(moneyClaimCase.rent_amount).toBe(750);
  });
});
