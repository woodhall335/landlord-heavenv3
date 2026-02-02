import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import {
  RiFileTextLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
  RiDownloadLine,
  RiQuestionLine,
  RiAlertLine,
  RiCalendarLine,
  RiFileWarningLine,
  RiScales3Line
} from 'react-icons/ri';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { RelatedLinks } from '@/components/seo/RelatedLinks';
import { SeoCtaBlock, SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { tenancyAgreementNILinks } from '@/lib/seo/internal-links';
import { FAQSection } from '@/components/seo/FAQSection';
import { northernIrelandFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Notice to Quit Northern Ireland Guide 2026 | Landlord Eviction Process',
  description: 'Guide to Notice to Quit in Northern Ireland. Notice periods, valid grounds, and correct service under the Private Tenancies Act 2022.',
  keywords: [
    'notice to quit Northern Ireland',
    'NI eviction notice',
    'Northern Ireland landlord eviction',
    'Private Tenancies Act notice',
    'NI notice period',
    'evict tenant Northern Ireland',
    'landlord notice NI',
    'NTQ Northern Ireland',
    'possession order NI',
    'tenant eviction NI',
  ],
  alternates: {
    canonical: getCanonicalUrl('/notice-to-quit-northern-ireland-guide'),
  },
  openGraph: {
    title: 'Notice to Quit Northern Ireland Guide 2026 | Landlord Eviction Process',
    description: 'Complete NI Notice to Quit guide. Learn notice periods, valid grounds, and avoid common mistakes.',
    type: 'article',
    url: getCanonicalUrl('/notice-to-quit-northern-ireland-guide'),
  },
};

export default function NoticeToQuitNIGuidePage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Notice to Quit Northern Ireland Guide 2026 | Landlord Eviction Process',
          description: 'Complete guide to Notice to Quit in Northern Ireland. Understand notice periods, valid grounds, correct service, and how to avoid invalid notices under the Private Tenancies Act 2022.',
          url: getCanonicalUrl('/notice-to-quit-northern-ireland-guide'),
          datePublished: '2024-03-01',
          dateModified: '2025-01-20',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Tenancy Agreements', url: '/tenancy-agreements' },
          { name: 'Northern Ireland', url: '/tenancy-agreements/northern-ireland' },
          { name: 'Notice to Quit Guide', url: '/notice-to-quit-northern-ireland-guide' },
        ])}
      />

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Breadcrumb */}
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-amber-600">Home</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/tenancy-agreements" className="hover:text-amber-600">Tenancy Agreements</Link></li>
              <li className="text-slate-400">/</li>
              <li><Link href="/tenancy-agreements/northern-ireland" className="hover:text-amber-600">Northern Ireland</Link></li>
              <li className="text-slate-400">/</li>
              <li className="text-slate-900 font-medium">Notice to Quit Guide</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-800 via-slate-900 to-slate-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-2 text-red-300 mb-4">
              <RiFileWarningLine className="w-5 h-5" />
              <span className="text-sm font-medium">Private Tenancies Act 2022 Requirements</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Notice to Quit Northern Ireland: Complete Guide 2026
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-2xl">
              Master the Notice to Quit process in Northern Ireland. Learn about notice periods, valid grounds,
              correct service methods, and the common mistakes that invalidate eviction notices.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/wizard?product=notice_only&src=seo_ni_ntq_guide&topic=eviction&jurisdiction=northern-ireland"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiFileTextLine className="w-5 h-5" />
                Create Valid Notice
                <RiArrowRightLine className="w-5 h-5" />
              </Link>
              <Link
                href="#notice-periods"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
              >
                <RiTimeLine className="w-5 h-5" />
                View Notice Periods
              </Link>
            </div>
          </div>
        </section>

        {/* Warning Banner */}
        <section className="bg-amber-50 border-b border-amber-200 py-6">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-start gap-4">
              <RiAlertLine className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <h2 className="font-semibold text-amber-900">Why Getting Your Tenancy Agreement Right Matters for Eviction</h2>
                <p className="text-amber-800 mt-1">
                  Under the Private Tenancies Act 2022, you <strong>cannot serve a valid Notice to Quit</strong> unless
                  you've provided a written tenancy agreement, protected the deposit, and registered as a landlord.
                  Start with the right foundation to avoid costly delays.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <section className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-slate-600 leading-relaxed">
              Ending a tenancy in Northern Ireland requires careful compliance with the Private Tenancies Act (NI) 2022.
              An invalid Notice to Quit can add months to the eviction process and cost thousands in wasted court fees.
              This guide explains how to serve valid notices and avoid the most common mistakes landlords make.
            </p>
          </section>

          {/* Prerequisites Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiShieldCheckLine className="w-6 h-6 text-emerald-600" />
              Prerequisites for Valid Notice to Quit
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <p className="text-red-900 font-medium mb-4">
                Before you can serve a valid Notice to Quit, you must have complied with ALL of these requirements:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3 text-red-800">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Registered with council Landlord Registration Scheme</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Provided written tenancy agreement within 28 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Protected deposit within 14 days</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-red-800">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Provided deposit prescribed information within 28 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Provided valid EPC and Gas Safety Certificate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>EICR (from April 2025)</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
              <h3 className="font-semibold text-emerald-900 mb-3">Don't Have a Proper Tenancy Agreement?</h3>
              <p className="text-emerald-800 mb-4">
                If you haven't provided a compliant written tenancy agreement, you cannot serve a valid Notice to Quit.
                Create one now before attempting any eviction action.
              </p>
              <Link
                href="/wizard?product=ast_standard&src=seo_ni_ntq_guide_prereq&topic=tenancy&jurisdiction=northern-ireland"
                className="inline-flex items-center gap-2 text-emerald-700 font-medium hover:text-emerald-800"
              >
                Create Tenancy Agreement First <RiArrowRightLine className="w-4 h-4" />
              </Link>
            </div>
          </section>

          {/* Notice Periods Section */}
          <section className="mb-12" id="notice-periods">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiCalendarLine className="w-6 h-6 text-emerald-600" />
              Notice Periods in Northern Ireland
            </h2>
            <p className="text-slate-600 mb-6">
              The Private Tenancies Act 2022 introduced tiered notice periods based on tenancy length.
              Using the wrong notice period will invalidate your Notice to Quit.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-800 text-white rounded-xl p-6 text-center">
                <div className="text-4xl font-bold">28</div>
                <div className="text-slate-300 font-medium">days minimum</div>
                <div className="text-sm text-slate-400 mt-2">Tenancy under 12 months</div>
                <div className="text-xs text-slate-500 mt-1">(4 weeks)</div>
              </div>
              <div className="bg-slate-800 text-white rounded-xl p-6 text-center">
                <div className="text-4xl font-bold">56</div>
                <div className="text-slate-300 font-medium">days minimum</div>
                <div className="text-sm text-slate-400 mt-2">Tenancy 1-5 years</div>
                <div className="text-xs text-slate-500 mt-1">(8 weeks)</div>
              </div>
              <div className="bg-slate-800 text-white rounded-xl p-6 text-center">
                <div className="text-4xl font-bold">84</div>
                <div className="text-slate-300 font-medium">days minimum</div>
                <div className="text-sm text-slate-400 mt-2">Tenancy over 5 years</div>
                <div className="text-xs text-slate-500 mt-1">(12 weeks)</div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm">
                <strong>Important:</strong> The notice period runs from the date the tenant receives the notice,
                not the date you send it. Always add a few days for postal delivery or use recorded delivery
                to prove the service date.
              </p>
            </div>
          </section>

          {/* Valid Grounds Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiScales3Line className="w-6 h-6 text-emerald-600" />
              Valid Grounds for Notice to Quit
            </h2>
            <p className="text-slate-600 mb-6">
              Unlike Section 21 in England, Northern Ireland requires landlords to state valid grounds for
              ending a tenancy. The Notice to Quit must specify which ground applies.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 text-emerald-700">Property Grounds</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Landlord intends to sell the property</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Landlord or family member moving in</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Substantial renovation required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Property no longer for renting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Employer landlord property</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4 text-red-700">Tenant Fault Grounds</h3>
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Rent arrears over 8 weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Anti-social behaviour</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Breach of tenancy terms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>Property damage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <RiCheckboxCircleLine className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                    <span>False statement to obtain tenancy</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Common Mistakes Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiAlertLine className="w-6 h-6 text-red-600" />
              Common Mistakes That Invalidate Notices
            </h2>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900">❌ Wrong notice period</h4>
                <p className="text-red-800 text-sm mt-1">
                  Using 28 days when the tenant has lived there over 12 months invalidates the notice entirely.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900">❌ No written tenancy agreement</h4>
                <p className="text-red-800 text-sm mt-1">
                  Serving a NTQ when you haven't provided the required written statement makes it invalid.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900">❌ Unprotected deposit</h4>
                <p className="text-red-800 text-sm mt-1">
                  If the deposit wasn't protected in an approved scheme, any Notice to Quit is invalid.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900">❌ Not registered as landlord</h4>
                <p className="text-red-800 text-sm mt-1">
                  Unregistered landlords cannot serve valid eviction notices - register first.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900">❌ Wrong form or missing grounds</h4>
                <p className="text-red-800 text-sm mt-1">
                  Using an informal letter instead of the prescribed form, or failing to state grounds, invalidates the notice.
                </p>
              </div>
            </div>
          </section>

          {/* Process Timeline */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <RiTimeLine className="w-6 h-6 text-emerald-600" />
              The Eviction Process Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Verify Prerequisites</h4>
                  <p className="text-slate-600 text-sm">Confirm tenancy agreement, deposit protection, and landlord registration are in place.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Serve Notice to Quit</h4>
                  <p className="text-slate-600 text-sm">Use prescribed form with correct notice period and valid grounds. Keep proof of service.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Wait for Notice Period</h4>
                  <p className="text-slate-600 text-sm">28/56/84 days depending on tenancy length. Cannot proceed to court until expired.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Apply to County Court</h4>
                  <p className="text-slate-600 text-sm">If tenant hasn't left, apply for possession order. Court reviews validity of NTQ and grounds.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold shrink-0">5</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Court Hearing</h4>
                  <p className="text-slate-600 text-sm">Attend hearing. If grounds proven, court grants possession order with eviction date.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold shrink-0">6</div>
                <div>
                  <h4 className="font-semibold text-slate-900">Bailiff Enforcement</h4>
                  <p className="text-slate-600 text-sm">If tenant still won't leave, apply for warrant of possession. Bailiffs enforce eviction.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-slate-100 rounded-xl p-4">
              <p className="text-slate-700 text-sm">
                <strong>Total timeline:</strong> A straightforward eviction typically takes 3-6 months from notice to
                vacant possession. Contested cases or errors can extend this to 9-12 months or longer.
              </p>
            </div>
          </section>

          {/* Mid-page CTA */}
          <SeoCtaBlock
            pageType="tenancy"
            variant="section"
            jurisdiction="northern-ireland"
          />

          {/* FAQ Section */}
          <section className="mb-12">
            <FAQSection
              faqs={northernIrelandFAQs}
              title="Northern Ireland Eviction FAQ"
              showContactCTA={false}
              variant="white"
            />
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-br from-emerald-800 to-slate-900 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              Start With a Valid Tenancy Agreement
            </h2>
            <p className="text-emerald-100 mb-6 max-w-xl mx-auto">
              Before you can serve a valid Notice to Quit, you need a compliant tenancy agreement.
              Our wizard ensures all prescribed terms are included for Northern Ireland.
            </p>
            <Link
              href="/wizard?product=ast_standard&src=seo_ni_ntq_guide_final&topic=tenancy&jurisdiction=northern-ireland"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              <RiDownloadLine className="w-5 h-5" />
              Create Compliant Agreement
              <RiArrowRightLine className="w-5 h-5" />
            </Link>
          </section>

          {/* Related Links */}
          <div className="mt-12">
            <RelatedLinks links={tenancyAgreementNILinks} />
          </div>

          {/* Disclaimer */}
          <SeoDisclaimer />
        </article>
      </main>
    </>
  );
}
