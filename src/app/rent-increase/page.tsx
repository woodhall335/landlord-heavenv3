import type { Metadata } from 'next';
import Image from 'next/image';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import type {
  ProductSalesPageContent,
  ProductSalesRouteCard,
} from '@/lib/marketing/product-sales-content';
import { PRODUCTS } from '@/lib/pricing/products';
import { getPublicProductDescriptor } from '@/lib/public-products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, pricingItemListSchema } from '@/lib/seo/structured-data';

const standardDescriptor = getPublicProductDescriptor('section13_standard')!;
const defenceDescriptor = getPublicProductDescriptor('section13_defensive')!;
const canonicalUrl = getCanonicalUrl('/rent-increase');

export const metadata: Metadata = {
  title: 'Check Rent Increase Supportability | Section 13 / Form 4A Packs',
  description:
    'Check whether an England rent increase is supportable before serving Form 4A, using current local market comparables, evidence strength, and challenge-risk routing.',
  keywords: [
    'increase rent england',
    'section 13 notice',
    'form 4a rent increase',
    'rent increase section 13',
    'rent increase landlord pack',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Check Rent Increase Supportability | Section 13 / Form 4A Packs',
    description:
      'Compare the proposed rent with current local advertised rents, then choose the Supported or Tribunal-Ready Section 13 pack.',
    url: canonicalUrl,
  },
};

const routeCards: ProductSalesRouteCard[] = [
  {
    name: 'Supported Rent Increase Pack',
    priceLabel: PRODUCTS.section13_standard.displayPrice,
    imageSrc: '/images/rent-increase-standard.webp',
    imageAlt: 'Supported Section 13 rent increase pack',
    whatItIs:
      'For landlords who want to serve a market-supported Form 4A with current comparable evidence and a service record.',
    problemItSolves:
      'Helps you check current rent, proposed rent, timing, nearby advertised comparables, and service readiness before the tenant receives anything.',
    riskIfWrong:
      'A bare form with weak dates or no evidence can invite questions, delays, or a challenge that is harder to answer.',
    landlordOutcome:
      'Best when the increase looks supportable and you want a clear, service-ready evidence file.',
    href: standardDescriptor.landingHref,
    ctaLabel: 'Open the Supported Rent Increase Pack',
  },
  {
    name: 'Tribunal-Ready Rent Increase Pack',
    priceLabel: PRODUCTS.section13_defensive.displayPrice,
    imageSrc: '/images/rent-increase-defence.webp',
    imageAlt: 'Tribunal-ready Section 13 rent increase pack',
    whatItIs:
      'For landlords who already expect the proposed rent to be disputed, or who want a stronger file before serving.',
    problemItSolves:
      'Organises the evidence, response notes, legal briefing, condition comparison, and tribunal-ready material around the rent figure from the start.',
    riskIfWrong:
      'If challenge risk is obvious and you start with a light file, you may have to rebuild the evidence after the tenant objects.',
    landlordOutcome:
      'Best when you want to be ready for questions, negotiation, or tribunal scrutiny.',
    href: defenceDescriptor.landingHref,
    ctaLabel: 'Open the Tribunal-Ready Rent Increase Pack',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Which Section 13 route should most landlords start with?',
    answer:
      'Most landlords should start with the Supported Rent Increase Pack. It is the main route for serving a market-supported increase with Form 4A, current comparable evidence, a rent summary, cover letter, and service record kept together.',
  },
  {
    question: 'When should I choose the Tribunal-Ready Rent Increase Pack instead?',
    answer:
      'Choose the Tribunal-Ready Rent Increase Pack when challenge risk is already part of the picture, for example where the tenant is likely to dispute the figure or you want the fuller tribunal-facing preparation from the start.',
  },
  {
    question: 'Is this only for England?',
    answer:
      'Yes. These Section 13 routes are built for landlords increasing rent in England. Other UK nations use different frameworks.',
  },
  {
    question: 'Do both routes use Form 4A?',
    answer:
      'Yes. Both routes are built around the England Section 13 / Form 4A process, but the Tribunal-Ready Rent Increase Pack adds stronger challenge and tribunal-preparation support around that core route.',
  },
  {
    question: 'Can I still read the longer guide first?',
    answer:
      'Yes. The longer rent increase guide is still available if you want the full step-by-step explanation before you pick a route.',
  },
];

