import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../generator', async () => {
  const actual = await vi.importActual<typeof import('../generator')>('../generator');

  return {
    ...actual,
    htmlToPdf: vi.fn().mockResolvedValue(Buffer.from('pdf')),
  };
});

import { mapWizardToASTData } from '../ast-wizard-mapper';
import { generatePremiumAST, generateStandardAST } from '../ast-generator';
import { generateDocument, htmlToPdf } from '../generator';

function createBaseWizardFacts() {
  return {
    __meta: {
      product: 'ast_standard',
      original_product: 'ast_standard',
      jurisdiction: 'england',
    },
    property_country: 'england',
    agreement_date: '2026-05-20',
    landlord_full_name: 'Amelia Hart',
    landlord_address_line1: '14 Kingsway',
    landlord_address_town: 'London',
    landlord_address_postcode: 'WC2B 6UN',
    landlord_email: 'amelia.hart@example.com',
    landlord_phone: '07000000010',
    property_address_line1: 'Flat 4, 19 River Street',
    property_address_town: 'Manchester',
    property_address_postcode: 'M3 4EN',
    property_type: 'flat',
    number_of_bedrooms: 2,
    furnished_status: 'part-furnished',
    tenancy_start_date: '2026-06-01',
    rent_amount: 1450,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    payment_method: 'Standing Order',
    deposit_amount: 1450,
    deposit_scheme_name: 'DPS',
    gas_safety_certificate: true,
    electrical_safety_certificate: true,
    epc_rating: 'C',
    pets_allowed: false,
    smoking_allowed: false,
    right_to_rent_check_date: '2026-05-22',
    tenants: [
      {
        full_name: 'Noah Bennett',
        dob: '1992-09-14',
        email: 'noah.bennett@example.com',
        phone: '07000000011',
      },
    ],
  };
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

const TEMPLATE_HIDDEN_BREAK_CHAR_PATTERN = /[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/;
const TEMPLATE_MOJIBAKE_PATTERN = /Â£|â€¢|âœ|âš|ðŸ|Ã—|â‰¤/;

function createPremiumSupportData() {
  const wizardFacts = {
    ...createBaseWizardFacts(),
    __meta: {
      product: 'ast_premium',
      original_product: 'ast_premium',
      jurisdiction: 'england',
    },
    pets_allowed: true,
    approved_pets: '1 indoor cat named Pebble',
    guarantor_required: true,
    guarantor_name: 'Olivia Bennett',
    guarantor_address: '8 Hill View, York, YO10 4BD',
    guarantor_email: 'olivia.bennett@example.com',
    guarantor_phone: '07000000030',
    guarantor_dob: '1971-03-05',
    guarantor_relationship: 'Parent of lead tenant',
  };

  const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'england' }) as Record<string, any>;

  return {
    ...astData,
    case_id: 'ENG-QA-SUPPORT',
    document_id: 'ENG-QA-SUPPORT',
    key_return_deadline: 'the agreed checkout handover time',
    deposit_return_timeline: '10 days after agreement or scheme decision',
    number_of_front_door_keys: 2,
    number_of_back_door_keys: 1,
    number_of_mailbox_keys: 1,
    access_cards_fobs: 1,
    key_replacement_cost: 25,
    grace_period_days: 14,
    late_payment_interest_rate: 3,
    late_payment_admin_fee: 35,
    bank_account_name: 'Amelia Hart',
    bank_sort_code: '12-34-56',
    bank_account_number: '12345678',
    emergency_landlord_phone: '07000000010',
    emergency_plumber_phone: '07000000040',
    emergency_electrician_phone: '07000000041',
    emergency_gas_engineer_phone: '07000000042',
    emergency_locksmith_phone: '07000000043',
    water_shutoff_location: 'Kitchen sink cupboard',
    fuse_box_location: 'Hallway utility cupboard',
    gas_shutoff_location: 'External meter box',
    has_garden: true,
    garden_condition_required: 'tidy and reasonably maintained',
    lawn_mowing_responsibility: 'Tenant',
    hedge_trimming_responsibility: 'Landlord',
    weed_control_responsibility: 'Tenant',
    boiler_service_responsibility: 'Landlord',
    boiler_service_frequency: 'annually',
    gutter_cleaning_frequency: 'twice yearly',
    gutter_cleaning_responsibility: 'Landlord',
    professional_cleaning_standard: true,
    professional_cleaning_required: true,
    oven_cleaning_required: true,
    carpet_cleaning_required: true,
    cleaning_cost_estimates: 220,
    contractor_access_notice_period: '24 hours',
    inventory_attached: true,
    prescribed_information_served: false,
    how_to_rent_guide_provided: false,
    tenant_insurance_required: true,
  };
}

