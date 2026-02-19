/**
 * Section 21 Notice Validator Page
 *
 * SEO-optimized page with comprehensive content about Section 21 notices,
 * validation requirements, and FAQ schema for rich snippets.
 */

import type { Metadata } from 'next';
import { ValidatorPage } from '@/components/validators/ValidatorPage';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { PRODUCTS } from '@/lib/pricing/products';
import { ToolFunnelTracker } from '@/components/tools/ToolFunnelTracker';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { productLinks, toolLinks, landingPageLinks, blogLinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';

// Pre-built wizard links for Section 21 validator page
const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'validator',
  topic: 'eviction',
});

const wizardLinkCompletePack = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'validator',
  topic: 'eviction',
});

const upsellConfig = {
  toolName: 'Section 21 Notice Validator',
  toolType: 'validator' as const,
  productName: 'Notice Only Pack',
  ctaLabel: `Upgrade to court-ready pack — ${PRODUCTS.notice_only.displayPrice}`,
  ctaHref: wizardLinkNoticeOnly,
  jurisdiction: 'england',
  jurisdictionLabel: 'England only',
  freeIncludes: [
    'Instant validity preview',
    'Compliance issue checklist',
    'Emailable report summary',
  ],
  paidIncludes: [
    'Court-ready Section 21 notice',
    'Serving steps and evidence checklist',
    'Bundled compliance guidance for court',
  ],
};

export const metadata: Metadata = {
  title: 'Free Section 21 Validity Checker (England) – Check My Notice',
  description:
    'Free Section 21 checker for England. Upload your Form 6A for instant validation. Checks deposits, gas safety, EPC, and notice periods.',
  keywords: [
    'section 21 validity checker',
    'section 21 notice checker',
    'is my section 21 notice valid',
    'section 21 validator',
    'form 6a validator',
    'section 21 validity',
    'eviction notice check',
    'landlord notice validation',
    'assured shorthold tenancy eviction',
  ],
  openGraph: {
    title: 'Free Section 21 Validity Checker (England) | Landlord Heaven',
    description:
      'Free online Section 21 notice checker for England landlords. Upload your Form 6A for instant validity verification.',
    type: 'website',
    url: getCanonicalUrl('/tools/validators/section-21'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/validators/section-21'),
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a Section 21 notice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Section 21 notice (also known as Form 6A) is the legal document landlords use to end an Assured Shorthold Tenancy in England without giving a reason. It gives tenants at least 2 months notice and is often called a "no-fault eviction" notice.',
      },
    },
    {
      '@type': 'Question',
      name: 'When can I serve a Section 21 notice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can serve a Section 21 notice at any time after the start of the tenancy, but it cannot expire within the first 4 months of the original tenancy. For fixed-term tenancies, the notice cannot expire before the end of the fixed term unless there is a break clause.',
      },
    },
    {
      '@type': 'Question',
      name: 'What makes a Section 21 notice invalid?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Common reasons for invalidity include: not using the prescribed Form 6A, deposit not protected in an approved scheme, prescribed information not served within 30 days, gas safety certificate not provided before move-in, EPC not provided, How to Rent guide not given, unlicensed property requiring a licence, and retaliatory eviction protections.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to protect the deposit before serving Section 21?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. If you took a deposit, it must be protected in a government-approved scheme (TDS, DPS, or MyDeposits) AND you must provide the prescribed information to the tenant within 30 days of receiving the deposit. Failure to do so makes your Section 21 notice invalid.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum notice period for Section 21?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The minimum notice period is 2 calendar months. The notice must give at least 2 full months from the date of service. For example, if served on 15 January, the earliest expiry date would be 15 March.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can a tenant challenge a Section 21 notice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Tenants can challenge a Section 21 notice on technical grounds (e.g., deposit not protected, documents not served) or claim retaliatory eviction if they complained to the council about property conditions within the last 6 months.',
      },
    },
    {
      '@type': 'Question',
      name: 'What documents must I provide before serving Section 21?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Before serving a valid Section 21 notice, you must have provided: a valid gas safety certificate (before move-in if gas appliances present), a valid Energy Performance Certificate (EPC), the current version of the How to Rent guide, and deposit prescribed information (if a deposit was taken).',
      },
    },
    {
      '@type': 'Question',
      name: 'How long is a Section 21 notice valid for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Section 21 notice is valid for 6 months from the date it was served. You must apply to court for possession within this 6-month window. After 6 months, you would need to serve a new notice.',
      },
    },
  ],
};


