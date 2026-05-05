import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { SECTION13_DEFENCE_PAGE } from '@/lib/marketing/section13-products';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getPublicProductDescriptor } from '@/lib/public-products';

const config = SECTION13_DEFENCE_PAGE;
const descriptor = getPublicProductDescriptor('section13_defensive')!;
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

export default function Section13DefenceProductPage() {
  const sampleProof = getGoldenPackProofData('section13_defensive');

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'section13_defensive',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England Section 13 defence pack | support for challenged rent increases',
      title: config.heroTitle,
      subtitle: config.heroSubtitle,
      primaryCta: { label: config.ctaLabel, href: product.wizardHref },
      secondaryCta: { label: 'Check the challenge risk first', href: '/tools/rent-increase-challenge-checker' },
      feature:
        'Built for landlords who need the notice, evidence, and response materials to stay clear under challenge.',
      mediaSrc: '/images/wizard-icons/41-rent.png',
      mediaAlt: 'Section 13 defence documents',
      showReviewPill: true,
      showTrustPositioningBar: true,
      trustPositioningPreset: 'section13',
      children: (
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {config.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
          <li>Need to test whether the figure is too high? Run the free rent checker first.</li>
        </ul>
      ),
    },
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'This is the stronger option when you want to preview the challenge-ready Section 13 pack before you pay, including the bundle, argument summary, and response structure.',
      includedBullets: [
        'Official Form 4A notice kept with the wider defence pack',
        'Bundle, argument summary, and justification analysis',
        'Response, evidence, and challenge-preparation materials',
      ],
      bestFor:
        'You expect pushback, want response materials ready, or want the stronger tribunal-facing pack from the start.',
      notFor:
        'You mainly need to serve and explain the increase now without the fuller challenge layer.',
      preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    decisionBlock: {
      title: 'Choose Defence if the increase may be challenged',
      intro:
        'This page is for landlords who need more than serving the notice. It is for cases where the increase may be tested and the evidence needs to stay organised.',
      cards: [
        {
          eyebrow: 'Choose this option',
          title: 'Prepare the challenge-ready pack now',
          body:
            'Use the defence pack when you need Form 4A, comparables, argument summary, response materials, and bundle support to work together.',
          tone: 'positive',
        },
        {
          eyebrow: 'Choose the other option',
          title: 'Use Standard if you only need to serve and explain the increase',
          body:
            'If you mainly need to set the rent, support it with comparables, and serve the notice properly, the Standard Section 13 Rent Increase Pack is often the better fit.',
          tone: 'warning',
        },
      ],
      primary: { label: 'Start the challenge-ready defence option', href: product.wizardHref },
      secondary: {
        label: 'Only need the standard rent increase route?',
        href: '/products/section-13-standard',
      },
    },
    whatYouGet: {
      title: 'What you get in the challenge-ready defence pack',
      intro: config.packIntro,
      items: config.packBreakdown,
    },
    comparisonBlock: {
      title: 'Standard and defence solve different rent-increase jobs',
      intro:
        'The standard pack is for serving and explaining the increase. The defence pack is for cases where challenge risk and tribunal structure matter from the start.',
      routeCards: [
        {
          name: 'Standard Section 13 Rent Increase Pack',
          whatItIs:
            'Best when you want to propose the increase with Form 4A, comparables, and a clean service record.',
          problemItSolves:
            'Stops the increase from looking unsupported or weak on process when it is first served.',
          riskIfWrong:
            'If the tenant is likely to challenge, you may still need the fuller defence pack later.',
          landlordOutcome:
            'Gives you a clear rent increase pack without the heavier tribunal-preparation layer.',
          href: '/products/section-13-standard',
          ctaLabel: 'Compare the standard option',
          imageSrc: '/images/wizard-icons/41-rent.png',
          imageAlt: 'Standard Section 13 pack',
        },
        {
          name: 'Challenge-Ready Section 13 Defence Pack',
          whatItIs:
            'Best when you want the notice, comparables, response materials, and tribunal-facing bundle in one pack.',
          problemItSolves:
            'Prevents the rent increase case from being rebuilt later if the tenant challenges the figure or service.',
          riskIfWrong:
            'If you only need to serve and explain the increase now, this route may be more than you need.',
          landlordOutcome:
            'Gets you closer to a tribunal-ready position if the increase is likely to be tested.',
          href: '/products/section-13-defence',
          ctaLabel: 'This is my option',
          priceLabel: product.displayPrice,
          imageSrc: '/images/wizard-icons/41-rent.png',
          imageAlt: 'Challenge-ready Section 13 defence pack',
        },
      ],
    },
    objectionBlock: {
      title: 'Common landlord questions before choosing the defence option',
      intro:
        'These are the points landlords usually check before choosing the stronger Section 13 option.',
      items: [
        {
          question: 'Does this still include the official Form 4A notice?',
          answer:
            'Yes. The defence route still includes Form 4A. It also adds the argument summary, bundle, response materials, and stronger evidence structure.',
        },
        {
          question: 'When is this better than the standard pack?',
          answer:
            'It is better when challenge risk is already visible, the tenant is likely to test the increase, or you want response and bundle materials ready early.',
        },
        {
          question: 'Is this only for a tribunal hearing?',
          answer:
            'No. It can also help earlier by keeping the file coherent while objections are being raised and answered.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to build the stronger pack?',
      body:
        'Start here if you want the notice, market evidence, response materials, and tribunal-facing bundle prepared together.',
      primary: { label: 'Start the defence-route wizard', href: product.wizardHref },
      secondary: {
        label: 'I only need the standard option',
        href: '/products/section-13-standard',
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
      primary: { label: 'Start the challenge-ready defence option', href: product.wizardHref },
      secondary: config.cta.secondaryLabel && config.cta.secondaryHref
        ? { label: config.cta.secondaryLabel, href: config.cta.secondaryHref }
        : undefined,
      guideLinks: [
        { label: 'Run the free rent checker first', href: '/tools/rent-increase-challenge-checker' },
        ...descriptor.defaultGuideLinks,
      ],
    },
    faq: {
      title: 'Challenge-Ready Section 13 Defence Pack FAQs',
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
          { name: 'Challenge-Ready Section 13 Defence Pack', url: canonicalUrl },
        ])}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
