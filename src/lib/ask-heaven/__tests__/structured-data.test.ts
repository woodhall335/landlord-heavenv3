import { describe, expect, it } from 'vitest';

import {
  ASK_HEAVEN_ACCEPTED_ANSWER_ANCHOR_ID,
  buildAskHeavenQAPageSchema,
} from '@/lib/ask-heaven/structured-data';

describe('Ask Heaven QAPage structured data', () => {
  it('includes Google-recommended author, URL, and vote fields', () => {
    const schema = buildAskHeavenQAPageSchema({
      slug: 'rent-arrears-and-section-8-grounds',
      question: 'How do rent arrears affect Section 8 grounds?',
      answer_md:
        'Section 8 rent arrears grounds depend on the amount of rent unpaid and the timing of arrears. This is general information only, not legal advice.',
      created_at: '2026-04-01T10:00:00.000Z',
      updated_at: '2026-04-02T10:00:00.000Z',
    });

    expect(schema.mainEntity.author).toEqual({
      '@type': 'Organization',
      name: 'Landlord Heaven',
      url: 'https://landlordheaven.co.uk',
    });
    expect(schema.mainEntity.url).toBe(
      'https://landlordheaven.co.uk/ask-heaven/rent-arrears-and-section-8-grounds'
    );
    expect(schema.mainEntity.acceptedAnswer.url).toBe(
      `https://landlordheaven.co.uk/ask-heaven/rent-arrears-and-section-8-grounds#${ASK_HEAVEN_ACCEPTED_ANSWER_ANCHOR_ID}`
    );
    expect(schema.mainEntity.acceptedAnswer.upvoteCount).toBe(0);
    expect(schema.mainEntity.acceptedAnswer.author).toEqual({
      '@type': 'Organization',
      name: 'Landlord Heaven',
      url: 'https://landlordheaven.co.uk',
    });
  });
});
