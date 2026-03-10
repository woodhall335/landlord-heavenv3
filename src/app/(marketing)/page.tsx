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
      'Evict a Tenant, Recover Rent Arrears & Serve the Right Notice',
  },
  description:
    'Landlord-focused tools to help you evict a tenant, choose Section 21 vs Section 8, serve an eviction notice, and recover rent arrears with a money claim.',
  keywords: [
    'evict a tenant',
    'how to evict a tenant',
    'eviction notice',
    'section 8 notice',
    'section 21 notice',
    'section 21',
    'section 8',
    'notice seeking possession',
    'money claim',
    'recover rent arrears',
    'rent arrears',
    'complete eviction pack',
  ],
  openGraph: {
    title:
      'Evict a Tenant, Recover Rent Arrears & Serve the Right Notice',
    description:
      'Landlord-focused tools to help you evict a tenant, choose Section 21 vs Section 8, serve an eviction notice, and recover rent arrears with a money claim.',
    type: 'website',
    url: 'https://landlordheaven.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'Evict a Tenant, Recover Rent Arrears & Serve the Right Notice',
    description:
      'Landlord-focused tools to help you evict a tenant, choose Section 21 vs Section 8, serve an eviction notice, and recover rent arrears with a money claim.',
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