describe('England assured periodic output templates', () => {
  it('updates the standard generator output with possession, notice, and section 13 wording', async () => {
    const wizardFacts = createBaseWizardFacts();
    const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'england' });

    const document = await generateStandardAST(astData);

    expect(document.html).toContain(
      'This tenancy does not have a fixed end date and continues until ended in accordance with statute.'
    );
    expect(document.html).toContain(
      'The Landlord may only seek possession where a lawful statutory ground applies, including any relevant rent arrears, anti-social behaviour, sale, landlord occupation, or other statutory ground in force at the relevant time.'
    );
    expect(document.html).toContain(
      'The Landlord may only recover possession or terminate the tenancy through the court-led statutory process in force at the relevant time and by obtaining any court order required by law.'
    );
    expect(document.html).toContain(
      'serve a possession notice using the correct form, specify the ground or grounds relied on, and give the minimum notice period that applies to that ground or those grounds before court proceedings begin.'
    );
    expect(document.html).toContain(
      'The Tenant has the right to remain in the Property unless and until the Landlord establishes a lawful statutory ground for possession and obtains any court order required by law.'
    );
    expect(document.html).toContain(
      'The Tenant may end the tenancy by giving written notice in accordance with the statutory requirements in force at the relevant time.'
    );
    expect(document.html).toContain(
      'If the Landlord proposes a new rent, the Landlord will serve notice in accordance with section 13 of the Housing Act 1988 or any replacement statutory procedure in force at the relevant time.'
    );
    expect(document.html).toContain(
      'including information about the tenant notice requirements, the section 13 rent increase route or any replacement statutory route in force at the relevant time, the landlord possession process'
    );
    expect(document.html).toContain(
      'any England statutory tenant information or government guidance required by law for the tenancy route'
    );
    expect(document.html).toContain('section 9A of the Landlord and Tenant Act 1985');
    expect(document.html).toContain('regulation 3 of the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020');
    expect(document.html).toContain('Regulation 36 of the Gas Safety (Installations and Use) Regulations 1998');
    expect(document.html).toContain('section 16A of the Housing Act 1988');
    expect(document.html).toContain('cannot be unreasonably refused');
    expect(document.html).toContain(
      "including the Renters' Rights Act Information Sheet 2026 or other prescribed written information where applicable"
    );
    expect(countOccurrences(document.html, 'section 13 of the Housing Act 1988')).toBeGreaterThanOrEqual(2);
    expect(document.html).not.toContain("at least two months' written notice");
    expect(document.html).not.toContain('expiring at the end of a rental period where applicable');
    expect(document.html).not.toContain('How to Rent guide where legally applicable');
    expect(htmlToPdf).toHaveBeenCalled();
  });

  it('updates the premium generator output and removes the About This Agreement block', async () => {
    const wizardFacts = {
      ...createBaseWizardFacts(),
      __meta: {
        product: 'ast_premium',
        original_product: 'ast_premium',
        jurisdiction: 'england',
      },
      pets_allowed: true,
      approved_pets: '1 indoor cat named Pebble',
      guarantor_required: true,
      guarantor_name: 'Olivia Bennett',
      guarantor_address: '8 Hill View, York, YO10 4BD',
      guarantor_email: 'olivia.bennett@example.com',
      guarantor_phone: '07000000030',
      guarantor_dob: '1971-03-05',
      guarantor_relationship: 'Parent of lead tenant',
    };
    const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'england' });

    const document = await generatePremiumAST(astData);

    expect(document.html).not.toContain('About This Agreement');
    expect(document.html).not.toContain(
      'This document is drafted for an England residential tenancy governed by the upgraded assured periodic regime'
    );
    expect(document.html).toContain(
      'This tenancy does not have a fixed end date and continues until ended in accordance with statute.'
    );
    expect(document.html).toContain(
      'The Landlord may only seek possession where a lawful statutory ground applies, including any relevant rent arrears, anti-social behaviour, sale, landlord occupation, or other statutory ground in force at the relevant time.'
    );
    expect(document.html).toContain(
      'The Landlord may only recover possession or terminate the tenancy through the court-led statutory process in force at the relevant time and by obtaining any court order required by law.'
    );
    expect(document.html).toContain(
      'serve a possession notice using the correct form, specify the ground or grounds relied on, and give the minimum notice period that applies to that ground or those grounds before court proceedings begin.'
    );
    expect(document.html).toContain(
      'The Tenant has the right to remain in the Property unless and until the Landlord establishes a lawful statutory ground for possession and obtains any court order required by law.'
    );
    expect(document.html).toContain(
      'The Tenant may end the tenancy by giving written notice in accordance with the statutory requirements in force at the relevant time.'
    );
    expect(document.html).toContain(
      'If the Landlord proposes a new rent, the Landlord will serve notice in accordance with section 13 of the Housing Act 1988 or any replacement statutory procedure in force at the relevant time. Nothing in this Agreement authorises a prohibited fee or charge.'
    );
    expect(document.html).toContain(
      'Any authorised pet is permitted subject to this Agreement and any lawful reasonable conditions the Landlord may impose in writing, having regard to the request and the suitability of the Property.'
    );
    expect(document.html).toContain('section 16A of the Housing Act 1988');
    expect(document.html).toContain(
      'The Tenant remains responsible for any pet-related damage, nuisance, fouling, infestation, smell, scratching, staining, or other related loss. The Landlord may require reasonable cleaning, treatment, or remediation where needed to restore the Property to the standard required by this Agreement, but nothing in this clause requires a prohibited payment or mandatory professional cleaning in every case.'
    );
    expect(document.html).toContain(
      'The Guarantor guarantees the payment of the Rent and the performance of the Tenant obligations and agrees to indemnify the Landlord against losses arising from any breach of them.'
    );
    expect(document.html).toContain(
      'The Landlord may pursue the Guarantor directly, without first taking action against the Tenant or any other person liable under this Agreement.'
    );
    expect(document.html).toContain(
      'This is a continuing guarantee. It applies to this tenancy and to any lawful continuation, statutory continuation, renewal, replacement, or variation of it unless and until the Landlord expressly releases the Guarantor in writing.'
    );
    expect(document.html).toContain(
      "The Guarantor's liability is capped at twelve months' rent together with reasonable enforcement costs, save for liabilities already accrued before any written release."
    );
    expect(document.html).toContain(
      'The Guarantor confirms receipt of sufficient information about the tenancy and is advised to take independent legal advice before signing.'
    );
    expect(document.html).toContain(
      'including information about the tenant notice requirements, the section 13 rent increase route or any replacement statutory route in force at the relevant time, the landlord possession process'
    );
    expect(document.html).toContain(
      'any England statutory tenant information or government guidance required by law for the tenancy route'
    );
    expect(document.html).toContain('section 9A of the Landlord and Tenant Act 1985');
    expect(document.html).toContain('regulation 3 of the Electrical Safety Standards in the Private Rented Sector (England) Regulations 2020');
    expect(document.html).toContain('Regulation 36 of the Gas Safety (Installations and Use) Regulations 1998');
    expect(document.html).toContain(
      'Tenant information / government guidance'
    );
    expect(countOccurrences(document.html, 'section 13 of the Housing Act 1988')).toBeGreaterThanOrEqual(2);
    expect(document.html).not.toContain("not less than two months' written notice");
    expect(document.html).not.toContain('expiring at the end of a rental period where applicable');
    expect(document.html).not.toContain('How to Rent Guide</td>');
    expect(htmlToPdf).toHaveBeenCalled();
  });

  it('keeps the England tenancy templates and acknowledgements free from hidden break characters', () => {
    const files = [
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/standard_ast_formatted.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/premium_ast_formatted.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/_partials/statutory_acknowledgements.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/ast_legal_validity_summary.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/deposit_protection_certificate.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/tenancy_deposit_information.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/premium/key_schedule.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/premium/checkout_procedure.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/premium/property_maintenance_guide.hbs'),
      join(process.cwd(), 'config/jurisdictions/uk/england/templates/premium/tenant_welcome_pack.hbs'),
    ];

    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      expect(content).not.toMatch(TEMPLATE_HIDDEN_BREAK_CHAR_PATTERN);
    }
  });

  it('renders England support templates with post-reform wording and no mojibake drift', async () => {
    const data = createPremiumSupportData();
    const templates = {
      summary: 'uk/england/templates/ast_legal_validity_summary.hbs',
      depositCertificate: 'uk/england/templates/deposit_protection_certificate.hbs',
      prescribedInformation: 'uk/england/templates/tenancy_deposit_information.hbs',
      keySchedule: 'uk/england/templates/premium/key_schedule.hbs',
      checkout: 'uk/england/templates/premium/checkout_procedure.hbs',
      maintenance: 'uk/england/templates/premium/property_maintenance_guide.hbs',
      welcome: 'uk/england/templates/premium/tenant_welcome_pack.hbs',
    } as const;

    const renderedEntries = await Promise.all(
      Object.entries(templates).map(async ([key, templatePath]) => {
        const document = await generateDocument({
          templatePath,
          data,
          isPreview: false,
          outputFormat: 'both',
        });

        return [key, document.html] as const;
      })
    );

    const rendered = Object.fromEntries(renderedEntries) as Record<keyof typeof templates, string>;

    Object.values(rendered).forEach((html) => {
      expect(html).not.toMatch(TEMPLATE_HIDDEN_BREAK_CHAR_PATTERN);
      expect(html).not.toMatch(TEMPLATE_MOJIBAKE_PATTERN);
    });

    expect(rendered.summary).toContain('is drafted without a fixed end date');
    expect(rendered.summary).toContain('lawful statutory ground and any court order required by law');
    expect(rendered.summary).toContain('section 13 rent increase route');
    expect(rendered.summary).not.toContain('Section 21');
    expect(rendered.summary).not.toContain('England & Wales AST');
    expect(rendered.summary).not.toContain('How to Rent');
    expect(rendered.summary).toContain('England written information or government guidance recorded');

    expect(rendered.keySchedule).toContain('Premium Assured Periodic - Supplementary Document');
    expect(rendered.keySchedule).not.toContain('Premium AST');

    expect(rendered.checkout).toContain(
      'Give written notice in accordance with the statutory requirements and your tenancy documents.'
    );
    expect(rendered.checkout).toContain('specialist cleaning only if reasonably needed to restore the recorded move-in standard');
    expect(rendered.checkout).not.toContain('PROFESSIONAL CLEAN REQUIRED');
    expect(rendered.checkout).not.toContain('Premium AST');

    expect(rendered.maintenance).toContain(
      'arrange specialist cleaning only where reasonably needed to restore that standard'
    );
    expect(rendered.maintenance).not.toContain('Premium AST');

    expect(rendered.welcome).toContain(
      'No separate administrative fee is payable for late payment unless a specific charge is lawful and expressly permitted by the tenancy documents in force at the relevant time.'
    );
    expect(rendered.welcome).not.toContain('Administrative fee for late payment:');
    expect(rendered.welcome).toContain('Contents Insurance Reminder');
    expect(rendered.welcome).not.toContain('Contents Insurance Required');
    expect(rendered.welcome).not.toContain('You must maintain valid contents insurance throughout your tenancy.');
    expect(rendered.welcome).not.toContain('Premium AST');

    expect(rendered.depositCertificate).not.toContain('Â£');
    expect(rendered.prescribedInformation).not.toContain('Â£');
  });
});
