import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Section 8 eviction product pages', () => {
  it('keeps Notice Only positioned as the notice-first Stage 1 route', () => {
    const source = readSource('src/app/(marketing)/products/notice-only/page.tsx');

    expect(source).toContain('serve before court');
    expect(source).toContain('need to serve the Section 8 notice first');
    expect(source).toContain('Choose Stage 1 if you need to serve the notice first');
    expect(source).toContain('preview the actual Section 8 notice file before you pay');
    expect(source).toContain("imageSrc: '/images/notice-only-pack.webp'");
    expect(source).toContain("imageSrc: '/images/how-it-works-notice-only.webp'");
    expect(source).toContain('This is more than a blank notice.');
    expect(source).toContain('Start the notice-first wizard');
    expect(source).toContain('Serve the Section 8 notice correctly now');
    expect(source).toContain('You need to serve the notice first and want the service record and evidence ready');
    expect(source).toContain('Section8JourneyTimeline');
  });

  it('keeps Complete Pack positioned as the combined Stage 1 plus Stage 2 route', () => {
    const source = readSource('src/app/(marketing)/products/complete-pack/page.tsx');

    expect(source).toContain('notice and court paperwork together');
    expect(source).toContain('Choose Stage 2 if you want the court route from the start');
    expect(source).toContain('You do not need to buy Stage 1 separately first');
    expect(source).toContain('preview the Section 8 notice, claim forms, and court file before paying');
    expect(source).toContain("imageSrc: '/images/complete-pack.webp'");
    expect(source).toContain("imageSrc: '/images/how-it-works-complete-pack.webp'");
    expect(source).toContain('It includes the Stage 1 notice file plus the claim forms');
    expect(source).toContain('What you get in the combined pack');
    expect(source).toContain('Start the full Section 8 court route');
    expect(source).toContain('N5, N119, witness statement');
    expect(source).toContain('without buying Stage 1 separately first');
    expect(source).toContain('Section8JourneyTimeline');
  });

  it('keeps the shared public descriptors aligned with the combined-pack positioning', () => {
    const source = readSource('src/lib/public-products.ts');

    expect(source).toContain("proofLabel: 'Serve the notice before court'");
    expect(source).toContain(
      "proofLabel: 'Notice and court claim file together'"
    );
  });

  it('keeps the shared sales page capable of rendering conversion blocks without removing proof', () => {
    const source = readSource('src/components/marketing/PublicProductSalesPage.tsx');

    expect(source).toContain('function DecisionBlock');
    expect(source).toContain('function ComparisonBlock');
    expect(source).toContain('function ObjectionBlock');
    expect(source).toContain('whatYouGet.sampleProof ? <div>{whatYouGet.sampleProof}</div> : null');
  });
});
