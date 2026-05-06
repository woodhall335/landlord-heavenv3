import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions/types';
import { getCanonicalUrl, SITE_ORIGIN } from '@/lib/seo/urls';

export const ASK_HEAVEN_ACCEPTED_ANSWER_ANCHOR_ID = 'accepted-answer';

export const ASK_HEAVEN_ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  name: 'Landlord Heaven',
  url: SITE_ORIGIN,
} as const;

export function extractAskHeavenPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_~]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export function buildAskHeavenQAPageSchema(
  question: Pick<
    AskHeavenQuestion,
    'slug' | 'question' | 'answer_md' | 'created_at' | 'updated_at'
  >,
  canonicalUrl = getCanonicalUrl(`/ask-heaven/${question.slug}`)
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: question.question,
      text: question.question,
      url: canonicalUrl,
      author: ASK_HEAVEN_ORGANIZATION_SCHEMA,
      dateCreated: question.created_at,
      dateModified: question.updated_at,
      answerCount: 1,
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractAskHeavenPlainText(question.answer_md),
        url: `${canonicalUrl}#${ASK_HEAVEN_ACCEPTED_ANSWER_ANCHOR_ID}`,
        upvoteCount: 0,
        dateCreated: question.created_at,
        dateModified: question.updated_at,
        author: ASK_HEAVEN_ORGANIZATION_SCHEMA,
      },
    },
  };
}
