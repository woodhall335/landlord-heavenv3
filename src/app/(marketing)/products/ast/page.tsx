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
  title: 'England Tenancy Agreements | Compare Landlord Packs',
  description:
    'Compare England tenancy agreement packs for Standard, Premium, Student, HMO or shared-house, and Lodger lets before choosing the right route.',
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
    title: 'England Tenancy Agreements | Compare Landlord Packs',
    description:
      'Compare Standard, Premium, Student, HMO / Shared House, and Lodger agreement options for landlords in England.',
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
      'The current England agreement for a straightforward whole-property let, with setup records, key clauses, and practical landlord wording.',
    problemItSolves:
      "Gives landlords a clean starting point when the let is ordinary and does not need student, shared-house, or resident-landlord wording.",
    riskIfWrong:
      'If you choose a specialist option by mistake, the paperwork can become more complicated than it needs to be. If you use older wording, the core terms may be too light.',
    landlordOutcome:
      'Gets the tenancy in place with a clear England agreement and practical setup paperwork.',
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
      'The fuller current England option for ordinary residential lets that need stronger management wording.',
    problemItSolves:
      'Helps when the landlord wants more detail around access, reporting, inspections, keys, repairs, and hand-back.',
    riskIfWrong:
      'If a more involved let uses a lighter agreement, avoidable management arguments can start because expectations were not clear enough.',
    landlordOutcome:
      'Gives the landlord a stronger written framework for day-to-day tenancy management.',
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
      'Deals with guarantors, sharers, replacement requests, and end-of-term move-out more directly than a generic agreement.',
    riskIfWrong:
      'If a student household uses a generic let, key pressure points can be under-explained until something goes wrong.',
    landlordOutcome:
      'Gives the landlord an agreement that matches how the student property is occupied and managed.',
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
      'Deals with house rules, communal spaces, sharer expectations, and shared living arrangements.',
    riskIfWrong:
      'If a shared house is treated like a straightforward whole-property let, the paperwork can miss important shared-living rules.',
    landlordOutcome:
      'Helps the landlord run a shared property with paperwork that fits the setup.',
    href: '/hmo-shared-house-tenancy-agreement',
    ctaLabel: 'Choose the HMO / Shared House agreement',
  },
  {
    name: 'Lodger Agreement',
    imageSrc: '/images/wizard-lodger-agreement.webp',
    imageAlt: 'Lodger agreement preview',
    priceLabel:
      tenancyProducts.find((product) => product.key === 'england_lodger_agreement')?.priceLabel,
    whatItIs: 'The room-let agreement for a landlord who lives in the property.',
    problemItSolves:
      'Keeps the resident-landlord arrangement separate from a standard tenancy, with shared-home rules and notice expectations set out.',
    riskIfWrong:
      "If a lodger setup is treated like a normal tenancy, the paperwork may not match shared occupation inside the landlord's home.",
    landlordOutcome:
      'Gives the landlord a clearer room-let agreement for a shared-home arrangement.',
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
        'England tenancy agreements | Standard, Premium, Student, HMO, and Lodger',
      title: 'Choose the right England',
      highlightTitle: 'tenancy agreement for the let',
      subtitle:
        'Choose the agreement that matches how the property will actually be occupied: ordinary let, fuller management terms, student house, HMO / shared house, or lodger.',
      showTrustPositioningBar: true,
      primaryCta: {
        label: 'Choose Standard agreement',
        href: '/standard-tenancy-agreement',
      },
      secondaryCta: {
        label: 'Choose Premium agreement',
        href: '/premium-tenancy-agreement',
      },
    },
    decisionBlock: {
      title: 'Choose the agreement before you start',
      intro:
        'Start with the facts of the let. The right agreement depends on who will live there, whether the property is shared, and how much management detail you want in the paperwork.',
      cards: [
        {
          eyebrow: 'Most common choice',
          title: 'Start with Standard or Premium for an ordinary whole-property let',
          body:
            'If the property is being let as a normal residential home in England, Standard is the simple option and Premium is the fuller management option.',
          tone: 'positive',
        },
        {
          eyebrow: 'Specialist products',
          title: 'Use Student, HMO / Shared House, or Lodger only when the facts really point there',
          body:
            'If the occupiers are students, the property is a shared house, or the landlord lives there and is taking in a lodger, use the dedicated product.',
          tone: 'warning',
        },
      ],
      primary: {
        label: 'Choose Standard agreement',
        href: '/standard-tenancy-agreement',
      },
      secondary: {
        label: 'Choose Premium agreement',
        href: '/premium-tenancy-agreement',
      },
    },
    whatYouGet: {
      title: 'Choose the agreement that fits the let',
      intro:
        'Compare the five England agreement options. Standard is the usual ordinary-let choice, Premium adds fuller management wording, and the specialist options cover student, shared-house, and lodger setups.',
      routeCards,
    },
    objectionBlock: {
      title: 'Common landlord questions before choosing an England tenancy agreement',
      intro:
        'Most mistakes happen before the agreement is generated. These are the points landlords usually check first.',
      items: [
        {
          question: 'I searched for AST or periodic tenancy agreement. Where should I start?',
          answer:
            'Usually with Standard or Premium. Those are the England whole-property options, and this page helps you choose between the simpler pack and the fuller management pack.',
        },
        {
          question: 'How do I know if I need a specialist product?',
          answer:
            'Use Student for student occupation and guarantors, HMO / Shared House for communal living and house rules, and Lodger when the landlord lives in the property.',
        },
        {
          question: 'What if I buy the wrong agreement type?',
          answer:
            'This comparison page is meant to prevent that. It helps the paperwork match the way the property is actually being let before you start answering detailed questions.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to choose the agreement?',
      body:
        'Open Standard for the usual whole-property option, choose Premium for fuller management wording, or use a specialist product when the facts point there.',
      primary: {
        label: 'Choose Standard agreement',
        href: '/standard-tenancy-agreement',
      },
      secondary: {
        label: 'Choose Premium agreement',
        href: '/premium-tenancy-agreement',
      },
    },
    whyYouNeedThis: {
      title: 'Why you need the right agreement first',
      intro:
        'Many agreement problems start when the landlord chooses a product that does not match the occupiers, property, or management setup.',
      cards: [
        {
          title: 'Different lets create different risks',
          body:
            'A student household, shared house, and resident-landlord room let are different jobs even if they all look like tenancy paperwork.',
        },
        {
          title: 'Wrong paperwork weakens the tenancy early',
          body:
            'If the agreement does not match the real arrangement, or starts from an old one-size-fits-all form, the paperwork can feel unclear before the tenancy has begun.',
        },
        {
          title: 'The exact product pages do the detail',
          body:
            'This page helps you choose. Each agreement page then explains the full pack and what each document does.',
        },
      ],
    },
    howThisHelps: {
      title: 'How this helps',
      intro:
        'The goal is to get you to the right agreement quickly, with less guesswork before you start.',
      cards: [
        {
          title: 'It narrows the choice fast',
          body:
            'Instead of browsing generic pages, landlords can see which option matches the tenancy they are setting up.',
        },
        {
          title: 'It keeps the choice honest',
          body:
            'This page compares the options, then each agreement page explains what you receive and shows a sample preview.',
        },
        {
          title: 'It reduces confusion before checkout',
          body:
            'Landlords can compare Standard, Premium, Student, HMO, and Lodger before preparing anything.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'Compare the options first, then open the product page that matches the tenancy.',
      imageSrc: '/tenancy-how-it-works.webp',
      imageAlt: 'Landlord tenancy agreement preview',
      steps: [
        {
          step: 'Step 01',
          title: 'Match the let to the right product',
          body:
            'Decide whether the tenancy is straightforward, more detailed, student-focused, shared-house based, or a resident-landlord room let.',
        },
        {
          step: 'Step 02',
          title: 'Open the exact agreement page',
          body:
            'Read the pack breakdown so you can see what the landlord receives and why each document is there.',
        },
        {
          step: 'Step 03',
          title: 'Start the correct agreement',
          body:
            'Prepare the agreement that matches the property and occupiers instead of adapting the wrong paperwork later.',
        },
      ],
    },
    cta: {
      title: 'Start with the agreement that fits the let',
      body:
        'If the tenancy is a straightforward whole-property let, open Standard first. Choose Premium for fuller management wording. Use the specialist options only when the occupiers or setup point there.',
      primary: {
        label: 'Choose Standard agreement',
        href: '/standard-tenancy-agreement',
      },
      secondary: {
        label: 'Choose Premium agreement',
        href: '/premium-tenancy-agreement',
      },
      guideLinks: [
        {
          label: 'Not sure which agreement? Compare all England options',
          href: '/compare/tenancy-agreement-options-england',
        },
        ...descriptor.defaultGuideLinks,
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
