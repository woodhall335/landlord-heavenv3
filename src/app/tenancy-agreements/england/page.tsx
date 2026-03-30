import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import {
  StructuredData,
  breadcrumbSchema,
  faqPageSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreements/england';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'What is this England tenancy agreement guide for now?',
    answer:
      'It is a support page for landlords who want context on the England routes and the terminology shift from older AST wording. If you want the actual example-led template experience, move to the main England template hub first.',
  },
  {
    question: 'Does this page replace the tenancy agreement template hub?',
    answer:
      'No. The broad England owner is /tenancy-agreement-template. This guide stays live to support broader agreement-intent searches without competing with the template-first hub.',
  },
  {
    question: 'Should I go to /products/ast first from here?',
    answer:
      'Not for broad template intent. Broad users should move to the England template hub first. The comparison page is a downstream option for landlords who need every route shown side by side after they have seen the main hub.',
  },
] as const;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'England Tenancy Agreement Guide | Support Page',
  description:
    'Support guide for landlords using England tenancy agreement wording, with the main route back to the England tenancy agreement template hub.',
  keywords: [
    'england tenancy agreement guide',
    'england tenancy agreement',
    'tenancy agreements england',
    'ast terminology england',
    'assured periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'England Tenancy Agreement Guide | Support Page',
    description:
      'Support page explaining England tenancy agreement wording and routing landlords back to the main template-first hub.',
    url: canonicalUrl,
    type: 'website',
    locale: 'en_GB',
    siteName: 'Landlord Heaven',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'England Tenancy Agreement Guide | Support Page',
    description:
      'Support page for England tenancy agreement terminology and next steps back to the main template hub.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EnglandTenancyAgreementsPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'England Tenancy Agreement Guide', url: canonicalUrl },
        ])}
      />
      <StructuredData data={faqPageSchema([...faqs])} />

      <EnglandTenancyPage
        pagePath={pagePath}
        title="England Tenancy Agreement Guide"
        subtitle="Use this page as a support guide for England terminology and route context, then move to the England template hub first if you want the real agreement example and the main template-led journey."
        primaryCtaLabel="View the England tenancy agreement template"
        primaryCtaHref="/tenancy-agreement-template"
        secondaryCtaLabel="Start Standard Tenancy Agreement"
        secondaryCtaHref="/standard-tenancy-agreement"
        legacyNotice="This page stays live as a support guide. It captures broader England tenancy-agreement searches and older AST-led wording, but the template-first owner remains /tenancy-agreement-template."
        introTitle="Why this England guide still exists"
        introBody={[
          'Landlords do not always arrive with clean template-first intent. Some want the document example immediately, while others want context on the wording shift from older AST terminology or reassurance that they are still in the right England cluster.',
          'That is why this page remains live as support content. Its job is to explain the route landscape, keep England-specific terminology straight, and move users to the England template hub first instead of pushing broad users straight into a comparison or checkout surface.',
          'Once the main hub has satisfied the broad template question, landlords can branch into Standard, Premium, the specialist routes, or the full route-selection page if they still need side-by-side comparison.',
        ]}
        highlights={[
          'Keeps the England agreement cluster discoverable without trying to replace the main template-first hub',
          'Explains how Standard and Premium fit the default mainstream England journey',
          'Keeps Student, HMO / Shared House, and Lodger as separate specialist branches when the facts demand them',
          'Routes AST and assured periodic terminology back into the main template destination instead of letting support pages compete',
        ]}
        compliancePoints={[
          'Broad England template intent now belongs to /tenancy-agreement-template, not this support page',
          'The page is careful with current England wording while still acknowledging older AST search behaviour',
          'Primary user journey moves back to the main template hub before any side-by-side product comparison',
        ]}
        keywordTargets={[
          'england tenancy agreement',
          'tenancy agreements england',
          'ast terminology england',
          'assured periodic tenancy agreement england',
        ]}
        faqs={[...faqs]}
        routeComparison={[
          {
            title: 'Main England template hub',
            description:
              'See the sample agreement preview first, then move into Standard or Premium once the template intent has been satisfied.',
            href: '/tenancy-agreement-template',
            ctaLabel: 'Open the hub',
          },
          {
            title: 'Standard tenancy agreement',
            description:
              'Use the main mainstream route for straightforward whole-property lets once you know the ordinary residential path is the right fit.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'View Standard',
          },
          {
            title: 'Compare all England routes',
            description:
              'Use the comparison page only if you still need Standard, Premium, Student, HMO / Shared House, and Lodger shown side by side.',
            href: '/products/ast',
            ctaLabel: 'Compare routes',
          },
        ]}
      />
    </div>
  );
}
