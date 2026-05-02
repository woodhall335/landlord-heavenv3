import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { SECTION13_STANDARD_PAGE } from '@/lib/marketing/section13-products';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getPublicProductDescriptor } from '@/lib/public-products';

const config = SECTION13_STANDARD_PAGE;
const descriptor = getPublicProductDescriptor('section13_standard')!;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);
const product = PRODUCTS[config.productSku];

export const metadata: Metadata = {
  title: config.title,
  description: config.description,
  keywords: config.keywords,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: config.title,
    description: config.description,
    url: canonicalUrl,
  },
};

export default function Section13StandardProductPage() {
  const sampleProof = getGoldenPackProofData('section13_standard');

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'section13_standard',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England Section 13 pack | standard option for a rent increase pack',
      title: config.heroTitle,
      subtitle: config.heroSubtitle,
      primaryCta: { label: config.ctaLabel, href: product.wizardHref },
      secondaryCta: { label: 'Read the rent increase guide', href: '/products/rent-increase' },
      feature:
        'Built for landlords who want the notice, the evidence, and the service record to stay clear and consistent from the start.',
      mediaSrc: '/images/wizard-icons/41-rent.png',
      mediaAlt: 'Section 13 rent increase documents',
      showReviewPill: true,
      showTrustPositioningBar: true,
      trustPositioningPreset: 'section13',
      children: (
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {config.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ),
    },
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'This is the right fit when you want to propose the rent increase properly, show the tenant how you reached the figure, and inspect the actual notice pack before you pay.',
      includedBullets: [
        'Official Form 4A notice prepared for the current England position',
        'Comparable-listing evidence and justification report prepared together',
        'Service record and tenant-facing communication kept aligned with the notice',
      ],
      bestFor:
        'You want a supportable Section 13 rent increase pack, but you do not yet need the fuller challenge-ready tribunal materials.',
      notFor:
        'You already expect strong pushback or want the more defensive tribunal-facing pack from the start.',
      preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    decisionBlock: {
      title: 'Choose the Standard Section 13 option if you want to serve the increase properly now',
      intro:
        'This pack is for landlords whose main goal is to set the new rent figure more carefully, support it with market evidence, and keep the notice and service record clean before the file hardens into a dispute.',
      cards: [
        {
          eyebrow: 'Choose this option',
          title: 'Propose the rent increase with a clear, evidence-backed pack',
          body:
            'Use the Standard pack when you want Form 4A, comparable evidence, a justification report, and the service record working together so the increase reads as a reasoned landlord decision rather than a bare notice.',
          tone: 'positive',
        },
        {
          eyebrow: 'Choose the other option',
          title: 'Do not stop here if you already expect a challenge or tribunal scrutiny',
          body:
            'If the tenant is likely to contest the increase or you want a stronger response-and-bundle layer from the outset, the Challenge-Ready Section 13 Defence Pack is the better fit.',
          tone: 'warning',
        },
      ],
      primary: { label: 'Start the standard Section 13 option', href: product.wizardHref },
      secondary: {
        label: 'Need the challenge-ready defence route instead?',
        href: '/products/section-13-defence',
      },
    },
    whatYouGet: {
      title: 'What you get in the standard rent increase file',
      intro: config.packIntro,
      items: config.packBreakdown,
    },
    comparisonBlock: {
      title: 'Standard and defence solve different Section 13 jobs',
      intro:
        'The key choice is whether you are mainly serving and evidencing the increase now, or whether you already want the more defensive challenge and tribunal materials built in from the start.',
      routeCards: [
        {
          name: 'Standard Section 13 Rent Increase Pack',
          whatItIs:
            'Best when you want to propose the rent increase properly with Form 4A, market evidence, and a clean service record.',
          problemItSolves:
            'Stops the increase looking arbitrary or procedurally weak before the tenant has even seen the evidence.',
          riskIfWrong:
            'If a serious challenge is already likely, you may still need a stronger tribunal-facing file afterwards.',
          landlordOutcome:
            'Lets you serve the increase more cleanly now and keep the evidence together from the outset.',
          href: '/products/section-13-standard',
          ctaLabel: 'This is my option',
          priceLabel: product.displayPrice,
          imageSrc: '/images/wizard-icons/41-rent.png',
          imageAlt: 'Standard Section 13 rent increase pack',
        },
        {
          name: 'Challenge-Ready Section 13 Defence Pack',
          whatItIs:
            'Best when you want the fuller response, bundle, and tribunal-preparation materials as well as the core notice pack.',
          problemItSolves:
            'Prevents the rent increase pack from being rebuilt later when the tenant challenges the figure or the service.',
          riskIfWrong:
            'If you only need to serve and explain the increase now, the defence route can be more than you need at this stage.',
          landlordOutcome:
            'Gives you the stronger challenge-ready pack from day one if pushback is already in view.',
          href: '/products/section-13-defence',
          ctaLabel: 'Compare the defence route',
          imageSrc: '/images/wizard-icons/41-rent.png',
          imageAlt: 'Challenge-ready Section 13 defence pack',
        },
      ],
    },
    objectionBlock: {
      title: 'Common landlord questions before choosing the standard option',
      intro:
        'The preview shows the real pack you are paying for. These are the questions landlords usually want answered before choosing the standard Section 13 pack.',
      items: [
        {
          question: 'Does this include the official Form 4A notice?',
          answer:
            'Yes. The pack generates the current England Form 4A notice together with the market evidence, explanation materials, and service record that support it.',
        },
        {
          question: 'Is this enough if the tenant simply asks why the rent is going up?',
          answer:
            'Usually yes. This pack is built for that exact situation: a clean notice, live comparables, a justification report, and a clearer landlord explanation of the proposed figure.',
        },
        {
          question: 'What if the tenant is likely to challenge the increase formally?',
          answer:
            'If challenge risk is already active, the defence pack is usually the better route because it adds the fuller challenge-response, tribunal-bundle, and preparation layer from the start.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to propose the increase with a cleaner pack?',
      body:
        'Start here if you want more than a blank Form 4A and need the notice, comparables, and service record aligned before the tenant pushes back.',
      primary: { label: 'Start the standard rent increase wizard', href: product.wizardHref },
      secondary: {
        label: 'I need the challenge-ready defence route',
        href: '/products/section-13-defence',
      },
    },
    whyYouNeedThis: {
      title: 'Why you need this',
      intro: config.whyYouNeedThis.intro,
      cards: config.whyYouNeedThis.cards,
    },
    howThisHelps: {
      title: 'How this helps you',
      intro: config.howThisHelps.intro,
      cards: config.howThisHelps.cards,
    },
    howItWorks: {
      title: 'How it works',
      intro: config.howItWorks.intro,
      steps: config.howItWorks.steps,
    },
    cta: {
      title: config.cta.title,
      body: config.cta.body,
      primary: { label: 'Start the standard Section 13 option', href: product.wizardHref },
      secondary: config.cta.secondaryLabel && config.cta.secondaryHref
        ? { label: config.cta.secondaryLabel, href: config.cta.secondaryHref }
        : undefined,
      guideLinks: descriptor.defaultGuideLinks,
    },
    faq: {
      title: 'Standard Section 13 Rent Increase Pack FAQs',
      items: config.faqs,
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: descriptor.displayName,
          description: config.description,
          price: product.price.toString(),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Pricing', url: getCanonicalUrl('/pricing') },
          { name: 'Standard Section 13 Rent Increase Pack', url: canonicalUrl },
        ])}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
