import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { PRODUCTS } from '@/lib/pricing/products';

const canonicalUrl = getCanonicalUrl('/products/ast');
const standardWizardHref = '/wizard?product=ast_standard&src=product_page&topic=tenancy';
const premiumWizardHref = '/wizard?product=ast_premium&src=product_page&topic=tenancy';
const PRIMARY_BUTTON_CLASS =
  'hero-btn-primary inline-flex items-center justify-center text-center text-base font-semibold';
const LIGHT_SECONDARY_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white/85 px-4 py-3 text-center text-base font-semibold text-[#2A3550] transition hover:border-[#BDAFE8] hover:bg-white';
const DARK_SECONDARY_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/15';

type ProductCardData = {
  name: string;
  price: string;
  kicker: string;
  bestFor: string;
  description: string;
  points: string[];
  href: string;
  ctaLabel: string;
  featured?: boolean;
};

type JurisdictionCardData = {
  name: string;
  flag: string;
  agreementType: string;
  summary: string;
  points: string[];
  href: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featured?: boolean;
};

type FeaturePoint = {
  title: string;
  body: string;
};

type IncludedItem = {
  title: string;
  body: string;
};

type ComparisonRow = {
  label: string;
  landlordHeaven: string;
  genericTemplate: string;
};

const proofPoints = [
  'Correct UK jurisdiction',
  'Preview before payment',
  'Saved in your account',
  'Standard and Premium options',
];

const productOptions: ProductCardData[] = [
  {
    name: 'Standard Residential Tenancy Agreement',
    price: PRODUCTS.ast_standard.displayPrice,
    kicker: 'Most landlords start here',
    bestFor: 'Straightforward lets, single households, and most standard tenancy setups.',
    description:
      'Use Standard when the tenancy is relatively simple and you want the right agreement for the property without paying for extra clause coverage you do not need.',
    points: [
      'Suitable for most standard residential lets',
      'Jurisdiction-specific agreement for the property location',
      'Guided setup with preview before payment',
      'Saved in your account after purchase',
    ],
    href: standardWizardHref,
    ctaLabel: `Start Standard - ${PRODUCTS.ast_standard.displayPrice}`,
  },
  {
    name: 'Premium Residential Tenancy Agreement (HMO / student-ready)',
    price: PRODUCTS.ast_premium.displayPrice,
    kicker: 'More cover for complex lets',
    bestFor:
      'HMOs, student lets, shared households, guarantor-backed lets, and arrangements that need broader wording from the start.',
    description:
      'Choose Premium when there are more people, more moving parts, or more risk, and you want broader clause coverage without trying to bolt it on later.',
    points: [
      'Better fit for HMOs, student lets, and shared households',
      'Broader wording for multi-tenant and shared-living setups',
      'Useful where guarantors or extra house rules matter',
      'Saved in your account and easy to revisit later',
    ],
    href: premiumWizardHref,
    ctaLabel: `Start Premium - ${PRODUCTS.ast_premium.displayPrice}`,
    featured: true,
  },
];

const jurisdictions: JurisdictionCardData[] = [
  {
    name: 'England',
    flag: '/gb-eng.svg',
    agreementType: 'Residential Tenancy Agreement',
    summary:
      'If the property is in England, Landlord Heaven now uses a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025 and designed for the new England tenancy system.',
    points: [
      'Updated for the Renters\' Rights Act 2025',
      'England-specific wording and structure',
      'Not an assured shorthold tenancy for new agreements',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy',
    ctaLabel: `Create England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    secondaryHref: '/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy',
    secondaryLabel: `Create premium England agreement - ${PRODUCTS.ast_premium.displayPrice}`,
    featured: true,
  },
  {
    name: 'Wales',
    flag: '/gb-wls.svg',
    agreementType: 'Occupation Contract',
    summary:
      'If the property is in Wales, the agreement follows the Welsh occupation contract framework with the right terminology and structure from the start.',
    points: [
      'Correct Welsh agreement type from the start',
      'Wales-specific wording and structure',
      'Standard and Premium routes for different tenancy setups',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=wales&src=product_page&topic=tenancy',
    ctaLabel: `Create Wales agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    secondaryHref: '/wizard?product=ast_premium&jurisdiction=wales&src=product_page&topic=tenancy',
    secondaryLabel: `Create premium Wales agreement - ${PRODUCTS.ast_premium.displayPrice}`,
  },
  {
    name: 'Scotland',
    flag: '/gb-sct.svg',
    agreementType: 'Private Residential Tenancy',
    summary:
      'If the property is in Scotland, Landlord Heaven generates a Private Residential Tenancy with the right Scottish structure, terminology, and setup.',
    points: [
      'Private Residential Tenancy for Scotland',
      'Scotland-specific wording and structure',
      'Standard and Premium routes for different household types',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=scotland&src=product_page&topic=tenancy',
    ctaLabel: `Create Scotland agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    secondaryHref: '/wizard?product=ast_premium&jurisdiction=scotland&src=product_page&topic=tenancy',
    secondaryLabel: `Create premium Scotland agreement - ${PRODUCTS.ast_premium.displayPrice}`,
  },
  {
    name: 'Northern Ireland',
    flag: '/gb-nir.svg',
    agreementType: 'Private Tenancy Agreement',
    summary:
      'If the property is in Northern Ireland, the agreement stays within the Northern Ireland private tenancy framework and uses the right wording for that jurisdiction.',
    points: [
      'Private Tenancy Agreement for Northern Ireland',
      'Northern Ireland-specific wording',
      'Standard and Premium routes for different tenancy setups',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=northern-ireland&src=product_page&topic=tenancy',
    ctaLabel: `Create Northern Ireland agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    secondaryHref:
      '/wizard?product=ast_premium&jurisdiction=northern-ireland&src=product_page&topic=tenancy',
    secondaryLabel: `Create premium Northern Ireland agreement - ${PRODUCTS.ast_premium.displayPrice}`,
  },
];

const featurePoints: FeaturePoint[] = [
  {
    title: 'Answer questions instead of editing a blank file',
    body: 'The agreement is built around the property, the parties, and the tenancy you are actually setting up.',
  },
  {
    title: 'Correct jurisdiction from the start',
    body: 'You start with the right agreement type for England, Wales, Scotland, or Northern Ireland.',
  },
  {
    title: 'Choose the level of cover that fits the let',
    body: 'Use Standard for most ordinary lets or Premium where the setup is more complex.',
  },
  {
    title: 'Come back to it later',
    body: 'Your agreement is saved in your Landlord Heaven account after purchase for future access.',
  },
];

const includedItems: IncludedItem[] = [
  {
    title: 'Named parties and property details',
    body: 'Set out who the agreement is between and which property it covers in a clear, usable format.',
  },
  {
    title: 'Rent, deposit, and payment terms',
    body: 'Put the main financial terms in one place so rent, deposit, and payment expectations are clear from the outset.',
  },
  {
    title: 'Day-to-day tenancy terms',
    body: 'Cover the practical rights and responsibilities that matter once the tenancy is up and running.',
  },
  {
    title: 'The right agreement type for the region',
    body: 'Start with the correct agreement type for England, Wales, Scotland, or Northern Ireland rather than adapting the wrong one.',
  },
  {
    title: 'Extra wording where the let is more complex',
    body: 'Premium is designed for HMOs, student lets, shared households, and other arrangements that need broader coverage.',
  },
  {
    title: 'Preview and account access',
    body: 'Preview before payment, then keep the finished agreement in your account for later reference.',
  },
];

const comparisonHighlights = [
  'Correct jurisdiction from the outset',
  'Structured setup instead of manual editing',
  'Saved in your account after purchase',
];

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Agreement type',
    landlordHeaven: 'Generated for the correct UK jurisdiction and tenancy framework.',
    genericTemplate: 'Usually starts as a generic tenancy document with manual edits.',
  },
  {
    label: 'What is included',
    landlordHeaven:
      'Guided setup, core tenancy terms, the right structure, preview before payment, and account storage.',
    genericTemplate: 'Usually just a blank file with little guidance on what to include or adapt.',
  },
  {
    label: 'England readiness',
    landlordHeaven:
      'England is presented as a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025.',
    genericTemplate: 'Often still framed around outdated AST-era wording.',
  },
  {
    label: 'Setup experience',
    landlordHeaven: 'Answer structured questions and build the agreement around the tenancy you are creating.',
    genericTemplate: 'Usually a blank file that leaves structure, wording, and adaptation to you.',
  },
  {
    label: 'Ongoing access',
    landlordHeaven: 'Saved in your account and ready to revisit later.',
    genericTemplate: 'Often a one-time download with no managed account history.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'What is included with the tenancy agreement?',
    answer:
      'Your tenancy agreement is built through a guided setup and includes the main tenancy details, the key financial terms, the correct agreement type for the property jurisdiction, and wording shaped around that route. Premium is intended for more complex arrangements such as HMOs, student lets, and shared households. You can preview before payment and access the document again in your account after purchase.',
  },
  {
    question: 'Is this still an AST?',
    answer:
      'For new England agreements, no. Landlord Heaven now positions the England product as a Residential Tenancy Agreement designed for the current England tenancy system rather than an assured shorthold tenancy. Wales, Scotland, and Northern Ireland continue to use their own jurisdiction-specific agreement types.',
  },
  {
    question: 'Which agreement do I get for my region?',
    answer:
      'England properties use a Residential Tenancy Agreement. Wales uses an Occupation Contract. Scotland uses a Private Residential Tenancy. Northern Ireland uses a Private Tenancy Agreement.',
  },
  {
    question: 'Are the agreements jurisdiction specific?',
    answer:
      'Yes. You do not get a generic one-size-fits-all UK tenancy template. The agreement generated depends on whether the property is in England, Wales, Scotland, or Northern Ireland.',
  },
  {
    question: 'Are your tenancy agreements legally compliant?',
    answer:
      'Landlord Heaven tenancy agreements are positioned as legally compliant and jurisdiction specific. The document generated depends on the property jurisdiction and is drafted to reflect the framework that applies there. We do not promise legal outcomes, but the product is built to help landlords start with the correct structure and wording.',
  },
  {
    question: 'What is the difference between Standard and Premium?',
    answer:
      'Standard is best for straightforward lets and simpler residential setups. Premium is better suited to HMOs, student lets, shared households, guarantor-backed lets, and more complex tenancy arrangements where broader clause coverage adds more value.',
  },
  {
    question: 'Do I need Premium for an HMO or student let?',
    answer:
      'In most cases, yes. Premium is usually the stronger fit for HMOs, student lets, and shared households because it is designed for more complex occupancy arrangements.',
  },
  {
    question: 'I searched for a Renters\' Rights Bill tenancy agreement. Is this the same thing?',
    answer:
      'Yes. People still search for the Renters\' Rights Bill, but the law is now the Renters\' Rights Act 2025. On Landlord Heaven, the England route is presented as a Residential Tenancy Agreement updated for that new system.',
  },
];

export const metadata: Metadata = {
  title: `Renters' Rights Compliant Tenancy Agreement | England Residential Tenancy Agreement | From ${PRODUCTS.ast_standard.displayPrice}`,
  description:
    'Create a renters rights compliant tenancy agreement for England, or the correct jurisdiction-specific agreement for Wales, Scotland or Northern Ireland. Preview before payment and save it in your account.',
  keywords: [
    'renters rights compliant tenancy agreement',
    'renters rights act tenancy agreement',
    'new tenancy agreement england 2026',
    'residential tenancy agreement england',
    'renters rights bill tenancy agreement',
    'tenancy agreement template 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title:
      'Renters\' Rights Compliant Tenancy Agreement | Residential Tenancy Agreement England',
    description:
      'Create a renters rights compliant tenancy agreement for England, or the correct agreement for Wales, Scotland or Northern Ireland, with guided setup and preview before payment.',
    url: canonicalUrl,
    type: 'website',
  },
};

function ProductCard({
  name,
  price,
  kicker,
  bestFor,
  description,
  points,
  href,
  ctaLabel,
  featured,
}: ProductCardData) {
  return (
    <div
      className={`group flex h-full flex-col rounded-[2.2rem] border p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_26px_64px_rgba(31,41,55,0.11)] md:p-8 ${featured ? 'border-[#D9CBFF] bg-gradient-to-br from-[#F4EFFF] via-white to-[#FBF9FF] shadow-[0_24px_60px_rgba(106,64,181,0.12)]' : 'border-[#E3E2DD] bg-gradient-to-br from-white via-[#FCFBF8] to-[#F6F2EB] shadow-[0_18px_42px_rgba(31,41,55,0.06)]'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${featured ? 'bg-[#EEE6FF] text-[#5B35B3]' : 'bg-[#F1ECE4] text-[#5F5A4E]'}`}
          >
            {kicker}
          </span>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-[#141B2D]">{name}</h3>
        </div>

        <div
          className={`rounded-2xl border px-4 py-3 text-right shadow-sm backdrop-blur-sm ${featured ? 'border-[#D9CBFF] bg-white/90' : 'border-[#E6E2D9] bg-white/85'}`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6F7191]">
            From
          </div>
          <div className="text-xl font-bold text-[#141B2D]">{price}</div>
        </div>
      </div>

      <p className="mt-5 text-base font-semibold leading-7 text-[#1E2A44]">Best for: {bestFor}</p>
      <p className="mt-4 text-base leading-7 text-[#546075]">{description}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-[15px] leading-7 text-[#1E2A44]">
            <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#5B56E8]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-white/60 pt-6">
        <Link
          href={href}
          className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

function JurisdictionCard({
  name,
  flag,
  agreementType,
  summary,
  points,
  href,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  featured,
}: JurisdictionCardData) {
  return (
    <div
      className={`group flex h-full flex-col rounded-[2rem] border p-5 shadow-[0_16px_36px_rgba(31,41,55,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(31,41,55,0.1)] xl:p-6 ${featured ? 'border-[#D9CBFF] bg-gradient-to-br from-[#FAF7FF] via-white to-[#F3EEFF]' : 'border-[#E6E2D9] bg-white/92'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`rounded-2xl p-2 ${featured ? 'bg-[#EFE7FF]' : 'bg-[#F4F1EB]'}`}>
          <Image
            src={flag}
            alt={name}
            width={44}
            height={32}
            className="h-8 w-11 rounded-sm border border-gray-200"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
            {name}
          </p>
          <h3 className="text-xl font-bold text-[#141B2D]">{agreementType}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[#546075]">{summary}</p>

      <ul className="mt-6 flex-1 space-y-3 rounded-2xl bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm leading-6 text-[#1F2937]">
            <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 shrink-0 text-[#5B56E8]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href={href}
          className={PRIMARY_BUTTON_CLASS}
        >
          {ctaLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className={LIGHT_SECONDARY_BUTTON_CLASS}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function ASTProductPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F2EB] text-[#141B2D]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreements', url: canonicalUrl },
        ])}
      />

      <div className="pointer-events-none absolute left-[-8rem] top-[28rem] h-72 w-72 rounded-full bg-[#E8DFFF] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-[52rem] h-72 w-72 rounded-full bg-[#FFF0DB] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute left-[18%] top-[95rem] h-56 w-56 rounded-full bg-[#ECE6FF] opacity-55 blur-3xl" />

      <UniversalHero
        badge="UK-wide tenancy agreements"
        title="Create the right tenancy agreement for your UK property"
        subtitle="Build a renters' rights compliant tenancy agreement for England, or the correct jurisdiction-specific agreement for Wales, Scotland, or Northern Ireland. England now uses a Residential Tenancy Agreement updated for the Renters' Rights Act 2025, while the other UK nations continue on their own local frameworks."
        primaryCta={{
          label: `Create your tenancy agreement - ${PRODUCTS.ast_standard.displayPrice}`,
          href: standardWizardHref,
        }}
        secondaryCta={{
          label: 'See all UK agreement types',
          href: '#jurisdictions',
        }}
        mediaSrc="/images/tenancy_agreements.webp"
        mediaAlt="Preview of Landlord Heaven tenancy agreement documents"
        feature="Guided setup, preview before payment, saved in your account, and the correct agreement type for the property jurisdiction."
        showTrustPositioningBar
      />

      <section className="relative z-20 -mt-8 sm:-mt-10">
        <Container>
          <div className="rounded-[1.9rem] border border-white/70 bg-white/85 p-3 shadow-[0_24px_60px_rgba(31,41,55,0.12)] backdrop-blur-sm sm:p-4">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {proofPoints.map((point) => (
                <div
                  key={point}
                  className="flex items-center gap-3 rounded-2xl bg-[#F7F3ED] px-4 py-3 text-sm font-semibold text-[#354056]"
                >
                  <RiCheckboxCircleLine className="h-5 w-5 shrink-0 text-[#5B56E8]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="relative z-10 py-16 md:py-20">
        <section id="compare-options" className="mb-16 md:mb-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Choose your product level
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              Standard for simpler lets. Premium for more complex arrangements.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#546075]">
              Pick Standard for most ordinary lets. Choose Premium when the property, household,
              or risk profile is more complex and you want broader wording from the start.
            </p>
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            {productOptions.map((option) => (
              <ProductCard key={option.name} {...option} />
            ))}
          </div>
        </section>

        <section id="jurisdictions" className="mb-16 md:mb-20">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Choose your jurisdiction
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              The right agreement for each part of the UK
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#546075]">
              You are not getting a generic UK tenancy template. The agreement generated depends on
              where the property is located, so you start with the right structure and terminology.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {jurisdictions.map((jurisdiction) => (
              <JurisdictionCard key={jurisdiction.name} {...jurisdiction} />
            ))}
          </div>
        </section>

        <section className="mb-16 md:mb-20">
          <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1B1730] via-[#2D2152] to-[#5640A3] px-6 py-8 text-white shadow-[0_28px_70px_rgba(41,31,77,0.35)] md:px-10 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C4B6FF]">
                  England update
                </p>
                <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                  Residential Tenancy Agreement for England
                </h2>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#E1DBF8]">
                  If the property is in England, this is no longer sold as an AST-first product.
                  Landlord Heaven now builds a Residential Tenancy Agreement updated for the
                  Renters' Rights Act 2025 and designed for the new England tenancy system.
                </p>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#E1DBF8]">
                  That means current England wording, the right structure for new lets going
                  forward, and a clearer starting point than relying on old AST-era templates. For
                  new agreements, it is not positioned as an assured shorthold tenancy.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy"
                    className={PRIMARY_BUTTON_CLASS}
                  >
                    Start England agreement
                  </Link>
                  <Link
                    href="/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy"
                    className={DARK_SECONDARY_BUTTON_CLASS}
                  >
                    Start premium England agreement
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C4B6FF]">
                  Why this route stands out
                </p>
                <ul className="mt-5 space-y-4">
                  {[
                    'Residential Tenancy Agreement for England',
                    'Updated for the Renters\' Rights Act 2025',
                    'Designed for the new England tenancy system',
                    'Not an assured shorthold tenancy for new agreements',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-[15px] leading-7 text-[#F0ECFF]"
                    >
                      <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#C4B6FF]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 md:mb-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              What you get
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              Everything you need to build the agreement properly
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#546075]">
              You are not buying a blank file. The agreement is built from the answers you give,
              with the main tenancy terms in place and the right structure for the property
              jurisdiction.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {includedItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.8rem] border border-[#E9E2D7] bg-white/92 p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-[#EEE7FF] p-2">
                    <RiCheckboxCircleLine className="h-4 w-4 text-[#5B56E8]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#141B2D]">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#546075]">{item.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 md:mb-20">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="rounded-[2.2rem] bg-gradient-to-br from-[#FBF7F0] via-white to-[#F5F0FF] p-8 shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                Why Landlord Heaven
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D]">
                Why landlords use this instead of editing a template
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                The main advantage is simple: you start with the right agreement type, answer
                structured questions, choose the level of cover that fits the let, and keep the
                finished document in your account afterwards.
              </p>
              <div className="mt-8">
                <Link
                  href={standardWizardHref}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  Start your tenancy agreement
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featurePoints.map((point) => (
                <div
                  key={point.title}
                  className="rounded-[1.8rem] border border-[#E6E0D6] bg-white/95 p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
                >
                  <h3 className="text-lg font-semibold text-[#141B2D]">{point.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#546075]">{point.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16 md:mb-20">
          <div className="rounded-[2.2rem] border border-[#E4DED3] bg-white/92 p-6 shadow-[0_18px_42px_rgba(31,41,55,0.05)] md:p-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                Comparison
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D]">
                More than a generic tenancy template
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                The difference is not just presentation. It is getting the correct agreement type,
                the correct regional route, and a document built around the tenancy you are
                actually creating.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {comparisonHighlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-[#F8F4ED] px-5 py-4 text-sm font-semibold text-[#2A3550]"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-4 md:hidden">
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="overflow-hidden rounded-[1.6rem] border border-[#E7E1D7] bg-[#FCFBF8]"
                >
                  <div className="border-b border-[#ECE6DB] px-5 py-4">
                    <h3 className="text-base font-semibold text-[#141B2D]">{row.label}</h3>
                  </div>
                  <div className="grid gap-4 p-5">
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                        Landlord Heaven
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#465066]">{row.landlordHeaven}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F1EA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A7A72]">
                        Generic template
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#5E677B]">{row.genericTemplate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 hidden overflow-hidden rounded-[1.9rem] border border-[#E8E1D7] md:block">
              <div className="grid grid-cols-[1.05fr_1fr_1fr] bg-[#F6F2EB] text-sm font-semibold text-[#2A3550]">
                <div className="border-r border-[#E8E1D7] px-5 py-4">What matters</div>
                <div className="border-r border-[#E8E1D7] px-5 py-4">Landlord Heaven</div>
                <div className="px-5 py-4">Generic template</div>
              </div>

              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.05fr_1fr_1fr] border-t border-[#EEE7DB] text-sm text-[#546075]"
                >
                  <div className="border-r border-[#EEE7DB] bg-[#FCFBF8] px-5 py-5 font-semibold text-[#1E2A44]">
                    {row.label}
                  </div>
                  <div className="border-r border-[#EEE7DB] bg-white px-5 py-5 leading-7">
                    {row.landlordHeaven}
                  </div>
                  <div className="bg-[#F8F4ED] px-5 py-5 leading-7">{row.genericTemplate}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Container>

      <FAQSection
        title="Tenancy agreement FAQs"
        intro="Clear answers on what is included, UK-wide jurisdiction support, and choosing the right tenancy agreement route."
        faqs={faqs}
        showContactCTA={false}
        variant="gray"
      />

      <section className="pb-16 pt-6 md:pb-20 md:pt-8">
        <Container>
          <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-gradient-to-br from-[#1C1534] via-[#31205B] to-[#5A44A8] px-8 py-10 text-center text-white shadow-[0_28px_72px_rgba(46,29,86,0.35)] md:px-12 md:py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C8BCFF]">
              Ready when you are
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              Create the right tenancy agreement for the property
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#E3DCF8]">
              Start with the correct jurisdiction, pick Standard or Premium, and preview the
              agreement before you pay.
            </p>
            <div className="mt-8">
              <Link
                href={standardWizardHref}
                className={PRIMARY_BUTTON_CLASS}
              >
                Create your tenancy agreement
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/75">
              Standard from {PRODUCTS.ast_standard.displayPrice} - Premium available for HMOs,
              student lets, and shared households
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
