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

const descriptor = getPublicProductDescriptor('notice_only')!;
const product = PRODUCTS.notice_only;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);

export const metadata: Metadata = {
  title: `${descriptor.seoTitle} | England | ${product.displayPrice}`,
  description: descriptor.metaDescription,
  keywords: [
    'section 8 notice',
    'section 8 notice england',
    'eviction notice generator',
    'evict a tenant legally',
    'eviction notice',
    'form 3a',
    'landlord',
    'England eviction notice',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `${descriptor.seoTitle} | England | ${product.displayPrice}`,
    description: descriptor.metaDescription,
    url: canonicalUrl,
  },
};

const faqs: FAQItem[] = [
  {
    question: 'What does this product generate?',
    answer:
      'It generates an England Section 8 notice pack for the post-May 2026 rules, including the notice itself, arrears support, service guidance, and a validity checklist before you serve.',
  },
  {
    question: 'Why is the arrears schedule included?',
    answer:
      'Because a Section 8 rent arrears case is stronger when the arrears are set out clearly from the start. The schedule helps show how the debt built up and why the grounds are being relied on.',
  },
  {
    question: 'Does this help with Form 3A?',
    answer:
      'Yes. Form 3A is the prescribed notice behind the current England Section 8 route, and this pack builds that official notice from your answers.',
  },
  {
    question: 'What if I also need the court paperwork?',
    answer:
      'Choose the Stage 2 Court & Possession Pack if you want the Section 8 notice, N5, N119, and the court-stage possession paperwork together in one workflow.',
  },
  {
    question: 'Can I preview the pack before I pay?',
    answer:
      'Yes. You can preview the generated documents before purchase and regenerate them after edits if your facts or dates change.',
  },
];

export const runtime = 'nodejs';

