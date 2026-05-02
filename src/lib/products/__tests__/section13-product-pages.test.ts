import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Section 13 product pages', () => {
  it('keeps the standard page positioned as the serve-and-evidence route with preview proof', () => {
    const source = readSource('src/app/(marketing)/products/section-13-standard/page.tsx');

    expect(source).toContain('Choose the Standard Section 13 option if you want to serve the increase properly now');
    expect(source).toContain('preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined');
    expect(source).toContain('What you get in the standard rent increase file');
    expect(source).toContain('Start the standard Section 13 option');
    expect(source).toContain('Need the challenge-ready defence route instead?');
  });

  it('keeps the defence page positioned as the challenge-ready route with preview proof', () => {
    const source = readSource('src/app/(marketing)/products/section-13-defence/page.tsx');

    expect(source).toContain('Choose the defence option if the Section 13 pack needs to hold up under challenge');
    expect(source).toContain('preview: sampleProof ? <GoldenPackProof data={sampleProof} /> : undefined');
    expect(source).toContain('What you get in the challenge-ready defence pack');
    expect(source).toContain('Start the challenge-ready defence option');
    expect(source).toContain('Only need the standard rent increase route?');
  });
});
