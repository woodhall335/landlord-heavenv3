/**
 * HomeContent - Client Component
 *
 * Premium England-first homepage content.
 */

'use client';

import Image from 'next/image';
import { ArrowRight, Check, House, PoundSterling, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';
import { Container } from '@/components/ui';
import { Hero, TrustBar } from '@/components/landing';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { trackHomepageSelectorView } from '@/lib/analytics';
import { smoothScrollToHash } from '@/lib/browser/smoothScrollToHash';
import {
  getPublicCardAccentClasses,
  PUBLIC_LAYOUT_CLASSES,
} from '@/lib/public-brand';
import { PUBLIC_PRODUCT_DESCRIPTORS } from '@/lib/public-products';
import {
  RiArrowRightLine,
  RiCheckLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiHome6Line,
  RiMoneyPoundCircleLine,
  RiScales3Line,
} from 'react-icons/ri';
import { clsx } from 'clsx';

type RouteCard = {
  title: string;
  eyebrow: string;
  description: string;
  whyRoute: string;
  includes?: string[];
  complianceNote?: string;
  ctaLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  accent: keyof typeof accentIconByType;
  routeIntent: string;
  product: string;
  filters: RouteFilter[];
};

type RouteFilter =
  | 'possession_eviction'
  | 'rent_arrears'
  | 'money_claims'
  | 'tenancy_changes'
  | 'not_sure';

type RouteSelectionCardProps = RouteCard & {
  className?: string;
};

type PreviewCard = {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  bullets: string[];
  href: string;
  ctaLabel: string;
  routeIntent: string;
  product: string;
};

type JurisdictionCard = {
  name: string;
  agreement: string;
  description: string;
  href: string;
  flagSrc: string;
  imageSrc: string;
  imageAlt: string;
};


const routeFilters: Array<{ id: 'all' | RouteFilter; label: string }> = [
  { id: 'all', label: 'All situations' },
  { id: 'possession_eviction', label: 'Possession & eviction' },
  { id: 'rent_arrears', label: 'Rent arrears' },
  { id: 'money_claims', label: 'Money claims' },
  { id: 'tenancy_changes', label: 'Tenancy changes' },
  { id: 'not_sure', label: 'Not sure' },
];

const accentIconByType = {
  amethyst: RiFileTextLine,
  plum: RiScales3Line,
  emerald: RiMoneyPoundCircleLine,
  amber: RiFlashlightLine,
  lavender: RiHome6Line,
};

const routeSelectionCards: RouteCard[] = [
  {
    title: 'Section 8 Notice',
    eyebrow: 'Possession & eviction',
    description:
      'If rent is unpaid and you have not served notice yet, start here. Prepare the Section 8 notice, proof of service, and arrears record before anything goes to the tenant.',
    whyRoute:
      'This is for the notice step: choose the right grounds, calculate the dates, and keep the notice, N215, service instructions, and arrears record together from the start.',
    includes: [
      'Form 3A Section 8 notice and N215 certificate of service',
      'Rent arrears schedule, service instructions, and checks before you serve',
      'Case summary and plain-English next steps if the tenant does not respond',
    ],
    complianceNote:
      'Updated for the England possession rules from 1 May 2026, including notice wording, timing, and service checks.',
    ctaLabel: 'Create my Section 8 notice',
    href: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref,
    imageSrc: '/images/illustrations/homepage-routes/section-8-notice-watercolour-v2.webp',
    imageAlt:
      'Watercolour Section 8 notice file labelled Form 3A, N215 and arrears record',
    accent: 'amethyst',
    routeIntent: 'tenant_not_paying_rent',
    product: 'notice_only',
    filters: ['possession_eviction', 'rent_arrears'],
  },
  {
    title: 'Complete Eviction Pack',
    eyebrow: 'Notice and court pack',
    description:
      'Use this if the case is likely to need court papers, or if notice has already been served and the tenant still has not left.',
    whyRoute:
      'This is for the court step: prepare the claim forms, witness evidence, service record, and filing guidance as one joined-up file.',
    includes: [
      'Section 8 notice file plus N5, N119, and witness statement',
      'Evidence checklist, court bundle index, and filing guide',
      'Hearing checklist, case summary, and arrears engagement letter',
    ],
    complianceNote:
      'Keeps the notice, service details, and court forms consistent with the England process from 1 May 2026.',
    ctaLabel: 'Prepare my court papers',
    href: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref,
    imageSrc:
      '/images/illustrations/homepage-routes/complete-eviction-pack-watercolour-v2.webp',
    imageAlt:
      'Watercolour Complete Eviction Pack labelled Form 3A, N5, N119 and evidence file',
    accent: 'plum',
    routeIntent: 'tenant_will_not_leave',
    product: 'complete_pack',
    filters: ['possession_eviction', 'rent_arrears'],
  },
  {
    title: 'Money Claim',
    eyebrow: 'Money claim',
    description:
      'Use this when your main goal is getting money back, whether the tenant is still in the property or has already left.',
    whyRoute:
      'This is for a debt claim, not possession. Keep the money owed separate from the question of whether the tenant must leave.',
    includes: [
      'Letter before claim, particulars, and money claim paperwork',
      'Arrears schedule and debt breakdown support',
      'A clearer file for recovering money rather than repossessing the property',
    ],
    complianceNote:
      'Helps keep rent, damage, bills, and other tenant debt clear before you make a claim.',
    ctaLabel: 'Prepare my money claim',
    href: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.landingHref,
    imageSrc: '/images/illustrations/homepage-routes/money-claim-watercolour-v2.webp',
    imageAlt:
      'Watercolour Money Claim file labelled letter before claim, debt schedule and MCOL or N1',
    accent: 'emerald',
    routeIntent: 'recover_debt',
    product: 'money_claim',
    filters: ['rent_arrears', 'money_claims'],
  },
  {
    title: 'Increase Rent',
    eyebrow: 'Rent increase',
    description:
      'Use this when you want to increase the rent for an England assured tenancy and need the notice, dates, and supporting paperwork handled carefully.',
    whyRoute:
      'This is for serving a rent increase notice, with the timing and service record checked before you send it.',
    includes: [
      'Official Form 4A notice for England',
      'Timing, service, and supporting rent increase documents',
      'A normal option and a tribunal-ready option if a challenge is likely',
    ],
    complianceNote:
      'Updated for the England assured tenancy rent increase process in force from 1 May 2026.',
    ctaLabel: 'Create my rent increase notice',
    href: '/rent-increase',
    imageSrc: '/images/illustrations/homepage-routes/rent-increase-watercolour-v2.webp',
    imageAlt:
      'Watercolour Increase Rent file labelled Form 4A, rent evidence and notice dates',
    accent: 'amber',
    routeIntent: 'increase_rent',
    product: 'section13_standard',
    filters: ['tenancy_changes'],
  },
  {
    title: 'Tenancy Agreement',
    eyebrow: 'Tenancy agreement',
    description:
      'Standard agreements cover England, Wales, Scotland and Northern Ireland. England also offers Premium, Student, HMO / Shared House and Lodger products.',
    whyRoute:
      'This fits when you need the right agreement before the tenancy starts, rather than a generic template that may not match the let.',
    ctaLabel: 'Choose my tenancy agreement',
    href: '/standard-tenancy-agreement#choose-jurisdiction',
    imageSrc:
      '/images/illustrations/homepage-routes/tenancy-agreement-watercolour-v2.webp',
    imageAlt:
      'Watercolour Tenancy Agreement selector for England, Wales, Scotland and Northern Ireland',
    accent: 'lavender',
    routeIntent: 'tenancy_agreement',
    product: 'ast',
    filters: ['tenancy_changes'],
  },
  {
    title: 'Ask Heaven',
    eyebrow: 'Not sure where to start?',
    description:
      'Ask a landlord question in plain English and get guidance towards the most relevant next step, document, or support page.',
    whyRoute:
      'Use Ask Heaven when you need to understand the route before choosing a product or starting a guided workflow.',
    includes: [
      'Plain-English answers to landlord questions',
      'Relevant next-step and document suggestions',
      'Links to detailed guides and suitable workflows',
    ],
    ctaLabel: 'Ask a question',
    href: '/ask-heaven',
    imageSrc: '/images/illustrations/homepage-routes/ask-heaven-watercolour-v2.webp',
    imageAlt:
      'Watercolour Ask Heaven landlord helper with question and clear next steps cards',
    accent: 'lavender',
    routeIntent: 'ask_heaven',
    product: 'ask_heaven',
    filters: ['not_sure'],
  },
];

const routeCardOverridesByProduct: Record<string, Partial<RouteCard>> = {
  ast: {
    whyRoute:
      'This fits when you are setting up a tenancy or replacing older paperwork and want the agreement to match the tenancy you are creating.',
    includes: [
      'Standard, premium, student, HMO, and lodger options',
      'Supporting checklists, handover records, and addenda',
      'A clearer starting point for new or replacement tenancy paperwork',
    ],
    complianceNote:
      'Updated for the England tenancy rules from 1 May 2026, including assured periodic tenancy options.',
  },
};

const previewCards: PreviewCard[] = [
  {
    title: 'A Section 8 notice file you can review before serving',
    body:
      'Prepare the notice, service record, arrears evidence, and next-step guidance as one organised file.',
    imageSrc: '/images/generated/product-cards/section-8-notice-file.webp',
    imageAlt: 'Watercolor Section 8 notice file with service and date-checking documents',
    bullets: [
      'Form 3A and N215 service record',
      'Arrears schedule and checks before service',
      'Case summary and next-step guide',
    ],
    href: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref,
    ctaLabel: 'Create my Section 8 notice',
    routeIntent: 'serve_notice',
    product: 'notice_only',
  },
  {
    title: 'Court possession papers kept with the evidence',
    body:
      'When notice has not resolved the case, build the court forms, witness material, and filing records together.',
    imageSrc: '/images/generated/product-cards/court-possession-file.webp',
    imageAlt: 'Watercolor court possession file with evidence bundle and court motif',
    bullets: [
      'Section 8 notice file plus N5 and N119 together',
      'Witness statement, evidence checklist, and court bundle index',
      'Filing guide and hearing checklist for court',
    ],
    href: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref,
    ctaLabel: 'Prepare my court papers',
    routeIntent: 'court_possession',
    product: 'complete_pack',
  },
  {
    title: 'The rest of the landlord paperwork in one place',
    body:
      'Prepare debt recovery, supported rent increases, and the right tenancy agreement without starting again elsewhere.',
    imageSrc: '/images/generated/product-cards/money-rent-tenancy-files.webp',
    imageAlt: 'Watercolor money, rent increase, and tenancy document files',
    bullets: [
      'Money claims for rent, damage, and bills',
      'Section 13 / Form 4A rent increase paperwork',
      'Agreements for standard, student, HMO, and lodger lets',
    ],
    href: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.landingHref,
    ctaLabel: 'Prepare my money claim',
    routeIntent: 'recover_debt',
    product: 'money_claim',
  },
];

const jurisdictionCards: JurisdictionCard[] = [
  {
    name: 'England',
    agreement: 'Assured periodic tenancy',
    description: 'For a standard England let, with specialist options for student, shared-house and lodger arrangements.',
    href: '/products/ast',
    flagSrc: '/gb-eng.svg',
    imageSrc: '/images/illustrations/tenancy-jurisdictions/england-assured-periodic-waterbrush-v2.webp',
    imageAlt: 'Watercolour illustration of an England tenancy agreement and property keys',
  },
  {
    name: 'Wales',
    agreement: 'Standard Occupation Contract',
    description: 'Choose the Welsh fixed-term or periodic occupation-contract route before entering the tenancy details.',
    href: '/wales-tenancy-agreement-template',
    flagSrc: '/gb-wls.svg',
    imageSrc: '/images/illustrations/tenancy-jurisdictions/wales-occupation-contract-waterbrush-v2.webp',
    imageAlt: 'Watercolour illustration of a Wales occupation contract and landlord paperwork',
  },
  {
    name: 'Scotland',
    agreement: 'Private Residential Tenancy',
    description: 'Use the Scotland-specific PRT workflow for the open-ended private residential tenancy framework.',
    href: '/private-residential-tenancy-agreement-template',
    flagSrc: '/gb-sct.svg',
    imageSrc: '/images/illustrations/tenancy-jurisdictions/scotland-prt-waterbrush-v2.webp',
    imageAlt: 'Watercolour illustration of a Scotland private residential tenancy agreement',
  },
  {
    name: 'Northern Ireland',
    agreement: 'Private Tenancy Agreement',
    description: 'Start with the Northern Ireland wording and supporting setup route for the property location.',
    href: '/northern-ireland-tenancy-agreement-template',
    flagSrc: '/gb-nir.svg',
    imageSrc: '/images/illustrations/tenancy-jurisdictions/northern-ireland-private-tenancy-waterbrush-v2.webp',
    imageAlt: 'Watercolour illustration of a Northern Ireland tenancy agreement and keys',
  },
];

function RouteSelectionCard({
  title,
  eyebrow,
  description,
  whyRoute,
  ctaLabel,
  href,
  imageSrc,
  imageAlt,
  accent,
  routeIntent,
  product,
  includes,
  complianceNote,
  className,
}: RouteSelectionCardProps) {
  const accentStyles = getPublicCardAccentClasses(accent);
  const Icon = accentIconByType[accent];
  const overrides = routeCardOverridesByProduct[product] ?? {};
  const displayWhyRoute = overrides.whyRoute ?? whyRoute;
  const displayIncludes = overrides.includes ?? includes ?? [];
  const displayComplianceNote = overrides.complianceNote ?? complianceNote;

  return (
    <TrackedLink
      href={href}
      pagePath="/"
      pageType="homepage"
      ctaLabel={ctaLabel}
      ctaPosition="selector"
      eventName="homepage_selector_option_click"
      routeIntent={routeIntent}
      product={product}
      className={clsx(
        'group min-w-0 overflow-hidden rounded-2xl border transition duration-200 lg:rounded-[2rem]',
        className,
        accentStyles.card,
        accentStyles.borderGlow,
        PUBLIC_LAYOUT_CLASSES.card
      )}
    >
      <div className="relative aspect-square overflow-hidden border-b border-black/5 bg-gradient-to-br from-[#F7F1FF] via-[#FCFAFF] to-[#EEE3FF] lg:aspect-[16/10]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 1023px) 33vw, 33vw"
          className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="px-2 py-3 text-center lg:hidden">
        <h3 className="text-[0.7rem] font-bold leading-[1.2] text-[#21153d] sm:text-sm">
          {title}
        </h3>
      </div>
      <div className="hidden p-6 lg:block">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={clsx('inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase', accentStyles.chip)}>
              {eyebrow}
            </span>
            <h3 className="mt-4 text-2xl font-semibold leading-tight">{title}</h3>
          </div>
          <span className={clsx('inline-flex h-12 w-12 items-center justify-center rounded-2xl', accentStyles.icon)}>
            <Icon className="h-6 w-6" />
          </span>
        </div>
        <p className="mt-4 text-[15px] leading-7 text-[#5a516d]">{description}</p>
        <div className="mt-5 flex items-start gap-2 text-sm font-semibold text-[#2f2148]">
          <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
          <span>{displayWhyRoute}</span>
        </div>
        {displayIncludes.length > 0 ? (
          <div className="mt-5 rounded-2xl border border-black/5 bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b3fd1]">
              What this includes
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4d4561]">
              {displayIncludes.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <RiCheckLine className="mt-1 h-4 w-4 shrink-0 text-[#7c3aed]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {displayComplianceNote ? (
          <p className="mt-4 text-sm leading-6 text-[#5d5672]">
            <span className="font-semibold text-[#2f2148]">England update:</span>{' '}
            {displayComplianceNote}
          </p>
        ) : null}
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4f2a96]">
          {ctaLabel}
          <RiArrowRightLine className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </TrackedLink>
  );
}

