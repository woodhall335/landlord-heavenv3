import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Section 8 eviction product pages', () => {
  it('keeps Notice Only positioned as the notice-first Stage 1 route', () => {
    const source = readSource('src/app/(marketing)/products/notice-only/page.tsx');

    expect(source).toContain('start correctly before court');
    expect(source).toContain('the next practical step is serving notice');
    expect(source).toContain('This is not just a notice template.');
    expect(source).toContain('You need to serve first and want the notice, service record, and evidence lined up');
    expect(source).toContain('Section8JourneyTimeline');
  });

  it('keeps Complete Pack positioned as the combined Stage 1 plus Stage 2 route', () => {
    const source = readSource('src/app/(marketing)/products/complete-pack/page.tsx');

    expect(source).toContain('includes Stage 1 notice and Stage 2 court paperwork together');
    expect(source).toContain('This pack includes the Stage 1 notice and service file as well as the Stage 2 claim forms');
    expect(source).toContain('What you get in the combined pack');
    expect(source).toContain('without buying Stage 1 separately first');
    expect(source).toContain('Section8JourneyTimeline');
  });

  it('keeps the shared public descriptors aligned with the combined-pack positioning', () => {
    const source = readSource('src/lib/public-products.ts');

    expect(source).toContain("proofLabel: 'Start correctly before court'");
    expect(source).toContain(
      "proofLabel: 'Includes the full Stage 1 notice file plus the Stage 2 court claim pack'"
    );
  });
});
