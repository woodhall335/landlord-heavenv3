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
      'Solicitor-Grade Landlord Documents | Eviction Notices, Tenancy Agreements & Money Claims | Landlord Heaven',
  },
  description:
    'Create legally validated landlord documents including eviction notices, tenancy agreements, and court-ready money claims. Start the correct legal route in minutes.',
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
      'Solicitor-Grade Landlord Documents | Eviction Notices, Tenancy Agreements & Money Claims',
    description:
      'Create legally validated landlord documents including eviction notices, tenancy agreements, and court-ready money claims. Start the correct legal route in minutes.',
    type: 'website',
    url: 'https://landlordheaven.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Solicitor-Grade Landlord Documents | Eviction Notices, Tenancy Agreements & Money Claims',
    description:
      'Create legally validated landlord documents including eviction notices, tenancy agreements, and court-ready money claims. Start the correct legal route in minutes.',
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