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
const standardWizardHref =
  'https://landlordheaven.co.uk/wizard?product=ast_standard&src=product_page&topic=tenancy';
const premiumWizardHref =
  'https://landlordheaven.co.uk/wizard?product=ast_premium&src=product_page&topic=tenancy';

const PRIMARY_BUTTON_CLASS =
  'hero-btn-primary inline-flex items-center justify-center text-center text-base font-semibold';
const LIGHT_SECONDARY_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-xl border border-[#D9D4EA] bg-white/85 px-4 py-3 text-center text-base font-semibold text-[#2A3550] transition hover:border-[#BDAFE8] hover:bg-white';
const DARK_SECONDARY_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/15';
const ENGLAND_UPDATE_BUTTON_BASE_CLASS =
  'inline-flex min-h-[60px] w-full items-center justify-center rounded-xl px-6 py-4 text-center text-base font-semibold transition sm:w-[19rem]';
const ENGLAND_UPDATE_PRIMARY_BUTTON_CLASS = `${ENGLAND_UPDATE_BUTTON_BASE_CLASS} border border-[#8B7BFF] bg-white text-[#2D2152] shadow-[0_14px_30px_rgba(12,10,24,0.18)] hover:border-white hover:bg-[#F7F4FF]`;
const ENGLAND_UPDATE_SECONDARY_BUTTON_CLASS = `${ENGLAND_UPDATE_BUTTON_BASE_CLASS} border border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15`;

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

type ExplainerPoint = {
  title: string;
  body: string;
};

const proofPoints = [
  'Jurisdiction-specific agreement for the property location',
  'England route aligned to the assured periodic framework from 1 May 2026',
  'Standard for straightforward lets and Premium for more complex arrangements',
  'Preview before payment and keep the finished agreement in your account',
];

const explainerPoints: ExplainerPoint[] = [
  {
    title: 'The legal framework depends on where the property is',
    body: 'England, Wales, Scotland, and Northern Ireland each use different tenancy frameworks. A generic UK template or a document copied from another jurisdiction can leave you with wording that does not match the property you are actually letting.',
  },
  {
    title: 'England has changed from 1 May 2026',
    body: 'For new private lets in England, the legal position has moved into the assured periodic framework. Many landlords still search using AST language, but old fixed-term assumptions are no longer the best starting point for new agreements.',
  },
  {
    title: 'Old templates can create avoidable problems',
    body: 'An older agreement or free download may contain outdated wording, the wrong structure, or clauses that no longer reflect the current framework. That can create uncertainty at exactly the point where clear wording matters most.',
  },
  {
    title: 'Choose the level that fits the tenancy',
    body: 'Some lets are simple. Others need broader wording because of sharers, guarantors, students, or HMO-style risk. Standard and Premium help you choose the right level from the outset.',
  },
];

const productOptions: ProductCardData[] = [
  {
    name: 'Standard Tenancy Agreement',
    price: PRODUCTS.ast_standard.displayPrice,
    kicker: 'Best for straightforward lets',
    bestFor: 'Single-household and lower-complexity lets where you want the right jurisdiction-specific agreement without paying for broader drafting you do not need.',
    description:
      'Standard is the right choice for most everyday lets. It gives you the correct agreement structure for the property location and a guided setup process, without relying on an old or generic template.',
    points: [
      'Designed for most straightforward residential lets',
      'Jurisdiction-specific agreement for the property location',
      'England route aligned to the assured periodic framework from 1 May 2026',
      'Guided setup with preview before payment',
      'Saved in your account after purchase',
    ],
    href: standardWizardHref,
    ctaLabel: `Start Standard Tenancy Agreement - ${PRODUCTS.ast_standard.displayPrice}`,
  },
  {
    name: 'Premium Tenancy Agreement',
    price: PRODUCTS.ast_premium.displayPrice,
    kicker: 'More cover for complex lets',
    bestFor:
      'HMOs, student lets, shared households, guarantor-backed lets, and arrangements that need broader wording from the start.',
    description:
      'Choose Premium when the let is more complex, more operationally involved, or when you want stronger wording in place from day one rather than discovering later that a simpler agreement leaves gaps.',
    points: [
      'Better suited to HMOs, student lets, and shared households',
      'Broader wording for multi-tenant and shared-living arrangements',
      'Useful where guarantors or extra house rules matter',
      'Saved in your account and easy to revisit later',
    ],
    href: premiumWizardHref,
    ctaLabel: `Start Premium Tenancy Agreement - ${PRODUCTS.ast_premium.displayPrice}`,
    featured: true,
  },
];

const jurisdictions: JurisdictionCardData[] = [
  {
    name: 'England',
    flag: '/gb-eng.svg',
    agreementType: 'Periodic tenancy agreement',
    summary:
      'For properties in England, Landlord Heaven uses wording designed for the assured periodic tenancy framework applying to new private lets from 1 May 2026, while still helping landlords who arrive using older AST search terms.',
    points: [
      "Designed to reflect the Renters' Rights changes in England",
      'England-specific wording and structure',
      'Periodic agreement with no fixed duration',
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
      'For properties in Wales, the agreement follows the Welsh occupation contract framework, with the correct terminology and structure from the start.',
    points: [
      'Correct Welsh agreement route from the start',
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
      'For properties in Scotland, Landlord Heaven generates a Private Residential Tenancy with the correct Scottish structure, terminology, and setup.',
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
      'For properties in Northern Ireland, the agreement follows the Northern Ireland private tenancy framework and uses the right wording for that jurisdiction.',
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

const includedItems: IncludedItem[] = [
  {
    title: 'Landlord, tenant, and property details',
    body: 'Set out who the agreement is between, the rental property address, and the core details of the let in a clear, usable format.',
  },
  {
    title: 'Rent, deposit, and payment terms',
    body: 'Cover the rent amount, payment timing, deposit position, and the key financial terms that matter from the outset.',
  },
  {
    title: 'Tenancy structure and occupation setup',
    body: 'Start with the correct agreement route for the property jurisdiction and the household setup you are actually creating, instead of adapting the wrong framework by hand.',
  },
  {
    title: 'Day-to-day rules and responsibilities',
    body: 'Include the practical terms that usually matter during the tenancy, such as property use, maintenance expectations, and the core responsibilities both sides need to understand.',
  },
  {
    title: 'Extra wording for more complex arrangements',
    body: 'Premium is better suited to HMOs, student lets, shared households, guarantor-backed lets, and setups where broader wording is useful from the beginning rather than patched in later.',
  },
  {
    title: 'Preview and account access',
    body: 'Preview before payment, then keep the finished agreement in your account so you can return to it later.',
  },
];

const featurePoints: FeaturePoint[] = [
  {
    title: 'Your existing agreement may be out of date',
    body: 'If your agreement is old or based on pre-2026 England assumptions, it may rely on wording or structure that no longer matches the current framework.',
  },
  {
    title: 'The wrong UK template can create risk',
    body: 'An England tenancy agreement, a Welsh occupation contract, a Scottish PRT, and a Northern Ireland private tenancy agreement are not interchangeable. Starting with the wrong route can leave gaps from day one.',
  },
  {
    title: 'Choose Standard or Premium deliberately',
    body: 'Standard suits most straightforward lets. Premium is the better fit where sharers, guarantors, student occupation, HMOs, or more complex arrangements mean broader wording matters.',
  },
  {
    title: 'Do not rely on a one-off file',
    body: 'Preview before payment, then keep the finished agreement in your account so you are not left searching for an old document later.',
  },
];

const howItWorks: FeaturePoint[] = [
  {
    title: '1. Tell us about the property and tenancy',
    body: 'Choose the property jurisdiction and answer the key setup questions about the tenancy you are creating.',
  },
  {
    title: '2. We generate the right agreement type',
    body: 'Landlord Heaven builds the correct agreement structure for England, Wales, Scotland, or Northern Ireland instead of leaving you to adapt a generic file yourself.',
  },
  {
    title: '3. Preview, pay, and keep access',
    body: 'Preview before payment, then access the finished agreement in your account afterwards.',
  },
];

const comparisonHighlights = [
  'Current England wording',
  'Correct jurisdiction from the outset',
  'Standard or Premium matched to the tenancy',
];

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Legal framing',
    landlordHeaven:
      "Designed around the current tenancy framework for the property, including England's assured periodic shift from 1 May 2026.",
    genericTemplate:
      'Often starts with old AST assumptions or broad UK wording that still needs manual judgment.',
  },
  {
    label: 'Setup process',
    landlordHeaven:
      'Structured questions guide the agreement around the tenancy you are actually creating.',
    genericTemplate:
      'Usually relies on manual editing and working out what needs to be added, removed, or changed.',
  },
  {
    label: 'What you are relying on',
    landlordHeaven:
      'Core tenancy terms, financial terms, jurisdiction-specific structure, guided setup, preview before payment, and account access afterwards.',
    genericTemplate:
      'Usually just a file, with the landlord left to decide whether the wording is current, complete, or suitable for the let.',
  },
  {
    label: 'England positioning',
    landlordHeaven:
      'England is presented as a current England tenancy agreement built for the assured periodic framework, with AST used only as search clarification where helpful.',
    genericTemplate:
      'Often still leans on old fixed-term AST positioning or leaves the landlord to work out what changed.',
  },
  {
    label: 'After purchase',
    landlordHeaven: 'Saved in your account and easier to revisit later.',
    genericTemplate: 'Often a one-off download with no account history.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'What is a tenancy agreement?',
    answer:
      'A tenancy agreement is the contract between landlord and tenant for a residential let. It usually covers the parties, the property, the rent, the deposit, and the practical terms that apply during the tenancy.',
  },
  {
    question: 'Which agreement do I get for my region?',
    answer:
      'England properties use an England tenancy agreement designed for the assured periodic framework from 1 May 2026. Wales uses an Occupation Contract. Scotland uses a Private Residential Tenancy. Northern Ireland uses a Private Tenancy Agreement.',
  },
  {
    question: 'Are the agreements jurisdiction-specific?',
    answer:
      'Yes. The agreement generated depends on whether the property is in England, Wales, Scotland, or Northern Ireland. You are not getting a one-size-fits-all UK template.',
  },
  {
    question: 'Is this still an AST for England?',
    answer:
      'Many landlords still search using AST language. But from 1 May 2026, new England tenancy agreements generally move into the assured periodic model. Landlord Heaven therefore presents the England route as a current England tenancy agreement built for that framework, rather than as a traditional new fixed-term AST.',
  },
  {
    question: 'Can I keep using an older tenancy agreement?',
    answer:
      'Older agreements still exist, but they may rely on wording, structure, or assumptions that no longer reflect the current framework. If you are unsure, it is safer to start with wording designed for the property and jurisdiction you are actually letting.',
  },
  {
    question: 'What is included in the agreement?',
    answer:
      'The agreement is built through guided setup and usually covers the main tenancy details, the property and parties, rent and deposit terms, day-to-day tenancy wording, and the correct structure for the property jurisdiction. Premium is aimed at more complex arrangements such as HMOs, student lets, and shared households.',
  },
  {
    question: 'What is the difference between Standard and Premium?',
    answer:
      'Standard is designed for most straightforward residential lets. Premium is intended for more complex arrangements such as HMOs, student lets, shared households, guarantor-backed lets, or cases where broader wording is useful from the start.',
  },
  {
    question: 'Can I preview before paying?',
    answer:
      'Yes. You can preview before payment and the finished agreement is then saved in your account after purchase.',
  },
  {
    question: 'Why use this instead of a free tenancy template?',
    answer:
      'Because a free or generic template may be outdated, may use the wrong framework, or may still need substantial manual editing. Landlord Heaven builds the agreement around the property, the jurisdiction, and the tenancy setup you are actually creating.',
  },
];

export const metadata: Metadata = {
  title: `Tenancy Agreements UK | Standard or Premium by Jurisdiction | From ${PRODUCTS.ast_standard.displayPrice}`,
  description:
    'Choose the right tenancy agreement for England, Wales, Scotland, or Northern Ireland. Start with the correct jurisdiction, choose Standard for straightforward lets or Premium for more complex ones, and use the England route aligned to the assured periodic framework from 1 May 2026.',
  keywords: [
    'tenancy agreement uk',
    'residential tenancy agreement england',
    'occupation contract wales',
    'private residential tenancy scotland',
    'private tenancy agreement northern ireland',
    'landlord tenancy agreement template',
    'uk tenancy agreement',
    'renters rights act tenancy agreement',
    'tenancy agreement for landlords',
    'rental agreement uk',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Tenancy Agreements UK | The right agreement for each part of the UK',
    description:
      'Choose the right tenancy agreement for each UK jurisdiction, with Standard and Premium routes and England wording aligned to the assured periodic framework from 1 May 2026.',
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
        <Link href={href} className={`${PRIMARY_BUTTON_CLASS} w-full sm:w-auto`}>
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
        <Link href={href} className={PRIMARY_BUTTON_CLASS}>
          {ctaLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className={LIGHT_SECONDARY_BUTTON_CLASS}>
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
        title="Renters' Rights Act Compliant Assured Periodic Tenancy Agreement"
        subtitle="Don't get caught out by changes from 1 May 2026. Create a new Assured Periodic Tenancy Agreement now and ensure legal compliance without any stress."
        actionsSlot={
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <Link href={standardWizardHref} className="hero-btn-primary flex w-full justify-center text-center">
                Start Standard Tenancy Agreement
              </Link>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <Link href={premiumWizardHref} className="hero-btn-secondary flex w-full justify-center text-center">
                Start Premium Tenancy Agreement
              </Link>
            </div>
          </div>
        }
        mediaSrc="/images/tenancy_agreements.webp"
        mediaAlt="Preview of Landlord Heaven tenancy agreement documents"
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
        <section className="mb-16 md:mb-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Understanding tenancy agreements
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              Start with the right agreement for the property
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#546075]">
              A tenancy agreement sets out the key terms of the let, including the property
              details, rent, deposit, and the rights and responsibilities of both landlord and
              tenant. Starting with the right agreement helps you avoid unnecessary risk and saves
              time later.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {explainerPoints.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.8rem] border border-[#E9E2D7] bg-white/92 p-6 shadow-[0_14px_32px_rgba(31,41,55,0.05)]"
              >
                <h3 className="text-lg font-semibold text-[#141B2D]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#546075]">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="compare-options" className="mb-16 md:mb-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Choose your product level
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              Standard for straightforward lets. Premium for more complex ones.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#546075]">
              Choose Standard for most ordinary residential lets. Choose Premium when the household
              setup, property type, or risk profile is more complex and you want broader wording
              from the start.
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
              You are not buying a generic UK tenancy template. The agreement depends on where the
              property is located, so you start with the right framework, terminology, and
              structure from the beginning.
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
                  England agreements built for the new periodic framework
                </h2>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#E1DBF8]">
                  From <strong>1 May 2026</strong>, new England tenancy agreements generally move
                  into the assured periodic framework. Landlord Heaven therefore presents the
                  England route as a current England tenancy agreement built for that framework,
                  rather than as a traditional new fixed-term AST.
                </p>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-[#E1DBF8]">
                  Landlords still search using AST language, and we keep that intent visible where
                  it helps. But the product itself is built around current England wording, so you
                  are not relying on outdated assumptions when the agreement matters most.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy"
                    className={ENGLAND_UPDATE_PRIMARY_BUTTON_CLASS}
                  >
                    Start Standard England agreement
                  </Link>
                  <Link
                    href="/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy"
                    className={ENGLAND_UPDATE_SECONDARY_BUTTON_CLASS}
                  >
                    Start Premium England agreement
                  </Link>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C4B6FF]">
                  Why this route stands out
                </p>
                <ul className="mt-5 space-y-4">
                  {[
                    'England wording designed for the assured periodic framework from 1 May 2026',
                    "Designed to reflect the Renters' Rights changes in England",
                    'Legacy AST search intent supported without selling old fixed-term assumptions',
                    'Clear Standard and Premium routes depending on the tenancy',
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
              You are not buying a blank template. The agreement is built from the details you
              provide, with the right structure for the property jurisdiction and the main tenancy
              terms set out clearly.
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
          <div className="rounded-[2.2rem] border border-[#E4DED3] bg-white/92 p-6 shadow-[0_18px_42px_rgba(31,41,55,0.05)] md:p-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                How it works
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
                Build your agreement in three simple steps
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                Landlord Heaven helps you start with the correct agreement route for the property,
                without the manual editing that often comes with generic templates.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {howItWorks.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.8rem] border border-[#E6E0D6] bg-[#FCFBF8] p-6"
                >
                  <h3 className="text-lg font-semibold text-[#141B2D]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#546075]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16 md:mb-20">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="rounded-[2.2rem] bg-gradient-to-br from-[#FBF7F0] via-white to-[#F5F0FF] p-8 shadow-[0_18px_46px_rgba(31,41,55,0.06)]">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                Why landlords switch from old templates
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D]">
                Your current agreement may no longer say what you think it says
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                If your agreement is old, adapted from a free download, or based on the wrong UK
                framework, it may no longer reflect the legal position you expect. Landlord Heaven
                helps you start with the right jurisdiction, the right wording, and the right level
                of cover from the beginning.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href={standardWizardHref} className={PRIMARY_BUTTON_CLASS}>
                  Start Standard Tenancy Agreement
                </Link>
                <Link href={premiumWizardHref} className={LIGHT_SECONDARY_BUTTON_CLASS}>
                  Start Premium Tenancy Agreement
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
                The difference is not just presentation. It is the difference between starting with
                the correct agreement route for the property and trying to adapt a generic document
                after the fact.
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
        intro="Clear answers on what a tenancy agreement includes, which regions are supported, and how to choose the right route for the property."
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
              Choose the right tenancy agreement before an old template catches you out
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#E3DCF8]">
              Start with the correct jurisdiction, choose Standard for a straightforward let or
              Premium for a more complex one, and avoid relying on wording that may no longer match
              the framework for the property.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={standardWizardHref} className={PRIMARY_BUTTON_CLASS}>
                Start Standard Tenancy Agreement
              </Link>
              <Link href={premiumWizardHref} className={DARK_SECONDARY_BUTTON_CLASS}>
                Start Premium Tenancy Agreement
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/75">
              Standard is designed for straightforward lets. Premium is the stronger fit for HMOs,
              student lets, guarantors, sharers, and other more complex arrangements.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
