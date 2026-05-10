import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import { RentIncreaseChallengeChecker } from '@/components/tools/rent-checker';
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
  title: 'Increase Rent in England | Section 13 / Form 4A Packs for Landlords',
  description:
    'Increase rent in England using Section 13 and Form 4A. Start the Standard Section 13 Rent Increase Pack or choose the Challenge-Ready Section 13 Defence Pack when challenge risk is already part of the case.',
  keywords: [
    'increase rent england',
    'section 13 notice',
    'form 4a rent increase',
    'rent increase section 13',
    'rent increase landlord pack',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Increase Rent in England | Section 13 / Form 4A Packs for Landlords',
    description:
      'Choose the Section 13 route that fits the case, from the Standard Section 13 Rent Increase Pack to the Challenge-Ready Section 13 Defence Pack.',
    url: canonicalUrl,
  },
};

const routeCards: ProductSalesRouteCard[] = [
  {
    name: 'Standard Section 13 Rent Increase Pack',
    priceLabel: PRODUCTS.section13_standard.displayPrice,
    imageSrc: '/images/rent-increase-standard.webp',
    imageAlt: 'Standard Section 13 rent increase pack',
    whatItIs:
      'For landlords who want to serve a Section 13 rent increase in England with Form 4A, market evidence, and a record of service prepared together.',
    problemItSolves:
      'Helps you get the figure, dates, notice, explanation, and service steps right before the tenant receives anything.',
    riskIfWrong:
      'A bare form with weak dates or no evidence can invite questions, delays, or a challenge that is harder to answer.',
    landlordOutcome:
      'Best when the increase is straightforward and you want a clear, service-ready pack.',
    href: standardDescriptor.landingHref,
    ctaLabel: 'Open the Standard Section 13 Rent Increase Pack',
  },
  {
    name: 'Challenge-Ready Section 13 Defence Pack',
    priceLabel: PRODUCTS.section13_defensive.displayPrice,
    imageSrc: '/images/rent-increase-defence.webp',
    imageAlt: 'Challenge-ready Section 13 defence pack',
    whatItIs:
      'For landlords who already expect the proposed rent to be disputed, or who want a stronger file before serving.',
    problemItSolves:
      'Organises the evidence, response notes, and tribunal-ready material around the rent figure from the start.',
    riskIfWrong:
      'If challenge risk is obvious and you start with a light file, you may have to rebuild the evidence after the tenant objects.',
    landlordOutcome:
      'Best when you want to be ready for questions, negotiation, or tribunal scrutiny.',
    href: defenceDescriptor.landingHref,
    ctaLabel: 'Open the Challenge-Ready Defence Pack',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Which Section 13 route should most landlords start with?',
    answer:
      'Most landlords should start with the Standard Section 13 Rent Increase Pack. It is the main route for serving the increase properly with Form 4A, market evidence, and service records kept together.',
  },
  {
    question: 'When should I choose the Challenge-Ready Section 13 Defence Pack instead?',
    answer:
      'Choose the Challenge-Ready Section 13 Defence Pack when challenge risk is already part of the picture, for example where the tenant is likely to dispute the figure or you want the fuller tribunal-facing preparation from the start.',
  },
  {
    question: 'Is this only for England?',
    answer:
      'Yes. These Section 13 routes are built for landlords increasing rent in England. Other UK nations use different frameworks.',
  },
  {
    question: 'Do both routes use Form 4A?',
    answer:
      'Yes. Both routes are built around the England Section 13 / Form 4A process, but the Challenge-Ready Section 13 Defence Pack adds stronger challenge and tribunal-preparation support around that core route.',
  },
  {
    question: 'Can I still read the longer guide first?',
    answer:
      'Yes. The longer rent increase guide is still available if you want the full step-by-step explanation before you pick a route.',
  },
  {
    question: 'Can I check whether the figure looks supportable before I choose a pack?',
    answer:
      'Yes. The free Rent Increase & Challenge Checker lets landlords compare the current and proposed rent against live local comparables before moving into the Standard or Defence Section 13 route.',
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
      trustText: 'England Section 13 / Form 4A packs | choose the right route',
      title: 'Increase rent in England using Section 13 / Form 4A',
      subtitle:
        'Choose the route that fits what is happening with the tenancy. Use the Standard Section 13 Rent Increase Pack for a normal rent increase, or choose the Challenge-Ready Section 13 Defence Pack if you already expect pushback.',
      feature:
        'Built for landlords who want Form 4A, the rent figure, the evidence, and the service record to line up before anything is served.',
      mediaSrc: '/images/wizard-icons/41-rent.png',
      mediaAlt: 'Section 13 rent increase workflow',
      showReviewPill: true,
      reviewPillLayout: 'stacked',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'section13',
      actionsSlot: (
        <>
          <div className="w-full sm:w-auto">
            <TrackedLink
              href="#rent-increase-checker"
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="Check rent increase risk"
              ctaPosition="hero"
              eventName="entry_page_primary_cta_click"
              routeIntent="rent_increase"
              className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
            >
              Check rent increase risk
            </TrackedLink>
          </div>
          <div className="w-full sm:w-auto">
            <TrackedLink
              href={standardDescriptor.landingHref}
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="Generate Section 13 pack"
              ctaPosition="hero"
              eventName="entry_page_secondary_cta_click"
              routeIntent="rent_increase"
              product="section13_standard"
              className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
            >
              Generate Section 13 pack
            </TrackedLink>
          </div>
          <div className="w-full sm:w-auto">
            <TrackedLink
              href={defenceDescriptor.landingHref}
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="Prepare for tenant challenge"
              ctaPosition="hero"
              eventName="entry_page_secondary_cta_click"
              routeIntent="rent_increase"
              product="section13_defensive"
              className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
            >
              Prepare for tenant challenge
            </TrackedLink>
          </div>
        </>
      ),
      children: (
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          <li>Built for the current England Section 13 route using Form 4A.</li>
          <li>Helps you choose between a straightforward increase and a stronger file for a likely challenge.</li>
          <li>Keeps the notice, market evidence, and service notes together in one landlord file.</li>
          <li>
            Not sure which route fits yet?{' '}
            <TrackedLink
              href="#rent-increase-checker"
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="Use the free rent checker first"
              ctaPosition="hero"
              eventName="entry_page_secondary_cta_click"
              routeIntent="rent_increase"
              className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white"
            >
              Use the free rent checker first.
            </TrackedLink>
          </li>
        </ul>
      ),
    },
    postHeroContent: (
      <RentIncreaseChallengeChecker
        mode="embedded"
        sourcePage="/rent-increase"
        ctaPosition="top"
        introTitle="Check how likely your rent increase is to be challenged"
        introCopy="Use the checker before you serve Form 4A. It compares your proposed rent with local market evidence, shows the challenge risk, and recommends the Standard or Defence Section 13 route."
      />
    ),
    whatYouGet: {
      title: 'Pick the right Section 13 pack',
      intro:
        'If the increase is straightforward, the Standard pack is the natural starting point. If you expect the tenant to challenge the figure, use the Challenge-Ready pack so the evidence is stronger from the beginning.',
      routeGridClassName: 'mt-8 grid gap-6 lg:grid-cols-2',
      routeCards,
    },
    whyYouNeedThis: {
      title: 'Get the notice right before it goes out',
      intro:
        'A rent increase is easier to explain when the form, figures, dates, and evidence all tell the same story. The pack helps you prepare that before the tenant receives the notice.',
      cards: [
        {
          title: 'Do not treat it as just a form',
          body:
            'Form 4A matters, but so do the proposed rent, the start date, the tenancy details, and the evidence behind the figure. Those details need to work together.',
        },
        {
          title: 'Match the pack to the level of risk',
          body:
            'If the increase is straightforward, the standard route is usually enough. If the tenant has already objected, the proposed rent is sensitive, or you expect a tribunal challenge, start with the stronger defence route.',
        },
        {
          title: 'Check the rent range first if you are unsure',
          body:
            'Use the free checker if you want to see how the proposed rent compares with local evidence before choosing a pack.',
        },
      ],
    },
    howThisHelps: {
      title: 'What this helps you do',
      intro:
        'Serve the right notice, keep a record of how it was served, and have a sensible explanation ready if the tenant asks why the rent is increasing.',
      cards: [
        {
          title: 'Start with the standard route for a normal increase',
          body:
            'For an ordinary rent increase, start with the Standard Section 13 Rent Increase Pack. It gives you the Form 4A workflow, evidence notes, and service record without overcomplicating the job.',
        },
        {
          title: 'Use the stronger route when pushback is likely',
          body:
            'If challenge risk is already obvious, the Challenge-Ready Section 13 Defence Pack helps you prepare the evidence before the tenant pushes back.',
        },
        {
          title: 'Read the guide if you want the rules first',
          body:
            'The longer guide is still available if you want to understand the rules first. You can read it, run the checker, or move straight into the pack that fits your case.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'Answer the questions once, add the rent figure and evidence, then generate the pack that matches the situation.',
      steps: [
        {
          step: 'Step 01',
          title: 'Choose the right Section 13 route',
          body:
            'Use the Standard Section 13 Rent Increase Pack for most increases. Choose the Challenge-Ready Section 13 Defence Pack if the tenant is likely to dispute the rent or the evidence needs to be stronger from day one.',
        },
        {
          step: 'Step 02',
          title: 'Add the tenancy details, figures, and evidence',
          body:
            'Enter the current rent, proposed rent, key dates, property details, comparable rents, and service method so the notice is prepared around the actual tenancy.',
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
        'For a normal rent increase, start the Standard Section 13 Rent Increase Pack. If the tenant is likely to challenge the figure, start with the Challenge-Ready Section 13 Defence Pack. If you are still unsure, check the rent range first.',
      primary: {
        label: 'Start the Standard Section 13 Rent Increase Pack',
        href: standardDescriptor.landingHref,
      },
      secondary: {
        label: 'Open the Challenge-Ready Defence Pack',
        href: defenceDescriptor.landingHref,
      },
      guideLinks: [
        { label: 'Check the supportable rent range first', href: '#rent-increase-checker' },
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
