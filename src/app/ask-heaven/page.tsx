// src/app/ask-heaven/page.tsx

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import AskHeavenPageClient from './AskHeavenPageClient';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';
import { buildAskHeavenLink, type AskHeavenTopic } from '@/lib/ask-heaven/buildAskHeavenLink';

// Compliance topics data for SSR section
interface ComplianceTopic {
  id: AskHeavenTopic;
  title: string;
  description: string;
  questions: string[];
  checklist: string[];
}

const complianceTopics: ComplianceTopic[] = [
  {
    id: 'deposit',
    title: 'Deposit Protection',
    description:
      'Landlords must protect tenancy deposits in a government-approved scheme (DPS, TDS, or mydeposits) within 30 days and provide prescribed information to tenants.',
    questions: [
      'Do I need to protect a tenancy deposit and when?',
      'Which deposit protection scheme should I use?',
      'What is prescribed information for deposit protection?',
      'What if I protected the deposit late?',
    ],
    checklist: [
      'Protect deposit within 30 days of receipt (England/Wales/Scotland; NI has different rules)',
      'Use a government-approved scheme: DPS, TDS, or mydeposits',
      'Serve prescribed information to tenant within 30 days',
      'Provide certificate from the scheme',
      'Keep records of protection and prescribed info service',
      'Late protection may block Section 21 and lead to penalties (up to 3x deposit)',
      'Always check current guidance for your jurisdiction',
    ],
  },
  {
    id: 'epc',
    title: 'EPC Rules',
    description:
      'Energy Performance Certificates are required before letting a property. From April 2020, rental properties in England and Wales must have an EPC rating of E or above.',
    questions: [
      'What EPC rating is required to let a property?',
      'Do I need an EPC for an existing tenancy?',
      'Can I evict if the EPC was not provided?',
      'What are EPC exemptions for landlords?',
    ],
    checklist: [
      'Obtain valid EPC before marketing or letting property',
      'Minimum rating of E required in England and Wales (exemptions may apply)',
      'Provide copy to tenants before move-in',
      'EPC valid for 10 years',
      'Keep copy of EPC and evidence of when provided',
      'Missing EPC may block Section 21 in England',
      'Scotland and Wales have their own rules - check specific requirements',
      'Always check current guidance for your jurisdiction',
    ],
  },
  {
    id: 'gas_safety',
    title: 'Gas Safety Certificate',
    description:
      'Landlords must have gas appliances checked annually by a Gas Safe registered engineer and provide tenants with a copy of the Gas Safety Certificate (CP12) within 28 days.',
    questions: [
      'When must a landlord provide a gas safety certificate?',
      'Does missing gas safety invalidate a Section 21?',
      'How often do I need a gas safety check?',
      'What if the property has no gas supply?',
    ],
    checklist: [
      'Annual gas safety check by Gas Safe registered engineer',
      'Provide CP12 certificate to existing tenants within 28 days of check',
      'Provide to new tenants before move-in',
      'Keep records for 2 years',
      'Missing or late gas safety may invalidate Section 21 in England',
      'No gas supply = no gas safety certificate required (keep evidence)',
      'Check engineer\'s Gas Safe registration before appointment',
      'Always check current guidance for your jurisdiction',
    ],
  },
  {
    id: 'eicr',
    title: 'EICR Electrical Safety',
    description:
      'Electrical Installation Condition Reports (EICRs) are required every 5 years for rental properties in England. Landlords must provide a copy to tenants before they move in.',
    questions: [
      'Do landlords need an EICR and how often?',
      'Can I serve notice without an EICR?',
      'What EICR grade means I need repairs?',
      'When did EICR become mandatory for landlords?',
    ],
    checklist: [
      'EICR required every 5 years in England (from July 2020 for new tenancies)',
      'Provide copy to new tenants before move-in',
      'Provide to existing tenants within 28 days of inspection',
      'C1 (danger present) and C2 (potentially dangerous) require remedial works',
      'Complete remedial works within 28 days or as specified',
      'Provide updated report or certificate after remedial works',
      'Keep records of all inspections and remedial works',
      'Always check current guidance for your jurisdiction',
    ],
  },
  {
    id: 'smoke_alarms',
    title: 'Smoke & CO Alarms',
    description:
      'Under the Smoke and Carbon Monoxide Alarm Regulations 2022, landlords must install smoke alarms on every floor and CO alarms in rooms with fixed combustion appliances.',
    questions: [
      'What are the smoke alarm rules for landlords in England?',
      'Do I need carbon monoxide alarms in rental property?',
      'What changed in the Smoke and Carbon Monoxide Alarm Regulations 2022?',
      'Where must smoke alarms be installed in a rental?',
    ],
    checklist: [
      'Smoke alarm on every storey with living accommodation',
      'CO alarm in any room with fixed combustion appliance (excluding gas cookers)',
      'Check alarms are working on the first day of new tenancy',
      'Repair or replace faulty alarms within reasonable time',
      '2022 regulations extended CO alarm requirements in England',
      'Keep records of installation and testing',
      'Scotland and Wales have similar but distinct rules',
      'Always check current guidance for your jurisdiction',
    ],
  },
  {
    id: 'right_to_rent',
    title: 'Right to Rent Checks',
    description:
      'Landlords in England must verify that tenants have the right to rent in the UK before letting a property. Failure to check can result in civil penalties up to £20,000.',
    questions: [
      'Do I need to do right to rent checks and how?',
      'What documents are acceptable for right to rent?',
      'How do I do a right to rent check online?',
      'What are the penalties for not doing right to rent checks?',
    ],
    checklist: [
      'Applies in England only (not Wales, Scotland, or NI)',
      'Check original documents for all adult occupiers before tenancy starts',
      'Accept List A or List B documents from Home Office guidance',
      'Online checking service available for biometric residence permits/cards',
      'Keep copies of documents for duration of tenancy + 1 year',
      'Conduct follow-up checks for time-limited right to rent',
      'Civil penalties up to £20,000 for non-compliance',
      'Avoid discrimination - check all prospective tenants equally',
      'Always check current guidance from the Home Office',
    ],
  },
];

