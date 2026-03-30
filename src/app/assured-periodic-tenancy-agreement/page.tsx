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
      'In this England cluster, it is the support-page explanation of the newer tenancy wording that landlords now see around modern agreement routes. This page explains the term, but the main template example still lives on the England tenancy agreement template hub.',
  },
  {
    question: 'Does this page replace the main template page?',
    answer:
      'No. The main template destination is /tenancy-agreement-template. This page exists to explain periodic terminology and reform-aware wording without becoming a second template hub.',
  },
  {
    question: 'Why keep both AST and assured periodic pages live?',
    answer:
      'Because landlords still search with AST language, while assured periodic wording is becoming more important in current England discussions. Both support pages capture those terms and route users back to the main hub.',
  },
];

const relatedLinks = [
  {
    href: '/tenancy-agreement-template',
    title: 'England tenancy agreement template',
    description: 'See the main template hub with the full sample agreement preview.',
  },
  {
    href: '/assured-shorthold-tenancy-agreement-template',
    title: 'AST legacy guide',
    description: 'Understand older AST terminology and how it now feeds into the hub.',
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
    'Plain-English England support page explaining assured periodic tenancy wording and routing landlords back to the main tenancy agreement template hub.',
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
      'Understand assured periodic wording for England and move to the main tenancy agreement template hub for the full document example.',
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
      heroSubtitle="This page explains the newer England terminology and where it fits in the cluster. It supports periodic-tenancy intent, but the main template example still lives on the England tenancy agreement template hub."
      heroMediaSrc="/images/wizard-icons/10-signing.png"
      heroMediaAlt="Illustration of a tenancy agreement document"
      primaryCtaLabel="View the England tenancy agreement template"
      primaryCtaHref="/tenancy-agreement-template"
      pagePath={pagePath}
      intentHookTitle="Use this page to understand the wording, not as a second template hub"
      intentHookParagraphs={[
        'If you searched for assured periodic tenancy agreement, the practical question is usually whether this is the newer England wording you now need to understand when choosing a tenancy document. This support page answers that question directly, then routes you to the main template destination.',
        'What it should not do is compete with the main hub for broad tenancy agreement template intent. The hub now owns the example-led England journey because that is where landlords can inspect the agreement structure first and then choose the route that fits the property.',
        'Think of this page as translation and context. Once the terminology makes sense, move back to the main hub or the route-selection page rather than treating this as the end of the journey.',
      ]}
      currentPositionTitle="Where assured periodic wording fits in the current England cluster"
      currentPositionParagraphs={[
        'Assured periodic wording helps explain the direction of travel for new England lets and the way modern tenancy structures are now described. That makes it useful for support content, FAQs, and explanatory guides.',
        'It does not make this page the main template destination. The broad head terms still belong to the England tenancy agreement template hub, while this page focuses on clarifying the language and sending users back to the right core route.',
      ]}
      sections={[
        {
          title: 'What landlords need to know',
          paragraphs: [
            'The first thing to understand is that assured periodic wording is not meant to send you into a separate dead-end branch of the site. It exists to make the current England position easier to follow when older AST terminology still dominates search habits.',
            'The second thing to understand is that this page is not trying to replicate the main template preview. If you want to inspect the actual document structure, the right destination is /tenancy-agreement-template, where the sample agreement and clause sections are shown directly.',
            'The third point is practical: if you already know the tenancy is an ordinary residential whole-property let, move to the main hub and then into Standard or Premium. If the occupier setup is specialist, compare the Student, HMO / Shared House, and Lodger routes on /products/ast.',
          ],
        },
        {
          title: 'Why this page stays support-only',
          paragraphs: [
            'Keeping this page support-only protects the cluster from cannibalisation. It lets Landlord Heaven serve periodic-tenancy and reform-aware queries without diluting the template-first experience on the main England hub.',
            'That means no full sample agreement preview here, no attempt to outrank the main template page for broad head terms, and no mixed signals about which route is the real starting point.',
            'Instead, this page does a narrower job well: define the wording, explain why landlords are seeing it, and point them back to the main hub where the agreement itself can be inspected properly.',
          ],
        },
      ]}
      ctaBlockTitle="Ready to move from terminology into the actual England template?"
      ctaBlockDescription="Open the main tenancy agreement template hub to inspect the document structure first, then choose Standard, Premium, or the specialist route that fits the property."
      faqTitle="Assured periodic tenancy agreement FAQs"
      faqIntro="Short answers for landlords using newer periodic-tenancy wording."
      faqs={faqs}
      finalCtaTitle="Go back to the main England template destination"
      finalCtaDescription="Use the main hub for the real sample agreement preview, then move into Standard, Premium, or the full England route-selection page once you know what the agreement needs to cover."
      finalCtaLabel="Open the England template hub"
      relatedLinks={relatedLinks}
    />
  );
}

