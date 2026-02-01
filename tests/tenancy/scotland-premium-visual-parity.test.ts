/**
 * Scotland Premium Visual Parity Tests
 *
 * Tests to ensure:
 * 1. Scotland Premium PRT uses the same premium styling elements as England Premium
 * 2. Scotland PRT documents never contain "How to Rent" (England-only requirement)
 * 3. Regression: England templates still include "How to Rent" where expected
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const TEMPLATES_DIR = join(process.cwd(), 'config/jurisdictions/uk');

describe('Scotland Premium Visual Parity', () => {
  describe('Premium CSS Classes', () => {
    it('Scotland Premium template has .premium-badge CSS class', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('.premium-badge');
    });

    it('Scotland Premium template has .premium-section CSS class', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('.premium-section');
    });

    it('Scotland Premium template has .premium-label CSS class', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('.premium-label');
    });

    it('Scotland Premium uses consistent premium badge color with England', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      const englandPremium = readFileSync(
        join(TEMPLATES_DIR, 'england/templates/premium_ast_formatted.hbs'),
        'utf-8'
      );

      // England Premium uses #2c5282 for premium badge
      expect(englandPremium).toContain('#2c5282');
      // Scotland Premium should use the same premium color
      expect(scotlandPremium).toContain('#2c5282');
    });

    it('Scotland Premium has premium-section styling matching England', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      const englandPremium = readFileSync(
        join(TEMPLATES_DIR, 'england/templates/premium_ast_formatted.hbs'),
        'utf-8'
      );

      // Both should have premium-section with border-left
      expect(englandPremium).toMatch(/\.premium-section[^}]*border-left/);
      expect(scotlandPremium).toMatch(/\.premium-section[^}]*border-left/);
    });
  });

  describe('Premium Feature Indicators', () => {
    it('Scotland Premium displays PREMIUM badge in header', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('class="premium-badge">PREMIUM</');
    });

    it('Scotland Premium uses premium-section for Late Payment Interest', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('Premium: Late Payment Interest');
      expect(scotlandPremium).toContain('class="premium-section"');
    });

    it('Scotland Premium uses premium-section for Contents Insurance', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('Premium: Contents Insurance Requirement');
    });

    it('Scotland Premium marks Guarantor section as premium feature', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('GUARANTOR (PREMIUM FEATURE)');
    });
  });

  describe('Scotland-Specific Requirements', () => {
    it('Scotland Premium references Private Housing (Tenancies) (Scotland) Act 2016', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('Private Housing (Tenancies) (Scotland) Act 2016');
    });

    it('Scotland Premium references First-tier Tribunal', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('First-tier Tribunal');
    });

    it('Scotland Premium references Repairing Standard', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('Repairing Standard');
    });

    it('Scotland Premium references Scottish deposit schemes', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('SafeDeposits Scotland');
      expect(scotlandPremium).toContain('MyDeposits Scotland');
    });

    it('Scotland Premium includes landlord registration requirement', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium).toContain('Landlord Registration');
    });
  });
});

describe('How to Rent Guide - Scotland Exclusion', () => {
  describe('Scotland PRT Templates must NOT contain "How to Rent"', () => {
    it('Scotland Standard PRT does not reference "How to Rent"', () => {
      const scotlandStandard = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement.hbs'),
        'utf-8'
      );
      expect(scotlandStandard.toLowerCase()).not.toContain('how to rent');
    });

    it('Scotland Premium PRT does not reference "How to Rent"', () => {
      const scotlandPremium = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
        'utf-8'
      );
      expect(scotlandPremium.toLowerCase()).not.toContain('how to rent');
    });

    it('Scotland HMO PRT does not reference "How to Rent"', () => {
      const scotlandHmo = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_hmo.hbs'),
        'utf-8'
      );
      expect(scotlandHmo.toLowerCase()).not.toContain('how to rent');
    });
  });

  describe('Scotland Easy Read Notes replaces "How to Rent"', () => {
    it('Scotland templates reference Easy Read Notes instead', () => {
      const scotlandHmo = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_hmo.hbs'),
        'utf-8'
      );
      expect(scotlandHmo).toContain('Easy Read Notes');
    });

    it('Easy Read Notes template exists for Scotland', () => {
      const easyReadNotes = readFileSync(
        join(TEMPLATES_DIR, 'scotland/templates/easy_read_notes.hbs'),
        'utf-8'
      );
      expect(easyReadNotes).toBeDefined();
      expect(easyReadNotes.length).toBeGreaterThan(0);
    });
  });
});

describe('England "How to Rent" - Regression Tests', () => {
  it('England AST templates still reference "How to Rent" guide', () => {
    const englandHmo = readFileSync(
      join(TEMPLATES_DIR, 'england/templates/ast_hmo.hbs'),
      'utf-8'
    );
    expect(englandHmo.toLowerCase()).toContain('how to rent');
  });

  it('England pre-tenancy checklist includes "How to Rent"', () => {
    const englandChecklist = readFileSync(
      join(process.cwd(), 'config/jurisdictions/_shared/compliance/pre_tenancy_checklist_england.hbs'),
      'utf-8'
    );
    expect(englandChecklist.toLowerCase()).toContain('how to rent');
  });
});

describe('Template Structure Consistency', () => {
  it('Scotland Premium has similar document structure to England Premium', () => {
    const scotlandPremium = readFileSync(
      join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
      'utf-8'
    );
    const englandPremium = readFileSync(
      join(TEMPLATES_DIR, 'england/templates/premium_ast_formatted.hbs'),
      'utf-8'
    );

    // Both should have HTML structure
    expect(scotlandPremium).toContain('<!DOCTYPE html>');
    expect(englandPremium).toContain('<!DOCTYPE html>');

    // Both should have professional CSS
    expect(scotlandPremium).toContain('@page');
    expect(englandPremium).toContain('@page');

    // Both should have A4 page size
    expect(scotlandPremium).toContain('A4');
    expect(englandPremium).toContain('A4');

    // Both should have doc-header class
    expect(scotlandPremium).toContain('doc-header');
    expect(englandPremium).toContain('doc-header');

    // Both should have section structure
    expect(scotlandPremium).toContain('section-title');
    expect(englandPremium).toMatch(/\.?h2|section-title/);
  });

  it('Scotland Premium has signature blocks', () => {
    const scotlandPremium = readFileSync(
      join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
      'utf-8'
    );
    expect(scotlandPremium).toContain('signature');
  });

  it('Scotland Premium has data tables for party information', () => {
    const scotlandPremium = readFileSync(
      join(TEMPLATES_DIR, 'scotland/templates/prt_agreement_premium.hbs'),
      'utf-8'
    );
    expect(scotlandPremium).toContain('data-table');
  });
});
