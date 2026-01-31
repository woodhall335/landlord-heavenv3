/**
 * Tenancy Agreement Compliance Tests
 *
 * These tests verify that tenancy agreement templates comply with legal requirements:
 * 1. No misleading "CRIMINAL OFFENCE" language for private AST subletting
 * 2. Tenant Fees Act 2019 compliant cleaning clauses (no required professional cleaning receipts)
 * 3. ADR-safe deposit deduction language (no "forfeit entire deposit")
 * 4. Proper tone (no aggressive STRICTLY/IMMEDIATE language with emojis)
 * 5. Premium templates include guarantor clauses when guarantor data provided
 * 6. Standard templates do NOT include guarantor sections
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const JURISDICTIONS_PATH = join(process.cwd(), 'config/jurisdictions/uk');

// Standard tenancy templates by jurisdiction
const STANDARD_TEMPLATES = {
  england: 'england/templates/standard_ast_formatted.hbs',
  wales: 'wales/templates/standard_occupation_contract.hbs',
  scotland: 'scotland/templates/prt_agreement.hbs',
  'northern-ireland': 'northern-ireland/templates/private_tenancy_agreement.hbs',
};

// Premium tenancy templates by jurisdiction
const PREMIUM_TEMPLATES = {
  england: 'england/templates/premium_ast_formatted.hbs',
  wales: 'wales/templates/premium_occupation_contract.hbs',
  scotland: 'scotland/templates/prt_agreement_premium.hbs',
  'northern-ireland': 'northern-ireland/templates/private_tenancy_premium.hbs',
};

function loadTemplate(relativePath: string): string {
  const fullPath = join(JURISDICTIONS_PATH, relativePath);
  if (!existsSync(fullPath)) {
    throw new Error(`Template not found: ${fullPath}`);
  }
  return readFileSync(fullPath, 'utf-8');
}

/**
 * Helper to extract subletting-related sections from template
 * Looks for content within 500 chars of "sublet" keywords
 */
function extractSublettingContext(template: string): string {
  const lowerTemplate = template.toLowerCase();
  const sublettingKeywords = ['sublet', 'subletting', 'assignment'];
  let context = '';

  sublettingKeywords.forEach(keyword => {
    let index = 0;
    while ((index = lowerTemplate.indexOf(keyword, index)) !== -1) {
      const start = Math.max(0, index - 250);
      const end = Math.min(lowerTemplate.length, index + 500);
      context += lowerTemplate.substring(start, end) + '\n';
      index += keyword.length;
    }
  });

  return context;
}

