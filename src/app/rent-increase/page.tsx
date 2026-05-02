import type { Metadata } from 'next';
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
      'The main route for landlords who want to increase rent in England with Form 4A, comparable evidence, and a cleaner service-ready file.',
    problemItSolves:
      'Gets the notice, the explanation, and the service record lined up before you serve, instead of treating the increase like a one-form task.',
    riskIfWrong:
      'If you rely on a bare form without settling the figure, dates, and evidence together, the increase is easier to question and harder to defend calmly.',
    landlordOutcome:
      'Best for the normal Section 13 job when you want to move from decision to a supportable rent increase file quickly.',
    href: standardDescriptor.landingHref,
    ctaLabel: 'Open the Standard Section 13 Rent Increase Pack',
  },
  {
    name: 'Challenge-Ready Section 13 Defence Pack',
    priceLabel: PRODUCTS.section13_defensive.displayPrice,
    imageSrc: '/images/rent-increase-defence.webp',
    imageAlt: 'Challenge-ready Section 13 defence pack',
    whatItIs:
      'The fuller challenge-ready route for landlords who expect objections, negotiation pressure, or tribunal scrutiny around the proposed rent.',
    problemItSolves:
      'Adds the stronger bundle structure, response tools, and evidence organisation needed when the case is likely to be tested instead of simply served.',
    riskIfWrong:
      'If challenge risk is already obvious and you start too lightly, you can end up rebuilding the argument and evidence after the tenant has already pushed back.',
    landlordOutcome:
      'Best when the rent level may be disputed and you want the landlord file prepared for that reality from the start.',
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
        'Start with the route that matches the real job. Use the Standard Section 13 Rent Increase Pack for most rent increases, or move straight to the Challenge-Ready Section 13 Defence Pack when challenge risk is already part of the case.',
      feature:
        'Built for landlords who want the notice, evidence, and service record to hold together before the tenant ever reads the increase.',
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
              href={standardDescriptor.landingHref}
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="Open the Standard Section 13 Rent Increase Pack"
              ctaPosition="hero"
              eventName="entry_page_primary_cta_click"
              routeIntent="rent_increase"
              product="section13_standard"
              className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
            >
              Open the Standard Section 13 Rent Increase Pack
            </TrackedLink>
          </div>
          <div className="w-full sm:w-auto">
            <TrackedLink
              href={defenceDescriptor.landingHref}
              pagePath="/rent-increase"
              pageType="entry_page"
              ctaLabel="See the challenge-ready defence route"
              ctaPosition="hero"
              eventName="entry_page_secondary_cta_click"
              routeIntent="rent_increase"
              product="section13_defensive"
              className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
            >
              See the challenge-ready defence route
            </TrackedLink>
          </div>
        </>
      ),
      children: (
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          <li>Built for the current England Section 13 route using Form 4A.</li>
          <li>Lets landlords choose between the normal increase route and the stronger challenge-ready defence route.</li>
          <li>Keeps the long-form guide available without making every visitor read it first.</li>
        </ul>
      ),
    },
    whatYouGet: {
      title: 'Choose the Section 13 route that fits the case',
      intro:
        'This page is built for action, not just explanation. Pick the Standard Section 13 Rent Increase Pack when you want the main rent increase workflow, or choose the Challenge-Ready Section 13 Defence Pack when the file needs to stand up under stronger tenant challenge from the start.',
      routeGridClassName: 'mt-8 grid gap-6 lg:grid-cols-2',
      routeCards,
    },
    whyYouNeedThis: {
      title: 'Why this converts better than a guide-first page',
      intro:
        'Landlords searching for rent increase help usually need one of two things: a straightforward Section 13 workflow, or a stronger route for challenge-heavy cases. Sending both groups into a long guide first slows the decision instead of clarifying it.',
      cards: [
        {
          title: 'Broad intent still needs a concrete next step',
          body:
            'A landlord searching for rent increase support is usually close to action. Showing the two real product routes early removes friction and stops the CTA getting buried under explanation.',
        },
        {
          title: 'Form 4A alone is not the real buying decision',
          body:
            'The decision is whether the landlord needs the standard service-ready file or the fuller challenge-ready defence file. Once that choice is clear, the rest of the page can sell the outcome more honestly.',
        },
        {
          title: 'The guide still matters, but as a secondary path',
          body:
            'Keeping the longer guide available is useful for cautious landlords, but it should support the conversion path rather than replace it.',
        },
      ],
    },
    howThisHelps: {
      title: 'How this helps the landlord outcome',
      intro:
        'The page is designed to narrow the choice fast, reduce uncertainty around the product fit, and move landlords into the right workflow without losing the educational content entirely.',
      cards: [
        {
          title: 'It gives most landlords a clear default start',
          body:
            'The Standard Section 13 Rent Increase Pack remains the main starting point, with a direct CTA into the wizard for the common case.',
        },
        {
          title: 'It catches harder cases earlier',
          body:
            'Landlords who already expect pushback can move straight into the Challenge-Ready Section 13 Defence Pack instead of discovering too late that they needed the heavier route.',
        },
        {
          title: 'It still supports research-led visitors',
          body:
            'The guide stays live under /products so landlords who want the longer explanation can still read it without slowing the core sales flow.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'The route is intentionally simple: choose the level of support you need, generate the file, and keep the paperwork joined up from the first draft.',
      steps: [
        {
          step: 'Step 01',
          title: 'Choose the right Section 13 route',
          body:
            'Start with the Standard Section 13 Rent Increase Pack for most cases, or move to the Challenge-Ready Section 13 Defence Pack if challenge or tribunal risk is already shaping the job.',
        },
        {
          step: 'Step 02',
          title: 'Add the tenancy details, figures, and evidence',
          body:
            'Work through the rent, dates, property details, comparables, and service inputs so the paperwork reads as one planned landlord file.',
        },
        {
          step: 'Step 03',
          title: 'Generate the pack that matches the risk',
          body:
            'Review the outputs, then serve or prepare for challenge with the route that fits what is actually happening in the case.',
        },
      ],
    },
    cta: {
      title: 'Start with the route that matches the real case',
      body:
        'If this is a normal rent increase, start the Standard Section 13 Rent Increase Pack now. If challenge risk is already obvious, open the Challenge-Ready Section 13 Defence Pack instead. If you still want the longer explanation first, the full guide is still available.',
      primary: {
        label: 'Start the Standard Section 13 Rent Increase Pack',
        href: standardDescriptor.landingHref,
      },
      secondary: {
        label: 'Open the Challenge-Ready Defence Pack',
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
