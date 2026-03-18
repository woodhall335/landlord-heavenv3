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

type ValuePoint = {
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
    bestFor: 'Straightforward lets, single household occupancies, and simpler tenancy setups.',
    description:
      'Choose Standard when you need a legally compliant, jurisdiction-specific tenancy agreement without the broader clause set usually needed for HMOs, student lets, or more complex households.',
    points: [
      'Suitable for most straightforward residential lets',
      'Guided setup with preview before payment',
      'Built for the correct UK jurisdiction from the outset',
      'Stored in your Landlord Heaven account and easy to revisit or regenerate',
    ],
    href: standardWizardHref,
    ctaLabel: `Start Standard - ${PRODUCTS.ast_standard.displayPrice}`,
  },
  {
    name: 'Premium Residential Tenancy Agreement (HMO / student-ready)',
    price: PRODUCTS.ast_premium.displayPrice,
    bestFor: 'HMOs, student lets, shared households, guarantor-backed lets, and more complex occupancy arrangements.',
    description:
      'Choose Premium when you need broader clause coverage, stronger protection wording, and more flexibility for higher-value or operationally more complex tenancy setups.',
    points: [
      'Better suited to shared households, HMOs, and student properties',
      'Stronger wording for multi-tenant and higher-complexity arrangements',
      'Guided setup, preview before payment, and clearer structure for complex lets',
      'Stored in your Landlord Heaven account and ready to revisit or regenerate',
    ],
    href: premiumWizardHref,
    ctaLabel: `Start Premium - ${PRODUCTS.ast_premium.displayPrice}`,
  },
];

