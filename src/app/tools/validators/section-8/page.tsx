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

export const metadata: Metadata = {
  title: 'Free Section 8 Notice Checker | Validate Form 3 Online | Landlord Heaven',
  description:
    'Check your Section 8 notice is valid before court. Our free tool verifies Form 3 compliance, grounds for possession, notice periods, rent arrears calculations for Ground 8, and evidence requirements.',
  keywords: [
    'section 8 notice checker',
    'form 3 validator',
    'grounds for possession',
    'eviction notice check',
    'ground 8 rent arrears',
    'mandatory grounds eviction',
    'discretionary grounds eviction',
    'housing act 1988 schedule 2',
  ],
  openGraph: {
    title: 'Free Section 8 Notice Checker | Landlord Heaven',
    description:
      'Instantly check if your Section 8 notice is court-ready. Free validation tool for landlords with grounds verification.',
    type: 'website',
  },
  alternates: {
    canonical: '/tools/validators/section-8',
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

export default function Section8ValidatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <ValidatorPage
        validatorKey="section_8"
        title="Free Section 8 Notice Checker"
        description="Upload your Section 8 notice to instantly check if it's valid and grounds are properly stated"
        jurisdiction="england"
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
              generic document checkers, our tool understands the complex interplay between different
              grounds, notice periods, and evidence requirements that landlords must navigate.
            </p>
            <p className="text-gray-700 mb-6">
              Simply upload your Section 8 notice and answer a few questions about your circumstances.
              The checker will instantly identify any issues that could weaken your case in court,
              including ground-specific threshold requirements and notice period calculations.
            </p>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Understanding Section 8 Notices
            </h2>
            <p className="text-gray-700 mb-4">
              A Section 8 notice is fundamentally different from a Section 21 notice. While Section 21
              allows &quot;no-fault&quot; eviction, Section 8 requires you to prove specific grounds for
              possession in court. This means your notice must be carefully prepared, and you must
              have evidence to support your claimed grounds at the hearing.
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
              Mandatory grounds are powerful because the court <strong>must</strong> grant possession
              if you prove the ground applies. The court has no discretion to refuse, even if it would
              cause hardship to the tenant.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Ground 8: Serious Rent Arrears (Most Common)
            </h3>
            <p className="text-gray-700 mb-4">
              Ground 8 is the most frequently used mandatory ground. It requires the tenant to be in
              serious arrears <strong>both</strong> when you serve the notice <strong>and</strong> at
              the court hearing. The threshold depends on how rent is paid:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Weekly rent:</strong> at least 8 weeks&apos; rent outstanding</li>
              <li><strong>Fortnightly rent:</strong> at least 4 fortnightly payments (8 weeks)</li>
              <li><strong>Monthly rent:</strong> at least 2 months&apos; rent outstanding</li>
              <li><strong>Quarterly/yearly rent:</strong> at least 2 months&apos; equivalent outstanding</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Critical warning:</strong> If the tenant pays down their arrears below the
              threshold before your court hearing, Ground 8 will fail. Many landlords combine Ground 8
              with discretionary grounds (10 and 11) as a backup.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Other Mandatory Grounds
            </h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Ground 1:</strong> Landlord previously occupied as their only or principal home</li>
              <li><strong>Ground 2:</strong> Mortgage lender requires possession to sell</li>
              <li><strong>Ground 3:</strong> Out of season holiday let</li>
              <li><strong>Ground 4:</strong> Student accommodation out of term</li>
              <li><strong>Ground 5:</strong> Property needed for minister of religion</li>
              <li><strong>Ground 6:</strong> Landlord intends to demolish or reconstruct</li>
              <li><strong>Ground 7:</strong> Inherited tenancy and landlord wants possession within 12 months</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Discretionary Grounds (Grounds 9-17)
            </h2>
            <p className="text-gray-700 mb-4">
              With discretionary grounds, even if you prove the ground applies, the court will consider
              whether it is &quot;reasonable&quot; to grant possession. Factors include: the severity of the
              breach, the tenant&apos;s circumstances, whether they have children or disabilities, and
              whether the behavior is likely to continue.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Ground 10: Some Rent Arrears
            </h3>
            <p className="text-gray-700 mb-4">
              Ground 10 applies when any rent is outstanding both when you serve the notice and at
              the hearing. Unlike Ground 8, there is no minimum threshold. However, courts are
              reluctant to grant possession for small arrears unless there is a history of late payment.
            </p>

            <h3 className="text-xl font-semibold text-charcoal mb-4 mt-8">
              Ground 11: Persistent Delay in Paying Rent
            </h3>
            <p className="text-gray-700 mb-4">
              Ground 11 covers tenants who regularly pay late, even if they eventually pay. You need
              to demonstrate a pattern of late payment (typically 6+ months of late payments). This
              ground does not require any arrears at the hearing - the pattern of behavior is enough.
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
              <li><strong>Ground 9:</strong> Suitable alternative accommodation available</li>
              <li><strong>Ground 12:</strong> Breach of tenancy obligation (not rent)</li>
              <li><strong>Ground 13:</strong> Deterioration of property due to neglect</li>
              <li><strong>Ground 14A:</strong> Domestic violence (partner left)</li>
              <li><strong>Ground 15:</strong> Deterioration of furniture</li>
              <li><strong>Ground 16:</strong> Employee tenancy ended</li>
              <li><strong>Ground 17:</strong> Tenancy obtained by false statement</li>
            </ul>

            <h2 className="text-2xl font-bold text-charcoal mb-6 mt-12">
              Notice Periods by Ground
            </h2>
            <p className="text-gray-700 mb-4">
              Different grounds require different notice periods. Getting this wrong will invalidate
              your notice:
            </p>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left font-semibold text-charcoal">Grounds</th>
                    <th className="px-4 py-2 text-left font-semibold text-charcoal">Notice Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-4 py-2 text-gray-700">1, 2, 5, 6, 7, 9, 16</td>
                    <td className="px-4 py-2 text-gray-700">2 months</td>
                  </tr>
                  <tr className="border-t bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">3, 4, 8, 10, 11, 12, 13, 14, 14A, 15, 17</td>
                    <td className="px-4 py-2 text-gray-700">2 weeks</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 mb-6">
              <strong>Important:</strong> If you use multiple grounds with different notice periods,
              you must use the longest required period. For example, if using Grounds 8 and 10 (2 weeks)
              alongside Ground 9 (2 months), you need 2 months&apos; notice.
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
              Building a Strong Section 8 Case
            </h2>
            <p className="text-gray-700 mb-4">
              Unlike Section 21, Section 8 requires you to prove your case. Preparation is essential:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li>
                <strong>Rent arrears:</strong> Keep detailed payment records, send formal rent demands,
                document all communication about arrears.
              </li>
              <li>
                <strong>Anti-social behavior:</strong> Maintain a diary of incidents with dates, times,
                and witnesses. Report to police and council. Collect written complaints from neighbors.
              </li>
              <li>
                <strong>Property damage:</strong> Take dated photographs, obtain repair quotes, document
                the condition at tenancy start vs. current state.
              </li>
              <li>
                <strong>Breach of terms:</strong> Keep copies of the tenancy agreement highlighting
                breached clauses. Document warnings given to the tenant.
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
          </div>
        </Container>
      </div>
    </>
  );
}