// Generate ItemList schema for compliance topics
function complianceTopicsItemListSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Landlord Compliance Topics',
    description: 'Common landlord compliance questions answered free by Ask Heaven',
    numberOfItems: complianceTopics.length,
    itemListElement: complianceTopics.map((topic, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: topic.title,
      url: `${siteUrl}${buildAskHeavenLink({ source: 'seo', topic: topic.id, prompt: topic.questions[0] })}`,
    })),
  };
}

// FAQ items for both schema and visible content - defined at module level for SSR
const faqItems = [
  {
    question: 'How does Ask Heaven help with eviction notices?',
    answer:
      'It explains whether Section 21, Section 8 (England), Section 173 (Wales), or Notice to Leave (Scotland) fits your situation and links you to the right generator.',
  },
  {
    question: 'Can it advise on rent arrears and repayment plans?',
    answer:
      'Yes, it outlines arrears options, pre-action steps, and when to move to a money claim through MCOL or Scottish Simple Procedure.',
  },
  {
    question: 'Does Ask Heaven cover tenancy agreements?',
    answer:
      'It provides guidance on ASTs (England), occupation contracts (Wales), and Scottish PRTs, highlights common errors, and links to compliant templates.',
  },
  {
    question: 'Will it warn me about illegal eviction risks?',
    answer:
      'Yes, it flags when you must avoid lock changes or harassment and signposts lawful possession routes for your jurisdiction.',
  },
  {
    question: 'Which jurisdictions does Ask Heaven cover?',
    answer:
      'Ask Heaven covers England, Wales, Scotland, and Northern Ireland with jurisdiction-specific guidance for each legal system.',
  },
  {
    question: 'Can I generate documents from Ask Heaven?',
    answer:
      'Yes, you can jump straight into our notice generators, money-claim tools, and tenancy agreement wizards to create the right paperwork.',
  },
];

export const metadata: Metadata = {
  title: 'Ask Heaven – Free UK Landlord Q&A Tool',
  description:
    'Free landlord advice for England, Wales, Scotland and NI. Get answers on evictions, deposit protection, EPC rules, gas safety, EICR, smoke alarms and right to rent.',
  keywords: [
    'landlord advice',
    'landlord Q&A',
    'tenant disputes',
    'rent arrears advice',
    'eviction advice',
    'tenancy advice UK',
    'landlord help',
    'section 21 advice',
    'section 8 advice',
    'notice to leave scotland',
    'occupation contract wales',
    'landlord tenant law',
    'deposit protection advice',
    'EPC rules landlord',
    'gas safety certificate landlord',
    'EICR landlord requirements',
    'smoke alarm regulations landlord',
    'carbon monoxide alarm landlord',
    'right to rent checks landlord',
  ],
  openGraph: {
    title: 'Ask Heaven – Free UK Landlord Q&A Tool',
    description:
      'Get instant answers to landlord-tenant questions for England, Wales, Scotland, and Northern Ireland. Free advice on evictions, rent arrears, and tenancy agreements.',
    type: 'website',
    url: getCanonicalUrl('/ask-heaven'),
  },
  alternates: {
    canonical: getCanonicalUrl('/ask-heaven'),
  },
};

