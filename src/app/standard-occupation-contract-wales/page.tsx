import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { occupationContractMainRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { occupationContractWalesFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  AlertTriangle,
  Home,
  Users,
  Gavel,
  BadgeCheck,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/standard-occupation-contract-wales';
const PAGE_TITLE = 'Standard Occupation Contract Wales';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'wales',
  src: 'seo_standard_occupation_contract_wales',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'wales',
  src: 'seo_standard_occupation_contract_wales',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Standard Occupation Contract Wales | Create Welsh Tenancy Agreement',
  description:
    'Create a Standard Occupation Contract for Wales. Renting Homes Act 2016 compliant with written statement included.',
  keywords: [
    'standard occupation contract',
    'occupation contract wales',
    'welsh tenancy agreement',
    'renting homes wales act',
    'wales landlord contract',
    'contract holder wales',
    'occupation contract template',
    'wales rental agreement',
    'written statement wales',
    'landlord wales',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/standard-occupation-contract-wales',
  },
  openGraph: {
    title: 'Standard Occupation Contract Wales | Landlord Heaven',
    description:
      'Create a legally valid occupation contract for Wales. Fully compliant with the Renting Homes (Wales) Act 2016.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/standard-occupation-contract-wales',
  },
};

export default function StandardOccupationContractWalesPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Standard Occupation Contract Wales',
    description:
      'Create a legally valid Standard Occupation Contract for Wales, compliant with the Renting Homes (Wales) Act 2016.',
    url: 'https://landlordheaven.co.uk/standard-occupation-contract-wales',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'Standard Occupation Contract Wales',
            url: 'https://landlordheaven.co.uk/standard-occupation-contract-wales',
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

      <HeaderConfig mode="autoOnScroll" />

      <main>
        {/* Hero Section */}
        <UniversalHero
          badge="Wales Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Standard Occupation Contract Wales"
          subtitle={
            <>
              Create a <strong>legally valid</strong> occupation contract for Wales.
              Compliant with the Renting Homes (Wales) Act 2016, with written statement
              and all fundamental terms included.
            </>
          }
          primaryCta={{
            label: `Create Occupation Contract — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCta={{
            label: 'Premium Contract with Extra Protection',
            href: wizardLinkPremium,
          }}
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Renting Homes Act 2016 Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Court-Ready Documentation
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Ready in Minutes
            </span>
          </div>
        </UniversalHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* What is an Occupation Contract Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Is a Standard Occupation Contract?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding the tenancy type that applies to all private lettings in Wales
                since December 2022.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  A <strong>Standard Occupation Contract</strong> is the type of tenancy agreement
                  used for private residential lettings in Wales. It was introduced by the
                  Renting Homes (Wales) Act 2016, which came into force on 1 December 2022,
                  replacing the Assured Shorthold Tenancy (AST) that previously applied in Wales.
                </p>
                <p>
                  Under Welsh law, tenants are called <strong>contract-holders</strong> rather
                  than tenants, and the agreement is an occupation contract rather than a tenancy
                  agreement. This reflects the Act&apos;s approach of treating housing as a matter
                  of contract law with statutory protections built in.
                </p>
                <p>
                  The Standard Occupation Contract gives contract-holders security of occupation
                  while providing landlords with clear procedures for recovering possession when
                  needed. The key difference from English ASTs is that landlords must give at
                  least six months&apos; notice for no-fault possession using a Section 173 notice.
                </p>
                <p>
                  Every landlord in Wales must provide a <strong>written statement</strong> of
                  the occupation contract within 14 days of the occupation date. This written
                  statement must contain all the fundamental and supplementary terms that apply
                  to the contract. Failure to provide a written statement has consequences for
                  your ability to serve possession notices.
                </p>
                <ul>
                  <li>
                    <strong>Fundamental terms:</strong> These are set by law and cannot be
                    changed. They include the landlord&apos;s repair obligations, the
                    contract-holder&apos;s right to occupy, and rules about deposits.
                  </li>
                  <li>
                    <strong>Supplementary terms:</strong> These are default terms that apply
                    unless you agree otherwise. They cover matters like keeping the property
                    in good condition and not causing nuisance.
                  </li>
                  <li>
                    <strong>Additional terms:</strong> You can add your own terms covering
                    property-specific matters like gardens, pets, and parking, as long as
                    they are fair and do not contradict fundamental terms.
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
                    Why Using the Correct Contract Type Matters in Wales
                  </h2>
                  <p className="text-amber-800 mb-4">
                    Since 1 December 2022, using an English AST template in Wales is not legally
                    valid. Your contract must comply with Welsh housing law.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Common Mistakes</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>Using an English AST template</li>
                        <li>Not providing a written statement within 14 days</li>
                        <li>Missing fundamental terms required by law</li>
                        <li>Including unfair additional terms</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-amber-200">
                      <h3 className="font-semibold text-amber-900 mb-2">Consequences</h3>
                      <ul className="text-sm text-amber-800 space-y-1">
                        <li>Section 173 notice invalid without written statement</li>
                        <li>Cannot serve no-fault notice for 6 months</li>
                        <li>Possession claims rejected by court</li>
                        <li>Contract-holder can apply to tribunal</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Requirements Section */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Legal Requirements for Welsh Occupation Contracts
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Your occupation contract must comply with the Renting Homes (Wales) Act 2016
                and related regulations.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Renting Homes (Wales) Act 2016</h3>
                  <p className="text-gray-600 text-sm">
                    The foundational legislation for all occupation contracts in Wales. Defines
                    contract-holder rights, landlord obligations, and the framework for
                    possession proceedings. Came into force 1 December 2022.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Written Statement Requirement</h3>
                  <p className="text-gray-600 text-sm">
                    Landlords must provide a written statement within 14 days of occupation
                    starting. This must contain all fundamental terms, supplementary terms,
                    and any additional terms agreed. Failure blocks Section 173 notices.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Rent Smart Wales Registration</h3>
                  <p className="text-gray-600 text-sm">
                    All private landlords must be registered with Rent Smart Wales, and anyone
                    carrying out letting or management activities must be licensed. This is
                    separate from the occupation contract but required for lawful letting.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Gavel className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Deposit Protection</h3>
                  <p className="text-gray-600 text-sm">
                    Deposits must be protected in an approved scheme within 30 days of receipt.
                    The contract must state the deposit amount, protection scheme, and how
                    deductions work. Unprotected deposits affect possession rights.
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-green-900 text-sm">
                  <strong>Landlord Heaven occupation contracts</strong> are drafted specifically
                  for Wales and comply with the Renting Homes (Wales) Act 2016. They include
                  all fundamental terms, appropriate supplementary terms, and are regularly
                  updated when regulations change.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Terms Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Your Occupation Contract Must Include
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                The written statement must contain specific information and terms required
                by Welsh law.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Parties and Property Details
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The written statement must identify the landlord, all contract-holders
                        by full legal name, and the dwelling address. For joint contracts, all
                        contract-holders must be named with their joint and several liability
                        clearly established.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord name and contact address
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          All contract-holder names
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Full dwelling address
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Occupation date
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Rent and Payment Terms</h3>
                      <p className="text-gray-600 mb-3">
                        Specify the rent amount, payment frequency, due date, and acceptable
                        payment methods. The contract must explain how rent increases work and
                        reference the statutory procedure for increases.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Monthly rent amount
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment due date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Payment method
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Rent increase procedure
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Fundamental Terms</h3>
                      <p className="text-gray-600 mb-3">
                        These terms are set by law and cannot be changed. They include the
                        landlord&apos;s repair and maintenance obligations, fitness for human
                        habitation requirements, and the contract-holder&apos;s right to occupy.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Landlord repair obligations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fitness for human habitation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Right to occupy
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Deposit protection rules
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Home className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Contract Duration and Ending
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Whether the contract is fixed-term or periodic, the occupation date,
                        end date (if fixed-term), and how either party can end the contract
                        including the Section 173 and Section 181 notice procedures.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Occupation date
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Fixed-term end date (if applicable)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Section 173 notice (no-fault)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Section 181 notice (breach)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <BadgeCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        Supplementary and Additional Terms
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Supplementary terms are defaults that apply unless varied by agreement.
                        Additional terms cover property-specific matters and must be fair and
                        not contradict fundamental terms.
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Contract-holder behaviour obligations
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Property condition requirements
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Garden maintenance (if applicable)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Pet policy
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
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
                title="Create Your Occupation Contract Now"
                description="Our Welsh occupation contracts are drafted for the Renting Homes Act 2016, include all fundamental terms, and are designed to stand up in court."
              />
            </div>
          </div>
        </section>

        {/* Ending an Occupation Contract Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Ending a Standard Occupation Contract
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Understanding how possession works under Welsh law is essential for landlords.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <h3>Section 173 Notice (No-Fault Possession)</h3>
                <p>
                  To end an occupation contract without needing to prove a breach, you must
                  serve a Section 173 notice. This requires at least <strong>six months&apos;
                  notice</strong> and cannot be served until at least six months after the
                  occupation date. This is significantly longer than the two-month Section 21
                  notice period in England.
                </p>
                <p>
                  Importantly, you cannot serve a valid Section 173 notice if you have not
                  provided the contract-holder with a written statement. If the written
                  statement was late, you must wait six months from when you provided it
                  before the Section 173 notice can take effect.
                </p>

                <h3>Section 181 Notice (Breach of Contract)</h3>
                <p>
                  If the contract-holder has breached the contract, you may be able to use
                  a Section 181 notice instead. For rent arrears, you can give one month&apos;s
                  notice after at least two months&apos; rent is unpaid. For serious antisocial
                  behaviour, the notice period can be as short as 14 days.
                </p>
                <p>
                  Section 181 is similar to Section 8 in England but with Welsh-specific
                  grounds and procedures. The court will consider whether the breach is
                  serious enough to warrant possession.
                </p>

                <h3>Court Proceedings</h3>
                <p>
                  If the contract-holder does not leave after a valid notice expires, you
                  must apply to the county court for a possession order. The court will
                  check that all requirements have been met, including providing the written
                  statement and protecting the deposit.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/wales-eviction-notices"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  Learn more about Wales eviction notices
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
                Standard vs Premium Occupation Contract
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the level of protection that suits your Welsh letting situation.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Standard Contract</h3>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {PRODUCTS.ast_standard.displayPrice}
                  </p>
                  <p className="text-gray-600 mb-6">
                    A complete, legally valid occupation contract with all fundamental and
                    supplementary terms required by Welsh law.
                  </p>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Renting Homes Act 2016 compliant</span>
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
                      <span>Clear rent and payment terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Written statement format</span>
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
                    Enhanced protection with additional terms for complex situations and
                    extra security under Welsh law.
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
                      <span>Detailed pet policy</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Garden and parking terms</span>
                    </li>
                    <li className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Professional cleaning clause</span>
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

        {/* FAQ Section */}
        <FAQSection
          faqs={occupationContractWalesFAQs}
          title="Standard Occupation Contract FAQ"
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
                title="Create Your Welsh Occupation Contract Today"
                description="Legally valid. Renting Homes Act compliant. Written statement included. Ready in minutes."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={occupationContractMainRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
