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
      secondaryCta: { label: 'Read the rent increase guide', href: '/products/rent-increase' },
      feature:
        'Built for landlords who need the notice, the evidence, and the tribunal-facing argument to stay clear and consistent under challenge.',
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
        </ul>
      ),
    },
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'This is the stronger option when you want to see the actual challenge-ready Section 13 pack before you pay, including the tribunal-facing bundle, argument materials, and response structure.',
      includedBullets: [
        'Official Form 4A notice kept aligned with the wider defence pack',
        'Tribunal-facing bundle, argument summary, and justification analysis',
        'Response, evidence, and challenge-preparation materials prepared together',
      ],
      bestFor:
        'You expect pushback, want the response materials ready, or want the stronger tribunal-facing pack from the start.',
      notFor:
        'You mainly need to serve and explain the increase now, without the fuller challenge layer.',
      preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    decisionBlock: {
      title: 'Choose the defence option if the Section 13 pack needs to hold up under challenge',
      intro:
        'This page is for landlords who do not just want to serve the notice. It is for cases where the increase may be tested, the evidence needs to stay organised, and the file needs to be closer to tribunal-ready from the start.',
      cards: [
        {
          eyebrow: 'Choose this option',
          title: 'Prepare the challenge-ready pack now',
          body:
            'Use the defence pack when the key concern is not just Form 4A itself, but whether the notice, comparables, argument summary, response materials, and bundle will still hold together when the tenant pushes back.',
          tone: 'positive',
        },
        {
          eyebrow: 'Choose the other option',
          title: 'Do not overbuy if you simply need to serve and evidence the increase',
          body:
            'If you mainly want to set the new rent, support it with comparables, and serve the notice properly, the Standard Section 13 Rent Increase Pack is often the better fit.',
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
        'The standard pack is for serving and explaining the increase cleanly. The defence pack is for cases where challenge risk, response discipline, and tribunal structure matter from the outset.',
      routeCards: [
        {
          name: 'Standard Section 13 Rent Increase Pack',
          whatItIs:
            'Best when you want to propose the increase properly with Form 4A, comparables, and a clean service record.',
          problemItSolves:
            'Stops the increase from looking unsupported or procedurally weak when it is first served.',
          riskIfWrong:
            'If the tenant is likely to challenge aggressively, you may still need to add a fuller defensive layer later.',
          landlordOutcome:
            'Gives you a clear, evidence-backed rent increase pack without the heavier tribunal-preparation layer.',
          href: '/products/section-13-standard',
          ctaLabel: 'Compare the standard option',
          imageSrc: '/images/wizard-icons/41-rent.png',
          imageAlt: 'Standard Section 13 pack',
        },
        {
          name: 'Challenge-Ready Section 13 Defence Pack',
          whatItIs:
            'Best when you want the notice, comparables, response materials, and tribunal-facing bundle in one stronger pack.',
          problemItSolves:
            'Prevents the rent increase case from being rebuilt later if the tenant challenges the figure or the service.',
          riskIfWrong:
            'If you only need to serve and explain the increase now, this route can be more than you need at this stage.',
          landlordOutcome:
            'Gets you much closer to a tribunal-ready position from day one if the increase is likely to be tested.',
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
        'The preview is there to prove the pack is real and structured. These are the points landlords usually want answered before paying for the stronger Section 13 option.',
      items: [
        {
          question: 'Does this still include the official Form 4A notice?',
          answer:
            'Yes. The defence route still includes the core Form 4A notice. What changes is the depth around it: the argument summary, bundle, response materials, and stronger evidence structure.',
        },
        {
          question: 'When is this better than the standard pack?',
          answer:
            'It is the better option when challenge risk is already visible, the tenant is likely to test the increase, or you want the fuller response-and-bundle layer prepared before the case starts drifting.',
        },
        {
          question: 'Is this only for a tribunal hearing?',
          answer:
            'No. It is also valuable earlier because it keeps the rent increase pack coherent while objections are being raised and answered, rather than waiting until the dispute is already formal.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to build the stronger challenge-ready pack?',
      body:
        'Start here if you want the notice, market evidence, response materials, and tribunal-facing bundle prepared together before the increase comes under pressure.',
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
      guideLinks: descriptor.defaultGuideLinks,
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
