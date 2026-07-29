import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), 'utf8');

const periodicWales = read(
  'config/jurisdictions/uk/wales/templates/standard_occupation_contract.hbs'
);
const fixedWales = read(
  'config/jurisdictions/uk/wales/templates/fixed_term_standard_occupation_contract.hbs'
);
const scotland = read(
  'config/jurisdictions/uk/scotland/templates/prt_agreement.hbs'
);
const generator = read('src/lib/documents/ast-generator.ts');
const walesWizard = read('config/mqs/tenancy_agreement/wales.yaml');
const scotlandWizard = read('config/mqs/tenancy_agreement/scotland.yaml');
const northernIrelandWizard = read(
  'config/mqs/tenancy_agreement/northern-ireland.yaml'
);
const northernIreland = read(
  'config/jurisdictions/uk/northern-ireland/templates/private_tenancy_agreement.hbs'
);
const northernIrelandRentBook = read(
  'config/jurisdictions/uk/northern-ireland/templates/rent_book.hbs'
);

function termNumbers(template: string): number[] {
  return [...template.matchAll(/class="term-number">(\d+)\.<\/span>/g)].map(
    (match) => Number(match[1])
  );
}

describe('branded official-model-derived standard agreements', () => {
  it('keeps government source files as specifications rather than customer PDF overlays', () => {
    expect(generator).not.toContain('generateOfficialModelTenancyPdf');
    expect(generator).not.toContain('officialModelPlaceholderHtml');
    expect(generator).toContain(
      "standardFixed: 'uk/wales/templates/fixed_term_standard_occupation_contract.hbs'"
    );
  });

  it('routes Wales periodic and fixed-term contracts to distinct branded templates', () => {
    expect(periodicWales).toContain('Landlord Heaven');
    expect(periodicWales).toContain('Periodic Standard Occupation Contract');
    expect(periodicWales).toContain('Welsh Government periodic model written statement');
    expect(fixedWales).toContain('Landlord Heaven');
    expect(fixedWales).toContain('Fixed Term Standard Occupation Contract');
    expect(fixedWales).toContain('Welsh Government fixed-term model written statement');
    expect(termNumbers(fixedWales)).toEqual(
      Array.from({ length: 56 }, (_, index) => index + 1)
    );
    const periodicNumbers = [
      ...periodicWales.matchAll(/<strong>(\d+)\.\s*<\/strong>/g),
    ].map((match) => Number(match[1]));
    expect(periodicNumbers).toEqual(
      Array.from({ length: 83 }, (_, index) => index + 1)
    );
  });

  it('contains the June 2026 Welsh rental-discrimination terms in both variants', () => {
    for (const template of [periodicWales, fixedWales]) {
      expect(template).toContain(
        'Prohibition of discrimination against people with children and benefits claimants'
      );
      expect(template).toContain('Right for children to live at or visit dwelling');
      expect(template).toContain('benefits claimant');
    }
  });

  it('preserves all 39 Scottish model clause positions in the branded PRT', () => {
    expect(scotland).toContain('Landlord Heaven');
    expect(scotland).toContain(
      'Scottish Government Model Private Residential Tenancy Agreement (April 2024)'
    );
    expect(termNumbers(scotland)).toEqual(
      Array.from({ length: 33 }, (_, index) => index + 7)
    );
    expect(scotland).toContain('{{tenant_utility_accounts}}');
    expect(scotland).toContain('inventory_lifecycle_state "separate_later"');
    expect(scotland).toContain('inventory_lifecycle_state "attached_completed"');
    expect(scotland).toContain('{{inventory_document_id}}');
    expect(scotland).toContain('{{communication_method}}');
    expect(scotland).toContain('Protection completed:');
    expect(scotland).toContain('Protection pending:');
    expect(scotland).toContain('{{deposit_scheme_address}}');
    expect(scotland).toContain('{{deposit_scheme_contact_details}}');
    expect(scotland).toContain('{{deposit_deduction_circumstances}}');
    expect(scotland).toContain('{{deposit_repayment_dispute_information}}');
    expect(scotland).toContain(
      '{{display_label scotland_rent_control_area_status}}'
    );
    for (const protectedCharacteristic of [
      'age',
      'disability',
      'sex',
      'gender reassignment',
      'marriage or civil partnership',
      'pregnancy or maternity',
      'race',
      'religion or belief',
      'sexual orientation',
    ]) {
      expect(scotland).toContain(protectedCharacteristic);
    }
  });

  it('uses one separately identified inventory for regional Standard packs', () => {
    expect(generator).toContain(
      'appendInventoryScheduleToAgreementWhenClaimed'
    );
    expect(generator).toContain("detectJurisdiction(data) !== 'england'");
    expect(generator).toContain('PDFDocument.load');
    expect(generator).toContain('agreement_schedule_appended: false');
    expect(generator).toContain('separate_inventory_file_included: true');
    expect(generator).toContain('canonical_inventory_id');
  });

  it('generates the prescribed Northern Ireland pack data and current notice periods', () => {
    expect(generator).toContain("rentBook: 'uk/northern-ireland/templates/rent_book.hbs'");
    expect(generator).toContain('northern_ireland_rent_book.pdf');
    expect(northernIrelandRentBook).toContain('{{ni_capital_value}}');
    expect(northernIrelandRentBook).toContain('{{ni_rates_payable}}');
    expect(northernIrelandRentBook).toContain('{{ni_rates_included_in_rent}}');
    expect(northernIrelandRentBook).toContain('{{ni_other_required_payments}}');
    for (const noticePeriod of [
      '4 weeks (28 days)',
      '8 weeks (56 days)',
      '12 weeks (84 days)',
    ]) {
      expect(northernIreland).toContain(noticePeriod);
      expect(northernIrelandWizard).toContain(noticePeriod.split(' ')[0] + ' weeks');
    }
    expect(northernIreland).not.toContain('Section 21');
    expect(northernIreland).not.toContain('section 8 notice');
    expect(northernIreland).not.toContain('First-tier Tribunal');
  });

  it('surfaces the jurisdiction-specific questions consumed by the templates', () => {
    for (const id of [
      'is_fixed_term',
      'term_length',
      'tenancy_end_date',
      'occupation_exclusion_applies',
      'first_payment',
      'first_payment_date',
      'written_statement_provided',
      'landlord_2_full_name',
    ]) {
      expect(walesWizard).toContain(`id: ${id}`);
    }

    for (const id of [
      'included_areas',
      'shared_areas',
      'excluded_areas',
      'communication_method',
      'rent_payment_timing',
      'first_payment_period_from',
      'first_payment_period_to',
      'tenant_utility_accounts',
      'inventory_delivery_method',
      'landlord_2_registration_number',
      'deposit_already_protected',
      'deposit_payer',
      'deposit_scheme_type',
      'deposit_scheme_address',
      'deposit_scheme_contact_details',
      'deposit_deduction_circumstances',
      'deposit_repayment_dispute_information',
      'scotland_rent_control_area_status',
    ]) {
      expect(scotlandWizard).toContain(`id: ${id}`);
    }

    for (const id of [
      'rent_smart_wales_registered',
      'rent_smart_wales_number',
      'rent_smart_wales_expiry',
      'rent_smart_wales_licensed',
      'rent_smart_wales_licence_number',
      'managing_agent_rsw_licensed',
      'managing_agent_rsw_licence_number',
    ]) {
      expect(walesWizard).toContain(`id: ${id}`);
    }

    for (const id of [
      'rent_book_particulars',
      'ni_capital_value',
      'ni_rates_payable',
      'ni_rates_liability',
      'ni_rates_explanation',
      'ni_other_required_payments',
    ]) {
      expect(northernIrelandWizard).toContain(`id: ${id}`);
    }

    expect(scotlandWizard).not.toContain('id: break_clause');
    expect(scotlandWizard).not.toContain('id: uses_model_tenancy_terms');
  });
});
