import { Metadata } from 'next';
import Link from 'next/link';
import {
  StructuredData,
  breadcrumbSchema,
  articleSchema,
  HOWTO_SCHEMAS,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  moneyClaimRentLinks,
  productLinks,
  toolLinks,
  moneyClaimGuides,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { StandardHero } from '@/components/marketing/StandardHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { claimRentArrearsFAQs } from '@/data/faqs';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  Shield,
  Gavel,
  Calendar,
  AlertCircle,
  PoundSterling,
  Calculator,
  Mail,
  Users,
  Building,
  CreditCard,
  XCircle,
} from 'lucide-react';

const moneyClaimLink = buildWizardLink({
  product: 'money_claim',
  jurisdiction: 'england',
  src: 'seo_money_claim',
  topic: 'money_claim',
});

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_eviction',
  topic: 'eviction',
});

export const metadata: Metadata = {
  title: 'Claim Rent Arrears from Tenant | Money Claim Guide | Landlord Heaven',
  description:
    'How to claim unpaid rent from a tenant through the county court. Letter Before Action, MCOL process, and CCJ enforcement.',
  keywords: [
    'claim rent arrears tenant',
    'money claim rent arrears',
    'sue tenant for unpaid rent',
    'recover rent arrears',
    'landlord money claim',
    'mcol rent arrears',
    'county court rent claim',
    'tenant owes rent',
  ],
  openGraph: {
    title: 'Claim Rent Arrears from Tenant | Money Claim Guide | Landlord Heaven',
    description:
      'How to claim unpaid rent from a tenant through the county court. Complete landlord guide.',
    type: 'article',
    url: getCanonicalUrl('/claim-rent-arrears-tenant'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Claim Rent Arrears from Tenant | Landlord Heaven',
    description: 'How to claim unpaid rent from a tenant through the county court.',
  },
  alternates: {
    canonical: getCanonicalUrl('/claim-rent-arrears-tenant'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ClaimRentArrearsTenantPage() {
  return (
    <>
      <SeoLandingWrapper
        pagePath="/claim-rent-arrears-tenant"
        pageTitle="Claim Rent Arrears from Tenant"
        pageType="money"
        jurisdiction="england"
      />

      {/* Structured Data */}
      <StructuredData
        data={articleSchema({
          headline: 'How to Claim Rent Arrears from a Tenant: Money Claim Guide',
          description:
            'Complete guide to claiming unpaid rent from a tenant through the county court. Covers Letter Before Action, MCOL, and CCJ enforcement.',
          url: getCanonicalUrl('/claim-rent-arrears-tenant'),
          datePublished: '2026-01-30',
          dateModified: '2026-01-30',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Money Claim Guides', url: getCanonicalUrl('/money-claim-rent-arrears') },
          { name: 'Claim Rent Arrears', url: getCanonicalUrl('/claim-rent-arrears-tenant') },
        ])}
      />
      <StructuredData data={HOWTO_SCHEMAS.mcolProcess} />

      <main>
        {/* Hero Section */}
        <StandardHero
          badge="England Only"
          badgeIcon={<PoundSterling className="w-4 h-4" />}
          title="Claim Rent Arrears from Your Tenant"
          subtitle="Recover unpaid rent through the county court with Money Claim Online (MCOL). Add 8% statutory interest. Get a CCJ if they do not pay."
          primaryCTA={{
            label: `Start Money Claim — ${PRODUCTS.money_claim.displayPrice}`,
            href: moneyClaimLink,
          }}
          secondaryCTA={{
            label: 'Also Need Eviction?',
            href: completePackLink,
          }}
          variant="pastel"
        >
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-green-500" />
              Letter Before Action
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              MCOL-Ready Forms
            </span>
            <span className="flex items-center gap-2">
              <PoundSterling className="w-4 h-4 text-green-500" />
              Interest Calculator
            </span>
          </div>
        </StandardHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* When to Claim */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When to Claim Rent Arrears
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                You can claim unpaid rent at different stages—during the tenancy or after the
                tenant has left.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* During Tenancy */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">During Tenancy</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    You can claim rent arrears while the tenant still lives in the property.
                    Consider whether eviction might be more appropriate.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Can pressure tenant to pay
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      May want to continue tenancy
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      Consider Section 8 eviction instead
                    </li>
                  </ul>
                </div>

                {/* After Tenant Left */}
                <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Most Common
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">After Tenant Left</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Claim rent arrears after the tenant has vacated. You can also include damage
                    costs not covered by the deposit.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Claim up to 6 years after debt arose
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Add damage costs and cleaning
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      Add 8% statutory interest
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Process */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Money Claim Process: Step by Step
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Follow this process to claim rent arrears through the county court.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">1</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Calculate the Total Owed
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Add up all unpaid rent, deducting any deposit retained. You can add 8%
                        statutory interest from when each payment was due.
                      </p>
                      <Link
                        href="/tools/rent-arrears-calculator"
                        className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                      >
                        <Calculator className="w-4 h-4" />
                        Use our free arrears calculator
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">2</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Send Letter Before Action
                      </h3>
                      <p className="text-gray-600 mb-3">
                        You <strong>must</strong> send a formal Letter Before Action (LBA) to the
                        tenant before filing a court claim. This is required by the Pre-Action
                        Protocol for Debt Claims (PAP-DEBT).
                      </p>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm">
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            State exact amount owed with breakdown
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Give 30 days to respond or pay
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Explain consequences of non-payment
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">3</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        File Claim via MCOL
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If the tenant does not pay or respond, file your claim through Money Claim
                        Online (MCOL). You will need to write &quot;Particulars of Claim&quot;
                        explaining the debt.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-600 block">Claim up to £300</span>
                          <span className="font-bold text-gray-900">£35 fee</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-600 block">Claim £1,000-£1,500</span>
                          <span className="font-bold text-gray-900">£185 fee</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-600 block">Claim £5,000-£10,000</span>
                          <span className="font-bold text-gray-900">£455 fee</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-gray-600 block">Claim £10,000+</span>
                          <span className="font-bold text-gray-900">5% of amount</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-white">4</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Defendant Responds (or Not)
                      </h3>
                      <p className="text-gray-600 mb-3">
                        The tenant has 14 days to respond. They can: pay in full, admit and offer
                        payment terms, or file a defence.
                      </p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <strong>No response:</strong> Request default judgment
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <strong>Defence filed:</strong> Case allocated to track
                        </li>
                        <li className="flex items-center gap-2">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <strong>Admits debt:</strong> Accept or reject payment offer
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Judgment & Enforcement
                      </h3>
                      <p className="text-gray-600 mb-3">
                        If you win, the court issues a County Court Judgment (CCJ). If the tenant
                        still does not pay, you can enforce.
                      </p>
                      <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        CCJ stays on tenant&apos;s credit file for 6 years
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Court Fees Table */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Money Claim Court Fees
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Court fees depend on how much you are claiming. These are added to your claim.
              </p>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-900">Claim Amount</th>
                        <th className="text-right p-4 font-semibold text-gray-900">Court Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="p-4 text-gray-600">Up to £300</td>
                        <td className="p-4 text-right font-bold text-gray-900">£35</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 text-gray-600">£300.01 - £500</td>
                        <td className="p-4 text-right font-bold text-gray-900">£70</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-gray-600">£500.01 - £1,000</td>
                        <td className="p-4 text-right font-bold text-gray-900">£105</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 text-gray-600">£1,000.01 - £1,500</td>
                        <td className="p-4 text-right font-bold text-gray-900">£185</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-gray-600">£1,500.01 - £3,000</td>
                        <td className="p-4 text-right font-bold text-gray-900">£210</td>
                      </tr>
                      <tr className="bg-gray-50/50">
                        <td className="p-4 text-gray-600">£3,000.01 - £5,000</td>
                        <td className="p-4 text-right font-bold text-gray-900">£255</td>
                      </tr>
                      <tr>
                        <td className="p-4 text-gray-600">£5,000.01 - £10,000</td>
                        <td className="p-4 text-right font-bold text-gray-900">£455</td>
                      </tr>
                      <tr className="bg-primary/5">
                        <td className="p-4 text-gray-600">£10,000.01 - £100,000</td>
                        <td className="p-4 text-right font-bold text-primary">5% of amount</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Note:</strong> Court fees are added to your claim. If you win, the
                  tenant pays your fees. If paying via MCOL, there is a 10% online discount on
                  some fees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enforcement Options */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                What Happens After You Win (CCJ)?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If you get a County Court Judgment and the tenant still does not pay, you have
                several enforcement options.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Bailiff Enforcement</h3>
                      <p className="text-gray-600 text-sm">
                        County court bailiffs or High Court Enforcement Officers can visit the
                        debtor to collect payment or seize goods.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Attachment of Earnings</h3>
                      <p className="text-gray-600 text-sm">
                        Court orders the debtor&apos;s employer to deduct money from wages and pay
                        you directly. Only works if employed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Charging Order</h3>
                      <p className="text-gray-600 text-sm">
                        Secures the debt against debtor&apos;s property. When they sell, you get
                        paid from the proceeds.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PoundSterling className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">Third Party Debt Order</h3>
                      <p className="text-gray-600 text-sm">
                        Freezes money in debtor&apos;s bank account and pays it to you. Requires
                        knowing which bank they use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/money-claim-ccj-enforcement"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Full CCJ Enforcement Guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Claiming from Guarantor */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Claiming from a Guarantor
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                If you have a valid guarantor agreement, you can claim rent arrears from the
                guarantor instead of (or as well as) the tenant.
              </p>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Guarantor Claims</h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          The guarantor is jointly and severally liable for rent arrears
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>
                          Send Letter Before Action to guarantor (as well as tenant if applicable)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>Can claim from both but only recover the debt once</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>
                          Check guarantor agreement covers the full tenancy period
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/money-claim-guarantor"
                  className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  Full Guarantor Claims Guide
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Eviction + Money Claim */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Eviction AND Money Claim: Can You Do Both?
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Yes. Many landlords evict first, then pursue rent arrears via a separate money
                claim.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Option 1: Claim in Possession Proceedings
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Add rent arrears to your possession claim (Form N5). Single court case but
                    cannot use accelerated procedure.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      One set of court fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dealt with at same hearing
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Cannot use N5B (accelerated)
                    </li>
                  </ul>
                </div>

                <div className="bg-primary/5 rounded-xl p-6 border-2 border-primary">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    Option 2: Separate Money Claim (Most Common)
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Evict first using Section 21/8, then file separate money claim via MCOL for
                    rent arrears plus any damage.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Evict faster (can use N5B)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Add damage costs after checkout
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Claim up to 6 years later
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="money"
                variant="section"
                jurisdiction="england"
                pagePath="/claim-rent-arrears-tenant"
                title="Get Your Money Claim Documents"
                description="Letter Before Action, Particulars of Claim, schedule of debt, and MCOL instructions. Everything you need to recover unpaid rent."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={claimRentArrearsFAQs}
          title="Claiming Rent Arrears: Frequently Asked Questions"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="money"
                variant="final"
                jurisdiction="england"
                pagePath="/claim-rent-arrears-tenant"
                title="Recover Your Unpaid Rent"
                description="AI-drafted Particulars of Claim. PAP-DEBT compliant Letter Before Action. Enforcement guidance included."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks title="Related Money Claim Resources" links={moneyClaimRentLinks} />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
