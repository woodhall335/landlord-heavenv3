import { describe, expect, test } from 'vitest';

import {
  generateMoneyClaimPack,
  type MoneyClaimCase,
} from '../money-claim-pack-generator';
import { generateResidentialLettingDocuments } from '../residential-letting-generator';

function buildMoneyClaimCase(overrides: Partial<MoneyClaimCase> = {}): MoneyClaimCase {
  return {
    jurisdiction: 'england',
    case_id: 'quality-money-claim-001',
    landlord_full_name: 'Alice Landlord',
    landlord_address: '1 High Street\nLondon',
    landlord_postcode: 'E1 1AA',
    landlord_email: 'alice@example.com',
    landlord_phone: '02070000001',
    payment_account_name: 'Alice Landlord',
    payment_sort_code: '10-20-30',
    payment_account_number: '12345678',
    payment_reference: 'E1 2BB arrears',
    tenant_full_name: 'Tom Tenant',
    property_address: '2 High Street\nLondon',
    property_postcode: 'E1 2BB',
    rent_amount: 950,
    rent_frequency: 'monthly',
    payment_day: 1,
    tenancy_start_date: '2024-01-01',
    tenancy_end_date: '2026-02-01',
    arrears_schedule: [
      { period: 'December 2025', due_date: '2025-12-01', amount_due: 950, amount_paid: 0, arrears: 950 },
      { period: 'January 2026', due_date: '2026-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
      { period: 'February 2026', due_date: '2026-02-01', amount_due: 950, amount_paid: 420, arrears: 530 },
    ],
    damage_items: [
      { description: 'Broken internal door', amount: 200 },
      { description: 'Professional clean due to excessive staining', amount: 180 },
    ],
    other_charges: [{ description: 'Locksmith call-out', amount: 80 }],
    claim_interest: true,
    interest_rate: 8,
    interest_start_date: '2026-02-02',
    court_fee: 205,
    solicitor_costs: 0,
    lba_date: '2026-02-10',
    lba_response_deadline: '2026-03-12',
    pap_documents_sent: ['Letter Before Claim', 'Information Sheet', 'Reply Form', 'Financial Statement Form'],
    lba_method: ['email', 'first_class_post'],
    pap_documents_served: true,
    pap_service_method: ['email', 'first_class_post'],
    pap_service_proof: 'Email copy and certificate of posting retained.',
    tenant_responded: false,
    preferred_issue_route: 'county_court_n1',
    claim_value_band: 'up_to_5000',
    enforcement_preferences: ['attachment_of_earnings'],
    evidence_types_available: ['tenancy_agreement', 'arrears_schedule'],
    arrears_schedule_confirmed: true,
    particulars_of_claim:
      'The claimant seeks rent arrears, damage, and related charges arising from the tenancy, together with interest and court fees.',
    signatory_name: 'Alice Landlord',
    signature_date: '2026-04-16',
    ...overrides,
  };
}

function createBaseEnglandAssuredFacts(overrides: Record<string, any> = {}) {
  return {
    current_date: '2026-04-16',
    case_id: 'quality-tenancy-case-001',
    property_address_line1: '12 Example Street',
    property_address_town: 'London',
    property_address_postcode: 'SW1A 1AA',
    landlord_full_name: 'Jane Landlord',
    landlord_address_line1: '3 Owner Road',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 2BB',
    landlord_email: 'jane@example.com',
    landlord_phone: '07123 456789',
    tenancy_start_date: '2026-05-02',
    tenancy_end_date: '2027-05-01',
    rent_amount: 1500,
    deposit_amount: 1500,
    rent_due_day: '1st of each month',
    tenants: [
      {
        full_name: 'Alice Tenant',
        email: 'alice@example.com',
        phone: '07000 111111',
        address: '12 Example Street, London, SW1A 1AA',
      },
    ],
    england_tenancy_purpose: 'new_agreement',
    rent_frequency: 'monthly',
    rent_due_day_of_month: '1st',
    rent_period: 'month',
    payment_method: 'bank_transfer',
    payment_account_name: 'Landlord Heaven Client Account',
    payment_sort_code: '12-34-56',
    payment_account_number: '12345678',
    deposit_reference_number: 'DPS-EXAMPLE-2026-0001',
    deposit_protection_date: '2026-05-02',
    prescribed_information_date: '2026-05-02',
    bills_included_in_rent: 'yes',
    included_bills: ['gas', 'electricity', 'internet_broadband'],
    separate_bill_payments_taken: false,
    tenant_notice_period: '2 months',
    rent_increase_method: 'Section 13 rent increase process',
    england_rent_in_advance_compliant: true,
    england_no_bidding_confirmed: true,
    england_no_discrimination_confirmed: true,
    tenant_improvements_allowed_with_consent: false,
    supported_accommodation_tenancy: false,
    relevant_gas_fitting_present: true,
    gas_safety_certificate: true,
    electrical_safety_certificate: true,
    smoke_alarms_fitted: true,
    carbon_monoxide_alarms: true,
    epc_rating: 'C',
    right_to_rent_check_date: '2026-04-25',
    how_to_rent_provided: true,
    deposit_scheme_name: 'DPS',
    furnished_status: 'furnished',
    ...overrides,
  };
}

function expectNoBrokenEncoding(content: string) {
  expect(content).not.toContain('â€œ');
  expect(content).not.toContain('â€');
  expect(content).not.toContain('â€”');
  expect(content).not.toContain('â€“');
  expect(content).not.toContain('âœ“');
  expect(content).not.toContain('Â£');
  expect(content).not.toContain('[INSERT');
}

describe('England pack output quality', () => {
  test('renders money-claim particulars and PAP letter without mojibake or placeholder bank fields', async () => {
    const pack = await generateMoneyClaimPack(buildMoneyClaimCase());

    const particularsHtml = pack.documents.find((document) => document.document_type === 'particulars_of_claim')?.html;
    const letterHtml = pack.documents.find((document) => document.document_type === 'letter_before_claim')?.html;

    expect(particularsHtml).toBeTruthy();
    expect(letterHtml).toBeTruthy();

    expect(particularsHtml).toContain('"Schedule of arrears"');
    expect(letterHtml).toContain('Sort code: 10-20-30');
    expect(letterHtml).toContain('Account number: 12345678');
    expect(letterHtml).toContain('Payment reference: E1 2BB arrears');
    expect(letterHtml).not.toContain('<p><ul>');
    expect(letterHtml).not.toContain('<p><ol>');
    expect(letterHtml).not.toContain('<p><p>');

    expectNoBrokenEncoding(particularsHtml!);
    expectNoBrokenEncoding(letterHtml!);
  });

  test('falls back to contact wording when money-claim bank details are missing', async () => {
    const pack = await generateMoneyClaimPack(
      buildMoneyClaimCase({
        payment_account_name: undefined,
        payment_sort_code: undefined,
        payment_account_number: undefined,
      })
    );

    const letterHtml = pack.documents.find((document) => document.document_type === 'letter_before_claim')?.html;

    expect(letterHtml).toBeTruthy();
    expect(letterHtml).toContain('Please contact me using the details shown at the top of this letter');
    expect(letterHtml).toContain('Quote');
    expect(letterHtml).not.toContain('Sort code:');
    expect(letterHtml).not.toContain('Account number:');
    expect(letterHtml).not.toContain('<p><ul>');
    expect(letterHtml).not.toContain('<p><ol>');
    expect(letterHtml).not.toContain('<p><p>');
    expectNoBrokenEncoding(letterHtml!);
  });

  test('renders England deposit support documents with complete, readable wording', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts(),
      { outputFormat: 'html' }
    );

    const certificateHtml = pack.documents.find((document) => document.document_type === 'deposit_protection_certificate')?.html;
    const prescribedHtml = pack.documents.find((document) => document.document_type === 'tenancy_deposit_information')?.html;

    expect(certificateHtml).toBeTruthy();
    expect(prescribedHtml).toBeTruthy();

    expect(certificateHtml).toContain('DPS-EXAMPLE-2026-0001');
    expect(certificateHtml).toContain('You must raise disputes within');
    expect(certificateHtml).not.toContain('See scheme confirmation');

    expect(prescribedHtml).toContain('DPS-EXAMPLE-2026-0001');
    expect(prescribedHtml).toContain('Court fees (approx');
    expect(prescribedHtml).toContain('Pay rent on time');
    expect(prescribedHtml).not.toContain('See scheme confirmation');

    expectNoBrokenEncoding(certificateHtml!);
    expectNoBrokenEncoding(prescribedHtml!);
  });
});
