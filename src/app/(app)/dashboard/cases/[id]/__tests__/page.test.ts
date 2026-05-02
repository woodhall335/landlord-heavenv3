import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('case detail page', () => {
  it('does not render Ask Heaven Case Q&A section', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/(app)/dashboard/cases/[id]/page.tsx'),
      'utf8'
    );

    expect(source).not.toContain('Ask Heaven â€” Case Q&A');
    expect(source).not.toContain('runAskHeaven');
  });

  it('contains the paid Stage 1 to Stage 2 upgrade CTA and checkout intent', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/(app)/dashboard/cases/[id]/page.tsx'),
      'utf8'
    );

    expect(source).toContain('Upgrade this case to the Complete Pack for');
    expect(source).toContain("upgrade_from_product: 'notice_only'");
    expect(source).toContain('Stage 2 unlocked on this same case');
  });
});
