import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('Vercel function size guardrails', () => {
  it('keeps bulky public checklist assets out of the money claim function trace', async () => {
    const configModule = await import(pathToFileURL(path.join(process.cwd(), 'next.config.mjs')).href);
    const excludes = configModule.default.outputFileTracingExcludes;

    expect(excludes['/money-claim']).toContain('./public/checklists/**/*');
    expect(excludes['/money-claim']).toContain('./public/images/wizard-icons/**/*');
    expect(excludes['/money-claim']).toContain('./public/images/blog/**/*');
  });
});
