import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { fixedTermPeriodicWalesRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { fixedTermPeriodicWalesFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Calendar,
  RefreshCw,
  XCircle,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/fixed-term-periodic-occupation-contract-wales';
const PAGE_TITLE = 'Fixed Term vs Periodic Occupation Contract Wales';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'wales',
  src: 'guide',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'wales',
  src: 'guide',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Fixed Term vs Periodic Occupation Contract Wales | Which to Choose',
  description:
    'Fixed-term vs periodic occupation contracts in Wales. Which contract type suits your letting under the Renting Homes Act 2016.',
  keywords: [
    'fixed term occupation contract wales',
    'periodic occupation contract wales',
    'fixed term vs periodic wales',
    'welsh tenancy types',
    'occupation contract duration',
    'renting homes act fixed term',
    'wales rental contract types',
    'contract holder agreement types',
    'rolling occupation contract wales',
    'tenancy duration wales',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/fixed-term-periodic-occupation-contract-wales',
  },
  openGraph: {
    title: 'Fixed Term vs Periodic Occupation Contract Wales | Landlord Heaven',
    description:
      'Choose between fixed-term and periodic occupation contracts for your Welsh property. Expert guidance on contract duration.',
    type: 'website',
  },
};

export default function FixedTermPeriodicOccupationContractWalesPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Fixed Term vs Periodic Occupation Contract Wales',
    description:
      'Understand the difference between fixed-term and periodic occupation contracts in Wales under the Renting Homes (Wales) Act 2016.',
    url: 'https://landlordheaven.co.uk/fixed-term-periodic-occupation-contract-wales',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Fixed Term vs Periodic Wales',
            url: 'https://landlordheaven.co.uk/fixed-term-periodic-occupation-contract-wales',
          },
        ])}
      />

      {/* Analytics: Attribution + landing_view event */}
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="wales"
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Wales Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Fixed Term vs Periodic Occupation Contract"
          subtitle={
            <>
              Understand which <strong>contract duration</strong> is right for your Welsh
              letting. Learn how fixed-term and periodic contracts work under the Renting
              Homes (Wales) Act 2016 and what happens when terms end.
            </>
          }
          primaryCTA={{
            label: `Create Occupation Contract — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Contract with Break Clause',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Renting Homes Act 2016 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Fixed Term or Periodic Options
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in Minutes
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Understanding Contract Duration Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Understanding Occupation Contract Duration in Wales
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The Renting Homes (Wales) Act 2016 allows for both fixed-term and periodic
                occupation contracts, similar to England but with important differences.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  When creating an occupation contract in Wales, one of your key decisions is
                  whether to use a <strong>fixed-term</strong> or <strong>periodic</strong>
                  contract. Each has advantages and disadvantages depending on your situation.
                </p>
                <p>
                  A <strong>fixed-term occupation contract</strong> runs for a set period with
                  a specific start and end date. Common terms are 6 months or 12 months, though
                  any length is possible. During the fixed term, neither party can normally end
                  the contract early unless there is a break clause or grounds for possession.
                </p>
                <p>
                  A <strong>periodic occupation contract</strong> runs continuously without a
                  fixed end date, usually on a monthly basis. Either party can end it by giving
                  the required notice. For landlords, this means serving a Section 173 notice
                  with at least six months&apos; notice.
                </p>
                <p>
                  Importantly, you cannot serve a Section 173 no-fault notice until at least
                  six months after the occupation date, regardless of whether the contract is
                  fixed-term or periodic. This creates a de facto minimum term in Wales even
                  for periodic contracts.
                </p>
                <ul>
                  <li>
                    <strong>Fixed-term contracts</strong> provide certainty for both parties —
                    the contract-holder knows they can stay, and you know you have rental income
                    for the agreed period.
                  </li>
                  <li>
                    <strong>Periodic contracts</strong> offer more flexibility — you can serve
                    notice when needed (subject to the six-month minimum) rather than waiting
                    for a fixed term to end.
                  </li>
                  <li>
                    <strong>Automatic conversion:</strong> When a fixed-term contract ends
                    and the contract-holder stays, it automatically becomes a periodic contract
                    on the same terms.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Fixed Term vs Periodic Comparison */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Fixed Term vs Periodic: Quick Comparison
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the contract type that best fits your letting situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Fixed Term Contract</h3>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Set duration (e.g., 6 or 12 months)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Guaranteed rental income for the term</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Contract-holder cannot leave early without agreement</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>You cannot end early without grounds</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Can include break clause for flexibility</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500 italic">
                    Best for: Landlords wanting income certainty and contract-holders wanting
                    security of tenure.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Periodic Contract</h3>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rolls on month-to-month</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Can serve Section 173 at any time (6 months notice)</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>More flexibility for both parties</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Contract-holder can leave with 4 weeks notice</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Less income certainty for landlord</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500 italic">
                    Best for: Short-term lets, uncertain situations, or when flexibility is
                    more important than security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Warning Section */}
        <section className="py-12 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900 mb-2">
                    Six Month Minimum Notice in Wales
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Unlike England where Section 21 requires only 2 months notice, Wales requires
                    a minimum of 6 months notice for no-fault possession regardless of contract type.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h3 className="font-semibold text-amber-900 mb-2">Key Points to Remember</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>Section 173 notice requires minimum 6 months notice</li>
                      <li>Cannot serve Section 173 until 6 months after occupation date</li>
                      <li>The notice cannot expire before any fixed term ends</li>
                      <li>Even for periodic contracts, you need 6 months notice</li>
                      <li>No written statement = no valid Section 173</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Happens When Fixed Term Ends */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Happens When a Fixed Term Ends?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the automatic conversion to periodic contracts.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  When a fixed-term occupation contract ends and the contract-holder remains
                  in the property with your consent, the contract automatically becomes a
                  <strong>periodic standard contract</strong>. This happens by operation of
                  law — you do not need to create a new agreement.
                </p>

                <h3>The Transition Process</h3>
                <p>
                  The periodic contract that arises is on the same terms as the original
                  fixed-term contract. The rent, responsibilities, and additional terms all
                  continue unless you agree changes with the contract-holder.
                </p>
                <p>
                  You do not need to provide a new written statement unless terms change.
                  However, if you want to vary terms (such as rent), you must follow the
                  statutory procedure and provide updated documentation.
                </p>

                <h3>Ending the Periodic Contract</h3>
                <p>
                  Once the contract becomes periodic, you can serve a Section 173 notice at
                  any time (assuming you have provided a valid written statement). The notice
                  must give at least 6 months&apos; notice and cannot expire before the minimum
                  occupation period of 6 months has passed from the original occupation date.
                </p>
                <p>
                  The contract-holder can end the periodic contract by giving at least 4
                  weeks&apos; notice in writing. Their notice must expire at the end of a
                  rental period.
                </p>

                <h3>Options at the End of a Fixed Term</h3>
                <ul>
                  <li>
                    <strong>Let it become periodic:</strong> The simplest option — the contract
                    continues on rolling terms. Good if you are happy for the contract-holder
                    to stay indefinitely.
                  </li>
                  <li>
                    <strong>Grant a new fixed term:</strong> Create a new occupation contract
                    with a new fixed period. Useful if you want to update terms or the
                    contract-holder wants continued security.
                  </li>
                  <li>
                    <strong>Serve notice before term ends:</strong> You can serve a Section 173
                    notice during the fixed term, but it cannot take effect until the term ends
                    and the 6-month notice period has passed.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="wales"
                title="Create Your Occupation Contract"
                description="Whether fixed-term or periodic, our Welsh occupation contracts are fully compliant with the Renting Homes Act 2016 and ready in minutes."
              />
            </div>
          </div>
        </section>

        {/* Break Clauses Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Break Clauses in Welsh Occupation Contracts
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Adding flexibility to fixed-term contracts without losing security.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>break clause</strong> allows either party to end a fixed-term
                  contract early by giving a specified amount of notice. This combines the
                  security of a fixed term with the flexibility of a periodic contract.
                </p>

                <h3>How Break Clauses Work</h3>
                <p>
                  A typical break clause might allow either party to end a 12-month contract
                  after 6 months by giving 2 months&apos; notice. The clause specifies when it
                  can be activated and how much notice is required.
                </p>
                <p>
                  In Wales, even with a break clause, the landlord&apos;s notice must comply
                  with statutory requirements. You still need to serve a Section 173 notice,
                  and the minimum 6-month notice period applies. The break clause cannot
                  override these statutory minimums.
                </p>

                <h3>Benefits of Including a Break Clause</h3>
                <ul>
                  <li>
                    <strong>For landlords:</strong> If circumstances change (e.g., you need
                    to sell or move back in), you have an exit option during the fixed term.
                  </li>
                  <li>
                    <strong>For contract-holders:</strong> They can leave early if their
                    situation changes (e.g., job relocation) without breaking the contract.
                  </li>
                  <li>
                    <strong>Balance:</strong> Both parties get some security from the fixed
                    term while retaining flexibility for genuine changes.
                  </li>
                </ul>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Premium occupation contracts</strong> from Landlord Heaven include
                  break clause options that comply with Welsh law and provide flexibility
                  while maintaining your rights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Standard vs Premium Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium Occupation Contract
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the contract that fits your needs.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Contract</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Complete occupation contract for fixed-term or periodic lettings.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Fixed-term or periodic options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>All fundamental terms included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Written statement format</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deposit protection clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Renting Homes Act compliant</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkStandard}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Standard Contract
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-primary shadow-lg relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-sm px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Contract</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_premium.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Enhanced contract with break clause and additional protections.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Everything in Standard</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Break clause options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Guarantor agreement included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Pet policy clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Garden and parking terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Professional cleaning requirements</span>
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkPremium}
                    className="block w-full text-center bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Create Premium Contract
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wales vs England Comparison */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Wales vs England: Key Differences
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How fixed-term and periodic contracts differ between Wales and England.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Aspect</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Wales</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">England</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-gray-600">No-fault notice period</td>
                      <td className="px-4 py-3 text-gray-600">6 months (Section 173)</td>
                      <td className="px-4 py-3 text-gray-600">2 months (Section 21)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-600">Minimum before serving notice</td>
                      <td className="px-4 py-3 text-gray-600">6 months from occupation date</td>
                      <td className="px-4 py-3 text-gray-600">4 months from tenancy start</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-600">Written statement required</td>
                      <td className="px-4 py-3 text-gray-600">Yes, within 14 days</td>
                      <td className="px-4 py-3 text-gray-600">Not specifically required</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-600">Automatic conversion</td>
                      <td className="px-4 py-3 text-gray-600">Yes, to periodic contract</td>
                      <td className="px-4 py-3 text-gray-600">Yes, to periodic tenancy</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-600">Landlord registration</td>
                      <td className="px-4 py-3 text-gray-600">Rent Smart Wales required</td>
                      <td className="px-4 py-3 text-gray-600">No registration required</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <Link
                  href="/standard-occupation-contract-wales"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about Welsh occupation contracts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={fixedTermPeriodicWalesFAQs}
          title="Fixed Term vs Periodic FAQ"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="wales"
                title="Create Your Welsh Occupation Contract"
                description="Fixed-term or periodic. Break clause options. Renting Homes Act compliant. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={fixedTermPeriodicWalesRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
