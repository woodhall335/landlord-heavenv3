import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { buildTenancyPackBreakdown } from '@/lib/marketing/tenancy-pack-breakdowns';
import { PRODUCTS } from '@/lib/pricing/products';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';

const canonicalUrl = getCanonicalUrl('/lodger-agreement');
const englandHubHref = '/products/ast';
const lodgerWizardHref = '/wizard?product=england_lodger_agreement&src=lodger_page&topic=tenancy';
const lodgerPackBreakdown = buildTenancyPackBreakdown('england_lodger_agreement');
const lodgerSampleProof = getGoldenPackProofData('england_lodger_agreement');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Lodger Agreement England | Resident-Landlord Room Let Route',
  description:
    'Create an England Lodger Agreement for a resident-landlord room let, with clearer wording on shared living, house rules, notice, and day-to-day occupation.',
  keywords: [
    'lodger agreement england',
    'room let agreement england',
    'resident landlord agreement',
    'lodger licence agreement',
    'lodger agreement template england',
    'room let licence agreement',
    'resident landlord lodger agreement',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Lodger Agreement England | Resident-Landlord Room Let Route',
    description:
      'Create an England Lodger Agreement for a resident-landlord room let, with clearer wording on shared living, house rules, notice, and day-to-day occupation.',
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
          description: PRODUCTS.england_lodger_agreement.description,
          price: PRODUCTS.england_lodger_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />

      <EnglandTenancyPage
        pagePath="/lodger-agreement"
        title="Lodger Agreement England"
        subtitle="Use this England lodger agreement when you live in the property and are taking in a lodger. It is designed for resident-landlord room lets, with clearer wording on shared living, house rules, and notice than the updated standard residential routes would usually provide."
        primaryCtaLabel="Start lodger agreement"
        primaryCtaHref={lodgerWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        legacyNotice="If you were searching for a lodger agreement, a room let agreement, a lodger agreement template, or a resident landlord agreement in England, this is the dedicated route for a room let in your own home within the updated current England framework from 1 May 2026 rather than a standard tenancy agreement adapted after the fact."
        introTitle="Built for room lets in the landlord's home"
        introBody={[
          'This route is for room lets where the landlord lives at the property and the occupier is sharing the home. It is intentionally separate from the Standard and Premium assured periodic routes, plus the Student and HMO / Shared House routes, because a resident-landlord arrangement works differently in practice.',
          'Instead of trying to force a lodger setup into a general tenancy product, this pack is built around the points that usually matter most in a room let: shared facilities, house rules, key handling, notice expectations, and the practical realities of living under the same roof.',
        ]}
        highlights={[
          'Resident-landlord room-let agreement built for shared living',
          'Clearer wording on house rules, shared spaces, and notice',
          'Separate from standard tenancy, student, and HMO routes',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Keeps the resident-landlord route separate from the main England tenancy products inside the updated current framework from 1 May 2026.',
          'Captures shared-facility, notice, and house-rule expectations directly in the guided flow.',
          'Helps avoid treating a lodger arrangement like a standard whole-property tenancy.',
          'Includes practical file paperwork for room-let setup and handover.',
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
          'you want notice and occupation expectations set out more clearly from the start',
          'you want the resident-landlord route kept separate from standard tenancy and HMO products',
          'you want practical room-let paperwork alongside the main agreement',
        ]}
        notFor={[
          'the landlord does not live at the property and the arrangement is really a standard residential tenancy',
          'the property is a shared house or HMO with sharers but no resident landlord',
          "the case is really a whole-property Standard, Premium, or Student tenancy rather than a room let in the landlord's home",
        ]}
        routeComparison={[
          {
            title: 'England tenancy chooser',
            description:
              'If you are not sure whether the arrangement is really a lodger setup, compare it against the full England tenancy-agreement comparison page first.',
            href: '/products/ast',
            ctaLabel: 'Compare England routes',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Choose HMO / Shared House where the main complexity comes from sharers, communal occupation, and house rules rather than a resident landlord living in the property.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'Premium Tenancy Agreement',
            description:
              "Choose Premium when the let is an ordinary residential tenancy that needs fuller wording, not a room-let arrangement in the landlord's own home.",
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'Standard Tenancy Agreement',
            description:
              'Choose Standard when the tenancy is a straightforward whole-property let and you do not need resident-landlord room-let wording.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Compare Standard',
          },
        ]}
        salesContent={{
          packIntro:
            "The Lodger pack is built for a resident-landlord room let. It gives you the main agreement plus the checklist, house rules, and handover records that matter when someone is living inside the landlord's own home.",
          defaultPackItems: lodgerPackBreakdown.defaultItems,
          conditionalPackItems: lodgerPackBreakdown.conditionalItems,
          sampleProof: lodgerSampleProof ? <GoldenPackProof data={lodgerSampleProof} /> : undefined,
          whyYouNeedThis: {
            title: 'Why a lodger arrangement needs its own paperwork',
            intro:
              'A resident-landlord room let creates a different kind of day-to-day risk from a standard tenancy. The shared-home expectations need to be documented in a way that matches the practical reality of the arrangement.',
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
                  'If a lodger setup is documented like a standard tenancy, the file can become harder to explain because it does not match the resident-landlord reality.',
              },
            ],
          },
          howThisHelps: {
            title: 'How this helps you',
            intro:
              'The pack gives the landlord a cleaner room-let file that is easier to manage, easier to explain, and better aligned to a shared-home arrangement.',
            cards: [
              {
                title: 'It keeps the house rules in writing',
                body:
                  'The appendix turns shared-home expectations into something clear and visible instead of leaving them as informal understanding.',
              },
              {
                title: 'It supports a cleaner move-in',
                body:
                  'The checklist and handover record help the arrangement start with clearer expectations and better admin.',
              },
              {
                title: 'It fits the resident-landlord route properly',
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
                  "Download the agreement, checklist, handover record, and house-rules appendix as one room-let file for the landlord's home.",
              },
            ],
          },
          ctaTitle: 'Start the Lodger agreement pack',
          ctaBody:
            "Use this route when you live at the property and want the room-let agreement, the shared-home rules, and the extra paperwork prepared together.",
        }}
        faqs={[
          {
            question: 'Why use a lodger agreement instead of a standard tenancy agreement?',
            answer:
              "Because a room let in the landlord's own home is different from a standard tenancy. Where the occupier is sharing the property with a resident landlord, it helps to use wording built for shared living, house rules, and room-let expectations rather than relying on a general tenancy agreement.",
          },
          {
            question: 'Is Lodger separate from the normal tenancy agreement route?',
            answer:
              'Yes. Lodger is a dedicated England route for resident-landlord room lets and licence-style arrangements. It is kept separate from the standard tenancy, student, and HMO / shared-house products.',
          },
          {
            question: 'Should I use this if I do not live at the property?',
            answer:
              'Usually not. If the landlord is not resident, compare the Standard, Premium, Student, and HMO / Shared House routes instead, because the arrangement is less likely to be a true lodger setup.',
          },
          {
            question: 'What if I only rent out one room but I do not live there?',
            answer:
              'That is not automatically a lodger arrangement. A single room let can still fall into a different route if the landlord is not resident, so it is better to compare the England products properly rather than assuming lodger is correct just because only one room is being let.',
          },
          {
            question: 'Does this help with house rules and shared facilities?',
            answer:
              'Yes. One of the main reasons to use this route is to deal more clearly with practical shared-living points such as kitchens, bathrooms, access, visitors, quiet enjoyment within a shared home, and house-rule expectations.',
          },
          {
            question: 'What if I am unsure whether my setup is lodger, HMO, or standard tenancy?',
            answer:
              'That is exactly where route confusion tends to happen. If you are unsure, compare the products on the main England comparison page first so the arrangement can be matched more closely to how the property is actually occupied.',
          },
          {
            question: 'Is this suitable for licence-style room lets?',
            answer:
              'Usually yes. This route is intended for resident-landlord room-let arrangements where the occupier is sharing the home and the setup needs to be documented as that kind of occupation, rather than as a standard whole-property tenancy.',
          },
        ]}
        finalCtaBody="Use the Lodger route when the landlord lives at the property and the occupier is sharing the home. If you want the agreement to reflect the practical reality of a room let, shared facilities, and house rules in a resident-landlord setup under the updated current England framework, this is usually the right fit. If that is not the arrangement, compare the other England tenancy products instead."
      />
    </div>
  );
}
