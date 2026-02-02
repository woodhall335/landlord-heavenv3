import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, faqPageSchema, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementEnglandLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Free Tenancy Agreement Template UK vs Paid: What You Need to Know 2026',
  description: 'Comparing free tenancy agreement templates vs professionally drafted ASTs. What free templates miss and why £14.99 is worth it.',
  keywords: [
    'free tenancy agreement template',
    'tenancy agreement template free',
    'free AST template',
    'free rental agreement UK',
    'tenancy agreement download',
    'free vs paid tenancy agreement',
    'AST template comparison',
    'landlord tenancy forms',
    'tenancy agreement PDF',
    'free landlord forms UK',
  ],
  alternates: {
    canonical: getCanonicalUrl('/tenancy-agreement-template-free'),
  },
  openGraph: {
    title: 'Free Tenancy Agreement Template UK vs Paid: What You Need to Know 2026',
    description: 'Comparing free tenancy agreement templates vs professionally drafted ASTs. What free templates miss and when paid is worth it.',
    type: 'article',
    url: getCanonicalUrl('/tenancy-agreement-template-free'),
  },
};

const faqs = [
  {
    question: 'Are free tenancy agreement templates legally valid?',
    answer: 'A free tenancy agreement can be legally binding if it contains the essential elements: identification of parties, property details, tenancy term, rent amount, and signatures. However, legal validity and being "fit for purpose" are different things. Free templates often lack critical clauses for deposit protection compliance, rent review mechanisms, and proper termination provisions that leave landlords vulnerable when disputes arise or eviction becomes necessary.',
  },
  {
    question: 'What do free tenancy agreement templates typically miss?',
    answer: 'Common omissions in free templates include: (1) Tenant Fees Act 2019 compliant deposit clauses, (2) Section 21-compatible prescribed information, (3) Break clause provisions that don\'t invalidate eviction rights, (4) Joint and several liability clauses for multiple tenants, (5) Proper rent review mechanisms under Section 13, (6) HMO-specific terms, (7) Garden and exterior maintenance obligations, (8) Utility transfer requirements, (9) Insurance and liability provisions, and (10) Access for repairs and inspection clauses.',
  },
  {
    question: 'Can I serve a Section 21 notice with a free template AST?',
    answer: 'Technically yes, but many Section 21 notices fail because of defects in the underlying tenancy agreement. Free templates often omit prescribed deposit information or contain clauses that inadvertently waive eviction rights. Our templates are specifically drafted to maintain Section 21 validity, with break clauses, deposit terms, and notice provisions that comply with Deregulation Act 2015 requirements.',
  },
  {
    question: 'Why would I pay £14.99 when free templates exist?',
    answer: 'Consider the cost of problems: a deposit dispute can cost £500-2,000 in adjudication time and potential losses; a failed Section 21 can add months to eviction and cost thousands in lost rent; unclear terms lead to expensive disputes. For £14.99, you get a template drafted for legal compliance, validated deposit terms, proper eviction pathway preservation, and clauses that actually protect you when things go wrong. The £14.99 pays for itself many times over.',
  },
  {
    question: 'Do free templates work for HMOs or multiple tenants?',
    answer: 'Free templates rarely handle HMOs properly. Multi-tenant properties need specific clauses for: joint and several liability (so each tenant is responsible for full rent), shared area responsibilities, individual room allocation, separate deposit handling, and compliance with HMO licensing requirements. Our Premium AST (£24.99) includes all HMO-specific provisions.',
  },
  {
    question: 'What happens if my free template is out of date?',
    answer: 'Tenancy law changes frequently. The Tenant Fees Act 2019 fundamentally changed deposit rules. The Deregulation Act 2015 added Section 21 requirements. EICR regulations came in 2020. Free templates from government sites or legal forums are often years out of date. Our templates are reviewed quarterly and updated whenever legislation changes.',
  },
  {
    question: 'Can I modify a free template to add missing clauses?',
    answer: 'You can, but this is where landlords get into trouble. Adding clauses without legal expertise can create contradictions, unfair terms, or unenforceable provisions. For example, a poorly drafted break clause can prevent you serving Section 21 at the right time. Our wizard asks the right questions and generates professionally drafted clauses that work together without conflicts.',
  },
  {
    question: 'Are government tenancy agreement templates free?',
    answer: 'The UK government does not provide official tenancy agreement templates for ASTs. The "model agreement" published by the Ministry of Housing, Communities and Local Government is a guide to terms, not a ready-to-use template. It requires significant customisation and doesn\'t include deposit protection terms, break clauses, or jurisdiction-specific provisions.',
  },
  {
    question: 'What if my tenant disputes terms in a free template?',
    answer: 'Free templates often contain generic or ambiguous terms that tenants (or their solicitors) can challenge. In deposit disputes, adjudicators scrutinise the agreement terms carefully. Unclear obligations around cleaning, garden maintenance, or "reasonable wear and tear" frequently result in landlords losing deductions they should have been entitled to. Professional templates use precise, tested language.',
  },
  {
    question: 'Should I get a solicitor to review a free template instead?',
    answer: 'A solicitor review typically costs £150-400 per agreement. They may recommend substantial changes that the free template didn\'t anticipate. For £14.99-14.99, our templates are already drafted to professional standards, validated against current legislation, and include all the clauses a solicitor would recommend. It\'s significantly more cost-effective.',
  },
  {
    question: 'Do free templates include inventory provisions?',
    answer: 'Most free templates mention inventories briefly but don\'t include proper provisions for check-in/check-out procedures, photographic evidence requirements, or the legal implications of not having an inventory. Our Premium AST includes comprehensive inventory sections that support deposit deduction claims if damage occurs.',
  },
  {
    question: 'How do I know if a free template is legitimate?',
    answer: 'Be cautious of templates from: generic document sites (often US-based or outdated UK), forums where users share modified versions, sites that collect email addresses for marketing. Legitimate sources include (with caveats): the government\'s model agreement (requires customisation), major letting agent associations (often behind membership paywalls). The safest approach is a purpose-built service like ours.',
  },
];

