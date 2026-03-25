import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { fixedTermPeriodicWalesRelatedLinks } from '@/lib/seo/internal-links';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
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

const astProductHref = '/products/ast';

export const metadata: Metadata = {
  title: 'Fixed Term vs Periodic Occupation Contract Wales | Which to Choose in 2026',
  description:
    'Compare fixed-term and periodic occupation contracts in Wales.',
  keywords: [
    'fixed term occupation contract wales',
    'periodic occupation contract wales',
    'fixed term vs periodic occupation contract wales',
    'standard occupation contract wales fixed term',
    'rolling occupation contract wales',
    'wales tenancy contract duration',
    'section 173 fixed term wales',
    'what happens when fixed term ends wales',
    'break clause occupation contract wales',
    'renting homes act 2016 contract duration',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/fixed-term-periodic-occupation-contract-wales',
  },
  openGraph: {
    title: 'Fixed Term vs Periodic Occupation Contract Wales | Which to Choose in 2026',
    description:
      'Compare fixed-term and periodic occupation contracts in Wales, including notice rules, automatic conversion and break clause considerations.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/fixed-term-periodic-occupation-contract-wales',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fixed Term vs Periodic Occupation Contract Wales | Which to Choose in 2026',
    description:
      'Compare fixed-term and periodic occupation contracts in Wales, including Section 173 notice timing and break clause guidance.',
  },
};

const faqs = [
  {
    question: 'What is the difference between a fixed-term and periodic occupation contract in Wales?',
    answer:
      'A fixed-term occupation contract runs for a set period, such as 6 or 12 months. A periodic occupation contract rolls on without a fixed end date, usually month to month. In Wales, both contract types sit under the Renting Homes (Wales) Act 2016, but the timing and practical use of possession notices still matter.',
  },
  {
    question: 'Does a fixed-term occupation contract automatically become periodic in Wales?',
    answer:
      'Yes. If the contract-holder stays in occupation after the fixed term ends, the contract normally becomes a periodic standard occupation contract automatically on substantially the same terms.',
  },
  {
    question: 'Can I serve a Section 173 notice during a fixed term in Wales?',
    answer:
      'You can serve a Section 173 notice during a fixed term if the legal requirements are met, but it cannot end the contract before the fixed term ends and the statutory notice conditions are satisfied. In practice, the timing needs to be checked carefully.',
  },
  {
    question: 'How much notice is required for a periodic occupation contract in Wales?',
    answer:
      'For a landlord using the no-fault Section 173 route, the notice period is usually at least 6 months, and there are also restrictions on when that notice can be served. Contract-holders usually give at least 4 weeks notice, depending on the contract terms and rental period structure.',
  },
  {
    question: 'Should I choose fixed-term or periodic for my Welsh letting?',
    answer:
      'A fixed-term contract usually suits landlords who want clearer income certainty and contract-holders who want a defined minimum stay. A periodic contract may suit situations where flexibility matters more. The right option depends on your letting strategy, property type and appetite for change.',
  },
  {
    question: 'Can a Welsh fixed-term contract include a break clause?',
    answer:
      'Yes. A break clause can add flexibility to a fixed-term occupation contract, but it should be drafted carefully and does not remove the need to comply with Welsh statutory notice rules.',
  },
];

