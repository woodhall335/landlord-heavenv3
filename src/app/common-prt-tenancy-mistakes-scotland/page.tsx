import { Metadata } from 'next';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { prtMistakesRelatedLinks } from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { FAQSection } from '@/components/seo/FAQSection';
import { prtMistakesFAQs } from '@/data/faqs';
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
  XCircle,
  AlertOctagon,
  Ban,
  FileWarning,
} from 'lucide-react';

// Page constants for analytics
const PAGE_PATH = '/common-prt-tenancy-mistakes-scotland';
const PAGE_TITLE = 'Common PRT Tenancy Mistakes Scotland';
const PAGE_TYPE = 'tenancy' as const;

const wizardLinkStandard = buildWizardLink({
  product: 'ast_standard',
  jurisdiction: 'scotland',
  src: 'guide',
  topic: 'tenancy',
});

const wizardLinkPremium = buildWizardLink({
  product: 'ast_premium',
  jurisdiction: 'scotland',
  src: 'guide',
  topic: 'tenancy',
});

export const metadata: Metadata = {
  title: 'Common PRT Tenancy Mistakes Scotland | Landlord PRT Obligations 2026',
  description:
    'Avoid costly PRT tenancy mistakes in Scotland. Learn about landlord registration, deposit protection, Notice to Leave errors, and Tribunal requirements.',
  keywords: [
    'prt tenancy mistakes',
    'landlord prt obligations',
    'scottish landlord mistakes',
    'prt compliance scotland',
    'notice to leave errors',
    'landlord registration scotland',
    'deposit protection scotland',
    'first-tier tribunal mistakes',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/common-prt-tenancy-mistakes-scotland',
  },
  openGraph: {
    title: 'Common PRT Tenancy Mistakes Scotland | Landlord Heaven',
    description:
      'Avoid the most common PRT mistakes Scottish landlords make. Protect your ability to evict and claim rent.',
    type: 'website',
  },
};

