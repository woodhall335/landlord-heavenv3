/**
 * Ask Heaven Question Page
 *
 * Server-side rendered page for individual Ask Heaven Q&A.
 *
 * SEO SAFETY RULES:
 * 1. noindex by default unless status === 'approved' AND all quality gates pass
 * 2. Questions with canonical_slug redirect to the canonical URL
 * 3. Minimum 500 words required for indexing
 * 4. Required disclaimer must be present
 *
 * See /docs/ask-heaven-seo.md for the full review workflow.
 */

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  getQuestionRepository,
  validateQualityGates,
  getMetaRobots,
  getRelatedToolsConfig,
  getRelatedQuestionsConfig,
} from '@/lib/ask-heaven/questions';
import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  faqPageSchema,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import { SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import { QuestionPageContent } from './QuestionPageContent';
import { RelatedTools } from './RelatedTools';
import { RelatedQuestions } from './RelatedQuestions';
import { FollowUpCta } from './FollowUpCta';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Fetch question data for the page.
 * Returns null if not found.
 */
async function getQuestion(slug: string): Promise<AskHeavenQuestion | null> {
  const repository = getQuestionRepository();
  return repository.getBySlug(slug);
}

/**
 * Generate metadata for the question page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = await getQuestion(slug);

  if (!question) {
    return {
      title: 'Question Not Found | Ask Heaven',
      robots: 'noindex, nofollow',
    };
  }

  // Determine robots directive based on quality gates
  const robots = getMetaRobots(question);

  // Build title with jurisdiction if specific
  const jurisdictionSuffix =
    question.jurisdictions.length === 1 && question.jurisdictions[0] !== 'uk-wide'
      ? ` (${formatJurisdiction(question.jurisdictions[0])})`
      : '';

  const title = `${question.question}${jurisdictionSuffix} | Ask Heaven`;

  // Build description (max 160 chars)
  const description = truncate(question.summary, 155);

  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      type: 'article',
      url: getCanonicalUrl(`/ask-heaven/${slug}`),
    },
    alternates: {
      canonical: question.canonical_slug
        ? getCanonicalUrl(`/ask-heaven/${question.canonical_slug}`)
        : getCanonicalUrl(`/ask-heaven/${slug}`),
    },
  };
}

/**
 * Question page component.
 */
export default async function AskHeavenQuestionPage({ params }: PageProps) {
  const { slug } = await params;
  const question = await getQuestion(slug);

  // 404 if question doesn't exist
  if (!question) {
    notFound();
  }

  // Redirect to canonical if this is a duplicate
  if (question.canonical_slug && question.canonical_slug !== slug) {
    permanentRedirect(`/ask-heaven/${question.canonical_slug}`);
  }

  // Validate quality gates for display
  const qualityResult = validateQualityGates(question);

  // Get related content configuration
  const primaryJurisdiction = question.jurisdictions[0] || 'uk-wide';
  const relatedToolsConfig = getRelatedToolsConfig(
    question.primary_topic,
    primaryJurisdiction
  );
  const relatedQuestionsConfig = getRelatedQuestionsConfig(
    question.primary_topic,
    primaryJurisdiction
  );

  // Fetch related questions
  const repository = getQuestionRepository();
  const relatedQuestions = question.related_slugs.length > 0
    ? await repository.getRelatedQuestions(question.related_slugs)
    : [];

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: 'https://landlordheaven.co.uk' },
    { name: 'Ask Heaven', url: 'https://landlordheaven.co.uk/ask-heaven' },
    { name: truncate(question.question, 50), url: `https://landlordheaven.co.uk/ask-heaven/${slug}` },
  ];

  // Build FAQ schema (single Q&A)
  const faqItems = [
    {
      question: question.question,
      answer: extractPlainText(question.summary),
    },
  ];

  // Build QAPage schema
  const qaPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question.question,
      text: question.question,
      dateCreated: question.created_at,
      dateModified: question.updated_at,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractPlainText(question.summary),
        dateCreated: question.created_at,
        dateModified: question.updated_at,
        author: {
          '@type': 'Organization',
          name: 'Landlord Heaven',
        },
      },
    },
  };

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={breadcrumbSchema(breadcrumbItems)} />
      <StructuredData data={faqPageSchema(faqItems)} />
      <StructuredData data={qaPageSchema} />

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <nav className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/ask-heaven" className="hover:text-primary">
                  Ask Heaven
                </Link>
              </li>
              <li>/</li>
              <li className="text-gray-900 font-medium truncate max-w-xs">
                {truncate(question.question, 40)}
              </li>
            </ol>
          </div>
        </nav>

        {/* Question Header */}
        <header className="bg-white border-b border-gray-200 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              {/* Jurisdiction badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {question.jurisdictions.map((j) => (
                  <span
                    key={j}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {formatJurisdiction(j)}
                  </span>
                ))}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {formatTopic(question.primary_topic)}
                </span>
              </div>

              {/* H1 - The question */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {question.question}
              </h1>

              {/* TL;DR Summary */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    !
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 text-sm mb-1">
                      TL;DR
                    </p>
                    <p className="text-blue-800">{question.summary}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <FollowUpCta slug={slug} question={question.question} />
              </div>

              {/* Last reviewed date */}
              {question.reviewed_at && (
                <p className="text-sm text-gray-500 mt-4">
                  Last reviewed: {formatDate(question.reviewed_at)}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Answer Content (2 cols) */}
              <div className="lg:col-span-2">
                <QuestionPageContent
                  question={question}
                  qualityResult={qualityResult}
                />

                <div className="mt-10 flex justify-center">
                  <FollowUpCta
                    slug={slug}
                    question={question.question}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow hover:bg-primary-700 transition-colors"
                  />
                </div>

                {/* Disclaimer */}
                <div className="mt-8">
                  <SeoDisclaimer />
                </div>
              </div>

              {/* Sidebar (1 col) */}
              <aside className="space-y-6">
                {/* Related Tools/Products */}
                <RelatedTools
                  config={relatedToolsConfig}
                  slug={slug}
                  jurisdiction={primaryJurisdiction}
                />

                {/* Related Questions */}
                {relatedQuestions.length > 0 && (
                  <RelatedQuestions
                    questions={relatedQuestions}
                    config={relatedQuestionsConfig}
                  />
                )}

                {/* Back to Ask Heaven CTA */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Have another question?
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Ask Heaven is free for UK landlords. Get instant answers to your questions.
                  </p>
                  <Link
                    href="/ask-heaven"
                    className="block w-full text-center bg-primary text-white font-medium py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Ask a Question
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatJurisdiction(jurisdiction: string): string {
  const map: Record<string, string> = {
    england: 'England',
    wales: 'Wales',
    scotland: 'Scotland',
    'northern-ireland': 'Northern Ireland',
    'uk-wide': 'UK-Wide',
  };
  return map[jurisdiction] || jurisdiction;
}

function formatTopic(topic: string): string {
  const map: Record<string, string> = {
    eviction: 'Eviction',
    arrears: 'Rent Arrears',
    deposit: 'Deposit',
    tenancy: 'Tenancy',
    compliance: 'Compliance',
    damage_claim: 'Damage Claim',
    notice_periods: 'Notice Periods',
    court_process: 'Court Process',
    tenant_rights: 'Tenant Rights',
    landlord_obligations: 'Landlord Duties',
    other: 'General',
  };
  return map[topic] || topic;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

function extractPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}
