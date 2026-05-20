import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('Section 8 eviction product pages', () => {
  it('keeps Notice Only positioned as the notice-first Stage 1 route', () => {
    const source = readSource('src/app/(marketing)/products/notice-only/page.tsx');

    expect(source).toContain('Solicitor-approved Section 8 notice and service file');
    expect(source).toContain('Prepare the notice file properly before anything goes to the tenant');
    expect(source).toContain('/images/notice-stage-desktop.webp');
    expect(source).toContain('/images/notice-stage-mobile.webp');
    expect(source).toContain('href="/wizard"');
    expect(source).toContain('8-document notice and service file');
    expect(source).toContain('Form 3A Section 8 notice, N215 certificate of service, rent arrears schedule, service instructions, validity checklist, compliance declaration, case summary, and what-happens-next guide');
    expect(source).toContain('Stage 1 = serve correctly');
    expect(source).toContain("imageSrc: '/images/notice-only-pack.webp'");
    expect(source).toContain("imageSrc: '/images/section-8-notice.webp'");
    expect(source).toContain("imageSrc: '/images/section-8-court-paperwork.webp'");
    expect(source).toContain("imageSrc: '/images/how-it-works-notice-only.webp'");
    expect(source).toContain('This is more than a blank form.');
    expect(source).toContain('N215 Certificate of Service');
    expect(source).toContain('Compliance Declaration');
    expect(source).toContain('Case Summary');
    expect(source).toContain('What Happens Next Guide');
    expect(source).toContain('Section8JourneyTimeline');
  });

  it('keeps Complete Pack positioned as the combined Stage 1 plus Stage 2 route', () => {
    const source = readSource('src/app/(marketing)/products/complete-pack/page.tsx');

    expect(source).toContain('Solicitor-approved Section 8 court and possession file');
    expect(source).toContain('Prepare the full possession file, not just the court forms');
    expect(source).toContain('/images/complete-stage-desktop.webp');
    expect(source).toContain('/images/complete-stage-mobile.webp');
    expect(source).toContain('href="/wizard"');
    expect(source).toContain('Stage 2 = serve, issue, evidence, and prepare for hearing');
    expect(source).toContain("imageSrc: '/images/complete-pack.webp'");
    expect(source).toContain("imageSrc: '/images/section-8-notice.webp'");
    expect(source).toContain("imageSrc: '/images/section-8-court-paperwork.webp'");
    expect(source).toContain("imageSrc: '/images/how-it-works-complete-pack.webp'");
    expect(source).toContain('Everything in Stage 1');
    expect(source).toContain('What you get in the combined pack');
    expect(source).toContain('Stage 1 Notice and Service File');
    expect(source).toContain('N5, N119, witness statement');
    expect(source).toContain('court readiness status');
    expect(source).toContain('court bundle index');
    expect(source).toContain('evidence collection checklist');
    expect(source).toContain('eviction case summary');
    expect(source).toContain('arrears engagement letter');
    expect(source).toContain('without buying Stage 1 separately first');
    expect(source).toContain('Section8JourneyTimeline');
  });

  it('keeps the shared public descriptors aligned with the combined-pack positioning', () => {
    const source = readSource('src/lib/public-products.ts');

    expect(source).toContain("proofLabel: 'Solicitor-approved notice and service file'");
    expect(source).toContain(
      "proofLabel: 'Solicitor-approved court and possession file'"
    );
  });

  it('keeps solicitor-approved wording on the eviction sales surfaces', () => {
    const sources = [
      readSource('src/app/(marketing)/products/notice-only/page.tsx'),
      readSource('src/app/(marketing)/products/complete-pack/page.tsx'),
      readSource('src/app/compare/section-8-stage-1-vs-stage-2/page.tsx'),
      readSource('src/lib/marketing/google-ads-campaigns.ts'),
    ].join('\n').toLowerCase();

    expect(sources).toContain('solicitor-approved');
    expect(sources).toContain('solicitor approved');
    expect(sources).not.toContain('solicitor reviewed');
    expect(sources).not.toContain('solicitor-reviewed');
  });

  it('keeps the shared sales page capable of rendering conversion blocks without removing proof', () => {
    const source = readSource('src/components/marketing/PublicProductSalesPage.tsx');

    expect(source).toContain('function DecisionBlock');
    expect(source).toContain('function ComparisonBlock');
    expect(source).toContain('function ObjectionBlock');
    expect(source).toContain('whatYouGet.sampleProof ? <div>{whatYouGet.sampleProof}</div> : null');
  });
});
