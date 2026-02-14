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
    absolute: 'Complete UK Eviction Case Bundles | Landlord Heaven'
  },
  description:
    'Complete eviction case bundles. AI-generated. Compliance-checked. Ready to file. Section 21 and Section 8 in England, Section 173 in Wales, and Notice to Leave workflows in Scotland. No-fault evictions (Section 21) end from 1 May 2026 in England.',
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
    title: 'Complete UK Eviction Case Bundles in Minutes | Landlord Heaven',
    description:
      'AI-generated, jurisdiction-specific eviction case bundles for England, Wales, and Scotland. Compliance-checked and ready to file.',
    type: 'website',
    url: 'https://landlordheaven.co.uk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Complete UK Eviction Case Bundles in Minutes | Landlord Heaven',
    description:
      'Generate compliance-checked UK eviction case bundles with statutory-grounded automation.',
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
