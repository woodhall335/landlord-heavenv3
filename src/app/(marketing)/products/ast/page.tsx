import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { Container } from '@/components/ui/Container';
import { tenancyProductMoneyPageLinks } from '@/lib/seo/internal-links';
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
  'England-first tenancy agreement for new lets from 1 May 2026',
  'Choose Standard for straightforward lets and Premium for more complex arrangements',
  'Avoid using outdated agreements when the current framework should be reflected',
  'Preview before payment and keep the finished agreement in your account',
];

const englandChangePoints = [
  'New tenancies use the assured periodic route',
  'Many landlords still search using AST language, but this product reflects the current framework',
  'Older tenancies usually transition rather than being replaced',
];

const premiumReasons: FeaturePoint[] = [
  {
    title: 'HMOs and shared houses',
    body: 'Premium is the stronger fit where the property setup, house rules, and shared occupation create more drafting complexity than a straightforward single-household let.',
  },
  {
    title: 'Sharers and student households',
    body: 'Where multiple occupiers, turnover risk, or day-to-day management detail matter more, Premium gives landlords broader wording from the start.',
  },
  {
    title: 'Guarantors and higher-risk setups',
    body: 'If the tenancy depends on guarantor support or has more operational friction built in, Premium gives the landlord a more suitable product level for that reality.',
  },
  {
    title: 'When you want more support documents',
    body: 'Premium adds extra support documents and broader wording, which is often the better commercial choice when the let is more involved and the landlord wants fewer loose ends later.',
  },
];

