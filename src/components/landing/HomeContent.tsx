/**
 * HomeContent - Client Component
 *
 * Premium England-first homepage content.
 */

'use client';

import Image from 'next/image';
import { useEffect } from 'react';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { PremiumImageFrame, Reveal, StaggerReveal, TrustPillRow } from '@/components/marketing/PremiumMotion';
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
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';
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
};

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

type ProcessStep = {
  step: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
};

type AssistedPrepHomeCard = {
  title: string;
  eyebrow: string;
  description: string;
  price: string;
  href: string;
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
  routeIntent: string;
  product: string;
};

const reviewCount = getDynamicReviewCount();
const formattedReviewCount = reviewCount.toLocaleString('en-GB');
const reviewStars = '\u2605\u2605\u2605\u2605\u2605';

const accentIconByType = {
  amethyst: RiFileTextLine,
  plum: RiScales3Line,
  emerald: RiMoneyPoundCircleLine,
  amber: RiFlashlightLine,
  lavender: RiHome6Line,
};

const routeSelectionCards: RouteCard[] = [
  {
    title: 'Tenant not paying rent',
    eyebrow: 'Usually the first step',
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
    imageSrc: '/images/section-8-notice.webp',
    imageAlt: 'Tenant not paying rent situation card',
    accent: 'amethyst',
    routeIntent: 'tenant_not_paying_rent',
    product: 'notice_only',
  },
  {
    title: 'Tenant will not leave',
    eyebrow: 'When notice is not the whole job',
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
    imageSrc: '/images/section-8-court-paperwork.webp',
    imageAlt: 'Tenant will not leave situation card',
    accent: 'plum',
    routeIntent: 'tenant_will_not_leave',
    product: 'complete_pack',
  },
  {
    title: 'Need to recover unpaid rent, bills, or damage',
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
    imageSrc: '/images/money-claim-selector.webp',
    imageAlt: 'Recover unpaid rent bills or damage situation card',
    accent: 'emerald',
    routeIntent: 'recover_debt',
    product: 'money_claim',
  },
  {
    title: 'Need to increase the rent',
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
    imageSrc: '/images/section-13-selector.webp',
    imageAlt: 'Increase the rent situation card',
    accent: 'amber',
    routeIntent: 'increase_rent',
    product: 'section13_standard',
  },
  {
    title: 'Need a tenancy agreement',
    eyebrow: 'Tenancy agreement',
    description:
      'Start here if you are setting up a new tenancy or replacing old paperwork and need the agreement to match the property, occupiers, and let type.',
    whyRoute:
      'This fits when you need the right agreement before the tenancy starts, rather than a generic template that may not match the let.',
    ctaLabel: 'Choose my tenancy agreement',
    href: PUBLIC_PRODUCT_DESCRIPTORS.ast.landingHref,
    imageSrc: '/images/tenancy-agreement-selector.webp',
    imageAlt: 'Need a tenancy agreement situation card',
    accent: 'lavender',
    routeIntent: 'tenancy_agreement',
    product: 'ast',
  },
];

