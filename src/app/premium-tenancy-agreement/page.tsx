import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import { PRODUCTS } from '@/lib/pricing/products';
import { englandTenancyRouteComparisonCards } from '@/lib/seo/england-tenancy-route-cards';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/premium-tenancy-agreement');
const premiumWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_premium_tenancy_agreement&src=england_tenancy_page&topic=tenancy';
const premiumSampleProof = getGoldenPackProofData('england_premium_tenancy_agreement');
const premiumSamplePage = getProductSamplePageByPackKey('england_premium_tenancy_agreement');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.premiumTenancy.title,
  description: PRODUCT_OWNER_METADATA.premiumTenancy.description,
  keywords: [
    'premium periodic tenancy agreement',
    'premium England tenancy agreement',
    'stronger management wording',
    'premium periodic tenancy agreement england',
    'premium assured periodic tenancy agreement england',
    'premium tenancy agreement england',
    'periodic tenancy agreement england',
    'assured periodic tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.premiumTenancy.title,
    description: PRODUCT_OWNER_METADATA.premiumTenancy.description,
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
          { name: 'Premium Periodic Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Premium Periodic Tenancy Agreement',
          description: PRODUCT_OWNER_METADATA.premiumTenancy.description,
          price: PRODUCTS.england_premium_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/premium-tenancy-agreement"
        title="Premium Periodic Tenancy Agreement for England Landlords"
        subtitle="Use this premium periodic tenancy agreement when the let is still an ordinary residential tenancy, but you want stronger management wording around access, repairs, handover, keys, and day-to-day control than the Standard route provides."
        primaryCtaLabel="Build my validated Premium pack"
        primaryCtaHref={premiumWizardHref}
        secondaryCtaLabel="Read assured periodic guide"
        secondaryCtaHref="/assured-periodic-tenancy-agreement"
        workflowImageLink={{
          href: premiumWizardHref,
          desktopSrc: '/images/premium-tenancy-desktop.webp',
          mobileSrc: '/images/premium-tenancy-mobile.webp',
          alt: 'Premium tenancy agreement workflow',
          width: 1024,
          height: 1536,
        }}
        legacyNotice="If you were searching for a premium tenancy agreement, premium periodic tenancy agreement, updated AST replacement, or current England tenancy agreement with fuller drafting, this is the more detailed periodic route for ordinary residential lets that need stronger management and handover wording."
        introTitle="For an ordinary periodic tenancy with more detail built in"
        introBody={[
          'This page is for landlords who need more than the standard periodic tenancy agreement but do not need a separate Student, HMO / Shared House, or Lodger product. It is the premium tenancy agreement workflow for an ordinary residential let that needs fuller drafting built around the property, occupiers, rent, deposit, and management facts, not a static form to adapt alone.',
          'Premium keeps the tenancy on the standard residential track while adding fuller wording around inspections, repairs reporting, key handling, contractor access, utilities handover, and move-out expectations, with validation checks before preview and payment.',
        ]}
        highlights={[
          'Premium periodic tenancy agreement for ordinary residential lets that need more detail than the standard version',
          'Enhanced AST template wording for post-May 2026 England rules',
          'Adds fuller wording around management and handover',
          'Separate from Student, HMO / Shared House, and Lodger routes',
          'Solicitor-approved guided agreement pack with validation checks and a preview before payment',
        ]}
        compliancePoints={[
          'Built on the same current England periodic route as Standard from 1 May 2026.',
          "Positioned as the fuller England option for landlords who still want current wording on an ordinary residential let.",
          'Designed for users looking for an updated England tenancy agreement, without suggesting Premium is a separate statutory form.',
          'Adds more depth without treating HMO, student, or lodger arrangements as if they were all the same thing.',
          'Includes the practical written information and supporting paperwork that sit alongside the agreement.',
          'Not positioned as an old fixed-term AST shortcut product.',
        ]}
        keywordTargets={[
          'premium periodic tenancy agreement',
          'premium periodic tenancy agreement england',
          'england premium periodic tenancy agreement',
          'premium tenancy agreement england',
          'england premium residential tenancy agreement',
          'england tenancy agreement with guarantor',
          'england tenancy agreement management schedule',
          'premium landlord tenancy agreement england',
          'new england tenancy agreement',
          'renters rights act tenancy agreement england',
          'new tenancy agreement england',
          'premium tenancy agreement england',
        ]}
        idealFor={[
          'the let is still a standard whole-property tenancy in England, but you want fuller drafting than the standard periodic pack',
          'you want a current England tenancy agreement, but need more management detail than Standard provides',
          'you want clearer wording around repairs reporting, access, contractor attendance, key control, and hand-back expectations',
          'you want a stronger pack with a management schedule and handover records',
        ]}
        notFor={[
          'the real issue is student occupation, student turnover, or student letting with multiple guarantors',
          'the property is really an HMO or shared house with communal-area controls and sharer house rules',
          'the landlord lives at the property and the arrangement is really a lodger room let',
          'you only need the simpler standard residential route',
        ]}
        routeComparison={englandTenancyRouteComparisonCards}
        salesContent={{
          sampleProof: premiumSampleProof ? (
            <GoldenPackProof data={premiumSampleProof} samplePageHref={premiumSamplePage?.samplePath} />
          ) : undefined,
          showPackBreakdown: false,
          whyYouNeedThis: {
            title: 'Why landlords choose Premium',
            intro:
              "Some lets are still ordinary residential tenancies, but the management reality is more involved. That is where a lighter agreement starts to feel too thin and the premium periodic tenancy agreement becomes the better fit, especially where stronger management wording and a Renters' Rights Act enhanced AST are useful.",
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
                title: 'It keeps the paperwork joined up',
                body:
                  'The agreement and supporting paperwork are built to read together instead of feeling like separate documents added later.',
              },
              {
                title: 'It stays on the right legal route',
                body:
                  'You get a fuller England tenancy pack for an ordinary residential let without pretending the setup is really student, HMO, or lodger by nature.',
              },
            ],
          },
          howItWorks: {
            title: 'How it works',
            intro:
              'The Premium steps start the same way as a standard tenancy, then add the extra management detail that a more involved let actually needs.',
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
                title: 'Create the full Premium pack',
                body:
                  'Download the agreement, schedules, and supporting paperwork as one England tenancy pack built for a more detailed residential let.',
              },
            ],
          },
          ctaTitle: 'Build the validated Premium tenancy pack',
          ctaBody:
            'Use this option when the tenancy is still an ordinary residential let, but the paperwork needs solicitor-approved drafting depth, validation checks, and stronger day-to-day management support than Standard provides.',
        }}
        faqs={[
          {
            question: 'When should I choose Premium over the standard assured periodic route?',
            answer:
              'Choose Premium when the let is still a standard residential arrangement but you want fuller drafting, more operational detail, or a more tailored agreement than the standard periodic pack provides.',
          },
          {
            question: 'If I searched for a Renters Rights Act tenancy agreement, when do I need Premium?',
            answer:
              'Choose Premium when you still need the current England periodic option, but want more than the standard wording. It is usually the better fit when management detail, handover controls, access wording, and contractor attendance need to be built in from the start.',
          },
          {
            question: 'Do I need Premium for an HMO or student let?',
            answer:
              'No. England now has dedicated Student and HMO / Shared House products, so Premium is no longer the catch-all option for those arrangements.',
          },
          {
            question: 'Is the Premium route still updated for the new England system?',
            answer:
              'Yes. Premium sits on the same current England periodic basis as the standard version. The difference is the level of detail and coverage, not a different legal form, so it works as the fuller England tenancy agreement route for standard residential lets.',
          },
          {
            question: 'What if I am still using an older agreement?',
            answer:
              'Many older tenancy agreements are still in circulation, but they can be harder to rely on if they use outdated wording or structure. Using an agreement that does not reflect the current England position can create avoidable uncertainty, especially on more involved lets.',
          },
          {
            question: 'Can I still use the standard assured periodic route if the let is straightforward?',
            answer:
              'Yes. If the tenancy is relatively simple, the standard assured periodic agreement is usually the more proportionate choice.',
          },
          {
            question: 'Is this a court approved premium tenancy agreement?',
            answer:
              'No. Courts do not pre-approve any notice, claim form, or agreement. This premium tenancy agreement follows current England rules and includes checks to help you complete it correctly.',
          },
          {
            question: 'Is this legally binding?',
            answer:
              'Yes - when completed and signed correctly. This template follows post-May 2026 England rules, and the checklist helps you avoid common tenancy agreement mistakes.',
          },
        ]}
        finalCtaBody="Use the premium periodic workflow when you want a more detailed England tenancy agreement built from your facts for a standard residential let. If the property needs more management, handover, and day-to-day detail than Standard provides, this fuller option is usually the better fit. If the arrangement is really student, shared-house, or lodger, use the dedicated product instead."
      />
    </div>
  );
}
