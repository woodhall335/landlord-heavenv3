import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { PRODUCTS } from '@/lib/pricing/products';
import { getPublicProductDescriptor } from '@/lib/public-products';
import { getCanonicalUrl } from '@/lib/seo';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

const descriptor = getPublicProductDescriptor('money_claim')!;
const product = PRODUCTS.money_claim;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.moneyClaim.title,
  description: PRODUCT_OWNER_METADATA.moneyClaim.description,
  keywords: [
    'money claim online pack',
    'MCOL pack for landlords',
    'rent arrears money claim',
    'particulars of claim template',
    'letter before claim template',
    'landlord MCOL pack',
    'landlord money claim pack',
    'money claim unpaid rent',
    'recover unpaid rent after tenant leaves',
    'tenant debt recovery',
    'claim tenant property damage',
    'county court claim rent arrears',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.moneyClaim.title,
    description: PRODUCT_OWNER_METADATA.moneyClaim.description,
    url: canonicalUrl,
  },
};

const faqs: FAQItem[] = [
  {
    question: 'What does the Money Claim Pack include?',
    answer:
      'It includes the Letter Before Claim, reply and financial statement forms, Particulars of Claim, arrears schedule, interest calculation, the MCOL filing guide, and enforcement guidance for an England landlord claim.',
  },
  {
    question: 'Can I claim for damage or cleaning after the tenant leaves?',
    answer:
      'Yes. The pack can be used for rent arrears, damage, cleaning costs, bills, and other tenancy-related debts, provided you have evidence to support the figures.',
  },
  {
    question: 'Can I combine rent arrears with damage claims?',
    answer:
      'Yes. The workflow lets you build one claim file that covers multiple debt heads where that is appropriate.',
  },
  {
    question: 'Can I claim interest on the debt?',
    answer:
      'Yes. The pack includes an interest calculation so the claim value is worked out more clearly before the case is filed.',
  },
  {
    question: 'What happens after judgment if the tenant still does not pay?',
    answer:
      'The enforcement guide explains the next-stage options such as bailiffs, attachment of earnings, and charging orders so the case does not stop at judgment.',
  },
  {
    question: 'Is this a court approved money claim?',
    answer:
      'No. Courts do not pre-approve any notice, claim form, or agreement. This Money Claim pack follows current England rules and includes checks to help you file correctly.',
  },
  {
    question: 'Is this legally binding?',
    answer:
      "Yes - when completed and filed correctly. This pack follows post-May 2026 England rules, and the checklist helps you avoid common money claim mistakes.",
  },
];

export const runtime = 'nodejs';

