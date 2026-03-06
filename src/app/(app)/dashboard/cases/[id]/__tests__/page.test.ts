import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('case detail page', () => {
  it('does not render Ask Heaven Case Q&A section', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/app/(app)/dashboard/cases/[id]/page.tsx'),
      'utf8'
    );

    expect(source).not.toContain('Ask Heaven — Case Q&A');
    expect(source).not.toContain('runAskHeaven');
  });
});
