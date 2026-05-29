import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('eviction wizard start routing', () => {
  const source = readFileSync(join(process.cwd(), 'src/app/(app)/wizard/flow/page.tsx'), 'utf8');

  it('does not render the England eviction product chooser before starting the wizard', () => {
    expect(source).not.toContain('Choose the pack you want to start with');
    expect(source).not.toContain('England eviction wizard');
    expect(source).not.toContain('showEnglandEvictionProductChooser');
  });

  it('defaults productless eviction starts to Notice Only', () => {
    expect(source).toContain("startProduct = 'notice_only';");
    expect(source).toContain("product === 'complete_pack'");
    expect(source).toContain(": 'notice_only'");
  });
});
