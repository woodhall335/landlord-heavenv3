/**
 * Wales Premium HMO Occupation Contract Regression Tests
 *
 * These tests ensure:
 * 1. Visual parity with England Premium (same color scheme #2c5282)
 * 2. NO ISO date formats (YYYY-MM-DD) appear in generated documents
 * 3. Correct UK date formatting (D Month YYYY)
 * 4. NO England legal terminology appears
 * 5. Wales-specific legal framework is preserved
 * 6. Premium Edition branding is present
 * 7. Signature and witness sections have proper page break controls
 *
 * @module tests/documents/wales-premium-hmo-regression
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { findISODates, ISO_DATE_REGEX } from '@/lib/formatters/date-uk';

// Read the Wales Premium HMO template directly
const getWalesHMOTemplate = () => {
  const templatePath = join(
    process.cwd(),
    'config/jurisdictions/uk/wales/templates/occupation_contract_hmo.hbs'
  );
  return readFileSync(templatePath, 'utf-8');
};

// Read the England Premium HMO template for comparison
const getEnglandHMOTemplate = () => {
  const templatePath = join(
    process.cwd(),
    'config/jurisdictions/uk/england/templates/ast_hmo.hbs'
  );
  return readFileSync(templatePath, 'utf-8');
};

describe('Wales Premium HMO Contract Regression Tests', () => {
  let walesTemplate: string;
  let englandTemplate: string;

  beforeEach(() => {
    walesTemplate = getWalesHMOTemplate();
    englandTemplate = getEnglandHMOTemplate();
  });

  describe('A) UK Date Formatting - No ISO Date Leaks', () => {
    it('should use formatUKDate helper for agreement_date', () => {
      expect(walesTemplate).toContain('{{formatUKDate agreement_date}}');
      expect(walesTemplate).not.toMatch(/\{\{agreement_date\}\}/);
    });

    it('should use formatUKDate helper for tenant DOB', () => {
      expect(walesTemplate).toContain('{{formatUKDate this.dob}}');
      expect(walesTemplate).not.toMatch(/\{\{this\.dob\}\}[^}]/);
    });

    it('should use formatUKDate helper for guarantor DOB', () => {
      expect(walesTemplate).toContain('{{formatUKDate guarantor_dob}}');
      expect(walesTemplate).not.toMatch(/\{\{guarantor_dob\}\}[^}]/);
    });

    it('should use formatUKDate helper for tenancy_start_date', () => {
      // Should appear multiple times, all formatted
      const unformattedMatches = walesTemplate.match(/\{\{tenancy_start_date\}\}/g);
      expect(unformattedMatches).toBeNull();
      expect(walesTemplate).toContain('{{formatUKDate tenancy_start_date}}');
    });

    it('should use formatUKDate helper for tenancy_end_date', () => {
      expect(walesTemplate).toContain('{{formatUKDate tenancy_end_date}}');
      expect(walesTemplate).not.toMatch(/\{\{tenancy_end_date\}\}[^}]/);
    });

    it('should use formatUKDate helper for current_date in footer', () => {
      expect(walesTemplate).toContain('{{formatUKDate current_date}}');
      expect(walesTemplate).not.toMatch(/\{\{current_date\}\}[^}]/);
    });

    it('should NOT contain any raw ISO date patterns in static content', () => {
      // Extract static text (non-Handlebars content)
      const staticContent = walesTemplate.replace(/\{\{[^}]+\}\}/g, '');
      const isoMatches = findISODates(staticContent);
      expect(isoMatches).toEqual([]);
    });
  });

  describe('B) Visual Parity with England Premium', () => {
    const ENGLAND_PREMIUM_PRIMARY_COLOR = '#2c5282';
    const ENGLAND_PREMIUM_GRADIENT = 'linear-gradient(135deg, #2c5282 0%, #2d3748 100%)';

    it('should use the same primary accent color as England Premium', () => {
      expect(walesTemplate).toContain(ENGLAND_PREMIUM_PRIMARY_COLOR);
    });

    it('should use the same section header background gradient as England Premium', () => {
      expect(walesTemplate).toContain(ENGLAND_PREMIUM_GRADIENT);
    });

    it('should use the same explainer box border color as England Premium (#4299e1)', () => {
      expect(walesTemplate).toContain('#4299e1');
    });

    it('should use the same checklist checkmark color as England Premium (#48bb78)', () => {
      expect(walesTemplate).toContain('#48bb78');
    });

    it('should have .document-title using primary color', () => {
      expect(walesTemplate).toMatch(/\.document-title\s*\{[^}]*color:\s*#2c5282/);
    });

    it('should have .section-header using gradient background', () => {
      expect(walesTemplate).toMatch(
        /\.section-header\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*#2c5282/
      );
    });

    it('should have .signature-block using primary color border', () => {
      expect(walesTemplate).toMatch(/\.signature-block\s*\{[^}]*border:\s*2px\s+solid\s+#2c5282/);
    });

    it('should have .financial-table th using primary color background', () => {
      expect(walesTemplate).toMatch(/\.financial-table\s+th\s*\{[^}]*background:\s*#2c5282/);
    });

    it('should have .property-highlight using gradient background', () => {
      expect(walesTemplate).toMatch(
        /\.property-highlight\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*#2c5282/
      );
    });
  });

  describe('C) Premium Edition Branding', () => {
    it('should contain Premium Edition badge', () => {
      expect(walesTemplate).toContain('Premium Edition');
    });

    it('should have premium-badge class styled with gradient', () => {
      expect(walesTemplate).toContain('.premium-badge');
      expect(walesTemplate).toMatch(/\.premium-badge\s*\{[^}]*background:\s*linear-gradient/);
    });

    it('should have document reference starting with SOC-PREMIUM', () => {
      expect(walesTemplate).toContain('SOC-PREMIUM-{{case_id}}');
    });
  });

  describe('D) Wales Legal Framework Preservation', () => {
    it('should contain Renting Homes (Wales) Act 2016 reference', () => {
      expect(walesTemplate).toContain('Renting Homes (Wales) Act 2016');
    });

    it('should contain Rent Smart Wales reference', () => {
      expect(walesTemplate).toContain('Rent Smart Wales');
    });

    it('should use "Contract Holder" terminology (not Tenant)', () => {
      expect(walesTemplate).toContain('Contract Holder');
    });

    it('should use "Dwelling" terminology (not Premises)', () => {
      expect(walesTemplate).toContain('Dwelling');
    });

    it('should reference written statement requirement', () => {
      expect(walesTemplate).toContain('written statement');
    });

    it('should reference Section 173 notice (Wales no-fault)', () => {
      expect(walesTemplate).toContain('Section 173');
    });

    it('should reference 6 months minimum notice (Wales)', () => {
      expect(walesTemplate).toContain('6 months');
    });
  });

  describe('E) NO England Legal Terminology', () => {
    it('should NOT contain "Assured Shorthold Tenancy" or "AST"', () => {
      // Check for AST terminology
      expect(walesTemplate).not.toContain('Assured Shorthold Tenancy');
      // Exception: It's OK to explain what Wales replaces
      const astMentions = walesTemplate.match(/Assured Shorthold Tenancy/gi) || [];
      if (astMentions.length > 0) {
        // Should only appear in explanatory context about Wales terminology
        expect(walesTemplate).toContain(
          'This Standard Occupation Contract replaces the Assured Shorthold'
        );
      }
    });

    it('should NOT contain "Housing Act 1988"', () => {
      expect(walesTemplate).not.toContain('Housing Act 1988');
    });

    it('should NOT contain "Section 21" (England no-fault)', () => {
      expect(walesTemplate).not.toContain('Section 21');
    });

    it('should NOT contain "Section 8" (England grounds)', () => {
      expect(walesTemplate).not.toContain('Section 8');
    });

    it('should NOT contain "How to Rent" guide as a REQUIREMENT', () => {
      // The template may explain that Wales does NOT require "How to Rent" guide
      // But it should NOT present it as a requirement like England does
      expect(walesTemplate).not.toContain('provide the Tenant with the latest version of the');
      expect(walesTemplate).not.toContain('How to Rent: The checklist for renting in England');
      expect(walesTemplate).not.toContain('gov.uk/government/publications/how-to-rent');
      // The explanatory text about Wales NOT requiring How to Rent is acceptable
      expect(walesTemplate).toContain('Wales does not require landlords to provide');
    });

    it('should NOT contain "Right to Rent" checks', () => {
      expect(walesTemplate).not.toContain('Right to Rent');
    });

    it('should NOT contain "Deregulation Act 2015"', () => {
      expect(walesTemplate).not.toContain('Deregulation Act 2015');
    });
  });

  describe('F) Signature and Witness Section Page Break Controls', () => {
    it('should have signature-section with page-break-before: always', () => {
      expect(walesTemplate).toMatch(/\.signature-section\s*\{[^}]*page-break-before:\s*always/);
    });

    it('should have signature-section with page-break-inside: avoid in print media', () => {
      // The @media print section contains signature-section styling
      // Note: The CSS may have the selector defined differently (e.g., multiple selectors)
      // Check that both the @media print block AND signature-section page-break-inside exist
      expect(walesTemplate).toContain('@media print');
      expect(walesTemplate).toMatch(/\.signature-section[^{]*\{[^}]*page-break-inside:\s*avoid/);
    });

    it('should have witness-section with page-break-inside: avoid', () => {
      expect(walesTemplate).toMatch(/\.witness-section\s*\{[^}]*page-break-inside:\s*avoid/);
    });

    it('should have witness-section with break-inside: avoid', () => {
      expect(walesTemplate).toMatch(/\.witness-section\s*\{[^}]*break-inside:\s*avoid/);
    });

    it('should have witness-block with page-break-inside: avoid', () => {
      expect(walesTemplate).toMatch(/\.witness-block\s*\{[^}]*page-break-inside:\s*avoid/);
    });

    it('should have inline page-break controls on witness section in HTML', () => {
      expect(walesTemplate).toContain(
        'class="witness-section" style="page-break-inside: avoid; break-inside: avoid'
      );
    });
  });

  describe('G) Footer Styling', () => {
    it('should have footer-info with margin-top for spacing', () => {
      expect(walesTemplate).toMatch(/\.footer-info\s*\{[^}]*margin-top:\s*\d+pt/);
    });

    it('should have footer-info with page-break-inside: avoid', () => {
      expect(walesTemplate).toMatch(/\.footer-info\s*\{[^}]*page-break-inside:\s*avoid/);
    });

    it('should have footer-info with clear: both', () => {
      expect(walesTemplate).toMatch(/\.footer-info\s*\{[^}]*clear:\s*both/);
    });
  });

  describe('H) HMO-Specific Content', () => {
    it('should contain HMO licensing reference', () => {
      expect(walesTemplate).toContain('HMO');
      expect(walesTemplate).toContain('Housing Act 2004');
    });

    it('should contain shared facilities clauses', () => {
      expect(walesTemplate).toContain('Shared Facilities');
    });

    it('should contain fire safety requirements', () => {
      expect(walesTemplate).toContain('Fire Safety');
    });

    it('should contain joint and several liability clauses', () => {
      expect(walesTemplate).toContain('jointly and severally liable');
    });

    it('should contain occupancy limits', () => {
      expect(walesTemplate).toContain('Occupancy Limit');
    });
  });
});

describe('Wales vs England Premium Comparison', () => {
  let walesTemplate: string;
  let englandTemplate: string;

  beforeEach(() => {
    walesTemplate = getWalesHMOTemplate();
    englandTemplate = getEnglandHMOTemplate();
  });

  it('both should use the same primary color scheme (#2c5282)', () => {
    expect(walesTemplate).toContain('#2c5282');
    expect(englandTemplate).toContain('#2c5282');
  });

  it('both should use the same section header gradient', () => {
    const gradient = 'linear-gradient(135deg, #2c5282 0%, #2d3748 100%)';
    expect(walesTemplate).toContain(gradient);
    expect(englandTemplate).toContain(gradient);
  });

  it('both should have signature sections with page-break-before: always', () => {
    expect(walesTemplate).toMatch(/\.signature-section\s*\{[^}]*page-break-before:\s*always/);
    expect(englandTemplate).toMatch(/\.signature-section\s*\{[^}]*page-break-before:\s*always/);
  });

  it('both should have witness sections with page-break-inside: avoid', () => {
    expect(walesTemplate).toMatch(/\.witness-section\s*\{[^}]*page-break-inside:\s*avoid/);
    expect(englandTemplate).toMatch(/\.witness-section\s*\{[^}]*page-break-inside:\s*avoid/);
  });

  it('Wales should use formatUKDate for dates, same as England', () => {
    // England uses formatUKDate
    expect(englandTemplate).toContain('{{formatUKDate');
    // Wales should too
    expect(walesTemplate).toContain('{{formatUKDate');
  });

  it('both should have similar footer styling', () => {
    // Both should have footer-info class with similar properties
    expect(walesTemplate).toMatch(/\.footer-info\s*\{/);
    expect(englandTemplate).toMatch(/\.footer-info\s*\{/);
  });
});
