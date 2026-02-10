// src/app/ask-heaven/page.tsx

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import AskHeavenPageClient from './AskHeavenPageClient';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';
import { buildAskHeavenLink, type AskHeavenTopic } from '@/lib/ask-heaven/buildAskHeavenLink';
import { FAQSection } from '@/components/marketing/FAQSection';
import { SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { CommercialWizardLinks } from '@/components/seo/CommercialWizardLinks';
import { analyzeContent } from '@/lib/seo/commercial-linking';

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
      "Check engineer's Gas Safe registration before appointment",
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

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}): Promise<Metadata> {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<{ q?: string }>).then === 'function'
      ? await (searchParams as Promise<{ q?: string }>)
      : (searchParams as { q?: string } | undefined);
  const hasPrefill = Boolean(resolvedSearchParams?.q);

  return {
    title: 'Free Landlord Legal Q&A | UK | Ask Heaven',
    description:
      'Free landlord Q&A for UK. Instant answers on evictions, rent arrears, tenancy agreements, and compliance across all jurisdictions.',
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
    robots: hasPrefill ? 'noindex, follow' : 'index, follow',
    openGraph: {
      title: 'Free Landlord Legal Q&A | UK | Ask Heaven',
      description:
        'Free legal Q&A for UK landlords covering England, Wales, Scotland & Northern Ireland. Get instant answers on evictions, rent arrears, tenancy agreements, and compliance.',
      type: 'website',
      url: getCanonicalUrl('/ask-heaven'),
    },
    alternates: {
      canonical: getCanonicalUrl('/ask-heaven'),
    },
  };
}

