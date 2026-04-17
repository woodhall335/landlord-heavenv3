import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { astHeroConfig } from '@/components/landing/heroConfigs';
import { Container } from '@/components/ui/Container';
import { FAQSection } from '@/components/seo/FAQSection';
import { StructuredData, breadcrumbSchema, pricingItemListSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';
import {
  ENGLAND_TENANCY_PRODUCT_IMAGES,
  type EnglandModernTenancyProductSku,
} from '@/lib/tenancy/england-product-model';
import { getPublicTenancyProducts } from '@/lib/public-products';

const canonicalUrl = getCanonicalUrl('/products/ast');
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
      'Tenancy agreement hub for landlords in England with exact product routes for Standard, Premium, Student, HMO / Shared House, and Lodger use cases.',
    url: canonicalUrl,
  },
};

const faqs = [
  {
    question: 'Who is this hub for?',
    answer:
      'It is for landlords putting a tenancy in place for property in England and choosing between the exact agreement products.',
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
      'Supporting documents for England lets',
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

      <UniversalHero {...astHeroConfig} />

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
