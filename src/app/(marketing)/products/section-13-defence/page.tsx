import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { SECTION13_DEFENCE_PAGE } from '@/lib/marketing/section13-products';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getPublicProductDescriptor } from '@/lib/public-products';

const config = SECTION13_DEFENCE_PAGE;
const descriptor = getPublicProductDescriptor('section13_defensive')!;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);
const product = PRODUCTS[config.productSku];

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.section13Defence.title,
  description: PRODUCT_OWNER_METADATA.section13Defence.description,
  keywords: config.keywords,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.section13Defence.title,
    description: PRODUCT_OWNER_METADATA.section13Defence.description,
    url: canonicalUrl,
  },
};

export default function Section13DefenceProductPage() {
  const sampleProof = getGoldenPackProofData('section13_defensive');
  const samplePage = getProductSamplePageByPackKey('section13_defensive');
  const samplePreviewEntries = config.packBreakdown.map((item) => ({
    title: item.name,
    description: item.plainEnglish,
    categoryLabel: 'Pack output',
  }));

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'section13_defensive',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'Section 13 challenge support | Form 4A, market evidence, response wording, tribunal bundle',
      title: config.heroTitle,
      subtitle: config.heroSubtitle,
      primaryCta: { label: config.ctaLabel, href: product.wizardHref },
      secondaryCta: { label: 'Compare the supported option', href: '/products/section-13-standard' },
      feature:
        'Choose this when the tenant may challenge the rent or you want response materials ready before serving. For a straightforward increase, the Supported pack is usually enough.',
      mediaSrc: '/images/wizard-icons/41-rent.png',
      mediaAlt: 'Section 13 defence documents',
      showReviewPill: true,
      showTrustPositioningBar: true,
      trustPositioningPreset: 'section13',
      children: (
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-white/90 backdrop-blur">
          <p className="font-semibold text-white">Choose this if pushback is likely.</p>
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
        'Preview the tribunal-ready rent increase file before you pay, including market evidence, response wording, legal briefing, and bundle support. This is procedural document preparation, not representation.',
      preview: (
        <GoldenPackProof
          data={sampleProof}
          fallbackEntries={samplePreviewEntries}
          samplePageHref={samplePage?.samplePath}
        />
      ),
      fullWidthPreview: true,
    },
    whatYouGet: {
      title: 'What you get',
      intro: config.packIntro,
      items: config.packBreakdown,
    },
    comparisonBlock: {
      title: 'Standard and defence solve different rent-increase jobs',
      intro:
        'The standard pack is for serving and explaining the increase. The defence pack is for cases where challenge risk and tribunal structure matter from the start.',
      routeGridClassName: 'mt-8 grid gap-6 lg:grid-cols-2',
      routeCards: [
        {
          name: 'Supported Rent Increase Pack',
          whatItIs:
            'For landlords who want to serve a market-supported Section 13 rent increase in England with Form 4A, current comparables, and a record of service prepared together.',
          problemItSolves:
            'Helps you get the figure, dates, notice, rent summary, nearby advertised rental comparisons, and service steps right before the tenant receives anything.',
          riskIfWrong:
            'A bare form with weak dates or no evidence can invite questions, delays, or a challenge that is harder to answer.',
          landlordOutcome:
            'Best when the increase is straightforward and you want a clear, service-ready pack.',
          href: '/products/section-13-standard',
          ctaLabel: 'Build my supported rent increase',
          priceLabel: PRODUCTS.section13_standard.displayPrice,
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
          priceLabel: product.displayPrice,
          imageSrc: '/images/rent-increase-defence.webp',
          imageAlt: 'Tribunal-ready Section 13 rent increase pack',
        },
      ],
    },
    objectionBlock: {
      title: 'Questions landlords ask before choosing the defence route',
      intro:
        'If you think the tenant may push back, these are the points worth checking before you start.',
      items: [
        {
          question: 'Does this still include the official Form 4A notice?',
          answer:
            'Yes. You still get Form 4A. This route adds the argument summary, evidence structure, response wording, and tribunal bundle around it.',
        },
        {
          question: 'When is this better than the standard pack?',
          answer:
            'Choose this when a challenge already feels likely, the tenant has questioned the figure, or you want the response materials ready before things escalate.',
        },
        {
          question: 'Is this only for a tribunal hearing?',
          answer:
            'No. It also helps before a hearing by keeping your evidence, explanation, and replies consistent while objections are being raised.',
        },
        {
          question: 'Is this legal advice or tribunal representation?',
          answer:
            'No. This is procedural document preparation for a higher-risk Section 13 rent increase. It helps organise the notice, evidence, response wording, briefing, and bundle support, but it is not representation.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to prepare the stronger pack?',
      body:
            'Choose this if you want Form 4A, current market evidence, response wording, legal briefing, and the tribunal-facing bundle built around the same rent figure.',
      primary: { label: 'Prepare for a rent challenge', href: product.wizardHref },
      secondary: {
        label: 'I only need the supported option',
        href: '/products/section-13-standard',
      },
    },
    whyYouNeedThis: {
      title: 'Why this route helps',
      intro: config.whyYouNeedThis.intro,
      cards: config.whyYouNeedThis.cards,
    },
    howThisHelps: {
      title: 'What it helps you do',
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
      primary: { label: 'Prepare for a rent challenge', href: product.wizardHref },
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
      title: 'Tribunal-Ready Rent Increase Pack FAQs',
      items: config.faqs,
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: descriptor.displayName,
          description: PRODUCT_OWNER_METADATA.section13Defence.description,
          price: product.price.toString(),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Pricing', url: getCanonicalUrl('/pricing') },
          { name: 'Tribunal-Ready Rent Increase Pack', url: canonicalUrl },
        ])}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
