import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { WhatsIncludedInteractive } from '@/components/value-proposition';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { PRODUCTS } from '@/lib/pricing/products';
import { getMoneyClaimPreviewData } from '@/lib/previews/moneyClaimPreviews';
import { getPublicProductDescriptor } from '@/lib/public-products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

const descriptor = getPublicProductDescriptor('money_claim')!;
const product = PRODUCTS.money_claim;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);

export const metadata: Metadata = {
  title: `${descriptor.seoTitle} | Recover unpaid rent and tenant debt | ${product.displayPrice}`,
  description: descriptor.metaDescription,
  keywords: [
    'money claim',
    'unpaid rent',
    'property damage',
    'landlord money claim pack',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `${descriptor.seoTitle} | Recover unpaid rent and tenant debt | ${product.displayPrice}`,
    description: descriptor.metaDescription,
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
];

export const runtime = 'nodejs';

export default async function MoneyClaimPage() {
  const previews = await getMoneyClaimPreviewData();
  const sampleProof = getGoldenPackProofData('money_claim', {
    previewDocs: previews,
  });

  const content: ProductSalesPageContent = {
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England county court money claim pack | unpaid rent, bills, damage, and guarantor debt',
      title: descriptor.displayName,
      subtitle:
        'Recover unpaid rent or other tenancy debt through a structured England claim file instead of trying to piece the pre-action letter, court forms, and enforcement steps together by hand.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'Need possession as well?',
        href: '/products/complete-pack',
      },
      feature:
        'Built for landlords who want the debt file to stay clear from the first demand letter through to enforcement.',
      mediaSrc: '/images/money_claims.webp',
      mediaAlt: 'Preview of the landlord money claim pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'money_claim',
    },
    whatYouGet: {
      title: 'What you get in the Money Claim Pack',
      intro:
        'This is a debt-recovery system, not just a claim form. Each part of the pack exists to move the case from pre-action pressure into court and then into enforcement if the tenant still does not pay.',
      items: [
        {
          name: 'Letter Before Claim',
          plainEnglish: 'The formal demand letter sent before court action starts.',
          function:
            'Sets out the debt and gives the tenant the pre-action opportunity to respond or pay.',
          riskIfMissing:
            'If you skip the pre-action letter stage, the claim can look procedurally weak before it even reaches the substance of the debt.',
          landlordOutcome:
            'Puts pressure on the tenant to resolve the matter early and helps the claim start on the right footing if payment is not made.',
          includedByDefault: true,
        },
        {
          name: 'Reply Form & Financial Statement',
          plainEnglish:
            'The tenant response documents that sit alongside the pre-action letter.',
          function:
            'Lets the tenant respond properly and disclose their financial position where the protocol expects that process to be offered.',
          riskIfMissing:
            'If the pre-action paperwork is incomplete, the landlord risks looking non-compliant when the matter reaches court.',
          landlordOutcome:
            'Strengthens the file by showing the claim was handled properly before proceedings were issued.',
          includedByDefault: true,
        },
        {
          name: 'Particulars of Claim',
          plainEnglish: 'The detailed written case explaining what is owed and why.',
          function:
            "Sets out the arrears, damage, bills, or other debt so the court can understand the landlord's claim clearly.",
          riskIfMissing:
            'If the claim is vague or poorly structured, the tenant has more room to dispute it and the court has more work to do to understand it.',
          landlordOutcome:
            'Helps the claim read as a clear debt case instead of a loose collection of figures.',
          includedByDefault: true,
        },
        {
          name: 'Arrears Schedule',
          plainEnglish:
            'A full rent and debt schedule showing what is owed and how the balance is made up.',
          function:
            'Supports the claim with a clear financial record that the tenant and the court can follow.',
          riskIfMissing:
            'If the numbers are unclear or inconsistent, the credibility of the claim drops quickly.',
          landlordOutcome:
            'Makes it easier to prove the debt and keeps the claim value grounded in one written schedule.',
          includedByDefault: true,
        },
        {
          name: 'Interest Calculation',
          plainEnglish:
            'A worked calculation of interest that can be added to the claim where appropriate.',
          function:
            'Helps you calculate the claim value more accurately instead of guessing the total due.',
          riskIfMissing:
            'If the interest figure is missing or wrong, the landlord risks under-claiming or weakening part of the money case unnecessarily.',
          landlordOutcome:
            'Improves the accuracy of the debt claim and helps you recover the full amount you are entitled to pursue.',
          includedByDefault: true,
        },
        {
          name: 'Filing Guide (MCOL)',
          plainEnglish:
            'Step-by-step guidance on issuing the money claim through the England court process.',
          function:
            'Explains how to take the finished paperwork into the court filing stage, including the Money Claim Online route where relevant.',
          riskIfMissing:
            'If the filing stage is handled badly, the claim can be delayed or rejected even when the debt paperwork itself is sound.',
          landlordOutcome:
            'Helps you submit the claim more smoothly and with fewer avoidable mistakes.',
          includedByDefault: true,
        },
        {
          name: 'Enforcement Guide',
          plainEnglish:
            'A guide to the practical steps after judgment if the tenant still does not pay.',
          function:
            'Explains how to move from judgment into enforcement options such as bailiffs or other recovery steps.',
          riskIfMissing:
            'Many landlords win the claim but then stall because they do not know how to turn judgment into actual recovery.',
          landlordOutcome:
            'Keeps the pack focused on getting paid, not just on winning paperwork.',
          includedByDefault: true,
        },
      ],
      preview: previews.length ? (
        <div className="overflow-hidden rounded-[2rem] border border-[#E8E1F8] bg-white shadow-[0_16px_40px_rgba(24,11,49,0.06)]">
          <WhatsIncludedInteractive
            product="money_claim"
            previews={previews}
            showIntro={false}
            titleOverride="Preview the money claim pack"
            subtitleOverride="Review the demand letter, claim paperwork, and debt schedules before you buy."
          />
        </div>
      ) : undefined,
      sampleProof: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    whyYouNeedThis: {
      title: 'Why a landlord money claim needs more than one form',
      intro:
        'Debt recovery breaks down when the demand letter, the figures, and the court claim all tell slightly different stories. This pack is built to stop the debt file drifting like that.',
      cards: [
        {
          title: 'The pre-action stage matters',
          body:
            'A landlord who goes straight to court without a proper pre-action paper trail can make the claim harder to defend procedurally.',
        },
        {
          title: 'Clear figures decide whether the claim feels credible',
          body:
            'If the rent schedule, damage totals, or interest position are unclear, the money claim is much easier to challenge.',
        },
        {
          title: 'Judgment is not the end of the job',
          body:
            'A debt case only turns into recovery if the landlord knows what to do after the court order is made.',
        },
      ],
    },
    howThisHelps: {
      title: 'How this improves the landlord outcome',
      intro:
        'The pack is designed to help you recover money properly, communicate the debt clearly, and stay organised if the matter reaches court or enforcement.',
      cards: [
        {
          title: 'It keeps the debt case consistent',
          body:
            'The demand letter, Particulars of Claim, and schedules all point to the same debt position instead of being assembled from different sources.',
        },
        {
          title: 'It makes the claim easier to understand',
          body:
            'A structured claim is easier for the tenant to respond to and easier for the court to follow.',
        },
        {
          title: 'It keeps recovery in view after judgment',
          body:
            'The pack does not stop at issue. It shows what happens if you win but still need to enforce the order.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'The workflow is designed to take you from the debt facts to a filed claim without losing the thread of the case.',
      steps: [
        {
          step: 'Step 01',
          title: 'Add the debt details',
          body:
            'Enter the rent arrears, damage, bills, or other amounts owed and make clear what the tenant is being asked to pay.',
        },
        {
          step: 'Step 02',
          title: 'Build the pre-action and claim paperwork',
          body:
            'Generate the letter, reply documents, claim narrative, and schedules so the file is ready before you issue.',
        },
        {
          step: 'Step 03',
          title: 'File and follow through',
          body:
            'Use the filing guide to issue the claim and keep the enforcement guidance ready in case judgment still does not lead to payment.',
        },
      ],
    },
    cta: {
      title: 'Start the money claim properly',
      body:
        'If a tenant owes rent, damage, bills, or other tenancy debt, start here so the pre-action letter, claim paperwork, and recovery steps stay joined up from the start.',
      primary: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'See the Complete Eviction Pack',
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
          description: descriptor.metaDescription,
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
