import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import { buildAskHeavenLink } from '@/lib/ask-heaven/buildAskHeavenLink';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Scale,
  FileText,
  MapPin,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { landingPageLinks, productLinks, guideLinks } from '@/lib/seo/internal-links';
import { howToEvictTenantFAQs } from '@/data/faqs';

// Pre-built Ask Heaven compliance links for eviction page
const complianceLinks = {
  deposit: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'deposit',
    prompt: 'What are the deposit protection rules for eviction?',
    utm_campaign: 'how-to-evict-tenant',
  }),
  gasSafety: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'gas_safety',
    prompt: 'Do I need a gas safety certificate to evict my tenant?',
    utm_campaign: 'how-to-evict-tenant',
  }),
  epc: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'epc',
    prompt: 'Is an EPC required before serving eviction notice?',
    utm_campaign: 'how-to-evict-tenant',
  }),
  compliance: buildAskHeavenLink({
    source: 'page_cta',
    topic: 'eviction',
    prompt: 'What compliance documents do I need before evicting a tenant?',
    utm_campaign: 'how-to-evict-tenant',
  }),
};

export const metadata: Metadata = {
  title: 'How to Evict a Tenant in 2026 (Landlord Guide)',
  description:
    'For landlords who need a compliant eviction route without wasted time or court delays. Clear steps, notice periods, and templates for England, Wales, Scotland & Northern Ireland.',
  keywords: [
    'how to evict a tenant',
    'evict tenant UK',
    'eviction process UK',
    'landlord eviction guide',
    'section 21 eviction',
    'section 8 eviction',
    'notice to leave scotland',
    'renting homes wales act eviction',
  ],
  openGraph: {
    title: 'How to Evict a Tenant in 2026 (Landlord Guide)',
    description:
      'Landlord guide to legal eviction steps, timelines, and compliant notices across the UK.',
    type: 'article',
    url: getCanonicalUrl('/how-to-evict-tenant'),
  },
  alternates: {
    canonical: getCanonicalUrl('/how-to-evict-tenant'),
  },
};

