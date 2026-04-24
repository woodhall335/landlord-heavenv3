/**
 * HomeContent - Client Component
 *
 * Premium England-first homepage content.
 */

'use client';

import Image from 'next/image';
import { useEffect, type ComponentType } from 'react';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { Container } from '@/components/ui';
import { Hero, TrustBar } from '@/components/landing';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { trackHomepageSelectorView } from '@/lib/analytics';
import {
  getPublicCardAccentClasses,
  PUBLIC_LAYOUT_CLASSES,
} from '@/lib/public-brand';
import { PUBLIC_PRODUCT_DESCRIPTORS } from '@/lib/public-products';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';
import {
  RiArrowRightLine,
  RiCheckLine,
  RiFileCheckLine,
  RiFileTextLine,
  RiFlashlightLine,
  RiHome6Line,
  RiMoneyPoundCircleLine,
  RiScales3Line,
  RiShieldCheckLine,
} from 'react-icons/ri';
import { clsx } from 'clsx';

type RouteCard = {
  title: string;
  eyebrow: string;
  description: string;
  whyRoute: string;
  ctaLabel: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  accent: keyof typeof accentIconByType;
  routeIntent: string;
  product: string;
};

type ValueCard = {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  icon: ComponentType<{ className?: string }>;
};

type PreviewCard = {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  bullets: string[];
};

type WorkflowStep = {
  step: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
};

const reviewCount = getDynamicReviewCount();
const formattedReviewCount = reviewCount.toLocaleString('en-GB');
const reviewSummary = `${REVIEW_RATING}/5 | ${formattedReviewCount} reviews`;

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
    eyebrow: 'Usually start with notice',
    description:
      'Start with the Eviction Notice Generator when you need to serve a Section 8 notice correctly before you move any further.',
    whyRoute:
      'This is the right route when the next practical step is serving notice, checking the grounds, and keeping the arrears file straight.',
    ctaLabel: 'Go to eviction notice route',
    href: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref,
    imageSrc: '/images/tenant-not-paying-rent.webp',
    imageAlt: 'Tenant not paying rent situation card',
    accent: 'amethyst',
    routeIntent: 'tenant_not_paying_rent',
    product: 'notice_only',
  },
  {
    title: 'Tenant will not leave',
    eyebrow: 'Often court-stage, sometimes notice first',
    description:
      'Move into the Complete Eviction Pack when the tenancy problem is already heading toward possession paperwork and court steps. If you have not served notice yet, you may still need to start there first.',
    whyRoute:
      'This is the better route when notice is not the whole job anymore and you need the notice, claim forms, and filing path joined up, while still recognising that some cases begin with notice first.',
    ctaLabel: 'Go to complete eviction route',
    href: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref,
    imageSrc: '/images/tenant-will-not-leave.webp',
    imageAlt: 'Tenant will not leave situation card',
    accent: 'plum',
    routeIntent: 'tenant_will_not_leave',
    product: 'complete_pack',
  },
  {
    title: 'Need to recover unpaid rent, bills, or damage',
    eyebrow: 'Debt recovery route',
    description:
      'Use the Money Claim Pack when the main goal is recovering what is owed, whether the tenant is still there or has already left.',
    whyRoute:
      'This route fits when the debt needs dealing with as a claim, instead of being mixed up with the possession route.',
    ctaLabel: 'Go to money claim route',
    href: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.landingHref,
    imageSrc: '/images/recover-unpaid-money.webp',
    imageAlt: 'Recover unpaid rent bills or damage situation card',
    accent: 'emerald',
    routeIntent: 'recover_debt',
    product: 'money_claim',
  },
  {
    title: 'Need to increase the rent',
    eyebrow: 'Section 13 route',
    description:
      'Use the rent increase route to choose the right Section 13 pack before you generate anything.',
    whyRoute:
      'This is the right route when you need the notice, timing, and supporting paperwork handled properly for an England rent increase.',
    ctaLabel: 'Go to rent increase route',
    href: '/rent-increase',
    imageSrc: '/images/increase-rent.webp',
    imageAlt: 'Increase the rent situation card',
    accent: 'amber',
    routeIntent: 'increase_rent',
    product: 'section13_standard',
  },
  {
    title: 'Need a tenancy agreement',
    eyebrow: 'Agreement route',
    description:
      'Start with the tenancy agreements hub when you need the right agreement for the property, occupiers, and let type in England.',
    whyRoute:
      'This route fits when you are setting up a tenancy or replacing older paperwork and need the correct agreement first time.',
    ctaLabel: 'Go to tenancy agreement route',
    href: PUBLIC_PRODUCT_DESCRIPTORS.ast.landingHref,
    imageSrc: '/images/create-tenancy-agreement.webp',
    imageAlt: 'Need a tenancy agreement situation card',
    accent: 'lavender',
    routeIntent: 'tenancy_agreement',
    product: 'ast',
  },
];