export default async function AskHeavenPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }> | { q?: string };
}): Promise<React.ReactElement> {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<{ q?: string }>).then === 'function'
      ? await (searchParams as Promise<{ q?: string }>)
      : (searchParams as { q?: string } | undefined);
  // Analyze page content for commercial linking
  // Ask Heaven discusses eviction, rent arrears, and tenancy agreements - all core products
  const commercialLinkingResult = analyzeContent({
    pathname: '/ask-heaven',
    title: 'Free Landlord Legal Q&A | UK | Ask Heaven',
    description: 'Free legal Q&A for UK landlords covering England, Wales, Scotland & Northern Ireland. Get instant answers on evictions, rent arrears, tenancy agreements, and compliance.',
    heading: 'Ask Heaven: Free UK Landlord Q&A Tool',
    bodyText: 'eviction notice section 21 section 8 rent arrears money claim tenancy agreement AST PRT occupation contract notice to leave',
  });

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

      {/* Hidden H1 for SEO - visually hidden but accessible */}
      <h1 className="sr-only">Ask Heaven: Free UK Landlord Q&A Tool</h1>

      {/* Client-side interactive widget - now prominently placed first */}
      <AskHeavenPageClient
        initialQuery={resolvedSearchParams?.q ?? null}
        chatSubheading="Free landlord assistant for England/Wales/Scotland/N. Ireland"
      />

      {/* SSR Content Section - below the main chat for SEO */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Intro section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                Free UK Landlord Advice
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Your Questions, Answered
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get instant, plain-English answers to your landlord-tenant questions. Ask Heaven
                covers <strong>England</strong>, <strong>Wales</strong>, <strong>Scotland</strong>,
                and <strong>Northern Ireland</strong>.
              </p>
            </div>

            {/* Jurisdiction coverage cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="w-10 h-7 mb-2 overflow-hidden rounded">
                  <Image src="/gb-eng.svg" alt="England flag" width={40} height={28} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-gray-900">England</h3>
                <p className="text-xs text-gray-500 mt-1">Section 21 & 8, ASTs, MCOL</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="w-10 h-7 mb-2 overflow-hidden rounded">
                  <Image src="/gb-wls.svg" alt="Wales flag" width={40} height={28} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-gray-900">Wales</h3>
                <p className="text-xs text-gray-500 mt-1">Renting Homes Act, Section 173</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="w-10 h-7 mb-2 overflow-hidden rounded">
                  <Image src="/gb-sct.svg" alt="Scotland flag" width={40} height={28} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-gray-900">Scotland</h3>
                <p className="text-xs text-gray-500 mt-1">PRT, Notice to Leave, FTT</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="w-10 h-7 mb-2 overflow-hidden rounded">
                  <Image src="/gb-nir.svg" alt="Northern Ireland flag" width={40} height={28} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-gray-900">N. Ireland</h3>
                <p className="text-xs text-gray-500 mt-1">Notice to Quit, rent recovery</p>
              </div>
            </div>

            {/* Commercial Wizard Links - Automated CTAs to core products */}
            <CommercialWizardLinks
              result={commercialLinkingResult}
              variant="card"
              maxLinks={3}
              utmSource="ask_heaven"
              className="mb-12"
            />

            {/* Popular questions */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Popular Questions We Help With
              </h2>
              <ul className="grid md:grid-cols-2 gap-3 text-gray-700 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  How do I evict a tenant who is not paying rent?
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Which eviction notice should I use?
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
              </ul>
            </div>

            {/* Related tools */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Related Tools & Guides</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Link
                  href="/how-to-evict-tenant"
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-primary block">
                    How to Evict a Tenant
                  </span>
                  <span className="text-xs text-gray-500">Complete UK guide</span>
                </Link>
                <Link
                  href="/tools/validators/section-21"
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-primary block">
                    Section 21 Checker
                  </span>
                  <span className="text-xs text-gray-500">Check notice validity</span>
                </Link>
                <Link
                  href="/tools/validators/section-8"
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-primary block">
                    Section 8 Checker
                  </span>
                  <span className="text-xs text-gray-500">Verify grounds & periods</span>
                </Link>
                <Link
                  href="/money-claim-unpaid-rent"
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-primary block">
                    Claim Unpaid Rent
                  </span>
                  <span className="text-xs text-gray-500">MCOL & Simple Procedure</span>
                </Link>
                <Link
                  href="/assured-shorthold-tenancy-agreement-template"
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-primary block">
                    Tenancy Agreement
                  </span>
                  <span className="text-xs text-gray-500">AST & PRT templates</span>
                </Link>
                <Link
                  href="/rent-arrears-letter-template"
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <span className="font-medium text-gray-900 group-hover:text-primary block">
                    Rent Arrears Letter
                  </span>
                  <span className="text-xs text-gray-500">Demand letter template</span>
                </Link>
              </div>
            </div>

            {/* Compliance Topics - Collapsible for cleaner UI */}
            <details className="mb-12 group">
              <summary className="cursor-pointer text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-primary group-open:rotate-90 transition-transform">▶</span>
                Landlord Compliance Help
              </summary>
              <p className="text-gray-600 mt-2 mb-6 text-sm">
                Click any question below to ask Ask Heaven directly.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {complianceTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="bg-gray-50 rounded-xl border border-gray-100 p-4"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{topic.title}</h3>
                    <p className="text-xs text-gray-600 mb-3">{topic.description}</p>
                    <ul className="space-y-1.5 mb-3">
                      {topic.questions.slice(0, 2).map((question) => (
                        <li key={question}>
                          <Link
                            href={buildAskHeavenLink({
                              source: 'seo',
                              topic: topic.id,
                              prompt: question,
                            })}
                            className="text-xs text-primary hover:text-primary-700 hover:underline flex items-start gap-1"
                          >
                            <span className="text-primary/60">?</span>
                            {question}
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <details className="group/checklist">
                      <summary className="cursor-pointer text-xs font-medium text-green-700 hover:text-green-800 flex items-center gap-1">
                        <span className="group-open/checklist:rotate-90 transition-transform">▶</span>
                        Quick checklist
                      </summary>
                      <ul className="mt-2 ml-4 space-y-1 text-xs text-gray-600">
                        {topic.checklist.slice(0, 4).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-green-500">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                ))}
              </div>
            </details>

            {/* SEO Disclaimer */}
            <SeoDisclaimer />
          </div>
        </div>
      </div>

      {/* SSR FAQ Section */}
      <FAQSection
        title="Frequently Asked Questions"
        faqs={faqItems}
        showContactCTA={false}
        variant="gray"
      />
    </>
  );
}
