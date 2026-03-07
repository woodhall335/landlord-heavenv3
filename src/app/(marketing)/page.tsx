/**
 * Landing Page - Server Component
 *
 * Homepage routing via marketing route-group.
 */

import { Metadata } from 'next';
import { HomeContent } from '@/components/landing';
import { StructuredData, websiteSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: {
    absolute:
      'Court-Ready Landlord Documents | Eviction, Tenancy & Money Claims',
  },
  description:
    'Create court-ready landlord notices, tenancy agreements, and money claim packs in minutes.',
  keywords: [
    'eviction notice UK',
    'section 8 notice',
    'section 21 notice',
    'possession claim',
    'money claim',
    'rent arrears',
    'tenancy agreement',
    'landlord documents',
  ],
  openGraph: {
    title:
      'Court-Ready Landlord Documents | Eviction, Tenancy & Money Claims',
    description:
      'Create court-ready landlord notices, tenancy agreements, and money claim packs in minutes.',
    type: 'website',
    url: 'https://landlordheaven.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Court-Ready Landlord Documents | Eviction, Tenancy & Money Claims',
    description:
      'Create court-ready landlord notices, tenancy agreements, and money claim packs in minutes.',
  },
  alternates: {
    canonical: 'https://landlordheaven.co.uk',
  },
};

export default function HomePage() {
  return (
    <>
      <StructuredData data={websiteSchema()} />
      <HomeContent />
    </>
  );
}