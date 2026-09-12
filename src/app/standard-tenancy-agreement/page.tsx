import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FileCheck2 } from 'lucide-react';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { TenancyJurisdictionSelector } from '@/components/tenancy/TenancyJurisdictionSelector';
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

const standardWorkflowFeatures = [
  {
    title: 'Agreement built from your answers',
    body: 'Property, occupier, rent and tenancy details flow into one current England agreement.',
    imageSrc:
      '/images/illustrations/tenancy-standard/answers-to-agreement-watercolour-v2.webp',
    imageAlt:
      'Illustrated tenancy agreement, English rental property, key and connected tenancy details',
  },
  {
    title: 'Setup records kept together',
    body: 'The relevant deposit, guarantor, inventory and handover records stay with the main agreement.',
    imageSrc:
      '/images/illustrations/tenancy-standard/joined-tenancy-file-watercolour-v2.webp',
    imageAlt:
      'Illustrated property folder holding joined-up tenancy, rent, deposit and handover records',
  },
  {
    title: 'Checks before checkout',
    body: 'Review the key details and inspect your generated preview before deciding whether to pay.',
    imageSrc: '/images/illustrations/tenancy-standard/check-preview-watercolour-v2.webp',
    imageAlt:
      'Illustrated validation checklist, magnifying glass, calendar and shield check',
  },
] as const;

