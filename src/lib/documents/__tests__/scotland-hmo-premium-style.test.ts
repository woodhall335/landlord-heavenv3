/**
 * Scotland HMO Premium Template Style Verification Tests
 *
 * These tests verify that the Scotland Premium HMO PRT agreement:
 * 1. Uses the same styling system as Wales premium agreements (HBS Premium style)
 * 2. Contains all premium style markers (badges, tables, legal-notice blocks, schedules)
 * 3. Preserves Scottish legal mechanisms
 * 4. Has no Wales-law leakage (Contract-Holder, Renting Homes Wales, etc.)
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const JURISDICTIONS_PATH = join(process.cwd(), 'config/jurisdictions/uk');

// Template paths
const SCOTLAND_HMO_PREMIUM = 'scotland/templates/prt_agreement_hmo_premium.hbs';
const SCOTLAND_HMO_STANDARD = 'scotland/templates/prt_agreement_hmo.hbs';
const WALES_PREMIUM = 'wales/templates/premium_occupation_contract.hbs';

function loadTemplate(relativePath: string): string {
  const fullPath = join(JURISDICTIONS_PATH, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Template not found: ${fullPath}`);
  }
  return readFileSync(fullPath, 'utf-8');
}

describe('Scotland HMO Premium Template - Style Verification', () => {
  let scotlandHMOPremium: string;
  let walesPremium: string;

  beforeAll(() => {
    scotlandHMOPremium = loadTemplate(SCOTLAND_HMO_PREMIUM);
    walesPremium = loadTemplate(WALES_PREMIUM);
  });

  describe('Premium Style Markers', () => {
    it('should have premium badge element', () => {
      expect(scotlandHMOPremium).toContain('premium-badge');
      expect(scotlandHMOPremium).toContain('Premium Edition');
    });

    it('should have HMO badge element', () => {
      expect(scotlandHMOPremium).toContain('hmo-badge');
      expect(scotlandHMOPremium).toContain('HMO');
    });

    it('should have document header structure', () => {
      expect(scotlandHMOPremium).toContain('doc-header');
      expect(scotlandHMOPremium).toContain('doc-subtitle');
      expect(scotlandHMOPremium).toContain('doc-jurisdiction');
    });

    it('should have data tables for commercial terms', () => {
      expect(scotlandHMOPremium).toContain('data-table');
      expect(scotlandHMOPremium).toContain('class="label"');
      expect(scotlandHMOPremium).toContain('class="value"');
    });

    it('should have legal notice blocks', () => {
      expect(scotlandHMOPremium).toContain('legal-notice');
      expect(scotlandHMOPremium).toContain('legal-notice-title');
    });

    it('should have schedules section', () => {
      expect(scotlandHMOPremium).toContain('schedule');
      expect(scotlandHMOPremium).toContain('schedule-header');
      expect(scotlandHMOPremium).toContain('Schedule 1');
      expect(scotlandHMOPremium).toContain('Schedule 2');
    });

    it('should have signature section with page break', () => {
      expect(scotlandHMOPremium).toContain('signature-section');
      expect(scotlandHMOPremium).toContain('signature-block');
      expect(scotlandHMOPremium).toContain('page-break-before: always');
    });

    it('should have clause numbering structure', () => {
      expect(scotlandHMOPremium).toContain('clause');
      expect(scotlandHMOPremium).toContain('clause-num');
    });

    it('should have parties section structure', () => {
      expect(scotlandHMOPremium).toContain('parties-section');
      expect(scotlandHMOPremium).toContain('party-block');
      expect(scotlandHMOPremium).toContain('party-role');
    });
  });

  describe('CSS Styling Alignment with Wales Premium', () => {
    it('should use same page setup (@page rules)', () => {
      expect(scotlandHMOPremium).toContain('@page');
      expect(scotlandHMOPremium).toContain('size: A4');
      expect(scotlandHMOPremium).toContain('margin: 25mm 20mm 25mm 20mm');
    });

    it('should use same typography (Georgia font)', () => {
      expect(scotlandHMOPremium).toContain("'Georgia'");
      expect(scotlandHMOPremium).toContain("'Times New Roman'");
    });

    it('should have same table styling classes', () => {
      // Check both templates use same class names for tables
      expect(scotlandHMOPremium).toContain('.data-table');
      expect(walesPremium).toContain('.data-table');
    });

    it('should have print-safe styling', () => {
      expect(scotlandHMOPremium).toContain('@media print');
      expect(scotlandHMOPremium).toContain('page-break-inside: avoid');
    });
  });

  describe('Scottish Legal Mechanisms Preserved', () => {
    it('should reference Private Residential Tenancy (PRT)', () => {
      expect(scotlandHMOPremium).toContain('Private Residential Tenancy');
      expect(scotlandHMOPremium).toContain('PRT');
    });

    it('should reference Private Housing (Tenancies) (Scotland) Act 2016', () => {
      expect(scotlandHMOPremium).toContain('Private Housing (Tenancies) (Scotland) Act 2016');
    });

    it('should state no fixed end date', () => {
      expect(scotlandHMOPremium).toContain('no fixed end date');
    });

    it('should reference Notice to Leave', () => {
      expect(scotlandHMOPremium).toContain('Notice to Leave');
    });

    it('should reference First-tier Tribunal for Scotland', () => {
      expect(scotlandHMOPremium).toContain('First-tier Tribunal for Scotland');
    });

    it('should reference Scottish deposit schemes', () => {
      const hasScottishSchemes =
        scotlandHMOPremium.includes('SafeDeposits Scotland') ||
        scotlandHMOPremium.includes('MyDeposits Scotland') ||
        scotlandHMOPremium.includes('Letting Protection Service Scotland');
      expect(hasScottishSchemes).toBe(true);
    });

    it('should reference 30 working days for deposit protection', () => {
      expect(scotlandHMOPremium).toMatch(/30\s+working\s+days/i);
    });

    it('should reference Repairing Standard', () => {
      expect(scotlandHMOPremium).toContain('Repairing Standard');
    });

    it('should reference Housing (Scotland) Act 2006', () => {
      expect(scotlandHMOPremium).toContain('Housing (Scotland) Act 2006');
    });

    it('should reference Scottish landlord registration', () => {
      expect(scotlandHMOPremium).toContain('landlord registration');
      expect(scotlandHMOPremium).toContain('Antisocial Behaviour');
    });

    it('should reference HMO licensing under Scottish law', () => {
      expect(scotlandHMOPremium).toContain('Civic Government (Scotland) Act 1982');
    });

    it('should use Tenant terminology (not Contract-Holder)', () => {
      // Count occurrences of "Tenant" vs "Contract-Holder"
      const tenantMatches = scotlandHMOPremium.match(/\bTenant\b/g) || [];
      expect(tenantMatches.length).toBeGreaterThan(10); // Should have many Tenant references
    });
  });

  describe('No Wales Law Leakage', () => {
    it('should NOT contain Contract-Holder terminology', () => {
      expect(scotlandHMOPremium).not.toContain('Contract-Holder');
      expect(scotlandHMOPremium).not.toContain('contract-holder');
      expect(scotlandHMOPremium).not.toContain('contract holder');
    });

    it('should NOT reference Occupation Contract', () => {
      expect(scotlandHMOPremium).not.toContain('Occupation Contract');
      expect(scotlandHMOPremium).not.toContain('occupation contract');
    });

    it('should NOT reference Renting Homes (Wales) Act', () => {
      expect(scotlandHMOPremium).not.toContain('Renting Homes (Wales)');
      expect(scotlandHMOPremium).not.toContain('RH(W)A');
    });

    it('should NOT reference Rent Smart Wales', () => {
      expect(scotlandHMOPremium).not.toContain('Rent Smart Wales');
      expect(scotlandHMOPremium).not.toContain('rent_smart_wales');
    });

    it('should NOT reference Section 173 (Wales)', () => {
      expect(scotlandHMOPremium).not.toContain('section 173');
      expect(scotlandHMOPremium).not.toContain('Section 173');
    });

    it('should NOT reference Section 157 (Wales)', () => {
      expect(scotlandHMOPremium).not.toContain('section 157');
      expect(scotlandHMOPremium).not.toContain('Section 157');
    });

    it('should NOT reference periodic standard contract (Wales)', () => {
      expect(scotlandHMOPremium).not.toContain('periodic standard contract');
    });

    it('should NOT reference fixed term contract (Wales)', () => {
      expect(scotlandHMOPremium).not.toContain('fixed term contract');
    });

    it('should NOT reference Written Statement (Wales specific)', () => {
      // Wales requires "Written Statement" terminology
      expect(scotlandHMOPremium).not.toMatch(/written\s+statement\s+of/i);
    });
  });

  describe('No England Law Leakage', () => {
    it('should NOT reference Section 21', () => {
      expect(scotlandHMOPremium).not.toContain('Section 21');
      expect(scotlandHMOPremium).not.toContain('section 21');
      expect(scotlandHMOPremium).not.toContain('s.21');
    });

    it('should NOT reference Section 8', () => {
      expect(scotlandHMOPremium).not.toContain('Section 8');
      expect(scotlandHMOPremium).not.toContain('section 8');
      expect(scotlandHMOPremium).not.toContain('s.8');
    });

    it('should NOT reference Housing Act 1988 (England)', () => {
      expect(scotlandHMOPremium).not.toContain('Housing Act 1988');
    });

    it('should NOT reference Assured Shorthold Tenancy', () => {
      expect(scotlandHMOPremium).not.toMatch(/assured\s+shorthold/i);
    });
  });

  describe('HMO-Specific Content', () => {
    it('should have HMO section', () => {
      expect(scotlandHMOPremium).toContain('HMO');
      expect(scotlandHMOPremium).toContain('House in Multiple Occupation');
    });

    it('should reference HMO licence', () => {
      expect(scotlandHMOPremium).toContain('hmo_licence');
    });

    it('should have shared facilities section', () => {
      expect(scotlandHMOPremium).toContain('Shared Facilities');
    });

    it('should have fire safety provisions', () => {
      expect(scotlandHMOPremium).toContain('fire');
      expect(scotlandHMOPremium).toContain('Fire Safety');
    });

    it('should reference occupancy limits', () => {
      expect(scotlandHMOPremium).toContain('occupan');
    });

    it('should have joint and several liability for HMO', () => {
      expect(scotlandHMOPremium).toContain('jointly and severally');
    });
  });

  describe('Template Structure Comparison with Wales Premium', () => {
    it('should have About This Agreement section', () => {
      expect(scotlandHMOPremium).toContain('About This Agreement');
    });

    it('should have The Parties section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Parties.*<\/h2>/i);
    });

    it('should have The Property section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Property.*<\/h2>/i);
    });

    it('should have The Tenancy section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Tenancy.*<\/h2>/i);
    });

    it('should have Rent section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Rent.*<\/h2>/i);
    });

    it('should have Deposit section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Deposit.*<\/h2>/i);
    });

    it('should have Tenant Obligations section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Tenant\s+Obligations.*<\/h2>/i);
    });

    it('should have Landlord Obligations section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Landlord\s+Obligations.*<\/h2>/i);
    });

    it('should have Ending the Tenancy section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Ending.*Tenancy.*<\/h2>/i);
    });

    it('should have Data Protection section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Data\s+Protection.*<\/h2>/i);
    });

    it('should have Signatures section', () => {
      expect(scotlandHMOPremium).toMatch(/<h2>.*Signature.*<\/h2>/i);
    });
  });
});

describe('Scotland HMO Standard Template - Basic Verification', () => {
  it('should exist', () => {
    expect(existsSync(join(JURISDICTIONS_PATH, SCOTLAND_HMO_STANDARD))).toBe(true);
  });

  it('should contain HMO references', () => {
    const template = loadTemplate(SCOTLAND_HMO_STANDARD);
    expect(template).toContain('HMO');
  });

  it('should contain Scottish legal references', () => {
    const template = loadTemplate(SCOTLAND_HMO_STANDARD);
    expect(template).toContain('Scotland');
  });
});

describe('Template Resolution Verification', () => {
  it('Scotland HMO premium template file should exist', () => {
    const fullPath = join(JURISDICTIONS_PATH, SCOTLAND_HMO_PREMIUM);
    expect(existsSync(fullPath)).toBe(true);
  });

  it('Wales premium template file should exist (for comparison)', () => {
    const fullPath = join(JURISDICTIONS_PATH, WALES_PREMIUM);
    expect(existsSync(fullPath)).toBe(true);
  });

  it('should have correct jurisdiction indicator', () => {
    const template = loadTemplate(SCOTLAND_HMO_PREMIUM);
    expect(template).toContain('Scotland');
    expect(template).not.toContain('>Wales<');
  });
});
