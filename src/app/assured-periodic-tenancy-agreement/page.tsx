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
      'In plain English, it is the newer England wording many landlords now see when choosing a tenancy agreement for a new let. This page explains the term, then points you to the England agreement example page or the comparison page so you can choose the right route.',
  },
  {
    question: 'Does this page replace the main England agreement example page?',
    answer:
      'No. The main example page is /tenancy-agreement-template. This page exists to explain periodic terminology and then send landlords to the page that shows the agreement itself.',
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
    description: 'See the sample agreement preview and decide which England route fits the let.',
  },
  {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST legacy guide',
    description: 'Understand older AST terminology and how it now feeds into the current England route.',
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
      heroSubtitle="This page explains the newer England terminology in plain English, then points you to the England agreement example page or comparison page so you can choose the right route."
      heroMediaSrc="/images/wizard-icons/10-signing.png"
      heroMediaAlt="Illustration of a tenancy agreement document"
      primaryCtaLabel="View the England agreement example"
      primaryCtaHref="/tenancy-agreement-template"
      pagePath={pagePath}
      intentHookTitle="Use this page to understand the wording before choosing an agreement"
      intentHookParagraphs={[
        'If you searched for assured periodic tenancy agreement, the practical question is usually whether this is the newer England wording you now need to understand when choosing a tenancy document. This page answers that question directly, then points you to the page that shows a real agreement example.',
        'It should not try to replace the broader England agreement journey. Landlords who want to inspect the agreement itself should move to /tenancy-agreement-template, while landlords who want to compare all five live England routes should move to /products/ast.',
        'Think of this page as translation and context. Once the terminology makes sense, move into the agreement example or comparison page rather than treating this support guide as the end of the journey.',
      ]}
      currentPositionTitle="Where assured periodic wording fits in the current England route"
      currentPositionParagraphs={[
        'Assured periodic wording helps explain the direction of travel for new England lets and the way modern tenancy structures are now described. That makes it useful for support content, FAQs, and explanatory guides.',
        'It does not make this page the main example or buying page. The broad England head terms should still resolve into the sample agreement page or the comparison page once the wording has been clarified.',
      ]}
      sections={[
        {
          title: 'What landlords need to know',
          paragraphs: [
            'The first thing to understand is that assured periodic wording is not meant to send you into a separate dead-end branch of the site. It exists to make the current England position easier to follow when older AST terminology still dominates search habits.',
            'The second thing to understand is that this page is not trying to replicate the main agreement preview. If you want to inspect the actual document structure, the right destination is /tenancy-agreement-template, where the sample agreement and clause sections are shown directly.',
            'The third point is practical: if you already know the tenancy is an ordinary residential whole-property let, move to the England agreement example and then into Standard or Premium. If the occupier setup is specialist, compare the Student, HMO / Shared House, and Lodger routes on /products/ast.',
          ],
        },
        {
          title: 'Why this page stays support-only',
          paragraphs: [
            'Keeping this page support-only helps Landlord Heaven answer periodic-tenancy and reform-aware searches without weakening the clearer example-led and product-led pages.',
            'That means no full sample agreement preview here, no attempt to outrank the main example page for broad head terms, and no mixed signals about which route is the real starting point.',
            'Instead, this page does a narrower job well: define the wording, explain why landlords are seeing it, and point them back to the page where the agreement itself can be inspected properly.',
          ],
        },
      ]}
      ctaBlockTitle="Ready to move from terminology into the actual England agreement?"
      ctaBlockDescription="Open the England agreement example page to inspect the document structure first, then choose Standard, Premium, or the specialist route that fits the property."
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
