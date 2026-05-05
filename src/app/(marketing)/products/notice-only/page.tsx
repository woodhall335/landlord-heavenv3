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
      trustText: 'England Section 8 notice and service pack | serve before court',
      title: descriptor.displayName,
      subtitle:
        'Use Stage 1 when you need to serve the Section 8 notice first. It prepares the notice, service record, and supporting evidence so the file is clear before anything is sent to the tenant.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'See the Stage 2 Court Pack',
        href: '/products/complete-pack',
      },
      feature:
        'Most avoidable problems start with the notice, service, or evidence record. This pack helps you check those points before court is in view.',
      mediaSrc: '/images/notice_bundles.webp',
      mediaAlt: 'Preview of the England Section 8 notice pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'notice_only',
    },
    postHeroContent: (
      <Section8JourneyTimeline
        stage="stage1"
        title="See where Stage 1 fits"
        intro="Stage 1 covers preparing and serving the notice, then waiting for the notice period to end before any court claim."
      />
    ),
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'Stage 1 is the right fit when the job today is serving notice. You can preview the actual Section 8 notice file before you pay.',
      imageSrc: '/images/notice-only-pack.webp',
      imageAlt: 'Preview of the Stage 1 Section 8 notice-only pack',
      includedBullets: [
        'Official Form 3A notice prepared from your answers',
        'Service guidance and Form N215 support kept with the file',
        'Arrears and validity checks before anything is served',
      ],
      bestFor:
        'You need to serve the notice first and want the service record and evidence ready before deciding about court.',
      notFor:
        'You already expect to issue a possession claim and want the notice plus court forms prepared together.',
    },
    decisionBlock: {
      title: 'Choose Stage 1 if you need to serve the notice first',
      intro:
        'This route is for landlords who need the notice, service method, and supporting record prepared before deciding whether court action is needed.',
      cards: [
        {
          eyebrow: 'Choose this route',
          title: 'Serve the notice properly now',
          body:
            'Use Stage 1 to prepare Form 3A, set out the grounds and arrears support, and keep a service record that can be used later if the tenant does not leave.',
          tone: 'positive',
        },
        {
          eyebrow: 'Choose the other route',
          title: 'Choose Stage 2 if you already need court forms',
          body:
            'If you already expect a possession claim, the Complete Pack is the better fit because it includes this notice file plus N5, N119, and court-stage support.',
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
        'This is more than a blank notice. It is a notice-and-service file you can inspect before buying, built for landlords who need to serve first.',
      items: [
        {
          name: 'Form 3A (Section 8 Notice)',
          plainEnglish:
            'The official notice used to start a Section 8 possession case in England.',
          function:
            'Sets out the grounds for possession and gives the tenant formal notice that court action may follow.',
          riskIfMissing:
            'Without a valid notice, a later possession claim can fail before the court reaches the main dispute.',
          landlordOutcome:
            'Helps the eviction route start with the right legal notice in place.',
          includedByDefault: true,
        },
        {
          name: 'Arrears Schedule',
          plainEnglish:
            'A rent breakdown showing what is owed and how the arrears built up.',
          function:
            'Supports the possession grounds by showing the arrears position clearly and consistently.',
          riskIfMissing:
            'If the arrears are vague or poorly recorded, rent arrears grounds are much harder to prove cleanly.',
          landlordOutcome:
            'Gives the notice file a clearer rent record if the case later goes to court.',
          includedByDefault: true,
        },
        {
          name: 'Grounds Explanation',
          plainEnglish:
            "A short explanation linking the tenant's breach to the legal grounds in the notice.",
          function:
            'Shows why the notice is being served and how the facts match the grounds used.',
          riskIfMissing:
            'If the case theory is unclear, the notice can feel weaker and the judge has more work to do later to understand your position.',
          landlordOutcome:
            'Helps the file read clearly instead of looking like a form sent without context.',
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
            'Reduces the risk of the notice being challenged because of a service mistake.',
          includedByDefault: true,
        },
        {
          name: 'Validity Checklist',
          plainEnglish:
            'A practical checklist of the key points to check before serving the notice.',
          function:
            'Checks the notice, grounds, dates, and supporting details for obvious errors before you act.',
          riskIfMissing:
            'A small mistake in dates, grounds, or paperwork can invalidate the notice completely.',
          landlordOutcome:
            'Gives you a cleaner file before the tenant or the court looks closely at the notice.',
          includedByDefault: true,
        },
      ],
      sampleProof: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    comparisonBlock: {
      title: 'Stage 1 and Stage 2 do different jobs',
      intro:
        'The choice is simple: do you need to serve the notice now, or do you want the full possession claim file built as well?',
      routeCards: [
        {
          name: 'Stage 1: Serve the Section 8 notice first',
          whatItIs:
            'Best when the next step is serving Form 3A and keeping a clear service record.',
          problemItSolves:
            'Stops notice, service, and validity mistakes before they weaken the case.',
          riskIfWrong:
            'If you already need court paperwork, Stage 1 alone means you will still need the wider possession file later.',
          landlordOutcome:
            'Lets you serve the notice now and move into Stage 2 later if needed.',
          href: '/products/notice-only',
          ctaLabel: 'This is my route',
          priceLabel: product.displayPrice,
          imageSrc: '/images/notice.webp',
          imageAlt: 'Section 8 notice stage',
        },
        {
          name: 'Stage 2: Start with the full court pack',
          whatItIs:
            'Best when you want the Section 8 notice, N5, N119, and hearing support in one case file.',
          problemItSolves:
            'Prevents a notice-stage file from later being rebuilt into a separate court file.',
          riskIfWrong:
            'If you only need to serve notice now, Stage 2 may be more than you need at this point.',
          landlordOutcome:
            'Gives you the possession route from notice through claim without buying Stage 1 separately first.',
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
        'These are the points landlords usually check before choosing the notice-first route.',
      items: [
        {
          question: 'Can I still move into court later?',
          answer:
            'Yes. Stage 1 keeps the notice, service record, and supporting facts aligned so the same case can move into the court route later if needed.',
        },
        {
          question: 'Will I need to start over?',
          answer:
            'No. If you later need the Complete Pack, the Stage 1 notice file can carry forward instead of being rebuilt from scratch.',
        },
        {
          question: 'Does this include the official Form 3A?',
          answer:
            'Yes. The pack generates the current England Form 3A notice with the service and arrears paperwork needed to support it.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to serve the Section 8 notice?',
      body:
        'Start Stage 1 if your immediate job is to get the notice, service steps, and supporting record ready before anything is sent to the tenant.',
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
        'Most notice-stage problems come from small gaps in the grounds, arrears record, dates, or service method. This pack helps you check those points early.',
      cards: [
        {
          title: 'The court looks at the notice first',
          body:
            "If the notice is wrong, the case can stall before the judge reaches the tenant's breach or the arrears.",
          imageSrc: '/images/the-court-looks-at-the-notice-first.webp',
          imageAlt: 'Court paperwork and notice review illustration',
        },
        {
          title: 'Arrears cases are only as clear as the paperwork',
          body:
            "If the figures or grounds are unclear, the landlord's position is harder to follow and easier to challenge.",
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
        'The pack reduces notice-stage risk and makes the case easier to carry into Stage 2 if the tenant does not leave.',
      cards: [
        {
          title: 'It makes the notice file easier to trust',
          body:
            'The notice, arrears support, and service steps all tell the same story.',
        },
        {
          title: 'It improves court readiness later',
          body:
            'Even if you only need the notice today, the supporting paperwork helps if the case later moves into N5 and N119.',
        },
        {
          title: 'It helps you act quickly without guessing',
          body:
            'The pack keeps the practical steps close to the notice, so you are not piecing the route together from separate notes.',
        },
      ],
    },
    howItWorks: {
      title: 'How it works',
      intro:
        'The workflow focuses on the facts needed for a current England Section 8 notice.',
      imageSrc: '/images/how-it-works-notice-only.webp',
      imageAlt: 'How the Section 8 notice-only pack works',
      steps: [
        {
          step: 'Step 01',
          title: 'Answer the Section 8 questions',
          body:
            'Add the tenancy details, the grounds you rely on, and the arrears or breach facts that matter to the notice.',
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
            'Download the notice, arrears support, and service guidance so the case starts with the right paperwork.',
        },
      ],
    },
    cta: {
      title: 'Start Stage 1 with more confidence',
      body:
        'Start here if you need the notice, service steps, and evidence record ready before anything is served.',
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
