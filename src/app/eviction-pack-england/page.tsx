import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/eviction-pack-england');
const completePackHref = '/products/complete-pack';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

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
      <SeoLandingWrapper
        pagePath="/eviction-pack-england"
        pageTitle={metadata.title as string}
        pageType="guide"
        jurisdiction="england"
      />
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
          primaryCta={{ label: 'View Complete Pack', href: completePackHref }}
          secondaryCta={{ label: 'Review the possession route', href: '/possession-claim-guide' }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <SeoPageContextPanel pathname="/eviction-pack-england" />
            <p className="mt-4 text-gray-700 leading-7">
              England possession files usually convert better when landlords review the{' '}
              <Link href="/eviction-process-uk" className="font-medium text-primary hover:underline">
                eviction process in the UK
              </Link>
              , line up the court handoff against the{' '}
              <Link href="/possession-claim-guide" className="font-medium text-primary hover:underline">
                possession claim guide
              </Link>
              , and then move into the{' '}
              <Link href="/products/complete-pack" className="font-medium text-primary hover:underline">
                Complete Pack product page
              </Link>{' '}
              once they need end-to-end court continuity.
            </p>
            <div className="mt-6">
              <Link href={completePackHref} className="hero-btn-primary">
                View Complete Pack
              </Link>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}
