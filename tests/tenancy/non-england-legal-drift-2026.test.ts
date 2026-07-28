import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateASTData } from '@/lib/documents/ast-generator';
import { isProductAvailableInRegion } from '@/lib/pricing/products';
import {
  isNonEnglandStandardTenancyPubliclyEnabled,
  isStandardTenancyEntryProduct,
} from '@/lib/tenancy/non-england-rollout';
import {
  NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION,
  isNonEnglandStandardTenancyCertified,
} from '@/lib/tenancy/non-england-certification';

const root = process.cwd();

function read(relativePath: string): string {
  return readFileSync(join(root, relativePath), 'utf8');
}

function completeAgreementData(jurisdiction: 'wales' | 'scotland' | 'northern-ireland') {
  const data = {
    jurisdiction,
    agreement_date: '2026-07-27',
    landlord_full_name: 'Example Landlord',
    landlord_address: '1 Example Street',
    landlord_email: 'landlord@example.com',
    landlord_phone: '07000000000',
    tenants: [
      {
        full_name: 'Example Tenant',
        email: 'tenant@example.com',
        phone: '07111111111',
      },
    ],
    property_address: '2 Example Road',
    tenancy_start_date: '2026-08-01',
    is_fixed_term: false,
    rent_amount: 1_000,
    rent_period: 'month' as const,
    deposit_amount: 0,
    deposit_scheme_name: 'TDS' as const,
    inventory_delivery_method: 'later' as const,
  };

  if (jurisdiction === 'wales') {
    return {
      ...data,
      rent_smart_wales_registered: true,
      rent_smart_wales_registration_number: 'RSW-REG-TEST',
    };
  }
  if (jurisdiction === 'scotland') {
    return {
      ...data,
      deposit_payer: 'Example Tenant',
      deposit_scheme_address: 'Example scheme address',
      deposit_scheme_contact_details: 'Example scheme contact',
    };
  }
  return {
    ...data,
    ni_capital_value: '£100,000',
    ni_rates_payable: '£1,000 per year',
    ni_rates_included_in_rent: 'Included',
    ni_other_required_payments: 'None',
  };
}

