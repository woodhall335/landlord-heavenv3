import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreements');
const wizardHref = '/wizard?product=tenancy_agreement&src=seo_tenancy_agreements&topic=tenancy';

export const metadata: Metadata = {
  title: 'Tenancy Agreements Hub | Solicitor-Grade Landlord Documents',
  description:
    'Explore tenancy agreement options and start a legally validated, solicitor-grade, compliance-checked and court-ready agreement wizard.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreements Hub | Solicitor-Grade Landlord Documents',
    description:
      'Explore tenancy agreement options and start a legally validated, solicitor-grade, compliance-checked and court-ready agreement wizard.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementsHubPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Tenancy Agreements', url: canonicalUrl },
          ])}
        />

        <UniversalHero
          title="Tenancy Agreements for UK Landlords"
          subtitle="Choose your agreement route with legally validated, solicitor-grade, compliance-checked and court-ready drafting support."
          primaryCta={{ label: 'Start Tenancy Wizard', href: wizardHref }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Standard tenancy agreement</Link>
              <Link href="/premium-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Premium tenancy agreement</Link>
              <Link href="/periodic-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Periodic tenancy agreement</Link>
              <Link href={wizardHref} className="rounded-lg border p-4 hover:bg-gray-50">Start wizard</Link>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Next steps after creating your agreement</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Link href="/renew-tenancy-agreement-england" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Renew an existing tenancy agreement
                </Link>
                <Link href="/update-tenancy-agreement-northern-ireland" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Update agreement terms for current tenancies
                </Link>
                <Link href="/section-8-notice-template" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Use Section 8 if the tenant breaches agreement clauses
                </Link>
                <Link href="/eviction-notice-uk" className="rounded-lg border border-gray-200 bg-white p-3 hover:border-primary transition-colors">
                  Check eviction notice routes before enforcement
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </div>
  );
}