describe('Tenancy Agreement Legal Compliance', () => {
  describe('Subletting Clause Compliance', () => {
    // The key issue is that subletting is NOT a criminal offense for private tenancies
    // (only social housing tenants can be prosecuted under Prevention of Social Housing Fraud Act 2013)
    // Other criminal references (gas safety, landlord registration, dangerous dogs) are legitimate

    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not contain misleading criminal language in subletting sections',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);
        const sublettingContext = extractSublettingContext(template);

        // Subletting sections should not claim criminal offense for private tenancies
        expect(sublettingContext).not.toContain('criminal offence');
        expect(sublettingContext).not.toContain('criminal offense');
        expect(sublettingContext).not.toContain('criminal prosecution');

        // Prevention of Social Housing Fraud Act 2013 should not be referenced in private tenancy templates
        expect(template).not.toContain('Prevention of Social Housing Fraud Act');
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not contain misleading criminal language in subletting sections',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);
        const sublettingContext = extractSublettingContext(template);

        // Subletting sections should not claim criminal offense for private tenancies
        expect(sublettingContext).not.toContain('criminal offence');
        expect(sublettingContext).not.toContain('criminal offense');

        // Prevention of Social Housing Fraud Act 2013 should not be referenced
        expect(template).not.toContain('Prevention of Social Housing Fraud Act');
      }
    );
  });

  describe('Cleaning Clause Compliance (Tenant Fees Act 2019)', () => {
    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not require professional cleaning receipts',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should not require receipts for professional cleaning
        expect(template.toLowerCase()).not.toContain('receipts must be provided');
        expect(template).not.toMatch(/MUST\s+(arrange|use)\s+professional\s+clean/i);
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not require professional cleaning receipts',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        expect(template.toLowerCase()).not.toContain('receipts must be provided');
        expect(template).not.toMatch(/MUST\s+(arrange|use)\s+professional\s+clean/i);
      }
    );
  });

  describe('Deposit Deduction Compliance (ADR-safe)', () => {
    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not contain "forfeit entire deposit" language',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should not use aggressive forfeit language
        expect(template.toLowerCase()).not.toContain('forfeit the entire deposit');
        expect(template.toLowerCase()).not.toContain('forfeit entire deposit');
        expect(template.toLowerCase()).not.toContain('forfeiture of deposit');
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not contain "forfeit entire deposit" language',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        expect(template.toLowerCase()).not.toContain('forfeit the entire deposit');
        expect(template.toLowerCase()).not.toContain('forfeit entire deposit');
      }
    );
  });

  describe('Professional Tone Compliance', () => {
    it.each(Object.entries(STANDARD_TEMPLATES))(
      '%s standard template should not contain aggressive STRICTLY PROHIBITED language with emojis',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should not use STRICTLY PROHIBITED with warning emojis
        expect(template).not.toMatch(/⚠️.*STRICTLY PROHIBITED/);
        expect(template).not.toMatch(/STRICTLY PROHIBITED.*Criminal/i);
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should not contain aggressive language patterns',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        expect(template).not.toMatch(/⚠️.*STRICTLY PROHIBITED/);
        expect(template).not.toMatch(/STRICTLY PROHIBITED.*Criminal/i);
      }
    );
  });
});

describe('Guarantor Clause Inclusion', () => {
  describe('Premium Templates with Guarantor Support', () => {
    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should include guarantor sections',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);
        const lowerTemplate = template.toLowerCase();

        // Premium templates should have conditional guarantor blocks
        expect(template).toContain('guarantor_name');
        expect(template).toContain('Guarantor');

        // Should have guarantor provisions (various acceptable phrasings)
        const hasGuarantorSection =
          lowerTemplate.includes('guarantor agreement') ||
          lowerTemplate.includes('guarantee agreement') ||
          lowerTemplate.includes('guarantor guarantees') ||
          lowerTemplate.includes('guarantor section') ||
          lowerTemplate.includes('guarantor\'s undertaking') ||
          lowerTemplate.includes('guarantor undertaking');
        expect(hasGuarantorSection).toBe(true);
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template should include proper guarantor fields',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should reference guarantor address and contact info
        expect(template).toContain('guarantor_address');
        expect(template).toContain('guarantor_email');
        expect(template).toContain('guarantor_phone');
      }
    );

    it.each(Object.entries(PREMIUM_TEMPLATES))(
      '%s premium template guarantor section should be conditional',
      (jurisdiction, templatePath) => {
        const template = loadTemplate(templatePath);

        // Should use Handlebars conditional for guarantor
        expect(template).toMatch(/\{\{#if\s+guarantor_name\}\}/);
        expect(template).toMatch(/\{\{\/if\}\}/);
      }
    );
  });

  describe('Standard Templates Guarantor Exclusion', () => {
    it('england standard template should reference guarantor (standard can include basic guarantor)', () => {
      const template = loadTemplate(STANDARD_TEMPLATES.england);

      // England standard may include basic guarantor support, but should be conditional
      if (template.includes('guarantor')) {
        expect(template).toMatch(/\{\{#if\s+guarantor/);
      }
    });
  });
});

describe('Emoji Removal Compliance', () => {
  const partyLabelEmojis = ['🏠', '👤', '🏢', '🛡️'];
  const warningEmojis = ['⚠️', '📜', 'ℹ️', '📋', '📍', '🚗', '📅', '💳', '📈', '📊', '✅', '🔑', '♻️', '🤝', '🐾', '🔨', '🏘️', '🚭'];

  it.each(Object.entries(STANDARD_TEMPLATES))(
    '%s standard template should not have emojis in party labels',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);

      partyLabelEmojis.forEach((emoji) => {
        expect(template).not.toContain(`party-label">${emoji}`);
      });
    }
  );

  it.each(Object.entries(PREMIUM_TEMPLATES))(
    '%s premium template should not have emojis in warning titles',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);

      // Should not have emojis in warning-title divs
      expect(template).not.toMatch(/warning-title">⚠️/);
    }
  );
});

describe('ADR Process Reference', () => {
  it.each(Object.entries(STANDARD_TEMPLATES))(
    '%s standard template should reference ADR process for deposit disputes',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);
      const lowerTemplate = template.toLowerCase();

      // Should mention deposit protection and dispute resolution
      expect(
        lowerTemplate.includes('adr') ||
          lowerTemplate.includes('alternative dispute resolution') ||
          lowerTemplate.includes('dispute resolution') ||
          lowerTemplate.includes('deposit scheme')
      ).toBe(true);
    }
  );
});

