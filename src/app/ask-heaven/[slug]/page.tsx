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
  isAskHeavenCanarySlug,
} from '@/lib/ask-heaven/questions';
import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions';
import { getCanonicalUrl } from '@/lib/seo';
import {
  StructuredData,
  faqPageSchema,
  breadcrumbSchema,
} from '@/lib/seo/structured-data';
import AskHeavenPageClient from '@/app/ask-heaven/AskHeavenPageClient';
import { detectAskHeavenCtaIntent } from '@/lib/ask-heaven/cta-copy';
import { getRecommendedProduct, type Topic } from '@/lib/ask-heaven/topic-detection';
import type { AskHeavenPrimaryTopic } from '@/lib/ask-heaven/questions/types';
import type { Jurisdiction } from '@/lib/jurisdiction/types';
import { NextStepWidget } from '@/components/journey/NextStepWidget';
import { JourneyStageUpdater } from '@/components/journey/JourneyStageUpdater';
import { ActionGuidance } from '@/components/funnels/ActionGuidance';

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

  const rawTitle = `${question.question}${jurisdictionSuffix} | Ask Heaven`;
  const title = truncateMetaTitle(rawTitle, 70);
  // Build description (target 150-160 chars)
  const description = normalizeMetaDescription(
    question.summary,
    question.question,
    question.jurisdictions
  );

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
  const isCanarySlug = isAskHeavenCanarySlug(question.slug);

  const primaryJurisdiction = question.jurisdictions[0] || 'uk-wide';
  const resolvedJurisdiction = resolveChatJurisdiction(primaryJurisdiction);
  const chatTopic = mapPrimaryTopicToChatTopic(question.primary_topic);
  const intent = detectAskHeavenCtaIntent(chatTopic, question.question);
  const recommendedProduct = chatTopic
    ? getRecommendedProduct(chatTopic, resolvedJurisdiction, intent ?? undefined)
    : null;
  const recommendedProductHref = recommendedProduct
    ? getProductPageHref(recommendedProduct.product)
    : '/products/notice-only';
  const recommendedProductLabel = recommendedProduct?.label ?? 'View guided product options';

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
      <JourneyStageUpdater
        topicHint={`${question.primary_topic} ${question.question}`}
        sourceId={`/ask-heaven/${slug}`}
      />
      <div className="bg-[#f8f1ff] border-b border-[#e9dcff]">
        <div className="container mx-auto px-4 py-5">
          <div className="max-w-4xl mx-auto">
            <ActionGuidance
              variant="light"
              todayLine="Here is exactly what to do today: solve this question with one guided legal workflow."
              ctaHref={recommendedProductHref}
              ctaLabel={recommendedProductLabel}
            />
          </div>
        </div>
      </div>

      <AskHeavenPageClient
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
        showReviewWarning={question.status !== 'approved' && !isCanarySlug}
        chatHeading={question.question}
        chatSubheading="Free landlord assistant for England/Wales/Scotland/N. Ireland"
      />
      <div className="bg-white pb-12">
        <div className="container mx-auto px-4 pt-8">
          <div className="max-w-4xl mx-auto">
            <NextStepWidget location="ask_heaven_slug" />
          </div>
        </div>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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
      </div>
    </>
  );
}

// =============================================================================
// Helper Functions
// =============================================================================


function truncateMetaTitle(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 20 ? trimmed.slice(0, lastSpace) : trimmed).trim();
}

function normalizeMetaDescription(
  summary: string,
  question: string,
  jurisdictions: AskHeavenQuestion['jurisdictions']
): string {
  const MIN_LENGTH = 150;
  const MAX_LENGTH = 160;

  const normalizedSummary = summary.replace(/\s+/g, ' ').trim();
  const normalizedQuestion = question.replace(/\s+/g, ' ').trim().replace(/[?!.]+$/, '');
  const jurisdictionLabel = formatJurisdictionsForMeta(jurisdictions);

  if (normalizedSummary.length >= MIN_LENGTH && normalizedSummary.length <= MAX_LENGTH) {
    return normalizedSummary;
  }

  const fragments = [
    normalizedSummary,
    `Landlord guidance for ${jurisdictionLabel}.`,
    'Covers key steps, deadlines, evidence, and common mistakes.',
    normalizedQuestion ? `Topic: ${normalizedQuestion}.` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (fragments.length > MAX_LENGTH) {
    return truncateToWordBoundary(fragments, MAX_LENGTH);
  }

  if (fragments.length >= MIN_LENGTH) {
    return fragments;
  }

  const padded = `${fragments} Includes practical next steps for UK landlords.`
    .replace(/\s+/g, ' ')
    .trim();

  let finalDescription = padded;
  if (finalDescription.length < MIN_LENGTH) {
    finalDescription = `${finalDescription} Trusted Ask Heaven guidance for landlords.`
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (finalDescription.length > MAX_LENGTH) {
    return truncateToWordBoundary(finalDescription, MAX_LENGTH);
  }

  return finalDescription;
}

function truncateToWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  const candidate = (lastSpace > Math.floor(maxLength * 0.6)
    ? trimmed.slice(0, lastSpace)
    : trimmed
  ).trim();
  return `${candidate.replace(/[.,;:!?-]+$/, '')}.`;
}

function formatJurisdictionsForMeta(jurisdictions: AskHeavenQuestion['jurisdictions']): string {
  if (!jurisdictions.length) {
    return 'the UK';
  }

  const labels = Array.from(new Set(jurisdictions.map((jurisdiction) => {
    if (jurisdiction === 'uk-wide') return 'the UK';
    return formatJurisdiction(jurisdiction);
  })));

  if (labels.includes('the UK')) return 'the UK';
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
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

function resolveChatJurisdiction(jurisdiction: AskHeavenQuestion['jurisdictions'][number]): Jurisdiction {
  if (jurisdiction === 'uk-wide') {
    return 'england';
  }
  return jurisdiction;
}

function getProductPageHref(product: string): string {
  switch (product) {
    case 'notice_only':
      return '/products/notice-only';
    case 'complete_pack':
      return '/products/complete-pack';
    case 'money_claim':
      return '/products/money-claim';
    case 'tenancy_agreement':
      return '/products/ast';
    default:
      return '/products/notice-only';
  }
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
