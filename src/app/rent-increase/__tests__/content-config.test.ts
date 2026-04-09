import {
  getRentIncreaseHubPage,
  RENT_INCREASE_GUIDE_ORDER,
  RENT_INCREASE_GUIDE_PAGES,
  RENT_INCREASE_GUIDE_SLUGS,
  RENT_INCREASE_WIZARD_HREF,
} from '@/app/rent-increase/content';

const EXPECTED_PATHS = [
  '/rent-increase',
  '/rent-increase/section-13-notice',
  '/rent-increase/how-to-increase-rent',
  '/rent-increase/rent-increase-rules-uk',
  '/rent-increase/form-4a-guide',
  '/rent-increase/section-13-tribunal',
  '/rent-increase/market-rent-calculation',
  '/rent-increase/rent-increase-challenge',
];

const REQUIRED_SECTION_IDS = [
  'what-is-it',
  'legal-rules',
  'step-by-step-guide',
  'common-mistakes',
  'tribunal-risks',
  'how-to-avoid-challenges',
] as const;

const REQUIRED_SECTION_TITLES = [
  'What is it',
  'Legal rules',
  'Step-by-step guide',
  'Common mistakes',
  'Tribunal risks',
  'How to avoid challenges',
] as const;

function countWords(text: string): number {
  return text
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^A-Za-z0-9'\-\u00C0-\u017F\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

describe('rent increase content config', () => {
  it('defines exactly the expected 8 routes', () => {
    expect(RENT_INCREASE_GUIDE_ORDER).toHaveLength(8);
    expect(RENT_INCREASE_GUIDE_SLUGS).toHaveLength(7);

    const paths = RENT_INCREASE_GUIDE_ORDER.map((key) => RENT_INCREASE_GUIDE_PAGES[key].path);
    expect(new Set(paths).size).toBe(EXPECTED_PATHS.length);
    expect(paths.sort()).toEqual([...EXPECTED_PATHS].sort());
  });

  it('keeps unique keyword, intent, and intro-angle labels across all pages', () => {
    const pages = RENT_INCREASE_GUIDE_ORDER.map((key) => RENT_INCREASE_GUIDE_PAGES[key]);
    const primaryKeywords = pages.map((page) => page.primaryKeyword);
    const intentLabels = pages.map((page) => page.intentLabel);
    const introAngles = pages.map((page) => page.introAngle);
    const metaTitles = pages.map((page) => page.metaTitle);
    const metaDescriptions = pages.map((page) => page.metaDescription);

    expect(new Set(primaryKeywords).size).toBe(primaryKeywords.length);
    expect(new Set(intentLabels).size).toBe(intentLabels.length);
    expect(new Set(introAngles).size).toBe(introAngles.length);
    expect(new Set(metaTitles).size).toBe(metaTitles.length);
    expect(new Set(metaDescriptions).size).toBe(metaDescriptions.length);
  });

  it('keeps required content structure, links, and CTA inputs on every page', () => {
    const hubPath = getRentIncreaseHubPage().path;
    const wizardPath = RENT_INCREASE_WIZARD_HREF;

    for (const key of RENT_INCREASE_GUIDE_ORDER) {
      const page = RENT_INCREASE_GUIDE_PAGES[key];
      const sectionIds = page.sections.map((section) => section.id);
      const sectionTitles = page.sections.map((section) => section.title);

      expect(sectionIds).toEqual(REQUIRED_SECTION_IDS);
      expect(sectionTitles).toEqual(REQUIRED_SECTION_TITLES);
      expect(page.heroImage.startsWith('/images/wizard-icons/')).toBe(true);
      expect(page.quickAnswer.length).toBeGreaterThanOrEqual(3);
      expect(page.faqs.length).toBeGreaterThanOrEqual(3);
      expect(page.midCtaTitle.trim()).not.toHaveLength(0);
      expect(page.midCtaBody.trim()).not.toHaveLength(0);
      expect(page.finalCtaTitle.trim()).not.toHaveLength(0);
      expect(page.finalCtaBody.trim()).not.toHaveLength(0);

      const relatedHrefs = page.relatedLinks.map((link) => link.href);
      const siblingLinks = relatedHrefs.filter(
        (href) => href !== hubPath && href !== wizardPath && href !== page.path,
      );

      if (key !== 'hub') {
        expect(relatedHrefs).toContain(hubPath);
      }
      expect(relatedHrefs).toContain(wizardPath);
      expect(new Set(siblingLinks).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('keeps each page within the long-form target range', () => {
    for (const key of RENT_INCREASE_GUIDE_ORDER) {
      const page = RENT_INCREASE_GUIDE_PAGES[key];
      const textBlocks = [
        page.title,
        page.heroTitle,
        page.heroSubtitle,
        ...page.heroBullets,
        page.introAngle,
        ...page.quickAnswer,
        ...page.sections.flatMap((section) => [section.title, ...section.paragraphs]),
        page.midCtaTitle,
        page.midCtaBody,
        page.finalCtaTitle,
        page.finalCtaBody,
        ...page.faqs.flatMap((faq) => [faq.question, faq.answer]),
      ];

      const words = countWords(textBlocks.join(' '));
      expect(words).toBeGreaterThanOrEqual(1200);
      expect(words).toBeLessThanOrEqual(1500);
    }
  });
});
