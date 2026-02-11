/**
 * Landing Page - Server Component
 *
 * High-converting landing page for Landlord Heaven.
 * Server component for proper SEO metadata export.
 *
 * Design Principles:
 * - Trust-first: Professional, clean, credible
 * - Value clarity: Savings immediately obvious
 * - Anxiety reduction: Simple process, support available
 * - Action-oriented: Single primary CTA per section
 */

import { Metadata } from 'next';
import { HomeContent } from '@/components/landing';
import { StructuredData, websiteSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: {
    absolute: 'Landlord Heaven - UK Landlord Legal Documents'
  },
  description:
    'Reduce possession failure risk with court-ready notices, tenancy agreements, and legal documents in minutes. Save 80%+ vs solicitors. Section 21 ends May 2026 - act now. Trusted by UK landlords.',
  keywords: [
    'section 21 notice',
    'section 8 notice',
    'eviction notice UK',
    'landlord documents',
    'tenancy agreement',
    'court-ready documents',
    'UK landlord',
    'eviction pack',
    'money claim',
    'rent arrears',
  ],
  openGraph: {
    title: 'Landlord Heaven - Court-Ready Legal Documents for UK Landlords',
    description:
      'Reduce possession failure risk with court-ready notices and legal documents in minutes. Save 80%+ vs solicitors. Trusted by UK landlords.',
    type: 'website',
    url: 'https://landlordheaven.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landlord Heaven - Court-Ready Legal Documents for UK Landlords',
    description:
      'Reduce possession failure risk with court-ready notices and legal documents in minutes. Save 80%+ vs solicitors.',
  },
  alternates: {
    canonical: 'https://landlordheaven.co.uk',
  },
};

export default function HomePage() {
  return (
    <>
      {/* WebSite schema - homepage only */}
      <StructuredData data={websiteSchema()} />
      <HomeContent />
    </>
  );
}