function StandardPackWorkflowSection() {
  return (
    <section
      aria-labelledby="standard-pack-workflow-heading"
      data-standard-pack-workflow="true"
      className="mb-12 overflow-hidden rounded-[2rem] border border-[#D9D2F2] bg-[linear-gradient(135deg,#F8F5FF_0%,#FFFFFF_48%,#F2EDFF_100%)] shadow-[0_20px_55px_rgba(54,35,103,0.11)]"
    >
      <div className="grid lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)] lg:items-stretch">
        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6D28D9]">
            Inside the Standard pack
          </p>
          <h2
            id="standard-pack-workflow-heading"
            className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-[#17142B] sm:text-4xl"
          >
            Build the tenancy file in one guided flow
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#56506A] md:text-lg">
            Add the facts once, check how they appear across the pack, and preview the finished
            documents before payment. Each record is prepared to work with the agreement rather
            than sitting in a separate, disconnected template.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {standardWorkflowFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className="overflow-hidden rounded-2xl border border-[#E3DCF5] bg-white/90 shadow-[0_10px_24px_rgba(61,42,102,0.06)]"
                >
                  <div className="relative h-32 border-b border-[#EEE8FA] bg-[radial-gradient(circle_at_50%_42%,#FFFFFF_0%,#F3EEFF_68%,#E9E0FF_100%)]">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover object-center"
                      sizes="(min-width: 1280px) 190px, (min-width: 640px) 30vw, 100vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-semibold leading-6 text-[#17142B]">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#625A73]">{feature.body}</p>
                  </div>
                </article>
              ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={standardWizardHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(109,40,217,0.24)] transition hover:bg-[#5B21B6]"
            >
              Build and preview my Standard pack
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#5E5570]">
              <FileCheck2 className="h-4 w-4 text-[#6D28D9]" aria-hidden="true" />
              Preview before payment
            </span>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden border-t border-[#DDD5F3] bg-[#EEE8FF] sm:min-h-[560px] lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src="/images/illustrations/tenancy-standard/standard-pack-panel-watercolour-v3.webp"
            alt="Standard Tenancy Pack for England with agreement, supporting records and validation checks"
            fill
            className="object-cover object-center"
            sizes="(min-width: 1024px) 46vw, 100vw"
          />
          <div className="absolute inset-x-6 bottom-6 z-20 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_36px_rgba(49,32,91,0.14)] backdrop-blur sm:inset-x-8 sm:bottom-8">
            <p className="font-semibold text-[#24184B]">One joined-up tenancy file</p>
            <p className="mt-1 text-sm leading-6 text-[#5F5671]">
              Agreement, relevant supporting records and validation checks prepared from the same answers.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Standard Tenancy Agreement by UK Jurisdiction',
  description:
    'Choose the right standard tenancy agreement for your rental property. Build a current England assured periodic agreement or select the correct Wales, Scotland or Northern Ireland route.',
  keywords: [
    'standard periodic tenancy agreement',
    'standard periodic tenancy agreement england',
    'periodic tenancy agreement template',
    'assured periodic tenancy agreement',
    'current England tenancy agreement',
    'standard England tenancy agreement',
    'current tenancy agreement',
    'Renters Rights Act tenancy agreement',
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
    title: 'Choose the Right Standard Tenancy Agreement by Property Location',
    description:
      'Start the correct standard tenancy agreement for the property jurisdiction, including assured periodic England agreements and separate Welsh occupation-contract options.',
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
          { name: 'Standard Tenancy Agreements by Jurisdiction', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Standard Tenancy Agreement by Property Jurisdiction',
          description: PRODUCT_OWNER_METADATA.standardTenancy.description,
          price: PRODUCTS.england_standard_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/standard-tenancy-agreement"
        title="Choose the right standard tenancy agreement for your property"
        subtitle="Start with the rental property’s location. England, Wales, Scotland and Northern Ireland use different tenancy frameworks, so the wizard asks the right questions and builds the right agreement route for the property."
        primaryCtaLabel="Choose property jurisdiction"
        primaryCtaHref="#choose-jurisdiction"
        secondaryCtaLabel="Compare England agreements"
        secondaryCtaHref="/tenancy-agreements/england"
        heroPreTitleLabel="Standard tenancy agreements"
        heroBadge="England, Wales, Scotland and Northern Ireland"
        heroTrustText="Current tenancy-agreement routes for England, Wales, Scotland and Northern Ireland."
        heroFeature="For England, new straightforward private residential lets use the assured periodic route introduced on 1 May 2026."
        heroMediaSrc="/images/illustrations/tenancy-jurisdictions/england-assured-periodic-waterbrush-v2.webp"
        heroMediaAlt="Waterbrush illustration of an England assured periodic tenancy agreement, calendar and property keys"
        showHeroTrustPositioningBar={false}
        afterHero={<TenancyJurisdictionSelector />}
        workflowSection={<StandardPackWorkflowSection />}
        showFitGuidance={false}
        showCoverageSummary={false}
        showVisualCtaPrimaryArrow={false}
        legacyNotice="Searching for an AST replacement, basic tenancy agreement or standard tenancy agreement for England? For a new straightforward whole-property let, this is the assured periodic route. It is not the right route for Wales, Scotland, Northern Ireland, a resident landlord, a shared house or a specialist student let."
        introTitle="England Standard Tenancy Agreement: clear, current paperwork for a straightforward let"
        introBody={[
          'Use this route when you are letting an ordinary whole property in England and want the agreement built around the landlord, occupiers, rent, deposit, guarantor and management details that actually apply to the let. It is a guided setup pack, not a static form to adapt alone.',
          'The Standard pack keeps a simple let proportionate: the core assured periodic agreement, setup records, validation checks and a preview before payment. If you need more detailed management drafting, or the property is student-led, shared or within your own home, choose the specialist route instead.',
        ]}
        highlights={[
          'Standard assured periodic agreement for a straightforward whole-property residential let in England',
          'Written around the landlord, tenants, property, rent, deposit and guarantor details you provide',
          'Includes the practical setup records shown in the sample pack, where they apply to your answers',
          'Keeps the terms proportionate rather than adding specialist student, HMO or resident-landlord wording',
          'Current wording, guided validation and a full preview before payment',
        ]}
        compliancePoints={[
          'From 1 May 2026, new private assured tenancies in England use the assured periodic framework.',
          'Prompts you for the information that should be recorded in writing before the agreement is signed or agreed.',
          'Helps keep the agreement and practical supporting records together at the start of the tenancy.',
          'Directs student, shared-house / HMO and resident-landlord arrangements to the more suitable product route.',
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
          'you want the standard agreement and core setup records, rather than the fuller Premium management schedule',
          'the tenants will occupy the property as an ordinary private residential home',
          'you want a clear, current agreement without specialist student, shared-house or resident-landlord wording',
        ]}
        notFor={[
          'you want fuller wording on inspections, repairs, key handling, contractor access and handover from the outset',
          'the main issue is student occupation, guarantors, or end-of-term student turnover',
          "the property is really a shared house / HMO or a room let in the landlord's home",
        ]}
        routeComparison={[
          {
            title: 'Standard Periodic Tenancy Agreement',
            description:
              'The current England agreement for a straightforward whole-property let, with setup records, key clauses, and practical landlord wording.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Build my Standard pack',
            imageSrc: '/images/generated/product-cards/standard-tenancy-agreement.webp',
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
            ctaLabel: 'Build my Premium pack',
            imageSrc: '/images/generated/product-cards/premium-tenancy-agreement.webp',
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
      ctaLabel: 'Create my Student tenancy pack',
            imageSrc: '/images/generated/product-cards/student-tenancy-agreement.webp',
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
      ctaLabel: 'Create my HMO tenancy pack',
            imageSrc: '/images/generated/product-cards/hmo-shared-house-agreement.webp',
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
      ctaLabel: 'Create my Lodger agreement pack',
            imageSrc: '/images/generated/product-cards/lodger-agreement.webp',
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
            title: 'Why a straightforward tenancy still needs a proper setup',
            intro:
              'A simple let does not need unnecessary legal jargon, but it does need the agreement, written information and day-one records to match the property and occupiers. This route helps you build a usable starting file around the facts you enter, rather than adapting older AST wording after the event.',
            cards: [
              {
                title: 'The agreement should match the real let',
                body:
                  'Rent, occupiers, deposit, pets, access and responsibilities are easier to manage when they are set out consistently from the start. The wizard asks for these practical facts before the pack is generated.',
                imageSrc: '/images/illustrations/landlord-documents/tenancy-periodic.webp',
                imageAlt: 'Watercolour illustration of a periodic tenancy agreement and calendar',
              },
              {
                title: 'Simple lets still need clean records',
                body:
                  'A deposit record, tenancy details and a clear inventory or handover trail are much easier to keep at the beginning than to reconstruct when a question arises later.',
                imageSrc: '/images/illustrations/landlord-documents/tenancy-inventory.webp',
                imageAlt: 'Watercolour illustration of an inventory checklist and property keys',
              },
              {
                title: 'Older AST wording is no longer the right starting point',
                body:
                  'For new private assured tenancies in England, fixed-term AST wording is no longer the usual starting point. A clear assured periodic agreement is a better fit for a new straightforward let.',
                imageSrc: '/images/illustrations/landlord-documents/site-tenancy-england.webp',
                imageAlt: 'Watercolour illustration of England tenancy paperwork',
              },
            ],
          },
          howThisHelps: {
            title: 'How the Standard pack helps you start clearly',
            intro:
              'The aim is practical: a clean, current agreement for an ordinary England let, supporting records that follow your answers, and a chance to inspect the result before you pay. It is not a substitute for legal advice where the arrangement is unusual or disputed.',
            cards: [
              {
                title: 'It keeps the agreement proportionate',
                body:
                  'The Standard route is designed for an ordinary whole-property let, so the agreement remains easier for you and the tenants to read and use.',
                imageSrc:
                  '/images/illustrations/tenancy-standard/standard-agreement-watercolour-v2.webp',
                imageAlt:
                  'Watercolour illustration of a Standard agreement, England home, checklist and keys',
                imageFit: 'cover',
              },
              {
                title: 'It gives you one guided starting point',
                body:
                  'The wizard gathers the property, tenants, rent, deposit, guarantor and setup details in one flow, helping the documents feel joined-up rather than pieced together.',
                imageSrc:
                  '/images/illustrations/tenancy-standard/guided-setup-watercolour-v2.webp',
                imageAlt:
                  'Watercolour illustration of a guided setup connecting the property, tenants and rent details',
                imageFit: 'cover',
              },
              {
                title: 'It helps you avoid the wrong product',
                body:
                  'If the let is student, shared-house, lodger or needs fuller management wording, the comparison cards point you to a more suitable route before you generate the wrong pack.',
                imageSrc:
                  '/images/illustrations/tenancy-standard/agreement-selector-watercolour-v2.webp',
                imageAlt:
                  'Watercolour comparison with Standard selected from Premium, Student, HMO and Lodger agreements',
                imageFit: 'cover',
              },
            ],
          },
          howItWorks: {
            title: 'How it works',
            intro:
              'The steps are designed for landlords who want to set up a straightforward tenancy without drafting everything from scratch or guessing which fields matter.',
            steps: [
              {
                step: 'Step 01',
                title: 'Add the property and tenancy details',
                body:
                  'Enter the landlord, tenant, property and rent details that drive the main agreement and supporting records.',
              },
              {
                step: 'Step 02',
                title: 'Answer the setup questions',
                body:
                  'Confirm the deposit, guarantor, pets, keys and other practical points so the pack reflects the way the let is actually being started.',
              },
              {
                step: 'Step 03',
                title: 'Create the full Standard pack',
                body:
                  'Review the generated pack before payment, then download the agreement and supporting paperwork together when you are happy with the details.',
              },
            ],
            imageSrc:
              '/images/illustrations/tenancy-standard/standard-how-it-works-watercolour-v3.webp',
            imageAlt:
              'Vertical watercolour workflow from adding tenancy details and checking the setup to previewing the completed Standard pack',
            imagePadding: false,
          },
          ctaTitle: 'Create your Standard tenancy pack',
          ctaBody:
            'Use this option when the let is straightforward and you want review-ready document preparation with validation checks instead of a wording-only form for an ordinary whole-property home in England.',
          ctaVisual: {
            eyebrow: 'Standard tenancy',
            highlightedText: 'tenancy pack',
            artworkSrc:
              '/images/illustrations/tenancy-cta/standard-tenancy-pack-v1.webp',
            artworkAlt:
              'Standard tenancy pack with tenancy terms, England guide, checklist and validation documents',
            features: [
              {
                icon: 'document',
                title: 'Review-ready',
                body: 'Guided document preparation',
              },
              {
                icon: 'location',
                title: 'England only',
                body: 'Whole-property let',
              },
              {
                icon: 'validation',
                title: 'Validation checks',
                body: 'Built into the flow',
              },
            ],
          },
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
               'It is designed for the current England assured periodic position and for straightforward whole-property lets. It is not a replacement for legal advice on an unusual arrangement, a company let, a resident-landlord arrangement, social housing, or a dispute.',
          },
          {
            question: 'Is this the right Renters Rights Act tenancy agreement route for a straightforward let?',
            answer:
              'Usually, yes. If you are creating a new straightforward private whole-property tenancy in England, this is the standard assured periodic route. Use the comparison cards if the let is student-led, shared, involves a resident landlord, or needs fuller management wording.',
          },
          {
            question: 'What does this assured periodic pack include?',
            answer:
              'The pack centres on the Standard Assured Periodic Tenancy Agreement and includes the practical setup records shown in the sample viewer when they apply to the answers you give. You can inspect the sample and your own preview before payment.',
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
              'A tenancy agreement can be legally binding when it is completed and agreed correctly. This guided pack helps you record the key terms, but you remain responsible for ensuring the facts are accurate and for taking advice where your arrangement is unusual or disputed.',
          },
          {
            question: 'What written information do I need to give a new tenant in England?',
            answer:
              'For a tenancy created after 1 May 2026, landlords must give tenants certain written information about the key terms before signing the agreement or agreeing the tenancy. The wizard prompts for the relevant agreement information, but you should check that your completed pack and delivery process match your circumstances.',
          },
          {
            question: 'Do I need to replace an AST that started before 1 May 2026?',
            answer:
              'Usually no. Existing written assured or assured shorthold tenancies moved into the assured periodic system on 1 May 2026, but landlords had a separate obligation to provide the Government’s Renters’ Rights Act Information Sheet 2026 by 31 May 2026. This Standard route is for setting up a new straightforward tenancy.',
          },
        ]}
        finalCtaBody="Use this route when you are setting up a new, straightforward whole-property tenancy in England. Build the agreement from your facts, inspect the sample and your own preview before payment, and choose Premium or a specialist product only when the property setup genuinely needs it."
      />
    </div>
  );
}
