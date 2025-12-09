#!/usr/bin/env node
/**
 * Debug script to trace data flow for money claim preview
 * This simulates the wizard → caseFacts → moneyClaimCase → pack pipeline
 */

import { wizardFactsToCaseFacts } from '../src/lib/case-facts/normalize.ts';
import { mapCaseFactsToMoneyClaimCase } from '../src/lib/documents/money-claim-wizard-mapper.ts';

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
  'property_address.country': 'england-wales',
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
};

console.log('========================================');
console.log('STEP 1: wizardFacts (from DB)');
console.log('========================================');
console.log(JSON.stringify(wizardFacts, null, 2));

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
console.log('arrears_schedule length:', moneyClaimCase.arrears_schedule?.length);

console.log('\n========================================');
console.log('DIAGNOSIS');
console.log('========================================');
if (!moneyClaimCase.landlord_full_name) {
  console.log('❌ PROBLEM: landlord_full_name is missing!');
  console.log('   Check: caseFacts.parties.landlord.name =', caseFacts.parties.landlord.name);
}
if (!moneyClaimCase.tenant_full_name) {
  console.log('❌ PROBLEM: tenant_full_name is missing!');
  console.log('   Check: caseFacts.parties.tenants[0]?.name =', caseFacts.parties.tenants[0]?.name);
}
if (!moneyClaimCase.property_address) {
  console.log('❌ PROBLEM: property_address is missing!');
  console.log('   Check: caseFacts.property.address_line1 =', caseFacts.property.address_line1);
}
if (!moneyClaimCase.rent_amount || moneyClaimCase.rent_amount === 0) {
  console.log('❌ PROBLEM: rent_amount is 0!');
  console.log('   Check: caseFacts.tenancy.rent_amount =', caseFacts.tenancy.rent_amount);
}

console.log('\n✅ Script complete. Check the output above to identify where data is lost.');
