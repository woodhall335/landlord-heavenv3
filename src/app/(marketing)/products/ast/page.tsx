import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { RiArrowRightLine, RiCheckboxCircleLine, RiAlertLine } from 'react-icons/ri';
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
    flag: '/gb-eng.svg',
    heading: 'Residential Tenancy Agreement',
    summary:
      'England landlords should move onto the updated tenancy wording now. Use the live Residential Tenancy Agreement flow for new lets and current England-first drafting.',
    forms: [
      'Residential Tenancy Agreement',
      'Section 21 Notice',
      'Section 8 Notice',
      'County Court Forms',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy',
    ctaLabel: `Create England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
    secondaryHref: '/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy',
    secondaryLabel: `Premium England agreement - ${PRODUCTS.ast_premium.displayPrice}`,
  },
  {
    name: 'Wales',
    flag: '/gb-wls.svg',
    heading: 'Standard Occupation Contract',
    summary:
      'Choose the Wales-specific route if the property is in Wales. The wizard follows the occupation contract framework and the right Welsh terminology.',
    forms: [
      'Standard Occupation Contract',
      'Section 173 Notice',
      'Renting Homes Act Forms',
      'County Court Forms',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=wales&src=product_page&topic=tenancy',
    ctaLabel: 'Create Wales contract',
  },
  {
    name: 'Scotland',
    flag: '/gb-sct.svg',
    heading: 'Private Residential Tenancy',
    summary:
      'Use the Scotland route for PRT drafting and the correct Scottish tenancy framework. This keeps the agreement aligned to Scotland-specific rules from the outset.',
    forms: [
      'Private Residential Tenancy',
      'Notice to Leave',
      'First-tier Tribunal Forms',
      'Simple Procedure',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=scotland&src=product_page&topic=tenancy',
    ctaLabel: 'Create Scotland PRT',
  },
  {
    name: 'Northern Ireland',
    flag: '/gb-nir.svg',
    heading: 'Private Tenancy Agreement',
    summary:
      'Northern Ireland stays on its own private tenancy framework. Start the NI flow if you need the right agreement wording for an NI property.',
    forms: [
      'Private Tenancy Agreement',
      'Northern Ireland tenancy framework',
      'Tenancy agreements only',
      'Eviction notices planned',
    ],
    href: '/wizard?product=ast_standard&jurisdiction=northern-ireland&src=product_page&topic=tenancy',
    ctaLabel: 'Create NI agreement',
  },
] as const;

const actionPoints = [
  {
    title: 'Use the right region before you issue paperwork',
    body:
      'Tenancy documents, notice routes, and court processes are not interchangeable across the UK. Picking the wrong route creates avoidable rework.',
  },
  {
    title: 'England landlords should not rely on old AST-era sales wording',
    body:
      'Our live England flow now leads with the Residential Tenancy Agreement route, so you can start with the current Landlord Heaven wording instead of legacy positioning.',
  },
  {
    title: 'Start the correct wizard now, not after the tenancy is agreed',
    body:
      'The earlier you choose the right region and agreement type, the easier it is to keep the tenancy file, supporting documents, and next steps aligned.',
  },
];

export const metadata: Metadata = {
  title: `UK Tenancy Agreements for Landlords | England Updated for Renters Rights | From ${PRODUCTS.ast_standard.displayPrice}`,
  description:
    'Choose the correct tenancy agreement route for England, Wales, Scotland, or Northern Ireland. Start the updated England Residential Tenancy Agreement or the right regional equivalent.',
  keywords: [
    'renters rights compliant tenancy agreement',
    'residential tenancy agreement england',
    'uk tenancy agreements for landlords',
    'updated tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'UK Tenancy Agreements for Landlords | England Updated for Renters Rights',
    description:
      'Start the correct tenancy agreement flow for England, Wales, Scotland, or Northern Ireland with region-specific drafting and guided setup.',
    url: canonicalUrl,
    type: 'website',
  },
};

function RegionCard({
  name,
  flag,
  heading,
  summary,
  forms,
  href,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
}: (typeof regions)[number]) {
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
          <h2 className="text-2xl font-bold text-[#141B2D]">{heading}</h2>
        </div>
      </div>

      <p className="mt-4 text-base leading-7 text-[#465066]">{summary}</p>

      <div className="mt-6 rounded-2xl bg-[#F7F9FC] p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">What this route covers</p>
        <ul className="mt-3 space-y-3">
          {forms.map((form) => (
            <li key={form} className="flex items-start gap-3 text-[15px] text-[#1F2937]">
              <RiCheckboxCircleLine className="mt-0.5 h-5 w-5 shrink-0 text-[#5B56E8]" />
              <span>{form}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={href} className="hero-btn-primary inline-flex items-center justify-center gap-2 sm:w-auto">
          {ctaLabel}
          <RiArrowRightLine className="h-4 w-4" />
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex items-center justify-center rounded-xl border border-[#C9D4EA] px-4 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#AAB9D8] hover:bg-[#F7F9FC] sm:w-auto"
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
        title="Choose the right tenancy agreement before your next tenancy starts"
        subtitle="Do not rely on old wording or the wrong regional route. Start the correct Landlord Heaven tenancy flow for England, Wales, Scotland, or Northern Ireland and get the right agreement path from the outset."
        primaryCta={{
          label: `Start England agreement - ${PRODUCTS.ast_standard.displayPrice}`,
          href: '/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy',
        }}
        secondaryCta={{
          label: `Premium England agreement - ${PRODUCTS.ast_premium.displayPrice}`,
          href: '/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy',
        }}
        mediaSrc="/images/tenancy_agreements.webp"
        mediaAlt="Preview of Landlord Heaven tenancy agreement documents"
        feature="Region-specific tenancy agreement drafting with guided setup, compliance support, and faster preparation for new lets."
        showTrustPositioningBar
      />

      <section className="border-y border-[#E8EEF8] bg-[#F8FBFF]">
        <Container>
          <div className="py-4 text-sm font-medium text-[#51607A]">
            Pick the correct regional route now so your agreement, supporting paperwork, and next steps all start in the right framework.
          </div>
        </Container>
      </section>

      <Container className="py-12">
        <section className="mb-12 rounded-[2rem] border border-[#D8E3F4] bg-[#F8FBFF] p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-[#E8EEFF] p-2 text-[#4B5AE4]">
              <RiAlertLine className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#141B2D]">Why this needs attention now</h2>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-[#465066]">
                Landlords lose time when the wrong region, the wrong terminology, or the wrong agreement route is used at the start.
                This page is designed to get you into the correct workflow quickly and professionally.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {actionPoints.map((point) => (
              <div key={point.title} className="rounded-2xl border border-[#DDE6F4] bg-white p-5">
                <h3 className="text-lg font-semibold text-[#141B2D]">{point.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#546075]">{point.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5B56E8]">Choose the right region</p>
            <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#141B2D]">The correct tenancy route for each UK jurisdiction</h2>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-[#465066]">
              Start the agreement flow that matches the property location. Each route below is aligned to the tenancy framework used in that jurisdiction.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {regions.map((region) => (
              <RegionCard key={region.name} {...region} />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#E4E8F1] bg-white p-6 md:p-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-bold text-[#141B2D]">Need to move fast on England?</h2>
            <p className="mt-4 text-lg leading-8 text-[#465066]">
              If the property is in England, start with the updated Residential Tenancy Agreement flow now. That keeps your
              agreement wording, supporting documents, and next steps aligned before the tenancy is issued to the tenant.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/wizard?product=ast_standard&jurisdiction=england&src=product_page&topic=tenancy"
                className="hero-btn-primary inline-flex items-center justify-center gap-2"
              >
                Create England agreement
                <RiArrowRightLine className="h-4 w-4" />
              </Link>
              <Link
                href="/wizard?product=ast_premium&jurisdiction=england&src=product_page&topic=tenancy"
                className="inline-flex items-center justify-center rounded-xl border border-[#C9D4EA] px-4 py-3 text-sm font-semibold text-[#2A3550] transition hover:border-[#AAB9D8] hover:bg-[#F7F9FC]"
              >
                Create premium England agreement
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