export default function NoticeOnlyPage() {
  const sampleProof = getGoldenPackProofData('notice_only');

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'notice_only',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England Section 8 notice and service pack | start correctly before court',
      title: descriptor.displayName,
      subtitle:
        'Start with Stage 1 when the next practical step is serving notice. This pack aligns the notice, service record, and supporting evidence so you can serve correctly now and carry the file forward later if court becomes necessary.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'See the Stage 2 Court Pack',
        href: '/products/complete-pack',
      },
      feature:
        'Most possession cases fail on notice, service, or consistency errors - this pack is designed to prevent those before court is even in view.',
      mediaSrc: '/images/notice_bundles.webp',
      mediaAlt: 'Preview of the England Section 8 notice pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'notice_only',
    },
    postHeroContent: (
      <Section8JourneyTimeline
        stage="stage1"
        title="See where Stage 1 takes the case"
        intro="This pack covers the live notice stage and the wait for expiry, so the landlord can see exactly where service sits in the wider possession route."
      />
    ),
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'Stage 1 is the best fit when you need to serve first, keep the service record straight, and see the actual Section 8 notice file before you pay instead of guessing what the pack will contain.',
      includedBullets: [
        'Official Form 3A notice prepared from the case facts',
        'Service guidance and Form N215 support kept with the notice file',
        'Arrears and validity checks aligned before anything is served',
      ],
      bestFor:
        'You need to serve first and want the notice, service record, and evidence lined up before deciding whether a possession claim is necessary.',
      notFor:
        'You already expect the matter to continue into court and want the notice file plus the possession claim documents working together from the start.',
    },
    decisionBlock: {
      title: 'Choose Stage 1 if serving the Section 8 notice is the next real step',
      intro:
        'This page is built for landlords who need to get the notice, service method, and supporting record right before court is even on the table. It is not a stripped-down teaser product. It is the full serve-first route.',
      cards: [
        {
          eyebrow: 'Choose this route',
          title: 'Serve the notice correctly now',
          body:
            'Use Stage 1 when the immediate job is to prepare Form 3A, line up the grounds and arrears support, and keep a clean service record that can carry forward later if the tenant does not leave.',
          tone: 'positive',
        },
        {
          eyebrow: 'Choose the other route',
          title: 'Do not stop here if you already want N5, N119, and court paperwork',
          body:
            'If you already know the case is likely to become a possession claim, the Complete Pack is the better fit because it includes this Stage 1 file and the court-stage documents together from the outset.',
          tone: 'warning',
        },
      ],
      primary: {
        label: 'Start the Section 8 notice route',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Need the full court pack instead?',
        href: '/products/complete-pack',
      },
    },
    whatYouGet: {
      title: 'What you get in Stage 1',
      intro:
        'This is not just a notice template. It is the actual Section 8 notice file you can inspect before buying, built for the point where the next real step is service, not issue.',
      items: [
        {
          name: 'Form 3A (Section 8 Notice)',
          plainEnglish:
            'The official legal notice required to begin a Section 8 possession case in England.',
          function:
            'Sets out the grounds for possession and gives the tenant formal notice that court action may follow.',
          riskIfMissing:
            'Without a valid notice, the possession claim can be rejected before the judge even gets to the substance of the case.',
          landlordOutcome:
            'Ensures the eviction starts on a legally valid footing instead of falling at the first procedural step.',
          includedByDefault: true,
        },
        {
          name: 'Arrears Schedule',
          plainEnglish:
            'A detailed rent breakdown showing what is owed and how the arrears built up over time.',
          function:
            'Supports the possession grounds by showing the arrears position clearly and consistently.',
          riskIfMissing:
            'If the arrears are vague or poorly recorded, rent arrears grounds are much harder to prove cleanly.',
          landlordOutcome:
            'Strengthens the case from the notice stage and leaves you with better evidence if the matter goes to court.',
          includedByDefault: true,
        },
        {
          name: 'Grounds Explanation',
          plainEnglish:
            "A written explanation linking the tenant's breach to the legal grounds relied on in the notice.",
          function:
            'Shows why the notice is being served and how the facts match the grounds used.',
          riskIfMissing:
            'If the case theory is unclear, the notice can feel weaker and the judge has more work to do later to understand your position.',
          landlordOutcome:
            'Helps the whole file read more clearly from the first page instead of looking like a form issued without explanation.',
          includedByDefault: true,
        },
        {
          name: 'Service Instructions',
          plainEnglish:
            'Step-by-step guidance on how to serve the notice and what proof to keep.',
          function:
            'Explains the delivery methods, timing, and evidence needed so the notice is served properly.',
          riskIfMissing:
            'Incorrect service is one of the easiest ways for a possession case to be delayed or challenged.',
          landlordOutcome:
            'Protects the notice from being undermined by an avoidable service mistake.',
          includedByDefault: true,
        },
        {
          name: 'Validity Checklist',
          plainEnglish:
            'A practical checklist covering the key points that should be right before the notice is served.',
          function:
            'Checks the notice, grounds, dates, and supporting details for obvious errors before you act.',
          riskIfMissing:
            'A small mistake in dates, grounds, or paperwork can invalidate the notice completely.',
          landlordOutcome:
            'Gives you more confidence that the notice will stand up when the tenant or the court looks at it closely.',
          includedByDefault: true,
        },
      ],
      sampleProof: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    comparisonBlock: {
      title: 'Stage 1 and Stage 2 solve different Section 8 jobs',
      intro:
        'If you are comparing the two routes, the question is simple: are you serving notice now, or do you want the full possession claim file already built as well?',
      routeCards: [
        {
          name: 'Stage 1: Serve the Section 8 notice first',
          whatItIs:
            'Best when the next practical step is serving Form 3A correctly and keeping the service record straight.',
          problemItSolves:
            'Stops notice, service, and validity mistakes before they weaken the case.',
          riskIfWrong:
            'If you really need court paperwork already, stopping at Stage 1 means you will still need the wider possession file afterwards.',
          landlordOutcome:
            'Lets you serve with confidence now and move into Stage 2 later if the case needs to continue.',
          href: '/products/notice-only',
          ctaLabel: 'This is my route',
          priceLabel: product.displayPrice,
          imageSrc: '/images/notice.webp',
          imageAlt: 'Section 8 notice stage',
        },
        {
          name: 'Stage 2: Start with the full court pack',
          whatItIs:
            'Best when you want the Section 8 notice, N5, N119, and hearing support prepared together in one case file.',
          problemItSolves:
            'Prevents a notice-stage file from later being rebuilt into a separate court file.',
          riskIfWrong:
            'If you only need to serve notice now, Stage 2 may be more than you need at this point.',
          landlordOutcome:
            'Gives you the full possession route from notice through claim without buying Stage 1 separately first.',
          href: '/products/complete-pack',
          ctaLabel: 'See the full court route',
          imageSrc: '/images/claim.webp',
          imageAlt: 'Section 8 court route',
        },
      ],
    },
    objectionBlock: {
      title: 'Common questions before you start Stage 1',
      intro:
        'The preview shows the real pack structure. These are the points landlords usually want answered before choosing the notice-first route.',
      items: [
        {
          question: 'Can I still move into court later?',
          answer:
            'Yes. Stage 1 is designed to keep the notice, service record, and supporting facts aligned so the same case can continue into the court route later if the tenant does not leave.',
        },
        {
          question: 'Will I need to start over?',
          answer:
            'No. If the matter later needs the Complete Pack, the Section 8 notice route can carry forward instead of forcing you to rebuild the whole file from scratch.',
        },
        {
          question: 'Does this include the official Form 3A?',
          answer:
            'Yes. The pack generates the current official England Form 3A notice together with the supporting service and arrears paperwork needed to serve it properly.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to serve the Section 8 notice correctly?',
      body:
        'Start Stage 1 if your immediate goal is to get the notice, service steps, and supporting record aligned before anything is sent to the tenant.',
      primary: {
        label: 'Start the notice-first wizard',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'I need the court pack instead',
        href: '/products/complete-pack',
      },
    },
    whyYouNeedThis: {
      title: 'Why Stage 1 needs more than a blank notice',
      intro:
        'Most notice-stage failures are not dramatic. They come from small gaps in the grounds, the arrears record, or the way the notice was served. This pack is built to stop those gaps from creeping in.',
      cards: [
        {
          title: 'The court looks at the notice first',
          body:
            "If the notice is wrong, the case can stall before the judge even gets to the tenant's breach or the arrears position.",
          imageSrc: '/images/the-court-looks-at-the-notice-first.webp',
          imageAlt: 'Court paperwork and notice review illustration',
        },
        {
          title: 'Arrears cases are only as clear as the paperwork',
          body:
            "If the numbers are inconsistent or the grounds are not explained properly, the landlord's position becomes harder to follow and easier to challenge.",
          imageSrc: '/images/arrears-cases-are-only-clear-as-the-paperwork.webp',
          imageAlt: 'Arrears paperwork and rent schedule illustration',
        },
        {
          title: 'Service mistakes undo good cases',
          body:
            'A strong notice can still fail if you cannot show it was served correctly and on time.',
          imageSrc: '/images/service-mistakes-undo-good-cases.webp',
          imageAlt: 'Notice service and delivery proof illustration',
        },
      ],
    },
    howThisHelps: {
      title: 'How this puts you in a stronger position',
      intro:
        'The pack is designed to reduce procedural risk now and make the case easier to carry into Stage 2 if the tenant does not leave after notice.',
      cards: [
        {
          title: 'It makes the notice file easier to trust',
          body:
            'The notice, the arrears support, and the service steps all say the same thing in the same direction instead of pulling apart under scrutiny.',
        },
        {
          title: 'It improves court readiness later',
          body:
            'Even if you only need the notice today, the supporting paperwork leaves you in a stronger position if the case later moves into N5 and N119.',
        },
        {
          title: 'It helps you act quickly without guessing',
          body:
            'You do not need to piece the route together from scattered guidance because the pack keeps the practical steps close to the notice itself.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'The workflow keeps the notice route focused on the facts that matter for a current England Section 8 case.',
      steps: [
        {
          step: 'Step 01',
          title: 'Answer the Section 8 questions',
          body:
            'Add the tenancy details, the grounds you are relying on, and the arrears or breach facts that matter to the notice.',
        },
        {
          step: 'Step 02',
          title: 'Check the legal weak spots',
          body:
            'Review the dates, service points, and notice details before you buy or print anything.',
        },
        {
          step: 'Step 03',
          title: 'Generate the full notice pack',
          body:
            'Download the completed notice, arrears support, and service guidance so the case starts with the right paperwork in place.',
        },
      ],
    },
    cta: {
      title: 'Start Stage 1 with more confidence',
      body:
        'Start here if you need the notice, service, and evidence aligned before anything is served, with a direct upgrade into the first court-only step if the case later moves into Stage 2.',
      primary: {
        label: 'Serve the Section 8 notice correctly now',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Need the full court route instead?',
        href: '/products/complete-pack',
      },
      guideLinks: descriptor.defaultGuideLinks,
    },
    faq: {
      title: 'Stage 1 Notice & Service FAQs',
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
