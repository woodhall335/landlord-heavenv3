import type { Metadata } from 'next';
import { astHeroConfig } from '@/components/landing/heroConfigs';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import type {
  ProductSalesPageContent,
  ProductSalesRouteCard,
} from '@/lib/marketing/product-sales-content';
import { getPublicProductDescriptor, getPublicTenancyProducts } from '@/lib/public-products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, pricingItemListSchema } from '@/lib/seo/structured-data';

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

const descriptor = getPublicProductDescriptor('ast')!;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);
const tenancyProducts = getPublicTenancyProducts();

export const metadata: Metadata = {
  title:
    'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger, Periodic Guide',
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
    title:
      'England Tenancy Agreements | Standard, Premium, Student, HMO, Lodger, Periodic Guide',
    description:
      'Compare Standard, Premium, Student, HMO / Shared House, and Lodger agreement options for landlords in England, with periodic-tenancy support routes where needed.',
    url: canonicalUrl,
  },
};

const routeCards: ProductSalesRouteCard[] = [
  {
    name: 'Standard Tenancy Agreement',
    imageSrc: '/images/wizard-standard-tenancy-agreement.webp',
    imageAlt: 'Standard tenancy agreement preview',
    priceLabel:
      tenancyProducts.find((product) => product.key === 'england_standard_tenancy_agreement')
        ?.priceLabel,
    whatItIs:
      'The current England assured periodic agreement for a straightforward whole-property let.',
    problemItSolves:
      "Gives landlords a clean starting point when the tenancy is ordinary and does not need specialist student, shared-house, or resident-landlord wording, including landlords who searched for a periodic tenancy agreement and need the mainstream England option after the Renters' Rights Act changes.",
    riskIfWrong:
      'If you use a more specialist option by mistake, the paperwork becomes more complicated than it needs to be. If you use something older or vaguer, the core tenancy terms can feel too light.',
    landlordOutcome:
      'Gets the tenancy in place with a clear England agreement and the practical setup paperwork most straightforward lets need.',
    href: '/standard-tenancy-agreement',
    ctaLabel: 'Choose the Standard agreement',
  },
  {
    name: 'Premium Tenancy Agreement',
    imageSrc: '/images/wizard-premium-tenancy-agreement.webp',
    imageAlt: 'Premium tenancy agreement preview',
    priceLabel:
      tenancyProducts.find((product) => product.key === 'england_premium_tenancy_agreement')
        ?.priceLabel,
    whatItIs:
      'The fuller current England assured periodic option for ordinary residential lets that need stronger management wording.',
    problemItSolves:
      "Helps when the landlord wants more detail around access, reporting, inspections, keys, repairs, and hand-back from the outset, while still staying on the ordinary England periodic option after the Renters' Rights Act changes.",
    riskIfWrong:
      'If a more involved let is forced into a lighter agreement, avoidable management arguments can start because the paperwork never set expectations clearly enough.',
    landlordOutcome:
      'Gives the landlord a stronger written framework for the day-to-day running of the tenancy without moving into the wrong specialist product.',
    href: '/premium-tenancy-agreement',
    ctaLabel: 'Choose the Premium agreement',
  },
  {
    name: 'Student Tenancy Agreement',
    imageSrc: '/images/wizard-student-tenancy-agreement.webp',
    imageAlt: 'Student tenancy agreement preview',
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
    imageSrc: '/images/wizard-hmo-agreement.webp',
    imageAlt: 'HMO shared house tenancy agreement preview',
    priceLabel:
      tenancyProducts.find(
        (product) => product.key === 'england_hmo_shared_house_tenancy_agreement'
      )?.priceLabel,
    whatItIs: 'The shared-house agreement for occupiers living together and using communal areas.',
    problemItSolves:
      'Deals with house rules, communal spaces, sharer expectations, and shared living arrangements more directly than a standard tenancy agreement.',
    riskIfWrong:
      'If a shared house is documented like a straightforward whole-property let, the paperwork can miss the rules that stop everyday shared-living disputes from escalating.',
    landlordOutcome:
      'Helps the landlord run a communal property with paperwork that fits the real shared-house setup.',
    href: '/hmo-shared-house-tenancy-agreement',
    ctaLabel: 'Choose the HMO / Shared House agreement',
  },
  {
    name: 'Lodger Agreement',
    imageSrc: '/images/wizard-section-13-rent-increase.webp',
    imageAlt: 'Lodger agreement preview',
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
      'Because each option solves a different tenancy risk. The public pages now match the setup more honestly instead of pretending one agreement suits every kind of let.',
  },
  {
    question: 'Should I still use this if I searched for AST?',
    answer:
      'Yes. If you searched for AST, this is the best place to choose the exact current England agreement that fits the property and the occupiers.',
  },
  {
    question: 'What if I searched for periodic tenancy agreement or assured periodic tenancy agreement?',
    answer:
      "That is still the right kind of search for this England tenancy journey. Standard and Premium are the current England assured periodic options, so use this page to choose the exact product and the periodic support guides if you want the terminology explained first.",
  },
  {
    question: 'Where do I get the full pack breakdown for each agreement?',
    answer:
      'Use this page to choose the right option, then open the exact product page for the full agreement and document-by-document pack breakdown.',
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
        'England tenancy agreements | Standard and Premium updated for 1 May 2026',
      title: 'Choose the right England',
      highlightTitle: 'tenancy agreement for the let',
      subtitle:
        "If the tenancy is a straightforward whole-property let, start with Standard. Use Premium when you want fuller drafting. Standard and Premium are the current England assured periodic options from 1 May 2026.",
      primaryCta: {
        label: 'Open Standard Tenancy Agreement',
        href: '/standard-tenancy-agreement',
      },
      secondaryCta: {
        label: 'Open Premium Tenancy Agreement',
        href: '/premium-tenancy-agreement',
      },
    },
    decisionBlock: {
      title: 'Choose the England agreement before you start the wizard',
      intro:
        'This page exists to stop landlords buying the wrong agreement pack. The real decision is not which template sounds best, but which letting setup you are actually documenting.',
      cards: [
        {
          eyebrow: 'Most common choice',
          title: 'Start with Standard or Premium for an ordinary whole-property let',
          body:
            'If the property is being let as a normal residential home in England, Standard is the clean mainstream option and Premium is the fuller management option. Those are the right starting points for most ordinary lets.',
          tone: 'positive',
        },
        {
          eyebrow: 'Specialist products',
          title: 'Use Student, HMO / Shared House, or Lodger only when the facts really point there',
          body:
            'If the occupiers are students, the property is being shared with communal rules, or the landlord is taking in a lodger at home, use the dedicated specialist product instead of trying to adapt a general agreement afterwards.',
          tone: 'warning',
        },
      ],
      primary: {
        label: 'Open Standard Tenancy Agreement',
        href: '/standard-tenancy-agreement',
      },
      secondary: {
        label: 'Open Premium Tenancy Agreement',
        href: '/premium-tenancy-agreement',
      },
    },
    whatYouGet: {
      title: 'Choose the agreement that fits the tenancy',
      intro:
        'Use this page to compare the five agreement products properly. Standard is the usual ordinary-let start, Premium is the fuller residential option, and the specialist choices below are for student, shared-house, and lodger setups that need their own wording.',
      routeCards,
    },
    objectionBlock: {
      title: 'Common landlord questions before choosing an England tenancy agreement',
      intro:
        'Most mistakes happen before the agreement is generated. These are the points landlords usually need cleared up first.',
      items: [
        {
          question: 'I searched for AST or periodic tenancy agreement. Where should I start?',
          answer:
            'Usually with Standard or Premium. Those are the current England whole-property options, and this page is here to help you decide whether you need the cleaner mainstream pack or the fuller management pack.',
        },
        {
          question: 'How do I know if I need a specialist product?',
          answer:
            'Use Student if the real issue is student occupation and guarantors, HMO / Shared House if the real issue is communal living and house rules, and Lodger if the landlord lives in the property and is taking in an occupier at home.',
        },
        {
          question: 'What if I buy the wrong agreement type?',
          answer:
            'That is exactly what this comparison page is meant to prevent. The comparison cards and product pages are there so the paperwork matches the way the property is actually being let from the start.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to choose the right England agreement?',
      body:
        'Open Standard for the mainstream whole-property option, move to Premium when you want fuller management wording, and use the specialist products only when the tenancy facts clearly point there.',
      primary: {
        label: 'Open Standard Tenancy Agreement',
        href: '/standard-tenancy-agreement',
      },
      secondary: {
        label: 'Open Premium Tenancy Agreement',
        href: '/premium-tenancy-agreement',
      },
    },
    whyYouNeedThis: {
      title: 'Why you need the right agreement first',
      intro:
        'Most agreement problems start before the document is generated. They start when the landlord picks an option that does not match the occupiers, the property, or the way the let will actually be managed.',
      cards: [
        {
          title: 'Different lets create different risks',
          body:
            'A student household, a shared house, and a resident-landlord room let are not the same job even if they all look like tenancy paperwork at first glance.',
        },
        {
          title: 'Wrong paperwork weakens the tenancy early',
          body:
            'If the agreement does not match the real arrangement, the paperwork can feel vague or misaligned before the tenancy has properly begun.',
        },
        {
          title: 'The exact product pages do the detail',
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
            'Instead of browsing generic agreement pages, landlords can see which option matches the kind of tenancy they are actually setting up, even if they started with broad searches like tenancy agreement template or periodic tenancy agreement.',
        },
        {
          title: 'It keeps the product promise honest',
          body:
            'Each agreement page can rank for its exact intent because this page is doing the comparison job and the exact page owns the full product explanation.',
        },
        {
          title: 'It reduces confusion before checkout',
          body:
            'Landlords can compare the practical difference between Standard, Premium, Student, HMO, and Lodger before they start generating anything.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'Use this page to compare the options first, then move into the exact product page that matches the tenancy you are about to put in place.',
      steps: [
        {
          step: 'Step 01',
          title: 'Match the let to the right product',
          body:
            'Decide whether the tenancy is straightforward, more detailed, student-focused, shared-house based, or a resident-landlord room let. If you came in on periodic wording, that usually means Standard or Premium.',
        },
        {
          step: 'Step 02',
          title: 'Open the exact agreement page',
          body:
            'Read the full pack breakdown so you can see exactly what the landlord receives and why each document is there.',
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
        'If the tenancy is a straightforward whole-property let, open the Standard agreement first. Move to Premium when you want the fuller residential option. Use the specialist cards above only when the occupiers or letting setup clearly point you there.',
      primary: {
        label: 'Open Standard Tenancy Agreement',
        href: '/standard-tenancy-agreement',
      },
      secondary: {
        label: 'Open Premium Tenancy Agreement',
        href: '/premium-tenancy-agreement',
      },
      guideLinks: descriptor.defaultGuideLinks,
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
          { name: 'England Tenancy Agreements', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={pricingItemListSchema([
          {
            sku: 'england_standard_tenancy_agreement',
            name: 'Standard Tenancy Agreement',
            url: getCanonicalUrl('/standard-tenancy-agreement'),
          },
          {
            sku: 'england_premium_tenancy_agreement',
            name: 'Premium Tenancy Agreement',
            url: getCanonicalUrl('/premium-tenancy-agreement'),
          },
          {
            sku: 'england_student_tenancy_agreement',
            name: 'Student Tenancy Agreement',
            url: getCanonicalUrl('/student-tenancy-agreement'),
          },
          {
            sku: 'england_hmo_shared_house_tenancy_agreement',
            name: 'HMO / Shared House Tenancy Agreement',
            url: getCanonicalUrl('/hmo-shared-house-tenancy-agreement'),
          },
          {
            sku: 'england_lodger_agreement',
            name: 'Lodger Agreement',
            url: getCanonicalUrl('/lodger-agreement'),
          },
        ])}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