export default function TenancyAgreementTemplateFreeComparisonPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Free Tenancy Agreement Template UK vs Paid: What You Need to Know',
          description: 'Comparing free tenancy agreement templates vs professionally drafted ASTs.',
          url: getCanonicalUrl('/tenancy-agreement-template-free'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-25',
        })}
      />
      <StructuredData data={faqPageSchema(faqs)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/tenancy-agreements' },
          { name: 'Free vs Paid Templates', url: 'https://landlordheaven.co.uk/tenancy-agreement-template-free' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
        {/* Breadcrumb Navigation */}
        <div className="container mx-auto px-4 pt-24 pb-4">
          <nav className="text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/tenancy-agreements" className="hover:text-blue-600">Tenancy Agreements</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Free vs Paid</span>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Comparison Guide
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Free Tenancy Agreement Templates vs Paid: An Honest Comparison
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Searching for a <strong>free tenancy agreement template</strong>? Understand what free options
              actually offer, what they miss, and when investing £14.99 in a professional template
              could save you thousands in disputes and failed evictions.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Free vs Paid: Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-xl shadow-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Feature</th>
                    <th className="px-6 py-4 text-center font-semibold">Free Templates</th>
                    <th className="px-6 py-4 text-center font-semibold bg-amber-600">Landlord Heaven</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium">Basic tenancy terms</td>
                    <td className="px-6 py-4 text-center text-green-600">Yes</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Yes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Tenant Fees Act 2019 deposit validation</td>
                    <td className="px-6 py-4 text-center text-red-600">Rarely</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Yes - Automatic</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Section 21 compatible clauses</td>
                    <td className="px-6 py-4 text-center text-red-600">Often missing</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Yes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Break clause provisions</td>
                    <td className="px-6 py-4 text-center text-amber-600">Basic or none</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Fully compliant</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">HMO-specific clauses</td>
                    <td className="px-6 py-4 text-center text-red-600">No</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Premium: Yes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Joint and several liability</td>
                    <td className="px-6 py-4 text-center text-amber-600">Sometimes</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Inventory sections</td>
                    <td className="px-6 py-4 text-center text-red-600">Rarely</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Premium: Yes</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Updated for current legislation</td>
                    <td className="px-6 py-4 text-center text-red-600">Often outdated</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Quarterly updates</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Jurisdiction-specific (England/Wales/Scotland/NI)</td>
                    <td className="px-6 py-4 text-center text-red-600">Generic UK</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Jurisdiction-specific</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 font-medium">Intelligent wizard guidance</td>
                    <td className="px-6 py-4 text-center text-red-600">No</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Yes</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">Professional PDF formatting</td>
                    <td className="px-6 py-4 text-center text-amber-600">Variable</td>
                    <td className="px-6 py-4 text-center text-green-600 bg-amber-50">Court-ready</td>
                  </tr>
                  <tr className="bg-gray-100 font-semibold">
                    <td className="px-6 py-4">Price</td>
                    <td className="px-6 py-4 text-center">£0 (+ hidden risks)</td>
                    <td className="px-6 py-4 text-center bg-amber-100 text-amber-800">From £14.99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Risk Calculation */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The True Cost of &ldquo;Free&rdquo;</h2>
            <p className="text-gray-700 mb-8">
              Free templates aren&apos;t actually free when problems arise. Here&apos;s what defective agreements can cost:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-xl font-semibold text-red-900 mb-3">Failed Section 21 Notice</h3>
                <p className="text-red-800 mb-2">Missing prescribed information or non-compliant clauses</p>
                <div className="text-3xl font-bold text-red-600">£3,000 - £8,000+</div>
                <p className="text-sm text-red-700 mt-2">6+ months additional rent loss, re-serving costs, court delays</p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-xl font-semibold text-red-900 mb-3">Lost Deposit Dispute</h3>
                <p className="text-red-800 mb-2">Unclear obligations, no inventory provisions</p>
                <div className="text-3xl font-bold text-red-600">£500 - £2,500</div>
                <p className="text-sm text-red-700 mt-2">Deductions rejected at adjudication</p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-xl font-semibold text-red-900 mb-3">Rent Arrears Without Recovery Route</h3>
                <p className="text-red-800 mb-2">No joint/several liability, unclear payment terms</p>
                <div className="text-3xl font-bold text-red-600">£1,000 - £5,000</div>
                <p className="text-sm text-red-700 mt-2">Unable to pursue departed tenant</p>
              </div>
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-xl font-semibold text-red-900 mb-3">Tenant Fees Act Breach</h3>
                <p className="text-red-800 mb-2">Deposit over legal limit, prohibited fees</p>
                <div className="text-3xl font-bold text-red-600">£500 - £5,000</div>
                <p className="text-sm text-red-700 mt-2">Local authority fines, Section 21 invalid</p>
              </div>
            </div>
            <div className="mt-8 bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-xl font-semibold text-green-900 mb-2">Professional AST Template</h3>
              <p className="text-green-800 mb-2">All compliance built-in, eviction pathway preserved</p>
              <div className="text-3xl font-bold text-green-600">£14.99 - £14.99</div>
              <p className="text-sm text-green-700 mt-2">One-time cost, peace of mind, legal protection</p>
            </div>
          </div>
        </section>

        {/* When Free Might Work */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">When a Free Template Might Be Acceptable</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>
                To be fair, there are limited situations where a basic free template could work:
              </p>
              <ul>
                <li>
                  <strong>Very short lettings to trusted contacts</strong> — If you&apos;re renting a room to a
                  family friend for 3 months while they find permanent accommodation, and you have no intention
                  of using formal eviction or deposit dispute processes.
                </li>
                <li>
                  <strong>Experienced landlords who can customise thoroughly</strong> — If you have legal training
                  or extensive letting experience and can identify and add all necessary clauses yourself.
                </li>
                <li>
                  <strong>Properties you can afford to have problems with</strong> — If the potential financial
                  losses from disputes don&apos;t concern you.
                </li>
              </ul>
              <p>
                For most landlords — especially those new to letting, with higher-value properties, or
                dealing with tenants they don&apos;t personally know — a professional template is worth the
                modest investment.
              </p>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="section"
          jurisdiction="england"
          title="Protect Your Investment for £14.99"
          description="Get a professionally drafted AST that preserves your eviction rights and protects your deposit claims."
        />

        {/* What Makes Ours Different */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What Sets Our Templates Apart</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Intelligent Wizard</h3>
                <p className="text-gray-600">
                  Our wizard asks questions in plain English and only shows relevant sections.
                  It explains legal requirements as you go, so you understand what you&apos;re agreeing to.
                  No legal expertise required.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Automatic Validation</h3>
                <p className="text-gray-600">
                  We validate your deposit against Tenant Fees Act limits, check for common
                  compliance issues, and warn you before problems are baked into your agreement.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Jurisdiction-Specific</h3>
                <p className="text-gray-600">
                  Not a generic &ldquo;UK&rdquo; template. We generate the correct agreement type for
                  England (AST), Wales (Occupation Contract), Scotland (PRT), or Northern Ireland
                  (Private Tenancy) based on your property location.
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Eviction-Ready</h3>
                <p className="text-gray-600">
                  If you later need to evict, your AST information flows directly into our eviction
                  products. No re-entering data, no inconsistencies between documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <SeoCtaBlock
          pageType="tenancy"
          variant="final"
          jurisdiction="england"
        />

        {/* Related Links */}
        <section className="container mx-auto px-4 py-12">
          <RelatedLinks
            title="Related Resources"
            links={tenancyAgreementEnglandLinks}
          />
        </section>

        {/* Disclaimer */}
        <SeoDisclaimer className="max-w-4xl mx-auto px-4 pb-12" />
      </main>
    </>
  );
}
