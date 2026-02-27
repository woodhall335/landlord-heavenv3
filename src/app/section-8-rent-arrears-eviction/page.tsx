import { Metadata } from 'next';
import Link from 'next/link';
import {
  StructuredData,
  breadcrumbSchema,
  HOWTO_SCHEMAS,
} from '@/lib/seo/structured-data';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { SocialProofCounter } from '@/components/ui/SocialProofCounter';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import {
  section8RelatedLinks,
  productLinks,
  toolLinks,
  guideLinks,
  moneyClaimGuides,
} from '@/lib/seo/internal-links';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { FAQSection } from '@/components/seo/FAQSection';
import { SeoLandingWrapper } from '@/components/seo/SeoLandingWrapper';
import { section8RentArrearsFAQs } from '@/data/faqs';
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
  XCircle,
  Calculator,
} from 'lucide-react';

const completePackLink = buildWizardLink({
  product: 'complete_pack',
  jurisdiction: 'england',
  src: 'seo_section_8_rent_arrears_eviction',
  topic: 'eviction',
});

const noticeOnlyLink = buildWizardLink({
  product: 'notice_only',
  jurisdiction: 'england',
  src: 'seo_section_8_rent_arrears_eviction',
  topic: 'eviction',
});

const moneyClaimLink = buildWizardLink({
  product: 'money_claim',
  jurisdiction: 'england',
  src: 'seo_section_8_rent_arrears_eviction',
  topic: 'debt',
});

