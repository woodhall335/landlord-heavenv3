import type { Metadata } from 'next';
import Image from 'next/image';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { PublicProductSalesPage } from '@/components/marketing/PublicProductSalesPage';
import type { FAQItem } from '@/components/seo/FAQSection';
import { Section8JourneyTimeline } from '@/components/eviction/Section8JourneyTimeline';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import type { ProductSalesPageContent } from '@/lib/marketing/product-sales-content';
import { PRODUCTS } from '@/lib/pricing/products';
import { getPublicProductDescriptor } from '@/lib/public-products';
import { getCanonicalUrl } from '@/lib/seo';
import { guideLinks } from '@/lib/seo/internal-links';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

const descriptor = getPublicProductDescriptor('notice_only')!;
const product = PRODUCTS.notice_only;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.noticeOnly.title,
  description: PRODUCT_OWNER_METADATA.noticeOnly.description,
  keywords: [
    'section 8 notice',
    'section 8 notice england',
    'section 8 eviction notice',
    'eviction notice generator england',
    'evict a tenant for rent arrears',
    'form 3a section 8 notice',
    'section 8 notice pack',
    'solicitor approved section 8 notice file',
    'N215 certificate of service',
    'rent arrears schedule',
    'serve section 8 notice',
    'landlord notice service record',
    'notice-only eviction pack',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.noticeOnly.title,
    description: PRODUCT_OWNER_METADATA.noticeOnly.description,
    url: canonicalUrl,
  },
};

const faqs: FAQItem[] = [
  {
    question: 'What does this product generate?',
    answer:
      'It generates an 8-document solicitor-approved Section 8 notice and service file for England landlords: Form 3A Section 8 notice, N215 certificate of service, rent arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide.',
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
      'Choose the Stage 2 Court & Possession Pack if you want the Section 8 notice, N5, N119, and the court-stage possession paperwork together in one flow.',
  },
  {
    question: 'Can I preview the pack before I pay?',
    answer:
      'Yes. You can preview the generated documents before purchase and regenerate them after edits if your facts or dates change.',
  },
  {
    question: 'Does this use court approved Section 8 documents?',
    answer:
      'Yes. The pack uses the current official court-approved Form 3A notice format for England, with N215 certificate of service support, arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide. You still need to complete and serve the documents correctly.',
  },
  {
    question: 'Is this legally binding?',
    answer:
      "Yes - when completed and served correctly. This template follows post-May 2026 England rules, and the checklist helps you avoid common Section 8 notice mistakes.",
  },
];

export const runtime = 'nodejs';

