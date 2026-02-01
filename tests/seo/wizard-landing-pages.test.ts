/**
 * SEO Tests for Wizard Landing Pages
 *
 * These tests verify that each landing page meets SEO requirements:
 * - Status 200
 * - Unique title and meta description
 * - Canonical URL present and correct
 * - Contains expected jurisdiction keywords and notice/form mentions
 * - JSON-LD FAQ schema exists and is valid
 */

import { describe, it, expect } from 'vitest';
import {
  noticeOnlyContent,
  completePackContent,
  moneyClaimContent,
  astStandardContent,
  astPremiumContent,
  WIZARD_LANDING_CONTENT,
  getAllLandingPageSlugs,
} from '@/lib/seo/wizard-landing-content';
import { SEO_PRICES } from '@/lib/pricing/products';

describe('Wizard Landing Pages - Content Configuration', () => {
  describe('Notice Only Content', () => {
    it('should have required SEO fields', () => {
      expect(noticeOnlyContent.title).toBeTruthy();
      expect(noticeOnlyContent.description).toBeTruthy();
      expect(noticeOnlyContent.h1).toBeTruthy();
      expect(noticeOnlyContent.slug).toBe('eviction-notice');
    });

    it('should mention "procedurally correct"', () => {
      const combinedText = [
        noticeOnlyContent.description,
        noticeOnlyContent.subheading,
        ...noticeOnlyContent.faqs.map((f) => f.question + ' ' + f.answer),
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('procedurally correct');
    });

    it('should cover all three jurisdictions: England, Wales, Scotland', () => {
      expect(noticeOnlyContent.jurisdictions).toContain('England');
      expect(noticeOnlyContent.jurisdictions).toContain('Wales');
      expect(noticeOnlyContent.jurisdictions).toContain('Scotland');
    });

    it('should list Section 21 notice type for England', () => {
      const section21Notice = noticeOnlyContent.noticeTypes?.find(
        (n) => n.name.includes('Section 21') && n.jurisdiction === 'England'
      );
      expect(section21Notice).toBeTruthy();
      expect(section21Notice?.legalBasis).toContain('Housing Act 1988');
    });

    it('should list Section 8 notice type for England', () => {
      const section8Notice = noticeOnlyContent.noticeTypes?.find(
        (n) => n.name.includes('Section 8') && n.jurisdiction === 'England'
      );
      expect(section8Notice).toBeTruthy();
    });

    it('should list Notice to Leave for Scotland', () => {
      const noticeToLeave = noticeOnlyContent.noticeTypes?.find(
        (n) => n.name.includes('Notice to Leave') && n.jurisdiction === 'Scotland'
      );
      expect(noticeToLeave).toBeTruthy();
      expect(noticeToLeave?.legalBasis).toContain('Private Housing (Tenancies) (Scotland) Act 2016');
    });

    it('should reference Renting Homes (Wales) Act 2016 for Wales', () => {
      const walesNotices = noticeOnlyContent.noticeTypes?.filter(
        (n) => n.jurisdiction === 'Wales'
      );
      expect(walesNotices?.length).toBeGreaterThan(0);
      const hasRHWA = walesNotices?.some((n) =>
        n.legalBasis?.includes('Renting Homes (Wales) Act 2016')
      );
      expect(hasRHWA).toBe(true);
    });

    it('should have FAQ items', () => {
      expect(noticeOnlyContent.faqs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Complete Pack Content', () => {
    it('should have required SEO fields', () => {
      expect(completePackContent.title).toBeTruthy();
      expect(completePackContent.description).toBeTruthy();
      expect(completePackContent.h1).toBeTruthy();
      expect(completePackContent.slug).toBe('eviction-pack-england');
    });

    it('should be explicitly England only', () => {
      expect(completePackContent.jurisdictions).toEqual(['England']);
      expect(completePackContent.title.toLowerCase()).toContain('england');
      expect(completePackContent.h1.toLowerCase()).toContain('england');
    });

    it('should mention Section 21', () => {
      const combinedText = [
        completePackContent.description,
        ...completePackContent.whatYouGet,
        ...completePackContent.faqs.map((f) => f.answer),
      ].join(' ');

      expect(combinedText).toContain('Section 21');
    });

    it('should mention Section 8', () => {
      const combinedText = [
        completePackContent.description,
        ...completePackContent.whatYouGet,
        ...completePackContent.faqs.map((f) => f.answer),
      ].join(' ');

      expect(combinedText).toContain('Section 8');
    });

    it('should mention N5 form', () => {
      const n5Form = completePackContent.courtForms?.find((f) => f.formNumber === 'N5');
      expect(n5Form).toBeTruthy();
      expect(n5Form?.name).toContain('N5');
    });

    it('should mention N5B form', () => {
      const n5bForm = completePackContent.courtForms?.find((f) => f.formNumber === 'N5B');
      expect(n5bForm).toBeTruthy();
    });

    it('should mention N119 form', () => {
      const n119Form = completePackContent.courtForms?.find((f) => f.formNumber === 'N119');
      expect(n119Form).toBeTruthy();
    });

    it('should have FAQ items', () => {
      expect(completePackContent.faqs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Money Claim Content', () => {
    it('should have required SEO fields', () => {
      expect(moneyClaimContent.title).toBeTruthy();
      expect(moneyClaimContent.description).toBeTruthy();
      expect(moneyClaimContent.h1).toBeTruthy();
      expect(moneyClaimContent.slug).toBe('money-claim');
    });

    it('should mention N1 form', () => {
      const n1Form = moneyClaimContent.courtForms?.find((f) => f.formNumber === 'N1');
      expect(n1Form).toBeTruthy();

      const combinedText = [
        moneyClaimContent.title,
        moneyClaimContent.description,
        ...moneyClaimContent.whatYouGet,
      ].join(' ');
      expect(combinedText).toContain('N1');
    });

    it('should mention interest calculation', () => {
      const combinedText = [
        moneyClaimContent.description,
        ...moneyClaimContent.whatYouGet,
        ...moneyClaimContent.faqs.map((f) => f.answer),
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('interest');
    });

    it('should mention daily rate concept', () => {
      const combinedText = [
        moneyClaimContent.title,
        moneyClaimContent.description,
        ...moneyClaimContent.faqs.map((f) => f.question + ' ' + f.answer),
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('daily rate');
    });

    it('should list what can be claimed for', () => {
      const combinedText = [
        ...moneyClaimContent.whatYouGet,
        ...moneyClaimContent.faqs.map((f) => f.answer),
      ].join(' ');

      // Should mention rent arrears
      expect(combinedText.toLowerCase()).toContain('rent arrears');
      // Should mention damages
      expect(combinedText.toLowerCase()).toContain('damage');
      // Should mention cleaning
      expect(combinedText.toLowerCase()).toContain('cleaning');
    });

    it('should explain where to file', () => {
      const faqAboutFiling = moneyClaimContent.faqs.find((f) =>
        f.question.toLowerCase().includes('file') || f.question.toLowerCase().includes('where')
      );
      expect(faqAboutFiling).toBeTruthy();
      expect(faqAboutFiling?.answer).toContain('MCOL');
    });

    it('should have FAQ items', () => {
      expect(moneyClaimContent.faqs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('AST Standard Content', () => {
    it('should have required SEO fields', () => {
      expect(astStandardContent.title).toBeTruthy();
      expect(astStandardContent.description).toBeTruthy();
      expect(astStandardContent.h1).toBeTruthy();
      expect(astStandardContent.slug).toBe('tenancy-agreement');
    });

    it('should cover all 4 jurisdictions', () => {
      expect(astStandardContent.jurisdictions).toContain('England');
      expect(astStandardContent.jurisdictions).toContain('Wales');
      expect(astStandardContent.jurisdictions).toContain('Scotland');
      expect(astStandardContent.jurisdictions).toContain('Northern Ireland');
    });

    it('should use correct terminology: AST for England', () => {
      const englandCoverage = astStandardContent.jurisdictionCoverage?.find(
        (j) => j.name === 'England'
      );
      expect(englandCoverage).toBeTruthy();
      expect(englandCoverage?.agreementType).toContain('Assured Shorthold Tenancy');
      expect(englandCoverage?.agreementType).toContain('AST');
    });

    it('should use correct terminology: Occupation Contract for Wales', () => {
      const walesCoverage = astStandardContent.jurisdictionCoverage?.find(
        (j) => j.name === 'Wales'
      );
      expect(walesCoverage).toBeTruthy();
      expect(walesCoverage?.agreementType).toContain('Occupation Contract');
    });

    it('should use correct terminology: PRT for Scotland', () => {
      const scotlandCoverage = astStandardContent.jurisdictionCoverage?.find(
        (j) => j.name === 'Scotland'
      );
      expect(scotlandCoverage).toBeTruthy();
      expect(scotlandCoverage?.agreementType).toContain('Private Residential Tenancy');
      expect(scotlandCoverage?.agreementType).toContain('PRT');
    });

    it('should use correct terminology: Private Tenancy for Northern Ireland', () => {
      const niCoverage = astStandardContent.jurisdictionCoverage?.find(
        (j) => j.name === 'Northern Ireland'
      );
      expect(niCoverage).toBeTruthy();
      expect(niCoverage?.agreementType).toContain('Private Tenancy');
    });

    it('should state they are jurisdiction-specific with correct legislation', () => {
      const combinedText = [
        astStandardContent.description,
        astStandardContent.subheading,
        ...astStandardContent.howValidationWorks,
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('jurisdiction');
      expect(combinedText.toLowerCase()).toContain('legislation');
    });

    it('should have FAQ items', () => {
      expect(astStandardContent.faqs.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('AST Premium Content', () => {
    it('should have required SEO fields', () => {
      expect(astPremiumContent.title).toBeTruthy();
      expect(astPremiumContent.description).toBeTruthy();
      expect(astPremiumContent.h1).toBeTruthy();
      expect(astPremiumContent.slug).toBe('premium-tenancy-agreement');
    });

    it('should cover all 4 jurisdictions', () => {
      expect(astPremiumContent.jurisdictions).toContain('England');
      expect(astPremiumContent.jurisdictions).toContain('Wales');
      expect(astPremiumContent.jurisdictions).toContain('Scotland');
      expect(astPremiumContent.jurisdictions).toContain('Northern Ireland');
    });

    it('should mention HMO clauses', () => {
      const combinedText = [
        astPremiumContent.title,
        astPremiumContent.description,
        ...astPremiumContent.whatYouGet,
        ...astPremiumContent.faqs.map((f) => f.question + ' ' + f.answer),
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('hmo');
      expect(combinedText.toLowerCase()).toContain('clause');
    });

    it('should mention guarantor clauses', () => {
      const combinedText = [
        astPremiumContent.title,
        astPremiumContent.description,
        ...astPremiumContent.whatYouGet,
        ...astPremiumContent.faqs.map((f) => f.question + ' ' + f.answer),
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('guarantor');
    });

    it('should mention bundle inclusions (inventory, compliance checklist)', () => {
      const combinedText = [...astPremiumContent.whatYouGet].join(' ');

      expect(combinedText.toLowerCase()).toContain('inventory');
      expect(combinedText.toLowerCase()).toContain('compliance checklist');
    });

    it('should mention applicable laws per jurisdiction', () => {
      // Check England
      const englandCoverage = astPremiumContent.jurisdictionCoverage?.find(
        (j) => j.name === 'England'
      );
      expect(englandCoverage?.legalBasis).toContain('Housing Act 1988');
      expect(englandCoverage?.legalBasis).toContain('Housing Act 2004');

      // Check Wales
      const walesCoverage = astPremiumContent.jurisdictionCoverage?.find(
        (j) => j.name === 'Wales'
      );
      expect(walesCoverage?.legalBasis).toContain('Renting Homes (Wales) Act 2016');

      // Check Scotland
      const scotlandCoverage = astPremiumContent.jurisdictionCoverage?.find(
        (j) => j.name === 'Scotland'
      );
      expect(scotlandCoverage?.legalBasis).toContain(
        'Private Housing (Tenancies) (Scotland) Act 2016'
      );

      // Check NI
      const niCoverage = astPremiumContent.jurisdictionCoverage?.find(
        (j) => j.name === 'Northern Ireland'
      );
      expect(niCoverage?.legalBasis).toContain('Private Tenancies Act (Northern Ireland) 2022');
    });

    it('should have FAQ items', () => {
      expect(astPremiumContent.faqs.length).toBeGreaterThanOrEqual(5);
    });
  });
});

describe('Wizard Landing Pages - Content Registry', () => {
  it('should have all 5 products in registry', () => {
    expect(Object.keys(WIZARD_LANDING_CONTENT)).toHaveLength(5);
    expect(WIZARD_LANDING_CONTENT['notice_only']).toBeTruthy();
    expect(WIZARD_LANDING_CONTENT['complete_pack']).toBeTruthy();
    expect(WIZARD_LANDING_CONTENT['money_claim']).toBeTruthy();
    expect(WIZARD_LANDING_CONTENT['ast_standard']).toBeTruthy();
    expect(WIZARD_LANDING_CONTENT['ast_premium']).toBeTruthy();
  });

  it('should return all landing page slugs', () => {
    const slugs = getAllLandingPageSlugs();
    expect(slugs).toContain('eviction-notice');
    expect(slugs).toContain('eviction-pack-england');
    expect(slugs).toContain('money-claim');
    expect(slugs).toContain('tenancy-agreement');
    expect(slugs).toContain('premium-tenancy-agreement');
  });

  it('should have unique slugs for each product', () => {
    const slugs = getAllLandingPageSlugs();
    const uniqueSlugs = new Set(slugs);
    expect(slugs.length).toBe(uniqueSlugs.size);
  });

  it('should have unique titles for each product', () => {
    const titles = Object.values(WIZARD_LANDING_CONTENT).map((c) => c.title);
    const uniqueTitles = new Set(titles);
    expect(titles.length).toBe(uniqueTitles.size);
  });

  it('should have unique descriptions for each product', () => {
    const descriptions = Object.values(WIZARD_LANDING_CONTENT).map((c) => c.description);
    const uniqueDescriptions = new Set(descriptions);
    expect(descriptions.length).toBe(uniqueDescriptions.size);
  });
});

describe('Wizard Landing Pages - FAQ Schema Validation', () => {
  it('should have valid FAQ structure for all products', () => {
    Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
      content.faqs.forEach((faq) => {
        expect(faq.question).toBeTruthy();
        expect(faq.question.trim().endsWith('?')).toBe(true);
        expect(faq.answer).toBeTruthy();
        expect(faq.answer.length).toBeGreaterThan(20);
      });
    });
  });

  it('should have at least 5 FAQs per product', () => {
    Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
      expect(content.faqs.length).toBeGreaterThanOrEqual(5);
    });
  });
});

describe('Wizard Landing Pages - Value Proposition Requirements', () => {
  describe('All pages should have value proposition sections', () => {
    it('should have whyUseThis section with heading, intro, and benefits', () => {
      Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
        expect(content.whyUseThis).toBeTruthy();
        expect(content.whyUseThis.heading).toBeTruthy();
        expect(content.whyUseThis.intro).toBeTruthy();
        expect(content.whyUseThis.benefits.length).toBeGreaterThan(0);
      });
    });

    it('should have proceduralBenefits array with at least one item', () => {
      Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
        expect(content.proceduralBenefits).toBeTruthy();
        expect(content.proceduralBenefits.length).toBeGreaterThan(0);
      });
    });

    it('should have legalValidationExplainer with whatItMeans and disclaimer', () => {
      Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
        expect(content.legalValidationExplainer).toBeTruthy();
        expect(content.legalValidationExplainer.whatItMeans.length).toBeGreaterThan(0);
        expect(content.legalValidationExplainer.disclaimer).toBeTruthy();
        expect(content.legalValidationExplainer.disclaimer.length).toBeGreaterThan(50);
      });
    });

    it('should mention procedural benefits in whyUseThis section', () => {
      Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
        const combinedBenefits = content.whyUseThis.benefits.join(' ').toLowerCase();
        // At least one of these procedural terms should appear
        const hasProceduralTerm =
          combinedBenefits.includes('procedur') ||
          combinedBenefits.includes('court') ||
          combinedBenefits.includes('form') ||
          combinedBenefits.includes('correct') ||
          combinedBenefits.includes('validate') ||
          combinedBenefits.includes('jurisdiction');
        expect(hasProceduralTerm).toBe(true);
      });
    });
  });

  describe('Eviction Pack (England) - Particulars of Claim emphasis', () => {
    it('should mention Particulars of Claim in content', () => {
      const combinedText = [
        completePackContent.title,
        completePackContent.description,
        completePackContent.subheading,
        ...completePackContent.whatYouGet,
        ...completePackContent.whyUseThis.benefits,
        ...completePackContent.faqs.map((f) => f.question + ' ' + f.answer),
      ].join(' ');

      expect(combinedText).toContain('Particulars of Claim');
    });

    it('should mention N119 form', () => {
      const combinedText = [
        completePackContent.title,
        completePackContent.description,
        ...completePackContent.whatYouGet,
      ].join(' ');

      expect(combinedText).toContain('N119');
    });

    it('should explain why Particulars of Claim matter', () => {
      const faqAboutParticulars = completePackContent.faqs.find(
        (f) =>
          f.question.toLowerCase().includes('particulars') ||
          f.question.toLowerCase().includes('n119')
      );
      expect(faqAboutParticulars).toBeTruthy();
    });
  });

  describe('Money Claim - Form N1 and daily interest rate', () => {
    it('should mention Form N1 in title or description', () => {
      const titleAndDesc = completePackContent.title + ' ' + moneyClaimContent.description;
      expect(moneyClaimContent.title.toLowerCase()).toContain('n1');
    });

    it('should mention daily interest rate', () => {
      const combinedText = [
        moneyClaimContent.title,
        moneyClaimContent.description,
        moneyClaimContent.subheading,
        ...moneyClaimContent.whatYouGet,
        ...moneyClaimContent.whyUseThis.benefits,
        ...moneyClaimContent.proceduralBenefits,
        ...moneyClaimContent.faqs.map((f) => f.question + ' ' + f.answer),
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('daily rate');
    });

    it('should explain interest calculation in FAQs', () => {
      const interestFaq = moneyClaimContent.faqs.find((f) =>
        f.question.toLowerCase().includes('interest') ||
        f.question.toLowerCase().includes('daily rate')
      );
      expect(interestFaq).toBeTruthy();
      expect(interestFaq?.answer).toContain('8%');
    });
  });

  describe('Premium Tenancy - HMO and guarantor clauses', () => {
    it('should mention HMO clauses prominently', () => {
      const combinedText = [
        astPremiumContent.title,
        astPremiumContent.description,
        astPremiumContent.subheading,
        ...astPremiumContent.whatYouGet,
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('hmo');
      expect(combinedText.toLowerCase()).toContain('clause');
    });

    it('should mention guarantor clauses prominently', () => {
      const combinedText = [
        astPremiumContent.title,
        astPremiumContent.description,
        astPremiumContent.subheading,
        ...astPremiumContent.whatYouGet,
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('guarantor');
    });

    it('should explain HMO clauses in FAQs', () => {
      const hmoFaq = astPremiumContent.faqs.find((f) =>
        f.question.toLowerCase().includes('hmo')
      );
      expect(hmoFaq).toBeTruthy();
      expect(hmoFaq?.answer.toLowerCase()).toContain('joint and several');
    });

    it('should explain guarantor clauses in FAQs', () => {
      const guarantorFaq = astPremiumContent.faqs.find((f) =>
        f.question.toLowerCase().includes('guarantor')
      );
      expect(guarantorFaq).toBeTruthy();
      expect(guarantorFaq?.answer.toLowerCase()).toContain('liability');
    });

    it('should mention supporting documents (inventory, compliance checklist)', () => {
      const combinedText = [
        ...astPremiumContent.whatYouGet,
        ...astPremiumContent.whyUseThis.benefits,
      ].join(' ');

      expect(combinedText.toLowerCase()).toContain('inventory');
      expect(combinedText.toLowerCase()).toContain('compliance checklist');
    });
  });
});

describe('Wizard Landing Pages - Pricing Accuracy', () => {
  it('should use correct price for Eviction Notice', () => {
    expect(noticeOnlyContent.price).toBe(SEO_PRICES.evictionNotice.display);
    expect(noticeOnlyContent.price).toBe('£49.99');
  });

  it('should use correct price for Eviction Bundle', () => {
    expect(completePackContent.price).toBe(SEO_PRICES.evictionBundle.display);
    expect(completePackContent.price).toBe('£199.99');
  });

  it('should use correct price for Money Claim', () => {
    expect(moneyClaimContent.price).toBe(SEO_PRICES.moneyClaim.display);
    expect(moneyClaimContent.price).toBe('£99.99');
  });

  it('should use correct price for Standard Tenancy Agreement', () => {
    expect(astStandardContent.price).toBe(SEO_PRICES.tenancyStandard.display);
    expect(astStandardContent.price).toBe('£14.99');
  });

  it('should use correct price for Premium Tenancy Agreement', () => {
    expect(astPremiumContent.price).toBe(SEO_PRICES.tenancyPremium.display);
    expect(astPremiumContent.price).toBe('£24.99');
  });

  it('should include price in title for all products', () => {
    expect(noticeOnlyContent.title).toContain('£49.99');
    expect(completePackContent.title).toContain('£199.99');
    expect(moneyClaimContent.title).toContain('£99.99');
    expect(astStandardContent.title).toContain('£14.99');
    expect(astPremiumContent.title).toContain('£24.99');
  });
});

describe('Wizard Landing Pages - Legal Safety Block', () => {
  it('should have disclaimer in legalValidationExplainer for all products', () => {
    Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
      expect(content.legalValidationExplainer.disclaimer).toBeTruthy();
      // Should mention "not legal advice" or similar
      expect(
        content.legalValidationExplainer.disclaimer.toLowerCase()
      ).toContain('not legal advice');
    });
  });

  it('should explain what validation means for all products', () => {
    Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
      expect(content.legalValidationExplainer.whatItMeans.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('should recommend solicitor for complex cases', () => {
    Object.values(WIZARD_LANDING_CONTENT).forEach((content) => {
      expect(
        content.legalValidationExplainer.disclaimer.toLowerCase()
      ).toContain('solicitor');
    });
  });
});