export const metadata: Metadata = {
  title: 'Section 8 Rent Arrears Eviction | Ground 8, 10, 11 | Landlord Heaven',
  description:
    'Evict a tenant for rent arrears using Section 8. Ground 8 mandatory eviction for 2+ months arrears. 2-week notice. From £49.99.',
  keywords: [
    'section 8 rent arrears eviction',
    'ground 8 eviction process',
    'section 8 eviction court',
    'ground 8 rent arrears',
    'ground 10 eviction',
    'ground 11 eviction',
    'evict tenant rent arrears',
    'section 8 notice rent arrears',
    'mandatory ground 8',
  ],
  openGraph: {
    title: 'Section 8 Rent Arrears Eviction | Ground 8, 10, 11 | Landlord Heaven',
    description:
      'How to evict a tenant for rent arrears using Section 8. Ground 8 mandatory eviction for 2+ months arrears.',
    type: 'article',
    url: getCanonicalUrl('/section-8-rent-arrears-eviction'),
    siteName: 'Landlord Heaven',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Section 8 Rent Arrears Eviction | Landlord Heaven',
    description: 'How to evict a tenant for rent arrears using Section 8. Ground 8 mandatory eviction.',
  },
  alternates: {
    canonical: getCanonicalUrl('/section-8-rent-arrears-eviction'),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Section8RentArrearsEvictionPage() {
  return (
    <>
      <SeoLandingWrapper
        pagePath="/section-8-rent-arrears-eviction"
        pageTitle="Section 8 Rent Arrears Eviction"
        pageType="court"
        jurisdiction="england"
      />

      {/* Structured Data */}
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: getCanonicalUrl('/') },
          { name: 'Eviction Guides', url: getCanonicalUrl('/how-to-evict-tenant') },
          { name: 'Section 8 Rent Arrears Eviction', url: getCanonicalUrl('/section-8-rent-arrears-eviction') },
        ])}
      />
      <StructuredData data={HOWTO_SCHEMAS.section8Process} />

      <HeaderConfig mode="autoOnScroll" />
      <main>
        {/* Hero Section */}
        <UniversalHero
          title="Section 8 Rent Arrears Eviction"
          subtitle="Follow a legally validated, solicitor-grade, compliance-checked and court-ready route for Grounds 8, 10 and 11."
          primaryCta={{ label: `Get Section 8 Notice — ${PRODUCTS.notice_only.displayPrice}`, href: noticeOnlyLink }}
          secondaryCta={{ label: 'Also Need Court Forms?', href: completePackLink }}
          showTrustPositioningBar
          hideMedia
        />

        {/* Social Proof */}
        <section className="py-6 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <SocialProofCounter variant="total" className="justify-center" />
          </div>
        </section>

        {/* When to Use Section 8 */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                When to Use Section 8 for Rent Arrears
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Section 8 is the fastest route to eviction when your tenant owes rent. With only 2
                weeks notice and mandatory grounds, it&apos;s often more effective than Section 21.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* When to Use */}
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Use Section 8 When:
                  </h3>
                  <ul className="space-y-3 text-green-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span>Tenant owes 2+ months rent (mandatory Ground 8)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span>Tenant has any amount of rent arrears (Grounds 10/11)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span>You need faster notice period (2 weeks vs 2 months)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span>Tenant persistently pays late (Ground 11)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-1" />
                      <span>Section 21 may be invalid due to compliance issues</span>
                    </li>
                  </ul>
                </div>

                {/* Key Advantages */}
                <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Key Advantages:
                  </h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>
                        <strong>2 weeks notice</strong> for rent arrears (vs 2 months for Section
                        21)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>
                        <strong>Ground 8 is mandatory</strong>—court must grant possession
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>
                        <strong>No deposit/compliance requirements</strong> like Section 21
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>
                        <strong>Will survive Section 21 abolition</strong> (Renters Reform Bill)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                      <span>
                        <strong>Can claim rent arrears</strong> in the same court action
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Three Grounds */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Rent Arrears Grounds: 8, 10 & 11 Explained
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                For rent arrears, cite all three grounds on your Section 8 notice. This provides
                maximum protection if the tenant pays down arrears before the hearing.
              </p>

              <div className="space-y-6">
                {/* Ground 8 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold text-red-600">8</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">Ground 8 — Mandatory</h3>
                        <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full uppercase">
                          Court Must Grant
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        At least <strong>2 months&apos; rent</strong> is unpaid when the notice is
                        served AND at the court hearing. The court has no discretion—they must grant
                        possession.
                      </p>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Notice period</span>
                          <span className="font-bold text-gray-900">2 weeks</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Arrears required</span>
                          <span className="font-bold text-gray-900">2+ months</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Outcome</span>
                          <span className="font-bold text-red-600">Mandatory</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ground 10 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold text-amber-600">10</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">Ground 10 — Discretionary</h3>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase">
                          Court May Grant
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Some rent lawfully due is unpaid when the notice is served AND when
                        proceedings are begun. <strong>Any amount</strong> of arrears qualifies.
                      </p>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Notice period</span>
                          <span className="font-bold text-gray-900">2 weeks</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Arrears required</span>
                          <span className="font-bold text-gray-900">Any amount</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Outcome</span>
                          <span className="font-bold text-amber-600">Discretionary</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ground 11 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-bold text-amber-600">11</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">Ground 11 — Discretionary</h3>
                        <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full uppercase">
                          Court May Grant
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Tenant has <strong>persistently delayed</strong> paying rent, even if no
                        arrears currently exist. Useful if the tenant always pays late.
                      </p>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Notice period</span>
                          <span className="font-bold text-gray-900">2 weeks</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Evidence needed</span>
                          <span className="font-bold text-gray-900">Pattern of late payment</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm">
                          <span className="text-gray-500 block">Outcome</span>
                          <span className="font-bold text-amber-600">Discretionary</span>
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
                      <strong>Cite all three grounds</strong> on your Section 8 notice. If the
                      tenant pays down arrears below 2 months before the hearing, you lose Ground 8
                      but can still proceed with Grounds 10 and 11.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Critical: 2 Months Requirement */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                The 2 Months Arrears Requirement (Ground 8)
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                For Ground 8 mandatory possession, you must prove 2+ months arrears at two critical
                points. Understanding this is essential.
              </p>

              <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Point 1: When Notice Served</h3>
                    <p className="text-gray-600 text-sm">
                      Tenant must owe at least 2 full months&apos; rent on the day you serve the
                      Section 8 notice.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Gavel className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Point 2: At Court Hearing</h3>
                    <p className="text-gray-600 text-sm">
                      Tenant must still owe at least 2 full months&apos; rent when the court hears
                      your case.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-medium">Critical Warning</p>
                      <p className="text-amber-800 text-sm">
                        If the tenant pays down arrears to less than 2 months{' '}
                        <strong>before the court hearing</strong>, Ground 8 fails. This is why you
                        should also cite Grounds 10 and 11 as backup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">How to Calculate 2 Months:</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white">1</span>
                      </div>
                      <span>
                        <strong>Monthly rent:</strong> 2 months = 2× the monthly rent amount
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white">2</span>
                      </div>
                      <span>
                        <strong>Weekly rent:</strong> 2 months = 8 weeks&apos; rent
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white">3</span>
                      </div>
                      <span>
                        <strong>Example:</strong> If rent is £1,000/month, the tenant must owe at
                        least £2,000
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/tools/rent-arrears-calculator"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate Your Tenant&apos;s Arrears
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What Happens at Court */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Section 8 Court Hearing Process
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                Unlike Section 21, Section 8 requires a court hearing. Here is what to expect.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Before Hearing */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Before the Hearing</h3>
                  <ul className="space-y-3 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Submit Form N5 (possession claim) and N119 (particulars)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Pay court fee of £355</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Prepare rent schedule showing all arrears</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Gather evidence: tenancy agreement, payment records, correspondence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Expect 6-12 weeks wait for hearing date</span>
                    </li>
                  </ul>
                </div>

                {/* At Hearing */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">At the Hearing</h3>
                  <ul className="space-y-3 text-gray-600 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Hearings are usually 15-30 minutes in county court</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Judge confirms current arrears amount</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>For Ground 8: if 2+ months owed, possession granted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>For Grounds 10/11: judge considers if reasonable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>You can represent yourself (no solicitor required)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Possible Outcomes:</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-bold text-green-900">Outright Possession</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Tenant must leave within 14-42 days
                    </p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                    <h4 className="font-bold text-amber-900">Suspended Order</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Tenant stays if they pay arrears + current rent
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-bold text-red-900">Claim Dismissed</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Rare if grounds proven correctly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Also Claim Rent Arrears */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Claiming Rent Arrears in Possession Proceedings
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                You can claim the rent owed as part of your Section 8 possession claim—or file a
                separate money claim.
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* In Possession Proceedings */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-primary" />
                    In Possession Claim (Form N5)
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Add rent arrears to your N5 possession claim. The court can order the tenant to
                    pay arrears along with the possession order.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Single court case
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      One set of fees
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Dealt with at possession hearing
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Cannot use accelerated procedure
                    </li>
                  </ul>
                </div>

                {/* Separate Money Claim */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PoundSterling className="w-5 h-5 text-green-600" />
                    Separate Money Claim (MCOL)
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    File a separate claim through Money Claim Online after the tenant leaves. Claim
                    arrears plus 8% statutory interest.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Claim up to 6 years after debt arose
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Add damage costs after checkout
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Add 8% statutory interest
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Separate court fees apply
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PoundSterling className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-2">
                      Need to Claim Rent Arrears?
                    </h3>
                    <p className="text-green-800 mb-4">
                      Our Money Claim Pack includes everything you need: Letter Before Action,
                      Particulars of Claim, schedule of debt, and MCOL instructions.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Link
                        href={moneyClaimLink}
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                      >
                        Get Money Claim Pack — {PRODUCTS.money_claim.displayPrice}
                      </Link>
                      <Link
                        href="/money-claim-unpaid-rent"
                        className="inline-flex items-center gap-2 text-green-700 font-medium hover:underline text-sm"
                      >
                        Read full guide
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Common Section 8 Mistakes to Avoid
              </h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                These errors can delay or derail your Section 8 rent arrears eviction.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Wrong Arrears Calculation</h3>
                      <p className="text-gray-600 text-sm">
                        Miscounting the arrears amount. For Ground 8, you need exactly 2 full
                        months. Use a rent schedule to track dates and amounts.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Only Citing Ground 8</h3>
                      <p className="text-gray-600 text-sm">
                        If tenant pays down to less than 2 months before hearing, you lose. Always
                        cite Grounds 10 and 11 as backup.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Late Court Application</h3>
                      <p className="text-gray-600 text-sm">
                        Section 8 notice is valid for 12 months. But don&apos;t wait—arrears levels
                        fluctuate. Apply to court promptly after notice expires.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Poor Evidence at Hearing</h3>
                      <p className="text-gray-600 text-sm">
                        Bring: tenancy agreement, rent schedule, bank statements showing missed
                        payments, copy of Section 8 notice, and proof of service.
                      </p>
                    </div>
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
                pageType="court"
                variant="section"
                jurisdiction="england"
                pagePath="/section-8-rent-arrears-eviction"
                title="Get Your Section 8 Rent Arrears Notice"
                description="Includes Ground 8, 10, and 11. Pre-filled for your situation. Court-ready format with AI compliance checking."
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={section8RentArrearsFAQs}
          title="Section 8 Rent Arrears: Frequently Asked Questions"
          showContactCTA={false}
          variant="gray"
        />

        {/* Final CTA */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <SeoCtaBlock
                pageType="problem"
                variant="final"
                jurisdiction="england"
                pagePath="/section-8-rent-arrears-eviction"
                title="Get Your Rent Arrears Eviction Documents"
                description="Section 8 notice with Grounds 8, 10 & 11. AI compliance check. Designed for court acceptance."
              />

              <SeoDisclaimer className="max-w-4xl mx-auto" />
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <RelatedLinks
                title="Related Resources"
                links={[
                  ...section8RelatedLinks,
                  productLinks.moneyClaim,
                  moneyClaimGuides.unpaidRent,
                  toolLinks.rentArrearsCalculator,
                ]}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