export default function NoticeOnlyPage() {
  const sampleProof = getGoldenPackProofData('notice_only');
  const samplePage = getProductSamplePageByPackKey('notice_only');

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'notice_only',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England-only Form 3A eviction notice | N215, arrears, service checks, preview before paying',
      title: 'Create a Section 8 eviction notice and service file',
      subtitle:
        'Use this when the next job is serving notice. Prepare the England Form 3A notice, N215 service record, arrears schedule, service instructions, checks before service, case summary, and next-step guide in one file you can preview before paying.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'I need court papers too',
        href: '/products/complete-pack',
      },
      feature:
        'Choose this if you have not served the Section 8 notice yet. If you already expect court papers, use the Complete Pack instead. Procedural document preparation, not legal advice.',
      children: (
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-white/90 backdrop-blur">
          <p className="font-semibold text-white">Choose this if your next step is serving notice.</p>
          <p className="mt-1">
            It is the England-only Form 3A notice and service file. If you want N5 and N119
            possession claim papers as well, use the Complete Pack instead.
          </p>
        </div>
      ),
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
    afterPostHeroContent: (
      <section className="scroll-mt-24 bg-white py-10 md:py-12" aria-label="Notice stage route">
        <a href={descriptor.wizardHref} className="block w-full">
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/notice-stage-mobile.webp" />
            <Image
              src="/images/notice-stage-desktop.webp"
              alt="Choose the notice stage route"
              width={1672}
              height={941}
              className="h-auto w-full"
              sizes="100vw"
            />
          </picture>
        </a>
      </section>
    ),
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'Prepare the notice file properly before anything goes to the tenant. You can check the actual Section 8 notice and service file before you pay. This is procedural document preparation, not legal advice.',
      imageSrc: '/images/notice-only-pack.webp',
      imageAlt: 'Preview of the Stage 1 Section 8 notice-only pack',
      imageHref: descriptor.wizardHref,
      mobileImageFirstFullBleed: true,
      includedBullets: [
        'Form 3A Section 8 notice, N215 certificate of service, and service instructions',
        'Rent arrears schedule and checks before service',
        'Case summary and next-step guide',
      ],
      bestFor:
        'You need to serve correctly first and want the service record ready before deciding about court.',
      notFor:
        'You already expect to issue a possession claim and want the notice plus court forms prepared together.',
    },
    whatYouGet: {
      title: 'What you get in Stage 1',
      intro:
        'This is more than a blank form. You get an England eviction notice and service file, and you can inspect it before buying.',
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
          name: 'Rent Arrears Schedule',
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
          name: 'N215 Certificate of Service',
          plainEnglish:
            'The certificate used to record how and when the notice was served.',
          function:
            'Keeps proof of service with the notice file so the court can see how the tenant was notified if the case later progresses.',
          riskIfMissing:
            'If service cannot be shown clearly, a later possession claim can be delayed or challenged.',
          landlordOutcome:
            'Gives you a clearer service record from the first step.',
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
        {
          name: 'Compliance Declaration',
          plainEnglish:
            'A structured declaration that records the key compliance points checked before service.',
          function:
            'Keeps the notice, dates, grounds, and service assumptions together in one reviewable file.',
          riskIfMissing:
            'Without a check record, it is harder to show what was reviewed before the notice was served.',
          landlordOutcome:
            'Helps the file look prepared rather than improvised.',
          includedByDefault: true,
        },
        {
          name: 'Case Summary',
          plainEnglish:
            'A short overview of the tenancy, arrears, grounds, and intended next step.',
          function:
            'Summarises the facts so the notice file can be understood quickly later.',
          riskIfMissing:
            'If the case later moves to court, scattered facts make the file harder to rebuild.',
          landlordOutcome:
            'Makes it easier to move into court papers later if you need them.',
          includedByDefault: true,
        },
        {
          name: 'What Happens Next Guide',
          plainEnglish:
            'A practical guide to the next steps after the Section 8 notice is served.',
          function:
            'Explains what to monitor during the notice period and when Stage 2 may be needed.',
          riskIfMissing:
            'Landlords can lose time if they are unsure what to do after service.',
          landlordOutcome:
            'Keeps the next step clear once the notice has gone to the tenant.',
          includedByDefault: true,
        },
      ],
      sampleProof: sampleProof ? (
        <GoldenPackProof data={sampleProof} samplePageHref={samplePage?.samplePath} />
      ) : undefined,
    },
    comparisonBlock: {
      title: 'Stage 1 and Stage 2 do different jobs',
      intro:
        'The choice is simple: do you need to serve the Section 8 eviction notice now, or do you want the full possession claim file built as well?',
      routeCards: [
        {
          name: 'Stage 1: Serve the Section 8 notice first',
          whatItIs:
            'Best when the next step is serving Form 3A and keeping a clear N215 service record.',
          problemItSolves:
            'Stops notice, service, and validity mistakes before they weaken the case.',
          riskIfWrong:
            'If you already need court paperwork, Stage 1 alone means you will still need the wider possession file later.',
          landlordOutcome:
            'Lets you serve correctly now and move into Stage 2 later if needed.',
          href: '/products/notice-only',
          ctaLabel: 'This is my route',
          priceLabel: product.displayPrice,
          imageSrc: '/images/section-8-notice.webp',
          imageAlt: 'Section 8 notice stage',
        },
        {
          name: 'Stage 2: Prepare the full court pack',
          whatItIs:
            'Best when you want the Section 8 notice, N5, N119, evidence, and hearing support in one possession file.',
          problemItSolves:
            'Prevents a notice-stage file from later being rebuilt into a separate court file.',
          riskIfWrong:
            'If you only need to serve notice now, Stage 2 may be more than you need at this point.',
          landlordOutcome:
            'Gives you the possession route from notice through claim without buying Stage 1 separately first.',
          href: '/products/complete-pack',
          ctaLabel: 'See the full court route',
          imageSrc: '/images/section-8-court-paperwork.webp',
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
            'Yes. Stage 1 keeps the notice, N215 service record, arrears schedule, checks, and supporting facts aligned so the same case can move into the court route later if needed.',
        },
        {
          question: 'Will I need to start over?',
          answer:
            'No. If you later need the Complete Pack, the Stage 1 notice file can carry forward instead of being rebuilt from scratch.',
        },
        {
          question: 'Does this include the official Form 3A?',
          answer:
            'Yes. The pack generates the current England Form 3A notice with N215, service instructions, arrears schedule, validity checklist, compliance declaration, case summary, and what-happens-next guide.',
        },
        {
          question: 'Is this legal advice?',
          answer:
            'No. This is a procedural document pack that prepares the notice and service file from the information you provide. For complex disputes, unusual tenancy facts, or expected defences, take legal advice before serving.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to serve the Section 8 notice?',
      body:
        'Choose this if your immediate job is to prepare the notice file properly before anything is sent to the tenant.',
      primary: {
        label: 'Create my Section 8 notice',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'I need the court pack instead',
        href: '/products/complete-pack',
      },
    },
    whyYouNeedThis: {
      title: 'Why a blank notice is risky',
      intro:
        'Most notice problems come from small gaps in the grounds, arrears record, dates, or service method. This sits between a blank online form and a solicitor service: a fixed-price document pack built around your facts.',
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
        {
          title: 'Different from a blank form',
          body:
            'A blank form gives you the shell. Notice Only gives you Form 3A, N215, arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and next-step guide in one file.',
          imageSrc: '/images/notice-only-pack.webp',
          imageAlt: 'Section 8 notice and service file preview',
        },
      ],
    },
    howThisHelps: {
      title: 'How this puts you in a stronger position',
      intro:
        "The pack reduces notice-stage risk and makes the case easier to carry into Stage 2 if the tenant does not leave. The solicitor-approved Section 8 notice and service file keeps the post-May 2026 Renters' Rights Act Section 8 form, dates, N215, arrears schedule, compliance declaration, and service record together.",
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
        'We ask for the facts needed to prepare a current England Section 8 notice.',
      imageSrc: '/images/how-it-works-notice-only.webp',
      imageAlt: 'How the Section 8 notice-only pack works',
      imageHref: descriptor.wizardHref,
      mobileImageFirstFullBleed: true,
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
          title: 'Download the finished notice file',
          body:
            'Download the notice, arrears support, and service guidance so the case starts with the right paperwork.',
        },
      ],
    },
    cta: {
      title: 'Create the notice without guessing',
      body:
        'Choose this if you need the notice, service instructions, N215, arrears schedule, and checks ready before anything is served.',
      primary: {
        label: 'Create my Section 8 notice',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'Need the full court route instead?',
        href: '/products/complete-pack',
      },
      guideLinks: [
        {
          label: 'Not sure which pack? Compare Stage 1 and Stage 2',
          href: '/compare/section-8-stage-1-vs-stage-2',
        },
        {
          label: guideLinks.rentersRightsActEvictionRules.title,
          href: guideLinks.rentersRightsActEvictionRules.href,
        },
        {
          label: guideLinks.section8Notice.title,
          href: guideLinks.section8Notice.href,
        },
        {
          label: guideLinks.form3aSection8.title,
          href: guideLinks.form3aSection8.href,
        },
      ],
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
          description: PRODUCT_OWNER_METADATA.noticeOnly.description,
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
