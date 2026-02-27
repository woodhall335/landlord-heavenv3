import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  tenantNotPayingRentRelatedLinks,
  productLinks,
  toolLinks,
  landingPageLinks,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { tenantNotPayingRentFAQs } from '@/data/faqs';
import { NeedHelpChoosing, FunnelCta } from '@/components/funnels';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  PoundSterling,
  Shield,
  Calculator,
  Mail,
  Gavel,
} from 'lucide-react';

const wizardLinkNoticeOnly = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_tenant_not_paying_rent',
  topic: 'eviction',
});

const wizardLinkMoneyClaim = buildWizardLink({
  product: 'money_claim',
  jurisdiction: 'england',
  src: 'seo_tenant_not_paying_rent',
  topic: 'debt',
});

const faqs = tenantNotPayingRentFAQs;

export const metadata: Metadata = {
  title: 'Tenant Not Paying Rent? Solicitor-Style Options Guide',
  description: 'What to do when your tenant stops paying rent. Rent demand letters, Section 8 eviction, and money claims through court explained.',
  keywords: [
    'tenant not paying rent',
    'tenant stopped paying rent',
    'rent arrears eviction',
    'section 8 ground 8',
    'ground 10 rent arrears',
    'evict tenant for rent arrears',
    'recover unpaid rent',
    'money claim online',
    'landlord rent arrears',
    'rent demand letter',
  ],
  alternates: {
    canonical: 'https://landlordheaven.co.uk/tenant-not-paying-rent',
  },
  openGraph: {
    title: 'Tenant Not Paying Rent? Solicitor-Style Options Guide',
    description: 'Practical guide for UK landlords dealing with rent arrears. Demand letters, eviction, and money claims explained.',
    type: 'website',
    url: 'https://landlordheaven.co.uk/tenant-not-paying-rent',
  },
};

