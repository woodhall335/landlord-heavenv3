import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { PRODUCTS } from '@/lib/pricing/products';
import { getPublicProductDescriptor } from '@/lib/public-products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

const descriptor = getPublicProductDescriptor('complete_pack')!;
const product = PRODUCTS.complete_pack;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);

export const metadata: Metadata = {
  title: `${descriptor.seoTitle} | ${product.displayPrice}`,
  description: descriptor.metaDescription,
  keywords: [
    'complete eviction pack',
    'eviction process england',
    'evict a tenant through court',
    'eviction pack',
    'possession claim pack',
    'court forms',
    'Section 8 notice',
    'N5',
    'N119',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `${descriptor.seoTitle} | ${product.displayPrice}`,
    description: descriptor.metaDescription,
    url: canonicalUrl,
  },
};

const faqs: FAQItem[] = [
  {
    question: 'What does the Stage 2 Court & Possession Pack include?',
    answer:
      'It is the complete combined pack. It includes the current England Section 8 notice and service documents from Stage 1, plus Form N5, Form N119, an arrears schedule, an evidence bundle structure, and court filing guidance for Stage 2.',
  },
  {
    question: 'Who is this built for?',
    answer:
      'It is built for landlords in England who want both the notice/service stage and the court-stage possession paperwork prepared together.',
  },
  {
    question: 'When should I choose this instead of the notice product?',
    answer:
      'Choose this pack when you want the court-possession paperwork as well as the Section 8 notice. If you only need to serve the notice first, the Stage 1 Notice & Service Pack is the better fit.',
  },
  {
    question: 'Does this include N5 and N119?',
    answer:
      'Yes. The pack includes both forms because they are central to the court-stage possession claim for the current England route.',
  },
  {
    question: 'Can I preview before I pay?',
    answer:
      'Yes. You can review the generated pack before purchase and regenerate it later if the facts, dates, or evidence notes change.',
  },
];

export const runtime = 'nodejs';

