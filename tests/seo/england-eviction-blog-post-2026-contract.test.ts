import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const POSTS_PATH = 'src/lib/blog/posts.tsx';

const source = readFileSync(POSTS_PATH, 'utf8');

function postSegment(slug: string): string {
  const start = source.indexOf(`slug: '${slug}'`);
  expect(start, `missing blog post ${slug}`).toBeGreaterThanOrEqual(0);

  const next = source.indexOf("\n  //", start + 1);
  return next === -1 ? source.slice(start) : source.slice(start, next);
}

describe('England eviction blog post-May-2026 contract', () => {
  it('keeps the shared Section 8 CTA product-led', () => {
    expect(source).toContain('/products/notice-only');
    expect(source).toContain('/products/complete-pack');
    expect(source).toContain('For post-1 May 2026 England cases, Section 21 has gone');
  });

  it('reframes Section 21 vs Section 8 as transitional, not a live choice', () => {
    const post = postSegment('section-21-vs-section-8');

    expect(post).toMatch(/no longer a normal\s+live choice for new cases/);
    expect(post).toContain('current Form 3A Section 8-led possession route');
    expect(post).not.toContain('serving Section 21 as backup');
    expect(post).not.toContain('only 2 weeks');
  });

  it('uses current Ground 8 rent arrears thresholds and notice timing', () => {
    const posts = [
      postSegment('rent-arrears-eviction-guide'),
      postSegment('england-section-8-ground-8'),
      postSegment('england-section-8-process'),
    ].join('\n');

    expect(posts).toContain('3 months');
    expect(posts).toContain('13 weeks');
    expect(posts).toContain('4-week notice');
    expect(posts).not.toContain('2-month threshold for Ground 8');
    expect(posts).not.toContain('at least 2 months&apos; rent');
    expect(posts).not.toContain('minimum notice period for Ground 8 is 2 weeks');
  });

  it('keeps Ground 1 and Ground 2 on the current Form 3A timing model', () => {
    const ground1 = postSegment('england-section-8-ground-1');
    const ground2 = postSegment('england-section-8-ground-2');

    expect(ground1).toContain('4-month Form 3A notice period');
    expect(ground1).toContain('12-month timing rule');
    expect(ground1).not.toContain('prior notice requirement as &quot;just and');

    expect(ground2).toContain('4-month notice rule');
    expect(ground2).toContain('4 months&apos; notice');
    expect(ground2).not.toContain('2 months&apos; notice on the');
  });

  it('adds landlord-distress next steps to England ground pages', () => {
    const groundSlugs = [
      'england-section-8-ground-1',
      'england-section-8-ground-2',
      'england-section-8-ground-7',
      'england-section-8-ground-8',
      'england-section-8-ground-10-11',
      'england-section-8-ground-12',
      'england-section-8-ground-14',
      'england-section-8-ground-17',
    ];

    for (const slug of groundSlugs) {
      expect(postSegment(slug)).toContain('section8GroundNextSteps');
    }
  });
});
