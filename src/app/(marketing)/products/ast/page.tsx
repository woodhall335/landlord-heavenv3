import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { FAQSection } from '@/components/seo/FAQSection';
import { StructuredData, breadcrumbSchema, pricingItemListSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import {
  ENGLAND_TENANCY_PRODUCT_IMAGES,
  type EnglandModernTenancyProductSku,
} from '@/lib/tenancy/england-product-model';
import {
  PUBLIC_PRODUCT_DESCRIPTORS,
  getPublicTenancyProducts,
} from '@/lib/public-products';

const canonicalUrl = getCanonicalUrl('/products/ast');
const chooserHref = '/wizard/flow?type=tenancy_agreement&product=tenancy_agreement&src=product_page&topic=tenancy';
const tenancyProducts = getPublicTenancyProducts();

export const metadata: Metadata = {
  title: 'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger',
  description:
    'Choose the right England tenancy agreement for Standard, Premium, Student, HMO / Shared House, and Lodger arrangements under the current framework.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger',
    description:
      'England-only tenancy agreement hub with exact product routes for Standard, Premium, Student, HMO / Shared House, and Lodger use cases.',
    url: canonicalUrl,
  },
};

const faqs = [
  {
    question: 'Is this page England only?',
    answer:
      'Yes. The public tenancy hub now covers England only and routes landlords into the right England agreement product.',
  },
  {
    question: 'What changed after 1 May 2026?',
    answer:
      'The England tenancy framing on the public site has been updated to reflect the current assured periodic starting point rather than older AST-first wording as the lead message.',
  },
  {
    question: 'Why are there separate Standard, Premium, Student, HMO, and Lodger products?',
    answer:
      'Each of those landlord intents now has its own England product so the page can match what landlords search for and the agreement wording can match the setup more honestly.',
  },
  {
    question: 'Should I still use this if I searched for AST?',
    answer:
      'Yes. This is the England tenancy hub that replaces broad AST-style public positioning with a clearer chooser for the exact agreement you need.',
  },
];

type TenancyCardCopy = {
  key: EnglandModernTenancyProductSku;
  bestFor: string;
  bullets: string[];
};

const cardCopy: TenancyCardCopy[] = [
  {
    key: 'england_standard_tenancy_agreement',
    bestFor: 'Straightforward whole-property England lets.',
    bullets: [
      'Baseline ordinary residential route',
      'Best for lower-complexity lets',
      'England-only supporting pack',
    ],
  },
  {
    key: 'england_premium_tenancy_agreement',
    bestFor: 'Ordinary residential lets needing fuller drafting and management detail.',
    bullets: [
      'Broader operational wording',
      'Useful where controls and schedules matter more',
      'Still an ordinary England tenancy route',
    ],
  },
  {
    key: 'england_student_tenancy_agreement',
    bestFor: 'Student lets, guarantor-backed occupancies, and sharer setups.',
    bullets: [
      'Student-focused wording',
      'Guarantor and end-of-term support',
      'Separate from the ordinary residential tiers',
    ],
  },
  {
    key: 'england_hmo_shared_house_tenancy_agreement',
    bestFor: 'Shared-house and HMO-style occupation with communal-area rules.',
    bullets: [
      'Shared occupation drafting',
      'Communal-area and house-rule wording',
      'Built for HMO / shared-house use',
    ],
  },
  {
    key: 'england_lodger_agreement',
    bestFor: 'Resident-landlord room lets and lodger arrangements.',
    bullets: [
      'Lodger-specific route',
      'Avoids forcing the setup into a whole-property tenancy',
      'Cleaner fit for resident-landlord use',
    ],
  },
];

export const runtime = 'nodejs';

