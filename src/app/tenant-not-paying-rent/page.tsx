import { Metadata } from 'next';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import Link from 'next/link';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  tenantNotPayingRentRelatedLinks,
} from '@/lib/seo/internal-links';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoPageContextPanel } from '@/components/seo/SeoPageContextPanel';
import { tenantNotPayingRentFAQs } from '@/data/faqs';
import { NeedHelpChoosing, FunnelCta } from '@/components/funnels';
import { PRODUCTS } from '@/lib/pricing/products';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  PoundSterling,
  Shield,
  Calculator,
  Mail,
  Gavel,
} from 'lucide-react';

const faqs = tenantNotPayingRentFAQs;
const noticeOnlyPrice = PRODUCTS.notice_only.displayPrice;
const moneyClaimPrice = PRODUCTS.money_claim.displayPrice;

export { UNIVERSAL_HERO_VIEWPORT as viewport } from '@/lib/seo/hero-theme';

export const metadata: Metadata = {
  title: 'Tenant Not Paying Rent? Plain-English Landlord Guide',
  description: 'What to do when your tenant stops paying rent, including rent demand letters, Section 8 eviction, and money claims through court.',
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
    description: 'Practical guide for landlords dealing with rent arrears. Demand letters, eviction, and money claims explained in plain English.',
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
          subtitle={<>If your tenant has stopped paying, you usually have <strong>three main routes</strong>: push for payment, start possession for arrears, or recover the debt through court. This page helps you choose the right one.</>}
          primaryCta={{ label: 'Start your money claim', href: '/products/money-claim' }}
          secondaryCta={{ label: 'See Section 8 notice route', href: '/section-8-notice' }}
          variant="pastel"
        >
          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mt-4">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Grounds 8, 10 and 11 explained
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Built around court-ready paperwork
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              Two-week notice route for arrears
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
                  <h3 className="font-semibold text-gray-900 mb-2">Tenant is still in the property</h3>
                  <p className="text-sm text-gray-700 mb-3">Use possession-focused support to serve Section 8 properly and move to court if the tenant still stays.</p>
                  <Link href="/section-8-notice" className="text-primary font-medium hover:underline" data-cta="section-8-notice-guide" data-cta-location="above-fold">See Section 8 notice guide -&gt;</Link>
                  <p className="text-xs text-gray-500 mt-2">Also follow the <Link href="/eviction-process-uk" className="underline">eviction process in the UK</Link> if getting the property back is the priority.</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-5 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-2">Tenant has already left owing money</h3>
                  <p className="text-sm text-gray-700 mb-3">Focus on debt recovery with a money claim and an evidence-ready arrears schedule.</p>
                  <Link href="/products/money-claim" className="text-primary font-medium hover:underline" data-cta="money-claim" data-cta-location="above-fold">Go to money claim -&gt;</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-10 bg-white">
          <div className="container mx-auto px-4">
            <SeoPageContextPanel
              pathname="/tenant-not-paying-rent"
              className="mx-auto max-w-4xl border border-green-200 bg-green-50"
            />
          </div>
        </section>

        {/* Your Options Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Your three main options for rent arrears
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Because <Link href="/section-21-ban-uk" className="text-primary hover:underline">Section 21 ended in England on 1 May 2026</Link>, most arrears cases now start with a <Link href="/section-8-notice" className="text-primary hover:underline">Section 8 notice for rent arrears</Link> and a clear plan for what happens next if the tenant still does not pay or leave.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Option 1: Rent Demand */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">1. Ask for payment formally</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Send a formal rent demand letter giving the tenant a clear chance to pay.
                    This often resolves the issue without legal action.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Fastest place to start
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      No court fee at this stage
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Can preserve the tenancy relationship
                    </li>
                  </ul>
                  <Link
                    href="/tools/free-rent-demand-letter"
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                  >
                    Use the free rent demand letter
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">2. Start possession for arrears</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Serve a Section 8 notice using rent arrears grounds. In many cases,
                    Ground 8 now gives a four-week notice period.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      4 weeks notice (Ground 8)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Mandatory ground if the test is still met
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      Current route after May 2026
                    </li>
                  </ul>
                  <Link
                    href="/products/notice-only"
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                  >
                    {`Start Section 8 notice - ${noticeOnlyPrice}`}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Option 3: Money Claim */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <PoundSterling className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">3. Recover the debt through court</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    File a county court claim through MCOL to recover unpaid rent. You can do
                    this even after the tenant has left.
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Claim the full arrears
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Add interest and eligible fees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Can lead to a CCJ if unpaid
                    </li>
                  </ul>
                  <Link
                    href="/products/money-claim"
                    className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                  >
                    {`Start money claim - ${moneyClaimPrice}`}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Practical point:</strong> you can pursue possession and a money claim at the same time.
                  Many landlords secure the property back first, then continue with arrears and any damage claim once the tenant has gone.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <FunnelCta
                title="Need the right route for your exact arrears case?"
                subtitle="Start with the money claim route if recovery is the priority, or move into possession support if the tenant is still in the property."
                primaryHref="/products/money-claim"
                primaryText="Start money claim"
                primaryDataCta="money-claim"
                location="mid"
                secondaryLinks={[{ href: '/products/complete-pack', text: 'Need possession as well? Start full eviction support', dataCta: 'complete-pack' }]}
              />
            </div>
          </div>
        </section>

        <section className="py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Related actions for rent arrears cases</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Link href="/section-8-notice" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  Use a Section 8 notice for rent arrears
                </Link>
                <Link href="/section-21-ban-uk" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  See what replaces Section 21 after 1 May 2026
                </Link>
                <Link href="/products/money-claim" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  Recover arrears with a money claim pack
                </Link>
                <Link href="/tenancy-agreements" className="rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors">
                  Update your next tenancy agreement to reduce the risk of repeat arrears
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
                Section 8 grounds commonly used for rent arrears
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                For rent arrears, landlords often rely on one or more of these grounds. We usually
                recommend citing every ground that genuinely fits the facts.
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
                        <h3 className="font-bold text-gray-900">Ground 8 - Mandatory</h3>
                        <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                          Court Must Grant
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        At least 3 months&apos; rent arrears, or 13 weeks&apos; rent for weekly and fortnightly payments, when notice is served AND at the court hearing.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Notice period:</span>
                          <span className="text-gray-600"> 4 weeks</span>
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
                        <h3 className="font-bold text-gray-900">Ground 10 - Discretionary</h3>
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
                          <span className="text-gray-600"> 4 weeks</span>
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
                        <h3 className="font-bold text-gray-900">Ground 11 - Discretionary</h3>
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
                          <span className="text-gray-600"> 4 weeks</span>
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
                    <h4 className="font-semibold text-gray-900 mb-1">Recommended approach</h4>
                    <p className="text-gray-600 text-sm">
                      Cite all three grounds (8, 10, and 11) on the Section 8 notice if the facts support them. If the tenant pays
                      the arrears below the Ground 8 threshold before the hearing, you may lose Ground 8 but still
                      continue under Grounds 10 and 11.
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
                pagePath="/tenant-not-paying-rent"
                jurisdiction="england"
                title="Need the strongest arrears route?"
                description="Use the money claim route when recovering the debt is the priority, then move into the Section 8 possession path if you still need the property back."
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
                  Calculate the total arrears first
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Before you take action, calculate exactly what is owed, including any interest you may be able to claim.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calculator className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Free rent arrears calculator</h3>
                    <p className="text-gray-600 mb-4">
                      Enter the rent amount and payment dates and we&apos;ll calculate the total arrears with
                      statutory interest. Use this when preparing a Section 8 notice or a money claim.
                    </p>
                    <Link
                      href="/tools/rent-arrears-calculator"
                      className="hero-btn-primary inline-flex items-center gap-2"
                    >
                      <Calculator className="w-5 h-5" />
                      Calculate arrears free
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
                      Tenant left without paying? Recover the money properly
                    </h2>
                    <p className="text-gray-600 mb-4">
                      If your tenant has already moved out but still owes rent, a <strong>money claim</strong> through
                      the county court is often the best route. You can usually claim the arrears plus 8% statutory interest.
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-3 mb-6 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        AI-drafted particulars of claim
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        PAP-DEBT compliant letter before action
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Interest calculation included
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        Enforcement guidance if they still do not pay
                      </li>
                    </ul>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/products/money-claim"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                      >
                        <Gavel className="w-5 h-5" />
                        {`Start money claim pack - ${moneyClaimPrice}`}
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
          title="Tenant not paying rent: questions landlords ask"
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
                pagePath="/tenant-not-paying-rent"
                jurisdiction="england"
                title="Start with the strongest rent arrears route"
                description="Recover unpaid rent with the money claim route, then use the Section 8 possession path when you still need the property back."
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
                title="Related landlord resources"
                links={tenantNotPayingRentRelatedLinks}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}