export default function CommonPrtTenancyMistakesScotlandPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Common PRT Tenancy Mistakes Scotland',
    description:
      'Avoid costly Private Residential Tenancy mistakes in Scotland. Essential landlord obligations and compliance requirements.',
    url: 'https://landlordheaven.co.uk/common-prt-tenancy-mistakes-scotland',
  };

  return (
    <>
      <StructuredData data={pageSchema} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tenancy Agreements', url: 'https://landlordheaven.co.uk/products/ast' },
          {
            name: 'PRT Mistakes Scotland',
            url: 'https://landlordheaven.co.uk/common-prt-tenancy-mistakes-scotland',
          },
        ])}
      />

      {/* Analytics: Attribution + landing_view event */}
      <SeoLandingWrapper
        pagePath={PAGE_PATH}
        pageTitle={PAGE_TITLE}
        pageType={PAGE_TYPE}
        jurisdiction="scotland"
      />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="Scotland Only"
          badgeIcon={<Scale className="w-4 h-4" />}
          title="Common PRT Tenancy Mistakes"
          subtitle={
            <>
              Avoid the <strong>costly errors</strong> that prevent Scottish landlords from evicting
              tenants and recovering rent. Essential compliance guidance for PRTs.
            </>
          }
          primaryCTA={{
            label: `Create Compliant PRT — ${PRODUCTS.ast_standard.displayPrice}`,
            href: wizardLinkStandard,
          }}
          secondaryCTA={{
            label: 'Premium Agreement with Extras',
            href: wizardLinkPremium,
          }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              2016 Act Compliant
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Tribunal-Ready
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Avoid Costly Errors
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* Why Mistakes Matter Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Why PRT Compliance Matters
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Scottish tenancy law has specific requirements. Getting them wrong can cost you
                thousands.
              </p>

              <div className="prose prose-lg max-w-none text-gray-600">
                <p>
                  The Private Housing (Tenancies) (Scotland) Act 2016 introduced significant
                  changes to how landlords must manage their lettings. Unlike the previous assured
                  and short assured tenancy regime, the <strong>Private Residential Tenancy</strong>
                  {' '}has stricter compliance requirements and no automatic right to recover
                  possession.
                </p>
                <p>
                  Many landlords — particularly those used to English ASTs or the old Scottish
                  system — make mistakes that only become apparent when they try to evict a tenant
                  or pursue rent arrears. By then, it is often too late to fix the problem without
                  significant delay and expense.
                </p>
                <p>
                  The First-tier Tribunal for Scotland, which handles PRT disputes, will examine
                  whether landlords have complied with their obligations before granting eviction
                  orders. Non-compliance can be a complete defence for tenants, leaving landlords
                  stuck with tenants they cannot remove and mounting arrears they cannot recover.
                </p>
                <p>
                  The good news is that most mistakes are easily avoided with proper setup. This
                  guide covers the most common errors we see and how to ensure your PRT is
                  compliant from day one.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mistake 1: Not Registering as a Landlord */}
        <section className="py-16 lg:py-20 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertOctagon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-4">
                    Mistake 1: Not Registering as a Landlord
                  </h2>
                  <p className="text-red-800 mb-4">
                    All private landlords in Scotland must be registered with the local council
                    before letting property. This is not optional — letting without registration
                    is a <strong>criminal offence</strong> with penalties up to £50,000.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <h3 className="font-semibold text-red-900 mb-2">Consequences</h3>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>* Criminal prosecution and fines</li>
                        <li>* Cannot serve valid Notice to Leave</li>
                        <li>* Tribunal will not grant eviction order</li>
                        <li>* Tenant can use as defence against eviction</li>
                        <li>* Local authority can issue Rent Penalty Notice</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <h3 className="font-semibold text-red-900 mb-2">How to Avoid</h3>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>* Register before advertising or letting</li>
                        <li>* Include registration number in your PRT</li>
                        <li>* Renew registration every 3 years</li>
                        <li>* Ensure all joint landlords are registered</li>
                        <li>* Keep registration current if details change</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mistake 2: Using English AST Templates */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileWarning className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-amber-900 mb-4">
                      Mistake 2: Using English AST Templates in Scotland
                    </h2>
                    <p className="text-amber-800 mb-4">
                      English Assured Shorthold Tenancy agreements are <strong>not valid</strong> in
                      Scotland. They reference the wrong legislation (Housing Act 1988), include
                      terms that do not exist in Scotland (Section 21/Section 8), and omit
                      mandatory Scottish terms.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h3 className="font-semibold text-amber-900 mb-2">Problems This Causes</h3>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>* Agreement may be unenforceable</li>
                          <li>* Wrong eviction procedures described</li>
                          <li>* Missing mandatory statutory terms</li>
                          <li>* Tribunal may refuse to rely on it</li>
                          <li>* Tenant confusion about their rights</li>
                        </ul>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-amber-200">
                        <h3 className="font-semibold text-amber-900 mb-2">What to Use Instead</h3>
                        <ul className="text-sm text-amber-800 space-y-1">
                          <li>* Scottish PRT agreement only</li>
                          <li>* Based on 2016 Act requirements</li>
                          <li>* References First-tier Tribunal</li>
                          <li>* Includes all 18 eviction grounds</li>
                          <li>* Correct deposit protection rules</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mistake 3: Deposit Protection Errors */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Mistake 3: Deposit Protection Failures
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Scottish deposit protection rules differ from England. Getting them wrong has
                serious consequences.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Not Protecting Within 30 Working Days</h3>
                      <p className="text-gray-600">
                        In Scotland, deposits must be protected within <strong>30 working days</strong>
                        {' '}(not calendar days) of the tenancy starting. Miss this deadline and the
                        tenant can apply to the Tribunal for up to <strong>three times</strong> the
                        deposit amount as a penalty. This deadline is strictly enforced.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Using the Wrong Scheme</h3>
                      <p className="text-gray-600">
                        England has three deposit protection schemes. Scotland has different approved
                        schemes. Using an English scheme for a Scottish property does not satisfy the
                        legal requirement. Ensure you use a scheme approved for Scotland: SafeDeposits
                        Scotland, Letting Protection Service Scotland, or mydeposits Scotland.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Not Providing Required Information</h3>
                      <p className="text-gray-600">
                        After protecting the deposit, you must give the tenant specific information
                        about where it is held and how to dispute deductions. Failure to provide this
                        information is a breach of your obligations, even if the deposit is protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mistake 4: Written Terms Failure */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Mistake 4: Not Providing Written Terms Within 28 Days
                    </h2>
                    <p className="text-gray-600 mb-4">
                      You must provide the tenant with written terms within 28 days of the tenancy
                      starting. This is a legal requirement under the 2016 Act, not just good
                      practice.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">If You Miss the Deadline</h3>
                        <ul className="space-y-1 text-gray-600">
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>Tenant can apply to Tribunal</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>Tribunal can order you to provide terms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>Payment order up to one month&apos;s rent</span>
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">What to Provide</h3>
                        <ul className="space-y-1 text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>All mandatory statutory terms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Any additional agreed terms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Easy Rent Scotland Tenant Information Pack</span>
                          </li>
                        </ul>
                      </div>
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
                jurisdiction="scotland"
                title="Create a Compliant PRT Agreement"
                description="Avoid costly mistakes with a properly drafted PRT. All mandatory terms included. Ready in minutes."
              />
            </div>
          </div>
        </section>

        {/* Mistake 5: Notice to Leave Errors */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Mistake 5: Notice to Leave Errors
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Invalid notices are the most common reason eviction applications fail.
              </p>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Using the Wrong Form</h3>
                  <p className="text-gray-600">
                    Scotland has a prescribed Notice to Leave form. Using an English Section 21 or
                    Section 8 notice is completely invalid. Even using an unofficial Scottish form
                    that does not contain all required information may invalidate your notice.
                    Always use the current prescribed form.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Wrong Notice Period</h3>
                  <p className="text-gray-600">
                    Different eviction grounds require different notice periods. Giving the wrong
                    notice period invalidates the notice:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold w-24">28 days:</span>
                      <span>Rent arrears, antisocial behaviour, criminal activity</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold w-24">84 days:</span>
                      <span>Most other grounds if tenancy over 6 months</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold w-24">28 days:</span>
                      <span>Any ground if tenancy under 6 months</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Not Specifying Valid Grounds</h3>
                  <p className="text-gray-600">
                    You must state which of the 18 statutory grounds you are relying on. Unlike
                    English Section 21 (no-fault eviction), there is no general right to recover
                    possession in Scotland. If you cite the wrong ground or cannot prove the
                    ground you cited, the Tribunal will refuse your application.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-3">Improper Service</h3>
                  <p className="text-gray-600">
                    The Notice to Leave must be properly served. Acceptable methods include:
                    recorded delivery post, hand delivery (with witness), or leaving at the
                    property. Email is only valid if the tenancy agreement permits it AND the
                    tenant has agreed. Prove service by keeping delivery confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mistake 6: Trying No-Fault Eviction */}
        <section className="py-16 lg:py-20 bg-red-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-4">
                    Mistake 6: Expecting &quot;No-Fault&quot; Eviction to Work
                  </h2>
                  <p className="text-red-800 mb-4">
                    Many English landlords and those familiar with pre-2017 Scottish tenancies
                    expect to simply give notice and recover possession. This does not exist
                    under the PRT system.
                  </p>
                  <div className="bg-white rounded-lg p-6 border border-red-200">
                    <h3 className="font-semibold text-red-900 mb-3">The Reality in Scotland</h3>
                    <ul className="space-y-2 text-red-800">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                        <span>
                          <strong>No Section 21 equivalent:</strong> Scotland abolished no-fault
                          eviction in 2017
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                        <span>
                          <strong>Must have valid ground:</strong> One of 18 statutory grounds must
                          be proven
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                        <span>
                          <strong>Tribunal decides:</strong> Even mandatory grounds require Tribunal
                          approval
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                        <span>
                          <strong>Tenant can challenge:</strong> Tenants can defend and dispute
                          grounds cited
                        </span>
                      </li>
                    </ul>
                    <p className="mt-4 text-red-800 text-sm">
                      If you want vacant possession, you must either wait for the tenant to leave
                      voluntarily or establish a valid ground such as intending to sell (Ground 1)
                      or wanting to move in yourself (Ground 4).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* More Common Mistakes */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                More Common Mistakes to Avoid
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Additional pitfalls that catch Scottish landlords out.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Wrong Rent Increase Procedure</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Simply asking the tenant to pay more is not enough. You must serve a formal
                    rent increase notice with 3 months notice, and can only increase once per year.
                    Tenants can challenge excessive increases to a Rent Officer.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Assuming Old Tenancies Are PRTs</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Tenancies created before 1 December 2017 remain as assured or short assured
                    tenancies with different rules. Only tenancies starting from that date onwards
                    are PRTs. Do not apply PRT procedures to old-style tenancies.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Poor Record Keeping</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    The Tribunal will want evidence: signed agreement, proof of deposit protection,
                    proof of notice service, evidence supporting your eviction ground. Keep
                    everything — you may need it years later.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Ignoring Repairing Standard</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Scotland has a statutory Repairing Standard that all private rented properties
                    must meet. Failing to maintain the property can result in enforcement action
                    and may be raised as a defence if you seek eviction.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Illegal Eviction Attempts</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Changing locks, cutting utilities, or harassing tenants to leave is illegal.
                    Even if the tenant owes rent or is in breach, you must follow the legal
                    eviction process through the Tribunal. Illegal eviction is a criminal offence.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-gray-900">Not Understanding Tribunal Costs</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    The First-tier Tribunal does not generally award costs like English courts.
                    You will usually bear your own costs even if successful. Factor this into your
                    decision making and try to resolve issues before needing Tribunal involvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Checklist */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                PRT Compliance Checklist
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Use this checklist to ensure your PRT is properly set up.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Before Letting</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Registered on Scottish Landlord Register
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Property meets Repairing Standard
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Valid EPC obtained
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Gas safety certificate current
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Scottish PRT agreement prepared
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">At Tenancy Start</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Agreement signed by all parties
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Tenant given copy of agreement
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Deposit taken (max 2 months rent)
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Inventory completed and signed
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Within 30 Working Days</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Deposit protected in approved scheme
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Deposit information given to tenant
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Ongoing</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Landlord registration kept current
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Annual gas safety checks
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Repairing Standard maintained
                      </li>
                      <li className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        Records kept of all communications
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={prtMistakesFAQs}
          title="PRT Compliance FAQ"
          showContactCTA={false}
          variant="white"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="tenancy"
                variant="final"
                pagePath={PAGE_PATH}
                jurisdiction="scotland"
                title="Get Your PRT Right From the Start"
                description="A properly drafted PRT protects your ability to evict and claim rent. All mandatory terms included. Tribunal-ready."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Resources" links={prtMistakesRelatedLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
