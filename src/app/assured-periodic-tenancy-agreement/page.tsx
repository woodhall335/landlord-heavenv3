import type { Metadata } from 'next';
import { TenancyFunnelLandingPage } from '@/components/seo/TenancyFunnelLandingPage';
import { articleSchema, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/assured-periodic-tenancy-agreement';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'What is an assured periodic tenancy agreement in plain English?',
    answer:
      'It is the current form of tenancy used for many new private lets in England. This guide explains the term and links to a worked agreement and the available products.',
  },
  {
    question: 'Does this page replace the main England agreement example page?',
    answer:
      'No. This guide explains periodic terminology. Use the tenancy agreement example page when you want to inspect the document itself.',
  },
  {
    question: 'Why keep both AST and assured periodic pages live?',
    answer:
      'Because landlords still search with AST language while newer England guidance increasingly uses assured periodic wording. Keeping both pages live helps Landlord Heaven answer both searches and then send landlords to the right agreement page.',
  },
];

const relatedLinks = [
  {
    href: '/tenancy-agreement-template',
    title: 'England tenancy agreement example',
    description: 'See the worked agreement and decide which England product fits the let.',
  },
  {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST legacy guide',
    description: 'Understand older AST terminology and how it relates to current England agreements.',
  },
  {
    href: '/products/ast',
    title: 'Compare England agreement types',
    description: 'Review Standard, Premium, Student, HMO / Shared House, and Lodger in one place.',
  },
] as const;

export const metadata: Metadata = {
  title: 'Assured Periodic Tenancy Agreement | England Support Guide',
  description:
    'Plain-English England guide explaining assured periodic tenancy wording and pointing landlords to the England agreement example page and comparison page.',
  keywords: [
    'assured periodic tenancy agreement',
    'periodic tenancy agreement england',
    'new tenancy law england',
    'ast vs assured periodic',
    'renters reform tenancy agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Assured Periodic Tenancy Agreement | England Support Guide',
    description:
      'Understand assured periodic wording for England, then move to the England agreement example page or comparison page.',
    url: canonicalUrl,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AssuredPeriodicTenancyAgreementPage() {
  return (
    <TenancyFunnelLandingPage
      breadcrumbData={breadcrumbSchema([
        { name: 'Home', url: getCanonicalUrl('/') },
        { name: 'Assured Periodic Tenancy Agreement', url: canonicalUrl },
      ])}
      articleSchemaData={articleSchema({
        headline: 'Assured Periodic Tenancy Agreement',
        description: metadata.description as string,
        url: canonicalUrl,
        datePublished: '2026-03-30',
        dateModified: '2026-03-30',
      })}
      faqSchemaData={faqPageSchema(faqs)}
      heroTitle="Assured Periodic Tenancy Agreement"
      heroSubtitle="Understand assured periodic tenancy wording, inspect a worked England agreement and compare the available products."
      heroMediaSrc="/images/wizard-icons/10-signing.png"
      heroMediaAlt="Illustration of a tenancy agreement document"
      primaryCtaLabel="View the England agreement example"
      primaryCtaHref="/tenancy-agreement-template"
      pagePath={pagePath}
      intentHookTitle="Use this page to understand the wording before choosing an agreement"
      intentHookParagraphs={[
        'If you searched for assured periodic tenancy agreement, you probably want to know whether this is the current England wording for a new let. The short answer is yes for many ordinary private tenancies.',
        'Use the worked agreement page to inspect the document itself. Use the comparison page when you need to choose between Standard, Premium, Student, HMO / Shared House and Lodger agreements.',
        'Once the terminology is clear, continue to the agreement that matches the property and occupiers.',
      ]}
      intentHookCta={{
        href: '/standard-tenancy-agreement',
        label: "Create an assured periodic tenancy agreement",
        suffix: 'when you already know the let is a standard England residential tenancy.',
      }}
      currentPositionTitle="Where assured periodic wording applies"
      currentPositionParagraphs={[
        'Assured periodic wording describes the current starting point for many new private tenancies in England. It replaces the familiar fixed-term AST framing used before 1 May 2026.',
        'The right document still depends on the property and living arrangement. Ordinary whole-property lets, student houses, HMOs and lodger arrangements do not all use identical wording.',
      ]}
      sections={[
        {
          title: 'What landlords need to know',
          paragraphs: [
            'Older AST terminology still appears in searches and existing paperwork, but it should not determine which agreement you use for a new let.',
            'Inspect the worked example if you want to see the document structure and clause sections before buying.',
            'For an ordinary whole-property let, compare Standard and Premium. For a specialist arrangement, compare the Student, HMO / Shared House and Lodger agreements.',
          ],
        },
        {
          title: 'When to use the worked agreement instead',
          paragraphs: [
            'This guide focuses on the meaning of an assured periodic tenancy and how that wording affects a new England agreement.',
            'The full agreement example and product comparison sit on separate pages so that you can inspect the wording or choose a paid option when you are ready.',
            'Use this page to understand the terminology, then continue to the example or agreement builder for the practical next step.',
          ],
        },
      ]}
      ctaBlockTitle="Ready to move from terminology into the actual England agreement?"
      ctaBlockDescription="Inspect the worked England agreement, then choose Standard, Premium or the specialist product that fits the property."
      faqTitle="Assured periodic tenancy agreement FAQs"
      faqIntro="Short answers for landlords using newer periodic-tenancy wording."
      faqs={faqs}
      finalCtaTitle="Go from the wording to the right England agreement page"
      finalCtaDescription="Use the England agreement example to inspect the sample document, then move into Standard, Premium, or the full England comparison page once you know what the agreement needs to cover."
      finalCtaLabel="Open the England agreement example"
      relatedLinks={relatedLinks}
    />
  );
}
