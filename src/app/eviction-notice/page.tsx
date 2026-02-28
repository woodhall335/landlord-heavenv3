import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/eviction-notice');
const wizardHref = '/wizard?product=notice_only&topic=eviction&src=seo_eviction_notice';

export const metadata: Metadata = {
  title: 'Eviction Notice Service | Legally Validated Notice Pack',
  description:
    'Create a legally validated, solicitor-grade, compliance-checked and court-ready eviction notice with guided support for UK landlords.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Eviction Notice Service | Legally Validated Notice Pack',
    description:
      'Create a legally validated, solicitor-grade, compliance-checked and court-ready eviction notice with guided support for UK landlords.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function EvictionNoticePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Eviction Notice', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Legally Validated Eviction Notice for Landlords"
          subtitle="Build a solicitor-grade, compliance-checked and court-ready notice package in minutes."
          primaryCta={{ label: 'Start Eviction Wizard', href: wizardHref }}
          secondaryCta={{ label: 'See complete pack', href: '/eviction-pack-england' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <p className="text-lg text-gray-700">
            Need a faster route to correct paperwork? Use the guided wizard to generate your notice with the right details and jurisdiction-specific wording.
          </p>
          <div className="mt-6">
            <Link href={wizardHref} className="hero-btn-primary">Start now</Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
