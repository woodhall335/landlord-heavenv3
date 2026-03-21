import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/eviction-notice');
const noticeOnlyProductHref = '/products/notice-only';
const completePackProductHref = '/products/complete-pack';

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
    <>
      <SeoLandingWrapper
        pagePath="/eviction-notice"
        pageTitle={metadata.title as string}
        pageType="notice"
        jurisdiction="uk"
      />
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
            primaryCta={{ label: 'Start Notice Only', href: noticeOnlyProductHref }}
            secondaryCta={{ label: 'See complete pack', href: completePackProductHref }}
            showTrustPositioningBar
            hideMedia
          />

          <section className="border-y border-[#E6DBFF] bg-[#FCFAFF] py-8">
            <Container>
              <div className="mx-auto max-w-5xl">
                <SeoPageContextPanel pathname="/eviction-notice" />
              </div>
            </Container>
          </section>

          <Container className="py-12">
            <p className="text-lg text-gray-700">
              Need a faster route to correct paperwork? Use the product-first notice workflow for
              the commercial step, then pair it with the wider{' '}
              <Link href="/eviction-process-uk" className="font-medium text-primary hover:underline">
                eviction process in the UK
              </Link>{' '}
              and the broader{' '}
              <Link href="/how-to-evict-tenant" className="font-medium text-primary hover:underline">
                how to evict a tenant legally
              </Link>{' '}
              guide if you need more context on service, waiting periods, and court escalation.
            </p>
            <div className="mt-6">
              <Link href={noticeOnlyProductHref} className="hero-btn-primary">Start now</Link>
            </div>
          </Container>
        </main>
      </div>
    </>
  );
}
