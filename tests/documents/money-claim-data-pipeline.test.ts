import { describe, expect, it, vi } from 'vitest';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';

// Mock the document generator
vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn(async ({ templatePath, data }) => {
    const templateName = templatePath.split('/').pop()?.replace('.hbs', '') || 'unknown';
    const html = `<h1>${templateName}</h1><p>Claimant: ${
      data.landlord_full_name || 'MISSING'
    }, Defendant: ${data.tenant_full_name || 'MISSING'}, Rent: £${data.rent_amount || 0}, Arrears: £${
      data.arrears_total || 0
    }</p>`;
    return {
      html,
      pdf: Buffer.from('mock-pdf-content'),
    };
  }),
}));

// Mock the official forms filler
vi.mock('@/lib/documents/official-forms-filler', () => ({
  assertOfficialFormExists: vi.fn().mockResolvedValue(undefined),
  fillN1Form: vi.fn().mockResolvedValue(Buffer.from('PDF_CONTENT')),
}));

import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';

describe('Money claim data pipeline (wizard → caseFacts → pack)', () => {
  it('should correctly map wizard facts through the entire pipeline', async () => {
    // Step 1: Simulate wizard facts as they're stored in the database
    // This matches how the wizard answer API stores group-type questions
    const wizardFacts = {
      claimant_full_name: 'Alice Landlord',
      claimant_email: 'alice@example.com',
      claimant_phone: '01234567890',
      'claimant_address.address_line1': '1 High Street',
      'claimant_address.address_line2': 'Apartment 3',
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
      charge_interest: 'yes',
      interest_start_date: '2024-01-01',
      interest_rate: '8',
      lba_sent: 'yes',
      lba_date: '2024-03-01',
      lba_method: ['email'],
    } as any;

    // Step 2: Convert wizard facts to caseFacts (domain model)
    const caseFacts = wizardFactsToCaseFacts(wizardFacts);

    // Verify caseFacts has the correct data
    expect(caseFacts.parties.landlord.name).toBe('Alice Landlord');
    expect(caseFacts.parties.landlord.email).toBe('alice@example.com');
    expect(caseFacts.parties.landlord.phone).toBe('01234567890');
    expect(caseFacts.parties.landlord.address_line1).toBe('1 High Street');
    expect(caseFacts.parties.landlord.address_line2).toBe('Apartment 3');
    expect(caseFacts.parties.landlord.city).toBe('London');
    expect(caseFacts.parties.landlord.postcode).toBe('N1 1AA');

    expect(caseFacts.parties.tenants[0]?.name).toBe('Tom Tenant');

    expect(caseFacts.property.address_line1).toBe('2 Rental Road');
    expect(caseFacts.property.city).toBe('London');
    expect(caseFacts.property.postcode).toBe('N2 2BB');

    expect(caseFacts.tenancy.rent_amount).toBe(750);
    expect(caseFacts.tenancy.rent_frequency).toBe('monthly');
    expect(caseFacts.tenancy.start_date).toBe('2024-01-01');

    expect(caseFacts.issues.rent_arrears.total_arrears).toBe(1200);

    // Step 3: Map caseFacts to MoneyClaimCase (pack generator input)
    const moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);

    // Verify moneyClaimCase has the correct data
    expect(moneyClaimCase.landlord_full_name).toBe('Alice Landlord');
    expect(moneyClaimCase.landlord_email).toBe('alice@example.com');
    expect(moneyClaimCase.landlord_phone).toBe('01234567890');
    expect(moneyClaimCase.landlord_address).toContain('1 High Street');
    expect(moneyClaimCase.landlord_address).toContain('London');
    expect(moneyClaimCase.landlord_postcode).toBe('N1 1AA');

    expect(moneyClaimCase.tenant_full_name).toBe('Tom Tenant');

    expect(moneyClaimCase.property_address).toContain('2 Rental Road');
    expect(moneyClaimCase.property_address).toContain('London');
    expect(moneyClaimCase.property_postcode).toBe('N2 2BB');

    expect(moneyClaimCase.rent_amount).toBe(750);
    expect(moneyClaimCase.rent_frequency).toBe('monthly');
    expect(moneyClaimCase.tenancy_start_date).toBe('2024-01-01');

    expect(moneyClaimCase.arrears_total).toBe(1200);

    // Step 4: Generate pack (with caseFacts for AI integration)
    const pack = await generateMoneyClaimPack(moneyClaimCase, caseFacts);

    // Verify pack was generated successfully
    expect(pack.documents.length).toBeGreaterThan(0);

    // Find the Letter Before Action document
    const lbaDoc = pack.documents.find((doc) =>
      doc.title.toLowerCase().includes('letter before')
    );
    expect(lbaDoc).toBeDefined();

    // Verify the HTML contains the correct data (not blank)
    const lbaHtml = lbaDoc?.html?.toString() || '';
    expect(lbaHtml).toContain('Alice Landlord');
    expect(lbaHtml).toContain('Tom Tenant');
    expect(lbaHtml).toContain('750');
    expect(lbaHtml).toContain('1200');
    expect(lbaHtml).not.toContain('MISSING');
    expect(lbaHtml).not.toContain('£0');

    // Find the Particulars of Claim document
    const pocDoc = pack.documents.find((doc) =>
      doc.title.toLowerCase().includes('particulars')
    );
    expect(pocDoc).toBeDefined();

    // Verify the HTML contains the correct data (not blank)
    const pocHtml = pocDoc?.html?.toString() || '';
    expect(pocHtml).toContain('Alice Landlord');
    expect(pocHtml).toContain('Tom Tenant');
    expect(pocHtml).toContain('750');
    expect(pocHtml).toContain('1200');
    expect(pocHtml).not.toContain('MISSING');
    expect(pocHtml).not.toContain('£0');
  });

  it('should handle Scotland money claim flow', async () => {
    const wizardFacts = {
      pursuer_full_name: 'Sarah Landlord',
      pursuer_email: 'sarah@example.com',
      pursuer_phone: '07000000000',
      'pursuer_address.address_line1': '10 High Street',
      'pursuer_address.city': 'Edinburgh',
      'pursuer_address.postcode': 'EH1 1AA',
      defender_full_name: 'Rob Renter',
      'property_address.address_line1': '20 Tenancy Terrace',
      'property_address.city': 'Edinburgh',
      'property_address.postcode': 'EH2 2BB',
      tenancy_start_date: '2024-02-01',
      rent_amount: 650,
      rent_frequency: 'monthly',
      basis_of_claim: ['rent_arrears'],
      arrears_total: 1300,
      sheriffdom: 'Lothian and Borders at Edinburgh',
    } as any;

    const caseFacts = wizardFactsToCaseFacts(wizardFacts);

    // Verify landlord data is mapped from pursuer fields
    expect(caseFacts.parties.landlord.name).toBe('Sarah Landlord');
    expect(caseFacts.parties.landlord.email).toBe('sarah@example.com');
    expect(caseFacts.parties.landlord.phone).toBe('07000000000');
    expect(caseFacts.parties.landlord.address_line1).toBe('10 High Street');
    expect(caseFacts.parties.landlord.city).toBe('Edinburgh');

    // Verify tenant data is mapped from defender fields
    expect(caseFacts.parties.tenants[0]?.name).toBe('Rob Renter');

    expect(caseFacts.property.address_line1).toBe('20 Tenancy Terrace');
    expect(caseFacts.tenancy.rent_amount).toBe(650);
    expect(caseFacts.issues.rent_arrears.total_arrears).toBe(1300);
  });
});
