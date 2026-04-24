import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { buildTenancyPackBreakdown } from '@/lib/marketing/tenancy-pack-breakdowns';
import { PRODUCTS } from '@/lib/pricing/products';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const premiumWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_premium_tenancy_agreement&src=england_tenancy_page&topic=tenancy';
const premiumPackBreakdown = buildTenancyPackBreakdown('england_premium_tenancy_agreement');
const premiumSampleProof = getGoldenPackProofData('england_premium_tenancy_agreement');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Premium Tenancy Agreement England | Fuller Residential Drafting',
  description:
    'Create a Premium Tenancy Agreement for an ordinary residential let in England that needs fuller drafting, more day-to-day detail, and stronger management wording under the current assured periodic route.',
  keywords: [
    'premium assured periodic tenancy agreement england',
    'england premium assured periodic tenancy agreement',
    'premium tenancy agreement england',
    'periodic tenancy agreement england',
    'assured periodic tenancy agreement england',
    'england premium residential tenancy agreement',
    'england tenancy agreement premium',
    'new england tenancy agreement',
    'renters rights act tenancy agreement england',
    'new tenancy agreement generator england',
    'premium tenancy agreement generator england',
    'updated tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Premium Tenancy Agreement England | Fuller Residential Drafting',
    description:
      'Premium tenancy agreement for ordinary residential lets in England that need fuller drafting, more day-to-day detail, and stronger management wording.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function PremiumTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Premium Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Premium Tenancy Agreement',
          description: PRODUCTS.england_premium_tenancy_agreement.description,
          price: PRODUCTS.england_premium_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/premium-tenancy-agreement"
        title="Premium Tenancy Agreement England"
        subtitle="Use this more detailed England tenancy agreement when the tenancy is still a standard residential let, but you want fuller wording around access, repairs, handover, keys, and day-to-day management than the updated Standard assured periodic route provides."
        primaryCtaLabel="Start premium tenancy agreement"
        primaryCtaHref={premiumWizardHref}
        secondaryCtaLabel="Read assured periodic guide"
        secondaryCtaHref="/assured-periodic-tenancy-agreement"
        legacyNotice="If you were searching for a premium tenancy agreement, an updated AST replacement, or a current England tenancy agreement generator with fuller drafting, this is the more detailed assured periodic route for ordinary residential lets that need stronger management and handover wording under the post-Renters' Rights Act framework."
        introTitle="For a standard residential let with more detail built in"
        introBody={[
          "This page is for landlords who need more than the standard assured periodic agreement but do not need a separate Student, HMO / Shared House, or Lodger product. It is the more detailed England tenancy agreement route under the post-Renters' Rights Act framework.",
          'Premium keeps the tenancy on the standard residential route, while adding fuller wording around inspections, repairs reporting, key handling, contractor access, utilities handover, and move-out expectations.',
        ]}
        highlights={[
          'Premium assured periodic route for standard residential lets that need more detail than the standard version',
          'Adds fuller wording around management and handover',
          'Separate from Student, HMO / Shared House, and Lodger routes',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Built on the same current England assured periodic route as Standard from 1 May 2026.',
          "Positioned as the updated fuller England route for landlords who still want Renters' Rights Act-compliant wording on an ordinary residential let.",
          'Designed for users looking for an updated England tenancy agreement, without suggesting Premium is a separate statutory form.',
          'Adds more depth without treating HMO, student, or lodger arrangements as if they were all the same thing.',
          'Includes the practical written information and file paperwork that sit alongside the agreement.',
          'Not positioned as an old fixed-term AST shortcut product.',
        ]}
        keywordTargets={[
          'premium tenancy agreement england',
          'england premium residential tenancy agreement',
          'england tenancy agreement with guarantor',
          'england tenancy agreement management schedule',
          'premium landlord tenancy agreement england',
          'new england tenancy agreement',
          'renters rights act tenancy agreement england',
          'new tenancy agreement generator england',
          'premium tenancy agreement generator england',
        ]}
        idealFor={[
          'the let is still a standard whole-property tenancy in England, but you want fuller drafting than the standard assured periodic route',
          'you want a new tenancy agreement generator for the current England route, but need more management detail than Standard provides',
          'you want clearer wording around repairs reporting, access, contractor attendance, key control, and hand-back expectations',
          'you want a stronger pack with a management schedule and handover records',
        ]}
        notFor={[
          'the real issue is student occupation, student turnover, or student letting with multiple guarantors',
          'the property is really an HMO or shared house with communal-area controls and sharer house rules',
          'the landlord lives at the property and the arrangement is really a lodger room let',
          'you only need the simpler standard residential route',
        ]}
        routeComparison={[
          {
            title: 'Assured Periodic Tenancy Agreement',
            description:
              'Choose the standard assured periodic route if the let is straightforward and you do not need the fuller management and handover wording included in Premium.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Compare standard assured periodic route',
          },
          {
            title: 'Assured periodic tenancy guide',
            description:
              'Use the assured periodic guide if you want the newer England terminology explained before deciding whether the standard or Premium route is the better fit.',
            href: '/assured-periodic-tenancy-agreement',
            ctaLabel: 'Read assured periodic guide',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Choose the Student route when guarantors, student sharers, replacement procedures, or end-of-term return expectations are the main focus.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'View Student route',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Choose the HMO / Shared House route when you need communal-area rules, shared-house controls, or HMO-style occupation wording.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'View HMO route',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Choose the Lodger route when the landlord lives at the property and the occupier is sharing the home rather than taking a standard residential tenancy.',
            href: '/lodger-agreement',
            ctaLabel: 'View Lodger route',
          },
        ]}
        salesContent={{
          packIntro:
            'The Premium pack is for ordinary residential lets that need more detail than the Standard route provides. It gives you the main agreement plus the management schedule, handover records, and pack paperwork that stop the file from feeling too light for a more involved tenancy.',
          defaultPackItems: premiumPackBreakdown.defaultItems,
          conditionalPackItems: premiumPackBreakdown.conditionalItems,
          conditionalTitle: 'Included when your answers require it',
          conditionalIntro:
            'Where the tenancy includes a deposit or guarantor support, the pack adds the relevant documents so those risks are covered properly rather than being left outside the main file.',
          sampleProof: premiumSampleProof ? <GoldenPackProof data={premiumSampleProof} /> : undefined,
          whyYouNeedThis: {
            title: 'Why landlords choose Premium',
            intro:
              'Some lets are still ordinary residential tenancies, but the management reality is more involved. That is where a lighter agreement starts to feel too thin and the Premium pack becomes the better fit.',
            cards: [
              {
                title: 'The main agreement often needs more operational detail',
                body:
                  'Access, reporting, contractor attendance, key handling, and hand-back expectations are easier to manage when they are written down properly from the outset.',
              },
              {
                title: 'Stronger drafting prevents avoidable arguments',
                body:
                  'If the paperwork is too light, practical management disputes start because the tenancy never set expectations clearly enough.',
              },
                {
                  title: 'The extra pack paperwork matters more on involved lets',
                  body:
                    'The more moving parts the tenancy has, the more important it becomes to keep the agreement, schedules, and handover records aligned.',
                },
            ],
          },
          howThisHelps: {
            title: 'How this helps you',
            intro:
              'Premium gives you more detail where landlords usually need it without pushing the tenancy into the wrong specialist product.',
            cards: [
              {
                title: 'It strengthens day-to-day control',
                body:
                  'The management schedule and support records make it easier to handle inspections, repairs, access, and hand-back consistently.',
              },
              {
                title: 'It keeps the file joined up',
                body:
                  'The agreement and supporting paperwork are built to read together instead of feeling like separate documents added later.',
              },
              {
                title: 'It stays on the right legal route',
                body:
                  'You get a fuller England tenancy pack for an ordinary residential let without pretending the case is really student, HMO, or lodger by nature.',
              },
            ],
          },
          howItWorks: {
            title: 'How it works',
            intro:
              'The Premium workflow starts the same way as a standard tenancy, then adds the extra management detail that a more involved let actually needs.',
            steps: [
              {
                step: 'Step 01',
                title: 'Add the tenancy and property details',
                body:
                  'Enter the core landlord, tenant, rent, and property facts that shape the main agreement.',
              },
              {
                step: 'Step 02',
                title: 'Answer the management and setup questions',
                body:
                  'Work through the access, repairs, keys, deposit, and other practical points that determine which Premium pack items are included.',
              },
              {
                step: 'Step 03',
                title: 'Generate the full Premium pack',
                body:
                  'Download the agreement, schedules, and pack paperwork as one England tenancy file built for a more detailed residential let.',
              },
            ],
          },
          ctaTitle: 'Start the Premium agreement pack',
          ctaBody:
            'Use this route when the tenancy is still an ordinary residential let, but the paperwork needs more drafting depth and stronger day-to-day management support than Standard provides.',
        }}
        faqs={[
          {
            question: 'When should I choose Premium over the standard assured periodic route?',
            answer:
              'Choose Premium when the let is still a standard residential arrangement but you want fuller drafting, more operational detail, or a more tailored agreement than the standard assured periodic route provides.',
          },
          {
            question: 'If I searched for a Renters Rights Act tenancy agreement, when do I need Premium?',
            answer:
              'Choose Premium when you still need the current England assured periodic route, but want more than the standard wording. It is usually the better fit when management detail, handover controls, access wording, and contractor attendance need to be built in from the start.',
          },
          {
            question: 'Do I need Premium for an HMO or student let?',
            answer:
              'No. England now has dedicated Student and HMO / Shared House products, so Premium is no longer the catch-all option for those arrangements.',
          },
          {
            question: 'Is the Premium route still updated for the new England system?',
            answer:
              'Yes. Premium sits on the same current England assured periodic route as the standard version. The difference is the level of detail and coverage, not the legal route itself, so it works as the fuller England tenancy agreement generator for standard residential lets.',
          },
          {
            question: 'What if I am still using an older agreement?',
            answer:
              'Many older tenancy agreements are still in circulation, but they can be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England framework can create avoidable uncertainty, especially on more involved lets.',
          },
          {
            question: 'Can I still use the standard assured periodic route if the let is straightforward?',
            answer:
              'Yes. If the tenancy is relatively simple, the standard assured periodic agreement is usually the more proportionate choice.',
          },
        ]}
        finalCtaBody="Use the Premium assured periodic route when you want a more detailed England tenancy agreement generator for a standard residential let. If you were searching for a Renters' Rights Act tenancy agreement but the property needs more management, handover, and day-to-day detail than Standard provides, this updated fuller route is usually the better fit. If the arrangement is really student, shared-house, or lodger, use the dedicated product instead."
      />
    </div>
  );
}
