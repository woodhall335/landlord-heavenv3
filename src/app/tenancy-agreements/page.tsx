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
const standardWizardHref = '/wizard?product=ast_standard&src=tenancy_hub&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=tenancy_hub&topic=tenancy';

export const metadata: Metadata = {
  title: 'Tenancy Agreements Hub | Current UK Agreement Routes for Landlords',
  description:
    'Compare the main UK tenancy agreement routes, including England wording designed for the assured periodic framework from 1 May 2026.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreements Hub | Current UK Agreement Routes for Landlords',
    description:
      'Compare the main UK tenancy agreement routes with England, Wales, Scotland, and Northern Ireland terminology handled correctly from the start.',
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
          title="Choose the right tenancy agreement for the property jurisdiction"
          subtitle="Use the UK tenancy hub to compare the correct route for England, Wales, Scotland, or Northern Ireland. Old or generic templates may use the wrong legal framework, especially now that new England agreements generally move into the assured periodic model from 1 May 2026."
          primaryCta={{ label: 'Start Standard tenancy agreement', href: standardWizardHref }}
          secondaryCta={{ label: 'Start Premium tenancy agreement', href: premiumWizardHref }}
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
                for the assured periodic England route, the{' '}
                <Link href="/wales-tenancy-agreement-template" className="font-semibold text-blue-700 hover:underline">
                  Wales occupation contract route
                </Link>{' '}
                for Welsh lets, the{' '}
                <Link href="/private-residential-tenancy-agreement-template" className="font-semibold text-blue-700 hover:underline">
                  Scotland PRT guide
                </Link>{' '}
                for Scottish lets, and the{' '}
                <Link href="/northern-ireland-tenancy-agreement-template" className="font-semibold text-blue-700 hover:underline">
                  Northern Ireland private tenancy route
                </Link>{' '}
                when you need the correct local framework from the start.
              </p>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">
                Standard England tenancy agreement
              </Link>
              <Link href="/premium-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">
                Premium England tenancy agreement
              </Link>
              <Link href="/rolling-tenancy-agreement" className="rounded-lg border p-4 hover:bg-gray-50">
                England periodic and rolling agreement guide
              </Link>
              <Link href={productHref} className="rounded-lg border p-4 hover:bg-gray-50">
                Compare all tenancy agreement routes
              </Link>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-3 text-xl font-bold text-gray-900">Next steps after creating your agreement</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Link href="/renew-tenancy-agreement-england" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Review whether an existing England tenancy needs fresh paperwork
                </Link>
                <Link href="/update-tenancy-agreement-northern-ireland" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Update agreement terms for current Northern Ireland tenancies
                </Link>
                <Link href="/section-8-notice-template" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Use Section 8 if the tenant breaches agreement clauses
                </Link>
                <Link href="/eviction-notice-uk" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Check eviction notice routes before enforcement
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-xl font-bold text-gray-900">Other England landlord documents</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Link href={residentialDocumentLinks.documentsHub.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
                  Browse the England landlord documents hub
                </Link>
                <Link href={residentialDocumentLinks.leaseAmendment.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
                  Amend selected tenancy clauses
                </Link>
                <Link href={residentialDocumentLinks.guarantorAgreement.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
                  Add a separate guarantor agreement
                </Link>
                <Link href={residentialDocumentLinks.inventoryScheduleCondition.href} className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
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
