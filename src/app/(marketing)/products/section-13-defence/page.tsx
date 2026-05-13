import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
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

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'section13_defensive',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England Section 13 defence pack for landlords expecting a challenge',
      title: config.heroTitle,
      subtitle: config.heroSubtitle,
      primaryCta: { label: config.ctaLabel, href: product.wizardHref },
      secondaryCta: { label: 'Compare the standard option', href: '/products/section-13-standard' },
      feature:
        'Built for landlords who want the notice, evidence, response notes, and tribunal bundle prepared together.',
      mediaSrc: '/images/wizard-icons/41-rent.png',
      mediaAlt: 'Section 13 defence documents',
      showReviewPill: true,
      children: (
        <ul className="mt-6 space-y-2 text-sm text-white/90 md:text-base">
          {config.heroBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ),
    },
    earlyProofBand: {
      preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
      fullWidthPreview: true,
    },
    whatYouGet: {
      hideSection: true,
      title: '',
      intro: '',
    },
    comparisonBlock: {
      title: 'Standard and defence solve different rent-increase jobs',
      intro:
        'The standard pack is for serving and explaining the increase. The defence pack is for cases where challenge risk and tribunal structure matter from the start.',
      routeGridClassName: 'mt-8 grid gap-6 lg:grid-cols-2',
      routeCards: [
        {
          name: 'Standard Section 13 Rent Increase Pack',
          whatItIs:
            'For landlords who want to serve a Section 13 rent increase in England with Form 4A, market evidence, and a record of service prepared together.',
          problemItSolves:
            'Helps you get the figure, dates, notice, explanation, and service steps right before the tenant receives anything.',
          riskIfWrong:
            'A bare form with weak dates or no evidence can invite questions, delays, or a challenge that is harder to answer.',
          landlordOutcome:
            'Best when the increase is straightforward and you want a clear, service-ready pack.',
          href: '/products/section-13-standard',
          ctaLabel: 'Open the Standard Section 13 Rent Increase Pack',
          priceLabel: PRODUCTS.section13_standard.displayPrice,
          imageSrc: '/images/rent-increase-standard.webp',
          imageAlt: 'Standard Section 13 rent increase pack',
        },
        {
          name: 'Challenge-Ready Section 13 Defence Pack',
          whatItIs:
            'For landlords who already expect the proposed rent to be disputed, or who want a stronger file before serving.',
          problemItSolves:
            'Organises the evidence, response notes, and tribunal-ready material around the rent figure from the start.',
          riskIfWrong:
            'If challenge risk is obvious and you start with a light file, you may have to rebuild the evidence after the tenant objects.',
          landlordOutcome:
            'Best when you want to be ready for questions, negotiation, or tribunal scrutiny.',
          href: '/products/section-13-defence',
          ctaLabel: 'Open the Challenge-Ready Defence Pack',
          priceLabel: product.displayPrice,
          imageSrc: '/images/rent-increase-defence.webp',
          imageAlt: 'Challenge-ready Section 13 defence pack',
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
      ],
    },
    midPageCta: {
      title: 'Ready to prepare the stronger pack?',
      body:
        'Start here if you want Form 4A, market evidence, response wording, and the tribunal-facing bundle built around the same rent figure.',
      primary: { label: 'Start the challenge-ready wizard', href: product.wizardHref },
      secondary: {
        label: 'I only need the standard option',
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
      primary: { label: 'Start the challenge-ready defence option', href: product.wizardHref },
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
          description: PRODUCT_OWNER_METADATA.section13Defence.description,
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
