import type { Metadata } from 'next';

import { ClaimsWizard } from '@/components/claims/ClaimsWizard';
import { CLAIM_TYPE_CONFIGS } from '@/lib/claims/config';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/claims');

export const metadata: Metadata = {
  title: 'Money Claim Wizard | Landlord Heaven Claims',
  description:
    'Choose a claim type and answer a focused one-question-at-a-time wizard for landlord debt, unpaid invoices, loans, faulty goods, poor service, builder disputes, deposits, and vehicle damage claims.',
  keywords: [
    'money claim wizard',
    'small claim wizard',
    'landlord debt claim',
    'unpaid invoice claim',
    'loan money owed claim',
    'faulty goods refund claim',
    'poor service contractor dispute',
    'builder dispute claim',
    'deposit refund claim',
    'vehicle repair dispute claim',
    'letter before claim',
    'county court claim pack',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'Money Claim Wizard | Landlord Heaven Claims',
    description:
      'A purple, guided claims wizard for common England money claims with category-specific questions, evidence checklists, and claim-pack routing.',
    url: canonicalUrl,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ClaimsPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Landlord Heaven Claims Wizard',
    applicationCategory: 'LegalApplication',
    operatingSystem: 'Web',
    url: canonicalUrl,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'GBP',
    },
    featureList: CLAIM_TYPE_CONFIGS.map((config) => config.label),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ClaimsWizard />
    </>
  );
}
