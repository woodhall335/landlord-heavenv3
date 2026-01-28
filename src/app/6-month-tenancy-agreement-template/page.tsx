import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema, faqPageSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  productLinks,
  landingPageLinks,
  toolLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import {
  CheckCircle,
  FileText,
  Calendar,
  Shield,
  AlertTriangle,
  Clock,
  HelpCircle,
  Home,
} from 'lucide-react';

const wizardLinkAST = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'england',
  src: 'template',
});

export const metadata: Metadata = {
  title: '6 Month Tenancy Agreement Template UK 2026 — Short-Term AST',
  description: 'Free 6 month tenancy agreement template for UK landlords. Download a short-term assured shorthold tenancy (AST) template. Understand notice periods, break clauses, and renewal options.',
  keywords: [
    '6 month tenancy agreement',
    '6 month tenancy agreement template',
    'short term tenancy agreement',
    'short term AST',
    '6 month AST',
    'six month tenancy',
    'short term rental agreement UK',
    '6 month rental contract',
    'minimum tenancy length UK',
    'short fixed term tenancy',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/6-month-tenancy-agreement-template',
  },
  openGraph: {
    title: '6 Month Tenancy Agreement Template UK 2026 | Landlord Heaven',
    description: 'Short-term AST template for 6-month tenancies. Download free or get a court-ready version.',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'Is a 6 month tenancy agreement legally valid in the UK?',
    answer: 'Yes, a 6 month tenancy agreement is fully legal and valid in England and Wales. There is no minimum tenancy length required by law for an AST. However, you cannot serve a Section 21 notice that expires within the first 4 months of the tenancy, so 6 months is a common minimum.',
  },
  {
    question: 'Can I evict a tenant before the 6 months is up?',
    answer: 'Only if the tenant breaches the tenancy agreement (e.g., rent arrears, anti-social behaviour) using a Section 8 notice with appropriate grounds. You cannot use Section 21 (no-fault eviction) during a fixed term unless there is a break clause. After the fixed term, standard eviction rules apply.',
  },
  {
    question: 'What happens at the end of a 6 month tenancy?',
    answer: 'At the end of the fixed term, the tenancy automatically becomes a periodic tenancy (rolling month-to-month) unless you sign a new fixed-term agreement or give valid notice to end. The terms remain the same, but either party can end with proper notice.',
  },
  {
    question: 'Can I increase rent during a 6 month tenancy?',
    answer: 'Generally no, unless your tenancy agreement includes a rent review clause. During a fixed term, rent is fixed at the agreed amount. You can increase rent when agreeing a new fixed term or, during a periodic tenancy, by following the proper notice procedure (Section 13 or new agreement).',
  },
  {
    question: 'Should I include a break clause in a 6 month tenancy?',
    answer: 'A break clause is optional. It allows either party to end the tenancy early (typically after 3-4 months) with notice. For a short 6-month term, many landlords skip the break clause since the term is already brief. However, it provides flexibility if circumstances change.',
  },
  {
    question: 'What notice period applies to a 6 month tenancy?',
    answer: 'During the fixed term, neither party can end early without a break clause (except for serious breach). After the fixed term, landlords must give at least 2 months notice (Section 21) or use Section 8 grounds. Tenants must give at least 1 month notice.',
  },
  {
    question: 'Can I offer a 6 month tenancy to students?',
    answer: 'Yes, 6-month tenancies work well for students on shorter courses or those who need accommodation for one semester. However, most academic years run 9-12 months, so 6 months may not align with typical student needs.',
  },
  {
    question: 'Is a 6 month tenancy better than a 12 month tenancy?',
    answer: 'It depends on your goals. A 6-month tenancy offers more flexibility to adjust rent, review tenants, or regain possession sooner. A 12-month tenancy provides more stability and income certainty. Short-term lets may attract more transient tenants.',
  },
];

export default function SixMonthTenancyAgreementPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '6 Month Tenancy Agreement Template UK',
    description: 'Short-term assured shorthold tenancy template for 6-month fixed terms.',
    url: 'https://landlordheaven.co.uk/6-month-tenancy-agreement-template',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/tenancy-agreement-template' },
        { name: '6 Month Tenancy Agreement', url: 'https://landlordheaven.co.uk/6-month-tenancy-agreement-template' },
      ])} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England & Wales"
          badgeIcon={<Calendar className="w-4 h-4" />}
          title="6 Month Tenancy Agreement Template"
          subtitle={<>Need a <strong>short-term tenancy agreement</strong>? Get a legally compliant 6-month AST template for England and Wales — with clear terms for both landlord and tenant.</>}
          primaryCTA={{ label: 'Get AST Template — £14.99', href: wizardLinkAST }}
          secondaryCTA={{ label: 'View 12-Month Option', href: '/tenancy-agreement-template' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Housing Act 1988 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Tenant Fees Act 2019 Ready
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Instant Download
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* When to Use */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
                When to Use a 6 Month Tenancy Agreement
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="font-bold text-gray-900">Good For</h3>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span><strong>New tenants</strong> — Test the relationship before committing to longer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span><strong>Uncertain plans</strong> — You may need the property back soon</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span><strong>Corporate lets</strong> — Employees on short assignments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span><strong>Property sales</strong> — Keeping options open while marketing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span><strong>Rent reviews</strong> — Flexibility to adjust rent sooner</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="font-bold text-gray-900">Consider Alternatives If</h3>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span><strong>You want stability</strong> — 12 months reduces turnover costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span><strong>Good tenant found</strong> — Lock them in longer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span><strong>Family tenants</strong> — They often prefer longer terms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span><strong>Mortgage conditions</strong> — Some lenders require 6+ months minimum</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span><strong>Void periods</strong> — More frequent re-letting means more costs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding 6 Month Tenancy Agreements
              </h2>

              <p className="text-gray-700 mb-6">
                A <strong>6 month tenancy agreement</strong> is an assured shorthold tenancy (AST) with a fixed term
                of six months. It&apos;s a popular choice for landlords who want flexibility without the commitment
                of a longer lease, while still providing tenants with security during the fixed period.
              </p>

              <p className="text-gray-700 mb-6">
                While there&apos;s no legal minimum tenancy length in England and Wales, six months has become
                a common standard because it aligns with the Section 21 notice restrictions — you cannot serve
                a Section 21 notice that expires within the first four months of an AST.
              </p>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Legal Requirements for a 6 Month AST
              </h3>

              <p className="text-gray-700 mb-4">
                Your 6-month tenancy agreement must comply with the same legal requirements as any AST:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Before Tenancy Starts
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Protect deposit within 30 days</li>
                    <li>• Provide prescribed information</li>
                    <li>• Give valid EPC certificate</li>
                    <li>• Give gas safety certificate</li>
                    <li>• Provide How to Rent guide</li>
                    <li>• Ensure EICR is valid</li>
                  </ul>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Agreement Must Include
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Names of all parties</li>
                    <li>• Property address</li>
                    <li>• Start date and term length</li>
                    <li>• Rent amount and due dates</li>
                    <li>• Deposit amount and scheme</li>
                    <li>• Landlord&apos;s contact details</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                What Happens After 6 Months?
              </h3>

              <p className="text-gray-700 mb-4">
                At the end of the six-month fixed term, you have three options:
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sign a New Fixed Term</h4>
                    <p className="text-sm text-gray-600">
                      Agree another 6-month term, 12 months, or any period you both prefer. This is a good
                      opportunity to review and adjust the rent.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Let It Become Periodic</h4>
                    <p className="text-sm text-gray-600">
                      If neither party takes action, the tenancy automatically becomes a statutory periodic
                      tenancy (month-to-month). Same terms apply, but either party can end with proper notice.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">End the Tenancy</h4>
                    <p className="text-sm text-gray-600">
                      Serve a Section 21 notice (at least 2 months before you want possession) or ask the
                      tenant to vacate by the end date. Tenants must give at least 1 month notice.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Break Clauses in 6 Month Agreements
              </h3>

              <p className="text-gray-700 mb-4">
                A break clause allows either party to end the tenancy before the fixed term expires.
                For a 6-month tenancy, a typical break clause might allow termination after 3 or 4 months
                with 1-2 months&apos; notice.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Break Clause Considerations</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Remember: even with a break clause, you still cannot serve a Section 21 notice that
                      expires within the first 4 months. A break clause gives the tenant flexibility but
                      doesn&apos;t override the 4-month Section 21 restriction for landlords.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Rent and Deposit for 6 Month Tenancies
              </h3>

              <p className="text-gray-700 mb-4">
                The rules for rent and deposits are the same regardless of tenancy length:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li><strong>Deposit cap:</strong> Maximum 5 weeks&apos; rent (if annual rent under £50,000)</li>
                <li><strong>Deposit protection:</strong> Must be protected within 30 days of receipt</li>
                <li><strong>Holding deposit:</strong> Maximum 1 week&apos;s rent, refundable if tenancy proceeds</li>
                <li><strong>Rent in advance:</strong> Typically 1 month, though not legally capped</li>
                <li><strong>Permitted fees:</strong> Only rent, deposit, holding deposit, and certain defaults</li>
              </ul>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Notice Periods for 6 Month Tenancies
              </h3>

              <div className="overflow-x-auto mb-8">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Scenario</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Landlord Notice</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Tenant Notice</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-3 text-gray-700">During fixed term (no break clause)</td>
                      <td className="px-4 py-3 text-gray-700">Cannot end early (except Section 8)</td>
                      <td className="px-4 py-3 text-gray-700">Cannot end early</td>
                    </tr>
                    <tr className="border-t bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">During fixed term (with break clause)</td>
                      <td className="px-4 py-3 text-gray-700">Per break clause terms</td>
                      <td className="px-4 py-3 text-gray-700">Per break clause terms</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3 text-gray-700">After fixed term (periodic)</td>
                      <td className="px-4 py-3 text-gray-700">2 months (Section 21)</td>
                      <td className="px-4 py-3 text-gray-700">1 month</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
                Key Clauses to Include
              </h3>

              <p className="text-gray-700 mb-4">
                Your 6-month tenancy agreement should include these essential clauses:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Rent amount and payment method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Deposit amount and protection scheme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Tenant obligations (repairs, access)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Landlord obligations (repairs, safety)</span>
                  </li>
                </ul>
                <ul className="text-gray-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Permitted use (residential only)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Pet policy (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Break clause (optional)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>End of tenancy procedures</span>
                  </li>
                </ul>
              </div>

              {/* FAQ Section */}
              <h2 className="text-3xl font-bold text-gray-900 mt-16 mb-8">
                Frequently Asked Questions
              </h2>

              <div className="space-y-6 mb-12">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-700 pl-8">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <SeoCtaBlock
          title="Get Your 6 Month Tenancy Agreement"
          description="Our AST templates are fully customisable for any fixed term. Set the dates, add optional clauses, and download instantly."
          primaryCTA={{ label: 'Standard AST — £14.99', href: wizardLinkAST }}
          secondaryCTA={{ label: 'Premium AST — £24.99', href: '/products/ast' }}
          features={[
            'Customisable fixed term length',
            'Optional break clause included',
            'Housing Act 1988 compliant',
            'Tenant Fees Act 2019 ready',
          ]}
        />

        {/* Disclaimer */}
        <SeoDisclaimer />

        {/* Related Links */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <RelatedLinks
              title="Related Resources"
              links={[
                productLinks.ast,
                landingPageLinks.tenancyAgreementTemplate,
                landingPageLinks.jointTenancyAgreement,
                { title: 'Fixed Term Tenancy Agreement', href: '/fixed-term-tenancy-agreement-template', description: 'Compare fixed-term options' },
              ]}
            />
          </div>
        </section>

        {/* Last Updated */}
        <section className="py-8 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-gray-500">
                <strong>Last updated:</strong> January 2026. This guide reflects current AST requirements under
                the Housing Act 1988 and Tenant Fees Act 2019.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