export default function HowToEvictTenantPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'How to Evict a Tenant in the UK',
          description:
            'Landlord guide to eviction steps, notice periods, court routes, and compliant documents across the UK.',
          url: getCanonicalUrl('/how-to-evict-tenant'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-01',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'How to Evict a Tenant', url: 'https://landlordheaven.co.uk/how-to-evict-tenant' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <AlertTriangle className="w-4 h-4" />
                Section 21 ends 1 May 2026 in England
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                How to Evict a Tenant in the UK (Landlord Guide)
              </h1>

              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Complete guide to legally evicting a tenant across <strong>England</strong>,{' '}
                <strong>Wales</strong>, <strong>Scotland</strong> and{' '}
                <strong>Northern Ireland</strong>. Step-by-step process, notice periods, and
                court procedures.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl transition-colors"
                >
                  Get Eviction Notice — £49.99
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/20"
                >
                  Complete Eviction Pack — £199.99
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Jump Navigation */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Jump to your jurisdiction:
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#england"
                  className="px-4 py-2 bg-gray-100 hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🏴󠁧󠁢󠁥󠁮󠁧󠁿 England
                </a>
                <a
                  href="#wales"
                  className="px-4 py-2 bg-gray-100 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales
                </a>
                <a
                  href="#scotland"
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland
                </a>
                <a
                  href="#northern-ireland"
                  className="px-4 py-2 bg-gray-100 hover:bg-green-600 hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🇬🇧 Northern Ireland
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Overview Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                UK Eviction Process Overview
              </h2>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  Evicting a tenant in the UK requires following strict legal procedures. The
                  process varies significantly depending on which part of the UK your property
                  is located in:
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Not sure which eviction route to use?
                    </p>
                    <p className="text-sm text-gray-600">
                      Our free{' '}
                      <Link href={complianceLinks.compliance} className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      can help you understand your options for England, Wales, Scotland, or Northern Ireland.
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 ml-9">
                  <Link
                    href={complianceLinks.deposit}
                    className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                  >
                    Deposit rules for eviction →
                  </Link>
                  <Link
                    href={complianceLinks.gasSafety}
                    className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                  >
                    Gas safety requirements →
                  </Link>
                  <Link
                    href={complianceLinks.epc}
                    className="text-xs bg-white border border-purple-200 hover:border-primary text-gray-700 hover:text-primary px-3 py-2 rounded-lg transition-colors text-center"
                  >
                    EPC requirements →
                  </Link>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    General Timeline
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900">Notice period:</span>
                      2 weeks to 6 months
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900">Court process:</span>
                      6-16 weeks
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900">Bailiff enforcement:</span>
                      4-8 weeks
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-gray-900">Total:</span>
                      3-8 months typical
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Key Requirements
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Valid tenancy agreement
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Deposit protected in approved scheme
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Gas safety certificate provided
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      EPC provided before tenancy
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Correct notice served properly
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* England Section */}
        <section id="england" className="py-12 lg:py-16 bg-white scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                <h2 className="text-3xl font-bold text-gray-900">Evicting a Tenant in England</h2>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm">
                  <strong>Important:</strong> Section 21 "no-fault" eviction ends 1 May 2026
                  under the Renters Rights Act 2025. After this date, you will need grounds
                  for eviction (similar to Section 8).
                </p>
              </div>

              <div className="space-y-8">
                {/* Section 21 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Section 21 Notice (No-Fault Eviction)
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use Section 21 when you want to regain possession without giving a reason.
                    Available until 30 April 2026.
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>
                        <strong>Notice period:</strong> Minimum 2 months
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>
                        <strong>Form:</strong> Prescribed Form 6A
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>
                        <strong>Court process:</strong> Accelerated possession (no hearing for
                        uncontested)
                      </span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/section-21-notice-template"
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      Section 21 Template →
                    </Link>
                    <Link
                      href="/tools/validators/section-21"
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      Section 21 Checker →
                    </Link>
                  </div>
                </div>

                {/* Section 8 */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Section 8 Notice (Grounds-Based Eviction)
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Use Section 8 when you have specific grounds such as rent arrears,
                    antisocial behaviour, or breach of tenancy. Will remain available after
                    May 2026.
                  </p>
                  <ul className="space-y-2 text-gray-600 mb-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>
                        <strong>Notice period:</strong> 2 weeks (serious arrears) to 2 months
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>
                        <strong>Common grounds:</strong> Ground 8 (2+ months arrears), Ground 10
                        (any arrears), Ground 12 (breach), Ground 14 (antisocial behaviour)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                      <span>
                        <strong>Court process:</strong> Standard possession claim (hearing
                        required)
                      </span>
                    </li>
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/section-8-notice-template"
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      Section 8 Template →
                    </Link>
                    <Link
                      href="/tools/validators/section-8"
                      className="text-primary hover:underline font-medium text-sm"
                    >
                      Section 8 Checker →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                <h4 className="font-bold text-gray-900 mb-3">England Eviction Products</h4>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/products/notice-only"
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    <FileText className="w-4 h-4" />
                    Notice Only — £49.99
                  </Link>
                  <Link
                    href="/products/complete-pack"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
                  >
                    <FileText className="w-4 h-4" />
                    Complete Pack — £199.99
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Wales Section */}
        <section id="wales" className="py-12 lg:py-16 bg-red-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴󠁧󠁢󠁷󠁬󠁳󠁿</span>
                <h2 className="text-3xl font-bold text-gray-900">Evicting a Tenant in Wales</h2>
              </div>

              <div className="bg-red-100 border-l-4 border-red-600 p-4 mb-8 rounded-r-lg">
                <p className="text-red-900 text-sm">
                  <strong>Important:</strong> Wales uses the <strong>Renting Homes (Wales) Act 2016</strong>,
                  not Section 21/Section 8. Since December 2022, "no-fault" eviction has been
                  abolished in Wales. Different notices and procedures apply.
                </p>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  In Wales, tenancy agreements are called <strong>occupation contracts</strong>.
                  Landlords must follow the Renting Homes (Wales) Act 2016 procedures, which
                  provide greater tenant protections than England.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Wales Eviction Process Overview
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Standard contracts:</strong> Generally require 6 months notice
                      for landlord-initiated possession
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Serious rent arrears:</strong> Shorter notice periods may apply
                      (consult current Welsh Government guidance)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Breach of contract:</strong> Specific grounds and notice periods
                      under Welsh law
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Court process:</strong> Apply to county court for possession
                      order
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/wales-eviction-notices"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700"
                >
                  Wales Eviction Guide →
                </Link>
                <Link
                  href="/tenancy-agreements/wales"
                  className="inline-flex items-center gap-2 bg-white text-red-600 border border-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50"
                >
                  Wales Occupation Contracts →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Scotland Section */}
        <section id="scotland" className="py-12 lg:py-16 bg-blue-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                <h2 className="text-3xl font-bold text-gray-900">Evicting a Tenant in Scotland</h2>
              </div>

              <div className="bg-blue-100 border-l-4 border-blue-600 p-4 mb-8 rounded-r-lg">
                <p className="text-blue-900 text-sm">
                  <strong>Important:</strong> Scotland uses <strong>Private Residential Tenancies (PRTs)</strong>
                  and <strong>Notice to Leave</strong>, not Section 21/Section 8. Evictions are handled
                  by the First-tier Tribunal for Scotland, not the courts.
                </p>
              </div>

              <div className="prose prose-lg max-w-none mb-8">
                <p>
                  Since December 2017, all new private tenancies in Scotland are{' '}
                  <strong>Private Residential Tenancies (PRTs)</strong>, which are open-ended
                  (no fixed term). Landlords must have one of 18 legal eviction grounds and
                  serve a <strong>Notice to Leave</strong>.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Scotland Notice to Leave Requirements
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Rent arrears (3+ months):</strong> 28 days notice (Ground 12)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Landlord selling property:</strong> 84 days notice (Ground 1)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Landlord moving in:</strong> 84 days notice (Ground 4)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Antisocial behaviour:</strong> 28 days notice (Ground 14)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Tribunal:</strong> If tenant does not leave, apply to First-tier
                      Tribunal for Scotland (Housing and Property Chamber)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/scotland-eviction-notices"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  Scotland Eviction Guide →
                </Link>
                <Link
                  href="/tenancy-agreements/scotland"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50"
                >
                  Scotland PRT Agreements →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Northern Ireland Section */}
        <section id="northern-ireland" className="py-12 lg:py-16 bg-green-50 scroll-mt-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🇬🇧</span>
                <h2 className="text-3xl font-bold text-gray-900">
                  Evicting a Tenant in Northern Ireland
                </h2>
              </div>

              <div className="bg-green-100 border-l-4 border-green-600 p-4 mb-8 rounded-r-lg">
                <p className="text-green-900 text-sm">
                  <strong>Note:</strong> Northern Ireland has its own tenancy laws under the{' '}
                  <strong>Private Tenancies Act (Northern Ireland) 2022</strong>. Different
                  notice periods and procedures apply compared to England, Wales, and Scotland.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Northern Ireland Eviction Overview
                </h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Notice to Quit:</strong> Required to end a tenancy
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Notice periods (2025):</strong> 28 days (under 1 year), 56 days
                      (1-10 years), 84 days (10+ years)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Court process:</strong> Apply to county court for possession
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                    <span>
                      <strong>Grounds:</strong> Various grounds under NI legislation
                    </span>
                  </li>
                </ul>
              </div>

              <Link
                href="/tenancy-agreements/northern-ireland"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Northern Ireland Tenancy Agreements →
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Eviction Costs, Timelines & Validity Checklist
              </h2>
              <p className="text-gray-600 mb-10">
                The biggest delays come from missing documents or incorrect notice dates. Use this
                checklist to keep your eviction on track.
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Typical timelines</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>England & Wales: 3–6 months.</li>
                    <li>Scotland: 4–8 months.</li>
                    <li>Contested cases take longer.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Costs to plan for</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Court or tribunal fees by route.</li>
                    <li>Process server or witness costs.</li>
                    <li>Bailiff/enforcement fees if needed.</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Validity checklist</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>Deposit protected and prescribed info served.</li>
                    <li>EPC, gas safety, and guide served on time.</li>
                    <li>Correct notice, dates, and service proof.</li>
                  </ul>
                  <Link
                    href="/section-21-notice-template"
                    className="text-primary text-sm font-medium hover:underline inline-flex mt-3"
                  >
                    Section 21 template →
                  </Link>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-600">
                Need grounds-based eviction? Use a{' '}
                <Link href="/section-8-notice-template" className="text-primary font-medium hover:underline">
                  Section 8 notice template
                </Link>{' '}
                to support rent arrears or breach cases.
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Start Your Eviction?</h2>
              <p className="text-xl text-white/90 mb-8">
                Our document packs include everything you need for a legally compliant eviction
                across England, Wales, and Scotland.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products/notice-only"
                  className="inline-flex items-center justify-center gap-2 bg-white text-primary font-semibold py-4 px-8 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Notice Only — £49.99
                </Link>
                <Link
                  href="/products/complete-pack"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/30"
                >
                  Complete Pack — £199.99
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <NextLegalSteps
                jurisdictionLabel="UK eviction routes"
                scenarioLabel="tenant eviction"
                primaryCTA={{
                  label: 'Generate eviction notice — £49.99',
                  href: productLinks.noticeOnly.href,
                }}
                secondaryCTA={{
                  label: 'Complete eviction pack — £199.99',
                  href: productLinks.completePack.href,
                }}
                relatedLinks={[
                  {
                    href: landingPageLinks.evictionTemplate.href,
                    title: landingPageLinks.evictionTemplate.title,
                    description: landingPageLinks.evictionTemplate.description,
                  },
                  {
                    href: landingPageLinks.section21Template.href,
                    title: landingPageLinks.section21Template.title,
                    description: landingPageLinks.section21Template.description,
                  },
                  {
                    href: guideLinks.walesEviction.href,
                    title: guideLinks.walesEviction.title,
                    description: 'Wales-specific Renting Homes Act notices.',
                  },
                  {
                    href: guideLinks.scotlandEviction.href,
                    title: guideLinks.scotlandEviction.title,
                    description: 'Notice to Leave and PRT rules for Scotland.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          faqs={howToEvictTenantFAQs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}
