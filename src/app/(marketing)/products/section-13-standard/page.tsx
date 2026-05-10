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
      secondaryCta: { label: 'Check the supportable range first', href: '/tools/rent-increase-challenge-checker' },
      feature:
        'Built for landlords who want the notice, evidence, and service record to stay clear from the start.',
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
          <li>Need to test the figure first? Run the free rent checker before opening the paid pack.</li>
        </ul>
      ),
    },
    earlyProofBand: {
      preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    whatYouGet: {
      hideSection: true,
      title: '',
      intro: '',
    },
    comparisonBlock: {
      title: 'Standard and defence solve different Section 13 jobs',
      intro:
        'The key choice is whether you need to serve and explain the increase now, or whether you already need challenge and tribunal materials.',
      routeCards: [
        {
          name: 'Standard Section 13 Rent Increase Pack',
          whatItIs:
            'Best when you want to propose the increase with Form 4A, market evidence, and a clean service record.',
          problemItSolves:
            'Stops the increase looking unsupported before the tenant sees the evidence.',
          riskIfWrong:
            'If a serious challenge is already likely, you may still need the stronger defence pack afterwards.',
          landlordOutcome:
            'Lets you serve the increase cleanly now and keep the evidence together.',
          href: '/products/section-13-standard',
          ctaLabel: 'This is my option',
          priceLabel: product.displayPrice,
          imageSrc: '/images/wizard-icons/41-rent.png',
          imageAlt: 'Standard Section 13 rent increase pack',
        },
        {
          name: 'Challenge-Ready Section 13 Defence Pack',
          whatItIs:
            'Best when you want response, bundle, and tribunal-preparation materials as well as the notice pack.',
          problemItSolves:
            'Prevents the rent increase pack from being rebuilt later when the tenant challenges the figure or the service.',
          riskIfWrong:
            'If you only need to serve and explain the increase now, the defence route may be more than you need.',
          landlordOutcome:
            'Gives you the stronger challenge-ready pack if pushback is already in view.',
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
        'These are the questions landlords usually ask before choosing the standard Section 13 pack.',
      items: [
        {
          question: 'Does this include the official Form 4A notice?',
          answer:
            'Yes. The pack generates the current England Form 4A notice with the market evidence, explanation materials, and service record that support it.',
        },
        {
          question: 'Is this enough if the tenant simply asks why the rent is going up?',
          answer:
            'Usually yes. This pack gives you a clean notice, comparables, a short report, and a clearer explanation of the proposed figure.',
        },
        {
          question: 'What if the tenant is likely to challenge the increase formally?',
          answer:
            'If challenge risk is already active, the defence pack is usually better because it adds response materials, a tribunal bundle, and preparation support.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to propose the increase?',
      body:
        'Start here if you want more than a blank Form 4A and need the notice, comparables, and service record aligned.',
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
      guideLinks: [
        { label: 'Run the free rent checker first', href: '/tools/rent-increase-challenge-checker' },
        ...descriptor.defaultGuideLinks,
      ],
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
