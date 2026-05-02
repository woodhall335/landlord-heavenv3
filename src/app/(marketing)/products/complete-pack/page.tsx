import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import { Section8JourneyTimeline } from '@/components/eviction/Section8JourneyTimeline';
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
      trustText: 'England possession pack | includes Stage 1 notice and Stage 2 court paperwork together',
      title: descriptor.displayName,
      subtitle:
        'Choose Stage 2 when you want the full combined route from notice through court. This pack includes the Stage 1 notice and service file as well as the Stage 2 claim forms, evidence structure, and hearing support.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'Only need Stage 1 first?',
        href: '/products/notice-only',
      },
      feature:
        'You do not need to buy Stage 1 separately if you already want the court pack - this route keeps the full file aligned from the start.',
      mediaSrc: '/images/eviction_packs.webp',
      mediaAlt: 'Preview of the England Stage 2 court and possession pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'complete_pack',
    },
    postHeroContent: (
      <Section8JourneyTimeline
        stage="stage2"
        title="See the full notice-to-court path"
        intro="The Complete Pack carries the same England Section 8 case from notice through expiry, claim, and hearing, so the landlord can see the whole route before starting."
      />
    ),
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'This is the combined route for landlords who already expect the case may need to continue into possession proceedings and want to see the actual Section 8 notice, claim forms, and court file before paying.',
      includedBullets: [
        'Stage 1 Form 3A notice and service file included in the same case',
        'N5, N119, witness statement, and court bundle support added from the start',
        'One joined-up possession file instead of separate notice and court rebuilds',
      ],
      bestFor:
        'The case is likely to continue into court, or you want the notice and possession claim prepared together from the beginning.',
      notFor:
        'You only need to serve the notice first and want a lighter Stage 1 route before deciding whether a possession claim is necessary.',
    },
    decisionBlock: {
      title: 'Choose Stage 2 if you want the full Section 8 court route from the start',
      intro:
        'This page is for landlords who do not just want a notice. It is for the full possession route: notice, service record, N5, N119, court readiness, and hearing support kept together in one case file.',
      cards: [
        {
          eyebrow: 'Choose this route',
          title: 'Start with the full possession route now',
          body:
            'Use the Complete Pack when you already expect the case may need to continue into possession proceedings and you want the Section 8 notice and the court paperwork aligned from day one.',
          tone: 'positive',
        },
        {
          eyebrow: 'Important fit point',
          title: 'You do not need to buy Stage 1 separately first',
          body:
            'The Complete Pack already includes the Stage 1 Section 8 notice and service file. If you want N5, N119, witness statement, and hearing support as well, this is the right route from the start.',
          tone: 'neutral',
        },
      ],
      primary: {
        label: 'Start the full Section 8 court route',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Only serving notice first?',
        href: '/products/notice-only',
      },
    },
    whatYouGet: {
      title: 'What you get in the combined pack',
      intro:
        'This is the full combined pack. It includes the Stage 1 Section 8 notice file plus the court-stage possession paperwork, so you can inspect the joined-up notice, claim forms, and court support before buying.',
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
    comparisonBlock: {
      title: 'Stage 2 is for the full court route, not just extra forms',
      intro:
        'The key difference is not simply price or document count. Stage 2 is the route for landlords who want the notice and the possession claim built together instead of serving first and deciding later.',
      routeCards: [
        {
          name: 'Stage 1: Notice and service first',
          whatItIs:
            'Best when you only need to serve Form 3A correctly and keep the service record straight for now.',
          problemItSolves:
            'Stops notice-stage mistakes before they undermine the case.',
          riskIfWrong:
            'If you really need to issue proceedings soon, you may still need to step up into the wider court file afterwards.',
          landlordOutcome:
            'Lets you serve the notice properly and move onward later only if needed.',
          href: '/products/notice-only',
          ctaLabel: 'See the notice-first route',
          imageSrc: '/images/notice.webp',
          imageAlt: 'Serve Section 8 notice first',
        },
        {
          name: 'Stage 2: Notice, claim forms, and hearing support together',
          whatItIs:
            'Best when you want the Section 8 notice, N5, N119, court readiness, and hearing support in one route.',
          problemItSolves:
            'Stops the notice file and the court file drifting apart or being rebuilt separately.',
          riskIfWrong:
            'If you only need to serve the notice now, the full court route can be more than you need at this stage.',
          landlordOutcome:
            'Gives you a joined-up possession file from notice through court without buying Stage 1 separately first.',
          href: '/products/complete-pack',
          ctaLabel: 'This is my route',
          priceLabel: product.displayPrice,
          imageSrc: '/images/hearing.webp',
          imageAlt: 'Section 8 claim and hearing route',
        },
      ],
    },
    objectionBlock: {
      title: 'Common questions before you start the Complete Pack',
      intro:
        'The preview is there to prove that this is a real court-facing file, not a loose bundle. These are the questions most landlords ask before choosing the full route.',
      items: [
        {
          question: 'Do I need Stage 1 first?',
          answer:
            'No. The Complete Pack already includes the full Stage 1 Section 8 notice and service file, so you do not need to buy that pack separately if you already want the court route.',
        },
        {
          question: 'Is this only court forms?',
          answer:
            'No. It includes the Section 8 notice, service record, and supporting notice-stage file as well as N5, N119, witness statement, court bundle support, and hearing preparation.',
        },
        {
          question: 'Does this include the Section 8 notice and service record too?',
          answer:
            'Yes. The whole point of the Complete Pack is that the notice stage and the court stage stay aligned in one possession file instead of being prepared separately.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to start the full Section 8 court route?',
      body:
        'Choose the Complete Pack if you want the notice, claim forms, and hearing support prepared together in one England possession file.',
      primary: {
        label: 'Start the full court-route wizard',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'I only need to serve notice first',
        href: '/products/notice-only',
      },
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
        'Start here if you want the complete combined pack with the notice, service record, claim forms, and hearing support prepared together as one England possession file, without buying Stage 1 separately first.',
      primary: {
        label: 'Start the full Section 8 court route',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Only serving notice first?',
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
