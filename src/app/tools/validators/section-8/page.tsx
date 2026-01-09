/**
 * Section 8 Notice Validator Page
 *
 * SEO-optimized page with comprehensive content about Section 8 notices,
 * grounds for possession, and FAQ schema for rich snippets.
 */

import type { Metadata } from 'next';
import { ValidatorPage } from '@/components/validators/ValidatorPage';
import { Container } from '@/components/ui/Container';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';

export const metadata: Metadata = {
  title: 'Section 8 Grounds Checker – Is My Notice Valid? | Free Tool',
  description:
    'Free Section 8 notice checker for England. Upload your notice for an instant validity report. Checks Form 3 compliance, grounds for possession (8, 10, 11), notice periods, and evidence requirements. England only.',
  keywords: [
    'section 8 notice checker',
    'section 8 grounds checker',
    'is my section 8 notice valid',
    'section 8 validator',
    'form 3 validator',
    'grounds for possession',
    'eviction notice check',
    'ground 8 rent arrears',
    'mandatory grounds eviction',
    'discretionary grounds eviction',
  ],
  openGraph: {
    title: 'Section 8 Grounds Checker – Is My Notice Valid? | Free Tool',
    description:
      'Free online Section 8 notice checker for England landlords. Upload your notice for instant grounds and validity verification.',
    type: 'website',
    url: getCanonicalUrl('/tools/validators/section-8'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/validators/section-8'),
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a Section 8 notice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Section 8 notice (also known as Form 3) is a legal document landlords use to seek possession of a property when the tenant has breached the tenancy agreement. Unlike Section 21, you must state specific grounds for possession under Schedule 2 of the Housing Act 1988 and prove them in court.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between mandatory and discretionary grounds?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mandatory grounds (Grounds 1-8) require the court to grant possession if proved. The most commonly used is Ground 8 (serious rent arrears). Discretionary grounds (Grounds 9-17) allow the court to consider whether it is reasonable to grant possession, even if the ground is proved. Courts are more likely to grant discretionary orders where there is a pattern of behavior.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Ground 8 and how much arrears are needed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ground 8 is a mandatory ground for possession based on serious rent arrears. The tenant must owe at least 8 weeks rent (if paid weekly/fortnightly) or 2 months rent (if paid monthly) BOTH at the time you serve the notice AND at the court hearing. If arrears fall below this threshold before the hearing, Ground 8 fails.',
      },
    },
    {
      '@type': 'Question',
      name: 'What notice period is required for Section 8?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The notice period depends on which grounds you use. Grounds 1, 2, 5, 6, 7, 9, and 16 require 2 months notice. Ground 8 (serious rent arrears) requires 2 weeks notice. Grounds 10, 11, 12, 13, 14, 14A, 15, and 17 require 2 weeks notice. If using multiple grounds with different periods, use the longest required period.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use Section 8 and Section 21 together?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, many landlords serve both notices together as a "belt and braces" approach. Section 21 provides a guaranteed route to possession (if valid) while Section 8 may allow faster possession for serious breaches. If using both, ensure each notice is separately valid and meets its own requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'What evidence do I need for a Section 8 claim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Evidence requirements depend on your grounds. For rent arrears (Ground 8, 10, 11): rent statements, payment records, demand letters. For anti-social behavior (Ground 14): diary of incidents, witness statements, police reports, neighbour complaints. For property damage (Ground 13): photos, repair quotes, inspection reports. Courts require clear documentary evidence.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if the tenant pays off arrears before court?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If using Ground 8 (mandatory), the tenant must still owe the threshold amount at the hearing. If they pay down below 8 weeks/2 months, Ground 8 fails. However, you can still proceed on discretionary grounds (10 or 11) for persistent late payment or any arrears. Courts may grant possession on discretionary grounds if there is a history of payment problems.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long is a Section 8 notice valid for?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A Section 8 notice remains valid for 12 months from the date it was served. You must begin court proceedings within this period. If the notice expires before you apply to court, you will need to serve a new notice. Unlike Section 21, there is no 6-month deadline.',
      },
    },
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Check if Your Section 8 Notice is Valid',
  description:
    'Use our free Section 8 grounds checker to verify your notice meets all legal requirements for court proceedings in England.',
  totalTime: 'PT5M',
  step: [
    {
      '@type': 'HowToStep',
      name: 'Locate your Section 8 notice',
      text: 'Find the Section 8 notice (Form 3) you want to check. This should be the notice you plan to serve or have already served on your tenant.',
    },
    {
      '@type': 'HowToStep',
      name: 'Upload to the checker',
      text: 'Upload your Section 8 notice document (PDF or image) to our free online checker.',
    },
    {
      '@type': 'HowToStep',
      name: 'Answer questions about your grounds',
      text: 'Provide information about your chosen grounds for possession, arrears amounts if applicable, and tenancy details.',
    },
    {
      '@type': 'HowToStep',
      name: 'Review your validity report',
      text: 'Receive an instant report showing any issues with your notice, including ground-specific requirements and notice period calculations.',
    },
    {
      '@type': 'HowToStep',
      name: 'Fix issues or generate correct notice',
      text: 'Use the report to fix any issues, or generate a court-ready Section 8 notice using our Notice Only Pack.',
    },
  ],
};