const explainerPoints: ExplainerPoint[] = [
  {
    title: 'The legal framework depends on where the property is',
    body: 'England, Wales, Scotland, and Northern Ireland each use different tenancy frameworks. A broad template copied across jurisdictions can leave you with wording that does not match the property you are actually letting.',
  },
  {
    title: 'England has changed from 1 May 2026',
    body: 'For new private lets in England, the starting point has moved into the assured periodic route. Many landlords still search using AST language, but old fixed-term assumptions are no longer the best way to frame a new agreement.',
  },
  {
    title: 'Old templates can create avoidable problems',
    body: 'An older agreement or free download may contain outdated wording, the wrong structure, or clauses that no longer reflect the current framework. That can create avoidable uncertainty at exactly the point where clear wording matters most.',
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
    bestFor:
      'Single-household and lower-complexity lets where you want the right jurisdiction-specific agreement without paying for broader drafting you do not need.',
    description:
      'Standard is the right choice for most everyday lets. It gives you the correct agreement structure for the property location plus the core supporting pack for move-in, compliance, and record-keeping.',
    points: [
      'Designed for most straightforward residential lets',
      'Correct agreement route plus supporting pack documents',
      'England wording built for the current position from 1 May 2026',
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
      'Choose Premium when the let is more complex, more operationally involved, or when you want the core pack plus broader drafting and extra support documents from day one.',
    points: [
      'Better suited to HMOs, student lets, and shared households',
      'Broader wording for multi-tenant and shared-living arrangements',
      'Includes extra support documents for handover, maintenance, and checkout',
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
      'For properties in England, Landlord Heaven uses wording designed for the current route for new private lets from 1 May 2026, while still helping landlords who arrive using older AST search terms.',
    points: [
      "Designed to reflect the Renters' Rights changes in England",
      'England-first wording and structure',
      'Periodic agreement with no fixed duration',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy',
    ctaLabel: `Create England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    secondaryHref:
      '/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy',
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
    secondaryHref:
      '/wizard?product=ast_premium&jurisdiction=scotland&src=product_page&topic=tenancy',
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
    title: '1. Enter tenancy details',
    body: 'Answer a few guided questions so nothing important is missed.',
  },
  {
    title: '2. We build your agreement',
    body: 'The system creates the correct legal structure for your property, without guesswork or manual editing.',
  },
  {
    title: '3. Preview and complete',
    body: 'Check everything before you pay, then keep full access in your account.',
  },
];

const comparisonHighlights = [
  'Correct agreement route',
  'Supporting documents included',
  'Preview before payment',
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
      'A practical pack: the agreement, inventory, compliance checklist, England deposit documents where applicable, premium support documents where selected, preview before payment, and account access afterwards.',
    genericTemplate:
      'Usually just a file, with the landlord left to work out what else is needed for setup, compliance, and record-keeping.',
  },
  {
    label: 'England positioning',
    landlordHeaven:
      'England is presented as a current England tenancy agreement built for the present route, with AST used only as search clarification where helpful.',
    genericTemplate:
      'Often still leans on outdated AST positioning or leaves the landlord to work out what changed.',
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
      'England properties use an England tenancy agreement designed for the current route from 1 May 2026. Wales uses an Occupation Contract. Scotland uses a Private Residential Tenancy. Northern Ireland uses a Private Tenancy Agreement.',
  },
  {
    question: 'Are the agreements jurisdiction-specific?',
    answer:
      'Yes. The agreement generated depends on whether the property is in England, Wales, Scotland, or Northern Ireland. You are not getting a one-size-fits-all UK template.',
  },
  {
    question: 'Is this still an AST for England?',
    answer:
      'Many landlords still search using AST language. But from 1 May 2026, new England tenancy agreements generally move into the assured periodic model. Landlord Heaven therefore presents the England route as a current England tenancy agreement built for that framework, rather than as an older AST-style starting point.',
  },
  {
    question: 'Can I keep using an older tenancy agreement?',
    answer:
      'Older agreements still exist, but they may rely on wording, structure, or assumptions that no longer reflect the current framework. If you are creating a new England tenancy now, it is safer to start with wording designed for the current route and the property you are actually letting.',
  },
  {
    question: 'What is included in the agreement?',
    answer:
      'You get more than a single agreement file. The tenancy pack can include the jurisdiction-specific agreement or contract, an inventory and schedule of condition, a pre-tenancy compliance checklist, and for England the deposit protection certificate and prescribed information pack. Premium adds broader drafting for more complex lets plus extra support documents such as the key schedule, property maintenance guide, and checkout procedure.',
  },
  {
    question: 'What is the difference between Standard and Premium?',
    answer:
      'Standard is designed for most straightforward residential lets. Premium is intended for more complex arrangements such as HMOs, student lets, shared households, guarantor-backed lets, or cases where broader wording is useful from the start.',
  },
  {
    question: 'Can I preview before paying?',
    answer:
      'Yes. You can preview the pack structure and sample documents before payment, then the finished tenancy pack is saved in your account after purchase.',
  },
  {
    question: 'Why use this instead of a free tenancy template?',
    answer:
      'Because a free or generic template may be outdated, may use the wrong framework, or may still need substantial manual editing. Landlord Heaven builds the agreement around the property, the jurisdiction, and the tenancy setup you are actually creating.',
  },
];

export const metadata: Metadata = {
  title: 'Assured Periodic Tenancy Agreement for England | Updated for 1 May 2026',
  description:
    "Assured Periodic Tenancy Agreement for England updated for the Renters' Rights Act from 1 May 2026. Compare Standard and Premium, keep AST search guidance visible, and still support Wales, Scotland, and Northern Ireland.",
  keywords: [
    'assured periodic tenancy agreement england',
    'tenancy agreement uk',
    'ast agreement template',
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
    title: 'Assured Periodic Tenancy Agreement for England | Updated for 1 May 2026',
    description:
      'Compare Standard and Premium England tenancy agreement options updated for 1 May 2026, with AST search intent still supported and other UK jurisdictions available lower on the page.',
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
        title="Assured Periodic Tenancy Agreement for England"
        subtitle="Updated for the Renters' Rights Act from 1 May 2026. Create a compliant England tenancy agreement with Standard and Premium options."
        actionsSlot={
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <Link
                href={standardWizardHref}
                className="hero-btn-primary flex w-full justify-center text-center"
              >
                Start Standard Tenancy Agreement
              </Link>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
              <Link
                href={premiumWizardHref}
                className="hero-btn-secondary flex w-full justify-center text-center"
              >
                Start Premium Tenancy Agreement
              </Link>
            </div>
          </div>
        }
        mediaSrc="/images/tenancy_agreements.webp"
        mediaAlt="Preview of Landlord Heaven tenancy agreement documents"
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
          <div className="rounded-[1.9rem] border border-[#F1D8D8] bg-[#FFF7F7] p-6 shadow-[0_12px_28px_rgba(80,26,26,0.05)] md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#A33A3A]">
              Already have a tenancy?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#2A1414] md:text-4xl">
              Older paperwork can leave you exposed without you realising it
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#6B3B3B]">
              If your tenancy started before <strong>1 May 2026</strong>, you may not need to
              replace the agreement entirely — but that does not mean your current paperwork is safe
              to rely on.
            </p>
            <p className="mt-4 text-lg leading-8 text-[#6B3B3B]">
              If the wording, supporting documents, or written information do not reflect the
              current position, you risk finding out later that your agreement does not protect you
              in the way you expected.
            </p>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {[
                'Unclear or unenforceable terms',
                'Compliance gaps that are easy to miss at the start',
                'Disputes where your paperwork does not say what you think it says',
                'Problems later when you need to rely on the agreement',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-white px-4 py-4 text-sm font-semibold leading-6 text-[#5A2F2F] shadow-sm"
                >
                  <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 shrink-0 text-[#C14B4B]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-7 text-[#6B3B3B]">
              Even where a full replacement is not required, landlords are often expected to provide
              updated written information — and missing that step can create avoidable exposure.
            </p>
          </div>
        </section>

        <section className="mb-16 md:mb-20">
          <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1B1730] via-[#2D2152] to-[#5640A3] px-6 py-8 text-white shadow-[0_28px_70px_rgba(41,31,77,0.35)] md:px-10 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#C4B6FF]">
                  What changed for England from 1 May 2026
                </p>
                <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                    New England tenancies no longer start with old AST assumptions

                </h2>
<p className="mt-5 max-w-3xl text-lg leading-8 text-[#E1DBF8]">
  From <strong>1 May 2026</strong>, new private tenancies in England are no longer
  best framed using older fixed-term AST wording. The starting point has moved to
  an <strong>assured periodic tenancy structure</strong>.
</p>

<p className="mt-5 max-w-3xl text-lg leading-8 text-[#E1DBF8]">
  That means if you are creating a new tenancy now, using an older-style agreement
  can lead to the wrong structure or unnecessary confusion. This product is built
  around the current England position, so you start with wording that reflects how
  tenancies are now set up.
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
                  What changed
                </p>
                <ul className="mt-5 space-y-4">
                  {englandChangePoints.map((item) => (
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

        <section className="mb-16 md:mb-20">
          <div className="rounded-[2.2rem] border border-[#E4DED3] bg-white/92 p-6 shadow-[0_18px_42px_rgba(31,41,55,0.05)] md:p-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                When Premium is the better choice
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
                Choose Premium when the tenancy is more involved
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                Some tenancies need more than the lightest document route. If the let involves
                HMOs, sharers, guarantors, or higher-risk household arrangements, Premium is often
                the clearer commercial choice because it gives the landlord broader wording and more
                support from the outset.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {premiumReasons.map((reason) => (
                <div
                  key={reason.title}
                  className="rounded-[1.8rem] border border-[#E6E0D6] bg-[#FCFBF8] p-6"
                >
                  <h3 className="text-lg font-semibold text-[#141B2D]">{reason.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#546075]">{reason.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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

        <section id="whats-included" className="mb-16 scroll-mt-24 md:mb-20">
          <div className="rounded-[2.2rem] border border-[#E4DED3] bg-white/92 p-6 shadow-[0_18px_42px_rgba(31,41,55,0.05)] md:p-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                What you get
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
                More than a tenancy agreement. A pack built to protect your position.
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                This is not just a document download. Each purchase gives you a practical tenancy
                pack designed to reduce missed steps, tighten your paperwork, and give you stronger
                support from the start.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[1.8rem] border border-[#E6E0D6] bg-[#FCFBF8] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                  Standard pack includes
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    'Assured Periodic Tenancy Agreement built for current England law',
                    'Inventory & Schedule of Condition to support deposit disputes',
                    'Pre-Tenancy Compliance Checklist to help avoid missed legal steps',
                    'Deposit Protection Certificate as evidence of compliance',
                    'Prescribed Information Pack for tenant service and record-keeping',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-7 text-[#1E2A44]"
                    >
                      <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#5B56E8]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[1.8rem] border border-[#DCCFFF] bg-gradient-to-br from-[#F8F3FF] to-[#FFFFFF] p-6 shadow-[0_12px_32px_rgba(91,86,232,0.08)]">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B35B3]">
                  Premium adds
                </p>
                <ul className="mt-5 space-y-3">
                  {[
                    'Stronger clauses for shared living, HMOs, and higher-risk setups',
                    'Additional documents for handover, maintenance, and checkout',
                    'Broader protection where a simple agreement may fall short',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm leading-7 text-[#1E2A44]"
                    >
                      <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#5B56E8]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16 md:mb-20">
          <div className="rounded-[2.2rem] border border-[#E4DED3] bg-white/92 p-6 shadow-[0_18px_42px_rgba(31,41,55,0.05)] md:p-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
                How it works
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
                Get the right agreement without the guesswork
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                Landlord Heaven helps you avoid the manual editing, second-guessing, and missed
                details that often come with generic templates.
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
                Free templates can create problems you only notice when it is too late
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                A free or outdated template can look fine at first glance, then fail when you need
                it most. Missing documents, outdated wording, and manual edits often create
                problems that only surface during disputes, compliance checks, or enforcement.
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
                Why this is better than a generic template
              </h2>
              <p className="mt-5 text-lg leading-8 text-[#546075]">
                The difference is not just presentation. It is the difference between starting with
                the correct agreement route and supporting documents for the property, or trying to
                adapt a generic file after the fact.
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
                      <p className="mt-3 text-sm leading-7 text-[#465066]">
                        {row.landlordHeaven}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F1EA] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A7A72]">
                        Generic template
                      </p>
                      <p className="mt-3 text-sm leading-7 text-[#5E677B]">
                        {row.genericTemplate}
                      </p>
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

        <section id="jurisdictions" className="mb-16 md:mb-20">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Other UK jurisdictions
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D] md:text-5xl">
              This product also supports Wales, Scotland, and Northern Ireland.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#546075]">
              England leads this page because the biggest terminology shift happened from{' '}
              <strong>1 May 2026</strong>. But the same product still supports the correct
              agreement route for Wales, Scotland, and Northern Ireland when the property is
              outside England.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {jurisdictions.map((jurisdiction) => (
              <JurisdictionCard key={jurisdiction.name} {...jurisdiction} />
            ))}
          </div>
        </section>

        <RelatedLinks
          title="Keep exploring the England tenancy agreement funnel"
          links={tenancyProductMoneyPageLinks}
          variant="list"
        />
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
              Choose the right tenancy agreement before an outdated agreement slows you down
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#E3DCF8]">
              Start with the current England route, compare Standard and Premium clearly, and keep
              the other UK jurisdictions in view if the property is outside England. That helps you
              avoid relying on wording that may no longer match the framework for the tenancy.
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