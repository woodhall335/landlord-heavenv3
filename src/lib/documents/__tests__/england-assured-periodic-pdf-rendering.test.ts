import { describe, expect, it, vi } from 'vitest';

const PDF_TEST_TIMEOUT = 120000;

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

function normalizeExtractedPdfText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

async function loadDocumentModules() {
  const generator = await vi.importActual<typeof import('../generator')>('../generator');
  const astGenerator = await vi.importActual<typeof import('../ast-generator')>('../ast-generator');
  const astWizardMapper = await vi.importActual<typeof import('../ast-wizard-mapper')>('../ast-wizard-mapper');

  return {
    sanitizeHtmlForPdfRendering: generator.sanitizeHtmlForPdfRendering,
    generateStandardAST: astGenerator.generateStandardAST,
    generatePremiumAST: astGenerator.generatePremiumAST,
    mapWizardToASTData: astWizardMapper.mapWizardToASTData,
  };
}

describe('England assured periodic PDF rendering hardening', () => {
  it('sanitizes hidden break characters before render', async () => {
    const { sanitizeHtmlForPdfRendering } = await loadDocumentModules();
    const input = '<p>Cafe\u0301\u00A0oblig\u00ADations\u200B and case\u2011law\u2028line</p>';

    expect(sanitizeHtmlForPdfRendering(input)).toBe('<p>Café obligations and case-law\nline</p>');
  });

  it('renders the standard England agreement with conservative line-breaking and clean HTML output', async () => {
    const { mapWizardToASTData, generateStandardAST } = await loadDocumentModules();
    const wizardFacts = createBaseWizardFacts();
    const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'england' });

    const document = await generateStandardAST(astData);
    expect(document.html).toContain('text-align: left;');
    expect(document.html).toContain('hyphens: none;');
    expect(document.html).toContain('font-variant-ligatures: none;');
    expect(document.html).not.toContain('text-align: justify');
    expect(document.html).not.toContain('hyphens: auto');
    expect(document.html).not.toMatch(/[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/);

    const normalizedHtml = normalizeExtractedPdfText(document.html.replace(/<[^>]+>/g, ' '));

    expect(normalizedHtml).toContain(
      'This tenancy does not have a fixed end date and continues until ended in accordance with statute.'
    );
    expect(normalizedHtml).toContain(
      'The Landlord may only seek possession where a lawful statutory ground applies, including any relevant rent arrears, anti-social behaviour, sale, landlord occupation, or other statutory ground in force at the relevant time.'
    );
    expect(normalizedHtml).toContain(
      'The Landlord may only recover possession or terminate the tenancy through the court-led statutory process in force at the relevant time and by obtaining any court order required by law.'
    );
    expect(normalizedHtml).toContain('Where there is more than one Tenant, their obligations are joint and several.');
    expect(normalizedHtml).not.toMatch(/oblig-\s+ations/i);
    expect(normalizedHtml).not.toMatch(/statut-\s+ory/i);
  }, PDF_TEST_TIMEOUT);

  it('renders the premium England agreement with conservative line-breaking and clean HTML output', async () => {
    const { mapWizardToASTData, generatePremiumAST } = await loadDocumentModules();
    const wizardFacts = {
      ...createBaseWizardFacts(),
      __meta: {
        product: 'ast_premium',
        original_product: 'ast_premium',
        jurisdiction: 'england',
      },
      property_address_line1: '32 Carlton Grove',
      property_address_town: 'Leeds',
      property_address_postcode: 'LS6 1BT',
      rent_amount: 2400,
      deposit_amount: 2400,
      agreement_date: '2026-05-28',
      tenancy_start_date: '2026-06-15',
      landlord_full_name: 'Cedar Estates Ltd',
      landlord_email: 'lettings@cedarestates.example.com',
      landlord_phone: '07000000020',
      agent_name: 'Cedar Estates Management',
      agent_email: 'management@cedarestates.example.com',
      agent_phone: '07000000021',
      pets_allowed: true,
      approved_pets: '1 indoor cat named Pebble',
      guarantor_required: true,
      guarantor_name: 'Olivia Bennett',
      guarantor_address: '8 Hill View, York, YO10 4BD',
      guarantor_email: 'olivia.bennett@example.com',
      guarantor_phone: '07000000030',
      guarantor_dob: '1971-03-05',
      guarantor_relationship: 'Parent of lead tenant',
      tenants: [
        {
          full_name: 'Liam Carter',
          dob: '1998-02-11',
          email: 'liam.carter@example.com',
          phone: '07000000022',
        },
        {
          full_name: 'Maya Singh',
          dob: '1999-07-19',
          email: 'maya.singh@example.com',
          phone: '07000000023',
        },
        {
          full_name: 'Ethan Price',
          dob: '1997-11-03',
          email: 'ethan.price@example.com',
          phone: '07000000024',
        },
        {
          full_name: 'Grace Moore',
          dob: '1998-04-28',
          email: 'grace.moore@example.com',
          phone: '07000000025',
        },
      ],
    };
    const astData = mapWizardToASTData(wizardFacts as any, { canonicalJurisdiction: 'england' });

    const document = await generatePremiumAST(astData);
    expect(document.html).toContain('text-align: left;');
    expect(document.html).toContain('hyphens: none;');
    expect(document.html).toContain('font-variant-ligatures: none;');
    expect(document.html).not.toContain('text-align: justify');
    expect(document.html).not.toContain('hyphens: auto');
    expect(document.html).not.toMatch(/[\u00AD\u200B\u200C\u200D\u2060\uFEFF]/);

    const normalizedHtml = normalizeExtractedPdfText(document.html.replace(/<[^>]+>/g, ' '));

    expect(normalizedHtml).toContain(
      'This tenancy does not have a fixed end date and continues until ended in accordance with statute.'
    );
    expect(normalizedHtml).toContain(
      'The Landlord may only seek possession where a lawful statutory ground applies, including any relevant rent arrears, anti-social behaviour, sale, landlord occupation, or other statutory ground in force at the relevant time.'
    );
    expect(normalizedHtml).toContain(
      'The Landlord may only recover possession or terminate the tenancy through the court-led statutory process in force at the relevant time and by obtaining any court order required by law.'
    );
    expect(normalizedHtml).toContain(
      'The Guarantor guarantees the payment of the Rent and the performance of the Tenant obligations and agrees to indemnify the Landlord against losses arising from any breach of them.'
    );
    expect(normalizedHtml).not.toMatch(/oblig-\s+ations/i);
    expect(normalizedHtml).not.toMatch(/statut-\s+ory/i);
  }, PDF_TEST_TIMEOUT);
});