const jurisdictions: JurisdictionCardData[] = [
  {
    name: 'England',
    flag: '/gb-eng.svg',
    agreementType: 'Residential Tenancy Agreement',
    summary:
      'For England, Landlord Heaven now leads with a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025 and designed for the new England tenancy system.',
    points: [
      'Updated for the Renters\' Rights Act 2025',
      'Designed for the new England tenancy system',
      'Not an assured shorthold tenancy for new agreements',
      'England-specific wording and structure for new lets going forward',
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
      'For properties in Wales, the agreement follows the Welsh occupation contract framework with Wales-specific drafting and terminology.',
    points: [
      'Correct Welsh agreement type from the start',
      'Jurisdiction-specific wording for Wales',
      'Guided setup for landlords who need the right Welsh framework',
      'A better fit than editing a generic UK tenancy template',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=wales&src=product_page&topic=tenancy',
    ctaLabel: 'Create Wales agreement',
  },
  {
    name: 'Scotland',
    flag: '/gb-sct.svg',
    agreementType: 'Private Residential Tenancy',
    summary:
      'For Scottish properties, Landlord Heaven generates a Private Residential Tenancy with Scotland-specific drafting and the right tenancy structure for that jurisdiction.',
    points: [
      'Private Residential Tenancy drafting for Scotland',
      'Jurisdiction-specific terminology and structure',
      'Guided setup for the Scottish tenancy framework',
      'No generic UK template guesswork',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=scotland&src=product_page&topic=tenancy',
    ctaLabel: 'Create Scotland agreement',
  },
  {
    name: 'Northern Ireland',
    flag: '/gb-nir.svg',
    agreementType: 'Private Tenancy Agreement',
    summary:
      'For Northern Ireland properties, the agreement stays within the Northern Ireland private tenancy framework and the wording used there.',
    points: [
      'Private Tenancy Agreement for Northern Ireland',
      'Jurisdiction-specific drafting for NI properties',
      'Guided setup built around the Northern Ireland framework',
      'A cleaner option than adapting a generic form',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=northern-ireland&src=product_page&topic=tenancy',
    ctaLabel: 'Create Northern Ireland agreement',
  },
];

const valuePoints: ValuePoint[] = [
  {
    title: 'Guided setup, not blank-form editing',
    body: 'Answer structured questions and build the agreement around the tenancy you are actually creating, rather than editing a generic document line by line.',
  },
  {
    title: 'Jurisdiction-specific from the outset',
    body: 'The agreement generated depends on where the property is located, so you start with the correct UK nation\'s framework instead of trying to retrofit the wrong one.',
  },
  {
    title: 'Updated structure for current rules',
    body: 'England is now positioned as a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025, while Wales, Scotland, and Northern Ireland remain aligned to their own systems.',
  },
  {
    title: 'Preview, store, and revisit',
    body: 'Preview before payment, keep the document in your Landlord Heaven account, and come back to the agreement when you need another copy or refreshed paperwork.',
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Agreement type',
    landlordHeaven: 'Generated for the correct UK jurisdiction and agreement framework.',
    genericTemplate: 'Often left as a generic tenancy template with manual edits.',
  },
  {
    label: 'England readiness',
    landlordHeaven: 'England is positioned as a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025.',
    genericTemplate: 'Often still framed around outdated AST-era wording.',
  },
  {
    label: 'Setup experience',
    landlordHeaven: 'Guided flow with clear questions, product choice, and preview before payment.',
    genericTemplate: 'Usually a blank document download that leaves the structure to you.',
  },
  {
    label: 'Ongoing access',
    landlordHeaven: 'Stored in your account and ready to revisit or regenerate when needed.',
    genericTemplate: 'Often a one-time file download with no managed account history.',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Is this still an AST?',
    answer:
      'For new England agreements, no. Landlord Heaven now positions the England product as a Residential Tenancy Agreement designed for the new England tenancy system, not an assured shorthold tenancy. Wales, Scotland, and Northern Ireland continue to use their own jurisdiction-specific agreement types.',
  },
  {
    question: 'What changed under the Renters\' Rights Act 2025?',
    answer:
      'For England, the tenancy product moves away from old AST-first positioning and towards the new England tenancy structure. That is why the England agreement is now presented as a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025 and built for new agreements going forward.',
  },
  {
    question: 'Are your tenancy agreements legally compliant?',
    answer:
      'Landlord Heaven tenancy agreements are positioned as legally compliant and jurisdiction specific. The document generated depends on the property jurisdiction and is drafted to reflect the framework that applies there. We do not promise legal outcomes, but the product is built to help landlords start with the correct structure and wording.',
  },
  {
    question: 'Are the agreements jurisdiction specific?',
    answer:
      'Yes. You do not get a generic one-size-fits-all UK tenancy template. The agreement generated depends on whether the property is in England, Wales, Scotland, or Northern Ireland.',
  },
  {
    question: 'Which agreement do I get for my region?',
    answer:
      'England properties use a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025. Wales uses an Occupation Contract. Scotland uses a Private Residential Tenancy. Northern Ireland uses a Private Tenancy Agreement.',
  },
  {
    question: 'What is the difference between Standard and Premium?',
    answer:
      'Standard is best for straightforward lets, single household occupancies, and simpler tenancy setups. Premium is designed for HMOs, student lets, shared households, and other more complex arrangements where broader clause coverage and stronger protection wording add more value.',
  },
  {
    question: 'Do I need Premium for an HMO or student let?',
    answer:
      'In most cases, yes. Premium is the stronger fit for HMOs, student lets, and shared households because it is built for more complex occupancy arrangements and gives you broader clause coverage than the Standard product.',
  },
];

export const metadata: Metadata = {
  title:
    'Renters Rights Compliant Tenancy Agreement | Residential Tenancy Agreement England',
  description:
    'Create a renters rights compliant tenancy agreement with jurisdiction-specific drafting for England, Wales, Scotland and Northern Ireland. England now uses a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025.',
  keywords: [
    'renters rights compliant tenancy agreement',
    'renters rights act tenancy agreement',
    'new tenancy agreement england',
    'residential tenancy agreement england',
    'tenancy agreement template 2026',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title:
      'Renters Rights Compliant Tenancy Agreement | Residential Tenancy Agreement England',
    description:
      'Create a jurisdiction-specific tenancy agreement for England, Wales, Scotland or Northern Ireland. England is now positioned as a Residential Tenancy Agreement updated for the Renters\' Rights Act 2025.',
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
}: ProductCardData) {
  return (
    <div className="rounded-[2rem] border border-[#DDE5F2] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
            Jurisdiction-specific tenancy agreement
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#141B2D]">{name}</h3>
        </div>
        <div className="rounded-2xl bg-[#EEF3FF] px-4 py-2 text-right">
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
    <div className="rounded-[2rem] border border-[#E4E8F1] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-3">
        <Image
          src={flag}
          alt={name}
          width={44}
          height={32}
          className="h-8 w-11 rounded-sm border border-gray-200"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">{name}</p>
          <h3 className="text-2xl font-bold text-[#141B2D]">{agreementType}</h3>
        </div>
      </div>

      <p className="mt-4 text-base leading-7 text-[#465066]">{summary}</p>

      <ul className="mt-6 space-y-3 rounded-2xl bg-[#F7F9FC] p-4">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-3 text-[15px] text-[#1F2937]">
            <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 shrink-0 text-[#5B56E8]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={href} className="hero-btn-primary inline-flex items-center justify-center gap-2">
          {ctaLabel}
          <RiArrowRightLine className="h-4 w-4" />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-xl border border-[#C9D4EA] px-4 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#AAB9D8] hover:bg-[#F7F9FC]"
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
        title="Create a tenancy agreement updated for the Renters' Rights Act 2025 and the right UK jurisdiction"
        subtitle="Generate a legally compliant, jurisdiction-specific tenancy agreement for England, Wales, Scotland or Northern Ireland. For England, the product is now a Residential Tenancy Agreement designed for the new England tenancy system under the Renters' Rights Act 2025, not an assured shorthold tenancy."
        primaryCta={{
          label: `Create your tenancy agreement - ${PRODUCTS.ast_standard.displayPrice}`,
          href: standardWizardHref,
        }}
        secondaryCta={{
          label: 'Compare Standard and Premium',
          href: '#compare-options',
        }}
        mediaSrc="/images/tenancy_agreements.webp"
        mediaAlt="Preview of Landlord Heaven tenancy agreement documents"
        feature="Legally compliant drafting, guided setup, preview before payment, and jurisdiction-specific agreements built for the rules that apply where the property is located."
        showTrustPositioningBar
      />

      <section className="border-y border-[#E8EEF8] bg-[#F8FBFF]">
        <Container>
          <div className="py-4 text-sm font-medium text-[#51607A]">
            The agreement generated depends on the property jurisdiction, so you start with the correct UK tenancy structure instead of a generic one-size-fits-all template.
          </div>
        </Container>
      </section>

      <Container className="py-14">
        <section className="mb-16 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Renters' Rights compliant tenancy agreement
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#141B2D]">
              A higher-value way to create the right tenancy agreement
            </h2>
            <p className="mt-5 max-w-4xl text-lg leading-8 text-[#465066]">
              Landlord Heaven is built for landlords who want more than a cheap template download. You get a guided,
              legally compliant tenancy agreement flow that reflects the property jurisdiction, the current framework,
              and the product level you actually need.
            </p>
            <p className="mt-5 max-w-4xl text-lg leading-8 text-[#465066]">
              If you need a new tenancy agreement in England for 2026, this page is the right starting point. England
              now uses a Residential Tenancy Agreement updated for the Renters' Rights Act 2025, while Wales,
              Scotland, and Northern Ireland continue on their own agreement structures.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#D8E3F4] bg-[#F8FBFF] p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              What you get
            </p>
            <ul className="mt-5 space-y-4">
              {[
                'Jurisdiction-specific drafting for England, Wales, Scotland, and Northern Ireland',
                'A guided setup flow instead of editing a generic tenancy agreement template 2026 download',
                'Standard and Premium product options so the clause set fits the tenancy complexity',
                'Preview before payment, with documents stored in your Landlord Heaven account',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-7 text-[#1E2A44]">
                  <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#5B56E8]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="compare-options" className="mb-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Choose your product level
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              Standard for simpler lets. Premium for more complex households.
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#465066]">
              Both products are legally compliant and jurisdiction specific. The difference is commercial and practical:
              Standard is the better fit for most straightforward residential lets, while Premium is better suited to
              HMOs, student lets, shared households, and arrangements that need broader clause coverage and stronger
              protection wording.
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
                England upgrade
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-tight">
                Residential Tenancy Agreement (England)
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#D5DDF3]">
                For new England agreements, Landlord Heaven now generates a Residential Tenancy Agreement updated for
                the Renters' Rights Act 2025. It is designed for the new England tenancy system, built with
                England-specific wording and structure, and positioned for new agreements going forward.
              </p>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#D5DDF3]">
                This is not an assured shorthold tenancy. It replaces outdated AST-first templates for new England
                agreements and gives landlords a clearer starting point for creating a legally compliant England
                tenancy agreement under the new framework.
              </p>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[#D5DDF3]">
                If you have been searching for a Renters' Rights Bill tenancy agreement, this is the updated England
                product. The law is now the Renters' Rights Act 2025, and this flow is designed for new England
                tenancy agreements going forward.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy" className="hero-btn-primary inline-flex items-center gap-2">
                  Start your England agreement
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
                Built for new England agreements
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  'Renters\' Rights Act 2025 compliant England positioning',
                  'Residential Tenancy Agreement wording rather than AST-first sales framing',
                  'Not an assured shorthold tenancy for new England lets',
                  'Designed for the new England tenancy system, with guided setup and preview before payment',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] leading-7 text-[#E8EDFB]">
                    <RiCheckboxCircleLine className="mt-1 h-5 w-5 shrink-0 text-[#AFC4FF]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              UK-wide support
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              The correct agreement for the correct UK nation
            </h2>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#465066]">
              Landlord Heaven does not give you a generic one-size-fits-all tenancy agreement. The agreement generated
              depends on where the property is located, so landlords get the right framework for England, Wales,
              Scotland, or Northern Ireland from the outset.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {jurisdictions.map((jurisdiction) => (
              <JurisdictionCard key={jurisdiction.name} {...jurisdiction} />
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] border border-[#E4E8F1] bg-[#F8FBFF] p-6 md:p-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Why Landlord Heaven
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              Built to feel like a better product than a basic download
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#465066]">
              The value here is not just the document. It is the guided setup, the jurisdiction-specific structure, and
              the cleaner path to creating a tenancy agreement that reflects the rules where the property is located.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {valuePoints.map((point) => (
              <div key={point.title} className="rounded-2xl border border-[#DDE6F4] bg-white p-5">
                <h3 className="text-xl font-semibold text-[#141B2D]">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#546075]">{point.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 rounded-[2rem] border border-[#E4E8F1] bg-white p-6 md:p-8">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">
              Comparison and trust
            </p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">
              More than a cheap template
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#465066]">
              If you are searching for a renters rights compliant tenancy agreement, the real value is not only the
              wording. It is getting the correct agreement type, the correct structure, and a cleaner workflow for the
              jurisdiction the property sits in.
            </p>
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
                <div className="border-r border-[#E4E8F1] px-4 py-4 font-semibold text-[#1E2A44]">{row.label}</div>
                <div className="border-r border-[#E4E8F1] px-4 py-4 leading-7">{row.landlordHeaven}</div>
                <div className="px-4 py-4 leading-7">{row.genericTemplate}</div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      <FAQSection
        title="Tenancy agreement FAQs"
        intro="Clear answers on the England upgrade, UK-wide jurisdiction support, and how to choose between Standard and Premium."
        faqs={faqs}
        showContactCTA={false}
        variant="white"
      />
    </div>
  );
}
