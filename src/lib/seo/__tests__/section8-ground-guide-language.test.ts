import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { enhanceSection8GroundMetadata } from '../section8-ground-guide';

const root = process.cwd();
const groundSlugs = ['1a', '2', '7a', '8', '10', '11', '12', '13', '14', '15', '17'];
const allGroundSlugs = ['1', ...groundSlugs, '16'];

function readGroundPage(ground: string) {
  return readFileSync(
    join(root, 'src', 'app', 'section-8-grounds', `how-to-evict-a-tenant-using-ground-${ground}`, 'page.tsx'),
    'utf8'
  );
}

describe('Section 8 ground guides', () => {
  it('uses direct landlord language and a focused notice-help CTA on the shared guide template', () => {
    for (const ground of groundSlugs) {
      const source = readGroundPage(ground);

      expect(source).toContain('What you need to show');
      expect(source).toContain('What to do before you serve Form 3A');
      expect(source).toContain('If your tenant does not leave');
      expect(source).toContain('src="seo_ground_assisted_cta"');
      expect(source).not.toContain('What the landlord must prove');
      expect(source).not.toContain('Step-by-step landlord workflow before serving Form 3A');
    }
  });

  it('gives Ground 1 and Ground 16 their own targeted notice-help CTA', () => {
    const ground1 = readGroundPage('1');
    const ground16 = readGroundPage('16');

    expect(ground1).toContain('src="seo_ground_1_assisted_prep"');
    expect(ground16).toContain('src="seo_ground_16_assisted_prep"');
    expect(ground16).toContain("label: 'Book a free consultation'");
  });

  it('creates search-intent metadata, social previews, and crawl directives for every guide', () => {
    for (const ground of allGroundSlugs) {
      const metadata = enhanceSection8GroundMetadata(
        {
          alternates: { canonical: `https://landlordheaven.co.uk/section-8-grounds/ground-${ground}` },
          keywords: ['landlord possession guide'],
        },
        ground
      );
      const openGraph = metadata.openGraph as { images?: Array<{ url: string }> };
      const twitter = metadata.twitter as { card?: string; images?: string[] };

      expect(metadata.title).toContain(`Section 8 Ground ${ground.toUpperCase()}`);
      expect(metadata.description).toContain('Form 3A');
      expect(metadata.keywords).toContain(`section 8 ground ${ground}`);
      expect(openGraph.images?.[0]?.url).toMatch(/^\/images\/heroes\//);
      expect(twitter.card).toBe('summary_large_image');
      expect(twitter.images?.[0]).toMatch(/^\/images\/heroes\//);
    }
  });

  it('adds the shared decision path for conversion-focused guide journeys', () => {
    const layout = readFileSync(join(root, 'src', 'app', 'section-8-grounds', 'layout.tsx'), 'utf8');
    const hero = readFileSync(join(root, 'src', 'components', 'seo', 'Section8GroundUniversalHero.tsx'), 'utf8');

    expect(layout).toContain('<Section8GroundDecisionPath />');
    expect(hero).toContain("label: 'Book a free consultation'");
    expect(hero).toContain('Start my Section 8 notice');
  });
});
