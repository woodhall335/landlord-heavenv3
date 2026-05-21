import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import { PRODUCTS } from '@/lib/pricing/products';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/standard-tenancy-agreement');
const standardWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_standard_tenancy_agreement&src=standard_tenancy_page&topic=tenancy';
const standardSampleProof = getGoldenPackProofData('england_standard_tenancy_agreement');
const standardSamplePage = getProductSamplePageByPackKey('england_standard_tenancy_agreement');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.standardTenancy.title,
  description: PRODUCT_OWNER_METADATA.standardTenancy.description,
  keywords: [
    'standard periodic tenancy agreement',
    'standard periodic tenancy agreement england',
    'periodic tenancy agreement template',
    'assured periodic tenancy agreement',
    'current England tenancy agreement',
    'standard England tenancy agreement',
    'current tenancy agreement',
    'Renters Rights Act compliant tenancy agreement',
    'post-May 2026 periodic tenancy',
    'england standard periodic tenancy agreement',
    'assured periodic tenancy agreement england',
    'england assured periodic tenancy agreement',
    'standard tenancy agreement england',
    'england tenancy agreement standard',
    'basic tenancy agreement england',
    'periodic tenancy agreement england',
    'new england tenancy agreement',
    'renters rights act tenancy agreement england',
    'new tenancy agreement england',
    'updated tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.standardTenancy.title,
    description: PRODUCT_OWNER_METADATA.standardTenancy.description,
    url: canonicalUrl,
    type: 'website',
  },
};

