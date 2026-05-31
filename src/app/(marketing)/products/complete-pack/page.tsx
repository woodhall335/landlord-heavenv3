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

const descriptor = getPublicProductDescriptor('complete_pack')!;
const product = PRODUCTS.complete_pack;
const canonicalUrl = getCanonicalUrl(descriptor.landingHref);

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.completePack.title,
  description: PRODUCT_OWNER_METADATA.completePack.description,
  keywords: [
    'Section 8 court pack',
    'Section 8 possession pack',
    'Section 8 possession claim pack',
    'solicitor approved Section 8 court file',
    'N5 N119 forms',
    'N5 possession claim form',
    'N119 particulars of claim',
    'rent arrears possession claim',
    'complete eviction pack england',
    'court-ready eviction documents',
    'section 8 witness statement',
    'possession claim evidence bundle',
  ],
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.completePack.title,
    description: PRODUCT_OWNER_METADATA.completePack.description,
    url: canonicalUrl,
  },
};

const faqs: FAQItem[] = [
  {
    question: 'What does the Stage 2 Court & Possession Pack include?',
    answer:
      'It is the full Solicitor-approved Section 8 court and possession file for England landlords. It includes everything in Stage 1 plus N5, N119, witness statement, court readiness status, court bundle index, evidence collection checklist, court filing guide, hearing checklist, eviction case summary, and arrears engagement letter.',
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
  {
    question: 'Does this use court approved possession claim forms?',
    answer:
      'Yes. The Complete Pack uses official court-approved possession forms where required, including N5 and N119, alongside Form 3A, N215, witness statement, evidence tools, and filing and hearing support. The court still decides the claim outcome from the completed forms and evidence.',
  },
  {
    question: 'Is this legally binding?',
    answer:
      'Yes - when completed and filed correctly. This pack follows post-May 2026 England rules, and the checklist helps you avoid common possession claim mistakes.',
  },
];

export const runtime = 'nodejs';

export default function CompleteEvictionPackPage() {
  const sampleProof = getGoldenPackProofData('complete_pack');
  const samplePage = getProductSamplePageByPackKey('complete_pack');

  const content: ProductSalesPageContent = {
    analytics: {
      pagePath: descriptor.landingHref,
      pageType: 'product_page',
      routeIntent: 'complete_pack',
    },
    hero: {
      preset: descriptor.heroPreset,
      badge: descriptor.heroBadge,
      trustText: 'England possession claim pack | Form 3A, N5, N119, evidence, preview before paying',
      title: 'Section 8 possession claim pack with N5 and N119',
      subtitle:
        'Use this when the case is heading to court, or you want the notice and court papers prepared together. Prepare the Section 8 notice file plus N5, N119, witness statement, evidence checklist, filing guide, hearing checklist, case summary, and arrears engagement letter.',
      primaryCta: {
        label: descriptor.primaryCtaLabel,
        href: descriptor.wizardHref,
      },
      secondaryCta: {
        label: 'I only need the notice',
        href: '/products/notice-only',
      },
      feature:
        'Choose this if court is likely. It includes the notice file, so you do not need to buy Notice Only separately first. Procedural document preparation, not legal advice.',
      children: (
        <div className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-6 text-white/90 backdrop-blur">
          <p className="font-semibold text-white">Choose this if court is likely.</p>
          <p className="mt-1">
            It includes the Form 3A notice and service file, then adds the N5,
            N119, evidence, filing, and hearing support for the possession claim.
          </p>
        </div>
      ),
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
    afterPostHeroContent: (
      <section className="scroll-mt-24 bg-white py-10 md:py-12" aria-label="Complete pack stage route">
        <a href={descriptor.wizardHref} className="block w-full">
          <picture>
            <source media="(max-width: 767px)" srcSet="/images/complete-stage-mobile.webp" />
            <Image
              src="/images/complete-stage-desktop.webp"
              alt="Choose the complete court and possession route"
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
        'Prepare the full possession file, not just the court forms. You can check the claim forms and supporting file before you pay. This is procedural document preparation, not legal advice.',
      imageSrc: '/images/complete-pack.webp',
      imageAlt: 'Preview of the complete Section 8 eviction pack',
      imageHref: descriptor.wizardHref,
      mobileImageFirstFullBleed: true,
      includedBullets: [
        'Form 3A, N215, service instructions, arrears schedule, checks, and case summary',
        'N5, N119, witness statement, and evidence collection checklist',
        'Court bundle index, court filing guide, hearing checklist, what-happens-next guide, and arrears engagement letter',
      ],
      bestFor:
        'The case is likely to go to court, or you want the notice and possession claim prepared together from the start.',
      notFor:
        'You only need to serve the notice first and want to decide about court later.',
    },
    whatYouGet: {
      title: 'What you get in the combined pack',
      intro:
        'You get the notice and service file plus the possession claim papers in one file. You can inspect the Form 3A notice, N215, N5 claim form, N119 particulars, arrears record, evidence support, and hearing preparation before buying.',
      items: [
        {
          name: 'Form 3A (Section 8 Notice)',
          plainEnglish:
            'The official notice that starts the current England Section 8 possession route, carried over from the Stage 1 notice file.',
          function:
            'Gives the tenant formal notice of the grounds relied on before the case moves into court.',
          riskIfMissing:
            'If the notice is wrong or invalid, the possession claim can fail before the court forms even matter.',
          landlordOutcome:
            'Helps the court case start from a valid notice instead of an avoidable defect.',
          includedByDefault: true,
        },
        {
          name: 'Stage 1 Notice and Service File',
          plainEnglish:
            'The full Stage 1 file: Form 3A Section 8 notice, N215 certificate of service, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide.',
          function:
            'Keeps the notice and service record aligned before the court claim is issued.',
          riskIfMissing:
            'If the notice and service record are weak, the later court forms can be undermined before the main evidence is considered.',
          landlordOutcome:
            'Gives the possession file a cleaner foundation before N5 and N119 are used.',
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
          name: 'Schedule of Arrears and Arrears Engagement Letter',
          plainEnglish:
            'A running rent breakdown showing exactly what is owed, supported by an arrears engagement letter for the file.',
          function:
            'Supports both the notice and the court forms with a clear financial record.',
          riskIfMissing:
            'If the arrears evidence is vague or inconsistent, the credibility of the possession case drops immediately.',
          landlordOutcome:
            'Gives the claim a clear rent record from notice stage through to court.',
          includedByDefault: true,
        },
        {
          name: 'Witness Statement',
          plainEnglish:
            'A structured witness statement setting out the landlord evidence in a court-readable way.',
          function:
            'Connects the tenancy, breach, arrears, notice, service, and claim forms into one account.',
          riskIfMissing:
            'A possession claim can look thin if the court forms are not supported by a clear witness narrative.',
          landlordOutcome:
            'Helps the judge follow the landlord position without piecing the case together.',
          includedByDefault: true,
        },
        {
          name: 'Court Readiness Status and Evidence Collection Checklist',
          plainEnglish:
            'A readiness check and evidence list covering the tenancy, notice, service record, arrears history, and other papers the court may need.',
          function:
            'Keeps the claim papers consistent and ready to present together instead of leaving key evidence scattered across separate files.',
          riskIfMissing:
            'If the evidence is incomplete or scattered, even a sound possession claim can look weaker and become harder to follow.',
          landlordOutcome:
            'Makes the possession case easier to follow and prepare for court.',
          includedByDefault: true,
        },
        {
          name: 'Court Bundle Index, Court Filing Guide, and Hearing Checklist',
          plainEnglish:
            'A document bundle index, filing guide, and hearing checklist for the possession stage.',
          function:
            'Explains the filing route, what goes with the claim, and the practical steps after the notice stage.',
          riskIfMissing:
            'If the filing stage is handled badly, delays and rework can creep in even after the forms have been generated correctly.',
          landlordOutcome:
            'Helps you submit the case properly and avoid avoidable filing-stage delays.',
          includedByDefault: true,
        },
      ],
      sampleProof: sampleProof ? (
        <GoldenPackProof data={sampleProof} samplePageHref={samplePage?.samplePath} />
      ) : undefined,
    },
    comparisonBlock: {
      title: 'Stage 2 is the full court route',
      intro:
        'Stage 2 is for landlords who want the eviction notice and possession claim built together, instead of serving first and deciding about court later.',
      routeCards: [
        {
          name: 'Stage 1: Notice and service first',
          whatItIs:
            'Best when you only need to serve Form 3A and keep the N215 service record clear for now.',
          problemItSolves:
            'Stops notice-stage mistakes before they undermine the case.',
          riskIfWrong:
            'If you need to issue proceedings soon, you may still need the wider court file afterwards.',
          landlordOutcome:
            'Lets you serve the notice properly and move onward later only if needed.',
          href: '/products/notice-only',
          ctaLabel: 'See the notice-first route',
          imageSrc: '/images/section-8-notice.webp',
          imageAlt: 'Serve Section 8 notice first',
        },
        {
          name: 'Stage 2: Notice, claim forms, and hearing support together',
          whatItIs:
            'Best when you want the Section 8 notice, N5, N119, court readiness status, evidence collection checklist, and hearing support in one file.',
          problemItSolves:
            'Stops the notice file and court file being prepared separately.',
          riskIfWrong:
            'If you only need to serve the notice now, the full court route can be more than you need at this stage.',
          landlordOutcome:
            'Gives you a possession file from notice through court without buying Stage 1 separately first.',
          href: '/products/complete-pack',
          ctaLabel: 'This is my route',
          priceLabel: product.displayPrice,
          imageSrc: '/images/section-8-court-paperwork.webp',
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
            'No. It includes the Section 8 notice, service record, and notice-stage file as well as N5, N119, witness statement, court readiness status, evidence collection checklist, court bundle index, filing guide, hearing checklist, eviction case summary, and arrears engagement letter.',
        },
        {
          question: 'Does this include the Section 8 notice and service record too?',
          answer:
            'Yes. The Complete Pack keeps the notice stage and court stage aligned in one possession file.',
        },
        {
          question: 'Is this legal advice?',
          answer:
            'No. This is a procedural document pack that prepares possession claim paperwork from the information you provide. For complex disputes, unusual tenancy facts, or expected defences, take legal advice before filing.',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to start the full Section 8 court route?',
      body:
        'Choose the Complete Pack if you want the notice, claim forms, evidence, and hearing support prepared together.',
      primary: {
        label: 'Prepare my court pack',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'I only need the notice',
        href: '/products/notice-only',
      },
    },
    whyYouNeedThis: {
      title: 'Why separate forms cause problems',
      intro:
        'Landlords lose time when the notice, claim form, and evidence are prepared separately and no longer read like one case. This is the middle ground between raw form downloads and paying for a solicitor to draft every document.',
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
        {
          title: 'Different from buying separate forms',
          body:
            'Blank court forms leave you to connect the notice, service record, N5, N119, arrears, evidence, and hearing prep yourself. Complete Pack builds them as one possession file.',
          imageSrc: '/images/complete-pack.webp',
          imageAlt: 'Complete Section 8 possession file preview',
        },
      ],
    },
    howThisHelps: {
      title: 'How the full pack improves the landlord outcome',
      intro:
        'The solicitor-approved Section 8 court and possession claim file keeps the route clear from notice through issue, evidence, and hearing preparation.',
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
        'This asks for the facts needed to prepare the notice and court papers together.',
      imageSrc: '/images/how-it-works-complete-pack.webp',
      imageAlt: 'How the complete Section 8 pack works from notice to court',
      imageHref: descriptor.wizardHref,
      mobileImageFirstFullBleed: true,
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
          title: 'Download the possession file',
          body:
            'Download the notice, N5, N119, arrears support, and filing guidance as one England possession file.',
        },
      ],
    },
    cta: {
      title: 'Prepare the court papers without piecing them together',
      body:
        'Choose this if you want the notice, service record, claim forms, evidence, and hearing support prepared together without buying Stage 1 separately first.',
      primary: {
        label: 'Prepare my court pack',
        href: descriptor.wizardHref,
      },
      secondary: {
        label: 'I only need the notice',
        href: '/products/notice-only',
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
          label: guideLinks.howToEvictTenantEngland.title,
          href: guideLinks.howToEvictTenantEngland.href,
        },
        {
          label: guideLinks.evictionProcessEngland.title,
          href: guideLinks.evictionProcessEngland.href,
        },
      ],
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
          description: PRODUCT_OWNER_METADATA.completePack.description,
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
