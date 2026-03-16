import { describe, expect, it } from 'vitest';

import { RESIDENTIAL_LANDING_CONTENT } from '@/lib/seo/residential-product-landing-content';

function collectLandingText(content: (typeof RESIDENTIAL_LANDING_CONTENT)[keyof typeof RESIDENTIAL_LANDING_CONTENT]) {
  return [
    content.title,
    content.description,
    content.h1,
    content.subheading,
    content.overview,
    content.quickAnswer,
    ...content.whyUseThis,
    ...content.howWizardWorks,
    ...content.whenToUse,
    ...content.howToUseAfterDownload,
    ...content.commonMistakes,
    ...content.whoThisIsFor,
    ...content.notFor,
    content.legalExplainer,
    ...content.includedHighlights,
    ...content.documentPreviewAnatomy,
    ...content.guideLinks.flatMap((link) => [link.label, link.description]),
    ...content.internalLinks.flatMap((link) => [link.label, link.description]),
    ...content.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ].join(' ');
}

describe('residential product landing content', () => {
  it('adds guide-style search sections for every public standalone landing', () => {
    const entries = Object.values(RESIDENTIAL_LANDING_CONTENT);

    expect(entries).toHaveLength(10);

    entries.forEach((content) => {
      expect(content.quickAnswer.length).toBeGreaterThan(120);
      expect(content.whenToUse.length).toBeGreaterThanOrEqual(3);
      expect(content.howToUseAfterDownload.length).toBeGreaterThanOrEqual(3);
      expect(content.commonMistakes.length).toBeGreaterThanOrEqual(3);
      expect(content.comparison.rows.length).toBeGreaterThanOrEqual(3);
      expect(content.guideLinks.length).toBeGreaterThanOrEqual(2);
      expect(content.guideLinks.some((link) => link.href === '/landlord-documents-england')).toBe(true);
      expect(content.lastUpdated).toBe('March 2026');
    });
  });

  it('keeps landing page copy plain and free from premium wording', () => {
    Object.values(RESIDENTIAL_LANDING_CONTENT).forEach((content) => {
      expect(collectLandingText(content)).not.toMatch(/\bpremium\b/i);
    });
  });
});