const assistedPrepHomeCards: AssistedPrepHomeCard[] = [
  {
    title: 'Section 8 notice prepared with you',
    eyebrow: 'Unsure about grounds or dates?',
    description:
      'A 20-minute callback to prepare or check the Form 3A notice, service details, and notice file before you serve it.',
    price: '£149',
    href: '/assisted-prep/start?service=section8&product=notice_only&src=homepage_assisted',
    ctaLabel: 'Book Section 8 assisted prep',
    imageSrc: '/images/2%EF%B8%8F%20Unsure%20Compliance.webp',
    imageAlt: 'Landlord checking compliance questions before taking action',
    routeIntent: 'section8_assisted_prep',
    product: 'notice_only',
  },
  {
    title: 'Possession claim pack prepared with you',
    eyebrow: 'Need to act after notice?',
    description:
      'A 45-minute callback to prepare or check N5, N119, service evidence, bundle steps, and the filing pack.',
    price: '£399',
    href: '/assisted-prep/start?service=possession&product=complete_pack&src=homepage_assisted',
    ctaLabel: 'Book possession claim assisted prep',
    imageSrc: '/images/3%EF%B8%8F%20Need%20to%20Act.webp',
    imageAlt: 'Landlord preparing urgent possession claim documents',
    routeIntent: 'possession_assisted_prep',
    product: 'complete_pack',
  },
  {
    title: 'Money claim prepared with you',
    eyebrow: 'Rent, damage, bills, or debt?',
    description:
      'A 30-minute callback to turn the debt, evidence, pre-action position, and claim wording into a clearer claim pack.',
    price: '£249',
    href: '/assisted-prep/start?service=money_claim&product=money_claim&src=homepage_assisted',
    ctaLabel: 'Book money claim assisted prep',
    imageSrc: '/images/4%EF%B8%8F%20Inherited%20Tenancy%20Admin.webp',
    imageAlt: 'Landlord organising tenancy records and claim evidence',
    routeIntent: 'money_claim_assisted_prep',
    product: 'money_claim',
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
    title: 'Section 8 notice file ready to review',
    body:
      'If notice is the next step, prepare the Section 8 notice, service record, and arrears support without piecing them together yourself.',
    imageSrc: '/images/Section-8-notie-file-ready-to-review.webp',
    imageAlt: 'Section 8 notice file ready to review',
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
    title: 'Court possession paperwork in one file',
    body:
      'When the tenant still has not left, prepare the court forms and supporting evidence as one file.',
    imageSrc: '/images/Court-possession-paperwork-in-one-file.webp',
    imageAlt: 'Court possession paperwork in one file',
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
    title: 'Debt, rent, and tenancy paperwork from the same account',
    body:
      'You can also prepare money claims, rent increase notices, and tenancy agreements from the same account.',
    imageSrc: '/images/Debt-rent-and-tenancy-paperwork-from-the-same-account.webp',
    imageAlt: 'Debt, rent, and tenancy paperwork from the same account',
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

const processSteps: ProcessStep[] = [
  {
    step: '01',
    title: 'Pick the landlord job you need done',
    body:
      'Start with the thing you need to do now: serve notice, go to court, recover money, raise rent, or set up a tenancy.',
    imageSrc: '/images/recover-unpaid-rent.webp',
    imageAlt: 'Recover unpaid rent process step',
  },
  {
    step: '02',
    title: 'Answer the key details',
    body:
      'We ask for the details needed to prepare the right documents and flag issues before you pay or print.',
    imageSrc: '/images/start-eviction.webp',
    imageAlt: 'Answer the key details process step',
  },
  {
    step: '03',
    title: 'Review and download the paperwork',
    body:
      'You get documents that match the task in front of you and are ready to review, save, and print.',
    imageSrc: '/images/create-tenancy-agreements.webp',
    imageAlt: 'Landlord documents and agreements',
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
        'group overflow-hidden rounded-[2rem] border transition duration-200',
        className,
        accentStyles.card,
        accentStyles.borderGlow,
        PUBLIC_LAYOUT_CLASSES.card
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden border-b border-black/5 bg-gradient-to-br from-[#F7F1FF] via-[#FCFAFF] to-[#EEE3FF]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-6">
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
          <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'public-subtle-grid px-6 py-8 md:px-10 md:py-10')}>
            <StaggerReveal className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="public-eyebrow">Choose the right next step</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                  What situation are you dealing with?
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                  Tell us what's happening and we'll show you the next step.
                </p>
                <p className="mt-3 text-sm font-medium leading-7 text-[#6a6280]">
                  Pick the situation that matches your problem. We will take you
                  to the right next step without making you decode legal jargon first.
                </p>
              </div>
                <div className="public-stat-card px-5 py-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                    Landlords rate us
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-bold text-[#1c1431]">
                    <span className="text-[#facc15]" aria-hidden="true">
                      {reviewStars}
                    </span>
                    <span>{REVIEW_RATING}/5</span>
                  </div>
                  <p className="mt-1 text-sm text-[#5d5672]">
                    {formattedReviewCount} live reviews across the product.
                  </p>
                </div>
            </StaggerReveal>

            <TrustPillRow
              className="mt-6"
              items={['For landlords in England', 'Updated for May 2026', 'Preview before payment', 'Fixed price']}
            />

            <StaggerReveal className="mt-8 grid gap-6 xl:grid-cols-3 md:grid-cols-2">
              {routeSelectionCards.map((card) => (
                <RouteSelectionCard key={card.title} {...card} />
              ))}
            </StaggerReveal>

            <section
              className="mt-10 rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,#241447_0%,#4c1d95_55%,#2f174f_100%)] p-6 shadow-[0_24px_70px_rgba(24,10,52,0.24)] md:p-8"
              aria-label="Assisted preparation services"
            >
              <div className="mb-5 max-w-3xl">
                <p className="public-eyebrow">Prefer us to prepare it with you?</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Assisted prep for landlords who want the file checked before they act
                </h2>
                <p className="mt-3 text-base leading-7 text-white/78">
                  Short callback, focused document preparation, and a clear pack for you to approve before serving or filing.
                </p>
              </div>

              <StaggerReveal className="grid gap-5 lg:grid-cols-3">
                {assistedPrepHomeCards.map((card) => (
                  <article
                    key={card.title}
                    className="group overflow-hidden rounded-[1.4rem] border border-white/14 bg-white shadow-[0_18px_50px_rgba(9,4,25,0.22)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#f7f3ff]">
                      <Image
                        src={card.imageSrc}
                        alt={card.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 31vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex min-h-[18rem] flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b3fd1]">
                          {card.eyebrow}
                        </p>
                        <span className="shrink-0 rounded-full bg-[#f1eaff] px-3 py-1 text-sm font-bold text-[#4b1fa3]">
                          {card.price}
                        </span>
                      </div>
                      <h3 className="mt-3 text-xl font-bold leading-tight text-[#1c1431]">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#5d5672]">
                        {card.description}
                      </p>
                      <TrackedLink
                        href={card.href}
                        pagePath="/"
                        pageType="homepage"
                        ctaLabel={card.ctaLabel}
                        ctaPosition="section"
                        eventName="homepage_primary_cta_click"
                        routeIntent={card.routeIntent}
                        product={card.product}
                        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5b21b6]"
                      >
                        {card.ctaLabel}
                        <RiArrowRightLine className="h-4 w-4" />
                      </TrackedLink>
                    </div>
                  </article>
                ))}
              </StaggerReveal>
            </section>
          </div>
        </Container>
      </section>

      <section className="pb-16 pt-4 md:pb-20">
        <Reveal>
          <PremiumImageFrame className="mx-auto max-w-[1672px] rounded-none border-x-0 md:rounded-[2rem] md:border-x">
            <TrackedLink
              href="/wizard"
              pagePath="/"
              pageType="homepage"
              ctaLabel="Clarity section"
              ctaPosition="section"
              eventName="homepage_primary_cta_click"
              routeIntent="wizard"
              className="block w-full"
            >
              <picture>
                <source media="(max-width: 767px)" srcSet="/images/clarity-mobile.webp" />
                <Image
                  src="/images/clarity-desktop.webp"
                  alt="Clarity first. Legal detail second."
                  width={1672}
                  height={941}
                  className="h-auto w-full"
                  sizes="100vw"
                />
              </picture>
            </TrackedLink>
          </PremiumImageFrame>
        </Reveal>
      </section>

      <section className="pb-16 pt-4 md:pb-20">
        <Container>
          <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-10 md:py-10')}>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <span className="public-eyebrow">What you get</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                  See what you will actually get
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                  Each page should make it clear what problem it solves, what you
                  get, and what to do next.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    'Section 8 notice and service files with the key checks up front',
                    'Court and possession files when the case needs to move beyond notice',
                    'Money claim, rent increase, and tenancy paperwork for the rest of the landlord job',
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
                    <div className="relative aspect-[16/12] overflow-hidden border-b border-[#efe5ff]">
                      <Image
                        src={card.imageSrc}
                        alt={card.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 30vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
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

      <section className="pb-16 pt-4 md:pb-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
              <span className="public-eyebrow">How it works</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                Choose the job and get the paperwork moving
              </h2>
              <StaggerReveal className="mt-8 space-y-5">
                {processSteps.map((step) => (
                  <div
                    key={step.step}
                    className="standalone-premium-hover-lift grid gap-4 rounded-[1.8rem] border border-[#efe5ff] bg-white/85 p-4 md:grid-cols-[0.28fr_0.72fr]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.3rem] public-image-frame">
                      <Image
                        src={step.imageSrc}
                        alt={step.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                        Step {step.step}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[#1d1532]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-7 text-[#5a516d]">{step.body}</p>
                    </div>
                  </div>
                ))}
              </StaggerReveal>
            </div>

            <div className={clsx(PUBLIC_LAYOUT_CLASSES.darkPanel, 'px-6 py-8 md:px-8')}>
              <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                Built for landlords in England
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                Made to help landlords act quickly
              </h2>
              <p className="mt-4 text-base leading-8 text-white/78">
                When something needs dealing with, you should be able to find the
                right next step quickly, understand what it covers, and move forward
                without digging through legal jargon.
              </p>
              <div className="mt-8 grid gap-4">
                {[
                  'Section 8 notices, court papers, money claims, rent increases, and tenancy agreements in one place',
                  'Guidance that explains the next step in plain English',
                  'Documents that are easy to review, download, and print',
                ].map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/7 px-4 py-4">
                    <div className="flex items-start gap-3 text-white">
                      <RiCheckLine className="mt-1 h-5 w-5 shrink-0 text-[#d7c2ff]" />
                      <span className="text-sm leading-6 text-white/82">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-16 pt-4 md:pb-20">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'px-6 py-8 md:px-8')}>
              <span className="public-eyebrow">Landlord reviews</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-4xl">
                Trusted by landlords who want the paperwork right first time
              </h2>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="public-stat-card px-5 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                      Rating
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-bold text-[#1c1431] md:text-3xl">
                      <span className="text-[#facc15]" aria-hidden="true">
                        {reviewStars}
                      </span>
                      <span>{REVIEW_RATING}/5</span>
                    </div>
                    <p className="mt-2 text-sm text-[#5d5672]">
                      Average landlord rating across the product.
                    </p>
                  </div>
                <div className="public-stat-card px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                    Reviews
                  </p>
                  <p className="mt-3 text-4xl font-bold text-[#1c1431]">{formattedReviewCount}</p>
                  <p className="mt-2 text-sm text-[#5d5672]">
                    Reviews left by landlords who have used the product.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-[15px] leading-7 text-[#5d5672]">
                When something has gone wrong, landlords want a product that feels
                clear, current, and worth paying for.
              </p>
            </div>

              <Reveal className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'overflow-hidden px-6 py-8 md:px-8')}>
                <PremiumImageFrame className="rounded-[2rem]">
                  <Image
                    src="/images/See-the-product-before-you-commit2.webp"
                    alt="See the product before you commit"
                    width={160}
                    height={158}
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="h-auto w-full"
                  />
                </PremiumImageFrame>
              </Reveal>
          </div>
        </Container>
      </section>

      <section className="pb-18 pt-4 md:pb-24">
        <Container>
          <div className={clsx(PUBLIC_LAYOUT_CLASSES.darkPanel, 'px-6 py-10 text-center md:px-12 md:py-12')}>
            <span className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
              Start now
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Choose the next step and keep the paperwork moving
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/78">
              The job should be obvious before the jargon starts. Start with the
              situation you are dealing with, then move into the right paperwork.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <TrackedLink
                href="#homepage-route-selector"
                pagePath="/"
                pageType="homepage"
                ctaLabel="Choose the right next step"
                ctaPosition="final"
                eventName="homepage_primary_cta_click"
                className="hero-btn-primary"
                onClick={(event) => {
                  if (smoothScrollToHash('#homepage-route-selector')) {
                    event.preventDefault();
                  }
                }}
              >
                Choose the right next step
              </TrackedLink>
            </div>
            <p className="mt-5 text-sm text-white/66">
              For landlords with property in England. Clear next steps, strong checks,
              and documents ready to review and print.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