describe('2026 non-England tenancy legal drift safeguards', () => {
  it('blocks deposits above the Northern Ireland one-month cap', () => {
    const data = {
      ...completeAgreementData('northern-ireland'),
      deposit_amount: 1_000.02,
    };

    expect(validateASTData(data)).toContain(
      'deposit_amount exceeds the Northern Ireland one-month statutory cap (£1000.00)'
    );
  });

  it('allows a Scotland deposit up to two months and rejects anything higher', () => {
    expect(
      validateASTData({
        ...completeAgreementData('scotland'),
        deposit_amount: 2_000,
      })
    ).toEqual([]);

    expect(
      validateASTData({
        ...completeAgreementData('scotland'),
        deposit_amount: 2_000.02,
      })
    ).toContain(
      'deposit_amount exceeds the Scotland two-month statutory cap (£2000.00)'
    );
  });

  it('does not offer or generate a fixed-term Scottish PRT', () => {
    const questionSet = read('config/mqs/tenancy_agreement/scotland.yaml');
    const generator = read('src/lib/documents/ast-generator.ts');

    expect(questionSet).not.toContain('id: is_fixed_term');
    expect(questionSet).not.toContain('id: tenancy_end_date');
    expect(generator).toContain("if (jurisdiction === 'scotland')");
    expect(generator).toContain('data.is_fixed_term = false');
    expect(
      validateASTData({
        ...completeAgreementData('scotland'),
        is_fixed_term: true,
        tenancy_end_date: '2027-08-01',
        term_length: '12 months',
      })
    ).toEqual([]);
  });

  it('does not apply the England five or six week deposit cap to Wales', () => {
    expect(
      validateASTData({
        ...completeAgreementData('wales'),
        deposit_amount: 2_000,
      })
    ).toEqual([]);

    expect(read('config/jurisdictions/uk/wales/index.json')).not.toContain(
      "5 weeks' rent cap"
    );
  });

  it('keeps current Northern Ireland deposit deadlines in every generated template', () => {
    const templates = [
      'config/jurisdictions/uk/northern-ireland/templates/private_tenancy_agreement.hbs',
      'config/jurisdictions/uk/northern-ireland/templates/private_tenancy_premium.hbs',
      'config/jurisdictions/uk/northern-ireland/templates/private_tenancy_hmo.hbs',
    ];

    for (const templatePath of templates) {
      const template = read(templatePath);
      expect(template).toContain('28 days');
      expect(template).toContain('35 days');
      expect(template).toContain("one month's Rent");
      expect(template).not.toMatch(/protect(?:ed)?[^.\n]{0,80}within 14 days/i);
    }
  });

  it('includes the Wales June 2026 children and benefits fundamental terms', () => {
    const templates = [
      'config/jurisdictions/uk/wales/templates/standard_occupation_contract.hbs',
      'config/jurisdictions/uk/wales/templates/premium_occupation_contract.hbs',
      'config/jurisdictions/uk/wales/templates/occupation_contract_hmo.hbs',
    ];

    for (const templatePath of templates) {
      const template = read(templatePath);
      expect(template).toMatch(/person (?:under 18|who has not reached the age of 18)/i);
      expect(template).toMatch(/benefits claimant/i);
      expect(template).toContain('section 8J');
    }
  });

  it('offers standard agreements only outside England', () => {
    const jurisdictions = ['wales', 'scotland', 'northern-ireland'];
    const landingPages = [
      'src/app/tenancy-agreements/wales/page.tsx',
      'src/app/tenancy-agreements/scotland/page.tsx',
      'src/app/tenancy-agreements/northern-ireland/page.tsx',
    ];
    const questionSets = [
      'config/mqs/tenancy_agreement/wales.yaml',
      'config/mqs/tenancy_agreement/scotland.yaml',
      'config/mqs/tenancy_agreement/northern-ireland.yaml',
    ];

    for (const jurisdiction of jurisdictions) {
      expect(isProductAvailableInRegion('ast_standard', jurisdiction)).toBe(true);
      expect(isProductAvailableInRegion('ast_premium', jurisdiction)).toBe(false);
    }

    for (const pagePath of landingPages) {
      expect(read(pagePath)).not.toContain('ast_premium');
    }

    for (const questionSetPath of questionSets) {
      const questionSet = read(questionSetPath);
      const productSelection = questionSet.match(
        /- id: (?:occupation_contract_tier|prt_tier|ni_tier)[\s\S]*?validation:/
      )?.[0];
      expect(productSelection).toBeDefined();
      expect(productSelection).not.toMatch(/Premium/);
    }
  });

  it('bundles the official Scottish Government statutory supporting notes', () => {
    const notesPath =
      'config/mqs/tenancy_agreement/scotland_prt_statutory_terms_supporting_notes_april_2024.pdf';
    const notes = readFileSync(join(root, notesPath));
    const generator = read('src/lib/documents/ast-generator.ts');

    expect(notes.byteLength).toBeGreaterThan(300_000);
    expect(notes.subarray(0, 4).toString('ascii')).toBe('%PDF');
    expect(generator).toContain(
      'scotland_prt_statutory_terms_supporting_notes_april_2024.pdf'
    );
    expect(generator).toContain('appendScotlandStatutorySupportingNotes');
  });

  it('bundles the official Northern Ireland prescribed notice and guidance', () => {
    const notice = readFileSync(
      join(
        root,
        'config/mqs/tenancy_agreement/northern_ireland_tenancy_information_notice_2023.pdf'
      )
    );
    const guidance = readFileSync(
      join(
        root,
        'config/mqs/tenancy_agreement/northern_ireland_tenancy_information_notice_guidance_2023.pdf'
      )
    );
    const generator = read('src/lib/documents/ast-generator.ts');

    expect(notice.subarray(0, 4).toString('ascii')).toBe('%PDF');
    expect(guidance.subarray(0, 4).toString('ascii')).toBe('%PDF');
    expect(generator).toContain('appendNorthernIrelandPrescribedDocuments');
    expect(generator).toContain('tenancy_information_notice_northern_ireland');
  });

  it('pins the official Wales and Scotland model baselines used for certification', () => {
    const baselineDirectory =
      'config/mqs/tenancy_agreement/official_model_sources';
    const baselines = JSON.parse(
      read(`${baselineDirectory}/certification-baselines.json`)
    ) as {
      sources: Array<{
        file: string;
        pages: number;
        sha256: string;
      }>;
    };

    expect(baselines.sources).toHaveLength(3);

    for (const source of baselines.sources) {
      const bytes = readFileSync(join(root, baselineDirectory, source.file));
      const digest = createHash('sha256').update(bytes).digest('hex').toUpperCase();

      expect(bytes.subarray(0, 4).toString('ascii')).toBe('%PDF');
      expect(source.pages).toBeGreaterThan(30);
      expect(digest).toBe(source.sha256);
    }
  });

  it('uses the controlled certification record as the canonical release state', () => {
    for (const jurisdiction of [
      'wales',
      'scotland',
      'northern-ireland',
    ] as const) {
      expect(isNonEnglandStandardTenancyCertified(jurisdiction)).toBe(true);
      expect(isNonEnglandStandardTenancyPubliclyEnabled(jurisdiction)).toBe(
        true
      );
      expect(
        NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION[jurisdiction]
          .modelParityVerified
      ).toBe(true);
      expect(
        NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION[jurisdiction]
          .prescribedDocumentWorkflowVerified
      ).toBe(true);
      expect(
        NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION[jurisdiction].releaseEnabled
      ).toBe(true);
    }

    expect(isStandardTenancyEntryProduct('ast_standard')).toBe(true);
    expect(isStandardTenancyEntryProduct('tenancy_agreement')).toBe(true);
    expect(isStandardTenancyEntryProduct('ast_premium')).toBe(false);
  });
});
