import type { Metadata } from 'next';
import { TrackedLink } from '@/components/analytics/TrackedLink';
import { astHeroConfig } from '@/components/landing/heroConfigs';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import type {
  ProductSalesPageContent,
  ProductSalesRouteCard,
} from '@/lib/marketing/product-sales-content';
import type { ProductSku } from '@/lib/pricing/products';
import { getPublicProductDescriptor, getPublicTenancyProducts } from '@/lib/public-products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, pricingItemListSchema } from '@/lib/seo/structured-data';

const descriptor = getPublicProductDescriptor('ast')!;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);
const tenancyProducts = getPublicTenancyProducts();

export const metadata: Metadata = {
  title: 'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger, Periodic Guide',
  description:
    'Choose the right England tenancy agreement for Standard, Premium, Student, HMO / Shared House, and Lodger arrangements, with clear support if you searched for a periodic tenancy agreement in England.',
  keywords: [
    'England tenancy agreement',
    'tenancy agreement template england',
    'periodic tenancy agreement england',
    'assured periodic tenancy agreement england',
    'Standard tenancy agreement',
    'Premium tenancy agreement',
    'Student tenancy agreement',
    'HMO tenancy agreement',
    'Lodger agreement',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: 'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger, Periodic Guide',
    description:
      'Compare Standard, Premium, Student, HMO / Shared House, and Lodger agreement options for landlords in England, with periodic-tenancy support routes where needed.',
    url: canonicalUrl,
  },
};

const routeCards: ProductSalesRouteCard[] = [
  {
    name: 'Standard Tenancy Agreement',
    priceLabel:
      tenancyProducts.find((product) => product.key === 'england_standard_tenancy_agreement')
        ?.priceLabel,
    whatItIs: 'The baseline agreement for a straightforward whole-property let in England.',
    problemItSolves:
      'Gives landlords a clean starting point when the tenancy is ordinary and does not need specialist student, shared-house, or resident-landlord wording, including landlords who searched for a periodic tenancy agreement and really need the mainstream England route.',
    riskIfWrong:
      'If you use a more specialist route by mistake, the paperwork becomes more complicated than it needs to be. If you use something older or vaguer, the core tenancy terms can feel too light.',
    landlordOutcome:
      'Gets the tenancy in place with a clear England agreement and the practical setup paperwork most straightforward lets need.',
    href: '/standard-tenancy-agreement',
    ctaLabel: 'Choose the Standard agreement',
  },
  {
    name: 'Premium Tenancy Agreement',
    priceLabel:
      tenancyProducts.find((product) => product.key === 'england_premium_tenancy_agreement')
        ?.priceLabel,
    whatItIs:
      'The more detailed route for ordinary residential lets that need fuller drafting and stronger management wording.',
    problemItSolves:
      'Helps when the landlord wants more detail around access, reporting, inspections, keys, repairs, and hand-back from the outset, while still staying on the ordinary England periodic route.',
    riskIfWrong:
      'If a more involved let is forced into a lighter agreement, avoidable management arguments can start because the paperwork never set expectations clearly enough.',
    landlordOutcome:
      'Gives the landlord a stronger written framework for the day-to-day running of the tenancy without moving into the wrong specialist product.',
    href: '/premium-tenancy-agreement',
    ctaLabel: 'Choose the Premium agreement',
  },
  {
    name: 'Student Tenancy Agreement',
    priceLabel:
      tenancyProducts.find((product) => product.key === 'england_student_tenancy_agreement')
        ?.priceLabel,
    whatItIs: 'The dedicated agreement for student households in England.',
    problemItSolves:
      'Deals more clearly with guarantors, sharers, replacement requests, and end-of-term move-out than a generic residential agreement usually can.',
    riskIfWrong:
      'If a student household is documented as a generic let, the pressure points that matter most often end up under-explained until something goes wrong.',
    landlordOutcome:
      'Gives the landlord a student-focused agreement that matches how the property is really being occupied and managed.',
    href: '/student-tenancy-agreement',
    ctaLabel: 'Choose the Student agreement',
  },
  {
    name: 'HMO / Shared House Tenancy Agreement',
    priceLabel:
      tenancyProducts.find(
        (product) => product.key === 'england_hmo_shared_house_tenancy_agreement'
      )?.priceLabel,
    whatItIs: 'The shared-house route for occupiers living together and using communal areas.',
    problemItSolves:
      'Deals with house rules, communal spaces, sharer expectations, and shared living arrangements more directly than a standard tenancy agreement.',
    riskIfWrong:
      'If a shared house is documented like a straightforward whole-property let, the file can miss the rules that stop everyday shared-living disputes from escalating.',
    landlordOutcome:
      'Helps the landlord run a communal property with paperwork that fits the real shared-house setup.',
    href: '/hmo-shared-house-tenancy-agreement',
    ctaLabel: 'Choose the HMO / Shared House agreement',
  },
  {
    name: 'Lodger Agreement',
    priceLabel:
      tenancyProducts.find((product) => product.key === 'england_lodger_agreement')?.priceLabel,
    whatItIs: 'The room-let agreement for a landlord who lives in the property.',
    problemItSolves:
      'Keeps the resident-landlord arrangement separate from a standard tenancy so shared-home rules and notice expectations are set out properly.',
    riskIfWrong:
      "If a lodger setup is treated like a normal tenancy, the paperwork can mismatch the reality of shared occupation inside the landlord's own home.",
    landlordOutcome:
      'Gives the landlord a clearer room-let agreement that matches the practical reality of a shared-home arrangement.',
    href: '/lodger-agreement',
    ctaLabel: 'Choose the Lodger agreement',
  },
];

