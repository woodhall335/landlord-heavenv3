// src/app/ask-heaven/page.tsx

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import AskHeavenPageClient from './AskHeavenPageClient';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, faqPageSchema, breadcrumbSchema } from '@/lib/seo/structured-data';

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
    'Get instant answers to landlord-tenant questions for England, Wales, Scotland, and Northern Ireland. Free advice on eviction notices, rent arrears, tenancy agreements, and more.',
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