export default function AskHeavenPage(): React.ReactElement {
  return (
    <>
      {/* SSR Structured Data - visible to Googlebot immediately */}
      <StructuredData data={faqPageSchema(faqItems)} />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Tools', url: 'https://landlordheaven.co.uk/tools' },
          { name: 'Ask Heaven', url: 'https://landlordheaven.co.uk/ask-heaven' },
        ])}
      />
      <StructuredData data={complianceTopicsItemListSchema()} />

      {/* SSR Content Section - visible to Googlebot without hydration */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* H1 and intro - server rendered for SEO */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                Free UK Landlord Advice Tool
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Ask Heaven: Free UK Landlord Q&amp;A Tool
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get instant, plain-English answers to your landlord-tenant questions. Whether you
                need eviction advice, help with rent arrears, or guidance on tenancy agreements, Ask
                Heaven covers <strong>England</strong>, <strong>Wales</strong>,{' '}
                <strong>Scotland</strong>, and <strong>Northern Ireland</strong>.
              </p>
            </div>

            {/* Jurisdiction coverage - SSR for keyword targeting */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Landlord Advice for All UK Jurisdictions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏴󠁧󠁢󠁥󠁮󠁧󠁿</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">England</h3>
                    <p className="text-sm text-gray-600">
                      Section 21, Section 8, AST agreements, deposit rules, Money Claim Online
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏴󠁧󠁢󠁷󠁬󠁳󠁿</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Wales</h3>
                    <p className="text-sm text-gray-600">
                      Renting Homes Act, occupation contracts, Section 173 notices, Rent Smart Wales
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Scotland</h3>
                    <p className="text-sm text-gray-600">
                      PRT agreements, Notice to Leave, First-tier Tribunal, Simple Procedure claims
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Northern Ireland</h3>
                    <p className="text-sm text-gray-600">
                      Notice to Quit, private tenancy rules, landlord obligations, rent recovery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular questions - SSR for long-tail keyword capture */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Popular Landlord Questions We Help With
              </h2>
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  How do I evict a tenant who is not paying rent?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Which eviction notice should I use — Section 21 or Section 8?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  How do I recover rent arrears through the courts?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  What notice period do I need to give my tenant?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Is my tenancy agreement legally compliant?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  How does eviction work in Scotland with the PRT?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  What changed with the Renting Homes Act in Wales?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  How do I protect my tenant&apos;s deposit correctly?
                </li>
              </ul>
            </div>

            {/* Internal links to authority pages - SSR for link equity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Related Guides &amp; Tools
              </h2>
              <p className="text-gray-600 mb-4">
                Need more than advice? Jump to our detailed guides and document generators:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  href="/how-to-evict-tenant"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">How to Evict a Tenant</span>
                  <span className="text-xs text-gray-500">Complete UK guide</span>
                </Link>
                <Link
                  href="/tools/validators/section-21"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">Section 21 Validity Checker</span>
                  <span className="text-xs text-gray-500">Check if your notice is valid</span>
                </Link>
                <Link
                  href="/tools/validators/section-8"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">Section 8 Grounds Checker</span>
                  <span className="text-xs text-gray-500">Verify grounds &amp; notice periods</span>
                </Link>
                <Link
                  href="/money-claim-unpaid-rent"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">Claim Unpaid Rent</span>
                  <span className="text-xs text-gray-500">MCOL &amp; Simple Procedure</span>
                </Link>
                <Link
                  href="/wales-eviction-notices"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">Wales Eviction Guide</span>
                  <span className="text-xs text-gray-500">Renting Homes Act notices</span>
                </Link>
                <Link
                  href="/scotland-eviction-notices"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">Scotland Eviction Guide</span>
                  <span className="text-xs text-gray-500">Notice to Leave &amp; PRT</span>
                </Link>
                <Link
                  href="/tenancy-agreement-template"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">Tenancy Agreement</span>
                  <span className="text-xs text-gray-500">AST &amp; PRT templates</span>
                </Link>
                <Link
                  href="/rent-arrears-letter-template"
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="font-medium text-gray-900 block">Rent Arrears Letter</span>
                  <span className="text-xs text-gray-500">Demand letter template</span>
                </Link>
              </div>
            </div>

            {/* Compliance Topics Section - SSR for SEO */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Landlord Compliance Help (Free Answers)
              </h2>
              <p className="text-gray-600 mb-6">
                Get instant answers to common landlord compliance questions. Click any question below
                to ask Ask Heaven directly.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {complianceTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
                    <ul className="space-y-2 mb-4">
                      {topic.questions.map((question) => (
                        <li key={question}>
                          <Link
                            href={buildAskHeavenLink({
                              source: 'seo',
                              topic: topic.id,
                              prompt: question,
                            })}
                            className="text-sm text-primary hover:text-primary-700 hover:underline flex items-start gap-1.5"
                          >
                            <span className="text-primary/60 mt-0.5">?</span>
                            {question}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    {/* Quick Checklist - SSR collapsible */}
                    <details className="mb-4 group">
                      <summary className="cursor-pointer text-sm font-medium text-green-700 hover:text-green-800 flex items-center gap-1.5 select-none">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-xs group-open:rotate-90 transition-transform">
                          ▶
                        </span>
                        Quick checklist (free)
                      </summary>
                      <ul className="mt-3 ml-6 space-y-1.5 text-xs text-gray-600">
                        {topic.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </details>

                    <Link
                      href={buildAskHeavenLink({
                        source: 'seo',
                        topic: topic.id,
                      })}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-700"
                    >
                      Ask a question
                      <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client-side interactive widget */}
      <AskHeavenPageClient />

      {/* SSR FAQ Section - visible to Googlebot without hydration */}
      <div className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions About Ask Heaven
            </h2>
            <div className="space-y-4">
              {faqItems.map((faq) => (
                <details
                  key={faq.question}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                    {faq.question}
                    <span className="ml-4 text-gray-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <p className="mt-3 text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
