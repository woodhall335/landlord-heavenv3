import type { Metadata } from 'next';
import Link from 'next/link';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { Reveal, StaggerReveal } from '@/components/marketing/PremiumMotion';
import { FAQSection, type FAQItem } from '@/components/seo/FAQSection';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { Section8NoticeDateCalculator } from '@/components/tools/section8-date-calculator/Section8NoticeDateCalculator';
import { ToolFunnelTracker } from '@/components/tools/ToolFunnelTracker';
import {
  StructuredData,
  breadcrumbSchema,
  softwareApplicationSchema,
} from '@/lib/seo/structured-data';
import { generateMetadata } from '@/lib/seo';
import {
  blogLinks,
  productLinks,
  toolLinks,
  guideLinks,
} from '@/lib/seo/internal-links';

export const metadata: Metadata = generateMetadata({
  title: 'Section 8 Notice Date Calculator | England Landlord Tool',
  description:
    'Calculate the Section 8 notice period, deemed service date, and earliest date to start court papers for an England Form 3A notice.',
  path: '/tools/section-8-notice-date-calculator',
  keywords: [
    'section 8 notice date calculator',
    'section 8 notice period calculator',
    'form 3a notice date',
    'when can landlord apply to court section 8',
    'section 8 deemed service date',
    'section 8 service date calculator',
    'section 8 court date calculator',
    'section 8 earliest court date',
    'form 3a service calculation',
    'section 8 rent arrears notice period',
    'landlord eviction notice dates',
    'section 8 notice timing england',
  ],
});

const faqs: FAQItem[] = [
  {
    question: 'What does the Section 8 notice date calculator show?',
    answer:
      'It shows the likely notice period, deemed service date, and earliest date the landlord can usually move toward court papers for an England Form 3A Section 8 notice. The result depends on the grounds, service method, and dates entered.',
  },
  {
    question: 'Does the date make my Section 8 notice valid?',
    answer:
      'No. The calculator only helps with timing. The notice can still be risky if the wrong ground is used, the facts do not support the ground, the Form 3A wording is wrong, or service evidence is weak.',
  },
  {
    question: 'How does deemed service affect the date?',
    answer:
      'If the notice is posted, the calculator allows time for deemed service before counting the notice period. Hand delivery and leaving the notice at the property are treated as same-day service for this tool.',
  },
  {
    question: 'What is the notice period for Ground 8 rent arrears?',
    answer:
      'Under the current England possession route used by this site, Ground 8 rent arrears is treated as a 4-week notice period. The arrears evidence still needs to support the ground at the relevant stages.',
  },
  {
    question: 'What should I do after the notice period ends?',
    answer:
      'If the notice period has ended and the tenant has not left, landlords usually look at the possession claim stage. That is where N5, N119, witness evidence, service records, and the court filing path become important.',
  },
];

const proofPoints = [
  'Uses the existing England possession ground catalog behind the product flow',
  'Allows for deemed service before showing the court-paper date',
  'Connects the free result to the right Notice Only or Complete Pack next step',
];

