import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/layout/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/eviction-pack-england');
const wizardHref = '/wizard?product=notice_only&src=seo_eviction_pack_england&topic=eviction';

export const metadata: Metadata = {
  title: 'Eviction Pack England | Compliance-Checked Court-Ready Documents',
  description:
    'Start the landlord wizard for a legally validated, solicitor-grade, compliance-checked and court-ready eviction document route in England.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Eviction Pack England | Compliance-Checked Court-Ready Documents',
    description:
      'Start the landlord wizard for a legally validated, solicitor-grade, compliance-checked and court-ready eviction document route in England.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function EvictionPackEnglandPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Eviction Pack England', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Court-Ready Eviction Pack for England"
          subtitle="Use our solicitor-grade, legally validated and compliance-checked workflow to prepare the right eviction documents."
          primaryCta={{ label: 'Start Eviction Wizard', href: wizardHref }}
          secondaryCta={{ label: 'Compare notice options', href: '/eviction-notice' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <Link href={wizardHref} className="hero-btn-primary">Start the wizard</Link>
        </Container>
      </main>
    </div>
  );
}
