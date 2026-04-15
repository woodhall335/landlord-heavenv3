import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import {
  StructuredData,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const pagePath = '/tenancy-agreements/england';
const canonicalUrl = getCanonicalUrl(pagePath);

const faqs = [
  {
    question: 'What is this England tenancy agreement guide for now?',
    answer:
      'It is a support page for landlords who want context on the England routes and the terminology shift from older AST wording. If you want to inspect a real agreement example first, move to /tenancy-agreement-template.',
  },
  {
    question: 'Does this page replace the England agreement example page?',
    answer:
      'No. The broad England example page is /tenancy-agreement-template. This guide stays live to support broader agreement-intent searches without competing with the example page.',
  },
  {
    question: 'Should I go to /products/ast first from here?',
    answer:
      'Only if you already know you want to compare all five England routes. If you want to inspect a real agreement example first, start with /tenancy-agreement-template and then move to /products/ast when you are ready to compare routes side by side.',
  },
] as const;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'England Tenancy Agreement Guide | Support Page',
  description:
    'Support guide for landlords using England tenancy agreement wording, with clear routes into the England agreement example page and comparison page.',
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
      'Support page explaining England tenancy agreement wording and routing landlords into the example page or comparison page.',
    url: canonicalUrl,
    type: 'website',
    locale: 'en_GB',
    siteName: 'Landlord Heaven',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'England Tenancy Agreement Guide | Support Page',
    description:
      'Support page for England tenancy agreement terminology and next steps into the example page or comparison page.',
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
      <EnglandTenancyPage
        pagePath={pagePath}
        title="England Tenancy Agreement Guide"
        subtitle="Use this page as a support guide for England terminology and route context, then move to the England agreement example or comparison page when you are ready to choose the right route."
        primaryCtaLabel="View the England agreement example"
        primaryCtaHref="/tenancy-agreement-template"
        secondaryCtaLabel="Start Standard Tenancy Agreement"
        secondaryCtaHref="/standard-tenancy-agreement"
        legacyNotice="This page stays live as a support guide. It captures broader England tenancy-agreement searches and older AST-led wording, while the main example page remains /tenancy-agreement-template."
        introTitle="Why this England guide still exists"
        introBody={[
          'Landlords do not always arrive with clean template-first intent. Some want the document example immediately, while others want context on the wording shift from older AST terminology or reassurance that they are still on the right England route.',
          'That is why this page remains live as support content. Its job is to explain the route landscape, keep England-specific terminology straight, and move users to the England agreement example or comparison page instead of leaving them with a vague overview.',
          'Once the example page has satisfied the broad template question, landlords can branch into Standard, Premium, the specialist routes, or the full comparison page if they still need side-by-side help.',
        ]}
        highlights={[
          'Keeps the England agreement pages discoverable without trying to replace the main example page',
          'Explains how Standard and Premium fit the default mainstream England journey',
          'Keeps Student, HMO / Shared House, and Lodger as separate specialist branches when the facts demand them',
          'Routes AST and assured periodic terminology back into the main agreement pages instead of letting support pages compete',
        ]}
        compliancePoints={[
          'Broad England example intent now belongs to /tenancy-agreement-template, not this support page',
          'The page is careful with current England wording while still acknowledging older AST search behaviour',
          'Primary user journey moves into the agreement example page before any side-by-side product comparison',
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
            title: 'England agreement example',
            description:
              'See the sample agreement preview first, then move into Standard or Premium once the template intent has been satisfied.',
            href: '/tenancy-agreement-template',
            ctaLabel: 'View agreement example',
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
            ctaLabel: 'Compare England routes',
          },
        ]}
      />
    </div>
  );
}
