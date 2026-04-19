import type { FAQItem } from '@/components/seo/FAQSection';

export type RentIncreaseSamplePackKey = 'section13_standard' | 'section13_defensive';

export type RentIncreaseGuideSlug =
  | 'section-13-notice'
  | 'how-to-increase-rent'
  | 'rent-increase-rules-uk'
  | 'form-4a-guide'
  | 'section-13-tribunal'
  | 'market-rent-calculation'
  | 'rent-increase-challenge';

export type RentIncreaseGuideKey = 'hub' | RentIncreaseGuideSlug;

export type RentIncreaseGuideLink = {
  href: string;
  label: string;
};

export type RentIncreaseGuideSection = {
  id:
    | 'what-is-it'
    | 'legal-rules'
    | 'step-by-step-guide'
    | 'common-mistakes'
    | 'tribunal-risks'
    | 'how-to-avoid-challenges';
  title:
    | 'What is it'
    | 'Legal rules'
    | 'Step-by-step guide'
    | 'Common mistakes'
    | 'Tribunal risks'
    | 'How to avoid challenges';
  paragraphs: string[];
};

export type RentIncreaseGuidePage = {
  slug: RentIncreaseGuideKey;
  path: string;
  title: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBullets: string[];
  metaTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  intentLabel: string;
  introAngle: string;
  heroImage: string;
  heroAlt: string;
  secondaryCta: RentIncreaseGuideLink;
  quickAnswer: string[];
  aboveFoldNote?: string;
  jurisdictionNote?: string;
  sections: RentIncreaseGuideSection[];
  faqs: FAQItem[];
  relatedLinks: RentIncreaseGuideLink[];
  samplePackKey?: RentIncreaseSamplePackKey;
  midCtaTitle: string;
  midCtaBody: string;
  finalCtaTitle: string;
  finalCtaBody: string;
};

export function sections(input: {
  whatIsIt: string[];
  legalRules: string[];
  stepByStep: string[];
  commonMistakes: string[];
  tribunalRisks: string[];
  avoidChallenges: string[];
}): RentIncreaseGuideSection[] {
  return [
    { id: 'what-is-it', title: 'What is it', paragraphs: input.whatIsIt },
    { id: 'legal-rules', title: 'Legal rules', paragraphs: input.legalRules },
    { id: 'step-by-step-guide', title: 'Step-by-step guide', paragraphs: input.stepByStep },
    { id: 'common-mistakes', title: 'Common mistakes', paragraphs: input.commonMistakes },
    { id: 'tribunal-risks', title: 'Tribunal risks', paragraphs: input.tribunalRisks },
    { id: 'how-to-avoid-challenges', title: 'How to avoid challenges', paragraphs: input.avoidChallenges },
  ];
}
