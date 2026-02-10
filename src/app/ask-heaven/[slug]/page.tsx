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
import { notFound, permanentRedirect } from 'next/navigation';
import {
  getQuestionRepository,
  validateQualityGates,
  getMetaRobots,
} from '@/lib/ask-heaven/questions';
import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  faqPageSchema,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import { SeoDisclaimer } from '@/components/seo/SeoCtaBlock';
import AskHeavenChatShell from '@/components/ask-heaven/AskHeavenChatShell';
import { detectAskHeavenCtaIntent } from '@/lib/ask-heaven/cta-copy';
import { getRecommendedProduct, type Topic } from '@/lib/ask-heaven/topic-detection';
import type { AskHeavenPrimaryTopic } from '@/lib/ask-heaven/questions/types';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

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

  const primaryJurisdiction = question.jurisdictions[0] || 'uk-wide';
  const resolvedJurisdiction = resolveChatJurisdiction(primaryJurisdiction);
  const chatTopic = mapPrimaryTopicToChatTopic(question.primary_topic);
  const intent = detectAskHeavenCtaIntent(chatTopic, question.question);
  const recommendedProduct = chatTopic
    ? getRecommendedProduct(chatTopic, resolvedJurisdiction, intent ?? undefined)
    : null;

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
      <div className="min-h-[80vh]">
        <AskHeavenChatShell
          initialMessages={[
            {
              id: `seed-user-${question.id}`,
              role: 'user',
              content: question.question,
              createdAt: question.created_at,
            },
            {
              id: `seed-assistant-${question.id}`,
              role: 'assistant',
              content: question.answer_md,
              createdAt: question.updated_at,
              suggestedProduct: recommendedProduct?.product,
              suggestedTopic: chatTopic ?? undefined,
            },
          ]}
          initialJurisdiction={resolvedJurisdiction}
          initialTopic={chatTopic}
          initialQuestionText={question.question}
          showReviewWarning={question.status !== 'approved'}
        />
        <div className="max-w-4xl mx-auto px-4 pb-12">
          <SeoDisclaimer />
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-xs text-gray-400">
              Debug: {qualityResult.wordCount} words | Status: {question.status} | Indexable:{' '}
              {qualityResult.passed ? 'Yes' : 'No'}
              {qualityResult.failures.length > 0 && (
                <span className="text-red-500">
                  {' '}
                  | Issues: {qualityResult.failures.map((f) => f.gate).join(', ')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================

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

function resolveChatJurisdiction(jurisdiction: AskHeavenQuestion['jurisdictions'][number]): Jurisdiction {
  if (jurisdiction === 'uk-wide') {
    return 'england';
  }
  return jurisdiction;
}

function mapPrimaryTopicToChatTopic(topic: AskHeavenPrimaryTopic): Topic | null {
  switch (topic) {
    case 'eviction':
    case 'notice_periods':
    case 'court_process':
      return 'eviction';
    case 'arrears':
      return 'arrears';
    case 'damage_claim':
      return 'damage_claim';
    case 'tenancy':
      return 'tenancy';
    case 'deposit':
    case 'compliance':
    case 'tenant_rights':
    case 'landlord_obligations':
      return 'tenancy';
    default:
      return null;
  }
}

function formatJurisdiction(jurisdiction: string): string {
  const map: Record<string, string> = {
    england: 'England',
    wales: 'Wales',
    scotland: 'Scotland',
    'northern-ireland': 'N. Ireland',
    'uk-wide': 'UK',
  };
  return map[jurisdiction] || jurisdiction;
}
