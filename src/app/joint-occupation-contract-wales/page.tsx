import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { jointOccupationContractRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { jointOccupationContractFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  UserPlus,
  UserMinus,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/joint-occupation-contract-wales';
const PAGE_TITLE = 'Joint Occupation Contract Wales';
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
  title: 'Joint Occupation Contract Wales | Multiple Contract-Holders',
  description:
    'Create a joint occupation contract for multiple contract-holders in Wales. Joint and several liability, adding/removing holders under Welsh law.',
  keywords: [
    'joint occupation contract wales',
    'joint tenancy wales',
    'multiple contract holders wales',
    'joint and several liability wales',
    'shared house agreement wales',
    'hmo occupation contract wales',
    'welsh joint tenancy',
    'adding contract holder wales',
    'joint rental agreement wales',
    'shared letting wales',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/joint-occupation-contract-wales',
  },
  openGraph: {
    title: 'Joint Occupation Contract Wales | Landlord Heaven',
    description:
      'Create a valid joint occupation contract for multiple contract-holders in Wales. Full compliance with Renting Homes Act 2016.',
    type: 'website',
  },
};

export default function JointOccupationContractWalesPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Joint Occupation Contract Wales',
    description:
      'Create a joint occupation contract for multiple contract-holders in Wales under the Renting Homes (Wales) Act 2016.',
    url: 'https://landlordheaven.co.uk/joint-occupation-contract-wales',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Joint Occupation Contract Wales',
            url: 'https://landlordheaven.co.uk/joint-occupation-contract-wales',
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
          title="Joint Occupation Contract Wales"
          subtitle={
            <>
              Create an occupation contract for <strong>multiple contract-holders</strong> in
              Wales. Establish joint and several liability, understand adding and removing
              holders, and comply with the Renting Homes (Wales) Act 2016.
            </>
          }
          primaryCTA={{
            label: `Create Joint Contract — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Contract with Extra Protection',
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
              Joint and Several Liability
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

        {/* What is a Joint Occupation Contract Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Joint Occupation Contract?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding how joint contracts work under Welsh law when letting to
                multiple people.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>joint occupation contract</strong> is created when two or more
                  people become contract-holders under the same agreement. All joint
                  contract-holders have equal rights to occupy the whole property and are
                  collectively responsible for all obligations under the contract.
                </p>
                <p>
                  Under the Renting Homes (Wales) Act 2016, joint contract-holders are subject
                  to <strong>joint and several liability</strong>. This means each person is
                  individually responsible for the entire rent, not just their share. If one
                  contract-holder stops paying, you can pursue any or all of the others for
                  the full amount owed.
                </p>
                <p>
                  Joint occupation contracts are common for couples, friends sharing a property,
                  or professional house sharers. They differ from HMO arrangements where each
                  occupier might have a separate contract for their room.
                </p>
                <p>
                  The written statement for a joint contract must name all contract-holders and
                  clearly establish that they are jointly and severally liable. Each
                  contract-holder should receive a copy of the written statement within 14 days
                  of the occupation date.
                </p>
                <ul>
                  <li>
                    <strong>Equal rights:</strong> All joint contract-holders have the same
                    rights to occupy the whole property. No one has exclusive rights to a
                    particular room unless separately agreed.
                  </li>
                  <li>
                    <strong>Full liability:</strong> Each person is liable for 100% of the
                    rent and other obligations. You can choose which contract-holder(s) to
                    pursue for arrears.
                  </li>
                  <li>
                    <strong>Deposit protection:</strong> The deposit is held for all joint
                    contract-holders collectively. Disputes are handled through the usual
                    deposit scheme process.
                  </li>
                  <li>
                    <strong>Ending the contract:</strong> Special rules apply when one joint
                    contract-holder wants to leave — the Renting Homes Act provides specific
                    procedures.
                  </li>
                </ul>
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
                    Joint and Several Liability Must Be Clear
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Without clear joint and several liability in your contract, you may struggle
                    to recover the full rent if one contract-holder defaults.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">What to Include</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>All contract-holder names listed</li>
                        <li>Clear joint and several liability clause</li>
                        <li>Explanation that each is liable for full rent</li>
                        <li>Procedure for one holder leaving</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Without It</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>May only recover proportionate shares</li>
                        <li>Disputes over who owes what</li>
                        <li>Difficulty if one person leaves</li>
                        <li>Weaker position in court</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Joint and Several Liability Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Understanding Joint and Several Liability
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Why this clause is essential protection for landlords letting to multiple
                contract-holders.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">How It Works</h3>
                  <p className="text-gray-600 text-sm">
                    Joint and several liability means each contract-holder is individually
                    responsible for the entire rent amount, not just their share. If you have
                    three contract-holders paying £1,500 total, each is liable for £1,500,
                    not £500.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Why It Matters</h3>
                  <p className="text-gray-600 text-sm">
                    If one contract-holder loses their job or leaves, you can pursue the
                    remaining holders for the full rent. Without this clause, you might only
                    recover each person&apos;s individual share, leaving you short.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">In the Written Statement</h3>
                  <p className="text-gray-600 text-sm">
                    Your written statement should clearly state that all named contract-holders
                    are jointly and severally liable for all rent and other obligations. This
                    should be prominent and unambiguous.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Court Enforcement</h3>
                  <p className="text-gray-600 text-sm">
                    With proper joint and several liability, you can obtain a CCJ against
                    any or all contract-holders for the full debt. You choose who to pursue
                    based on who is most likely to pay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Adding and Removing Contract-Holders Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Adding and Removing Joint Contract-Holders
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                How the Renting Homes Act handles changes to who is on the contract.
              </p>

              <div className="space-y-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserPlus className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Adding a Contract-Holder</h3>
                      <p className="text-gray-600 mb-4">
                        Under the Renting Homes Act, a contract-holder can request to add a
                        person to the contract as a joint contract-holder. You should not
                        unreasonably refuse this request.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Request should be in writing</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>You can conduct reasonable checks on the new person</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Create a new or varied contract including the new holder</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Provide updated written statement within 14 days</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UserMinus className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">One Contract-Holder Leaving</h3>
                      <p className="text-gray-600 mb-4">
                        The Renting Homes Act has specific rules about what happens when one
                        joint contract-holder wants to leave. Unlike in England, one person
                        giving notice does not automatically end the contract for everyone.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>The leaving holder can give notice to end their part only</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Remaining holders can continue if you agree</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Consider financial viability with fewer holders</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>Update the written statement to remove their name</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Important:</strong> Under the Renting Homes Act, one joint
                  contract-holder giving notice does not automatically end the contract for
                  all joint holders — a key difference from England. The remaining holders
                  can continue the contract if you agree.
                </p>
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
                title="Create Your Joint Occupation Contract"
                description="Our Welsh joint contracts include clear joint and several liability, comply with the Renting Homes Act, and protect you when letting to multiple contract-holders."
              />
            </div>
          </div>
        </section>

        {/* Succession Rights Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Succession Rights in Joint Contracts
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding what happens if a joint contract-holder dies.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  The Renting Homes (Wales) Act 2016 provides specific <strong>succession
                  rights</strong> that allow certain people to take over an occupation contract
                  when a contract-holder dies. This applies to both sole and joint contracts.
                </p>

                <h3>Priority Successors</h3>
                <p>
                  A surviving spouse, civil partner, or cohabitee has the right to succeed to
                  the contract if they were living at the property as their only or principal
                  home. They become the contract-holder automatically.
                </p>

                <h3>Reserve Successors</h3>
                <p>
                  If there is no priority successor, a reserve successor (usually a family
                  member who was living at the property) may be entitled to succeed. This is
                  subject to specific conditions in the Act.
                </p>

                <h3>Joint Contract-Holders</h3>
                <p>
                  When one joint contract-holder dies, the surviving joint contract-holders
                  continue the contract. The deceased person&apos;s interest ends automatically.
                  Succession rights then apply when the last surviving contract-holder dies.
                </p>

                <h3>Implications for Landlords</h3>
                <p>
                  You should be aware that succession can mean someone you have not chosen
                  becomes your contract-holder. However, you can serve notice to end the
                  contract after succession using the normal procedures.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/wales-eviction-notices"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn about Wales eviction notices
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Standard vs Premium Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium Joint Contract
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the right level of protection for letting to multiple contract-holders.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Contract</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    Complete joint occupation contract with all essential terms for multiple
                    contract-holders.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Joint and several liability clause</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>All fundamental terms included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Deposit protection clauses</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Written statement format</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Space for multiple names</span>
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
                    Enhanced protection for complex joint lettings with additional clauses.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Everything in Standard</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Guarantor agreement included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Detailed shared area responsibilities</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Break clause options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Professional cleaning clause</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Pet policy clauses</span>
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

        {/* HMO Considerations Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Joint Contracts vs HMO Arrangements
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choosing the right structure for your shared property.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  If you are letting to multiple unrelated people, you may need to consider
                  whether a joint occupation contract or separate individual contracts are
                  more appropriate. This decision affects both your legal obligations and
                  the contract-holders&apos; rights.
                </p>

                <h3>Joint Contract</h3>
                <p>
                  A joint contract with joint and several liability is typically better when:
                </p>
                <ul>
                  <li>The occupiers know each other (couples, friends, family)</li>
                  <li>They want to share responsibility for the whole property</li>
                  <li>You want the security of pursuing any occupier for full rent</li>
                  <li>The property is a single dwelling, not an HMO</li>
                </ul>

                <h3>Individual Contracts (HMO)</h3>
                <p>
                  If your property is an HMO (House in Multiple Occupation), you may be
                  required to or choose to give each occupier their own contract for their
                  room. This is common when:
                </p>
                <ul>
                  <li>Occupiers do not know each other</li>
                  <li>There is frequent turnover of individual occupiers</li>
                  <li>You need HMO licensing (check local rules)</li>
                  <li>Each person rents a specific room with shared facilities</li>
                </ul>

                <h3>HMO Licensing in Wales</h3>
                <p>
                  Wales has mandatory HMO licensing requirements. You must check whether your
                  property requires a license and ensure you comply with additional HMO
                  regulations. Rent Smart Wales registration is also required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={jointOccupationContractFAQs}
          title="Joint Occupation Contract FAQ"
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
                title="Create Your Joint Welsh Contract Today"
                description="Joint and several liability. Renting Homes Act compliant. Written statement included. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={jointOccupationContractRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
