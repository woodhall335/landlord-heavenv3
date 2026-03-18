import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { RiArrowRightLine, RiCheckboxCircleLine } from 'react-icons/ri';
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

type ProductCardData = {
  name: string;
  price: string;
  bestFor: string;
  description: string;
  points: string[];
  href: string;
  ctaLabel: string;
  accent: string;
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

const productOptions: ProductCardData[] = [
  {
    name: 'Standard Residential Tenancy Agreement',
    price: PRODUCTS.ast_standard.displayPrice,
    bestFor: 'Straightforward lets, single-household occupancies, and simpler tenancy setups.',
    description:
      'Best for most standard residential lets where you want the right agreement, the right jurisdiction, and a cleaner setup than editing a generic template yourself.',
    points: [
      'A strong fit for most straightforward residential tenancies',
      'Guided setup with preview before payment',
      'Built around the correct UK jurisdiction from the start',
      'Stored in your Landlord Heaven account for easy access later',
    ],
    href: standardWizardHref,
    ctaLabel: `Start Standard - ${PRODUCTS.ast_standard.displayPrice}`,
    accent: 'from-[#EEF3FF] to-white',
  },
  {
    name: 'Premium Residential Tenancy Agreement',
    price: PRODUCTS.ast_premium.displayPrice,
    bestFor:
      'HMOs, student lets, shared households, guarantor-backed lets, and more complex arrangements.',
    description:
      'Best for higher-complexity tenancy setups where broader clause coverage and stronger wording are likely to give you a better fit.',
    points: [
      'Better suited to HMOs, student lets, and shared households',
      'Broader clause coverage for more complex arrangements',
      'Guided setup with preview before payment',
      'Stored in your account and easy to revisit or regenerate',
    ],
    href: premiumWizardHref,
    ctaLabel: `Start Premium - ${PRODUCTS.ast_premium.displayPrice}`,
    accent: 'from-[#F2EEFF] to-white',
  },
];

const jurisdictions: JurisdictionCardData[] = [
  {
    name: 'England',
    flag: '/gb-eng.svg',
    agreementType: 'Residential Tenancy Agreement',
    summary:
      'For new England lets, Landlord Heaven now leads with a Residential Tenancy Agreement built for the current England framework and updated for the Renters\' Rights Act 2025.',
    points: [
      'Updated for the Renters\' Rights Act 2025',
      'England-specific wording and structure',
      'Designed for new England agreements going forward',
      'A cleaner route than relying on old AST-era templates',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy',
    ctaLabel: `Create England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    secondaryHref: '/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy',
    secondaryLabel: `Create premium England agreement - ${PRODUCTS.ast_premium.displayPrice}`,
  },
  {
    name: 'Wales',
    flag: '/gb-wls.svg',
    agreementType: 'Occupation Contract',
    summary:
      'For properties in Wales, the agreement follows the Welsh occupation contract framework with the right terminology and Wales-specific drafting from the outset.',
    points: [
      'Correct Welsh agreement type from the start',
      'Wales-specific wording and structure',
      'Guided setup for the right legal framework',
      'No need to adapt a generic UK tenancy template',
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
      'For Scottish properties, Landlord Heaven generates a Private Residential Tenancy with the correct Scottish structure, terminology, and tenancy framework.',
    points: [
      'Private Residential Tenancy for Scotland',
      'Scotland-specific wording and structure',
      'Guided flow for Scottish lets',
      'No generic template guesswork',
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
      'For Northern Ireland properties, the agreement stays within the Northern Ireland private tenancy framework and uses the correct jurisdiction-specific wording.',
    points: [
      'Private Tenancy Agreement for Northern Ireland',
      'NI-specific wording and structure',
      'Guided setup around the right framework',
      'Cleaner than adapting a generic form',
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
    title: 'Start with the right framework',
    body: 'Choose the correct tenancy route for England, Wales, Scotland, or Northern Ireland before you issue paperwork.',
  },
  {
    title: 'Guided setup, not blank editing',
    body: 'Answer structured questions instead of rewriting a generic tenancy template line by line.',
  },
  {
    title: 'Preview before you pay',
    body: 'See the document before payment so you know you are on the right track before you check out.',
  },
  {
    title: 'Choose the right level of cover',
    body: 'Pick Standard for simpler lets or Premium for HMOs, student lets, and more complex arrangements.',
  },
];

const includedItems: IncludedItem[] = [
  {
    title: 'Property, landlord, and tenant details',
    body: 'The agreement is built around the tenancy you are creating, with the core details needed to identify the parties and the property clearly.',
  },
  {
    title: 'Rent, deposit, and payment terms',
    body: 'Set out the key commercial terms of the tenancy, including rent structure, deposit information, and payment expectations.',
  },
  {
    title: 'Core rights and responsibilities',
    body: 'Cover the day-to-day obligations that matter in a tenancy, with wording shaped around the relevant UK jurisdiction.',
  },
  {
    title: 'Jurisdiction-specific agreement structure',
    body: 'Start with the right agreement type for England, Wales, Scotland, or Northern Ireland instead of adapting the wrong template.',
  },
  {
    title: 'Premium cover for more complex lets',
    body: 'Premium is designed for shared households, HMOs, student lets, and other arrangements where broader clause coverage is more appropriate.',
  },
  {
    title: 'Preview and account storage',
    body: 'Preview before payment, then keep the final agreement in your Landlord Heaven account for future access or regeneration.',
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Agreement type',
    landlordHeaven: 'Generated for the correct UK jurisdiction and tenancy framework.',
    genericTemplate: 'Usually starts as a generic tenancy document with manual edits.',
  },
  {
    label: 'What is included',
    landlordHeaven: 'Guided setup, core tenancy terms, jurisdiction-specific structure, preview before payment, and account storage.',
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
    landlordHeaven:
      'Guided flow with clear questions, product choice, and preview before payment.',
    genericTemplate: 'Usually a blank file download that leaves structure and wording to you.',
  },
  {
    label: 'Ongoing access',
    landlordHeaven: 'Stored in your account and ready to revisit or regenerate later.',
    genericTemplate: 'Often a one-time download with no managed account history.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'What is included with the tenancy agreement?',
    answer:
      'Your tenancy agreement is generated through a guided setup and includes the core tenancy details, key commercial terms such as rent and deposit information, jurisdiction-specific wording, and the correct agreement structure for the property location. Premium is designed for more complex arrangements such as HMOs, student lets, and shared households. You also get preview before payment and account storage after purchase.',
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
];

export const metadata: Metadata = {
  title:
    'Tenancy Agreements for UK Landlords | Residential Tenancy Agreement England | From £9.99',
  description:
    'Create a jurisdiction-specific tenancy agreement for England, Wales, Scotland or Northern Ireland. Includes guided setup, preview before payment, and account storage.',
  keywords: [
    'tenancy agreement',
    'residential tenancy agreement england',
    'renters rights compliant tenancy agreement',
    'uk tenancy agreement landlord',
    'what is included in tenancy agreement',
    'tenancy agreement template 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title:
      'Tenancy Agreements for UK Landlords | Residential Tenancy Agreement England',
    description:
      'Create the right tenancy agreement for England, Wales, Scotland or Northern Ireland with guided setup, preview before payment, and jurisdiction-specific drafting.',
    url: canonicalUrl,
    type: 'website',
  },
};

function ProductCard({
  name,
  price,
  bestFor,
  description,
  points,
  href,
  ctaLabel,
  accent,
}: ProductCardData) {
  return (
    <div
      className={`rounded-[2rem] border border-[#DDE5F2] bg-gradient-to-br ${accent} p-6 shadow-[0_14px_38px_rgba(15,23,42,0.07)] md:p-8`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
            Product option
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#141B2D]">{name}</h3>
        </div>
        <div className="rounded-2xl border border-[#D7E3FA] bg-white/80 px-4 py-2 text-right backdrop-blur-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
            From
          </div>
          <div className="text-lg font-bold text-[#141B2D]">{price}</div>
        </div>
      </div>

      <p className="mt-5 text-base font-semibold text-[#1E2A44]">Best for: {bestFor}</p>
      <p className="mt-4 text-base leading-7 text-[#465066]">{description}</p>

      <ul className="mt-6 space-y-3">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-[15px] leading-7 text-[#1E2A44]">
            <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#5B56E8]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <Link href={href} className="hero-btn-primary mt-8 inline-flex items-center gap-2">
        {ctaLabel}
        <RiArrowRightLine className="h-4 w-4" />
      </Link>
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
}: JurisdictionCardData) {
  return (
    <div className="group flex h-full flex-col rounded-[2rem] border border-[#E4E8F1] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(15,23,42,0.09)] xl:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[#F6F8FF] p-2">
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
          <h3 className="text-xl font-bold text-[#141B2D] xl:text-2xl">{agreementType}</h3>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[#465066] xl:text-base">{summary}</p>

      <ul className="mt-6 flex-1 space-y-3 rounded-2xl bg-[#F7F9FC] p-4">
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
          className="hero-btn-primary inline-flex items-center justify-center gap-2 text-center"
        >
          {ctaLabel}
          <RiArrowRightLine className="h-4 w-4" />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-xl border border-[#C9D4EA] px-4 py-3 text-center text-sm font-semibold text-[#2A3550] transition hover:border-[#AAB9D8] hover:bg-[#F7F9FC]"
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
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Tenancy Agreements', url: canonicalUrl },
        ])}
      />

      <UniversalHero
        title="Create the right tenancy agreement in minutes"
        subtitle="Generate a polished, jurisdiction-specific tenancy agreement for England, Wales, Scotland, or Northern Ireland. Follow a guided setup, preview before payment, and keep everything stored in your Landlord Heaven account."
        primaryCta={{
          label: `Create England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
          href: '/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy',
        }}
        secondaryCta={{
          label: 'See all UK agreement types',
          href: '#jurisdictions',
        }}
        mediaSrc="/images/tenancy_agreements.webp"
        mediaAlt="Preview of Landlord Heaven tenancy agreement documents"
        feature="Jurisdiction-specific drafting, guided setup, preview before payment, and fast access to the right tenancy paperwork."
        showTrustPositioningBar
      />

      <section className="border-y border-[#E8EEF8] bg-[#F8FBFF]">
        <Container>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 py-4 text-sm font-medium text-[#51607A]">
            <span className="flex items-center gap-2">
              <RiCheckboxCircleLine className="h-4 w-4 text-[#5B56E8]" />
              Jurisdiction-specific
            </span>
            <span className="flex items-center gap-2">
              <RiCheckboxCircleLine className="h-4 w-4 text-[#5B56E8]" />
              Preview before payment
            </span>
            <span className="flex items-center gap-2">
              <RiCheckboxCircleLine className="h-4 w-4 text-[#5B56E8]" />
              Stored in your account
            </span>
            <span className="flex items-center gap-2">
              <RiCheckboxCircleLine className="h-4 w-4 text-[#5B56E8]" />
              Better than a generic template
            </span>
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <section className="mb-16 rounded-[2rem] border border-[#D8E3F4] bg-gradient-to-br from-[#F8FBFF] via-white to-[#F4F7FF] p-6 md:p-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Why landlords choose Landlord Heaven
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D]">
              A better way to create tenancy paperwork
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#465066]">
              Landlord Heaven gives you more than a document download. You start with the correct
              UK jurisdiction, follow a guided flow, and generate tenancy paperwork that feels
              clearer, faster, and more professional from the outset.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featurePoints.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-[#DDE6F4] bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#546075]">{point.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] border border-[#E4E8F1] bg-white p-6 md:p-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              What&apos;s included
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              Everything you need to create the agreement properly
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#465066]">
              This page should not feel vague. When you create a tenancy agreement with Landlord
              Heaven, you are not just buying a blank template. You are building a document around
              the tenancy itself, with the key terms, the right agreement structure, and a cleaner
              guided process from start to finish.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {includedItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#E4E8F1] bg-[#F8FBFF] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.03)]"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#546075]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="jurisdictions" className="mb-16">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Choose your jurisdiction
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              The right agreement for each part of the UK
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#465066]">
              Each tenancy route below is aligned to the framework used in that jurisdiction, so
              you can start with the correct wording and agreement type straight away.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {jurisdictions.map((jurisdiction) => (
              <JurisdictionCard key={jurisdiction.name} {...jurisdiction} />
            ))}
          </div>
        </section>

        <section id="compare-options" className="mb-16">
          <div className="mb-8 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Choose your product level
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              Standard for simpler lets. Premium for more complex arrangements.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#465066]">
              Both products are built to help you start with the right agreement. Standard is the
              better fit for most straightforward residential lets. Premium is better suited to
              HMOs, student lets, shared households, and tenancy setups that need broader clause
              coverage.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {productOptions.map((option) => (
              <ProductCard key={option.name} {...option} />
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-[2.25rem] bg-[#111C3D] px-6 py-8 text-white md:px-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#AFC4FF]">
                England update
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">
                Residential Tenancy Agreement for England
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#D5DDF3]">
                For England, Landlord Heaven now leads with the Residential Tenancy Agreement route.
                That gives landlords a clearer and more modern starting point for new lets, with
                England-specific wording and a more polished creation flow.
              </p>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#D5DDF3]">
                If you need to move quickly, start here and generate the agreement through the
                guided England workflow.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy"
                  className="hero-btn-primary inline-flex items-center gap-2"
                >
                  Start England agreement
                  <RiArrowRightLine className="h-4 w-4" />
                </Link>
                <Link
                  href="/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy"
                  className="inline-flex items-center justify-center rounded-xl border border-[#44578D] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#8BA4E8] hover:bg-white/5"
                >
                  Start premium England agreement
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#AFC4FF]">
                Why start here
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  'England-first tenancy wording',
                  'Updated for the Renters\' Rights Act 2025',
                  'Faster guided setup',
                  'Preview before payment',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] leading-7 text-[#E8EDFB]"
                  >
                    <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#AFC4FF]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] border border-[#E4E8F1] bg-white p-6 md:p-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Comparison
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              More than a generic tenancy template
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#465066]">
              The value is not just the document itself. It is getting the correct agreement type,
              the correct regional route, and a smoother workflow from start to finish.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              'Correct jurisdiction from the outset',
              'Clearer setup than editing a blank form',
              'Stored in your account for future access',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#E4E8F1] bg-[#F8FBFF] p-5 text-sm font-semibold text-[#1E2A44]"
              >
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#E4E8F1]">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-[#F5F8FE] text-sm font-semibold text-[#2A3550]">
              <div className="border-r border-[#E4E8F1] px-4 py-4">What matters</div>
              <div className="border-r border-[#E4E8F1] px-4 py-4">Landlord Heaven</div>
              <div className="px-4 py-4">Generic template</div>
            </div>

            {comparisonRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[1.1fr_1fr_1fr] border-t border-[#E4E8F1] text-sm text-[#465066]"
              >
                <div className="border-r border-[#E4E8F1] px-4 py-4 font-semibold text-[#1E2A44]">
                  {row.label}
                </div>
                <div className="border-r border-[#E4E8F1] px-4 py-4 leading-7">
                  {row.landlordHeaven}
                </div>
                <div className="px-4 py-4 leading-7">{row.genericTemplate}</div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <FAQSection
        title="Tenancy agreement FAQs"
        intro="Clear answers on what is included, UK-wide jurisdiction support, and choosing the right tenancy agreement route."
        faqs={faqs}
        showContactCTA={false}
        variant="white"
      />
    </div>
  );
}