export default function Section8NoticeDateCalculatorPage() {
  return (
    <div className="min-h-screen public-page-shell bg-[#fcfaff]">
      <StructuredData data={softwareApplicationSchema()} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Free Tools', url: '/tools' },
          { name: 'Section 8 Notice Date Calculator', url: '/tools/section-8-notice-date-calculator' },
        ])}
      />
      <HeaderConfig mode="autoOnScroll" />
      <ToolFunnelTracker
        toolName="Section 8 Notice Date Calculator"
        toolType="calculator"
        jurisdiction="england"
      />

      <UniversalHero
        badge="Free England tool"
        title="Section 8 notice date calculator for England landlords"
        subtitle="Calculate the Form 3A notice period, deemed service date, and earliest court-paper date before you serve or move to the next stage."
        primaryCta={{ label: 'Calculate my notice date', href: '#calculator' }}
        secondaryCta={{ label: 'Create my Section 8 notice', href: '/products/notice-only' }}
        trustText="Form 3A timing | Deemed service | Notice Only and Complete Pack next steps"
        align="center"
        hideMedia
        showReviewPill={false}
        showTrustPositioningBar
        showUsageCounter
      >
        <StaggerReveal
          as="div"
          className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-white/90"
          childClassName="premium-stagger-child"
        >
          {proofPoints.map((point) => (
            <span key={point} className="premium-trust-pill border-white/20 bg-white/12 text-white shadow-none">
              {point}
            </span>
          ))}
        </StaggerReveal>
      </UniversalHero>

      <section className="border-b border-[#eadcff] bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Reveal className="rounded-[1.5rem] border border-[#eadcff] bg-[#fbf8ff] p-5 shadow-sm md:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">Plain-English timing check</p>
            <p className="mt-3 text-base leading-8 text-[#4d4561]">
              This page is for landlords dealing with an England Section 8/Form 3A notice. It helps you avoid the
              common timing mistake: counting from the wrong date or treating the date as the only thing that matters.
              If the tenant has not been served yet, the result points toward Notice Only. If the notice has expired
              and the tenant is still there, the result points toward the court-paper stage.
            </p>
          </Reveal>
        </div>
      </section>

      <Section8NoticeDateCalculator />

      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="public-eyebrow">What happens next</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#1c1431] md:text-4xl">
              The date is only one part of the notice file
            </h2>
            <p className="mt-4 text-base leading-8 text-[#5d5672]">
              A notice can have the right date and still be weak if the grounds, arrears record, Form 3A wording, or
              service proof do not line up. Use the result as a timing check, then prepare the paperwork around it.
            </p>
          </Reveal>

          <StaggerReveal className="mt-8 grid gap-5 md:grid-cols-3" childClassName="premium-stagger-child">
            <Link
              href="/products/notice-only"
              className="standalone-premium-hover-lift rounded-[1.5rem] border border-[#eadcff] bg-[#fbf8ff] p-5 text-[#24173c] shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">Before service</p>
              <h3 className="mt-3 text-xl font-semibold">Create the notice file</h3>
              <p className="mt-3 text-sm leading-6 text-[#5d5672]">
                Prepare Form 3A, N215, service instructions, arrears schedule, validity checklist, and case summary.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4f2a96]">
                Create my Section 8 notice
              </span>
            </Link>
            <Link
              href="/products/complete-pack"
              className="standalone-premium-hover-lift rounded-[1.5rem] border border-[#eadcff] bg-white p-5 text-[#24173c] shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d28d9]">After expiry</p>
              <h3 className="mt-3 text-xl font-semibold">Prepare court papers</h3>
              <p className="mt-3 text-sm leading-6 text-[#5d5672]">
                Move into the possession file with N5, N119, witness evidence, filing guide, and hearing checklist.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4f2a96]">
                Prepare my court papers
              </span>
            </Link>
            <Link
              href="/tools/rent-arrears-calculator"
              className="standalone-premium-hover-lift rounded-[1.5rem] border border-[#d5f2e7] bg-[#f7fffb] p-5 text-[#152b26] shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0f8b63]">Rent arrears</p>
              <h3 className="mt-3 text-xl font-semibold">Check the figures</h3>
              <p className="mt-3 text-sm leading-6 text-[#4d665f]">
                If the notice relies on rent arrears, calculate the arrears and keep the schedule aligned with the
                notice.
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0f8b63]">
                Calculate rent arrears
              </span>
            </Link>
          </StaggerReveal>
        </div>
      </section>

      <FAQSection
        title="Section 8 notice date calculator FAQs"
        faqs={faqs}
        showContactCTA={false}
        variant="white"
      />

      <section className="bg-[#fcfaff] pb-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <RelatedLinks
            title="Related landlord resources"
            links={[
              productLinks.noticeOnly,
              productLinks.completePack,
              toolLinks.rentArrearsCalculator,
              guideLinks.section8Notice,
              guideLinks.form3aSection8,
              blogLinks.rentArrearsEviction,
            ]}
          />
        </div>
      </section>
    </div>
  );
}
