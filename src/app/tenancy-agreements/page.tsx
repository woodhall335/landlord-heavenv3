import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/tenancy-agreements');
const productHref = '/products/ast';
const standardWizardHref = '/wizard?product=ast_standard&src=tenancy_hub&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=tenancy_hub&topic=tenancy';

export const metadata: Metadata = {
  title: 'Tenancy Agreement UK | Find the Right Agreement for Your Property',
  description:
    'Find the tenancy agreement you need for England, Wales, Scotland, or Northern Ireland, including the England changes from 1 May 2026.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreement UK | Find the Right Agreement for Your Property',
    description:
      'Choose the agreement that matches where the property is, with England wording updated for the law from 1 May 2026.',
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
          title="Need a tenancy agreement for a new let?"
          subtitle="Choose the agreement that matches where the property is. If the property is in England, the rules changed on 1 May 2026, so an old AST template can leave you starting with the wrong wording."
          primaryCta={{ label: 'Create your tenancy agreement ->', href: standardWizardHref }}
          secondaryCta={{ label: 'See the premium agreement ->', href: premiumWizardHref }}
          showTrustPositioningBar
          trustPositioningPreset="ast"
          hideMedia
        />

        <Container className="py-12">
          <div className="space-y-6">
            <section className="mx-auto max-w-4xl">
              <SeoPageContextPanel pathname="/tenancy-agreements" />
            </section>

            <section className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm text-gray-700">
              <p>
                Start with where the property is, then move into the page that matches it: the{' '}
                <Link href="/tenancy-agreements/england" className="font-semibold text-blue-700 hover:underline">
                  England tenancy agreement guide
                </Link>{' '}
                if the property is in England, the{' '}
                <Link href="/wales-tenancy-agreement-template" className="font-semibold text-blue-700 hover:underline">
                  Wales occupation contract guide
                </Link>{' '}
                for Welsh lets, the{' '}
                <Link href="/private-residential-tenancy-agreement-template" className="font-semibold text-blue-700 hover:underline">
                  Scotland PRT guide
                </Link>{' '}
                for Scottish lets, and the{' '}
                <Link href="/northern-ireland-tenancy-agreement-template" className="font-semibold text-blue-700 hover:underline">
                  Northern Ireland tenancy agreement guide
                </Link>{' '}
                for Northern Ireland. That way you do not start with the wrong template and discover it later.
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
                England periodic tenancy guide
              </Link>
              <Link href={productHref} className="rounded-lg border p-4 hover:bg-gray-50">
                Compare Standard and Premium
              </Link>
            </div>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-3 text-xl font-bold text-gray-900">What you may need next</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Link href="/renew-tenancy-agreement-england" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Check whether an existing England tenancy needs updated paperwork
                </Link>
                <Link href="/update-tenancy-agreement-northern-ireland" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Update terms for a Northern Ireland tenancy
                </Link>
                <Link href="/section-8-notice-template" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Use Section 8 if the tenant breaches the agreement
                </Link>
                <Link href="/eviction-notice-uk" className="rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-primary">
                  Check which eviction notice you need
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-3 text-xl font-bold text-gray-900">Other landlord documents you may need</h2>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <Link href="/landlord-documents-england" className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
                  Browse England landlord documents
                </Link>
                <Link href="/tenancy-agreement" className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
                  Create the standard England agreement
                </Link>
                <Link href="/premium-tenancy-agreement" className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
                  Use the premium agreement for more complex lets
                </Link>
                <Link href="/money-claim" className="rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-primary">
                  Start recovering unpaid rent
                </Link>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </div>
  );
}
