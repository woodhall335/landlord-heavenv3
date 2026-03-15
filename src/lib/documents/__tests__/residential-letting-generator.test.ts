import { describe, expect, test } from 'vitest';

import { generateResidentialLettingDocuments } from '../residential-letting-generator';

const baseFacts = {
  current_date: '2026-03-15',
  case_id: '11111111-2222-3333-4444-555555555555',
  property_address_line1: '12 Example Street',
  property_address_town: 'London',
  property_address_postcode: 'SW1A 1AA',
  landlord_full_name: 'Jane Landlord',
  landlord_address_line1: '3 Owner Road',
  landlord_address_town: 'London',
  landlord_address_postcode: 'SW1A 2BB',
  landlord_email: 'jane@example.com',
  landlord_phone: '07123 456789',
  tenancy_start_date: '2026-01-01',
  tenancy_end_date: '2026-12-31',
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
};

describe('generateResidentialLettingDocuments', () => {
  test('renders guarantor agreements as deeds with witness execution', async () => {
    const pack = await generateResidentialLettingDocuments(
      'guarantor_agreement',
      {
        ...baseFacts,
        original_agreement_date: '2025-12-20',
        guarantor_name: 'Greg Guarantor',
        guarantor_address: '77 Support Avenue, Bristol, BS1 4AB',
        guarantor_email: 'greg@example.com',
        guarantor_phone: '07000 222222',
        guarantee_cap_amount: 5000,
        guarantee_continues_after_renewal: true,
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Executed as a deed');
    expect(html).toContain('Witness');
    expect(html).toContain('Greg Guarantor');
    expect(html).toContain('5000.00');
  });

  test('maps tenancy application applicant fields into the rendered form', async () => {
    const pack = await generateResidentialLettingDocuments(
      'residential_tenancy_application',
      {
        ...baseFacts,
        applicant_name: 'Priya Applicant',
        applicant_email: 'priya@example.com',
        applicant_phone: '07000 333333',
        current_address: '90 Current Street, Reading, RG1 1AA',
        applicant_employment_status: 'Employed',
        applicant_employer_name: 'ACME Ltd',
        applicant_job_title: 'Operations Manager',
        applicant_annual_income: 54000,
        current_landlord_name: 'Current Lettings',
        current_landlord_contact: 'ref@currentlettings.example',
        current_rent_amount: 1300,
        length_of_occupation: '2 years',
        reason_for_moving: 'Need a larger property',
        additional_income_details: 'Annual bonus',
        adverse_credit_details: 'None',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Priya Applicant');
    expect(html).toContain('ACME Ltd');
    expect(html).toContain('Current Lettings');
    expect(html).toContain('Need a larger property');
  });

  test('uses assignment_effective_date and transfer summary for assignment agreements', async () => {
    const pack = await generateResidentialLettingDocuments(
      'lease_assignment_agreement',
      {
        ...baseFacts,
        outgoing_tenant_name: 'Alice Tenant',
        incoming_tenant_name: 'Ben Incoming',
        incoming_tenant_address: '1 New Lane, Leeds, LS1 2AB',
        assignment_effective_date: '2026-04-01',
        landlord_consent_obtained: true,
        transfer_terms_summary: 'Utilities apportioned to 31 March 2026 and keys handed over on completion.',
        deposit_treatment: 'Outgoing tenant reimbursed privately and deposit record updated with the scheme.',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Ben Incoming');
    expect(html).toContain('1 April 2026');
    expect(html).toContain('Utilities apportioned to 31 March 2026');
    expect(html).toContain('deposit record updated with the scheme');
  });

  test('maps flatmate bill split and house rules fields into the agreement', async () => {
    const pack = await generateResidentialLettingDocuments(
      'flatmate_agreement',
      {
        ...baseFacts,
        flatmate_names: 'Alice Tenant, Jamie Occupier',
        bill_split_summary: 'Gas, electricity, and broadband split equally.',
        house_rules_summary: 'No smoking inside and shared areas to be kept tidy.',
        notice_period_between_flatmates: '28 days',
        exit_arrangements: 'Outgoing occupier to settle outstanding bills before departure.',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Gas, electricity, and broadband split equally.');
    expect(html).toContain('No smoking inside and shared areas to be kept tidy.');
    expect(html).toContain('28 days');
  });

  test('renders a final-warning arrears letter without false PAP compliance wording', async () => {
    const pack = await generateResidentialLettingDocuments(
      'rent_arrears_letter',
      {
        ...baseFacts,
        arrears_amount: 2400,
        arrears_date: '2026-03-10',
        final_deadline: '2026-03-24',
        response_deadline: '2026-03-24',
        arrears_letter_type: 'Final warning',
        arrears_periods_missed: 'February 2026 and March 2026',
        payment_method: 'Bank transfer',
        payment_details: 'Sort code 00-00-00, account 12345678.',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('not a complete Letter of Claim under the Pre-Action Protocol for Debt Claims');
    expect(html).not.toContain('Pre-Action Protocol for Possession Claims');
    expect(html).not.toContain('homeless');
  });

  test('adds a renters rights warning for renewals starting on or after 1 May 2026', async () => {
    const pack = await generateResidentialLettingDocuments(
      'renewal_tenancy_agreement',
      {
        ...baseFacts,
        original_agreement_date: '2025-05-01',
        renewal_start_date: '2026-05-01',
        renewal_end_date: '2027-04-30',
        renewal_rent_amount: 1600,
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Renters&#x27; Rights Act 2025 reforms');
    expect(html).toContain('1 May 2026');
  });
});