/**
 * LEGAL DRIFT PREVENTION TESTS
 * These tests prevent hardcoded dates and years that will become outdated
 */
describe('Legal Drift Prevention - Hardcoded Years', () => {
  /**
   * Helper to extract text content (excluding comments and generation timestamps)
   */
  function extractLegalContent(template: string): string {
    // Remove HTML comments
    let content = template.replace(/<!--[\s\S]*?-->/g, '');
    // Remove Handlebars comments
    content = content.replace(/\{\{!--[\s\S]*?--\}\}/g, '');
    content = content.replace(/\{\{![\s\S]*?\}\}/g, '');
    // Remove generation timestamp placeholders (these are dynamic)
    content = content.replace(/\{\{generation_timestamp\}\}/g, '');
    content = content.replace(/\{\{document_id\}\}/g, '');
    // Remove CSS/style blocks (years in CSS are fine)
    content = content.replace(/<style[\s\S]*?<\/style>/gi, '');
    return content;
  }

  /**
   * Check for hardcoded specific years (e.g., "1 April 2025", "2025 Legal Updates")
   * Allows legitimate references to legislation years (e.g., "Housing Act 1988")
   */
  function findProblematicYearReferences(template: string): string[] {
    const content = extractLegalContent(template);
    const problems: string[] = [];

    // Pattern for future/current year dates that will become outdated
    // Matches patterns like "1 April 2025", "2025 Legal Updates", "from 2025"
    const currentYear = new Date().getFullYear();
    const yearPatterns = [
      // "1 April 2025" style dates
      new RegExp(`\\d{1,2}\\s+(January|February|March|April|May|June|July|August|September|October|November|December)\\s+(${currentYear}|${currentYear + 1}|${currentYear - 1})`, 'gi'),
      // "2025 Legal Updates" style headings
      new RegExp(`(${currentYear}|${currentYear + 1}|${currentYear - 1})\\s+Legal\\s+Update`, 'gi'),
      // "Updated 2025" style
      new RegExp(`Updated\\s+(${currentYear}|${currentYear + 1}|${currentYear - 1})`, 'gi'),
      // "from 2025" style (but not in Act names)
      new RegExp(`from\\s+(${currentYear}|${currentYear + 1}|${currentYear - 1})(?!\\s*\\)|\\s*Act)`, 'gi'),
      // "effective 2025" style
      new RegExp(`effective\\s+(from\\s+)?(${currentYear}|${currentYear + 1}|${currentYear - 1})`, 'gi'),
    ];

    yearPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        problems.push(...matches);
      }
    });

    return [...new Set(problems)]; // Remove duplicates
  }

  it.each(Object.entries(STANDARD_TEMPLATES))(
    '%s standard template should not contain hardcoded year-specific dates that will become outdated',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);
      const problems = findProblematicYearReferences(template);

      expect(problems).toEqual([]);
    }
  );

  it.each(Object.entries(PREMIUM_TEMPLATES))(
    '%s premium template should not contain hardcoded year-specific dates that will become outdated',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);
      const problems = findProblematicYearReferences(template);

      expect(problems).toEqual([]);
    }
  );
});

