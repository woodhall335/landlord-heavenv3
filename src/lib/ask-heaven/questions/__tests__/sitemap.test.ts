import { describe, expect, it } from 'vitest';

import { InMemoryQuestionRepository } from '@/lib/ask-heaven/questions/repository';
import type { AskHeavenQuestion } from '@/lib/ask-heaven/questions/types';

function buildQuestion(overrides: Partial<AskHeavenQuestion> = {}): AskHeavenQuestion {
  const now = '2026-04-01T10:00:00.000Z';
  const longAnswer = `${Array.from({ length: 510 }, (_, index) => `word${index}`).join(
    ' '
  )} This is general information only and not legal advice.`;

  return {
    id: overrides.id ?? crypto.randomUUID(),
    slug: overrides.slug ?? 'indexable-question',
    question: overrides.question ?? 'Can I use Section 8 for rent arrears?',
    answer_md: overrides.answer_md ?? longAnswer,
    summary:
      overrides.summary ??
      'Plain-English answer explaining the route and the key risks for landlords.',
    primary_topic: overrides.primary_topic ?? 'eviction',
    jurisdictions: overrides.jurisdictions ?? ['england'],
    status: overrides.status ?? 'approved',
    canonical_slug: overrides.canonical_slug ?? null,
    related_slugs: overrides.related_slugs ?? ['related-question'],
    created_at: overrides.created_at ?? now,
    updated_at: overrides.updated_at ?? now,
    reviewed_at: overrides.reviewed_at ?? now,
  };
}

describe('Ask Heaven sitemap repository selection', () => {
  it('only returns approved canonical questions that pass quality gates', async () => {
    const repository = new InMemoryQuestionRepository();

    repository.seed([
      buildQuestion({ slug: 'indexable-question' }),
      buildQuestion({ slug: 'draft-question', status: 'draft' }),
      buildQuestion({ slug: 'canonical-duplicate', canonical_slug: 'indexable-question' }),
      buildQuestion({
        slug: 'thin-question',
        answer_md: 'Too short. Not legal advice.',
      }),
    ]);

    const sitemapEntries = await repository.getForSitemap();

    expect(sitemapEntries.map((entry) => entry.slug)).toEqual(['indexable-question']);
  });
});