export default function RentIncreaseLandingPage() {
  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: '/rent-increase',
      pageType: 'entry_page',
      routeIntent: 'rent_increase',
    },
    hero: {
      preset: standardDescriptor.heroPreset,
      badge: standardDescriptor.heroBadge,
      trustText: 'England Section 13 / Form 4A packs | current market comparables | post-1 May 2026 rules',
      title: 'Check whether your rent increase is likely to stand up before you serve Form 4A',
      subtitle:
        'Check the current rent, proposed rent, estimated market range, evidence strength, and challenge risk using current advertised rents for similar homes nearby, then choose the right Section 13 pack.',
      feature:
        'Prepare a market-supported rent increase file, not just a notice.',
      mediaSrc: '/images/increase-rent-hero.webp',
      mediaAlt: 'Section 13 rent increase workflow',
      showReviewPill: true,
      reviewPillLayout: 'stacked',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'section13',
      actionsSlot: (
        <>
          <div className="w-full sm:w-auto">
            <TrackedLink
              href={standardDescriptor.landingHref}
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="Check my rent increase"
              ctaPosition="hero"
              eventName="entry_page_primary_cta_click"
              routeIntent="rent_increase"
              product="section13_standard"
              className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
            >
              Check my rent increase
            </TrackedLink>
          </div>
          <div className="w-full sm:w-auto">
            <TrackedLink
              href={defenceDescriptor.landingHref}
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="Compare the packs"
              ctaPosition="hero"
              eventName="entry_page_secondary_cta_click"
              routeIntent="rent_increase"
              product="section13_defensive"
              className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
            >
              Compare the packs
            </TrackedLink>
          </div>
        </>
      ),
      children: (
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          <li>Built for England's Section 13 process using Form 4A under the post-1 May 2026 rules.</li>
          <li>See how the proposed rent compares with current local advertised rents before serving.</li>
          <li>Keep the notice, market evidence, rent summary, and service notes in one organised file.</li>
        </ul>
      ),
    },
    postHeroContent: (
      <div className="rounded-[2.25rem] border border-[#E8E1F8] bg-[#FCFAFF] p-6 shadow-[0_18px_46px_rgba(24,11,49,0.06)] md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
              Market intelligence preview
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17142B] md:text-4xl">
              See whether the figure is supportable before the notice goes out
            </h2>
            <p className="mt-4 text-base leading-8 text-[#4B5565] md:text-lg">
              The workflow reviews current local market listings and recent comparable rental evidence so you can see whether the proposed rent looks explainable before Form 4A is served.
            </p>
          </div>
          <div className="rounded-[2rem] border border-[#D8C8FF] bg-white p-5 shadow-[0_14px_34px_rgba(24,11,49,0.05)]">
            <Image
              src="/images/rent-increase-overview.webp"
              alt="Rent increase market overview report"
              width={1100}
              height={840}
              className="h-auto w-full rounded-[1.5rem] object-cover"
            />
            <p className="mt-4 text-sm leading-6 text-[#5B5470]">
              Example preview only. The generated file uses the landlord's property details and current comparable advertised rents.
            </p>
          </div>
        </div>
      </div>
    ),
    beforeWhyYouNeedThis: (
      <section className="scroll-mt-24 bg-white py-10 md:py-12" aria-label="Real market data preview">
        <picture>
          <source media="(max-width: 767px)" srcSet="/images/real-market-data-mobile.webp" />
          <Image
            src="/images/real-market-data-desktop.webp"
            alt="Real market rental data report preview"
            width={1920}
            height={980}
            className="h-auto w-full"
          />
        </picture>
      </section>
    ),
    whatYouGet: {
      title: 'Compare the packs',
      intro:
        'Choose the pack by supportability and challenge risk. The Supported pack is for landlords who want to serve a market-supported Form 4A with evidence. The Tribunal-Ready pack is for landlords who expect pushback or want challenge preparation from the start.',
      routeGridClassName: 'mt-8 grid gap-6 lg:grid-cols-2',
      routeCards,
    },
    whyYouNeedThis: {
      title: 'Why landlords use this before serving Form 4A',
      intro:
        'A rent increase is easier to stand behind when the form, figure, dates, advertised-rent evidence, risk notes, and service record all match. This gives you a prepared landlord file before the tenant receives the notice.',
      cards: [
        {
          title: 'Do not treat it as just a form',
          body:
            'Form 4A matters, but so do the proposed rent, the start date, the tenancy details, and the current advertised rents for similar homes nearby. Those details need to work together.',
        },
        {
          title: 'Match the pack to the level of risk',
          body:
            'If the increase is straightforward, the Supported pack is usually enough. If the tenant has already objected, the proposed rent is sensitive, or you expect a tribunal challenge, start with the Tribunal-Ready route.',
        },
        {
          title: 'Keep the explanation ready',
          body:
            'Tenants often ask why the rent is changing. The pack keeps the figure, comparable listings, explanation, and service steps in one place so you can answer calmly and consistently.',
        },
      ],
    },
    howThisHelps: {
      title: 'What this helps you do',
      intro:
        'Serve the right notice, keep a record of how it was served, and have a clear explanation ready if the tenant questions the increase.',
      cards: [
        {
          title: 'Start with the supported route for a normal increase',
          body:
            'For an ordinary rent increase, start with the Supported Rent Increase Pack. It gives you the Form 4A workflow, current comparable evidence, rent summary, cover letter, and service record without overcomplicating the job.',
        },
        {
          title: 'Use the tribunal-ready route when pushback is likely',
          body:
            'If challenge risk is already obvious, the Tribunal-Ready Rent Increase Pack helps you prepare the evidence, response materials, legal briefing, and bundle before the tenant pushes back.',
        },
        {
          title: 'Read the guide if you want the rules first',
          body:
            'The longer guide is still available if you want to understand the rules before choosing a pack. It sits behind the main route instead of getting between you and the paperwork.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'Choose the level of support, enter the tenancy details and rent evidence, review current local comparables, then generate the pack that fits the risk.',
      steps: [
        {
          step: 'Step 01',
          title: 'Check supportability and route fit',
          body:
            'Use the Supported Rent Increase Pack for most increases. Choose the Tribunal-Ready Rent Increase Pack if the tenant is likely to dispute the rent or the evidence needs a tribunal-ready structure from day one.',
        },
        {
          step: 'Step 02',
          title: 'Add the tenancy details, figures, and comparables',
          body:
            'Enter the current rent, proposed rent, key dates, property details, comparable advertised rents, and service method so the notice is prepared around the actual tenancy.',
        },
        {
          step: 'Step 03',
          title: 'Generate the pack that matches the risk',
          body:
            'Review the finished documents, serve the notice, and keep the evidence and service record ready if the tenant asks questions or challenges the increase.',
        },
      ],
    },
    cta: {
      title: 'Start with the route that fits this rent increase',
      body:
        'For a normal rent increase, start with the Supported Rent Increase Pack. If the tenant is likely to challenge the figure, start with the Tribunal-Ready Rent Increase Pack.',
      primary: {
        label: 'Start the Supported Rent Increase Pack',
        href: standardDescriptor.landingHref,
      },
      secondary: {
        label: 'Open the Tribunal-Ready Rent Increase Pack',
        href: defenceDescriptor.landingHref,
      },
      guideLinks: [
        { label: 'Read the long-form guide', href: '/products/rent-increase' },
        { label: 'Section 13 notice guide', href: '/rent-increase/section-13-notice' },
        { label: 'Form 4A guide', href: '/rent-increase/form-4a-guide' },
      ],
    },
    faq: {
      title: 'Rent increase FAQs',
      items: faqs,
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Rent Increase', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={pricingItemListSchema([
          {
            sku: 'section13_standard',
            name: standardDescriptor.displayName,
            description: standardDescriptor.metaDescription,
            url: `https://landlordheaven.co.uk${standardDescriptor.landingHref}`,
          },
          {
            sku: 'section13_defensive',
            name: defenceDescriptor.displayName,
            description: defenceDescriptor.metaDescription,
            url: `https://landlordheaven.co.uk${defenceDescriptor.landingHref}`,
          },
        ])}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
