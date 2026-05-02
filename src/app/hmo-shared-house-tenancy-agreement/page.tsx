import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { buildTenancyPackBreakdown } from '@/lib/marketing/tenancy-pack-breakdowns';
import { PRODUCTS } from '@/lib/pricing/products';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/hmo-shared-house-tenancy-agreement');
const englandHubHref = '/products/ast';
const hmoWizardHref =
  '/wizard?product=england_hmo_shared_house_tenancy_agreement&src=hmo_shared_page&topic=tenancy';
const hmoPackBreakdown = buildTenancyPackBreakdown('england_hmo_shared_house_tenancy_agreement');
const hmoSampleProof = getGoldenPackProofData('england_hmo_shared_house_tenancy_agreement');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'HMO / Shared House Tenancy Agreement England | Sharers and House Rules Route',
  description:
    'Create an England HMO / Shared House Tenancy Agreement with clearer wording for sharers, communal areas, house rules, and shared-house management.',
  keywords: [
    'hmo tenancy agreement england',
    'shared house tenancy agreement england',
    'shared house tenancy agreement',
    'hmo agreement template england',
    'shared accommodation tenancy agreement',
    'room by room tenancy agreement england',
    'hmo tenancy agreement template',
    'shared house agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'HMO / Shared House Tenancy Agreement England | Sharers and House Rules Route',
    description:
      'Create an England HMO / Shared House Tenancy Agreement with clearer wording for sharers, communal areas, house rules, and shared-house management.',
    url: canonicalUrl,
    type: 'website',
  },
};

export default function HmoSharedHouseTenancyAgreementPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'HMO / Shared House Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: PRODUCTS.england_hmo_shared_house_tenancy_agreement.label,
          description: PRODUCTS.england_hmo_shared_house_tenancy_agreement.description,
          price: PRODUCTS.england_hmo_shared_house_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />

      <EnglandTenancyPage
        pagePath="/hmo-shared-house-tenancy-agreement"
        title="HMO / Shared House Tenancy Agreement England"
        subtitle="Use this England HMO / Shared House agreement when the property is being shared and you want the agreement, house rules, and day-to-day paperwork to match how the house is actually run."
        primaryCtaLabel="Start HMO / Shared House agreement"
        primaryCtaHref={hmoWizardHref}
        secondaryCtaLabel="View all England routes"
        secondaryCtaHref={englandHubHref}
        legacyNotice="If you searched for an HMO tenancy agreement, shared house agreement, or sharers' tenancy agreement in England, this is the dedicated option for shared occupation from 1 May 2026 rather than a standard residential pack with shared-house points bolted on afterwards."
        introTitle="Choose this when the property is being shared"
        introBody={[
          'This pack is for England lets where the real work is managing shared occupation well. If several occupiers are sharing kitchens, bathrooms, entrances, bins, and day-to-day expectations, the paperwork should say that plainly from the start.',
          'It is built for the friction points that usually show up first in shared houses: communal areas, visitors, quiet hours, cleaning expectations, repair reporting, handover records, and the practical rules that keep the house easier to run.',
        ]}
        highlights={[
          'Agreement wording built around sharers and communal living',
          'House rules and communal-area expectations kept clear from the outset',
          'Separate from Standard, Premium, Student, and Lodger routes',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Built around the current England position from 1 May 2026 for the main tenancy wording.',
          'Kept separate from the Standard and Premium assured periodic packs so shared-house occupation is not forced into an ordinary residential product.',
          'Captures shared-house and HMO-style occupation more directly in the guided flow.',
          'Keeps communal-living wording separate from ordinary residential drafting.',
          'Includes practical supporting paperwork for shared-house setup, handover, and ongoing variation.',
          'If the landlord lives in the property and shares the home with the occupier, compare the Lodger pack instead.',
        ]}
        keywordTargets={[
          'hmo tenancy agreement england',
          'shared house tenancy agreement england',
          'shared accommodation tenancy agreement',
          'hmo agreement template england',
          'room by room tenancy agreement england',
          'shared house agreement england',
        ]}
        idealFor={[
          'the real complexity is shared occupation, communal living, or house management between sharers',
          'you want clearer wording for communal areas, house rules, visitors, cleaning, and shared responsibilities',
          'you need the paperwork to reflect a shared house rather than a simple whole-property household',
          'you want one pack that covers the agreement, the rules, and the records you will actually use later',
          'you want handover, utilities, and later changes kept in the same file from day one',
        ]}
        notFor={[
          'the landlord lives at the property and the arrangement is really a lodger or resident-landlord room let',
          'the let is a straightforward whole-property tenancy with no real need for communal-area or sharer wording',
          'the main issue is a student household with guarantors, replacement requests, and end-of-term turnover rather than shared-house control itself',
        ]}
        routeComparison={[
          {
            title: 'Premium Tenancy Agreement',
            description:
              'Premium is for ordinary residential lets that need more detailed day-to-day drafting, but it is not the default option for HMO or shared-house setups.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Choose Student when the specialist issue is student sharers, guarantors, replacement requests, and end-of-term hand-back rather than shared-house management itself.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'Compare Student',
          },
          {
            title: 'Standard Tenancy Agreement',
            description:
              'Choose Standard when the tenancy is a straightforward whole-property non-shared let and you do not need HMO or sharer-specific wording.',
            href: '/standard-tenancy-agreement',
            ctaLabel: 'Compare Standard',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Choose Lodger where the landlord lives in the property and the arrangement is a resident-landlord room let rather than a separate shared-house tenancy.',
            href: '/lodger-agreement',
            ctaLabel: 'Compare Lodger',
          },
        ]}
        salesContent={{
          packIntro:
              'The HMO / Shared House pack gives you the main agreement plus the rules, handover records, and supporting paperwork that usually make the difference between a shared house that feels organised and one that starts drifting into avoidable disputes.',
          defaultPackItems: hmoPackBreakdown.defaultItems,
          conditionalPackItems: hmoPackBreakdown.conditionalItems,
          conditionalTitle: 'Included when your answers require it',
          conditionalIntro:
            'Where the tenancy includes a deposit or guarantor support, the pack adds the extra pack paperwork needed to keep those points properly covered as well.',
          sampleProof: hmoSampleProof ? <GoldenPackProof data={hmoSampleProof} /> : undefined,
          whyYouNeedThis: {
            title: 'Why shared houses need fuller paperwork',
            intro:
              'A shared-house let usually breaks down on the practical points first, not the headline rent clause. If the communal rules and records are missing, the paperwork often says much less than the landlord actually needs it to say.',
            cards: [
              {
                title: 'Communal occupation needs written rules',
                body:
                  'If shared spaces, visitors, cleaning, bins, and quiet hours are left unwritten, the landlord has much less to point back to when the house starts drifting into conflict.',
              },
              {
                title: 'Shared houses create more everyday evidence points',
                body:
                  'Keys, handover, utilities, and later changes matter more because several occupiers are using the property at the same time.',
              },
              {
                title: 'Standard paperwork is often too broad for a shared house',
                body:
                  'If a communal let is documented like a simple whole-property tenancy, the paperwork often misses the rules that make shared living manageable in practice.',
              },
            ],
          },
          howThisHelps: {
            title: 'How this helps you',
            intro:
              'The pack helps the landlord set the tone earlier, keep the records together, and deal with shared-house issues with something better than informal messages and memory.',
            cards: [
              {
                title: 'It makes the house rules visible',
                body:
                  'The appendix keeps the shared-living expectations visible instead of relying on informal messages or assumptions.',
              },
              {
                title: 'It keeps the practical records together',
                body:
                  'The handover, utilities, and variation documents help the landlord keep the communal paperwork in one place.',
              },
              {
                title: 'It matches the reality of shared occupation',
                body:
                  'The pack is built for sharers and communal areas, not for an ordinary household being squeezed into the wrong paperwork.',
              },
            ],
          },
          howItWorks: {
            title: 'How it works',
            intro:
              'The workflow captures the shared-house details that need to be on the paperwork before the occupiers move in.',
            steps: [
              {
                step: 'Step 01',
                title: 'Add the property and sharer details',
                body:
                  'Enter the key tenancy facts, the shared-house setup, and the way the property will be occupied.',
              },
              {
                step: 'Step 02',
                title: 'Answer the communal-living questions',
                body:
                  'Work through the rules, keys, utilities, deposit, and other shared-house points so the pack includes the right supporting paperwork.',
              },
              {
                step: 'Step 03',
                title: 'Generate the full HMO / Shared House pack',
                body:
                  'Download the agreement, the shared-house appendix, and the supporting paperwork as one England communal-living pack.',
              },
            ],
          },
          ctaTitle: 'Start the HMO / Shared House agreement pack',
          ctaBody:
            'Use this option when the property is being shared and you want the agreement, the communal rules, and the supporting records prepared together from the start.',
        }}
        faqs={[
          {
            question: 'Why use an HMO / Shared House agreement instead of a general residential agreement?',
            answer:
              'Because shared houses often create issues that a general residential agreement does not deal with clearly enough. Where people are sharing kitchens, bathrooms, access, and day-to-day responsibilities, it helps to have wording that reflects communal living from the outset rather than leaving those points vague.',
          },
          {
            question: 'Is HMO / Shared House still just part of Premium?',
            answer:
              'No. HMO / Shared House is now its own England product with its own drafting and positioning. Premium is for ordinary residential lets that need fuller operational wording; HMO / Shared House is for cases where sharers, communal areas, and house management are the real complexity.',
          },
          {
            question: 'Should I still use Premium for a shared house?',
            answer:
              'Usually not. Use Premium when the property is still an ordinary residential let and you simply want more detailed wording. Use HMO / Shared House when shared living arrangements, communal rules, or HMO-style management are central to the setup.',
          },
          {
            question: 'Is this suitable for sharers living together in one property?',
            answer:
              'Usually yes. This pack is intended for situations where people are sharing the property and the agreement needs to reflect that more clearly than a standard whole-property tenancy would.',
          },
          {
            question: 'Does this help with house rules and communal areas?',
            answer:
              'Yes. One of the main reasons to use this pack is to deal more clearly with communal-living points such as shared areas, practical house rules, and how occupation works in a shared-house setting.',
          },
          {
            question: 'What if some of the occupiers are students?',
            answer:
              'If the real complexity is still shared-house management, communal controls, and HMO-style occupation, this pack may still be the better fit. If the specialist issue is really student guarantors, replacement requests, and end-of-term turnover, compare it against the Student pack.',
          },
          {
            question: 'What if the landlord lives in the property?',
            answer:
              'That is usually a Lodger or resident-landlord arrangement rather than an HMO / Shared House tenancy, so it is usually better to compare the Lodger product instead.',
          },
        ]}
        finalCtaBody="Use the HMO / Shared House pack when the real complexity is shared occupation, communal areas, and day-to-day house management. If the occupiers are sharers and you want the agreement to reflect how the house is actually going to be lived in, this is usually a better fit than the Standard or Premium packs."
      />
    </div>
  );
}
