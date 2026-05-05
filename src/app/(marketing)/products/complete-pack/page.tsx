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
      trustText: 'England possession pack | notice and court paperwork together',
      title: descriptor.displayName,
      subtitle:
        'Choose Stage 2 when you want the Section 8 notice and the court possession paperwork prepared together. It includes the Stage 1 notice file plus the claim forms, evidence structure, and hearing support.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'Only need Stage 1 first?',
        href: '/products/notice-only',
      },
      feature:
        'You do not need to buy Stage 1 separately if you already want the court pack. This route keeps the file aligned from the start.',
      mediaSrc: '/images/eviction_packs.webp',
      mediaAlt: 'Preview of the England Stage 2 court and possession pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'complete_pack',
    },
    postHeroContent: (
      <Section8JourneyTimeline
        stage="stage2"
        title="See the notice-to-court path"
        intro="The Complete Pack carries the same England Section 8 case from notice, through expiry, into claim and hearing preparation."
      />
    ),
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'This is for landlords who expect the case may need to go to court and want to preview the Section 8 notice, claim forms, and court file before paying.',
      imageSrc: '/images/complete-pack.webp',
      imageAlt: 'Preview of the complete Section 8 eviction pack',
      includedBullets: [
        'Stage 1 Form 3A notice and service file included',
        'N5, N119, witness statement, and court bundle support',
        'One possession file instead of separate notice and court rebuilds',
      ],
      bestFor:
        'The case is likely to go to court, or you want the notice and possession claim prepared together from the start.',
      notFor:
        'You only need to serve the notice first and want to decide about court later.',
    },
    decisionBlock: {
      title: 'Choose Stage 2 if you want the court route from the start',
      intro:
        'This page is for landlords who need more than a notice. It keeps the notice, service record, N5, N119, court readiness, and hearing support in one case file.',
      cards: [
        {
          eyebrow: 'Choose this route',
          title: 'Start with the full possession route now',
          body:
            'Use the Complete Pack when you expect the case may need possession proceedings and want the Section 8 notice and court paperwork aligned from day one.',
          tone: 'positive',
        },
        {
          eyebrow: 'Important fit point',
          title: 'You do not need to buy Stage 1 separately first',
          body:
            'The Complete Pack already includes the Stage 1 notice and service file. If you also want N5, N119, a witness statement, and hearing support, start here.',
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
        'This pack includes the Stage 1 Section 8 notice file plus the court-stage possession paperwork. You can inspect the notice, claim forms, and court support before buying.',
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
            'Helps the court case start from a valid notice instead of an avoidable defect.',
          includedByDefault: true,
        },
        {
          name: 'Form N5 (Claim for Possession)',
          plainEnglish:
            'The official court form used to start possession proceedings.',
          function:
            'Formally opens the possession claim and tells the court what order the landlord is seeking.',
          riskIfMissing:
            'If the claim form is incomplete or wrong, the court can delay or reject the case before it properly starts.',
          landlordOutcome:
            'Lets you move from notice stage into a possession claim with the correct court form in place.',
          includedByDefault: true,
        },
        {
          name: 'Form N119 (Particulars of Claim)',
          plainEnglish:
            'The statement that explains the possession case to the court.',
          function:
            'Sets out the rent arrears, the grounds relied on, and the facts behind the possession claim.',
          riskIfMissing:
            "If the particulars are weak or unclear, the case loses force because the court cannot see the landlord's position properly.",
          landlordOutcome:
            'Helps the judge understand the claim and see how the facts support the order you want.',
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
            'Gives the claim a clear rent record from notice stage through to court.',
          includedByDefault: true,
        },
        {
          name: 'Evidence Bundle',
          plainEnglish:
            'An organised case file with the tenancy, notice, service record, arrears history, and other papers the court may need.',
          function:
            'Keeps the claim papers consistent and ready to present together instead of leaving key evidence scattered across separate files.',
          riskIfMissing:
            'If the evidence is incomplete or scattered, even a sound possession claim can look weaker and become harder to follow.',
          landlordOutcome:
            'Makes the possession case easier to follow and prepare for court.',
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
            'Helps you submit the case properly and avoid avoidable filing-stage delays.',
          includedByDefault: true,
        },
      ],
      sampleProof: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    comparisonBlock: {
      title: 'Stage 2 is the full court route',
      intro:
        'Stage 2 is for landlords who want the notice and possession claim built together, instead of serving first and deciding about court later.',
      routeCards: [
        {
          name: 'Stage 1: Notice and service first',
          whatItIs:
            'Best when you only need to serve Form 3A and keep the service record clear for now.',
          problemItSolves:
            'Stops notice-stage mistakes before they undermine the case.',
          riskIfWrong:
            'If you need to issue proceedings soon, you may still need the wider court file afterwards.',
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
            'Best when you want the Section 8 notice, N5, N119, court readiness, and hearing support in one file.',
          problemItSolves:
            'Stops the notice file and court file being prepared separately.',
          riskIfWrong:
            'If you only need to serve the notice now, the full court route can be more than you need at this stage.',
          landlordOutcome:
            'Gives you a possession file from notice through court without buying Stage 1 separately first.',
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
        'These are the questions most landlords ask before choosing the full court route.',
      items: [
        {
          question: 'Do I need Stage 1 first?',
          answer:
            'No. The Complete Pack already includes the Stage 1 Section 8 notice and service file, so you do not need to buy that pack separately.',
        },
        {
          question: 'Is this only court forms?',
          answer:
            'No. It includes the Section 8 notice, service record, and notice-stage file as well as N5, N119, witness statement, court bundle support, and hearing preparation.',
        },
        {
          question: 'Does this include the Section 8 notice and service record too?',
          answer:
            'Yes. The Complete Pack keeps the notice stage and court stage aligned in one possession file.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to start the full Section 8 court route?',
      body:
        'Choose the Complete Pack if you want the notice, claim forms, and hearing support prepared together.',
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
      title: 'Why Stage 2 works better than separate forms',
      intro:
        'Landlords lose time when the notice, claim form, and evidence are prepared separately and no longer read like one case.',
      cards: [
        {
          title: 'Possession cases need continuity',
          body:
            'The notice, grounds, arrears evidence, and claim forms should tell the same story from start to finish.',
          imageSrc: '/images/the-court-looks-at-the-notice-first.webp',
          imageAlt: 'Court paperwork and notice review illustration',
        },
        {
          title: 'Weak particulars make a good case harder to follow',
          body:
            "If the landlord's position is unclear in N119, the case is harder to follow even when the facts are sound.",
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
        'The pack does more than generate forms. It keeps the possession route clear from notice through court and hearing preparation.',
      cards: [
        {
          title: 'It keeps the notice and court paperwork aligned',
          body:
            'The same grounds, dates, and arrears position carry through the file instead of being rebuilt at claim stage.',
        },
        {
          title: 'It makes the case easier for the judge to read',
          body:
            "When the forms and evidence line up, the court can understand the landlord's position more quickly.",
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
        'The workflow is built for landlords who already expect the matter may need to go from notice to court.',
      imageSrc: '/images/how-it-works-complete-pack.webp',
      imageAlt: 'How the complete Section 8 pack works from notice to court',
      steps: [
        {
          step: 'Step 01',
          title: 'Add the tenancy, breach, and arrears facts',
          body:
            'Enter the details needed for both the Section 8 notice and the court-stage possession claim.',
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
            'Download the notice, N5, N119, arrears support, and filing guidance as one England possession file.',
        },
      ],
    },
    cta: {
      title: 'Start Stage 2 now',
      body:
        'Start here if you want the notice, service record, claim forms, and hearing support prepared together without buying Stage 1 separately first.',
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
