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
      'Choose the Complete Eviction Pack if you want the Section 8 notice, N5, N119, and the court-stage possession paperwork together in one workflow.',
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
      trustText: 'England Section 8 notice generator | landlord checks before you serve',
      title: descriptor.displayName,
      subtitle:
        'Start the eviction process correctly under the current England rules so the case does not fall apart before it even reaches court.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'See the Complete Eviction Pack',
        href: '/products/complete-pack',
      },
      feature:
        'Built for landlords who need the notice, the grounds, and the service steps to line up before anything is served.',
      mediaSrc: '/images/notice_bundles.webp',
      mediaAlt: 'Preview of the England Section 8 notice pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'notice_only',
    },
    earlyProofBand: {
      priceLabel: `${product.displayPrice} | one-time pack price`,
      valueSummary:
        'See the completed notice style, the core supporting documents, and the service-focused guidance before you commit. This is the fastest route when the next job is serving notice correctly first.',
      includedBullets: [
        'Form 3A notice built from your answers',
        'Arrears schedule and grounds support',
        'Service instructions and validity checklist',
        'Preview before you pay',
      ],
      bestFor: 'Best if you need to serve a Section 8 notice correctly before you move toward court.',
      notFor: 'Not for cases where you already want the N5, N119, and court-stage possession file together.',
      preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined,
    },
    whatYouGet: {
      title: 'What you get in the Section 8 notice pack',
      intro:
        'This is not just a notice template. It is a structured notice file where each part exists to start possession on the right footing and reduce the risk of the case failing over avoidable mistakes.',
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
    },
    whyYouNeedThis: {
      title: 'Why a Section 8 case needs more than a blank notice',
      intro:
        'Most notice-stage failures are not dramatic. They come from small gaps in the grounds, the arrears record, or the way the notice was served. This pack is built to stop those gaps from creeping in.',
      cards: [
        {
          title: 'The court looks at the notice first',
          body:
            "If the notice is wrong, the case can stall before the judge even gets to the tenant's breach or the arrears position.",
        },
        {
          title: 'Arrears cases are only as clear as the paperwork',
          body:
            "If the numbers are inconsistent or the grounds are not explained properly, the landlord's position becomes harder to follow and easier to challenge.",
        },
        {
          title: 'Service mistakes undo good cases',
          body:
            'A strong notice can still fail if you cannot show it was served correctly and on time.',
        },
      ],
    },
    howThisHelps: {
      title: 'How this puts you in a stronger position',
      intro:
        'The pack is designed to reduce procedural risk now and make the case easier to carry forward if the tenant does not leave after notice.',
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
      title: 'Prepare the Section 8 notice with more confidence',
      body:
        'If you need to serve notice now, start here so the grounds, dates, arrears, and service steps are prepared as one joined-up England landlord file.',
      primary: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Switch to Complete Eviction Pack',
        href: '/products/complete-pack',
      },
      guideLinks: descriptor.defaultGuideLinks,
    },
    faq: {
      title: 'Eviction Notice Generator FAQs',
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
