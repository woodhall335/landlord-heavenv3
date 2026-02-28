import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/money-claim');
const wizardHref = '/wizard?product=money_claim&topic=debt&src=seo_money_claim';

export const metadata: Metadata = {
  title: 'Money Claim for Landlords | Solicitor-Grade Debt Recovery',
  description:
    'Prepare a legally validated, solicitor-grade, compliance-checked and court-ready money claim path for tenant debt and arrears recovery.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Money Claim for Landlords | Solicitor-Grade Debt Recovery',
    description:
      'Prepare a legally validated, solicitor-grade, compliance-checked and court-ready money claim path for tenant debt and arrears recovery.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function MoneyClaimPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Money Claim', url: canonicalUrl },
          ])}
        />
        <UniversalHero
          title="Court-Ready Money Claim for Rent Debt"
          subtitle="Generate a legally validated, solicitor-grade and compliance-checked debt recovery workflow before filing your claim."
          primaryCta={{ label: 'Start Money Claim Wizard', href: wizardHref }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="space-y-6">
            <Link href={wizardHref} className="hero-btn-primary">Start debt claim wizard</Link>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Related actions</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Link href="/section-8-rent-arrears-eviction" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Tenant still in property? Start Section 8 eviction
                </Link>
                <Link href="/possession-claim-guide" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Already have judgment? Move to possession claim process
                </Link>
                <Link href="/eviction-notice-uk" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Compare Section 8 and Section 21 notice routes
                </Link>
                <Link href="/tenancy-agreements" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Update tenancy documents to reduce repeat debt disputes
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </div>
  );
}