export default function EnglandTenancyHubPage() {
  return (
    <div className="min-h-screen bg-[#fcfaff]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Products', url: 'https://landlordheaven.co.uk/pricing' },
          { name: 'England Tenancy Agreements', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={pricingItemListSchema(
          tenancyProducts.map((product) => ({
            sku: product.productType as EnglandModernTenancyProductSku,
            name: product.displayName,
            description: product.metaDescription,
            url: `https://landlordheaven.co.uk${product.landingHref}`,
          }))
        )}
      />

      <section className="border-b border-[#EDE2FF] bg-white">
        <Container className="py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7C3AED]">
                England Tenancy Hub
              </p>
              <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[#141B2D] md:text-6xl">
                Choose the right England tenancy agreement instead of guessing from an old AST template.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[#546075]">
                This hub is now England-only. It exists to route landlords into the exact agreement
                they want to rank for and buy: Standard, Premium, Student, HMO / Shared House, and
                Lodger. The public copy now matches the current England framework from 1 May 2026.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={chooserHref} className="hero-btn-primary">
                  Choose my England agreement
                </Link>
                <Link
                  href={PUBLIC_PRODUCT_DESCRIPTORS.england_standard_tenancy_agreement.landingHref}
                  className="inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white px-5 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#BDAFE8]"
                >
                  Start with Standard
                </Link>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[#E6DBFF] bg-gradient-to-br from-[#F8F5FF] to-white p-8 shadow-[0_20px_50px_rgba(124,58,237,0.08)]">
              <h2 className="text-2xl font-semibold text-[#141B2D]">What changed on the public site</h2>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[#546075]">
                <li>England is now the only public tenancy jurisdiction.</li>
                <li>Each exact agreement term now has its own owner page.</li>
                <li>The hub is a chooser, not a mixed-jurisdiction comparison page.</li>
                <li>Older broad AST language is supporting terminology, not the lead promise.</li>
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-[#141B2D] md:text-5xl">Five England agreement routes</h2>
            <p className="mt-4 text-lg leading-8 text-[#546075]">
              Pick the exact product that matches the landlord task. That keeps the page intent,
              hero promise, and product output aligned all the way through checkout.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tenancyProducts.map((product) => {
              const image = ENGLAND_TENANCY_PRODUCT_IMAGES[product.productType as EnglandModernTenancyProductSku];
              const copy = cardCopy.find((item) => item.key === product.productType)!;

              return (
                <article
                  key={product.key}
                  className="flex h-full flex-col rounded-[2rem] border border-[#E6E2D9] bg-white p-6 shadow-[0_16px_36px_rgba(31,41,55,0.06)]"
                >
                  <div className="overflow-hidden rounded-2xl border border-[#ECE7F8] bg-[#F8F5FF]">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={640}
                      height={420}
                      className="h-52 w-full object-cover"
                    />
                  </div>
                  <div className="mt-6 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7C3AED]">
                      {product.priceLabel}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#141B2D]">{product.displayName}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#546075]">{copy.bestFor}</p>
                    <ul className="mt-5 space-y-2 text-sm leading-6 text-[#546075]">
                      {copy.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span className="mt-2 h-2 w-2 rounded-full bg-[#7C3AED]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={product.landingHref} className="hero-btn-primary">
                      View product page
                    </Link>
                    <Link
                      href={product.wizardHref}
                      className="inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white px-5 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#BDAFE8]"
                    >
                      Start wizard
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#E6DBFF] bg-[#FCFAFF] p-6 md:p-10">
            <h2 className="text-3xl font-bold text-[#141B2D] md:text-4xl">
              Keep the page promise aligned with the agreement you sell
            </h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-5">
                <h3 className="text-lg font-semibold text-[#141B2D]">Search term first</h3>
                <p className="mt-3 text-sm leading-6 text-[#546075]">
                  Landlords searching for a Standard, Premium, Student, HMO, or Lodger agreement
                  should land on the exact product page, not on a broad UK comparison.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5">
                <h3 className="text-lg font-semibold text-[#141B2D]">England-first framing</h3>
                <p className="mt-3 text-sm leading-6 text-[#546075]">
                  The public hub is now explicit about England, the post-1 May 2026 framework, and
                  the landlord task the agreement solves.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-5">
                <h3 className="text-lg font-semibold text-[#141B2D]">Cleaner product ownership</h3>
                <p className="mt-3 text-sm leading-6 text-[#546075]">
                  The hub chooses. The exact product pages own the head terms. That reduces
                  cannibalisation and keeps the CTA path cleaner.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <FAQSection
        title="England tenancy agreement FAQs"
        faqs={faqs}
        className="bg-white py-12 md:py-16"
      />
    </div>
  );
}