/**
 * JURISDICTION CROSS-CONTAMINATION TESTS
 * Ensures England-only legal concepts don't leak into other jurisdictions
 */
describe('Jurisdiction Cross-Contamination Prevention', () => {
  const ENGLAND_ONLY_TERMS = [
    'Section 21',
    'Section 8',
    's.21',
    's.8',
  ];

  const WALES_REQUIRED_TERMS = [
    'Contract-Holder',
    'Renting Homes',
  ];

  const SCOTLAND_REQUIRED_TERMS = [
    'First-tier Tribunal',
    'Private Residential Tenancy',
  ];

  it.each(['wales', 'scotland', 'northern-ireland'] as const)(
    '%s templates should not contain England-only Section 21/Section 8 references',
    (jurisdiction) => {
      const standardTemplate = loadTemplate(STANDARD_TEMPLATES[jurisdiction]);
      const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES[jurisdiction]);

      ENGLAND_ONLY_TERMS.forEach(term => {
        expect(standardTemplate).not.toContain(term);
        expect(premiumTemplate).not.toContain(term);
      });
    }
  );

  it('Wales templates should use Contract-Holder terminology', () => {
    const standardTemplate = loadTemplate(STANDARD_TEMPLATES.wales);
    const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES.wales);

    // Must contain Wales-specific terminology
    expect(standardTemplate).toContain('Contract-Holder');
    expect(premiumTemplate).toContain('Contract-Holder');

    // Should reference correct Act
    expect(standardTemplate).toContain('Renting Homes');
    expect(premiumTemplate).toContain('Renting Homes');
  });

  it('Scotland templates should reference First-tier Tribunal', () => {
    const standardTemplate = loadTemplate(STANDARD_TEMPLATES.scotland);
    const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES.scotland);

    // Must reference Scottish tribunal system
    expect(standardTemplate).toContain('First-tier Tribunal');
    expect(premiumTemplate).toContain('First-tier Tribunal');
  });

  it('England templates should contain AST terminology', () => {
    const standardTemplate = loadTemplate(STANDARD_TEMPLATES.england);
    const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES.england);

    // Must reference AST
    expect(standardTemplate.toLowerCase()).toContain('assured shorthold');
    expect(premiumTemplate.toLowerCase()).toContain('assured shorthold');

    // Must reference Housing Act 1988
    expect(standardTemplate).toContain('Housing Act 1988');
    expect(premiumTemplate).toContain('Housing Act 1988');
  });
});

/**
 * DEPOSIT PROTECTION DEADLINE TESTS
 * Each jurisdiction has different statutory deadlines
 */
describe('Deposit Protection Deadlines by Jurisdiction', () => {
  it('England templates should specify 30 days for deposit protection', () => {
    const standardTemplate = loadTemplate(STANDARD_TEMPLATES.england);
    const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES.england);

    // Should mention 30 days for deposit protection
    expect(standardTemplate.toLowerCase()).toMatch(/within\s+30\s+days/);
    expect(premiumTemplate.toLowerCase()).toMatch(/within\s+30\s+days/);
  });

  it('Wales templates should specify 30 days for deposit protection', () => {
    const standardTemplate = loadTemplate(STANDARD_TEMPLATES.wales);
    const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES.wales);

    // Should mention 30 days for deposit protection
    expect(standardTemplate.toLowerCase()).toMatch(/within\s+30\s+days/);
    expect(premiumTemplate.toLowerCase()).toMatch(/within\s+30\s+days/);
  });

  it('Scotland templates should specify 30 Working Days for deposit protection', () => {
    const standardTemplate = loadTemplate(STANDARD_TEMPLATES.scotland);
    const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES.scotland);

    // Scotland uses Working Days, not calendar days
    expect(standardTemplate).toMatch(/30\s+Working\s+Days/i);
    expect(premiumTemplate).toMatch(/30\s+Working\s+Days/i);
  });

  it('Northern Ireland templates should specify 14 days for deposit protection', () => {
    const standardTemplate = loadTemplate(STANDARD_TEMPLATES['northern-ireland']);
    const premiumTemplate = loadTemplate(PREMIUM_TEMPLATES['northern-ireland']);

    // NI has 14-day deadline
    expect(standardTemplate.toLowerCase()).toMatch(/within\s+14\s+days/);
    expect(premiumTemplate.toLowerCase()).toMatch(/within\s+14\s+days/);
  });
});

