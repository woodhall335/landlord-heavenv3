import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('lodger agreement template redirect', () => {
  it('redirects the retired template page straight to the surviving lodger route', () => {
    const content = readFileSync(
      join(process.cwd(), 'src/app/lodger-agreement-template/page.tsx'),
      'utf8'
    );

    expect(content).toContain("permanentRedirect('/lodger-agreement')");
  });
});