const faqs = faqSchema.mainEntity.map((faq) => ({
  question: faq.name,
  answer: faq.acceptedAnswer.text,
}));

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Check if Your Section 21 Notice is Valid',
  description:
    'Use our free Section 21 validity checker to verify your Form 6A notice meets all legal requirements for court proceedings in England.',
  totalTime: 'PT5M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Locate your Section 21 notice',
      text: 'Find the Section 21 notice (Form 6A) you want to check. This should be the notice you plan to serve or have already served on your tenant.',
    },
    {
      '@type': 'HowToStep',
      name: 'Upload to the checker',
      text: 'Upload your Section 21 notice document (PDF or image) to our free online validity checker.',
    },
    {
      '@type': 'HowToStep',
      name: 'Answer compliance questions',
      text: 'Provide information about deposit protection, gas safety, EPC, How to Rent guide, and other compliance requirements.',
    },
    {
      '@type': 'HowToStep',
      name: 'Review your validity report',
      text: 'Receive an instant report showing any issues with your notice, including specific compliance failures and how to fix them.',
    },
    {
      '@type': 'HowToStep',
      name: 'Fix issues or generate correct notice',
      text: 'Use the report to fix any issues, or generate a court-ready Section 21 notice using our Notice Only Pack.',
    },
  ],
};

