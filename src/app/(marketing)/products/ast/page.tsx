import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Container } from '@/components/ui/Container';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCTS } from '@/lib/pricing/products';

const canonicalUrl = getCanonicalUrl('/products/ast');

const regions = [
  {
    name: 'England',
    heading: 'Residential Tenancy Agreement',
    body:
      'Updated for the Renters’ Rights Act 2025 public position. The live England flow is now sold as a Renters’ Rights compliant Residential Tenancy Agreement rather than an AST-first product.',
    href: '/tenancy-agreement',
  },
  {
    name: 'Wales',
    heading: 'Occupation Contract',
    body:
      'Wales remains on its current occupation contract framework and is not positioned under the England Renters’ Rights wording.',
    href: '/wizard?product=ast_standard&jurisdiction=wales&src=product_page&topic=tenancy',
  },
  {
    name: 'Scotland',
    heading: 'Private Residential Tenancy',
    body:
      'Scotland remains on the PRT framework with jurisdiction-specific drafting and no England Act positioning.',
    href: '/wizard?product=ast_standard&jurisdiction=scotland&src=product_page&topic=tenancy',
  },
  {
    name: 'Northern Ireland',
    heading: 'Private Tenancy Agreement',
    body:
      'Northern Ireland continues on its own private tenancy framework and separate wording.',
    href: '/wizard?product=ast_standard&jurisdiction=northern-ireland&src=product_page&topic=tenancy',
  },
];

export const metadata: Metadata = {
  title: `Renters Rights Compliant Tenancy Agreement | England Residential Tenancy Agreement | From ${PRODUCTS.ast_standard.displayPrice}`,
  description:
    'UK tenancy agreement hub with England now updated to a Renters’ Rights compliant Residential Tenancy Agreement, plus Wales occupation contracts, Scotland PRTs, and NI private tenancies.',
  keywords: [
    'renters rights compliant tenancy agreement',
    'renters rights act tenancy agreement',
    'updated tenancy agreement england',
    'residential tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Renters Rights Compliant Tenancy Agreement | UK Hub',
    description:
      'England Residential Tenancy Agreement plus Wales, Scotland, and Northern Ireland tenancy agreement variants.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function ASTProductPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreements', url: canonicalUrl },
        ])}
      />

      <UniversalHero
        title="Renters Rights Compliant Tenancy Agreement"
        subtitle="Use the updated Landlord Heaven tenancy agreement hub. England now leads with a Residential Tenancy Agreement updated for the Renters’ Rights Act 2025, while Wales, Scotland, and Northern Ireland remain jurisdiction-scoped."
        primaryCta={{
          label: `Start England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
          href: '/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy',
        }}
        secondaryCta={{
          label: `Premium England agreement - ${PRODUCTS.ast_premium.displayPrice}`,
          href: '/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy',
        }}
        showTrustPositioningBar
        hideMedia
      />

      <Container className="py-12">
        <section className="mb-12 max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900">England has changed first</h2>
          <div className="mt-4 space-y-4 text-lg text-gray-700">
            <p>
              The live England tenancy product is now positioned as a <strong>Residential Tenancy Agreement</strong>
              updated for the <strong>Renters&apos; Rights Act 2025</strong>. This is the primary commercial and SEO position for the England flow.
            </p>
            <p>
              We still keep legacy AST pages live for search demand, but they now act as explainers that point landlords into the updated England tenancy product rather than selling ASTs as the live route.
            </p>
          </div>
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          {regions.map((region) => (
            <div key={region.name} className="rounded-2xl border border-gray-200 p-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{region.name}</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">{region.heading}</h2>
              <p className="mt-3 text-gray-700">{region.body}</p>
              <Link
                href={region.href}
                className="mt-5 inline-flex items-center rounded-lg border border-blue-300 px-4 py-2 font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Open {region.name} flow
              </Link>
            </div>
          ))}
        </section>

        <section className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Keyword targeting on this hub</h2>
          <p className="mt-3 text-gray-700">
            Primary keyword: <strong>renters rights compliant tenancy agreement</strong>
          </p>
          <p className="mt-2 text-gray-700">
            Secondary keywords: <strong>renters rights act tenancy agreement</strong>, <strong>updated tenancy agreement england</strong>, <strong>residential tenancy agreement england</strong>
          </p>
        </section>
      </Container>
    </div>
  );
}
