/**
 * HomeContent - Client Component
 *
 * Premium England-first homepage content.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ComponentType } from 'react';
import { Container } from '@/components/ui';
import { Hero, TrustBar } from '@/components/landing';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
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
  outcome: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  accent: keyof typeof accentIconByType;
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
const reviewSummary = `${REVIEW_RATING}/5 | ${reviewCount} reviews`;

const accentIconByType = {
  amethyst: RiFileTextLine,
  plum: RiScales3Line,
  emerald: RiMoneyPoundCircleLine,
  amber: RiFlashlightLine,
  lavender: RiHome6Line,
};

const routeSelectionCards: RouteCard[] = [
  {
    title: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.shortName,
    eyebrow: 'Serve the notice first',
    description:
      'Generate the current England Section 8 notice with checks on grounds, dates, service, and compliance before you serve anything.',
    outcome: 'Best when the immediate job is getting the notice right.',
    href: PUBLIC_PRODUCT_DESCRIPTORS.notice_only.landingHref,
    imageSrc: '/images/notice_bundles.webp',
    imageAlt: 'Section 8 notice document preview',
    accent: 'amethyst',
  },
  {
    title: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.shortName,
    eyebrow: 'Prepare for court',
    description:
      'Move from notice to N5, N119, and the possession claim route in one workflow built for landlords in England.',
    outcome: 'Best when you want the notice and court paperwork joined up.',
    href: PUBLIC_PRODUCT_DESCRIPTORS.complete_pack.landingHref,
    imageSrc: '/images/eviction_packs.webp',
    imageAlt: 'Complete eviction pack preview',
    accent: 'plum',
  },
  {
    title: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.shortName,
    eyebrow: 'Recover what is owed',
    description:
      'Recover unpaid rent, bills, damage, and guarantor debt with a clearer England money claim route.',
    outcome: 'Best when the money issue needs dealing with separately from possession.',
    href: PUBLIC_PRODUCT_DESCRIPTORS.money_claim.landingHref,
    imageSrc: '/images/money_claims.webp',
    imageAlt: 'Money claim pack preview',
    accent: 'emerald',
  },
  {
    title: 'Rent Increase',
    eyebrow: 'Increase the rent properly',
    description:
      'Use the Section 13 and Form 4A route with clearer support notes, timing checks, and landlord-facing guidance.',
    outcome: 'Best when you need a lawful England rent increase file.',
    href: '/rent-increase',
    imageSrc: '/images/Statutory-change.webp',
    imageAlt: 'Rent increase support illustration',
    accent: 'amber',
  },
  {
    title: PUBLIC_PRODUCT_DESCRIPTORS.ast.shortName,
    eyebrow: 'Put the right agreement in place',
    description:
      'Choose the right England tenancy agreement for Standard, Premium, Student, HMO / Shared House, or Lodger use.',
    outcome: 'Best when you want the paperwork sorted before problems start.',
    href: PUBLIC_PRODUCT_DESCRIPTORS.ast.landingHref,
    imageSrc: '/images/tenancy_agreements.webp',
    imageAlt: 'England tenancy agreement product preview',
    accent: 'lavender',
  },
];

const whyLandlordsUseCards: ValueCard[] = [
  {
    title: 'Start with the route that matches the real problem',
    body:
      'If the tenant is not paying, will not leave, is disputing the rent, or you need new paperwork in place, we help you choose the right England route before you lose time on the wrong document.',
    imageSrc: '/images/decision_image.webp',
    imageAlt: 'Landlord deciding the right route',
    icon: RiFlashlightLine,
  },
  {
    title: 'Catch the issues that can slow the case down',
    body:
      'We surface the points that commonly derail notices, court packs, claims, and rent increase files so you are less likely to redo the work after serving or filing.',
    imageSrc: '/images/validation_image.webp',
    imageAlt: 'Landlord validation illustration',
    icon: RiShieldCheckLine,
  },
  {
    title: 'Keep the paperwork joined up from the start',
    body:
      'The strongest landlord journeys are the ones where the notice, court papers, money claim, rent increase file, or agreement all match the task in front of you and are ready to print.',
    imageSrc: '/images/what_you_get.webp',
    imageAlt: 'Generated landlord documents and workflow preview',
    icon: RiFileCheckLine,
  },
];

const previewCards: PreviewCard[] = [
  {
    title: 'Eviction notice output that stays focused on Section 8',
    body:
      'The notice route is written for landlords who need to serve now, with supporting guidance kept close to the document instead of scattered across separate pages.',
    imageSrc: '/images/notice_bundles.webp',
    imageAlt: 'Eviction notice generator preview',
    bullets: [
      'Section 8-led wording and checks',
      'Grounds, dates, and service surfaced early',
      'Designed to be ready to print tonight',
    ],
  },
  {
    title: 'Court possession workflow with the next documents in view',
    body:
      'The court route is for landlords who want the notice, forms, and next filing steps working together instead of being pieced together manually.',
    imageSrc: '/images/complete pack.png',
    imageAlt: 'Court possession pack preview',
    bullets: [
      'Notice, N5, and N119 in one flow',
      'Built for the current England route',
      'Clearer handoff from notice to court',
    ],
  },
  {
    title: 'Agreement, rent, and debt routes built around real landlord jobs',
    body:
      'Not every problem is possession. The rest of the product set stays just as practical, whether you need a money claim, a rent increase file, or the right agreement for a new let.',
    imageSrc: '/images/laptop.webp',
    imageAlt: 'Landlord Heaven product previews on a laptop',
    bullets: [
      'Money claims for rent, damage, and bills',
      'Section 13 support for England rent increases',
      'Five live tenancy agreement routes',
    ],
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    step: '01',
    title: 'Choose the landlord task',
    body:
      'Start with the job in front of you: serve notice, prepare for court, recover debt, increase the rent, or create the right agreement.',
    imageSrc: '/images/start-eviction.webp',
    imageAlt: 'Landlord starting the right route',
  },
  {
    step: '02',
    title: 'Answer guided questions in plain English',
    body:
      'The questions are there to keep the route clear and reduce the risk of missing something important before you pay or print.',
    imageSrc: '/images/eviction-timeline.webp',
    imageAlt: 'Guided landlord workflow timeline',
  },
  {
    step: '03',
    title: 'Generate documents that match the route',
    body:
      'You end up with paperwork that matches the task, speaks to the right process, and is easier to rely on when you need to act quickly.',
    imageSrc: '/images/create-tenancy-agreements.webp',
    imageAlt: 'Generated landlord documents and agreements',
  },
];

function RouteSelectionCard({
  title,
  eyebrow,
  description,
  outcome,
  href,
  imageSrc,
  imageAlt,
  accent,
}: RouteCard) {
  const accentStyles = getPublicCardAccentClasses(accent);
  const Icon = accentIconByType[accent];

  return (
    <Link
      href={href}
      className={clsx(
        'group overflow-hidden rounded-[2rem] border transition duration-200',
        accentStyles.card,
        accentStyles.borderGlow,
        PUBLIC_LAYOUT_CLASSES.card
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden border-b border-black/5">
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
          <span>{outcome}</span>
        </div>
        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#4f2a96]">
          View route
          <RiArrowRightLine className="h-4 w-4 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function HomeContent() {
  return (
    <div className={PUBLIC_LAYOUT_CLASSES.page}>
      <HeaderConfig mode="autoOnScroll" />
      <Hero />
      <TrustBar />

      <section className="py-14 md:py-18">
        <Container>
          <div className={clsx(PUBLIC_LAYOUT_CLASSES.section, 'public-subtle-grid px-6 py-8 md:px-10 md:py-10')}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <span className="public-eyebrow">Choose what you need help with</span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                  Start with the problem you need to sort out
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                  Whether you need to serve notice, go to court, recover money,
                  increase the rent, or put a new agreement in place, you can start
                  with the right product here.
                </p>
              </div>
              <div className="public-stat-card px-5 py-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                  Rated by landlords
                </p>
                <p className="mt-2 text-3xl font-bold text-[#1c1431]">
                  {reviewSummary}
                </p>
                <p className="mt-1 text-sm text-[#5d5672]">
                  The same live review count shown across the site.
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
              Clear next steps matter when a tenancy starts going wrong
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5d5672]">
              When a tenant stops paying, refuses to leave, or the paperwork needs
              sorting, landlords want to know what to do next and how to get the
              documents right first time.
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
                  Everything should feel clear from the first click
                </h2>
                <p className="mt-4 text-lg leading-8 text-[#5d5672]">
                  You should be able to see what each product does, what paperwork
                  it gives you, and what to do next without second-guessing which
                  page you are on.
                </p>
                <div className="mt-6 space-y-4">
                  {[
                    'Section 8 notice generation with the key checks up front',
                    'A full court pack when you need to move beyond the notice',
                    'Money claim, rent increase, and tenancy products that stay easy to understand',
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
              <span className="public-eyebrow">How it works in England</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-5xl">
                Choose the job, answer a few questions, and get the right paperwork
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
                Make the next step clear and the paperwork easier to trust
              </h2>
              <p className="mt-4 text-base leading-8 text-white/78">
                If you need to act tonight, you should be able to find the right
                product quickly, understand what it does, and move straight into it
                without second-guessing yourself.
              </p>
              <div className="mt-8 grid gap-4">
                {[
                  'Straightforward product names that match what landlords search for',
                  'Page copy and calls to action that promise one clear outcome',
                  'A polished experience that still feels quick and easy to use',
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
              <span className="public-eyebrow">Proof and trust</span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#1c1431] md:text-4xl">
                Landlords buy when the product feels clear and dependable
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="public-stat-card px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                    Live rating
                  </p>
                  <p className="mt-3 text-4xl font-bold text-[#1c1431]">
                    {reviewSummary}
                  </p>
                  <p className="mt-2 text-sm text-[#5d5672]">
                    The same rating and review count shown in the hero trust pill.
                  </p>
                </div>
                <div className="public-stat-card px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b3fd1]">
                    Reviews
                  </p>
                  <p className="mt-3 text-4xl font-bold text-[#1c1431]">{reviewCount}</p>
                  <p className="mt-2 text-sm text-[#5d5672]">
                    A live count pulled from the same review counter used across the
                    rest of the site.
                  </p>
                </div>
              </div>
              <p className="mt-6 text-[15px] leading-7 text-[#5d5672]">
                Good trust copy should reassure landlords quickly: the product looks
                credible, the wording matches the job they need done, and the
                documents feel worth paying for.
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
                    Landlords should know what they will get within a few seconds
                  </h3>
                  <div className="mt-5 space-y-4">
                    {[
                      'Each page should say what it helps you do within the first few lines.',
                      'The imagery should show the product, the documents, or the workflow.',
                      'The call to action should feel like the sensible next step, not a hard sell.',
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
              Start tonight
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Choose the route that fits the tenancy problem and move forward
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/78">
              Whether you need a Section 8 notice, the full court possession route,
              a money claim, a rent increase file, or the right agreement for a new
              let, the next step should feel clear from the first screen.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/wizard?topic=eviction&src=seo_homepage" className="hero-btn-primary">
                Start with the right route
              </Link>
              <Link href="/pricing" className="hero-btn-secondary">
                View pricing
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/66">
              Built for landlords with property in England. Clearer routes, stronger
              checks, and documents ready to print.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