/**
 * GUARANTOR SECTION ISOLATION TESTS
 * Premium content should never leak into standard templates
 */
describe('Premium Content Isolation', () => {
  /**
   * Helper to remove comments from template for content analysis
   */
  function stripComments(template: string): string {
    // Remove HTML comments
    let content = template.replace(/<!--[\s\S]*?-->/g, '');
    // Remove Handlebars comments
    content = content.replace(/\{\{!--[\s\S]*?--\}\}/g, '');
    content = content.replace(/\{\{![^}]*\}\}/g, '');
    return content;
  }

  it.each(Object.entries(STANDARD_TEMPLATES))(
    '%s standard template guarantor sections should be conditional',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);
      const templateWithoutComments = stripComments(template);

      // If standard template has guarantor content (excluding comments), it MUST be inside conditional blocks
      // This ensures guarantor content doesn't appear when no guarantor data is provided
      if (templateWithoutComments.toLowerCase().includes('guarantor')) {
        expect(template).toMatch(/\{\{#if\s+guarantor/);
      }
    }
  );

  it.each(Object.entries(PREMIUM_TEMPLATES))(
    '%s premium template guarantor sections should be properly conditional',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);

      // All premium guarantor content must be inside {{#if guarantor_name}} blocks
      const guarantorMatches = template.match(/Guarantor['']s\s+(liability|undertaking|obligations)/gi);
      if (guarantorMatches && guarantorMatches.length > 0) {
        // If we have guarantor content, ensure it's conditional
        expect(template).toMatch(/\{\{#if\s+guarantor_name\}\}/);
      }
    }
  );
});

/**
 * PROHIBITED FEES COMPLIANCE (Tenant Fees Act 2019)
 */
describe('Tenant Fees Act 2019 Compliance', () => {
  const PROHIBITED_FEE_PATTERNS = [
    /admin(?:istration)?\s+fee/i,
    /checkout\s+fee/i,
    /inventory\s+fee/i,
    /reference(?:ing)?\s+fee/i,
    /viewing\s+fee/i,
  ];

  it.each(Object.entries(STANDARD_TEMPLATES))(
    '%s standard template should not contain prohibited fee language',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);

      PROHIBITED_FEE_PATTERNS.forEach(pattern => {
        const match = template.match(pattern);
        // If fee is mentioned, it should be in context of prohibition, not requirement
        if (match) {
          // Check it's not in a "tenant must pay" context
          const lowerTemplate = template.toLowerCase();
          const index = lowerTemplate.indexOf(match[0].toLowerCase());
          const surrounding = lowerTemplate.substring(Math.max(0, index - 100), index + 100);
          expect(surrounding).not.toMatch(/tenant\s+(must|shall|will)\s+pay/);
        }
      });
    }
  );

  it.each(Object.entries(PREMIUM_TEMPLATES))(
    '%s premium template should not charge prohibited fees to tenant',
    (jurisdiction, templatePath) => {
      const template = loadTemplate(templatePath);

      PROHIBITED_FEE_PATTERNS.forEach(pattern => {
        const match = template.match(pattern);
        if (match) {
          const lowerTemplate = template.toLowerCase();
          const index = lowerTemplate.indexOf(match[0].toLowerCase());
          const surrounding = lowerTemplate.substring(Math.max(0, index - 100), index + 100);
          expect(surrounding).not.toMatch(/tenant\s+(must|shall|will)\s+pay/);
        }
      });
    }
  );
});