const faqs: FAQItem[] = [
  {
    question: 'Who is this page for?',
    answer:
      'It is for landlords putting a tenancy in place for property in England and choosing between the exact agreement products.',
  },
  {
    question: 'Why are there separate Standard, Premium, Student, HMO, and Lodger products?',
    answer:
      'Because each route solves a different tenancy risk. The public pages now match the setup more honestly instead of pretending one agreement suits every kind of let.',
  },
  {
    question: 'Should I still use this if I searched for AST?',
    answer:
      'Yes. If you searched for AST, this is the best place to choose the exact current England agreement that fits the property and the occupiers.',
  },
  {
    question: 'What if I searched for periodic tenancy agreement or assured periodic tenancy agreement?',
    answer:
      'That is still the right kind of search for this England tenancy journey. Use this page to choose the exact agreement product, and use the periodic support guides if you want the terminology explained before you start.',
  },
  {
    question: 'Where do I get the full pack breakdown for each agreement?',
    answer:
      'Use this page to choose the right route, then open the exact product page for the full agreement and document-by-document pack breakdown.',
  },
];

export const runtime = 'nodejs';

export default function EnglandTenancyHubPage() {
  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'tenancy_agreement',
    },
    hero: {
      ...astHeroConfig,
      trustText:
        'England tenancy agreements for landlords | most ordinary whole-property lets should start with Standard',
      title: 'Choose the right England',
      highlightTitle: 'tenancy agreement for the let',
      subtitle:
        'If the tenancy is a straightforward whole-property let, start with Standard. Use Premium when you want fuller drafting, and keep the specialist student, shared-house, and lodger routes for the lets that genuinely need them.',
      primaryCta: {
        label: 'Open Standard Tenancy Agreement',
        href: '/standard-tenancy-agreement',
      },
      secondaryCta: {
        label: 'Open Premium Tenancy Agreement',
        href: '/premium-tenancy-agreement',
      },
    },
    earlyProofBand: {
      priceLabel: `${descriptor.priceLabel} | five agreement routes`,
      valueSummary:
        'Most landlords setting up an ordinary England let should start with Standard. Premium is the stronger secondary route when you want fuller drafting and broader management wording from day one.',
      includedBullets: [
        'Five agreement routes for different England letting setups',
        'Standard is the default for most ordinary whole-property lets',
        'Premium is there when fuller drafting matters',
        'Specialist student, HMO / Shared House, and lodger routes stay separate',
      ],
      bestFor: 'Best if you want the quickest sensible default before comparing the specialist routes below.',
      notFor: 'Not for forcing every let into Standard when the occupiers or setup clearly point to Student, HMO / Shared House, or Lodger.',
      preview: (
        <div className="rounded-[1.8rem] border border-[#E8E1F8] bg-white p-5 shadow-[0_14px_34px_rgba(24,11,49,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6D28D9]">
            Default choice
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#17142B]">
            Most landlords with a straightforward let should start here
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#4B5565] md:text-base">
            Open the Standard agreement first for the ordinary whole-property route. If you already
            know you want fuller drafting and broader management wording, move straight to Premium.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <TrackedLink
              href="/standard-tenancy-agreement"
              pagePath={descriptor.landingHref}
              pageType="product_page"
              ctaLabel="Open Standard Tenancy Agreement"
              ctaPosition="section"
              eventName="entry_page_primary_cta_click"
              routeIntent="tenancy_agreement"
              product="england_standard_tenancy_agreement"
              className="hero-btn-primary flex w-full justify-center text-center"
            >
              Open Standard Tenancy Agreement
            </TrackedLink>
            <TrackedLink
              href="/premium-tenancy-agreement"
              pagePath={descriptor.landingHref}
              pageType="product_page"
              ctaLabel="Open Premium Tenancy Agreement"
              ctaPosition="section"
              eventName="entry_page_secondary_cta_click"
              routeIntent="tenancy_agreement"
              product="england_premium_tenancy_agreement"
              className="hero-btn-secondary flex w-full justify-center text-center"
            >
              Open Premium Tenancy Agreement
            </TrackedLink>
          </div>
        </div>
      ),
    },
    whatYouGet: {
      title: 'Choose the agreement that fits the tenancy',
      intro:
        'Use this page to compare the five agreement routes properly after you have checked the default choice. Standard is the usual ordinary-let start, Premium is the fuller residential route, and the specialist options below are for student, shared-house, and lodger setups that need their own wording.',
      routeCards,
    },
    whyYouNeedThis: {
      title: 'Why you need the right route first',
      intro:
        'Most agreement problems start before the document is generated. They start when the landlord picks a route that does not match the occupiers, the property, or the way the let will actually be managed.',
      cards: [
        {
          title: 'Different lets create different risks',
          body:
            'A student household, a shared house, and a resident-landlord room let are not the same job even if they all look like tenancy paperwork at first glance.',
        },
        {
          title: 'Wrong-route paperwork weakens the file early',
          body:
            'If the agreement does not match the real arrangement, the paperwork can feel vague or misaligned before the tenancy has properly begun.',
        },
        {
          title: 'The exact product pages do the detailed selling',
          body:
            'This comparison page helps you choose. Each exact agreement page then explains the full pack and what every included document is doing for the landlord.',
        },
      ],
    },
    howThisHelps: {
      title: 'How this helps the landlord outcome',
      intro:
        'The goal is to get the landlord onto the right agreement page quickly, with less guesswork and less chance of buying the wrong pack.',
      cards: [
        {
          title: 'It narrows the choice fast',
          body:
            'Instead of browsing generic agreement pages, landlords can see which route matches the kind of tenancy they are actually setting up, even if they started with broad searches like tenancy agreement template or periodic tenancy agreement.',
        },
        {
          title: 'It keeps the product promise honest',
          body:
            'Each agreement page can rank for its exact intent because this page is doing the comparison job and the exact page owns the full product explanation.',
        },
        {
          title: 'It reduces route confusion before checkout',
          body:
            'Landlords can compare the practical difference between Standard, Premium, Student, HMO, and Lodger before they start generating anything.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'Use this page to compare the routes first, then move into the exact product page that matches the tenancy you are about to put in place.',
      steps: [
        {
          step: 'Step 01',
          title: 'Match the let to the right route',
          body:
            'Decide whether the tenancy is straightforward, more detailed, student-focused, shared-house based, or a resident-landlord room let. If you came in on periodic wording, that usually means Standard or Premium.',
        },
        {
          step: 'Step 02',
          title: 'Open the exact agreement page',
          body:
            'Read the full pack breakdown for that route so you can see exactly what the landlord receives and why each document is there.',
        },
        {
          step: 'Step 03',
          title: 'Start the correct agreement workflow',
          body:
            'Generate the product that matches the property and the occupiers instead of trying to adapt the wrong paperwork later.',
        },
      ],
    },
    cta: {
      title: 'Start with the agreement that fits the let',
      body:
        'If the tenancy is a straightforward whole-property let, open the Standard agreement first. Move to Premium when you want the fuller residential route. Use the specialist cards above only when the occupiers or letting setup clearly point you there.',
      primary: {
        label: 'Open Standard Tenancy Agreement',
        href: '/standard-tenancy-agreement',
      },
      secondary: {
        label: 'Open Premium Tenancy Agreement',
        href: '/premium-tenancy-agreement',
      },
      guideLinks: [
        ...tenancyProducts.map((product) => ({
          label: product.displayName,
          href: product.landingHref,
        })),
        { label: 'Periodic tenancy agreement guide', href: '/periodic-tenancy-agreement' },
        {
          label: 'Assured periodic tenancy guide',
          href: '/assured-periodic-tenancy-agreement',
        },
      ],
    },
    faq: {
      title: 'England tenancy agreement FAQs',
      items: faqs,
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Products', url: getCanonicalUrl('/pricing') },
          { name: descriptor.displayName, url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={pricingItemListSchema(
          tenancyProducts.map((product) => ({
            sku: product.productType as ProductSku,
            name: product.displayName,
            description: product.metaDescription,
            url: `https://landlordheaven.co.uk${product.landingHref}`,
          }))
        )}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
