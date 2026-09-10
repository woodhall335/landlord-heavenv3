import type { Metadata } from 'next';
import Image from 'next/image';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { AssistedPrepServicesShowcase } from '@/components/assisted-prep/AssistedPrepServicesShowcase';
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
    'eviction notice generator',
    'eviction notice generator england',
    'evict a tenant legally',
    'evict a tenant for rent arrears',
    'form 3a section 8 notice',
    'form 3a',
    'section 8 notice pack',
    'review-ready section 8 notice file',
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
      'It generates an 8-document Review-ready Section 8 notice and service file for England landlords: Form 3A Section 8 notice, N215 certificate of service, rent arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide.',
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
      trustText: `England-only Form 3A | N215 and service checks | Preview before paying | Fixed price ${PRODUCTS.notice_only.displayPrice}`,
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
          <p className="mt-1 text-white">
            It is the England-only Form 3A notice and service file. If you want N5 and N119
            possession claim papers as well, use the Complete Pack instead.
          </p>
        </div>
      ),
      mediaSrc: '/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp',
      mediaAlt: 'Waterbrush illustration of a Section 8 notice, service record and delivery evidence',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'notice_only',
    },
    conversionPanel: {
      eyebrow: 'Eviction notices',
      productName: 'Notice Only',
      decisionTitle: 'Choose this if your next step is serving notice.',
      decisionBody:
        'Prepare the England Form 3A notice and service file. If you also need N5 and N119 possession claim papers, choose the Complete Pack instead.',
      artworkSrc: '/images/illustrations/product-panels/notice-only-document-v1.webp',
      artworkAlt: 'Illustration of a prepared Section 8 notice and service envelope',
      features: [
        { title: 'England only', body: 'For English tenancies', icon: 'location' },
        { title: 'Fixed price', body: 'No hidden charges', icon: 'price' },
        { title: 'Guided builder', body: 'Step-by-step questions', icon: 'builder' },
      ],
      previewText: 'Preview available before payment where shown.',
      reassuranceTitle: 'A clear, reviewable notice file',
      reassuranceBody: 'Form 3A, the service record, and practical checks kept together.',
    },
    postHeroContent: (
      <>
        <AssistedPrepServicesShowcase
          pagePath={descriptor.landingHref}
          pageType="product_page"
          src="product_notice_only"
        />
        <Section8JourneyTimeline
          stage="stage1"
          title="See where Stage 1 fits"
          intro="Stage 1 covers preparing and serving the notice, then waiting for the notice period to end before any court claim."
        />
      </>
    ),
    afterPostHeroContent: (
      <>
        <section className="scroll-mt-24 bg-white py-10 md:py-12" aria-label="Notice stage route">
          <a href={descriptor.wizardHref} className="block w-full">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp" />
              <Image
                src="/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp"
                alt="Waterbrush illustration of the Section 8 notice and service route"
                width={1672}
                height={941}
                className="h-auto w-full"
                sizes="100vw"
              />
            </picture>
          </a>
        </section>
      </>
    ),
    earlyProofBand: {
      priceLabel: product.displayPrice,
      valueSummary:
        'Prepare the notice file properly before anything goes to the tenant. You can check the actual Section 8 notice and service file before you pay. This is procedural document preparation, not legal advice.',
      imageSrc: '/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp',
      imageAlt: 'Waterbrush illustration of the Stage 1 Section 8 notice-only pack',
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
        'This is the complete notice-and-service file, not a blank form. Here is what each document does and why it is included.',
      items: [
        {
          name: 'Form 3A (Section 8 Notice)',
          plainEnglish:
            'The formal notice that tells the tenant why you are seeking possession and how much notice they have.',
          function:
            'It records the possession grounds and the facts supporting them before any court claim is started.',
          riskIfMissing:
            'The wrong grounds, dates, or supporting details can delay or undermine a later possession claim.',
          landlordOutcome:
            'A current Form 3A prepared around the facts you provide, ready for you to review before service.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/section8-form3a-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a Form 3A notice, calendar, rental home and key',
        },
        {
          name: 'Rent Arrears Schedule',
          plainEnglish:
            'A month-by-month rent record showing what was due, what was paid, and what remains outstanding.',
          function:
            'It supports rent-arrears grounds with figures that can be checked against the notice and tenancy records.',
          riskIfMissing:
            'Unclear or inconsistent figures make the arrears harder to explain to the tenant and, if needed, the court.',
          landlordOutcome:
            'One clear arrears record that can stay with the case if it later moves to court.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/rent-arrears-schedule-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a rent arrears ledger, calculator and rental home',
        },
        {
          name: 'N215 Certificate of Service',
          plainEnglish:
            'A certificate recording when, where, and how the notice was delivered.',
          function:
            'It keeps the service details with the notice so you do not have to reconstruct them later.',
          riskIfMissing:
            'If service cannot be shown clearly, the tenant may challenge it and the court may require further evidence.',
          landlordOutcome:
            'A dated service record kept alongside the notice from day one.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/n215-service-certificate-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a service certificate, sealed envelope and dated record',
        },
        {
          name: 'Service Instructions',
          plainEnglish:
            'Plain-English steps for delivering the notice and keeping evidence of service.',
          function:
            'It explains the available delivery methods, timing, and records to retain.',
          riskIfMissing:
            'Using the wrong method or keeping no proof can create an avoidable dispute about service.',
          landlordOutcome:
            'A practical service plan you can follow without guessing what to keep.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/service-instructions-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of the steps for serving a notice and keeping proof',
        },
        {
          name: 'Validity Checklist',
          plainEnglish:
            'A final check of the grounds, dates, tenancy details, and supporting information before service.',
          function:
            'It brings the details most likely to cause problems into one review before you act.',
          riskIfMissing:
            'A missed date, inconsistent fact, or unsuitable ground can delay the case or require a fresh notice.',
          landlordOutcome:
            'A cleaner notice file with the obvious weak points checked before it reaches the tenant.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/notice-validity-checklist-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a notice checklist, date review and compliance shield',
        },
        {
          name: 'Compliance Declaration',
          plainEnglish:
            'A written record of the key notice and tenancy checks completed before service.',
          function:
            'It keeps the assumptions behind the notice visible instead of leaving the review in scattered notes.',
          riskIfMissing:
            'Without one review record, inconsistencies between the notice, dates, and supporting documents are easier to miss.',
          landlordOutcome:
            'A clear record of what you checked and the information the notice was based on.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/compliance-declaration-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a signed compliance declaration and supporting records',
        },
        {
          name: 'Case Summary',
          plainEnglish:
            'A concise overview of the tenancy, possession grounds, arrears where relevant, and next step.',
          function:
            'It puts the important facts in one place so the file is easy to pick up again.',
          riskIfMissing:
            'Scattered facts make it easier for dates, figures, or the reason for possession to drift later.',
          landlordOutcome:
            'A useful case overview if the tenant does not leave and court papers are needed.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/case-summary-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of an organised Section 8 case summary folder',
        },
        {
          name: 'What Happens Next Guide',
          plainEnglish:
            'A practical guide to what happens during the notice period and what to do when it ends.',
          function:
            'It explains what to monitor, what records to keep, and when the court stage may become relevant.',
          riskIfMissing:
            'Uncertainty after service can lead to missed preparation and unnecessary delay.',
          landlordOutcome:
            'A clear next-step plan rather than being left with a served notice and no roadmap.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/what-happens-next-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of the steps from served notice to a possible court claim',
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
          imageSrc: '/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp',
          imageAlt: 'Waterbrush illustration of the Section 8 notice stage',
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
          imageSrc: '/images/illustrations/products/possession-court-pack-waterbrush-v1.webp',
          imageAlt: 'Waterbrush illustration of the Section 8 court route',
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
        label: descriptor.primaryCtaLabel,
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
          imageSrc: '/images/heroes/library/hero-guide-court-hearing-v2.webp',
          imageAlt: 'Waterbrush illustration of court paperwork and notice review',
        },
        {
          title: 'Arrears cases are only as clear as the paperwork',
          body:
            "If the figures or grounds are unclear, the landlord's position is harder to follow and easier to challenge.",
          imageSrc: '/images/heroes/library/hero-guide-rent-arrears-schedule-v2.webp',
          imageAlt: 'Waterbrush illustration of arrears paperwork and a rent schedule',
        },
        {
          title: 'Service mistakes undo good cases',
          body:
            'A strong notice can still fail if you cannot show it was served correctly and on time.',
          imageSrc: '/images/illustrations/services/section8-service-evidence-waterbrush-v2.webp',
          imageAlt: 'Waterbrush illustration of notice service and delivery proof',
        },
        {
          title: 'Different from a blank form',
          body:
            'A blank form gives you the shell. Notice Only gives you Form 3A, N215, arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and next-step guide in one file.',
          imageSrc: '/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp',
          imageAlt: 'Waterbrush illustration of a Section 8 notice and service file',
        },
      ],
    },
    howThisHelps: {
      title: 'How this puts you in a stronger position',
      intro:
        "The pack reduces notice-stage risk and makes the case easier to carry into Stage 2 if the tenant does not leave. The review-ready Section 8 notice and service file keeps the post-May 2026 Renters' Rights Act Section 8 form, dates, N215, arrears schedule, compliance declaration, and service record together.",
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
      imageSrc: '/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp',
      imageAlt: 'Waterbrush illustration of how the Section 8 notice-only pack works',
      imageHref: descriptor.wizardHref,
      mobileImageFirstFullBleed: true,
      alignImageToSteps: true,
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
        label: descriptor.primaryCtaLabel,
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
      visual: {
        eyebrow: 'Notice Only',
        highlightedText: 'without guessing',
        artworkSrc: '/images/illustrations/product-banners/notice-only-conversion-v1.webp',
        artworkAlt: 'Illustration of a Section 8 notice, service record and arrears documents',
        features: [
          { title: 'Form 3A', body: 'Prepared from your answers', icon: 'document' },
          { title: 'Service file', body: 'N215 and service guidance', icon: 'shield' },
          { title: 'Arrears checks', body: 'Figures and supporting record', icon: 'chart' },
        ],
        reassuranceTitle: 'One connected notice and service file',
        reassuranceBody: 'Review the notice, supporting records, and next steps together.',
      },
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
