import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { getProductSamplePageByPackKey } from '@/lib/marketing/product-sample-pages';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { englandTenancyRouteComparisonCards } from '@/lib/seo/england-tenancy-route-cards';
import { PRODUCT_OWNER_METADATA } from '@/lib/seo/product-owner-metadata';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

const canonicalUrl = getCanonicalUrl('/lodger-agreement');
const englandHubHref = '/products/ast';
const lodgerWizardHref = '/wizard?product=england_lodger_agreement&src=lodger_page&topic=tenancy';
const lodgerSampleProof = getGoldenPackProofData('england_lodger_agreement');
const lodgerSamplePage = getProductSamplePageByPackKey('england_lodger_agreement');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: PRODUCT_OWNER_METADATA.lodgerAgreement.title,
  description: PRODUCT_OWNER_METADATA.lodgerAgreement.description,
  keywords: [
    'lodger agreement england',
    'resident landlord lodger contract',
    'lodger room rental agreement template',
    'solicitor-approved lodger agreement',
    'validated lodger notice rules',
    'lodger contract PDF UK',
    'lodger agreement post May 2026',
    'room let agreement england',
    'resident landlord agreement',
    'lodger licence agreement',
    'lodger agreement template england',
    'room let licence agreement',
    'resident landlord lodger agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: PRODUCT_OWNER_METADATA.lodgerAgreement.title,
    description: PRODUCT_OWNER_METADATA.lodgerAgreement.description,
    url: canonicalUrl,
    type: 'website',
  },
};

export default function LodgerAgreementEnglandPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Lodger Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Lodger Agreement',
          description: PRODUCT_OWNER_METADATA.lodgerAgreement.description,
          price: PRODUCTS.england_lodger_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />

      <EnglandTenancyPage
        pagePath="/lodger-agreement"
        title="Solicitor-approved Lodger Agreement - Resident Landlord Builder"
        subtitle="Use this solicitor-approved lodger agreement when you live in the property and are taking in a lodger, so the room let contract, validated lodger notice rules, house rules, and shared-home expectations are set out clearly from the start."
        primaryCtaLabel="Start lodger agreement"
        primaryCtaHref={lodgerWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        legacyNotice="If you searched for a lodger agreement, room let agreement, lodger agreement template, or resident-landlord agreement in England, this is the dedicated option for a room let in your own home from 1 May 2026 rather than a standard tenancy agreement adapted afterwards."
        introTitle="Choose this when you are renting out a room in your own home"
        introBody={[
          'This lodger room rental agreement template is for room lets where the landlord lives at the property and the occupier is sharing the home. It is kept separate from the Standard, Premium, Student, and HMO / Shared House packs because a resident-landlord setup works differently in practice.',
          'It is built around the points that usually matter most in a lodger arrangement: shared kitchens or bathrooms, house rules, key handling, notice expectations, guests, and the practical reality of living under the same roof.',
        ]}
        highlights={[
          'Resident-landlord room-let agreement built for shared living',
          'Lodger room rental agreement template with validated notice rules',
          'Clearer wording on house rules, shared spaces, and notice',
          'Separate from standard tenancy, student, and HMO packs',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Keeps the resident-landlord option separate from the main England tenancy products from 1 May 2026.',
          'Captures shared-facility, notice, and house-rule expectations directly in the guided flow.',
          'Helps avoid treating a lodger arrangement like a standard whole-property tenancy.',
          'Includes practical supporting paperwork for room-let setup and handover.',
          'Use the main England comparison page if you are unsure whether the arrangement is really a lodger setup.',
        ]}
        keywordTargets={[
          'lodger agreement england',
          'room let agreement england',
          'resident landlord agreement',
          'lodger licence agreement',
          'lodger agreement template england',
          'resident landlord lodger agreement',
        ]}
        idealFor={[
          'the landlord lives in the property and the occupier is sharing the home',
          'you want a room-let agreement with clearer wording on house rules and shared spaces',
          'you want notice and day-to-day expectations set out clearly from the start',
          'you want the resident-landlord setup kept separate from standard tenancy and HMO products',
          'you want practical room-let paperwork alongside the main agreement',
        ]}
        notFor={[
          'the landlord does not live at the property and the arrangement is really a standard residential tenancy',
          'the property is a shared house or HMO with sharers but no resident landlord',
          "the case is really a whole-property Standard, Premium, or Student tenancy rather than a room let in the landlord's home",
        ]}
        routeComparison={englandTenancyRouteComparisonCards}
        salesContent={{
          sampleProof: lodgerSampleProof ? (
            <GoldenPackProof data={lodgerSampleProof} samplePageHref={lodgerSamplePage?.samplePath} />
          ) : undefined,
          showPackBreakdown: false,
          whyYouNeedThis: {
            title: 'Why a lodger arrangement needs its own paperwork',
            intro:
              'A resident-landlord room let creates a different kind of day-to-day risk from a standard tenancy. The resident landlord lodger contract, shared-home expectations, and validated lodger notice rules need to be written down in a way that matches the practical reality of the arrangement.',
            cards: [
              {
                title: 'Shared-home rules need to be explicit',
                body:
                  'Visitors, quiet hours, shared bathrooms or kitchens, and general house rules create more tension if they are left to assumption rather than written down clearly.',
              },
              {
                title: 'The room-let setup still needs records',
                body:
                  'Key handover and move-in checks matter in a lodger arrangement too, especially because the landlord and occupier are living under the same roof.',
              },
              {
                title: 'Wrong-route paperwork muddies the position',
                body:
                  'If a lodger setup is documented like a standard tenancy, the paperwork can become harder to explain because it does not match the resident-landlord reality.',
              },
            ],
          },
          howThisHelps: {
            title: 'How this helps you',
            intro:
              'The pack helps the landlord make the room-let terms clearer, start the arrangement on a better footing, and avoid treating a shared-home setup like a whole-property tenancy.',
            cards: [
              {
                title: 'It keeps the house rules in writing',
                body:
                  'The appendix turns shared-home expectations into something clear and visible instead of leaving them as an informal understanding.',
              },
              {
                title: 'It supports a cleaner move-in',
                body:
                  'The checklist and handover record help the arrangement start with clearer expectations and better admin.',
              },
              {
                title: 'It fits the resident-landlord setup properly',
                body:
                  "The pack is built for a room let in the landlord's own home rather than forcing the arrangement into whole-property tenancy paperwork.",
              },
            ],
          },
          howItWorks: {
            title: 'How it works',
            intro:
              'The workflow focuses on the shared-home questions that matter most before a lodger moves in.',
            steps: [
              {
                step: 'Step 01',
                title: 'Add the room-let details',
                body:
                  'Enter the occupier, rent, payment, and property details that shape the resident-landlord agreement.',
              },
              {
                step: 'Step 02',
                title: 'Answer the shared-home questions',
                body:
                  'Work through the house rules, keys, and practical room-let points so the pack covers the arrangement properly.',
              },
              {
                step: 'Step 03',
                title: 'Generate the full Lodger pack',
                body:
                  "Download the agreement, checklist, handover record, and house-rules appendix as one room-let pack for the landlord's home.",
              },
            ],
          },
          ctaTitle: 'Start the Lodger agreement pack',
          ctaBody:
            "Use this option when you live at the property and want the room-let agreement, the shared-home rules, and the extra paperwork prepared together.",
        }}
        faqs={[
          {
            question: 'Why use a lodger agreement instead of a standard tenancy agreement?',
            answer:
              "Because a room let in the landlord's own home is different from a standard tenancy. Where the occupier is sharing the property with a resident landlord, it helps to use wording built for shared living, house rules, and room-let expectations rather than relying on a general tenancy agreement.",
          },
          {
            question: 'Is Lodger separate from the normal tenancy agreement pack?',
            answer:
              'Yes. Lodger is a dedicated England product for resident-landlord room lets and licence-style arrangements. It is kept separate from the standard tenancy, student, and HMO / shared-house products.',
          },
          {
            question: 'Should I use this if I do not live at the property?',
            answer:
              'Usually not. If the landlord is not resident, compare the Standard, Premium, Student, and HMO / Shared House packs instead, because the arrangement is less likely to be a true lodger setup.',
          },
          {
            question: 'What if I only rent out one room but I do not live there?',
            answer:
              'That is not automatically a lodger arrangement. A single room let can still fall into a different category if the landlord is not resident, so it is better to compare the England products properly rather than assuming lodger is correct just because only one room is being let.',
          },
          {
            question: 'Does this help with house rules and shared facilities?',
            answer:
              'Yes. One of the main reasons to use this pack is to deal more clearly with practical shared-living points such as kitchens, bathrooms, access, visitors, quiet enjoyment within a shared home, and house-rule expectations.',
          },
          {
            question: 'What if I am unsure whether my setup is lodger, HMO, or standard tenancy?',
            answer:
              'That is exactly where confusion tends to happen. If you are unsure, compare the products on the main England comparison page first so the arrangement can be matched more closely to how the property is actually occupied.',
          },
          {
            question: 'Is this suitable for licence-style room lets?',
            answer:
              'Usually yes. This pack is intended for resident-landlord room-let arrangements where the occupier is sharing the home and the setup needs to be documented as that kind of occupation, rather than as a standard whole-property tenancy.',
          },
          {
            question: 'Is this a court approved lodger agreement?',
            answer:
              'No. Courts do not pre-approve any notice, claim form, or agreement. However, this solicitor-approved lodger agreement follows current England rules and includes validation checks to help you complete it correctly.',
          },
          {
            question: 'Is this legally binding?',
            answer:
              'Yes - when completed and signed correctly. This solicitor-approved template follows current England rules, and the validation checklist helps you avoid common lodger agreement mistakes. Lodger rules are not the same as assured periodic tenancy rules.',
          },
        ]}
        finalCtaBody="Use the Lodger pack when the landlord lives at the property and the occupier is sharing the home. If you want the agreement to reflect the practical reality of a room let, shared facilities, and house rules in a resident-landlord setup, this is usually the right fit. If that is not the arrangement, compare the other England tenancy products instead."
      />
    </div>
  );
}
