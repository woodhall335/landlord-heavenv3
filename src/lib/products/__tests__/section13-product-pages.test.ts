import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Section 13 product pages', () => {
  it('keeps the standard page positioned as the serve-and-evidence route with preview proof', () => {
    const source = readSource('src/app/(marketing)/products/section-13-standard/page.tsx');

    expect(source).toContain('earlyProofBand: {');
    expect(source).toContain('const samplePreviewEntries = config.packBreakdown.map');
    expect(source).toContain('fallbackEntries={samplePreviewEntries}');
    expect(source).toContain('samplePageHref={samplePage?.samplePath}');
    expect(source).toContain('hideSection: true');
    expect(source).toContain('href: product.wizardHref');
    expect(source).toContain('href: PRODUCTS.section13_defensive.wizardHref');
    expect(source).toContain('Build my supported rent increase');
    expect(source).toContain('Prepare for a rent challenge');
    expect(source).toContain('Supported Rent Increase Pack FAQs');
    expect(source).not.toContain('Choose Standard if you need to serve the rent increase now');
    expect(source).not.toContain('This is the right fit when you want to propose a rent increase');
    expect(source).not.toContain('What you get in the standard rent increase pack');
    expect(source).not.toContain('Need the challenge-ready defence route instead?');
  });

  it('keeps the defence page positioned as the challenge-ready route with preview proof', () => {
    const source = readSource('src/app/(marketing)/products/section-13-defence/page.tsx');

    expect(source).toContain('fullWidthPreview: true');
    expect(source).toContain('const samplePreviewEntries = config.packBreakdown.map');
    expect(source).toContain('fallbackEntries={samplePreviewEntries}');
    expect(source).toContain('samplePageHref={samplePage?.samplePath}');
    expect(source).toContain('hideSection: true');
    expect(source).toContain('href: PRODUCTS.section13_standard.wizardHref');
    expect(source).toContain('href: product.wizardHref');
    expect(source).toContain('Questions landlords ask before choosing the defence route');
    expect(source).toContain('Prepare for a rent challenge');
    expect(source).toContain('I only need the supported option');
    expect(source).toContain('Tribunal-Ready Rent Increase Pack FAQs');
    expect(source).not.toContain('Choose Defence if the increase may be challenged');
    expect(source).not.toContain('What you get in the challenge-ready defence pack');
    expect(source).not.toContain('Only need the standard rent increase route?');
    expect(source).not.toContain('Run the free rent checker first');
  });
});
