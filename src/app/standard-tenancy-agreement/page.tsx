import type { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { GoldenPackProof } from '@/components/marketing/GoldenPackProof';
import { EnglandTenancyPage } from '@/components/seo/EnglandTenancyPage';
import { getGoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { buildTenancyPackBreakdown } from '@/lib/marketing/tenancy-pack-breakdowns';
import { PRODUCTS } from '@/lib/pricing/products';
import { StructuredData, breadcrumbSchema, productSchema } from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo';

const canonicalUrl = getCanonicalUrl('/standard-tenancy-agreement');
const standardWizardHref =
  '/wizard/flow?type=tenancy_agreement&jurisdiction=england&product=england_standard_tenancy_agreement&src=standard_tenancy_page&topic=tenancy';
const standardPackBreakdown = buildTenancyPackBreakdown('england_standard_tenancy_agreement');
const standardSampleProof = getGoldenPackProofData('england_standard_tenancy_agreement');

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Standard Tenancy Agreement England | Straightforward Whole-Property Let',
  description:
    'Create a Standard Tenancy Agreement for a straightforward whole-property let in England, using current assured periodic wording and the practical setup paperwork landlords usually need.',
  keywords: [
    'assured periodic tenancy agreement england',
    'england assured periodic tenancy agreement',
    'standard tenancy agreement england',
    'england tenancy agreement standard',
    'basic tenancy agreement england',
    'periodic tenancy agreement england',
    'new england tenancy agreement',
    'renters rights act tenancy agreement england',
    'new tenancy agreement generator england',
    'updated tenancy agreement england',
  ],
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Standard Tenancy Agreement England | Straightforward Whole-Property Let',
    description:
      'Create a Standard Tenancy Agreement for a straightforward whole-property let in England, using current assured periodic wording and the practical setup paperwork landlords usually need.',
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
          { name: 'Standard Tenancy Agreement', url: canonicalUrl },
        ])}
      />
      <StructuredData
        data={productSchema({
          name: 'Standard Tenancy Agreement',
          description: PRODUCTS.england_standard_tenancy_agreement.description,
          price: PRODUCTS.england_standard_tenancy_agreement.price.toFixed(2),
          url: canonicalUrl,
        })}
      />
      <EnglandTenancyPage
        pagePath="/standard-tenancy-agreement"
        title="Standard Tenancy Agreement England"
        subtitle="Use this standard England tenancy agreement if you are letting a whole property on a straightforward residential tenancy and want current assured periodic wording from 1 May 2026, without student, HMO, lodger, or Premium-level detail."
        primaryCtaLabel="Start standard tenancy agreement"
        primaryCtaHref={standardWizardHref}
        secondaryCtaLabel="Read periodic tenancy guide"
        secondaryCtaHref="/periodic-tenancy-agreement"
        legacyNotice="If you were searching for a standard tenancy agreement, a basic tenancy agreement, an updated AST replacement, or a current England tenancy agreement generator, this is the standard assured periodic option for a straightforward whole-property let."
        introTitle="For a straightforward whole-property let"
        introBody={[
          "This is the standard option for a new England tenancy agreement where the tenancy is a straightforward whole-property let. Use it when you want current assured periodic wording without the extra operational detail included in Premium or the specialist products.",
          'The generator keeps the pack practical and proportionate: the main agreement plus the key supporting documents, without making a simple tenancy feel more complicated than it needs to be.',
        ]}
        highlights={[
          'England assured periodic agreement for a straightforward whole-property residential let',
          'Keeps the wording and pack paperwork practical and proportionate',
          'Separate from the Premium assured periodic, Student, HMO / Shared House, and Lodger routes',
          'Guided generator with a preview before payment',
        ]}
        compliancePoints={[
          'Built around the current England assured periodic route from 1 May 2026.',
          "Positioned for landlords who want current England wording for a straightforward let.",
          'Includes the practical England support documents that sit alongside the agreement.',
          'If the tenancy is really a student let, shared house, or resident-landlord arrangement, use the specialist product instead.',
        ]}
        keywordTargets={[
          'standard tenancy agreement england',
          'england tenancy agreement standard',
          'basic tenancy agreement england',
          'periodic tenancy agreement england',
          'ordinary residential tenancy agreement england',
          'new england tenancy agreement',
          'renters rights act tenancy agreement england',
          'new tenancy agreement generator england',
        ]}
        idealFor={[
          'the tenancy is a straightforward whole-property let in England',
          'you want the current England wording with the core support pack, but not the fuller Premium assured periodic schedule',
          'you want a new tenancy agreement generator for the standard England option rather than a more detailed Premium pack',
          'you want a clean standard agreement without specialist student, shared-house, or resident-landlord wording',
        ]}
        notFor={[
          'you want fuller wording on inspections, repairs, key handling, contractor access, and handover from the outset',
          'the main issue is student occupation, guarantors, or end-of-term student turnover',
          "the property is really a shared house / HMO or a room let in the landlord's home",
        ]}
        routeComparison={[
          {
            title: 'Premium Assured Periodic Tenancy Agreement',
            description:
              'Choose the Premium assured periodic option when the let is still a standard residential tenancy but you want more detailed operational drafting and a broader management pack.',
            href: '/premium-tenancy-agreement',
            ctaLabel: 'Compare Premium assured periodic route',
          },
          {
            title: 'Periodic tenancy agreement guide',
            description:
              'Use the periodic tenancy guide if you want the newer England terminology explained in plain English before deciding whether Standard or Premium is the better fit.',
            href: '/periodic-tenancy-agreement',
            ctaLabel: 'Read periodic tenancy guide',
          },
          {
            title: 'Student Tenancy Agreement',
            description:
              'Choose the Student route when guarantors, student sharers, replacement procedures, or end-of-term return standards are the main focus.',
            href: '/student-tenancy-agreement',
            ctaLabel: 'Compare Student',
          },
          {
            title: 'HMO / Shared House',
            description:
              'Choose the HMO / Shared House route when shared areas, house rules, or room-by-room occupation are where the real complexity lies.',
            href: '/hmo-shared-house-tenancy-agreement',
            ctaLabel: 'Compare HMO',
          },
          {
            title: 'Room Let / Lodger',
            description:
              'Choose the Lodger route when the landlord lives at the property and the occupier is sharing the home rather than taking a standard residential tenancy.',
            href: '/lodger-agreement',
            ctaLabel: 'Compare Lodger',
          },
        ]}
        salesContent={{
          packIntro:
            'The Standard pack is built for a straightforward whole-property let. It gives you the main agreement plus the practical setup documents that stop the paperwork from feeling thin or disorganised from day one.',
          defaultPackItems: standardPackBreakdown.defaultItems,
          conditionalPackItems: standardPackBreakdown.conditionalItems,
          conditionalTitle: 'Included when your answers require it',
          conditionalIntro:
            'Some pack items depend on how the let is being set up. Where a deposit is taken or a guarantor is used, the pack expands to cover those points properly instead of leaving you to deal with them separately.',
          sampleProof: standardSampleProof ? <GoldenPackProof data={standardSampleProof} /> : undefined,
          whyYouNeedThis: {
            title: 'Why you need more than the main agreement',
            intro:
              'Even a simple tenancy creates risk if the paperwork stops at the agreement itself. Handover, deposit handling, later changes, and everyday setup details are where many avoidable disputes begin.',
            cards: [
              {
                title: 'The tenancy pack needs evidence as well as terms',
                body:
                  'A signed agreement is essential, but it does not prove what was handed over, what changed later, or whether the key setup steps were handled properly.',
              },
              {
                title: 'Deposit compliance creates its own risk',
                body:
                  'If a deposit is taken, the supporting paperwork matters just as much as the main agreement because deposit mistakes can create financial and procedural problems later.',
              },
              {
                title: 'Simple lets still need clean records',
                body:
                  'Straightforward tenancies often get the least admin, which is exactly why smaller missing documents become harder to reconstruct when a dispute appears.',
              },
            ],
          },
          howThisHelps: {
            title: 'How this helps you',
            intro:
              'The Standard pack is designed to make an ordinary let easier to start, easier to evidence, and easier to manage without loading it up with specialist wording it does not need.',
            cards: [
              {
                title: 'It keeps the paperwork practical',
                body:
                  'The pack covers the day-one paperwork landlords usually need without turning a straightforward tenancy into an over-engineered process.',
              },
              {
                title: 'It strengthens your position later',
                body:
                  'The handover records, checklist, and variation record give you something clear to point back to if the facts are disputed later.',
              },
              {
                title: 'It stays proportionate',
                body:
                  'You get the core England agreement without paying for the extra management detail that belongs in Premium or the specialist products.',
              },
            ],
          },
          howItWorks: {
            title: 'How it works',
            intro:
              'The workflow is built for landlords who want to get a straightforward tenancy in place properly without drafting everything from scratch.',
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
                title: 'Generate the full Standard pack',
                body:
                  'Download the agreement and the supporting paperwork as one England tenancy pack that is ready to print and use.',
              },
            ],
          },
          ctaTitle: 'Start the Standard agreement pack',
          ctaBody:
            'Use this option when the let is straightforward and you want the agreement, the setup checklist, and the supporting records prepared together from the start.',
        }}
        faqs={[
          {
            question: 'When should I choose this instead of the Premium assured periodic route?',
            answer:
              'Choose this option when the let is a straightforward whole-property tenancy in England and you do not need the more detailed management, inspection, handover, and operational drafting included in the Premium assured periodic pack.',
          },
          {
            question: 'Is this the new England tenancy agreement generator for the current rules?',
            answer:
               'Yes. This page is built around the current England assured periodic position and is designed as the standard new tenancy agreement generator for straightforward whole-property lets, rather than an older fixed-term AST-style starting point.',
          },
          {
            question: 'Is this the right Renters Rights Act tenancy agreement route for a straightforward let?',
            answer:
              'Usually, yes. If the tenancy is a standard whole-property let in England and you want the current baseline option, this is the assured periodic agreement most landlords are looking for when they search for a Renters Rights Act tenancy agreement.',
          },
          {
            question: 'What does this assured periodic pack include?',
            answer:
              'The pack centres on the main agreement and includes the England pre-tenancy checklist, along with the handover records and supporting paperwork landlords usually need around the tenancy.',
          },
          {
            question: 'Should I use this for a student or HMO let?',
            answer:
              'Usually not. Student and HMO / Shared House lets now have their own England products, so this standard assured periodic option is best for ordinary residential lets that do not need specialist wording.',
          },
        ]}
        finalCtaBody="Use this standard England tenancy agreement generator when the tenancy is straightforward and the property is being let as an ordinary whole-property home. If you were searching for a Renters' Rights Act tenancy agreement for a simple let, this assured periodic option will usually be the right fit. Compare Premium or the specialist products only when the facts call for something more tailored."
      />
    </div>
  );
}