export default function MoneyClaimPage() {
  const sampleProof = getGoldenPackProofData('money_claim');
  const samplePage = getProductSamplePageByPackKey('money_claim');

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'money_claim',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'Unpaid rent, tenant debt, MCOL/N1 guidance, and preview before paying',
      title: 'Recover unpaid rent with a landlord money claim pack',
      subtitle:
        'Use this when a tenant owes rent arrears, damage, bills, or other tenancy debt. Build the letter before claim, Particulars of Claim, debt schedule, interest calculation, and MCOL/N1 filing guidance in one file you can check before paying.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'Need possession instead?',
        href: '/products/complete-pack',
      },
      feature:
        'Choose this when recovering money is the job. If the urgent problem is getting possession of the property, use the Section 8 possession route instead. Procedural document pack, not legal advice.',
      children: (
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-white/90 backdrop-blur">
          <p className="font-semibold text-white">Choose this if the tenant owes money.</p>
          <p className="mt-1">
            It is the debt-recovery route for rent arrears, damage, bills, and tenancy debt.
            It does not replace a Section 8 notice or possession claim pack.
          </p>
        </div>
      ),
      mediaSrc: '/images/money_claims.webp',
      mediaAlt: 'Preview of the landlord money claim pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'money_claim',
    },
    afterPostHeroContent: (
      <section className="scroll-mt-24 bg-white py-10 md:py-12" aria-label="Money claim route">
        <Link href={descriptor.wizardHref} className="block w-full">
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/money-claim-mobile.webp" />
            <Image
              src="/images/money-claim-desktop.webp"
              alt="Choose the money claim route"
              width={1672}
              height={941}
              className="h-auto w-full"
              sizes="100vw"
            />
          </picture>
        </Link>
      </section>
    ),
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'Preview the debt-recovery file before you pay. It includes the letter before claim, debt schedule, Particulars of Claim, MCOL/N1 guidance, and follow-through support.',
      imageHref: descriptor.wizardHref,
      imageSrc: '/images/money-claim-wizard.webp',
      imageAlt: 'Money claim wizard preview',
      includedBullets: [
        'Letter before claim',
        'Reply form and financial statement',
        'Particulars of Claim and debt schedules',
        'Filing guidance and enforcement support',
      ],
      bestFor:
        'Best when the tenant owes rent arrears, damage, bills, or other tenancy debt and you want a clear debt-recovery file instead of improvising the paperwork.',
      notFor:
        'Not the right fit if your next step is possession, serving a Section 8 notice, or preparing N5 and N119.',
    },
    whatYouGet: {
      title: 'See what the money claim file looks like',
      intro:
        'Read the sample debt-recovery documents on the page, including the letter before claim template, Particulars of Claim template, debt schedule, and documents used to explain and issue the claim.',
      sampleProof: sampleProof ? (
        <GoldenPackProof data={sampleProof} samplePageHref={samplePage?.samplePath} />
      ) : undefined,
    },
    comparisonBlock: {
      title: 'Compare the debt route with the possession route',
      intro:
        'Some landlords need to recover unpaid rent or tenant debt. Some need the tenant to leave. Some need both, but not always through the same product.',
      routeGridClassName: 'mt-8 grid gap-5 lg:grid-cols-2',
      routeCards: [
        {
          name: descriptor.displayName,
          priceLabel: product.displayPrice,
          whatItIs:
            'The route for unpaid rent, damage, bills, guarantor debt, and other tenancy-related money claims.',
          problemItSolves:
            'Gives you the letter before claim, figures, and court paperwork needed to pursue the debt.',
          riskIfWrong:
            'If you use the debt route when the real issue is possession, the occupation problem can remain unresolved.',
          landlordOutcome:
            'Best when recovering money is the main job.',
          href: descriptor.landingHref,
          ctaLabel: 'Prepare my money claim',
          imageSrc: '/images/money-claim-selector.webp',
          imageAlt: 'Money claim pack route',
        },
        {
          name: 'Stage 2: Section 8 Court & Possession Pack',
          priceLabel: PRODUCTS.complete_pack.displayPrice,
          whatItIs:
            'The full Section 8 route for landlords who need the notice, the court claim, and the possession file kept together.',
          problemItSolves:
            'Handles the notice-to-court route when the main issue is recovering the property.',
          riskIfWrong:
            'If you buy a possession route when you only need money recovery, you may still need a separate debt file afterwards.',
          landlordOutcome:
            'Best when possession is the real next step.',
          href: '/products/complete-pack',
          ctaLabel: 'Compare the possession route',
          imageSrc: '/images/section-8-court-paperwork.webp',
          imageAlt: 'Section 8 court and possession pack route',
        },
      ],
    },
    objectionBlock: {
      title: 'Common money-claim questions before you start',
      intro:
        'Most questions are about what the pack can cover. These are the points landlords usually check first.',
      items: [
        {
          question: 'Can I use this after the tenant has already left?',
          answer:
            'Yes. If the debt remains after the tenancy has ended, the pack can still help you prepare the demand letter, schedules, and claim file.',
        },
        {
          question: 'Can I claim for more than just rent arrears?',
          answer:
            'Yes. The pack can cover rent arrears, damage, cleaning costs, bills, and other tenancy-related debt where you have figures and evidence to support the claim.',
        },
        {
          question: 'What if I also need possession?',
          answer:
            'If the immediate problem is getting the tenant out, the Section 8 possession route is usually the better first step. Use this pack when recovering the debt is the job you need to do now.',
        },
        {
          question: 'Is this legal advice?',
          answer:
            'No. This is a procedural document pack that prepares the debt claim paperwork from the information you provide. For disputed, high-value, or unusual claims, take legal advice before filing.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to prepare the money claim?',
      body:
        'Prepare a landlord money claim pack so the letter before claim, debt schedules, and filing steps stay together from the start.',
      primary: {
        label: 'Prepare my money claim',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Need possession instead?',
        href: '/products/complete-pack',
      },
    },
    whyYouNeedThis: {
      title: 'Why a landlord money claim needs more than one form',
      intro:
        'Debt recovery becomes harder when the demand letter, figures, and court claim say slightly different things. This pack keeps them aligned.',
      cards: [
        {
          title: 'The pre-action stage matters',
          body:
            'A landlord who goes straight to court without a clear pre-action paper trail can make the claim harder to defend.',
        },
        {
          title: 'Clear figures decide whether the claim feels credible',
          body:
            'If the rent schedule, damage totals, or interest position are unclear, the claim is easier to challenge.',
        },
        {
          title: 'Judgment is not the end of the job',
          body:
            'A debt case only turns into recovery if you know what to do after the court order is made.',
        },
      ],
    },
    howThisHelps: {
      title: 'How this improves the landlord outcome',
      intro:
        'The pack helps you explain the debt clearly and stay organised if the matter reaches court or enforcement.',
      cards: [
        {
          title: 'It keeps the debt case consistent',
          body:
            'The letter before claim, Particulars of Claim, and schedules all point to the same debt position.',
        },
        {
          title: 'It makes the claim easier to understand',
          body:
            'A structured claim is easier for the tenant to respond to and easier for the court to follow.',
        },
        {
          title: 'It keeps recovery in view after judgment',
          body:
            'The pack shows what can happen if you win but still need to enforce the order.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'We keep the demand letter, figures, and claim papers tied to the same facts.',
      steps: [
        {
          step: 'Step 01',
          title: 'Add the debt details',
          body:
            'Enter the rent arrears, damage, bills, or other amounts owed and explain what the tenant is being asked to pay.',
        },
        {
          step: 'Step 02',
          title: 'Build the pre-action and claim paperwork',
          body:
            'Prepare the letter, reply documents, claim narrative, and schedules before you issue.',
        },
        {
          step: 'Step 03',
          title: 'File and follow through',
          body:
            'Use the filing guide to issue the claim and keep the enforcement guidance ready if judgment still does not lead to payment.',
        },
      ],
    },
    cta: {
      title: 'Prepare the money claim without piecing it together',
      body:
        'If a tenant owes rent, damage, bills, or other tenancy debt, start here so the letter before claim, claim paperwork, and recovery steps stay together.',
      primary: {
        label: 'Prepare my money claim',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Need possession instead?',
        href: '/products/complete-pack',
      },
      guideLinks: descriptor.defaultGuideLinks,
    },
    faq: {
      title: 'Money Claim Pack FAQs',
      items: faqs,
      includeSchema: true,
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFAFF]">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={productSchema({
          name: descriptor.displayName,
          description: PRODUCT_OWNER_METADATA.moneyClaim.description,
          price: product.price.toString(),
          url: canonicalUrl,
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Products', url: getCanonicalUrl('/pricing') },
          { name: descriptor.displayName, url: canonicalUrl },
        ])}
      />
      <PublicProductSalesPage content={content} />
    </div>
  );
}