export default function TenantNotPayingRentPage() {
  const pageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tenant Not Paying Rent - UK Landlord Guide',
    description: 'Guide for UK landlords dealing with tenants who have stopped paying rent. Covers eviction, rent demands, and money claims.',
    url: 'https://landlordheaven.co.uk/tenant-not-paying-rent',
  };

  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={pageSchema} />
      <StructuredData data={breadcrumbSchema([
        { name: 'Home', url: 'https://landlordheaven.co.uk' },
        { name: 'Guides', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
        { name: 'Tenant Not Paying Rent', url: 'https://landlordheaven.co.uk/tenant-not-paying-rent' },
      ])} />

      <main>
        {/* Hero Section */}
        <UniversalHero
          badge="England Only"
          badgeIcon={<PoundSterling className="w-4 h-4" />}
          title="Tenant Not Paying Rent?"
          subtitle={<>You have <strong>three main options</strong>: demand payment, evict for rent arrears, or claim the money through court. Here&apos;s how each works.</>}
          primaryCta={{ label: 'Claim Unpaid Rent', href: wizardLinkMoneyClaim }}
          secondaryCta={{ label: 'Start Eviction Notice', href: wizardLinkNoticeOnly }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Ground 8, 10 & 11 Included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Designed for Court Acceptance
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              2 Weeks Notice Period
            </span>
          </div>
        </UniversalHero>

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <NeedHelpChoosing location="above-fold" />

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Tenant still in property</h3>
                  <p className="text-sm text-gray-700 mb-3">Use possession-focused support to serve Section 8 correctly and progress to court if needed.</p>
                  <Link href="/products/complete-pack" className="text-primary font-medium hover:underline" data-cta="complete-pack" data-cta-location="above-fold">Go to complete-pack →</Link>
                  <p className="text-xs text-gray-500 mt-2">Also see <Link href="/section-8-notice-template" className="underline">Section 8 notice template</Link>.</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Tenant has left owing money</h3>
                  <p className="text-sm text-gray-700 mb-3">Focus on debt recovery with a money claim and evidence-ready arrears schedule.</p>
                  <Link href="/products/money-claim" className="text-primary font-medium hover:underline" data-cta="money-claim" data-cta-location="above-fold">Go to money-claim →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Your Options Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Your Three Options for Rent Arrears
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Choose the right <Link href="/eviction-notice-uk" className="text-primary hover:underline">eviction notice for your region</Link> based on your circumstances—recovering the money, regaining the property, or both.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Option 1: Rent Demand */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">1. Demand Payment</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Send a formal rent demand letter giving 14 days to pay. Often resolves issues
                    without legal action.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Fastest option
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No court fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Maintains relationship
                    </li>
                  </ul>
                  <Link
                    href="/tools/free-rent-demand-letter"
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                  >
                    Free rent demand letter
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Option 2: Section 8 Eviction */}
                <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Most Common
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">2. Evict for Arrears</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Serve a Section 8 notice using rent arrears grounds. Only 2 weeks notice
                    for Ground 8.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      2 weeks notice (Ground 8)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Mandatory possession
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Works after May 2026
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkNoticeOnly}
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                  >
                    Get Section 8 Notice — £49.99
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Option 3: Money Claim */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <PoundSterling className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">3. Claim the Money</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    File a county court claim through MCOL to recover unpaid rent. Can pursue
                    even after tenant leaves.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Recover full arrears
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Add interest & fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      CCJ if unpaid
                    </li>
                  </ul>
                  <Link
                    href={wizardLinkMoneyClaim}
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                  >
                    Start Money Claim — £99.99
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Pro tip:</strong> You can pursue eviction AND a money claim simultaneously.
                  Many landlords evict first, then claim arrears plus any damage costs once the tenant has left.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Need the quickest route for your exact scenario?"
                subtitle="Choose full eviction support if possession is the priority, or money claim if recovery is the goal."
                primaryHref="/products/complete-pack"
                primaryText="Get full eviction support"
                primaryDataCta="complete-pack"
                location="mid"
                secondaryLinks={[{ href: '/products/money-claim', text: 'Recover money owed instead', dataCta: 'money-claim' }]}
              />
            </div>
          </div>
        </section>

        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Related actions for rent arrears cases</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Link href="/section-8-rent-arrears-eviction" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  Use Section 8 for arrears-based eviction
                </Link>
                <Link href="/section-21-notice-template" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  Use Section 21 for no-fault possession
                </Link>
                <Link href="/products/money-claim" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  Recover arrears with a money claim pack
                </Link>
                <Link href="/tenancy-agreements" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  Update your next tenancy agreement to prevent repeat arrears
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8 Grounds Detail */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 8 Grounds for Rent Arrears
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                For rent arrears, you&apos;ll typically use one or more of these grounds. We recommend
                citing all applicable grounds for maximum protection.
              </p>

              <div className="space-y-6">
                {/* Ground 8 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-red-600">8</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Ground 8 — Mandatory</h3>
                        <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                          Court Must Grant
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        At least 2 months&apos; rent arrears when notice served AND at the court hearing.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Notice period:</span>
                          <span className="text-gray-600"> 2 weeks</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Outcome:</span>
                          <span className="text-gray-600"> Possession must be granted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ground 10 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-amber-600">10</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Ground 10 — Discretionary</h3>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                          Court May Grant
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Some rent lawfully due is unpaid when notice served AND proceedings begun.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Notice period:</span>
                          <span className="text-gray-600"> 2 weeks</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Outcome:</span>
                          <span className="text-gray-600"> Court considers reasonableness</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ground 11 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-amber-600">11</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900">Ground 11 — Discretionary</h3>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
                          Court May Grant
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        Tenant has persistently delayed paying rent, even if no arrears currently exist.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Notice period:</span>
                          <span className="text-gray-600"> 2 weeks</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Evidence needed:</span>
                          <span className="text-gray-600"> Pattern of late payments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Our Recommendation</h4>
                    <p className="text-gray-600 text-sm">
                      Cite all three grounds (8, 10, and 11) on your Section 8 notice. If the tenant pays
                      down arrears below 2 months before the hearing, you lose Ground 8 but can still
                      proceed with Grounds 10 and 11.
                    </p>
                  </div>
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
                pageType="problem"
                variant="section"
                jurisdiction="england"
                title="Need to Evict AND Claim the Money?"
                description="Our Complete Eviction Pack includes Section 8 notices with all rent arrears grounds, plus court forms if the tenant won't leave."
              />
            </div>
          </div>
        </section>

        {/* Calculate Arrears */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Calculate Your Total Arrears
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Before taking action, calculate exactly how much is owed including any interest you can claim.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Free Rent Arrears Calculator</h3>
                    <p className="text-gray-600 mb-4">
                      Enter your rent amount, payment dates, and we&apos;ll calculate total arrears with
                      statutory interest. Use this for your Section 8 notice or money claim.
                    </p>
                    <Link
                      href="/tools/rent-arrears-calculator"
                      className="hero-btn-primary inline-flex items-center gap-2"
                    >
                      <Calculator className="w-5 h-5" />
                      Calculate Arrears Free
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Money Claim Promotion Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <PoundSterling className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Tenant Left Without Paying? Claim Your Money Back
                    </h2>
                    <p className="text-gray-600 mb-4">
                      If your tenant has already moved out but still owes rent, a <strong>Money Claim</strong> through
                      the county court is often the best route. You can claim the full arrears plus 8% statutory interest.
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        AI-drafted Particulars of Claim
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        PAP-DEBT compliant Letter Before Action
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Interest calculation included
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Enforcement guidance if they don&apos;t pay
                      </li>
                    </ul>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/products/money-claim"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                      >
                        <Gavel className="w-5 h-5" />
                        Get Money Claim Pack — £99.99
                      </Link>
                      <Link
                        href="/money-claim-unpaid-rent"
                        className="inline-flex items-center gap-2 text-green-700 font-medium hover:underline"
                      >
                        Read the full guide
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={faqs}
          title="Tenant Not Paying Rent: FAQ"
          showContactCTA={false}
          variant="white"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="final"
                jurisdiction="england"
                title="Get Your Rent Arrears Documents Now"
                description="Section 8 notice with Ground 8, 10 & 11. AI compliance checking. Court-ready format."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={tenantNotPayingRentRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