export default function HomeContent() {
  const [activeRouteFilter, setActiveRouteFilter] = useState<'all' | RouteFilter>('all');
  const visibleRouteCards = activeRouteFilter === 'all'
    ? routeSelectionCards
    : routeSelectionCards.filter((card) => card.filters.includes(activeRouteFilter));

  useEffect(() => {
    trackHomepageSelectorView({ pagePath: '/' });
  }, []);

  return (
    <div className={PUBLIC_LAYOUT_CLASSES.page}>
      <HeaderConfig mode="autoOnScroll" />
      <Hero />
      <TrustBar />

      <section id="homepage-route-selector" className="py-14 md:py-18">
        <Container>
          <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'public-subtle-grid px-4 py-7 sm:px-6 md:px-10 md:py-10')}>
            <StaggerReveal className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="public-eyebrow">Solutions for landlords</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                  What situation are you dealing with?
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                  Tell us what you need help with and we&apos;ll guide you to the right documents and support.
                </p>
              </div>
                <div className="public-stat-card hidden px-5 py-4 sm:block">
                  <p className="text-lg font-bold text-[#1c1431]">Clear scope and fixed prices</p>
                  <p className="mt-1 text-sm text-[#5d5672]">See what is included before you start.</p>
                </div>
            </StaggerReveal>

            <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Filter landlord situations">
              {routeFilters.map((filter) => {
                const isActive = filter.id === activeRouteFilter;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveRouteFilter(filter.id)}
                    className={clsx(
                      'rounded-xl border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:py-2.5 sm:text-sm',
                      isActive
                        ? 'border-[#7c3aed] bg-white text-[#4f1fb8] shadow-[0_8px_24px_rgba(109,40,217,0.12)]'
                        : 'border-[#e5ddf7] bg-white/75 text-[#625a73] hover:border-[#cbb8f4] hover:text-[#4f1fb8]'
                    )}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <StaggerReveal
              key={activeRouteFilter}
              className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4 lg:mt-8 lg:gap-6"
              aria-live="polite"
            >
              {visibleRouteCards.map((card) => (
                <RouteSelectionCard key={card.title} {...card} />
              ))}
            </StaggerReveal>

            <AssistedPrepServicesShowcase
              pagePath="/"
              pageType="homepage"
              src="homepage_assisted"
            />
          </div>
        </Container>
      </section>

      <section className="pb-16 pt-2 md:pb-20" aria-labelledby="uk-tenancy-heading">
        <Container>
          <Reveal>
            <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'overflow-hidden px-6 py-8 md:px-10 md:py-10')}>
              <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
                <div className="max-w-xl self-start">
                  <span className="public-eyebrow">UK tenancy agreements</span>
                  <h2 id="uk-tenancy-heading" className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-4xl">
                    Choose the agreement by where the property is
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                    A tenancy agreement is not one generic UK document. Choose the nation first,
                    then use wording and guided questions that match the property location.
                  </p>
                  <TrackedLink
                    href="/standard-tenancy-agreement#choose-jurisdiction"
                    pagePath="/"
                    pageType="homepage"
                    ctaLabel="Choose my tenancy agreement"
                    ctaPosition="section"
                    eventName="product_route_chosen"
                    routeIntent="tenancy_jurisdiction"
                    product="ast"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4f2a96] hover:text-[#3f2179]"
                  >
                    Choose my tenancy agreement
                    <RiArrowRightLine className="h-4 w-4" />
                  </TrackedLink>
                </div>

                <StaggerReveal className="grid gap-4 sm:grid-cols-2">
                  {jurisdictionCards.map((card) => (
                    <TrackedLink
                      key={card.name}
                      href={card.href}
                      pagePath="/"
                      pageType="homepage"
                      ctaLabel={`${card.name} tenancy agreement`}
                      ctaPosition="section"
                      eventName="product_route_chosen"
                      routeIntent="tenancy_jurisdiction"
                      product="ast"
                      className="group overflow-hidden rounded-[1.5rem] border border-[#e9e0f8] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(82,43,145,0.13)]"
                    >
                      <div className="relative aspect-[16/8] overflow-hidden bg-[#faf8ff]">
                        <Image
                          src={card.imageSrc}
                          alt={card.imageAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                          className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2">
                          <Image
                            src={card.flagSrc}
                            alt=""
                            width={24}
                            height={15}
                            className="h-[15px] w-6 rounded-sm object-cover shadow-[0_1px_3px_rgba(32,16,63,0.18)]"
                          />
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b3fd1]">
                            {card.name}
                          </p>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold text-[#1d1532]">
                          {card.agreement}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-[#5a516d]">{card.description}</p>
                      </div>
                    </TrackedLink>
                  ))}
                </StaggerReveal>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-16 pt-4 md:pb-20" aria-labelledby="clarity-first-heading">
        <Container>
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border border-[#e4d8fb] bg-[linear-gradient(135deg,#fbf9ff_0%,#f4edff_55%,#ffffff_100%)] shadow-[0_24px_70px_rgba(70,39,130,0.1)]">
              <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                <div>
                  <p className="public-eyebrow">Clarity first. Legal detail second.</p>
                  <h2 id="clarity-first-heading" className="mt-4 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                    Start with the problem. Finish with a clearer document file.
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5d5672]">
                    Tell us what is happening in plain English. The guided workflow asks the relevant questions, runs the checks, and builds the documents around your answers.
                  </p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-3">
                    {[
                      ['1', 'Describe the situation', 'Choose the landlord problem you need to solve.'],
                      ['2', 'Follow tailored questions', 'Answer only the facts relevant to that route.'],
                      ['3', 'Preview before payment', 'Review the generated file before checkout.'],
                    ].map(([step, title, body]) => (
                      <article key={step} className="rounded-2xl border border-[#e4d8fb] bg-white/90 p-4">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-sm font-bold text-white">{step}</span>
                        <h3 className="mt-3 font-semibold text-[#21153d]">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#625a73]">{body}</p>
                      </article>
                    ))}
                  </div>
                  <TrackedLink
                    href="/wizard"
                    pagePath="/"
                    pageType="homepage"
                    ctaLabel="Find the right document"
                    ctaPosition="section"
                    eventName="homepage_primary_cta_click"
                    routeIntent="wizard"
                    className="hero-btn-primary mt-7 inline-flex justify-center lg:mx-auto lg:flex lg:w-fit"
                  >
                    Find the right document
                  </TrackedLink>
                </div>
                <div className="relative min-h-[20rem] overflow-hidden rounded-[1.5rem] border border-white bg-white/75 md:min-h-[28rem]">
                  <Image
                    src="/images/generated/samples/tenancy-agreements.png"
                    alt="Illustrated landlord documents for England, Wales, Scotland and Northern Ireland"
                    fill
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-contain object-center"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="pb-16 pt-4 md:pb-20">
        <Container>
          <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-10 md:py-10')}>
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
              <div className="rounded-[1.7rem] border border-[#e9e0f8] bg-[linear-gradient(145deg,#fbf9ff_0%,#f5efff_100%)] p-6 md:p-8">
                <span className="public-eyebrow">Built around the job in front of you</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                  See the file you are building before you pay
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                  Each guided route keeps the forms, evidence, records, and practical next steps together. You can inspect the generated documents before checkout.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    'Serve a Section 8 notice with the dates, grounds, service record, and arrears evidence kept together',
                    'Move to court with the possession forms, witness material, evidence checklist, and filing guidance in one file',
                    'Handle money claims, rent increases, and tenancy setup through dedicated landlord workflows',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-[#2c2143]">
                      <RiCheckLine className="mt-1 h-5 w-5 shrink-0 text-[#7c3aed]" />
                      <span className="text-[15px] leading-7">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <StaggerReveal className="grid gap-5 md:grid-cols-3">
                {previewCards.map((card) => (
                  <TrackedLink
                    key={card.title}
                    href={card.href}
                    pagePath="/"
                    pageType="homepage"
                    ctaLabel={card.ctaLabel}
                    ctaPosition="section"
                    eventName="product_route_chosen"
                    routeIntent={card.routeIntent}
                    product={card.product}
                    className={clsx(
                      'group overflow-hidden rounded-[1.8rem] border transition duration-200',
                      PUBLIC_LAYOUT_CLASSES.card
                    )}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden border-b border-[#efe5ff] bg-[#faf8ff]">
                      <Image
                        src={card.imageSrc}
                        alt={card.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 30vw"
                        className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold leading-tight text-[#1d1532]">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#5a516d]">{card.body}</p>
                      <ul className="mt-4 space-y-2 text-sm text-[#2e2443]">
                        {card.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2">
                            <RiCheckLine className="mt-0.5 h-4 w-4 shrink-0 text-[#7c3aed]" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4f2a96]">
                        {card.ctaLabel}
                        <RiArrowRightLine className="h-4 w-4 transition group-hover:translate-x-1" />
                      </div>
                    </div>
                  </TrackedLink>
                ))}
              </StaggerReveal>
            </div>
          </div>
        </Container>
      </section>

      <section
        className="relative overflow-hidden border-y border-[#E8E1F8] bg-[radial-gradient(circle_at_78%_42%,rgba(176,132,255,0.28),transparent_30%),linear-gradient(135deg,#FFFFFF_0%,#F6F1FF_55%,#EEE7FF_100%)] px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
        data-visual-cta
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,transparent_0%,transparent_48%,rgba(255,255,255,0.45)_48%,rgba(255,255,255,0.45)_62%,transparent_62%)] opacity-50" />
        <div className="relative mx-auto grid max-w-[94rem] gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-[#EEE7FF] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#6D28D9]">
              Landlord documents
            </p>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#11102A] sm:text-5xl lg:text-[3.35rem] lg:leading-[1.04]">
              <span className="block">Choose the landlord job</span>{' '}
              <span className="block text-[#6D28D9]">and get the right paperwork moving</span>
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#536078]">
              Start with the situation you need to deal with. We will take you to the matching
              notice, court, debt, rent-increase, or tenancy-agreement route.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/80 bg-white/55 p-3.5 shadow-[0_10px_30px_rgba(83,49,138,0.06)] backdrop-blur-sm">
                <Scale aria-hidden="true" className="h-7 w-7 shrink-0 text-[#6D28D9]" />
                <span>
                  <strong className="block text-sm font-bold leading-5 text-[#17142B]">Possession</strong>
                  <span className="block text-xs leading-5 text-[#5E6A80]">Notice and court routes</span>
                </span>
              </div>
              <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/80 bg-white/55 p-3.5 shadow-[0_10px_30px_rgba(83,49,138,0.06)] backdrop-blur-sm">
                <PoundSterling aria-hidden="true" className="h-7 w-7 shrink-0 text-[#6D28D9]" />
                <span>
                  <strong className="block text-sm font-bold leading-5 text-[#17142B]">Recover money</strong>
                  <span className="block text-xs leading-5 text-[#5E6A80]">Debt-claim paperwork</span>
                </span>
              </div>
              <div className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/80 bg-white/55 p-3.5 shadow-[0_10px_30px_rgba(83,49,138,0.06)] backdrop-blur-sm">
                <House aria-hidden="true" className="h-7 w-7 shrink-0 text-[#6D28D9]" />
                <span>
                  <strong className="block text-sm font-bold leading-5 text-[#17142B]">Tenancy and rent</strong>
                  <span className="block text-xs leading-5 text-[#5E6A80]">Agreements and increases</span>
                </span>
              </div>
            </div>

            <TrackedLink
              href="#homepage-route-selector"
              pagePath="/"
              pageType="homepage"
              ctaLabel="Choose the right next step"
              ctaPosition="final"
              eventName="homepage_primary_cta_click"
              className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] px-5 py-3 text-center text-sm font-bold text-white shadow-[0_14px_30px_rgba(91,33,182,0.24)] transition hover:-translate-y-0.5 hover:brightness-110 sm:w-auto sm:min-w-80"
              onClick={(event) => {
                if (smoothScrollToHash('#homepage-route-selector')) {
                  event.preventDefault();
                }
              }}
            >
              Choose the right next step
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </TrackedLink>
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-[#536078]">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#6D28D9]" />
              Choose the situation first, then review the exact scope and price before payment.
            </p>
          </div>

          <div className="relative min-h-[24rem] sm:min-h-[30rem]">
            <Image
              src="/images/illustrations/product-banners/homepage-route-selector-conversion-v1.webp"
              alt="Landlord document routes for notices, money claims, tenancy agreements and rent increases"
              fill
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain object-center"
            />
            <div className="absolute inset-x-4 bottom-0 mx-auto flex max-w-xl items-center gap-4 rounded-2xl border border-[#D7C7FF] bg-white/80 p-5 text-left shadow-[0_18px_50px_rgba(91,33,182,0.14)] backdrop-blur-md sm:inset-x-10">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] text-white shadow-lg">
                <Check aria-hidden="true" className="h-8 w-8" />
              </span>
              <span>
                <strong className="block text-base font-bold text-[#5B21B6]">One clear route for the job in front of you</strong>
                <span className="mt-1 block text-sm leading-5 text-[#38455D]">Choose the landlord task, then move into the matching paperwork.</span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
