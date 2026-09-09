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
      'It explains the current England agreement options and the change from older AST wording. You can also inspect a worked agreement example before choosing a product.',
  },
  {
    question: 'Does this page replace the England agreement example page?',
    answer:
      'No. This page explains the options. The England agreement example page lets you inspect a worked document before deciding what to buy.',
  },
  {
    question: 'Where can I compare all five England agreements?',
    answer:
      'Use the England agreement comparison page to compare Standard, Premium, Student, HMO / Shared House and Lodger agreements side by side. If you want to see the document first, begin with the worked agreement example.',
  },
] as const;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'England Tenancy Agreement Guide | Support Page',
  description:
    'Plain-English guide to current England tenancy agreements, older AST terminology, worked document examples and the five available agreement types.',
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
      'Understand current England tenancy agreement wording, inspect a worked example and compare the available agreement types.',
    url: canonicalUrl,
    type: 'website',
    locale: 'en_GB',
    siteName: 'Landlord Heaven',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'England Tenancy Agreement Guide | Support Page',
    description:
      'Understand England tenancy agreement terminology, inspect a worked example and compare the available agreements.',
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
        subtitle="Understand the current England terminology, inspect a worked agreement and choose the product that fits your property and occupiers."
        primaryCtaLabel="View the England agreement example"
        primaryCtaHref="/tenancy-agreement-template"
        secondaryCtaLabel="Create my Standard agreement"
        secondaryCtaHref="/standard-tenancy-agreement"
        legacyNotice="Landlords still use AST terminology, but new England lets need paperwork that reflects the current assured periodic framework."
        introTitle="Start with the tenancy you are creating"
        introBody={[
          'Some landlords want to inspect a document immediately. Others need to understand what changed from older AST terminology before they choose. Both questions are answered here.',
          'The worked example shows how a current agreement is structured. The comparison page then helps you choose between Standard, Premium, Student, HMO / Shared House and Lodger agreements.',
          'Your choice should reflect the property, occupiers and level of management detail you need. Each product shows its fixed price and document contents before you start.',
        ]}
        highlights={[
          'Explains the change from older AST wording in plain English',
          'Shows how Standard and Premium cover ordinary residential lets',
          'Keeps Student, HMO / Shared House and Lodger agreements for the arrangements they are designed for',
          'Links directly to a worked example and the five-product comparison',
        ]}
        compliancePoints={[
          'Use an England agreement only for property in England',
          'Check the agreement matches the occupiers and how the property is let',
          'Review the generated document and all facts before payment and signing',
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
              'Inspect a worked agreement and its supporting documents before choosing Standard or Premium.',
            href: '/tenancy-agreement-template',
            ctaLabel: 'View agreement example',
          },
          {
            title: 'Standard tenancy agreement',
            description:
              'Create the mainstream agreement for a straightforward whole-property residential let.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Build Standard pack',
          },
          {
            title: 'Compare all England agreements',
            description:
              'Compare Standard, Premium, Student, HMO / Shared House and Lodger side by side.',
            href: '/products/ast',
            ctaLabel: 'Compare England agreements',
          },
        ]}
      />
    </div>
  );
}