const whyLandlordsUseCards: ValueCard[] = [
  {
    title: 'Start with the step that fits the problem',
    body:
      'We help you work out whether you need a Section 8 notice, court papers, a money claim, a rent increase, or a new tenancy agreement before you lose time on the wrong route.',
    imageSrc: '/images/decision_image.webp',
    imageAlt: 'Landlord deciding the right route',
    icon: RiFlashlightLine,
  },
  {
    title: 'Catch weak spots before they slow you down',
    body:
      'We flag the details that often cause notices, claims, court forms, and rent increase paperwork to go wrong so you can fix them before you serve, file, or send anything.',
    imageSrc: '/images/validation_image.webp',
    imageAlt: 'Landlord validation illustration',
    icon: RiShieldCheckLine,
  },
  {
    title: 'Get paperwork that holds together',
    body:
      'Your paperwork should match the problem you are dealing with, whether that is possession, arrears, a rent increase, or a new tenancy, and it should read like one joined-up file.',
    imageSrc: '/images/what_you_get.webp',
    imageAlt: 'Generated landlord documents and workflow preview',
    icon: RiFileCheckLine,
  },
];

const previewCards: PreviewCard[] = [
  {
    title: 'Section 8 notice file ready to review',
    body:
      'If you need to serve notice, you can work through the key details and prepare the paperwork without jumping between guides, forms, and checklists.',
    imageSrc: '/images/notice_bundles.webp',
    imageAlt: 'Eviction notice generator preview',
    bullets: [
      'Section 8 notice wording',
      'Grounds, dates, and service checks',
      'Ready to review and print',
    ],
  },
  {
    title: 'Court possession paperwork in one file',
    body:
      'When the case has moved beyond notice, you can prepare the main possession forms and keep the next steps together in one place.',
    imageSrc: '/images/complete pack.png',
    imageAlt: 'Court possession pack preview',
    bullets: [
      'Section 8, N5, and N119 together',
      'Built for the England court route',
      'Clear handover from notice to court',
    ],
  },
  {
    title: 'Debt, rent, and tenancy paperwork from the same account',
    body:
      'You can also prepare money claim documents, rent increase paperwork, and tenancy agreements without switching to a different tool.',
    imageSrc: '/images/laptop.webp',
    imageAlt: 'Landlord Heaven product previews on a laptop',
    bullets: [
      'Money claims for rent, damage, and bills',
      'Section 13 / Form 4A rent increase paperwork',
      'Agreements for standard, student, HMO, and lodger lets',
    ],
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    step: '01',
    title: 'Pick the landlord job you need done',
    body:
      'Start with a Section 8 notice, a court pack, a money claim, a rent increase, or a tenancy agreement.',
    imageSrc: '/images/start-eviction.webp',
    imageAlt: 'Landlord starting the right route',
  },
  {
    step: '02',
    title: 'Answer the key details',
    body:
      'We ask for the details needed to prepare the right documents and flag issues before you pay or print.',
    imageSrc: '/images/eviction-timeline.webp',
    imageAlt: 'Guided landlord workflow timeline',
  },
  {
    step: '03',
    title: 'Review and download the paperwork',
    body:
      'You get documents that match the task in front of you and are ready to review, save, and print.',
    imageSrc: '/images/create-tenancy-agreements.webp',
    imageAlt: 'Generated landlord documents and agreements',
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
}: RouteCard) {
  const accentStyles = getPublicCardAccentClasses(accent);
  const Icon = accentIconByType[accent];

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
          className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
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
          <span>{whyRoute}</span>
        </div>
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="public-eyebrow">Choose the right route</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                  What situation are you dealing with?
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                  Tell us what's happening and we'll show you the next step.
                </p>
                <p className="mt-3 text-sm font-medium leading-7 text-[#6a6280]">
                  Pick the situation that matches your problem. We'll route you to
                  the right product — no legal jargon needed.
                </p>
              </div>
              <div className="public-stat-card px-5 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                  Landlords rate us
                </p>
                <p className="mt-2 text-3xl font-bold text-[#1c1431]">
                  {reviewSummary}
                </p>
                <p className="mt-1 text-sm text-[#5d5672]">
                  Based on landlord reviews across the product.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3 md:grid-cols-2">
              {routeSelectionCards.map((card) => (
                <RouteSelectionCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <div className={PUBLIC_LAYOUT_CLASSES.divider} />
        </Container>
      </section>

      <section className="pb-16 pt-4 md:pb-20">
        <Container>
            <div className="mx-auto max-w-3xl text-center">
              <span className="public-eyebrow">Why landlords use us</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                Clarity first. Legal detail second.
              </h2>
              <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                The fastest way to lose momentum is to start the wrong route. We
                keep the next step obvious, then help you tighten the paperwork
                before you serve, file, or send anything.
              </p>
            </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {whyLandlordsUseCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.title}
                  className={clsx(
                    'overflow-hidden rounded-[2rem] border p-6',
                    PUBLIC_LAYOUT_CLASSES.card
                  )}
                >
                  <div className="relative aspect-[16/11] overflow-hidden rounded-[1.7rem] public-image-frame">
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4ebff] text-[#7c3aed]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold leading-tight text-[#1d1532]">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-7 text-[#5a516d]">{card.body}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <div className={PUBLIC_LAYOUT_CLASSES.divider} />
        </Container>
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
                  Each product page should make it clear what it helps with, what
                  the pack includes, and what to do next.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    'Section 8 notices with the key checks up front',
                    'Court forms and guidance when the case needs to move beyond notice',
                    'Money claim, rent increase, and tenancy paperwork for the rest of the landlord job',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-[#2c2143]">
                      <RiCheckLine className="mt-1 h-5 w-5 shrink-0 text-[#7c3aed]" />
                      <span className="text-[15px] leading-7">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {previewCards.map((card) => (
                  <article
                    key={card.title}
                    className={clsx(
                      'overflow-hidden rounded-[1.8rem] border',
                      PUBLIC_LAYOUT_CLASSES.card
                    )}
                  >
                    <div className="relative aspect-[16/12] overflow-hidden border-b border-[#efe5ff]">
                      <Image
                        src={card.imageSrc}
                        alt={card.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 30vw"
                        className="object-cover"
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
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8">
        <Container>
          <div className={PUBLIC_LAYOUT_CLASSES.divider} />
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
              <div className="mt-8 space-y-5">
                {workflowSteps.map((step) => (
                  <div
                    key={step.step}
                    className="grid gap-4 rounded-[1.8rem] border border-[#efe5ff] bg-white/85 p-4 md:grid-cols-[0.28fr_0.72fr]"
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
              </div>
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
                right product quickly, understand what it covers, and move forward
                without digging through legal jargon.
              </p>
              <div className="mt-8 grid gap-4">
                {[
                  'Section 8 notices, court packs, money claims, rent increases, and tenancy agreements in one place',
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

      <section className="py-8">
        <Container>
          <div className={PUBLIC_LAYOUT_CLASSES.divider} />
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
                  <p className="mt-3 text-4xl font-bold text-[#1c1431]">
                    {reviewSummary}
                  </p>
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

            <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'overflow-hidden px-6 py-8 md:px-8')}>
              <div className="grid gap-6 md:grid-cols-[0.48fr_0.52fr] md:items-center">
                <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] public-image-frame">
                  <Image
                    src="/images/laptop.webp"
                    alt="Landlord Heaven product dashboard and documents"
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-[#1d1532]">
                    See the product before you commit
                  </h3>
                  <div className="mt-5 space-y-4">
                    {[
                      'Real sample packs and previews before you buy',
                      'Clear product pages that explain what is included',
                      'A next step that feels obvious from the first screen',
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <RiCheckLine className="mt-1 h-5 w-5 shrink-0 text-[#7c3aed]" />
                        <p className="text-[15px] leading-7 text-[#5d5672]">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
              Choose the route and keep the paperwork moving
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/78">
              The job should be obvious before the jargon starts. Use the route
              selector to move into the right product page for your case.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <TrackedLink
                href="#homepage-route-selector"
                pagePath="/"
                pageType="homepage"
                ctaLabel="Choose the right route"
                ctaPosition="final"
                eventName="homepage_primary_cta_click"
                className="hero-btn-primary"
              >
                Choose the right route
              </TrackedLink>
            </div>
            <p className="mt-5 text-sm text-white/66">
              For landlords with property in England. Clear routes, strong checks,
              and documents ready to review and print.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