export default function FixedTermPeriodicOccupationContractWalesPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Fixed Term vs Periodic Occupation Contract Wales',
    description:
      'Compare fixed-term and periodic occupation contracts in Wales under the Renting Homes (Wales) Act 2016.',
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

      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="wales"
      />

      <HeaderConfig mode="autoOnScroll" />

      <main className="text-gray-900">
        <UniversalHero
          badge="Wales Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Fixed Term vs Periodic Occupation Contract Wales"
          subtitle={
            <>
              Compare <strong>fixed-term</strong> and <strong>periodic occupation contracts</strong>{' '}
              in Wales, understand what happens when a fixed term ends, and decide which contract
              duration suits your letting under the <strong>Renting Homes (Wales) Act 2016</strong>.
            </>
          }
          primaryCta={{
            label: `Create Standard Contract — ${PRODUCTS.ast_standard.displayPrice}`,
            href: astProductHref,
          }}
          secondaryCta={{
            label: `Create Premium Contract — ${PRODUCTS.ast_premium.displayPrice}`,
            href: astProductHref,
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Renting Homes (Wales) Act 2016 compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Fixed-term or periodic options
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in minutes
            </span>
          </div>
        </UniversalHero>

        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoPageContextPanel pathname="/fixed-term-periodic-occupation-contract-wales" />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What is the difference between fixed-term and periodic in Wales?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                Welsh landlords can use either a fixed-term or periodic occupation contract, but
                the practical differences matter for notice timing, income certainty and flexibility.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  A <strong>fixed-term occupation contract</strong> runs for a set period, such as
                  6 months or 12 months. It gives both parties a defined timeframe and is often used
                  where the landlord wants more income certainty and the contract-holder wants a more
                  predictable minimum stay.
                </p>

                <p>
                  A <strong>periodic occupation contract</strong> has no fixed end date. It rolls on,
                  usually month to month, until one party brings it to an end using the correct legal
                  process. This structure can suit situations where flexibility matters more than a
                  defined term.
                </p>

                <p>
                  In Wales, both contract types operate under the <strong>Renting Homes (Wales) Act 2016</strong>.
                  That means landlords still need to think carefully about the written statement,
                  Section 173 notice timing and what happens when a fixed term comes to an end.
                </p>

                <p>
                  Many landlords assume a periodic contract gives immediate flexibility. In practice,
                  Welsh no-fault possession rules are still much stricter than in England, so the
                  contract structure should be chosen with the wider legal framework in mind.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Fixed Term vs Periodic: quick comparison
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Use this side-by-side comparison to decide which contract duration is better for your
                Welsh property.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Fixed-Term Contract</h3>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Set duration, such as 6 or 12 months</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>More certainty over rent for the agreed period</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Useful where both sides want a clearer minimum commitment</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Less flexible if circumstances change during the term</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Can include a break clause if drafted properly</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500 italic">
                    Best for landlords wanting more certainty and contract-holders wanting a defined term.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm text-gray-900">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Periodic Contract</h3>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Rolls on without a fixed end date</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>More adaptable where plans may change</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Often the default result when a fixed term ends and occupation continues</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Less certainty over how long the arrangement will continue</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Landlords still need to navigate Welsh statutory notice rules carefully</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500 italic">
                    Best for situations where flexibility matters more than a set contract length.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-amber-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-amber-900 mb-2">
                    Important: Welsh no-fault notice timing is stricter than England
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Landlords often choose between fixed-term and periodic thinking only about flexibility,
                    but Welsh possession timing rules still need to be considered. Contract type does not
                    remove the need to comply with the relevant statutory notice requirements.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-amber-200">
                    <h3 className="font-semibold text-amber-900 mb-2">Points to keep in mind</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>Section 173 timing matters in Wales</li>
                      <li>Written statement compliance still matters</li>
                      <li>A fixed term affects when a no-fault route can actually end the contract</li>
                      <li>Periodic does not automatically mean easy possession</li>
                      <li>Break clauses should be drafted with Welsh rules in mind</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What happens when a fixed-term occupation contract ends?
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                In many cases, the contract does not simply stop. It moves into a periodic stage.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  When a fixed-term occupation contract ends and the contract-holder remains in the
                  property, the arrangement will usually continue as a <strong>periodic standard
                  occupation contract</strong>. This happens automatically in the normal course of events.
                </p>

                <p>
                  That means landlords often do not need to create a brand-new agreement just because
                  the fixed term has expired. The rent and many of the existing terms will usually
                  continue unless there is a lawful variation or a fresh contract is agreed.
                </p>

                <p>
                  This automatic conversion is one of the most important practical differences for
                  landlords to understand. If you expected the tenancy to end simply because the fixed
                  term expired, that assumption can lead to mistakes.
                </p>

                <p>
                  Once the agreement is periodic, the options available to both sides change. The
                  contract-holder may have more flexibility to leave, while the landlord may consider
                  future notice options subject to Welsh statutory rules.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-10">
                <div className="rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Let it roll periodic</h3>
                  <p className="text-gray-700">
                    A simple option if you are happy for the contract-holder to remain without a new
                    fixed commitment.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Grant a new fixed term</h3>
                  <p className="text-gray-700">
                    Useful where both parties want a new defined duration or updated commercial terms.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Plan ahead on notice</h3>
                  <p className="text-gray-700">
                    If possession may be needed later, timing should be reviewed well before the end
                    of the fixed term.
                  </p>
                </div>
              </div>

              <p className="mt-8 text-gray-700">
                You can also read more about the{' '}
                <Link
                  href="/standard-occupation-contract-wales"
                  className="text-red-600 font-semibold hover:underline"
                >
                  Standard Occupation Contract in Wales
                </Link>{' '}
                and the role of{' '}
                <Link
                  href="/wales-eviction-notices"
                  className="text-red-600 font-semibold hover:underline"
                >
                  Welsh eviction notices
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="section"
                pagePath={PAGE_PATH}
                jurisdiction="wales"
                title="Create Your Occupation Contract"
                description="Whether fixed-term or periodic, our Welsh occupation contracts are ready in minutes and built for the Renting Homes (Wales) Act 2016 framework."
              />
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Break clauses in Welsh fixed-term occupation contracts
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                A break clause can add flexibility, but it needs to be drafted with Welsh law in mind.
              </p>

              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p>
                  A <strong>break clause</strong> allows the landlord, the contract-holder, or both
                  parties to end a fixed-term contract earlier than the natural end date if the
                  agreed conditions are met.
                </p>

                <p>
                  This can be useful where a landlord wants the security of a fixed term but does not
                  want to be locked in for the full duration if circumstances change. It can also make
                  the contract more workable for contract-holders whose plans are not fully settled.
                </p>

                <p>
                  The important point is that a break clause is not a shortcut around Welsh statutory
                  rules. It should work alongside the legal framework, not attempt to replace it.
                </p>

                <p>
                  For that reason, premium contracts often make more sense where flexibility is
                  important. They can include wording that is better suited to more nuanced
                  arrangements.
                </p>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Premium occupation contracts</strong> can be a better choice where you want
                  break clause options, more bespoke terms, or added flexibility for real-world
                  letting scenarios.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Standard vs Premium Occupation Contract
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
                Choose the Welsh contract package that matches the level of flexibility and coverage you need.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm text-gray-900">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Contract</h3>
                  <p className="text-2xl font-bold text-red-600 mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-700 mb-6">
                    Suitable for many straightforward Welsh fixed-term or periodic lettings.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Fixed-term or periodic options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Fundamental terms included</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Written statement format</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Suitable for many standard private lets</span>
                    </li>
                  </ul>
                  <Link
                    href={astProductHref}
                    className="block w-full text-center bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Create Standard Contract
                  </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 border-2 border-red-200 shadow-lg relative text-gray-900">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-3 py-1 rounded-full">
                    Recommended
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Contract</h3>
                  <p className="text-2xl font-bold text-red-700 mb-4">
                    {PRODUCTS.ast_premium.displayPrice}
                  </p>
                  <p className="text-gray-700 mb-6">
                    Better for landlords who want added flexibility, extra clauses or more detailed protection.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Everything in Standard</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Break clause options</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Useful for more tailored terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Helpful for more complex letting scenarios</span>
                    </li>
                  </ul>
                  <Link
                    href={astProductHref}
                    className="block w-full text-center bg-red-700 text-white py-3 rounded-lg font-medium hover:bg-red-800 transition-colors"
                  >
                    Create Premium Contract
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Wales vs England: key differences on contract duration
              </h2>
              <p className="text-gray-600 text-center mb-10 max-w-3xl mx-auto">
                Welsh landlords should not assume the same timing and paperwork rules apply as in England.
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
                      <td className="px-4 py-3 text-gray-700">Private sector agreement type</td>
                      <td className="px-4 py-3 text-gray-700">Standard Occupation Contract</td>
                      <td className="px-4 py-3 text-gray-700">AST</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">No-fault route framework</td>
                      <td className="px-4 py-3 text-gray-700">Section 173</td>
                      <td className="px-4 py-3 text-gray-700">Section 21 framework</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Written statement requirement</td>
                      <td className="px-4 py-3 text-gray-700">Yes</td>
                      <td className="px-4 py-3 text-gray-700">No Welsh written statement regime</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">End of fixed term</td>
                      <td className="px-4 py-3 text-gray-700">Often becomes periodic automatically</td>
                      <td className="px-4 py-3 text-gray-700">Periodic continuation also common</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-700">Landlord compliance context</td>
                      <td className="px-4 py-3 text-gray-700">Welsh-specific framework applies</td>
                      <td className="px-4 py-3 text-gray-700">Different English framework applies</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <Link
                  href="/standard-occupation-contract-wales"
                  className="inline-flex items-center gap-2 text-red-600 font-medium hover:underline"
                >
                  Learn more about Welsh occupation contracts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <FAQSection
          faqs={faqs}
          title="Fixed Term vs Periodic FAQ"
          showContactCTA={false}
          variant="gray"
        />

        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="wales"
                title="Create Your Welsh Occupation Contract"
                description="Fixed-term or periodic. Break clause options. Renting Homes (Wales) Act compliant. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

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
