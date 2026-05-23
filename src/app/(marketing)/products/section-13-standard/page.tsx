import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { SECTION13_STANDARD_PAGE } from '@/lib/marketing/section13-products';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getPublicProductDescriptor } from '@/lib/public-products';

const config = SECTION13_STANDARD_PAGE;
const descriptor = getPublicProductDescriptor('section13_standard')!;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);
const product = PRODUCTS[config.productSku];

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.section13Standard.title,
  description: PRODUCT_OWNER_METADATA.section13Standard.description,
  keywords: config.keywords,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.section13Standard.title,
    description: PRODUCT_OWNER_METADATA.section13Standard.description,
    url: canonicalUrl,
  },
};

export default function Section13StandardProductPage() {
  const sampleProof = getGoldenPackProofData('section13_standard');
  const samplePage = getProductSamplePageByPackKey('section13_standard');
  const samplePreviewEntries = config.packBreakdown.map((item) => ({
    title: item.name,
    description: item.plainEnglish,
    categoryLabel: 'Pack output',
  }));

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'section13_standard',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'Form 4A, market evidence, supportable range, service record, preview before paying',
      title: config.heroTitle,
      subtitle: config.heroSubtitle,
      primaryCta: { label: config.ctaLabel, href: product.wizardHref },
      secondaryCta: { label: 'Compare the tribunal-ready pack', href: '/products/section-13-defence' },
      feature:
        'Choose this for a normal rent increase where you want the figure explained by market evidence. If a challenge already feels likely, use the Tribunal-Ready pack instead.',
      mediaSrc: '/images/wizard-icons/41-rent.png',
      mediaAlt: 'Section 13 rent increase documents',
      showReviewPill: true,
      showTrustPositioningBar: true,
      trustPositioningPreset: 'section13',
      children: (
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-white/90 backdrop-blur">
          <p className="font-semibold text-white">Choose this if the increase needs to be supportable.</p>
          <ul className="mt-2 space-y-2">
            {config.heroBullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ),
    },
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'Preview the Form 4A rent increase file before you pay, including market evidence, the rent summary, cover letter, and service record. This is procedural document preparation, not legal advice.',
      preview: (
        <GoldenPackProof
          data={sampleProof}
          fallbackEntries={samplePreviewEntries}
          samplePageHref={samplePage?.samplePath}
        />
      ),
    },
    whatYouGet: {
      title: 'What you get',
      intro: config.packIntro,
      items: config.packBreakdown,
    },
    comparisonBlock: {
      routeGridClassName: 'mt-8 grid gap-6 lg:grid-cols-2',
      routeCards: [
        {
          name: 'Supported Rent Increase Pack',
          whatItIs:
            'For landlords who want to serve a market-supported Section 13 rent increase in England with Form 4A, current comparables, and a service record prepared together.',
          problemItSolves:
            'Helps you get the figure, dates, notice, rent increase summary, nearby advertised rental comparisons, and service steps right before the tenant receives anything.',
          riskIfWrong:
            'A bare form with weak dates or no evidence can invite questions, delays, or a challenge that is harder to answer.',
          landlordOutcome:
            'Best when the increase is straightforward and you want a clear, service-ready pack.',
          href: '/products/section-13-standard',
          ctaLabel: 'Build my supported rent increase',
          priceLabel: product.displayPrice,
          imageSrc: '/images/rent-increase-standard.webp',
          imageAlt: 'Supported Section 13 rent increase pack',
        },
        {
          name: 'Tribunal-Ready Rent Increase Pack',
          whatItIs:
            'For landlords who already expect the proposed rent to be disputed, or who want a stronger file before serving.',
          problemItSolves:
            'Organises the evidence, response notes, legal briefing, and tribunal-ready material around the rent figure from the start.',
          riskIfWrong:
            'If challenge risk is obvious and you start with a light file, you may have to rebuild the evidence after the tenant objects.',
          landlordOutcome:
            'Best when you want to be ready for questions, negotiation, or tribunal scrutiny.',
          href: '/products/section-13-defence',
          ctaLabel: 'Prepare for a rent challenge',
          priceLabel: PRODUCTS.section13_defensive.displayPrice,
          imageSrc: '/images/rent-increase-defence.webp',
          imageAlt: 'Tribunal-ready Section 13 rent increase pack',
        },
      ],
    },
    objectionBlock: {
      title: 'Common landlord questions before choosing the standard option',
      intro:
        'These are the questions landlords usually ask before choosing the supported Section 13 pack.',
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
            'If challenge risk is already active, the tribunal-ready pack is usually better because it adds response materials, a tribunal bundle, a legal briefing, and preparation support.',
        },
        {
          question: 'Is this legal advice?',
          answer:
            'No. This is procedural document preparation for a Section 13 rent increase. It helps prepare the notice, market evidence, explanation, and service record from the information you provide.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to support the increase before serving?',
      body:
        'Choose this if you want more than a bare Form 4A and need the notice, current comparables, rent summary, cover letter, and service record aligned.',
      primary: { label: 'Build my supported rent increase', href: product.wizardHref },
      secondary: {
        label: 'I need the tribunal-ready route',
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
      primary: { label: 'Build my supported rent increase', href: product.wizardHref },
      secondary: config.cta.secondaryLabel && config.cta.secondaryHref
        ? { label: config.cta.secondaryLabel, href: config.cta.secondaryHref }
        : undefined,
      guideLinks: [
        {
          label: 'Not sure which pack? Compare Section 13 options',
          href: '/compare/section-13-standard-vs-defence',
        },
        ...descriptor.defaultGuideLinks,
      ],
    },
    faq: {
      title: 'Supported Rent Increase Pack FAQs',
      items: config.faqs,
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: descriptor.displayName,
          description: PRODUCT_OWNER_METADATA.section13Standard.description,
          price: product.price.toString(),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Pricing', url: getCanonicalUrl('/pricing') },
          { name: 'Supported Rent Increase Pack', url: canonicalUrl },
        ])}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
