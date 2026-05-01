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

function createBaseEnglandAssuredFacts(overrides: Record<string, any> = {}) {
  return {
    ...baseFacts,
    tenancy_start_date: '2026-05-02',
    england_tenancy_purpose: 'new_agreement',
    rent_frequency: 'monthly',
    rent_due_day_of_month: '1st',
    payment_method: 'bank_transfer',
    payment_account_name: 'Landlord Heaven Client Account',
    payment_sort_code: '12-34-56',
    payment_account_number: '12345678',
    bills_included_in_rent: 'yes',
    included_bills: ['gas', 'electricity', 'internet_broadband'],
    separate_bill_payments_taken: false,
    tenant_notice_period: '2 months',
    rent_increase_method: 'Section 13 rent increase process',
    england_rent_in_advance_compliant: true,
    england_no_bidding_confirmed: true,
    england_no_discrimination_confirmed: true,
    tenant_is_individual: true,
    main_home: true,
    landlord_not_resident_confirmed: true,
    not_holiday_or_licence_confirmed: true,
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
    ...overrides,
  };
}

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

      const html = pack.documents[0].html.replace(/&#163;/g, '£');

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

  test('renders defined terms in standalone agreement products', async () => {
    const pack = await generateResidentialLettingDocuments(
      'lease_assignment_agreement',
      {
        ...baseFacts,
        outgoing_tenant_name: 'Alice Tenant',
        incoming_tenant_name: 'Ben Incoming',
        assignment_effective_date: '2026-04-01',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Defined Terms');
    expect(html).toContain('Outgoing Tenant');
    expect(html).toContain('Incoming Tenant');
    expect(html).toContain('Assignment Date');
  });

  test('builds itemised inventory rooms from wizard notes when structured inventory is absent', async () => {
    const pack = await generateResidentialLettingDocuments(
      'inventory_schedule_condition',
      {
        ...baseFacts,
        inspection_date: '2026-01-01',
        entrance_hall_inventory_items: 'Coat hooks | Good | Four chrome hooks\nConsole table | Fair | Light mark to top',
        kitchen_inventory_items: 'Oven | Good | Clean and working\nFridge freezer | Good | Minor scratch to side panel',
        kitchen_condition: 'White goods present and photographed at check-in.',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Entrance hall / landing');
    expect(html).toContain('Console table');
    expect(html).toContain('Fridge freezer');
    expect(html).toContain('Overall room condition');
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

  test('renders amendment matrix rows for structured lease amendments', async () => {
    const pack = await generateResidentialLettingDocuments(
      'lease_amendment',
      {
        ...baseFacts,
        original_agreement_date: '2025-12-20',
        amendment_effective_date: '2026-04-01',
        amendment_title: 'Rent and pet clause update',
        amendment_rows: [
          {
            clause_reference: 'Clause 3.1',
            current_wording_summary: 'Rent is £1,500 pcm',
            replacement_wording: 'Rent increases to £1,650 pcm',
            effective_date: '2026-04-01',
          },
        ],
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html.replace(/&#163;/g, '£');

    expect(html).toContain('Clause Amendment Matrix');
    expect(html).toContain('Clause 3.1');
    expect(html).toMatch(/Rent increases to (?:£|&#163;)1,650 pcm/);
  });

  test('renders structured inspection rooms and evidence appendix entries', async () => {
    const pack = await generateResidentialLettingDocuments(
      'rental_inspection_report',
      {
        ...baseFacts,
        inspection_date: '2026-03-12',
        inspection_type: 'Periodic inspection',
        inspector_name: 'Ian Inspector',
        inspection_rooms: [
          {
            name: 'Kitchen',
            condition: 'Units intact with light wear.',
            cleanliness: 'Clean and presentable.',
            fixtures: 'Worktops, sink, extractor, and splashback inspected.',
            defects: 'Sealant beginning to fail near sink.',
            actions: 'Arrange reseal within 14 days.',
            tenant_comments: 'Tenant confirmed issue already reported.',
            photo_reference: 'IMG-001 to IMG-004',
            items: [
              {
                item: 'Oven',
                condition: 'Good',
                cleanliness: 'Clean',
                notes: 'Operational at inspection.',
              },
            ],
          },
        ],
        follow_up_items: [
          {
            issue: 'Sink sealant',
            action_required: 'Reseal sink edge',
            target_date: '2026-03-26',
          },
        ],
        inspection_evidence_files: [
          {
            id: 'e1',
            documentId: 'doc1',
            fileName: 'kitchen-overview.jpg',
            category: 'photo',
            uploadedAt: '2026-03-12',
          },
        ],
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Room-by-Room Record');
    expect(html).toContain('Kitchen');
    expect(html).toContain('Arrange reseal within 14 days.');
    expect(html).toContain('Evidence Appendix');
    expect(html).toContain('kitchen-overview.jpg');
  });

  test('renders structured inventory rooms with cleanliness and evidence appendix', async () => {
    const pack = await generateResidentialLettingDocuments(
      'inventory_schedule_condition',
      {
        ...baseFacts,
        inventory_date: '2026-01-01',
        inventory_rooms: [
          {
            name: 'Bedroom 1',
            condition: 'Generally good with minor wear.',
            cleanliness: 'Professionally cleaned.',
            photo_reference: 'BED-01 to BED-03',
            items: [
              {
                item: 'Double bed frame',
                condition: 'Good',
                cleanliness: 'Clean',
                notes: 'Minor scuff to footboard.',
              },
            ],
          },
        ],
        inventory_evidence_files: [
          {
            id: 'e2',
            documentId: 'doc2',
            fileName: 'bedroom-checkin.jpg',
            category: 'photo',
            uploadedAt: '2026-01-01',
          },
        ],
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Bedroom 1');
    expect(html).toContain('Professionally cleaned.');
    expect(html).toContain('Double bed frame');
    expect(html).toContain('bedroom-checkin.jpg');
  });

  test('renders repayment instalment tables from the premium standalone wizard', async () => {
    const pack = await generateResidentialLettingDocuments(
      'repayment_plan_agreement',
      {
        ...baseFacts,
        tenant_full_name: 'Alice Tenant',
        arrears_total: 2400,
        arrears_as_at_date: '2026-03-10',
        instalment_amount: 400,
        repayment_start_date: '2026-03-20',
        instalment_frequency: 'monthly',
        repayment_schedule_rows: [
          {
            due_date: '2026-03-20',
            amount: 400,
            running_balance: 2000,
            note: 'First agreed instalment',
          },
        ],
        default_consequence: 'Landlord may cancel the plan if instalments are missed.',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Instalment Schedule');
    expect(html).toContain('First agreed instalment');
    expect(html).toMatch(/(?:£|&#163;)2,000\.00|(?:£|&#163;)2000\.00/);
  });

  test('renders attached arrears schedules when detailed arrears rows are provided', async () => {
    const pack = await generateResidentialLettingDocuments(
      'rent_arrears_letter',
      {
        ...baseFacts,
        sender_name: 'Jane Landlord',
        sender_service_address: '3 Owner Road, London, SW1A 2BB',
        tenant_full_name: 'Alice Tenant',
        tenant_last_known_address: '12 Example Street, London, SW1A 1AA',
        arrears_total: 2400,
        arrears_as_at_date: '2026-03-10',
        final_deadline: '2026-03-24',
        letter_type: 'final_warning',
        payment_instructions: 'Pay by bank transfer quoting property postcode.',
        arrears_schedule_rows: [
          {
            due_date: '2026-02-01',
            period_covered: 'February 2026',
            amount_due: 1200,
            amount_paid: 0,
            amount_outstanding: 1200,
            payment_received_date: '',
            note: 'Unpaid',
          },
        ],
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Attached Arrears Schedule');
    expect(html).toContain('February 2026');
    expect(html).toMatch(/(?:£|&#163;)1,200\.00|(?:£|&#163;)1200\.00/);
  });
  test('generates the expanded England assured-tenancy pack for the modern standard product', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts({
        furnished_status: 'furnished',
        tenant_improvements_allowed_with_consent: true,
      }),
      { outputFormat: 'html' }
    );

    expect(pack.documents.map((document) => document.document_type)).toEqual(
      expect.arrayContaining([
        'england_standard_tenancy_agreement',
        'pre_tenancy_checklist_england',
        'england_keys_handover_record',
        'england_utilities_handover_sheet',
        'england_pet_request_addendum',
        'england_tenancy_variation_record',
        'deposit_protection_certificate',
        'tenancy_deposit_information',
      ])
    );

    const html = pack.documents[0].html;
    expect(html).toContain('Section 13');
    expect(html).toContain('obtaining an order for possession and the execution of that order');
    expect(html).toContain('serve a possession notice using the correct form');
    expect(html).toContain('section 9A of the Landlord and Tenant Act 1985');
    expect(html).toContain('section 11 of the Landlord and Tenant Act 1985');
    expect(html).toContain('Regulation 3 of the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020');
    expect(html).toContain('Regulation 36 of the Gas Safety (Installations and Use) Regulations 1998');
    expect(html).toContain('fit for human habitation');
    expect(html).toContain('section 16A of the Housing Act 1988');
    expect(html).toContain('cannot unreasonably refuse consent to keep a pet');
    expect(html).toContain('section 190(9)');
    expect(html).toContain('tenant may keep a pet at the property if the tenant asks to do so in line with section 16A of the Housing Act 1988');
    expect(html).toContain('Bank transfer');
    expect(html).toContain('Landlord Heaven Client Account');
    expect(html).toContain('12-34-56');
    expect(html).toContain('Gas, Electricity, Internet / broadband');
    expect(html).not.toContain('Prior-Notice Grounds');
  });

  test('keeps the written-information coverage for England new tenancies even when no deposit is taken', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts({
        deposit_amount: 0,
        deposit_scheme_name: '',
        bills_included_in_rent: 'no',
        included_bills: [],
        separate_bill_payments_taken: false,
        relevant_gas_fitting_present: false,
        gas_safety_certificate: undefined,
      }),
      { outputFormat: 'html' }
    );

    expect(pack.documents.map((document) => document.document_type)).not.toContain(
      'deposit_protection_certificate'
    );
    expect(pack.documents.map((document) => document.document_type)).not.toContain(
      'tenancy_deposit_information'
    );

    const html = pack.documents[0].html;
    expect(html).toContain('No tenancy deposit is stated');
    expect(html).toContain('No bills are stated to be included in the rent unless this agreement expressly says otherwise.');
    expect(html).toContain('serve a possession notice using the correct form');
    expect(html).toContain('Regulation 3 of the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020');
    expect(html).not.toContain('Regulation 36 of the Gas Safety (Installations and Use) Regulations 1998');
  });

  test('renders multiple named tenants when the England agreement is prepared for more than one tenant', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      {
        ...baseFacts,
        number_of_tenants: 2,
        tenants: [
          {
            full_name: 'Alice Tenant',
            email: 'alice@example.com',
            phone: '07000 111111',
            address: '12 Example Street, London, SW1A 1AA',
          },
          {
            full_name: 'Ben Tenant',
            email: 'ben@example.com',
            phone: '07000 222222',
            address: '12 Example Street, London, SW1A 1AA',
          },
        ],
        tenancy_start_date: '2026-05-02',
        england_tenancy_purpose: 'new_agreement',
        bills_included_in_rent: 'yes',
        included_bills_notes: 'Gas and electricity',
        separate_bill_payments_taken: false,
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        england_rent_in_advance_compliant: true,
        england_no_bidding_confirmed: true,
        england_no_discrimination_confirmed: true,
        tenant_improvements_allowed_with_consent: true,
        supported_accommodation_tenancy: false,
        relevant_gas_fitting_present: false,
        electrical_safety_certificate: true,
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
        epc_rating: 'C',
        right_to_rent_check_date: '2026-04-25',
        how_to_rent_provided: true,
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Alice Tenant');
    expect(html).toContain('Ben Tenant');
    expect(html).toContain('Tenant 2');
  });

  test('renders separate bill-payment details, supported accommodation statements, and fuller Equality Act wording where applicable', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts({
        rent_period: 'month',
        payment_method: 'Standing Order',
        bills_included_in_rent: 'no',
        separate_bill_payments_taken: true,
        separate_bill_payment_rows: [
          {
            bill_type: 'communications',
            amount_detail: '£35 per month or the invoiced amount notified in writing',
            due_detail: 'monthly with the rent unless a later written invoice date is given',
          },
        ],
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        tenant_improvements_allowed_with_consent: true,
        supported_accommodation_tenancy: true,
        supported_accommodation_explanation: 'The tenant is being admitted to accommodation with weekly supervision and support delivered on the landlord behalf.',
        relevant_gas_fitting_present: false,
      }),
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html.replace(/&#163;/g, '£');

    expect(html).toContain('Amount or pricing basis: £35 per month or the invoiced amount notified in writing.');
    expect(html).toContain('When due or how notified: monthly with the rent unless a later written invoice date is given.');
    expect(html).toContain('Supported Accommodation Status');
    expect(html).toContain('granted as supported accommodation');
    expect(html).toContain('section 16A of the Housing Act 1988');
    expect(html).toContain('cannot unreasonably refuse consent to keep a pet');
    expect(html).toContain('section 190(9)');
    expect(html).toContain('section 6 of the Equality Act 2010');
  });

  test('renders additional joint landlords in the England agreement parties and signature blocks', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts({
        additional_landlords: [
          {
            full_name: 'John Joint',
            service_address: '7 Co-Owner Road, London, SW1A 3CC',
            email: 'john.joint@example.com',
            phone: '07000 333333',
          },
        ],
      }),
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Landlord 1');
    expect(html).toContain('Landlord 2');
    expect(html).toContain('John Joint');
    expect(html).toContain('7 Co-Owner Road, London, SW1A 3CC');
  });

  test('only renders prior-notice grounds when the advanced England legal section is used', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_student_tenancy_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2026-05-02',
        england_tenancy_purpose: 'new_agreement',
        rent_frequency: 'monthly',
        rent_due_day_of_month: '1st',
        payment_method: 'cash',
        bills_included_in_rent: 'no',
        separate_bill_payments_taken: false,
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        england_rent_in_advance_compliant: true,
        england_no_bidding_confirmed: true,
        england_no_discrimination_confirmed: true,
        tenant_improvements_allowed_with_consent: true,
        supported_accommodation_tenancy: false,
        relevant_gas_fitting_present: false,
        electrical_safety_certificate: true,
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
        epc_rating: 'C',
        right_to_rent_check_date: '2026-04-25',
        how_to_rent_provided: true,
        record_prior_notice_grounds: true,
        prior_notice_grounds: ['ground_4_student_occupation'],
        prior_notice_ground_4_details: 'The property is being let to current students for occupation during the academic year.',
      },
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Prior-Notice Grounds');
    expect(html).toContain('Ground 4: student occupation');
    expect(html).toContain('The property is being let to current students');
  });

  test('uses the written statement variant for existing verbal England assured tenancies', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_premium_tenancy_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2026-05-02',
        england_tenancy_purpose: 'existing_verbal_tenancy',
        existing_verbal_tenancy_summary: true,
        rent_period: 'month',
        payment_method: 'Standing Order',
        bills_included_in_rent: 'no',
        separate_bill_payments_taken: false,
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        england_rent_in_advance_compliant: true,
        england_no_bidding_confirmed: true,
        england_no_discrimination_confirmed: true,
        relevant_gas_fitting_present: false,
        electrical_safety_certificate: true,
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
        epc_rating: 'D',
        right_to_rent_check_date: '2026-04-25',
        how_to_rent_provided: true,
        inspection_frequency: 'Every 6 months',
      },
      { outputFormat: 'html' }
    );

    expect(pack.documents[0].document_type).toBe('england_written_statement_of_terms');
    expect(pack.documents[0].html).toContain('existing verbal England assured tenancy');
    expect(pack.documents.map((document) => document.document_type)).toContain('pre_tenancy_checklist_england');
  });

  test('uses transition guidance and the information sheet for existing written England assured tenancies', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_student_tenancy_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2025-09-01',
        england_tenancy_purpose: 'existing_written_tenancy',
        existing_written_tenancy_transition: true,
      },
      { outputFormat: 'html' }
    );

    expect(pack.documents.map((document) => document.document_type)).toEqual([
      'england_tenancy_transition_guidance',
      'renters_rights_information_sheet_2026',
    ]);
    expect(pack.documents[0].html).toContain('Renters&#x27; Rights Act Information Sheet 2026');
    expect(pack.documents[1].pdf).toBeInstanceOf(Buffer);
  });

  test('keeps the lodger pack separate from the assured-tenancy statutory layer', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_lodger_agreement',
      {
        ...baseFacts,
        resident_landlord_confirmed: true,
        shared_kitchen_or_bathroom: true,
        house_rules_notes: 'No overnight guests without prior agreement.',
        licence_notice_period: '28 days',
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
      },
      { outputFormat: 'html' }
    );

    expect(pack.documents.map((document) => document.document_type)).toEqual([
      'england_lodger_agreement',
      'england_lodger_checklist',
      'england_keys_handover_record',
      'england_lodger_house_rules_appendix',
    ]);
    expect(pack.documents[0].html).toContain('resident-landlord arrangement');
    expect(pack.documents[0].html).not.toContain('Section 13');
    expect(pack.documents[0].html).not.toContain('fit for human habitation');
  });

  test('uses post-1 May 2026 England written-information wording instead of How to Rent in modern assured packs', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts(),
      { outputFormat: 'html' }
    );

    const agreementHtml = pack.documents[0].html;
    const checklistHtml =
      pack.documents.find((document) => document.document_type === 'pre_tenancy_checklist_england')?.html || '';

    expect(agreementHtml).toContain('England written information route');
    expect(agreementHtml).toContain('Written tenancy terms recorded in this agreement');
    expect(agreementHtml).not.toContain('How to Rent guide provided');
    expect(checklistHtml).toContain('England written information prepared for this tenancy route');
    expect(checklistHtml).toContain('England written information included');
    expect(checklistHtml).not.toContain('How to Rent guide provided');
  });

  test('hard-stops the lodger route when the resident-landlord facts contradict the product', async () => {
    await expect(
      generateResidentialLettingDocuments(
        'england_lodger_agreement',
        {
          ...baseFacts,
          tenancy_start_date: '2026-05-02',
          resident_landlord_confirmed: false,
          shared_kitchen_or_bathroom: false,
        },
        { outputFormat: 'html' }
      )
    ).rejects.toThrow(/resident landlord/i);
  });

  test('hard-stops the HMO route when the shared-house facts do not justify it', async () => {
    await expect(
      generateResidentialLettingDocuments(
        'england_hmo_shared_house_tenancy_agreement',
        createBaseEnglandAssuredFacts({
          is_hmo: false,
          number_of_sharers: 1,
          communal_areas: '',
          shared_facilities: false,
        }),
        { outputFormat: 'html' }
      )
    ).rejects.toThrow(/HMO|shared-house/i);
  });

  test('renders the modern England assured baseline without fixed-term or section 21 wording', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts(),
      { outputFormat: 'html' }
    );

    const html = pack.documents[0].html;

    expect(html).toContain('Form 4A');
    expect(html).toContain('section 21 no-fault route');
    expect(html).toContain('No separate fixed-term drafting is created by this document');
    expect(html).not.toContain('assured shorthold tenancy');
  });

  test('adds the guarantor deed for the student product when selected', async () => {
    const pack = await generateResidentialLettingDocuments(
      'england_student_tenancy_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2026-05-02',
        england_tenancy_purpose: 'new_agreement',
        rent_period: 'month',
        payment_method: 'Standing Order',
        bills_included_in_rent: 'no',
        separate_bill_payments_taken: false,
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        england_rent_in_advance_compliant: true,
        england_no_bidding_confirmed: true,
        england_no_discrimination_confirmed: true,
        relevant_gas_fitting_present: false,
        electrical_safety_certificate: true,
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
        epc_rating: 'C',
        right_to_rent_check_date: '2026-04-25',
        how_to_rent_provided: true,
        guarantor_required: 'yes',
        guarantor_full_name: 'Greg Guarantor',
        guarantor_address: '77 Support Avenue, Bristol, BS1 4AB',
        guarantor_email: 'greg@example.com',
        guarantor_phone: '07000 222222',
      },
      { outputFormat: 'html' }
    );

    expect(pack.documents.map((document) => document.document_type)).toContain('guarantor_agreement');
  });

  test('renders richer Premium, Student, and HMO support schedules with product-specific content', async () => {
    const premiumPack = await generateResidentialLettingDocuments(
      'england_premium_tenancy_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2026-05-02',
        england_tenancy_purpose: 'new_agreement',
        rent_period: 'month',
        payment_method: 'Standing Order',
        bills_included_in_rent: 'no',
        separate_bill_payments_taken: false,
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        england_rent_in_advance_compliant: true,
        england_no_bidding_confirmed: true,
        england_no_discrimination_confirmed: true,
        relevant_gas_fitting_present: true,
        gas_safety_certificate: true,
        electrical_safety_certificate: true,
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
        epc_rating: 'C',
        right_to_rent_check_date: '2026-04-25',
        management_contact_channel: 'email',
        routine_inspection_window: 'quarterly_weekday_daytime',
        repair_reporting_contact: 'Landlord direct by email',
        repair_response_timeframe: 'within_24_hours',
        key_holders_summary: '2 front-door keys and 1 fob',
        check_in_documentation_expectation: 'Tenant to review the signed inventory, meter readings, and key record at check-in.',
        utilities_transfer_expectation: 'Tenant to open supplier accounts from the tenancy start date using the recorded opening readings.',
        contractor_access_procedure: 'Tenant to be notified before contractor attendance.',
        contractor_key_release_policy: 'Keys released to contractors only against a signed key register and same-day return expectation.',
        handover_expectations: 'Return all keys and provide final meter readings.',
      },
      { outputFormat: 'html' }
    );

    const studentPack = await generateResidentialLettingDocuments(
      'england_student_tenancy_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2026-05-02',
        england_tenancy_purpose: 'new_agreement',
        rent_period: 'month',
        payment_method: 'Standing Order',
        bills_included_in_rent: 'no',
        separate_bill_payments_taken: false,
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        england_rent_in_advance_compliant: true,
        england_no_bidding_confirmed: true,
        england_no_discrimination_confirmed: true,
        relevant_gas_fitting_present: false,
        electrical_safety_certificate: true,
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
        epc_rating: 'C',
        right_to_rent_check_date: '2026-04-25',
        guarantor_required: 'yes',
        guarantor_full_name: 'Greg Guarantor',
        guarantor_address: '77 Support Avenue, Bristol, BS1 4AB',
        guarantor_email: 'greg@example.com',
        joint_tenancy: 'yes',
        all_tenants_full_time_students: 'yes',
        student_replacement_procedure: 'yes',
        student_guarantor_scope: 'rent_and_all_tenant_obligations',
        replacement_notice_window: '21_days',
        replacement_cost_responsibility: 'outgoing_tenant',
        student_end_of_term_expectations: 'Rooms to be returned clean and with all keys.',
        student_move_out_keys_process: 'Keys to be returned to the managing agent office.',
        student_cleaning_standard: 'Professional-clean standard for kitchen and bathrooms.',
      },
      { outputFormat: 'html' }
    );

    const hmoPack = await generateResidentialLettingDocuments(
      'england_hmo_shared_house_tenancy_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2026-05-02',
        england_tenancy_purpose: 'new_agreement',
        rent_period: 'month',
        payment_method: 'Standing Order',
        bills_included_in_rent: 'yes',
        included_bills_notes: 'Utilities and broadband',
        separate_bill_payments_taken: false,
        tenant_notice_period: '2 months',
        rent_increase_method: 'Section 13 rent increase process',
        england_rent_in_advance_compliant: true,
        england_no_bidding_confirmed: true,
        england_no_discrimination_confirmed: true,
        relevant_gas_fitting_present: true,
        gas_safety_certificate: true,
        electrical_safety_certificate: true,
        smoke_alarms_fitted: true,
        carbon_monoxide_alarms: true,
        epc_rating: 'C',
        right_to_rent_check_date: '2026-04-25',
        is_hmo: 'yes',
        number_of_sharers: 5,
        communal_areas: 'Kitchen, lounge, bathroom, and garden',
        hmo_licence_status: 'currently_licensed',
        communal_cleaning: 'professional_cleaner',
        visitor_policy: 'Overnight guests only with prior written approval.',
        waste_collection_arrangements: 'Bins to be presented every Tuesday night.',
        fire_safety_notes: 'Do not tamper with detectors and keep escape routes clear.',
      },
      { outputFormat: 'html' }
    );

    expect(premiumPack.documents.map((document) => document.document_type)).toContain(
      'england_premium_management_schedule'
    );
    expect(
      premiumPack.documents.find((document) => document.document_type === 'england_premium_management_schedule')?.html
    ).toContain('Repairs reporting contact');
    expect(
      premiumPack.documents.find((document) => document.document_type === 'england_premium_management_schedule')?.html
    ).toContain('Primary management contact channel');
    expect(
      premiumPack.documents.find((document) => document.document_type === 'england_premium_management_schedule')?.html
    ).toContain('Check-in paperwork expectation');
    expect(premiumPack.documents[0].html).toContain('Premium Handover, Reporting, and Evidence Protocol');
    expect(premiumPack.documents[0].html).toContain('Utilities and account transfer expectation');

    expect(studentPack.documents.map((document) => document.document_type)).toContain(
      'england_student_move_out_schedule'
    );
    expect(
      studentPack.documents.find((document) => document.document_type === 'england_student_move_out_schedule')?.html
    ).toContain('Student Move-Out and Guarantor Schedule');

    expect(hmoPack.documents.map((document) => document.document_type)).toContain(
      'england_hmo_house_rules_appendix'
    );
    expect(
      hmoPack.documents.find((document) => document.document_type === 'england_hmo_house_rules_appendix')?.html
    ).toContain('HMO / Shared House Rules Appendix');
  });
  test('cleans fallback wording and raw codes from England tenancy outputs', async () => {
    const standardPack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts(),
      { outputFormat: 'html' }
    );

    const hmoPack = await generateResidentialLettingDocuments(
      'england_hmo_shared_house_tenancy_agreement',
      createBaseEnglandAssuredFacts({
        is_hmo: 'yes',
        number_of_sharers: 5,
        communal_areas: 'Kitchen, lounge, bathroom, and garden',
        hmo_licence_status: 'currently_licensed',
        communal_cleaning: 'professional_cleaner',
      }),
      { outputFormat: 'html' }
    );

    const lodgerPack = await generateResidentialLettingDocuments(
      'england_lodger_agreement',
      {
        ...baseFacts,
        tenancy_start_date: '2026-05-02',
        rent_period: 'month',
        payment_method: 'bank_transfer',
        rent_amount: 850,
        resident_landlord_confirmed: true,
        shared_kitchen_or_bathroom: true,
        house_rules_notes: 'No overnight guests without prior agreement.',
      },
      { outputFormat: 'html' }
    );

    const standardHtml = standardPack.documents[0].html.replace(/&#163;/g, '£');
    const hmoHtml = hmoPack.documents[0].html.replace(/&#163;/g, '£');
    const lodgerHtml = lodgerPack.documents[0].html.replace(/&#163;/g, '£');

    expect(standardHtml).not.toContain('Pets authorised at the start: .');
    expect(standardHtml).not.toContain('Smoking policy: Not stated.');
    expect(standardHtml).not.toContain('Subletting / short-let policy: Not stated.');
    expect(standardHtml).not.toContain('Inspection frequency recorded: Not stated.');
    expect(standardHtml).toContain('RL-ENGLAND-STANDARD-TA-55555555');

    expect(hmoHtml).toContain('Currently licensed');
    expect(hmoHtml).toContain('Professional cleaner');
    expect(hmoHtml).not.toContain('currently_licensed');
    expect(hmoHtml).not.toContain('professional_cleaner');

    expect(lodgerHtml).toContain('Bank transfer');
    expect(lodgerHtml).toContain('Monthly');
    expect(lodgerHtml).toContain('RL-ENGLAND-LODGER-AGREEMENT-55555555');
  });
  test('uses readable suffixes for human-friendly case ids in England tenancy references', async () => {
    const standardPack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts({
        case_id: 'golden-standard-tenancy-001',
      }),
      { outputFormat: 'html' }
    );

    const lodgerPack = await generateResidentialLettingDocuments(
      'england_lodger_agreement',
      {
        ...baseFacts,
        case_id: 'golden-lodger-001',
        tenancy_start_date: '2026-05-02',
        resident_landlord_confirmed: true,
        shared_kitchen_or_bathroom: true,
      },
      { outputFormat: 'html' }
    );

    const standardHtml = standardPack.documents[0].html.replace(/&#163;/g, '£');
    const lodgerHtml = lodgerPack.documents[0].html.replace(/&#163;/g, '£');

    expect(standardHtml).toContain('RL-ENGLAND-STANDARD-TA-TENANCY-001');
    expect(standardHtml).not.toContain('RL-ENGLAND-STANDARD-TA-ANCY-001');
    expect(lodgerHtml).toContain('RL-ENGLAND-LODGER-AGREEMENT-LODGER-001');
    expect(lodgerHtml).not.toContain('RL-ENGLAND-LODGER-AGREEMENT-DGER-001');
  });
  test('keeps key England tenancy support documents available as PDFs', async () => {
    const standardPack = await generateResidentialLettingDocuments(
      'england_standard_tenancy_agreement',
      createBaseEnglandAssuredFacts(),
      { outputFormat: 'both' }
    );

    const premiumPack = await generateResidentialLettingDocuments(
      'england_premium_tenancy_agreement',
      createBaseEnglandAssuredFacts(),
      { outputFormat: 'both' }
    );

    const studentPack = await generateResidentialLettingDocuments(
      'england_student_tenancy_agreement',
      createBaseEnglandAssuredFacts({
        tenants: [
          {
            full_name: 'Alice Tenant',
            email: 'alice@example.com',
            phone: '07000 111111',
            address: '12 Example Street, London, SW1A 1AA',
          },
          {
            full_name: 'Ben Tenant',
            email: 'ben@example.com',
            phone: '07000 222222',
            address: '12 Example Street, London, SW1A 1AA',
          },
        ],
        guarantor_required: 'yes',
        guarantor_full_name: 'Greg Guarantor',
        guarantor_address: '77 Support Avenue, Bristol, BS1 4AB',
        guarantor_email: 'greg@example.com',
        guarantor_phone: '07000 333333',
      }),
      { outputFormat: 'both' }
    );

    expect(
      standardPack.documents.find((document) => document.document_type === 'england_utilities_handover_sheet')?.pdf
    ).toBeTruthy();
    expect(
      premiumPack.documents.find((document) => document.document_type === 'pre_tenancy_checklist_england')?.pdf
    ).toBeTruthy();
    expect(
      premiumPack.documents.find((document) => document.document_type === 'deposit_protection_certificate')?.pdf
    ).toBeTruthy();
    expect(
      premiumPack.documents.find((document) => document.document_type === 'tenancy_deposit_information')?.pdf
    ).toBeTruthy();
    expect(
      studentPack.documents.find((document) => document.document_type === 'england_tenancy_variation_record')?.pdf
    ).toBeTruthy();
  }, 120000);
});