export default function Section8ValidatorPage() {
  return (
    <>
      {/* Structured Data */}
      <StructuredData data={faqSchema} />
      <StructuredData data={howToSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tools', url: 'https://landlordheaven.co.uk/tools' },
          { name: 'Validators', url: 'https://landlordheaven.co.uk/tools/validators' },
          {
            name: 'Section 8 Grounds Checker',
            url: 'https://landlordheaven.co.uk/tools/validators/section-8',
          },
        ])}
      />

      {/* SSR Above-the-Fold Content */}
      <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-8 md:pt-32">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            {/* H1 - SSR Rendered */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
              Section 8 Grounds Checker – Is My Notice Valid?
            </h1>

            {/* Intro paragraph with target keywords */}
            <p className="text-lg md:text-xl text-gray-600 mb-6">
              Free online <strong>Section 8 notice checker</strong> for England landlords. Upload
              your notice to check if it&apos;s valid for court. Get an instant report on Form 3
              compliance, grounds for possession, notice periods, and evidence requirements.
            </p>

            {/* England-only disclaimer - SSR visible */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg text-left max-w-2xl mx-auto">
              <p className="text-amber-900 text-sm">
                <strong>🏴󠁧󠁢󠁥󠁮󠁧󠁿 England only:</strong> Section 8 notices apply to{' '}
                <strong>England only</strong>. Different eviction rules apply in{' '}
                <Link
                  href="/wales-eviction-notices"
                  className="text-amber-700 underline hover:text-amber-900"
                >
                  Wales (Renting Homes Act)
                </Link>
                ,{' '}
                <Link
                  href="/scotland-eviction-notices"
                  className="text-amber-700 underline hover:text-amber-900"
                >
                  Scotland (Notice to Leave)
                </Link>
                , and{' '}
                <Link
                  href="/how-to-evict-tenant#northern-ireland"
                  className="text-amber-700 underline hover:text-amber-900"
                >
                  Northern Ireland
                </Link>
                .
              </p>
            </div>

            {/* Quick internal links - SSR */}
            <div className="flex flex-wrap gap-2 justify-center text-sm mb-6">
              <Link
                href="/section-8-notice-template"
                className="text-primary hover:underline font-medium"
              >
                Section 8 notice template
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/section-21-notice-template"
                className="text-primary hover:underline font-medium"
              >
                Section 21 template
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/how-to-evict-tenant"
                className="text-primary hover:underline font-medium"
              >
                How to evict a tenant
              </Link>
              <span className="text-gray-400">•</span>
              <Link
                href="/rent-arrears-letter-template"
                className="text-primary hover:underline font-medium"
              >
                Rent arrears letter
              </Link>
            </div>

            {/* Trust signals */}
            <p className="text-xs text-gray-500">
              Not legal advice. This tool checks key legal requirements but cannot guarantee court
              outcomes.
            </p>
          </div>
        </Container>
      </section>

      {/* Quick Checklist - SSR for SEO */}
      <section className="bg-white py-8 border-b border-gray-100">
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Section 8 Quick Notice Checklist
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Before serving your Section 8 notice, ensure these key requirements are met:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Correct Form 3</strong> — Using the current prescribed form
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Grounds stated correctly</strong> — Schedule 2 reference and wording
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Ground 8 threshold</strong> — 2+ months/8 weeks arrears at service
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Notice period correct</strong> — 2 weeks (Gr 8,10,11,14) or 2 months
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Evidence gathered</strong> — Rent statements, photos, witness statements
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Multiple grounds compatible</strong> — Notice periods don&apos;t conflict
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Service evidence</strong> — Proof of delivery method
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-primary font-bold">✓</span>
                <span className="text-gray-700">
                  <strong>Arrears maintained</strong> — For Ground 8, arrears at hearing too
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Tip:</strong> For rent arrears, always combine Ground 8 (mandatory) with
              Grounds 10/11 (discretionary) as a backup in case arrears drop below the threshold.
            </p>
          </div>
        </Container>
      </section>

      {/* Validator Component - Client rendered */}
      <ValidatorPage
        validatorKey="section_8"
        title="Upload Your Section 8 Notice"
        description="Upload your Section 8 notice to instantly check if it's valid and grounds are properly stated"
        jurisdiction="england"
        allowedJurisdictions={['england']}
        caseType="eviction"
        productVariant="section8_england"
        features={[
          'Form 3 compliance verification',
          'Ground validity verification',
          'Notice period calculation by ground',
          'Mandatory vs discretionary assessment',
          'Ground 8 arrears threshold check',
          'Evidence requirements per ground',
          'Multiple grounds compatibility',
          'Court hearing date estimation',
        ]}
        additionalInfo="Our Section 8 checker validates all legal requirements under Schedule 2 of the Housing Act 1988. Upload your notice to get instant feedback on compliance issues and ground-specific requirements that could affect your court case."
        hideHeroSection
      />

      {/* SEO Content Section */}
      <div className="bg-gray-50 py-16">
        <Container>
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-charcoal mb-6">
              How This Section 8 Checker Works
            </h2>
            <p className="text-gray-700 mb-6">
              Our free Section 8 notice validator uses a deterministic rules engine to check your
              notice against all legal requirements under Schedule 2 of the Housing Act 1988. Unlike
              generic document checkers, our tool understands the complex interplay between
              different grounds, notice periods, and evidence requirements that landlords must
              navigate.
            </p>
            <p className="text-gray-700 mb-6">
              Simply upload your Section 8 notice and answer a few questions about your
              circumstances. The checker will instantly identify any issues that could weaken your
              case in court, including ground-specific threshold requirements and notice period
              calculations.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Understanding Section 8 Notices
            </h2>
            <p className="text-gray-700 mb-4">
              A Section 8 notice is fundamentally different from a Section 21 notice. While Section
              21 allows &quot;no-fault&quot; eviction, Section 8 requires you to prove specific
              grounds for possession in court. This means your notice must be carefully prepared,
              and you must have evidence to support your claimed grounds at the hearing.
            </p>
            <p className="text-gray-700 mb-4">
              Section 8 notices use the prescribed Form 3 and must clearly state which grounds from
              Schedule 2 of the Housing Act 1988 you are relying upon. Getting this wrong can result
              in your case being dismissed or delayed.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Mandatory Grounds (Grounds 1-8)
            </h2>
            <p className="text-gray-700 mb-4">
              Mandatory grounds are powerful because the court <strong>must</strong> grant
              possession if you prove the ground applies. The court has no discretion to refuse,
              even if it would cause hardship to the tenant.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Ground 8: Serious Rent Arrears (Most Common)
            </h3>
            <p className="text-gray-700 mb-4">
              Ground 8 is the most frequently used mandatory ground. It requires the tenant to be in
              serious arrears <strong>both</strong> when you serve the notice{' '}
              <strong>and</strong> at the court hearing. The threshold depends on how rent is paid:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Weekly rent:</strong> at least 8 weeks&apos; rent outstanding
              </li>
              <li>
                <strong>Fortnightly rent:</strong> at least 4 fortnightly payments (8 weeks)
              </li>
              <li>
                <strong>Monthly rent:</strong> at least 2 months&apos; rent outstanding
              </li>
              <li>
                <strong>Quarterly/yearly rent:</strong> at least 2 months&apos; equivalent
                outstanding
              </li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Critical warning:</strong> If the tenant pays down their arrears below the
              threshold before your court hearing, Ground 8 will fail. Many landlords combine Ground
              8 with discretionary grounds (10 and 11) as a backup.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Other Mandatory Grounds
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Ground 1:</strong> Landlord previously occupied as their only or principal
                home
              </li>
              <li>
                <strong>Ground 2:</strong> Mortgage lender requires possession to sell
              </li>
              <li>
                <strong>Ground 3:</strong> Out of season holiday let
              </li>
              <li>
                <strong>Ground 4:</strong> Student accommodation out of term
              </li>
              <li>
                <strong>Ground 5:</strong> Property needed for minister of religion
              </li>
              <li>
                <strong>Ground 6:</strong> Landlord intends to demolish or reconstruct
              </li>
              <li>
                <strong>Ground 7:</strong> Inherited tenancy and landlord wants possession within 12
                months
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Discretionary Grounds (Grounds 9-17)
            </h2>
            <p className="text-gray-700 mb-4">
              With discretionary grounds, even if you prove the ground applies, the court will
              consider whether it is &quot;reasonable&quot; to grant possession. Factors include:
              the severity of the breach, the tenant&apos;s circumstances, whether they have
              children or disabilities, and whether the behavior is likely to continue.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Ground 10: Some Rent Arrears
            </h3>
            <p className="text-gray-700 mb-4">
              Ground 10 applies when any rent is outstanding both when you serve the notice and at
              the hearing. Unlike Ground 8, there is no minimum threshold. However, courts are
              reluctant to grant possession for small arrears unless there is a history of late
              payment.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Ground 11: Persistent Delay in Paying Rent
            </h3>
            <p className="text-gray-700 mb-4">
              Ground 11 covers tenants who regularly pay late, even if they eventually pay. You need
              to demonstrate a pattern of late payment (typically 6+ months of late payments). This
              ground does not require any arrears at the hearing - the pattern of behavior is
              enough.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Ground 14: Anti-Social Behavior
            </h3>
            <p className="text-gray-700 mb-4">
              Ground 14 covers nuisance, annoyance, or illegal activity. You need strong evidence:
              police reports, council complaints, witness statements from neighbors, and a
              contemporaneous diary of incidents. Courts take ASB seriously but require clear proof.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Other Discretionary Grounds
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Ground 9:</strong> Suitable alternative accommodation available
              </li>
              <li>
                <strong>Ground 12:</strong> Breach of tenancy obligation (not rent)
              </li>
              <li>
                <strong>Ground 13:</strong> Deterioration of property due to neglect
              </li>
              <li>
                <strong>Ground 14A:</strong> Domestic violence (partner left)
              </li>
              <li>
                <strong>Ground 15:</strong> Deterioration of furniture
              </li>
              <li>
                <strong>Ground 16:</strong> Employee tenancy ended
              </li>
              <li>
                <strong>Ground 17:</strong> Tenancy obtained by false statement
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">Notice Periods by Ground</h2>
            <p className="text-gray-700 mb-4">
              Different grounds require different notice periods. Getting this wrong will invalidate
              your notice:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left font-semibold text-charcoal">Grounds</th>
                    <th className="px-4 py-2 text-left font-semibold text-charcoal">
                      Notice Period
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2 text-gray-700">1, 2, 5, 6, 7, 9, 16</td>
                    <td className="px-4 py-2 text-gray-700">2 months</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">
                      3, 4, 8, 10, 11, 12, 13, 14, 14A, 15, 17
                    </td>
                    <td className="px-4 py-2 text-gray-700">2 weeks</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 mb-6">
              <strong>Important:</strong> If you use multiple grounds with different notice periods,
              you must use the longest required period. For example, if using Grounds 8 and 10 (2
              weeks) alongside Ground 9 (2 months), you need 2 months&apos; notice.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Common Section 8 Mistakes That Weaken Cases
            </h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>Using the wrong form or an outdated version of Form 3</li>
              <li>Stating grounds incorrectly or incompletely</li>
              <li>Giving insufficient notice for the grounds used</li>
              <li>Relying solely on Ground 8 without backup discretionary grounds</li>
              <li>Failing to maintain arrears at the threshold level until the hearing</li>
              <li>Poor or missing evidence to support the claimed grounds</li>
              <li>Not specifying whether grounds are mandatory or discretionary</li>
              <li>Using multiple grounds with conflicting notice periods</li>
              <li>Proceeding when tenant has genuine benefit delay (Ground 8 defense)</li>
              <li>Not addressing tenant&apos;s disrepair counterclaims</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Evidence Checklist for Court (Section 8)
            </h2>
            <p className="text-gray-700 mb-4">
              Courts require documentary evidence to prove your grounds. Here&apos;s what to prepare:
            </p>
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                For Rent Arrears (Grounds 8, 10, 11)
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Rent account/ledger showing all payments and arrears</li>
                <li>Tenancy agreement showing rent amount and due dates</li>
                <li>Bank statements showing (non-)receipt of rent</li>
                <li>All rent demand letters sent (with proof of service)</li>
                <li>Any communication about payment plans or disputes</li>
                <li>Housing benefit/UC payment records (if applicable)</li>
              </ul>
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                For Anti-Social Behaviour (Ground 14)
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Contemporaneous diary of incidents (dates, times, descriptions)</li>
                <li>Written complaints from neighbours (ideally signed)</li>
                <li>Police incident numbers and crime reference numbers</li>
                <li>Council ASB case officer correspondence</li>
                <li>Photos or videos of damage/incidents (if safe to obtain)</li>
                <li>Witness statements willing to attend court</li>
              </ul>
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                For Property Damage/Breach (Grounds 12, 13)
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Check-in inventory with photos/condition</li>
                <li>Current photos showing damage or breach</li>
                <li>Repair quotes or invoices</li>
                <li>Written warnings to tenant about the breach</li>
                <li>Tenancy agreement clause that has been breached</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Section 8 vs Section 21: Which Should You Use?
            </h2>
            <p className="text-gray-700 mb-4">
              Not sure whether to use Section 8 or Section 21? Here&apos;s a quick decision guide:
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">→</span>
                  <div>
                    <p className="text-gray-900 font-medium">
                      Use <strong>Section 8</strong> if:
                    </p>
                    <ul className="text-sm text-gray-700 mt-1 space-y-1">
                      <li>• Tenant owes 2+ months rent (Ground 8 = faster, 2 weeks notice)</li>
                      <li>• There is serious anti-social behaviour or property damage</li>
                      <li>• You need possession after May 2026 (Section 21 ends)</li>
                      <li>• You have clear evidence to prove your grounds in court</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold text-lg">→</span>
                  <div>
                    <p className="text-gray-900 font-medium">
                      Use <strong>Section 21</strong> if:
                    </p>
                    <ul className="text-sm text-gray-700 mt-1 space-y-1">
                      <li>• No specific breach — you simply want possession</li>
                      <li>• You want to avoid proving grounds in court</li>
                      <li>• You&apos;re selling the property or moving back in</li>
                      <li>• You&apos;re serving before 1 May 2026 deadline</li>
                    </ul>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 font-bold text-lg">→</span>
                  <div>
                    <p className="text-gray-900 font-medium">
                      Use <strong>both together</strong> if:
                    </p>
                    <ul className="text-sm text-gray-700 mt-1 space-y-1">
                      <li>• You want maximum flexibility (&quot;belt and braces&quot;)</li>
                      <li>• Rent arrears exist but might drop below threshold</li>
                      <li>• You want the faster Section 8 route with Section 21 backup</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              What to Do If Your Notice Is Invalid
            </h2>
            <p className="text-gray-700 mb-4">
              If our checker identifies issues with your Section 8 notice, here are your options:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Wrong grounds cited:</strong> Serve a new notice with the correct grounds
                and appropriate notice period.
              </li>
              <li>
                <strong>Insufficient notice period:</strong> Wait for the correct period or serve a
                new notice.
              </li>
              <li>
                <strong>Missing evidence:</strong> Gather required evidence before proceeding to
                court.
              </li>
              <li>
                <strong>Arrears below threshold:</strong> Wait for arrears to reach Ground 8
                threshold, or proceed on discretionary grounds only.
              </li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              {faqSchema.mainEntity.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-charcoal mb-2">{faq.name}</h3>
                  <p className="text-gray-700">{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-purple-50 rounded-lg">
              <h3 className="text-xl font-semibold text-charcoal mb-4">
                Need Help With Your Section 8 Eviction?
              </h3>
              <p className="text-gray-700 mb-4">
                Section 8 cases are more complex than Section 21 because you must prove your grounds
                in court. Our eviction packs include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 mb-4">
                <li>Correctly completed Form 3 with your chosen grounds</li>
                <li>Ground-specific evidence checklists</li>
                <li>Notice period calculator for your grounds combination</li>
                <li>Court application forms and witness statement templates</li>
                <li>Expert support via our Ask Heaven service</li>
              </ul>
              <div className="flex flex-wrap gap-4 mt-6">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Notice Only Pack - £29.99
                </Link>
                <Link
                  href="/products/complete-eviction-pack"
                  className="inline-flex items-center px-4 py-2 border border-purple-600 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Complete Eviction Pack - £149.99
                </Link>
              </div>
            </div>

            {/* Legal basis and last updated */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-xl font-bold text-charcoal mb-4">
                Legal Basis &amp; Last Updated
              </h2>
              <p className="text-gray-700 mb-4">
                This Section 8 grounds checker is based on the requirements set out in Schedule 2
                of the Housing Act 1988 (as amended), including the grounds for possession and
                associated notice periods. Ground availability and procedures are specific to
                England only.
              </p>
              <p className="text-sm text-gray-500">
                <strong>Last updated:</strong> January 2025. We review this tool regularly to
                reflect changes in housing law, including upcoming changes from the Renters&apos;
                Rights Act. Always verify current requirements for your specific situation.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