export default function Section21ValidatorPage() {
  return (
    <>
      <ToolFunnelTracker
        toolName={upsellConfig.toolName}
        toolType={upsellConfig.toolType}
        jurisdiction={upsellConfig.jurisdiction}
      />
      {/* Structured Data */}
      <StructuredData data={faqSchema} />
      <StructuredData data={howToSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tools', url: 'https://landlordheaven.co.uk/tools' },
          { name: 'Validators', url: 'https://landlordheaven.co.uk/tools/validators' },
          {
            name: 'Section 21 Validity Checker',
            url: 'https://landlordheaven.co.uk/tools/validators/section-21',
          },
        ])}
      />

      <HeaderConfig mode="autoOnScroll" />
      <UniversalHero
        badge="England only"
        title="Check Your Section 21 Notice (England)"
        subtitle="Free online Section 21 notice checker for England landlords. Upload your Form 6A to check if it's valid for court. Get an instant report on deposit protection, prescribed information, gas safety, EPC, and notice period compliance."
        align="center"
        hideMedia
        showReviewPill={false}
      />

      {/* Quick Checklist - SSR for SEO */}
      <section className="bg-white py-8 border-b border-gray-100">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Section 21 Quick Validity Checklist
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Before serving your Section 21 notice, ensure you can tick off these requirements:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Form 6A</strong> — Using the prescribed form (not old-style letter)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Deposit protected</strong> — In TDS, DPS, or MyDeposits scheme
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Prescribed information</strong> — Served within 30 days of deposit
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Gas Safety Certificate</strong> — Given before move-in (if gas appliances)
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>EPC served</strong> — Valid Energy Performance Certificate provided
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>How to Rent guide</strong> — Current version given to tenant
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Property licensed</strong> — If selective/HMO licensing applies
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Notice period</strong> — At least 2 calendar months
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>No retaliatory eviction</strong> — No council complaint in last 6 months
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Service evidence</strong> — Proof of how notice was delivered
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Note:</strong> EICR (electrical safety) is a landlord compliance requirement
              but does not currently invalidate Section 21 notices. However, always ensure EICR
              compliance for safety and other legal obligations.
            </p>
          </div>
        </Container>
      </section>

      {/* Validator Component - Client rendered */}
      <ValidatorPage
        validatorKey="section_21"
        title="Upload Your Section 21 Notice"
        description="Upload your Section 21 notice to instantly check if it's valid and court-ready"
        jurisdiction="england"
        allowedJurisdictions={['england']}
        caseType="eviction"
        productVariant="section21_england"
        toolUpsell={upsellConfig}
        features={[
          'Form 6A compliance verification',
          'Deposit protection status check',
          'Prescribed information validation',
          'Gas safety certificate timing',
          'EPC provision confirmation',
          'How to Rent guide compliance',
          'Notice period calculation',
          'Licensing requirement check',
        ]}
        additionalInfo="Our Section 21 checker validates all legal requirements under the Housing Act 1988 (as amended by the Deregulation Act 2015). Upload your notice to get instant feedback on compliance issues that could make your notice invalid in court."
        hideHeroSection
      />

      {/* SEO Content Section */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-charcoal mb-6">
              How This Section 21 Checker Works
            </h2>
            <p className="text-gray-700 mb-6">
              Our free Section 21 notice validator uses a deterministic rules engine to check your
              notice against all legal requirements. Unlike generic document checkers, our tool is
              specifically designed for Form 6A notices and understands the complex compliance
              requirements landlords must meet.
            </p>
            <p className="text-gray-700 mb-6">
              Simply upload your Section 21 notice and answer a few questions about your compliance
              documents. The checker will instantly identify any issues that could make your notice
              invalid, saving you time and potential court costs.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              What Makes a Valid Section 21 Notice?
            </h2>
            <p className="text-gray-700 mb-4">
              To serve a valid Section 21 notice in England, landlords must comply with multiple
              statutory requirements introduced primarily by the Deregulation Act 2015. These
              requirements are designed to ensure tenants receive proper notice and have been
              provided with essential safety and tenancy documents.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              1. Prescribed Form 6A Requirement
            </h3>
            <p className="text-gray-700 mb-4">
              Since 1 October 2015, all Section 21 notices for Assured Shorthold Tenancies must use
              the prescribed <Link href="/form-6a-section-21" className="text-primary hover:underline">Form 6A</Link>. Using an old-style notice, a letter, or any other format will
              make the notice invalid. The form must be completed accurately with the correct
              property address, tenant names, and landlord details.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              2. Deposit Protection Requirements
            </h3>
            <p className="text-gray-700 mb-4">
              If you took a deposit from your tenant, you must protect it in a government-approved
              tenancy deposit scheme (TDS, DPS, or MyDeposits) within 30 days of receiving it.
              Additionally, you must provide the prescribed information about the deposit to the
              tenant within the same 30-day period. Failure to comply with either requirement
              prevents you from serving a valid Section 21 notice.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              3. Gas Safety Certificate
            </h3>
            <p className="text-gray-700 mb-4">
              If the property has any gas appliances, a valid gas safety certificate must be given
              to the tenant before they move in (for tenancies starting on or after 1 October 2015).
              The certificate must be renewed annually and a copy provided to the tenant within 28
              days of each check.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              4. Energy Performance Certificate (EPC)
            </h3>
            <p className="text-gray-700 mb-4">
              A valid EPC must be provided to the tenant before the tenancy begins. The EPC must
              show a rating of E or above (unless an exemption applies). Without providing an EPC,
              you cannot serve a valid Section 21 notice.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              5. How to Rent Guide
            </h3>
            <p className="text-gray-700 mb-4">
              For tenancies starting on or after 1 October 2015, landlords must provide tenants with
              the current version of the government&apos;s &quot;How to Rent&quot; guide. This can
              be provided electronically (e.g., by email) or as a hard copy. Using an outdated
              version may invalidate your notice.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              6. Property Licensing
            </h3>
            <p className="text-gray-700 mb-4">
              If your property is in an area with selective licensing or requires an HMO licence,
              you must hold the appropriate licence. Operating without a required licence prevents
              you from serving a valid Section 21 notice. Check with your local council to confirm
              licensing requirements in your area.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Common Section 21 Mistakes That Invalidate Notices
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Using the wrong form or an outdated version of Form 6A</li>
              <li>Calculating the notice period incorrectly (must be at least 2 calendar months)</li>
              <li>Serving during the first 4 months of the tenancy</li>
              <li>Not protecting the deposit before serving the notice</li>
              <li>Failing to serve prescribed information within 30 days of receiving the deposit</li>
              <li>Not providing the gas safety certificate before move-in</li>
              <li>Using an expired or invalid EPC</li>
              <li>Providing an outdated version of the How to Rent guide</li>
              <li>Operating without a required property licence</li>
              <li>Ignoring retaliatory eviction protections after a tenant complaint</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              What to Do If Your Notice Is Invalid
            </h2>
            <p className="text-gray-700 mb-4">
              If our checker identifies issues with your Section 21 notice, don&apos;t panic. Many
              problems can be fixed:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Missing documents:</strong> Serve the required documents now, wait the
                appropriate period, then serve a new Section 21 notice.
              </li>
              <li>
                <strong>Deposit issues:</strong> Protect the deposit and serve prescribed
                information, then serve a new notice.
              </li>
              <li>
                <strong>Wrong form:</strong> Serve a new notice using the correct Form 6A.
              </li>
              <li>
                <strong>Licensing issues:</strong> Apply for the required licence before serving a
                new notice.
              </li>
            </ul>
            <p className="text-gray-700 mb-6">
              Our{' '}
              <Link href={wizardLinkCompletePack} className="text-purple-700 underline">
                Complete Eviction Pack
              </Link>{' '}
              includes all the documents and guidance you need to serve a valid Section 21 notice,
              along with expert support if issues arise.
            </p>

            <FAQSection
              title="Frequently Asked Questions"
              faqs={faqs}
              showContactCTA={false}
              variant="white"
            />

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              What You Need to Run the Section 21 Check
            </h2>
            <p className="text-gray-700 mb-4">
              To get the most accurate validation results, have these documents ready:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Your Section 21 notice (Form 6A) — PDF or clear photo</li>
              <li>Tenancy start date and whether it&apos;s fixed-term or periodic</li>
              <li>Deposit protection certificate and prescribed information dates</li>
              <li>Date gas safety certificate was provided (if applicable)</li>
              <li>EPC date and rating</li>
              <li>How to Rent guide — version and date given to tenant</li>
              <li>Details of any local licensing schemes</li>
              <li>Service method (hand delivery, post, email)</li>
            </ul>

            <div className="mt-12 p-6 bg-purple-50 rounded-lg">
              <h3 className="text-xl font-semibold text-charcoal mb-4">
                Need Help With Your Eviction?
              </h3>
              <p className="text-gray-700 mb-4">
                If your Section 21 notice has issues or you want to ensure everything is done
                correctly from the start, our eviction packs include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Correctly completed Form 6A with your property and tenant details</li>
                <li>Compliance checklist to ensure all requirements are met</li>
                <li>Step-by-step service guide</li>
                <li>Court application forms (Complete Pack only)</li>
                <li>Expert support via our Ask Heaven service</li>
              </ul>
              <div className="flex flex-wrap gap-4 mt-6">
                <Link
                  href={wizardLinkNoticeOnly}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Notice Only Pack - £49.99
                </Link>
                <Link
                  href={wizardLinkCompletePack}
                  className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Complete Eviction Pack - £199.99
                </Link>
              </div>
            </div>

            {/* Legal basis and last updated */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-charcoal mb-4">
                Legal Basis &amp; Last Updated
              </h2>
              <p className="text-gray-700 mb-4">
                This Section 21 validity checker is based on the requirements set out in the
                Housing Act 1988 (as amended), the Deregulation Act 2015, and related statutory
                instruments including the Assured Shorthold Tenancy Notices and Prescribed
                Requirements (England) Regulations 2015.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Last updated:</strong> January 2025. We review this tool regularly to
                reflect changes in housing law. Always verify current requirements for your
                specific situation.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Related Resources */}
      <Container className="py-12">
        <RelatedLinks
          title="Related Resources"
          links={[
            productLinks.noticeOnly,
            productLinks.completePack,
            landingPageLinks.section21Template,
            toolLinks.section21Generator,
            toolLinks.section8Validator,
            blogLinks.section21VsSection8,
          ]}
        />
      </Container>
    </>
  );
}
