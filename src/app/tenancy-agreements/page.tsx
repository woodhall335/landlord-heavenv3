import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { residentialDocumentLinks } from '@/lib/seo/internal-links';

const canonicalUrl = getCanonicalUrl('/tenancy-agreements');
const productHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Tenancy Agreements Hub | Renters Rights Compliant Residential Agreements',
  description:
    'Explore tenancy agreement options and start the main Residential Tenancy Agreement wizard with Renters’ Rights compliant England positioning and jurisdiction-aware UK variants.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreements Hub | Renters Rights Compliant Residential Agreements',
    description:
      'Explore tenancy agreement options and start the main Residential Tenancy Agreement wizard with Renters’ Rights compliant England positioning and jurisdiction-aware UK variants.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function TenancyAgreementsHubPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <SeoLandingWrapper
        pagePath="/tenancy-agreements"
        pageTitle={metadata.title as string}
        pageType="tenancy"
        jurisdiction="uk"
      />
      <main>
        <StructuredData
          data={breadcrumbSchema([
            { name: 'Home', url: getCanonicalUrl('/') },
            { name: 'Tenancy Agreements', url: canonicalUrl },
          ])}
        />

        <UniversalHero
          title="Tenancy Agreements for UK Landlords"
          subtitle="Choose the main tenancy wizard flow with Renters’ Rights compliant England Residential Tenancy Agreement wording and jurisdiction-specific UK variants."
          primaryCta={{ label: 'Compare tenancy agreement routes', href: productHref }}
          showTrustPositioningBar
          hideMedia
        />

        <Container className="py-12">
          <div className="space-y-6">
            <section className="mx-auto max-w-4xl">
              <SeoPageContextPanel pathname="/tenancy-agreements" />
            </section>

            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm text-gray-700">
              <p>
                Use this hub to compare the UK routes, then move into the{' '}
                <Link href="/tenancy-agreements/england" className="font-semibold text-blue-700 hover:underline">
                  England tenancy agreement hub
                </Link>{' '}
                for the core Residential Tenancy Agreement journey, the{' '}
                <Link href="/private-residential-tenancy-agreement-template" className="font-semibold text-blue-700 hover:underline">
                  Scotland PRT guide
                </Link>{' '}
                for Scottish lets, and the{' '}
                <Link href={productHref} className="font-semibold text-blue-700 hover:underline">
                  tenancy agreement product page
                </Link>{' '}
                when you are ready to compare live creation options.
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Standard tenancy agreement</Link>
              <Link href="/premium-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Premium tenancy agreement</Link>
              <Link href="/periodic-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">Periodic tenancy agreement</Link>
              <Link href={productHref} className="rounded-lg border p-4 hover:bg-gray-50">Compare tenancy products</Link>
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

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Other England landlord documents</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Link href={residentialDocumentLinks.documentsHub.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Browse the England landlord documents hub
                </Link>
                <Link href={residentialDocumentLinks.leaseAmendment.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Amend selected tenancy clauses
                </Link>
                <Link href={residentialDocumentLinks.guarantorAgreement.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Add a separate guarantor agreement
                </Link>
                <Link href={residentialDocumentLinks.inventoryScheduleCondition.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-primary transition-colors">
                  Create an inventory or schedule of condition
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </div>
  );
}