export default function CompleteEvictionPackPage() {
  const sampleProof = getGoldenPackProofData('complete_pack');

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'complete_pack',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England possession pack | carry the case into court without breaking the file',
      title: descriptor.displayName,
      subtitle:
        'Prepare and file a full Section 8 possession case with both the notice/service stage and the court stage working from the same file.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'Only need Stage 1 first?',
        href: '/products/notice-only',
      },
      feature:
        'Most possession cases fail on notice, service, or consistency errors — this complete pack is designed to prevent those across both stages.',
      mediaSrc: '/images/eviction_packs.webp',
      mediaAlt: 'Preview of the England Stage 2 court and possession pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'complete_pack',
    },
    whatYouGet: {
      title: 'What you get in Stage 2',
      intro:
        'This is the full combined pack. It includes the Stage 1 notice and service documents as well as the Stage 2 court documents, so the case moves from service into possession proceedings without breaking the file.',
      items: [
        {
          name: 'Form 3A (Section 8 Notice)',
          plainEnglish:
            'The official notice that starts the current England Section 8 possession route.',
          function:
            'Gives the tenant formal notice of the grounds relied on before the case moves into court.',
          riskIfMissing:
            'If the notice is wrong or invalid, the possession claim can fail before the court forms even matter.',
          landlordOutcome:
            'Ensures the court case starts from a lawful notice rather than an avoidable defect.',
          includedByDefault: true,
        },
        {
          name: 'Form N5 (Claim for Possession)',
          plainEnglish:
            'The official court claim form used to start possession proceedings.',
          function:
            'Formally opens the possession claim and tells the court what order the landlord is seeking.',
          riskIfMissing:
            'If the claim form is incomplete or wrong, the court can delay or reject the case before it properly starts.',
          landlordOutcome:
            'Lets you move from notice stage into a live possession claim with the correct court form in place.',
          includedByDefault: true,
        },
        {
          name: 'Form N119 (Particulars of Claim)',
          plainEnglish:
            'The detailed statement explaining the possession case to the court.',
          function:
            'Sets out the rent arrears, the grounds relied on, and the facts behind the possession claim.',
          riskIfMissing:
            "If the particulars are weak or unclear, the case loses force because the court cannot see the landlord's position properly.",
          landlordOutcome:
            'Helps the judge understand the claim quickly and see how the facts support the order you want.',
          includedByDefault: true,
        },
        {
          name: 'Arrears Schedule',
          plainEnglish:
            'A running rent breakdown showing exactly what is owed and how the arrears built up.',
          function:
            'Supports both the notice and the court forms with a clear financial record.',
          riskIfMissing:
            'If the arrears evidence is vague or inconsistent, the credibility of the possession case drops immediately.',
          landlordOutcome:
            'Gives the claim a cleaner financial backbone from notice stage through to court.',
          includedByDefault: true,
        },
        {
          name: 'Evidence Bundle',
          plainEnglish:
            'An organised case file bringing together the tenancy, the notice, the service record, the arrears history, and the other papers the court will expect to see.',
          function:
            'Keeps the claim papers consistent and ready to present together instead of leaving key evidence scattered across separate files.',
          riskIfMissing:
            'If the evidence is incomplete or scattered, even a sound possession claim can look weaker and become harder to follow.',
          landlordOutcome:
            'Makes the whole possession case feel more coherent and court-ready.',
          includedByDefault: true,
        },
        {
          name: 'Court Filing Guide',
          plainEnglish:
            'Step-by-step guidance on issuing the possession claim and moving it into court.',
          function:
            'Explains the filing route, what goes with the claim, and the practical steps after the notice stage.',
          riskIfMissing:
            'If the filing stage is handled badly, delays and rework can creep in even after the forms have been generated correctly.',
          landlordOutcome:
            'Helps you submit the case properly and keep the process moving instead of stalling at the filing stage.',
          includedByDefault: true,
        },
      ],
      sampleProof: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    whyYouNeedThis: {
      title: 'Why Stage 2 works better than isolated forms',
      intro:
        'Landlords often lose time when the notice, the claim form, and the evidence are prepared at different times and never read like one joined-up case. This pack is built to stop that happening.',
      cards: [
        {
          title: 'Possession cases are won or lost on continuity',
          body:
            'The court wants the notice, the grounds, the arrears evidence, and the claim forms to tell the same story from start to finish.',
          imageSrc: '/images/the-court-looks-at-the-notice-first.webp',
          imageAlt: 'Court paperwork and notice review illustration',
        },
        {
          title: 'Weak particulars can blunt a good case',
          body:
            "If the landlord's position is not explained clearly in N119, the case is harder to follow even when the facts are sound.",
          imageSrc: '/images/arrears-cases-are-only-clear-as-the-paperwork.webp',
          imageAlt: 'Arrears paperwork and rent schedule illustration',
        },
        {
          title: 'Filing errors create expensive delay',
          body:
            'Even after the notice is served, the case can still be slowed down by bad filing, missing paperwork, or an evidence bundle that was never organised properly.',
          imageSrc: '/images/service-mistakes-undo-good-cases.webp',
          imageAlt: 'Notice service and delivery proof illustration',
        },
      ],
    },
    howThisHelps: {
      title: 'How the full pack improves the landlord outcome',
      intro:
        'The pack is designed to do more than generate forms. It keeps the possession route coherent from the notice through to court and hearing preparation.',
      cards: [
        {
          title: 'It keeps the notice and court paperwork aligned',
          body:
            'The same grounds, dates, and arrears position carry through the file instead of being reassembled manually at claim stage.',
        },
        {
          title: 'It makes the case easier for the judge to read',
          body:
            "When the forms and evidence line up properly, the court can understand the landlord's position more quickly.",
        },
        {
          title: 'It reduces rework when the case progresses',
          body:
            'Because the claim is prepared as one file, you are less likely to go back and rebuild the paperwork after notice has expired.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'The workflow is built for the landlord who already knows the matter may need to go all the way from notice to court.',
      steps: [
        {
          step: 'Step 01',
          title: 'Add the tenancy, breach, and arrears facts',
          body:
            'Enter the details that drive both the Section 8 notice and the court-stage possession claim.',
        },
        {
          step: 'Step 02',
          title: 'Check the weak points before filing',
          body:
            'Review the notice route, the claim details, and the evidence structure while the file is still being built.',
        },
        {
          step: 'Step 03',
          title: 'Generate the full possession pack',
          body:
            'Download the notice, N5, N119, arrears support, and filing guidance as one joined-up England possession case.',
        },
      ],
    },
    cta: {
      title: 'Start Stage 2 now',
      body:
        'Start here if you want the complete combined pack with the notice, service record, claim forms, and hearing support prepared together as one England possession file.',
      primary: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Switch to Stage 1 Notice Pack',
        href: '/products/notice-only',
      },
      guideLinks: descriptor.defaultGuideLinks,
    },
    faq: {
      title: 'Stage 2 Court & Possession FAQs',
      items: faqs,
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
