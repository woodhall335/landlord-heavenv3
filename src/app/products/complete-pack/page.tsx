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
    'review-ready Section 8 court file',
    'N5 N119 forms',
    'N5 possession claim form',
    'N119 particulars of claim',
    'rent arrears possession claim',
    'complete eviction pack england',
    'eviction court document pack',
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
      'It is the full Review-ready Section 8 court and possession file for England landlords. It includes everything in Stage 1 plus N5, N119, witness statement, court readiness status, court bundle index, evidence collection checklist, court filing guide, hearing checklist, eviction case summary, and arrears engagement letter.',
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
  {
    question: 'Do I need to buy the Stage 1 pack first?',
    answer:
      'No. The Complete Pack already includes the Stage 1 Section 8 notice and service file, so you do not need to buy Notice Only separately.',
  },
  {
    question: 'Is this legal advice?',
    answer:
      'No. This is a procedural document pack prepared from the information you provide. Take legal advice before filing if the tenancy facts are unusual, the claim is disputed, or you expect a defence.',
  },
];


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
          <p className="mt-1 text-white">
            It includes the Form 3A notice and service file, then adds the N5,
            N119, evidence, filing, and hearing support for the possession claim.
          </p>
        </div>
      ),
      mediaSrc: '/images/illustrations/products/possession-court-pack-waterbrush-v1.webp',
      mediaAlt: 'Waterbrush illustration of the England Stage 2 court and possession pack',
      showTrustPositioningBar: true,
      trustPositioningPreset: 'complete_pack',
    },
    conversionPanel: {
      eyebrow: 'Eviction notices',
      productName: 'Complete Pack',
      decisionTitle: 'Choose this if court is likely.',
      decisionBody:
        'Prepare the Form 3A notice and service file, then carry the same case into N5, N119, evidence, filing, and hearing preparation.',
      artworkSrc: '/images/illustrations/product-panels/complete-pack-court-papers-v1.webp',
      artworkAlt: 'Illustration of a prepared possession claim file and courthouse',
      features: [
        { title: 'Notice to court', body: 'One connected case file', icon: 'court' },
        { title: 'Fixed price', body: 'No hidden charges', icon: 'price' },
        { title: 'Guided builder', body: 'Step-by-step questions', icon: 'builder' },
      ],
      previewText: 'Preview available before payment where shown.',
      reassuranceTitle: 'Notice-to-court preparation support',
      reassuranceBody: 'Connected notice, claim, evidence, filing, and hearing documents.',
    },
    postHeroContent: (
      <>
        <AssistedPrepServicesShowcase
          pagePath={descriptor.landingHref}
          pageType="product_page"
          src="product_complete_pack"
        />
        <Section8JourneyTimeline
          stage="stage2"
          title="See the notice-to-court path"
          intro="The Complete Pack carries the same England Section 8 case from notice, through expiry, into claim and hearing preparation."
        />
      </>
    ),
    afterPostHeroContent: (
      <>
        <section className="scroll-mt-24 bg-white py-10 md:py-12" aria-label="Complete pack stage route">
          <a href={descriptor.wizardHref} className="block w-full">
            <picture>
              <source media="(max-width: 767px)" srcSet="/images/illustrations/products/possession-court-pack-waterbrush-v1.webp" />
              <Image
                src="/images/illustrations/products/possession-court-pack-waterbrush-v1.webp"
                alt="Waterbrush illustration of the complete court and possession route"
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
        'Prepare the full possession file, not just the court forms. You can check the claim forms and supporting file before you pay. This is procedural document preparation, not legal advice.',
      imageSrc: '/images/illustrations/products/possession-court-pack-waterbrush-v1.webp',
      imageAlt: 'Waterbrush illustration of the complete Section 8 eviction pack',
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
        'The pack keeps the notice, service evidence, claim forms, and court preparation together. Here is what each part contributes to the case.',
      items: [
        {
          name: 'Form 3A (Section 8 Notice)',
          plainEnglish:
            'The formal notice telling the tenant which possession grounds you rely on and how much notice they have.',
          function:
            'It creates the legal starting point for the claim before N5 and N119 are filed.',
          riskIfMissing:
            'Incorrect grounds, dates, or supporting details can delay or undermine the claim before the court reaches the main facts.',
          landlordOutcome:
            'A current Form 3A that stays aligned with the later court paperwork.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/section8-form3a-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a Form 3A notice, calendar, rental home and key',
        },
        {
          name: 'Stage 1 Notice and Service File',
          plainEnglish:
            'The Form 3A notice, N215 service record, arrears schedule, pre-service checks, case summary, and next-step guide.',
          function:
            'It preserves the facts, figures, and service evidence the court forms will later rely on.',
          riskIfMissing:
            'Weak notice or service records cannot be repaired simply by completing the court forms well.',
          landlordOutcome:
            'One continuous file from notice preparation through to the possession claim.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/stage1-notice-service-file-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of an organised notice and service case file',
        },
        {
          name: 'Form N5 (Claim for Possession)',
          plainEnglish:
            'The court form that formally opens the possession claim.',
          function:
            'It identifies the parties, property, claim type, and order you are asking the court to make.',
          riskIfMissing:
            'Missing or inconsistent claim details can cause rejection, questions from the court, or avoidable delay.',
          landlordOutcome:
            'A completed claim form that matches the notice and the rest of the possession file.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/form-n5-possession-claim-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of an N5 possession claim entering the court process',
        },
        {
          name: 'Form N119 (Particulars of Claim)',
          plainEnglish:
            'The detailed statement explaining the tenancy, grounds, arrears, notice, and claim to the court.',
          function:
            'It gives the judge the factual account behind the shorter N5 claim form.',
          riskIfMissing:
            'Unclear particulars force the court to piece the case together and can expose inconsistencies in the claim.',
          landlordOutcome:
            'A structured explanation that connects the evidence to the possession order you are seeking.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/form-n119-particulars-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of N119 particulars linked to supporting evidence',
        },
        {
          name: 'Schedule of Arrears and Arrears Engagement Letter',
          plainEnglish:
            'A month-by-month rent record, paired with a letter showing how you raised the arrears with the tenant.',
          function:
            'Together they show the amount outstanding and the steps taken to address it before court.',
          riskIfMissing:
            'Vague figures or no engagement record make the arrears history harder to verify and explain.',
          landlordOutcome:
            'A consistent financial record that follows the case from notice to hearing.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/arrears-engagement-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a rent ledger, engagement letter, calculator and coins',
        },
        {
          name: 'Witness Statement',
          plainEnglish:
            'A structured account of the case written for the court and supported by the documents in the file.',
          function:
            'It explains the chronology and connects the tenancy, breach, notice, service, and arrears evidence.',
          riskIfMissing:
            'Forms and exhibits without a clear account can leave the judge to work out how the evidence fits together.',
          landlordOutcome:
            'A coherent narrative you can review against the evidence before filing or a hearing.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/witness-statement-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a signed witness statement with organised evidence',
        },
        {
          name: 'Court Readiness Status and Evidence Collection Checklist',
          plainEnglish:
            'A status review showing what is ready, what evidence is present, and what still needs attention.',
          function:
            'It checks the tenancy, notice, service, arrears, and claim documents as one connected case.',
          riskIfMissing:
            'A missing exhibit or inconsistency may only surface after the claim has been filed.',
          landlordOutcome:
            'A practical view of the case’s strengths, gaps, and documents still to collect.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/court-readiness-evidence-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of a court-readiness checklist and organised evidence',
        },
        {
          name: 'Court Bundle Index, Court Filing Guide, and Hearing Checklist',
          plainEnglish:
            'An ordered bundle list with practical filing instructions and a checklist for hearing day.',
          function:
            'It shows how to arrange the papers, submit the claim, and prepare the documents you may need in court.',
          riskIfMissing:
            'Correct forms can still be slowed down by disorganised filing, missing copies, or poor hearing preparation.',
          landlordOutcome:
            'A clearer route from completed forms to an organised filing and hearing file.',
          includedByDefault: true,
          imageSrc: '/images/illustrations/product-cards/court-bundle-filing-hearing-card-v1.webp',
          imageAlt: 'Portrait watercolour illustration of an indexed court bundle, filing papers and hearing calendar',
        },
      ],
      sampleProof: sampleProof ? (
        <GoldenPackProof data={sampleProof} samplePageHref={samplePage?.samplePath} />
      ) : undefined,
    },
    comparisonBlock: {
      title: 'Stage 2 includes the notice and court claim',
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
          imageSrc: '/images/illustrations/products/section8-notice-preparation-waterbrush-v1.webp',
          imageAlt: 'Waterbrush illustration of serving the Section 8 notice first',
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
          imageSrc: '/images/illustrations/products/possession-court-pack-waterbrush-v1.webp',
          imageAlt: 'Waterbrush illustration of the Section 8 claim and hearing route',
        },
      ],
    },
    midPageCta: {
      title: 'Ready to prepare your Section 8 court pack?',
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
          imageSrc: '/images/illustrations/services/possession-court-evidence-waterbrush-v2.webp',
          imageAlt: 'Waterbrush illustration of court paperwork and notice review',
        },
        {
          title: 'Weak particulars make a good case harder to follow',
          body:
            "If the landlord's position is unclear in N119, the case is harder to follow even when the facts are sound.",
          imageSrc: '/images/heroes/library/hero-guide-rent-arrears-schedule-v2.webp',
          imageAlt: 'Waterbrush illustration of arrears paperwork and a rent schedule',
        },
        {
          title: 'Filing errors create expensive delay',
          body:
            'Even after the notice is served, the case can still be slowed down by bad filing, missing paperwork, or an evidence bundle that was never organised properly.',
          imageSrc: '/images/illustrations/services/possession-court-evidence-waterbrush-v2.webp',
          imageAlt: 'Waterbrush illustration of notice service and delivery proof',
        },
        {
          title: 'Different from buying separate forms',
          body:
            'Blank court forms leave you to connect the notice, service record, N5, N119, arrears, evidence, and hearing prep yourself. Complete Pack builds them as one possession file.',
          imageSrc: '/images/illustrations/products/possession-court-pack-waterbrush-v1.webp',
          imageAlt: 'Waterbrush illustration of a complete Section 8 possession file',
        },
      ],
    },
    howThisHelps: {
      title: 'How the full pack helps',
      intro:
        'The Section 8 court and possession file keeps the notice, claim details, evidence and hearing preparation together for review.',
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
      imageSrc: '/images/illustrations/products/possession-court-pack-waterbrush-v1.webp',
      imageAlt: 'Waterbrush illustration of how the complete Section 8 pack works from notice to court',
      imageHref: descriptor.wizardHref,
      mobileImageFirstFullBleed: true,
      alignImageToSteps: true,
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
        label: 'Prepare and preview my court pack — £69.99',
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
      visual: {
        eyebrow: 'Complete Pack',
        highlightedText: 'without piecing them together',
        artworkSrc: '/images/illustrations/product-banners/complete-pack-conversion-v1.webp',
        artworkAlt: 'Illustration of connected Section 8 notice, claim, evidence and court documents',
        features: [
          { title: 'Form 3A + N5/N119', body: 'Notice and claim documents', icon: 'document' },
          { title: 'Evidence and filing', body: 'Bundle and submission guidance', icon: 'folder' },
          { title: 'Hearing support', body: 'Checklist and next steps', icon: 'hearing' },
        ],
        reassuranceTitle: 'Built for the full court route',
        reassuranceBody: 'Keep the notice, claim forms, evidence, and next steps in one guided flow.',
      },
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
