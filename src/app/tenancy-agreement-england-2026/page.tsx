import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { tenancyAgreementEngland2026RelatedLinks } from '@/lib/seo/internal-links';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreement-england-2026';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'Do I always need a brand-new tenancy agreement after 1 May 2026?',
    answer:
      'No. If the tenancy already started before 1 May 2026, you will not usually start again with a new agreement. Depending on the tenancy, you may instead need to provide updated written information.',
  },
  {
    question: 'Who is this page really for?',
    answer:
      'It is for England landlords who are unsure whether the 1 May 2026 change means they need a new agreement or updated information for an existing tenancy.',
  },
  {
    question: 'Why does this page not give a full legal decision tree?',
    answer:
      'Because individual cases can vary. This guide explains the broad difference between new and existing tenancies, then tells you when to seek advice.',
  },
  {
    question: 'What should I do if I am creating a brand-new England tenancy now?',
    answer:
      'Compare the five current England agreements and choose the one that matches the property, occupiers and level of detail you need.',
  },
];

export const metadata: Metadata = {
  title: 'Do I Need a New Tenancy Agreement After 1 May 2026? | England Guide',
  description:
    'England guide to whether you need a new tenancy agreement after 1 May 2026, with a clear route into the current product page.',
  keywords: [
    'do i need a new tenancy agreement after 1 May 2026',
    'tenancy agreement england 2026',
    'renters rights act tenancy agreement england',
    'england tenancy transition 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Do I Need a New Tenancy Agreement After 1 May 2026? | England Guide',
    description:
      'Transition-focused England page that clarifies the 1 May 2026 change and routes landlords into the main tenancy agreement product.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementEngland2026Page() {
  return (
    <TenancyFunnelLandingPage
      breadcrumbData={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'England Tenancy Agreement 2026', url: canonicalUrl },
      ])}
      articleSchemaData={articleSchema({
        headline: 'Do I Need a New Tenancy Agreement After 1 May 2026?',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-24',
        dateModified: '2026-03-24',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="Do I Need a New Tenancy Agreement After 1 May 2026?"
      heroSubtitle="Existing tenancies often do not need to start again. Learn what changed, then choose a current agreement only if you are creating a new tenancy."
      heroMediaSrc="/images/wizard-icons/11-calendar-timeline.png"
      heroMediaAlt="Illustration showing a tenancy timeline and calendar change"
      primaryCtaLabel="Compare current England agreements"
      primaryCtaHref="/products/ast"
      pagePath={pagePath}
      intentHookTitle="This is a transition question first, not a template question"
      intentHookParagraphs={[
        'If you are asking whether you need a new tenancy agreement after 1 May 2026, you are probably trying to avoid two problems at once: using the wrong document for a new tenancy or unnecessarily replacing an older tenancy that should really be handled as a transition case instead.',
        'The distinction is important because buying a new agreement does not automatically solve an existing-tenancy information requirement. Establish when the tenancy began before choosing a document.',
        'The key point is simple: if the tenancy already started before 1 May 2026, you will not usually start again with a new agreement. Depending on the tenancy, you may instead need to provide updated written information.',
      ]}
      currentPositionTitle="What changed, and why landlords are asking this question"
      currentPositionParagraphs={[
        'Before 1 May 2026, many landlords described their agreements as ASTs. New England tenancies after that date start from an assured periodic framework. Existing tenancies need to be considered separately.',
        'Landlords often search for a new agreement, renewal or updated terms without first checking which rules apply. The tenancy start date is the key fact to establish.',
      ]}
      sections={[
        {
          title: 'When you will usually need a current agreement',
          paragraphs: [
            'If you are creating a new private tenancy in England after 1 May 2026, use an agreement written for the current framework rather than adapting an old AST.',
            'You can compare Standard, Premium, Student, HMO / Shared House and Lodger options in one place. Each product explains who it is for, what is included and the price before you begin.',
            'Once you know that you are creating a brand-new tenancy, compare the agreement options and select the one that fits the property and household setup.',
          ],
        },
        {
          title: 'When the answer is usually "do not restart the tenancy"',
          paragraphs: [
            'If the tenancy already started before 1 May 2026, do not assume that you must replace the agreement and begin again. You will not usually start again with a new agreement, although you may need to provide updated written information depending on the tenancy.',
            'Check the transition position before buying a document for an existing tenancy. This avoids paying for a new-agreement product when the issue is really about updating information for an older tenancy.',
            'If you are also creating a genuinely new tenancy, compare the available agreements and choose the one that fits the arrangement.',
          ],
        },
        {
          title: 'A simple way to choose your next step',
          paragraphs: [
            'First establish whether you are creating a new tenancy or dealing with one that began before 1 May 2026. That distinction determines whether you should compare new agreement options or look for transition guidance.',
            'For a new England tenancy, choose the agreement that matches the property and household. For an existing tenancy, check whether updated written information is required before replacing anything.',
            'If your circumstances are unusual or you are unsure how the transition rules apply, obtain legal advice before relying on a document.',
          ],
        },
      ]}
      ctaBlockTitle="Need the current England route for a brand-new tenancy?"
      ctaBlockDescription="Use the main product page to compare the five England agreement routes, see the assured periodic starting point clearly, and avoid using outdated wording for a new agreement."
      faqTitle="England tenancy agreement 2026 FAQs"
      faqIntro="Simple transition answers for landlords asking what changed from 1 May 2026 and whether they need a new agreement."
      faqs={faqs}
      finalCtaTitle="Move from transition confusion to the right next step"
      finalCtaDescription="If you are creating a new England tenancy, use the main product page to compare the current agreement options. If you are dealing with an older tenancy, use that same page to orient yourself around the current route while keeping the transition distinction in view."
      finalCtaLabel="Open the England-first product page"
      relatedLinks={tenancyAgreementEngland2026RelatedLinks}
    />
  );
}