export default function StandardTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Standard Periodic Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Standard Periodic Tenancy Agreement',
          description: PRODUCT_OWNER_METADATA.standardTenancy.description,
          price: PRODUCTS.england_standard_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/standard-tenancy-agreement"
        title="Standard Tenancy Agreement for England Landlords"
        subtitle="Use this standard periodic tenancy agreement if you are letting a whole property in England and want current wording, setup records, and post-May 2026 terms without student, HMO, lodger, or Premium-level management wording."
        primaryCtaLabel="Build my validated Standard pack"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Read periodic tenancy guide"
        secondaryCtaHref="/periodic-tenancy-agreement"
        workflowImageLink={{
          href: standardWizardHref,
          desktopSrc: '/images/standard-tenancy-desktop.webp',
          mobileSrc: '/images/standard-tenancy-mobile.webp',
          alt: 'Standard tenancy agreement workflow',
          width: 1086,
          height: 1448,
        }}
        legacyNotice="If you were searching for a standard tenancy agreement, basic tenancy agreement, updated AST replacement, or current England tenancy agreement, this is the standard periodic tenancy agreement route for a straightforward whole-property let."
        introTitle="For a straightforward standard periodic tenancy"
        introBody={[
          'This is the standard periodic tenancy agreement workflow for a new England tenancy where the property is being let as an ordinary whole-property home. Use this route when you want current wording built around your property, occupiers, rent, deposit, and management facts, not a static form to adapt alone.',
          'The pack keeps the setup practical and proportionate: the main agreement plus the key supporting documents, validation checks, and preview-before-payment workflow, without making a simple tenancy feel more complicated than it needs to be.',
        ]}
        highlights={[
          'Standard periodic tenancy agreement for a straightforward whole-property residential let',
          "Renters' Rights Act compliant tenancy agreement with current wording",
          'Keeps the wording and pack paperwork practical and proportionate',
          'Separate from the Premium, Student, HMO / Shared House, and Lodger routes',
          'Solicitor-approved guided agreement pack with validation checks and a preview before payment',
        ]}
        compliancePoints={[
          'Built around the current England periodic tenancy route from 1 May 2026.',
          "Positioned for landlords who want current England wording for a straightforward let.",
          'Includes the practical England support documents that sit alongside the agreement.',
          'If the tenancy is really a student let, shared house, or resident-landlord arrangement, use the specialist product instead.',
        ]}
        keywordTargets={[
          'standard periodic tenancy agreement',
          'standard periodic tenancy agreement england',
          'england standard periodic tenancy agreement',
          'standard tenancy agreement england',
          'england tenancy agreement standard',
          'basic tenancy agreement england',
          'periodic tenancy agreement england',
          'ordinary residential tenancy agreement england',
          'new england tenancy agreement',
          'renters rights act tenancy agreement england',
          'new tenancy agreement england',
        ]}
        idealFor={[
          'the tenancy is a straightforward whole-property let in England',
          'you want a standard periodic tenancy agreement with the core support pack, but not the fuller Premium schedule',
          'you want the standard England option rather than a more detailed Premium pack',
          'you want a clean standard agreement without specialist student, shared-house, or resident-landlord wording',
        ]}
        notFor={[
          'you want fuller wording on inspections, repairs, key handling, contractor access, and handover from the outset',
          'the main issue is student occupation, guarantors, or end-of-term student turnover',
          "the property is really a shared house / HMO or a room let in the landlord's home",
        ]}
        routeComparison={[
          {
            title: 'Standard Periodic Tenancy Agreement',
            description:
              'The current England agreement for a straightforward whole-property let, with setup records, key clauses, and practical landlord wording.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Build my validated Standard pack',
            imageSrc: '/images/wizard-standard-tenancy-agreement.webp',
            imageAlt: 'Standard tenancy agreement preview',
            price: PRODUCTS.england_standard_tenancy_agreement.displayPrice,
            details: [
              {
                label: 'Best when',
                body: 'The current England agreement for a straightforward whole-property let, with setup records, key clauses, and practical landlord wording.',
              },
              {
                label: 'What it helps with',
                body:
                  'Gives landlords a clean starting point when the let is ordinary and does not need student, shared-house, or resident-landlord wording.',
              },
              {
                label: 'Common problem if you choose wrong',
                body:
                  'If you choose a specialist option by mistake, the paperwork can become more complicated than it needs to be. If you use older wording, the core terms may be too light.',
              },
              {
                label: 'How it helps you',
                body:
                  'Gets the tenancy in place with a clear England agreement and practical setup paperwork.',
              },
            ],
          },
          {
            title: 'Premium Tenancy Agreement',
            description:
              'The fuller current England option for ordinary residential lets that need stronger management wording.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Build my validated Premium pack',
            imageSrc: '/images/wizard-premium-tenancy-agreement.webp',
            imageAlt: 'Premium tenancy agreement preview',
            price: PRODUCTS.england_premium_tenancy_agreement.displayPrice,
            details: [
              {
                label: 'Best when',
                body:
                  'The fuller current England option for ordinary residential lets that need stronger management wording.',
              },
              {
                label: 'What it helps with',
                body:
                  'Helps when the landlord wants more detail around access, reporting, inspections, keys, repairs, and hand-back.',
              },
              {
                label: 'Common problem if you choose wrong',
                body:
                  'If a more involved let uses a lighter agreement, avoidable management arguments can start because expectations were not clear enough.',
              },
              {
                label: 'How it helps you',
                body:
                  'Gives the landlord a stronger written framework for day-to-day tenancy management.',
              },
            ],
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'The dedicated agreement for student households in England.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'Build my validated Student pack',
            imageSrc: '/images/wizard-student-tenancy-agreement.webp',
            imageAlt: 'Student tenancy agreement preview',
            price: PRODUCTS.england_student_tenancy_agreement.displayPrice,
            details: [
              {
                label: 'Best when',
                body: 'The dedicated agreement for student households in England.',
              },
              {
                label: 'What it helps with',
                body:
                  'Deals with guarantors, sharers, replacement requests, and end-of-term move-out more directly than a generic agreement.',
              },
              {
                label: 'Common problem if you choose wrong',
                body:
                  'If a student household uses a generic let, key pressure points can be under-explained until something goes wrong.',
              },
              {
                label: 'How it helps you',
                body:
                  'Gives the landlord an agreement that matches how the student property is occupied and managed.',
              },
            ],
          },
          {
            title: 'HMO / Shared House Tenancy Agreement',
            description:
              'The shared-house agreement for occupiers living together and using communal areas.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Build my validated HMO pack',
            imageSrc: '/images/wizard-hmo-agreement.webp',
            imageAlt: 'HMO shared house tenancy agreement preview',
            price: PRODUCTS.england_hmo_shared_house_tenancy_agreement.displayPrice,
            details: [
              {
                label: 'Best when',
                body:
                  'The shared-house agreement for occupiers living together and using communal areas.',
              },
              {
                label: 'What it helps with',
                body:
                  'Deals with house rules, communal spaces, sharer expectations, and shared living arrangements.',
              },
              {
                label: 'Common problem if you choose wrong',
                body:
                  'If a shared house is treated like a straightforward whole-property let, the paperwork can miss important shared-living rules.',
              },
              {
                label: 'How it helps you',
                body:
                  'Helps the landlord run a shared property with paperwork that fits the setup.',
              },
            ],
          },
          {
            title: 'Lodger Agreement',
            description:
              'The room-let agreement for a landlord who lives in the property.',
            href: '/lodger-agreement',
            ctaLabel: 'Build my validated Lodger pack',
            imageSrc: '/images/wizard-lodger-agreement.webp',
            imageAlt: 'Lodger agreement preview',
            price: PRODUCTS.england_lodger_agreement.displayPrice,
            details: [
              {
                label: 'Best when',
                body: 'The room-let agreement for a landlord who lives in the property.',
              },
              {
                label: 'What it helps with',
                body:
                  'Keeps the resident-landlord arrangement separate from a standard tenancy, with shared-home rules and notice expectations set out.',
              },
              {
                label: 'Common problem if you choose wrong',
                body:
                  "If a lodger setup is treated like a normal tenancy, the paperwork may not match shared occupation inside the landlord's home.",
              },
              {
                label: 'How it helps you',
                body:
                  'Gives the landlord a clearer room-let agreement for a shared-home arrangement.',
              },
            ],
          },
        ]}
        salesContent={{
          sampleProof: standardSampleProof ? (
            <GoldenPackProof data={standardSampleProof} samplePageHref={standardSamplePage?.samplePath} />
          ) : undefined,
          showPackBreakdown: false,
          whyYouNeedThis: {
            title: 'Why a standard periodic agreement still needs proper setup',
            intro:
              'Even a straightforward assured periodic tenancy agreement can become awkward if the agreement is thin, the setup records are missing, or the wording does not match the current England position. This standard agreement route is built for post-May 2026 periodic tenancy setup.',
            cards: [
              {
                title: 'The wording needs to match the let',
                body:
                  'A standard periodic tenancy works best when the agreement is clear about rent, occupation, access, responsibilities, and the way the property is actually being let.',
              },
              {
                title: 'Simple lets still need clean records',
                body:
                  'Straightforward tenancies often get the least admin, which is why smaller missing details become harder to reconstruct when a dispute appears.',
              },
              {
                title: 'Older wording can feel out of step',
                body:
                  'Landlords searching for an old-style AST replacement need a current standard periodic agreement, not a document that feels patched together from older assumptions.',
              },
            ],
          },
          howThisHelps: {
            title: 'How this helps you',
            intro:
              'The Standard route is designed to help landlords set up an ordinary England tenancy clearly, without loading it up with specialist wording it does not need.',
            cards: [
              {
                title: 'It keeps the agreement proportionate',
                body:
                  'The wording is aimed at a normal whole-property let, so the agreement stays easier to read and use.',
              },
              {
                title: 'It gives the landlord a cleaner starting point',
                body:
                  'The wizard gathers the property, tenant, rent, deposit, and setup details in one flow so the document does not feel pieced together.',
              },
              {
                title: 'It helps avoid the wrong product',
                body:
                  'If the let is student, shared-house, lodger, or needs heavier management wording, the comparison cards point you to the better route.',
              },
            ],
          },
          howItWorks: {
            title: 'How it works',
            intro:
              'The steps are built for landlords who want to get a straightforward tenancy in place properly without drafting everything from scratch.',
            steps: [
              {
                step: 'Step 01',
                title: 'Add the property and tenancy details',
                body:
                  'Enter the landlord, tenant, rent, and property details that drive the main agreement and the supporting records.',
              },
              {
                step: 'Step 02',
                title: 'Answer the setup questions',
                body:
                  'Confirm the deposit, pets, keys, and other practical points so the pack includes the documents that fit the way the let is actually being started.',
              },
              {
                step: 'Step 03',
                title: 'Create the full Standard pack',
                body:
                  'Download the agreement and the supporting paperwork as one England tenancy pack that is ready to print and use.',
              },
            ],
          },
          ctaTitle: 'Build the validated Standard tenancy pack',
          ctaBody:
            'Use this option when the let is straightforward and you want solicitor-approved document preparation with validation checks instead of a wording-only form for an ordinary whole-property home in England.',
        }}
        faqs={[
          {
            question: 'When should I choose this instead of the Premium assured periodic route?',
            answer:
              'Choose this option when the let is a straightforward whole-property tenancy in England and you do not need the more detailed management, inspection, handover, and operational drafting included in the Premium pack.',
          },
          {
            question: 'Is this the new England tenancy agreement for the current rules?',
            answer:
               'Yes. This page is built around the current England assured periodic position and is designed as the standard new tenancy agreement route for straightforward whole-property lets, rather than an older fixed-term AST-style starting point.',
          },
          {
            question: 'Is this the right Renters Rights Act tenancy agreement route for a straightforward let?',
            answer:
              'Usually, yes. If the tenancy is a standard whole-property let in England and you want the current baseline option, this is the assured periodic agreement most landlords are looking for when they search for a Renters Rights Act tenancy agreement.',
          },
          {
            question: 'What does this assured periodic pack include?',
            answer:
              'The pack centres on the standard periodic tenancy agreement and includes the practical setup paperwork landlords usually need around the tenancy.',
          },
          {
            question: 'Should I use this for a student or HMO let?',
            answer:
              'Usually not. Student and HMO / Shared House lets now have their own England products, so this standard assured periodic option is best for ordinary residential lets that do not need specialist wording.',
          },
          {
            question: 'Is this a court approved tenancy agreement?',
            answer:
              'No. Courts do not pre-approve any notice, claim form, or agreement. This tenancy agreement follows current England rules and includes checks to help you complete it correctly.',
          },
          {
            question: 'Is this legally binding?',
            answer:
              'Yes - when completed and signed correctly. This template follows post-May 2026 England rules, and the checklist helps you avoid common tenancy agreement mistakes.',
          },
        ]}
        finalCtaBody="Use this standard periodic tenancy agreement workflow when the tenancy is straightforward and the property is being let as an ordinary whole-property home. Build the agreement from your facts, preview before payment, and compare Premium or the specialist products only when the facts call for something more tailored."
      />
    </div>
  );
}
