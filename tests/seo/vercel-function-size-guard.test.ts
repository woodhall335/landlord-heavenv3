import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('Vercel function size guardrails', () => {
  it('keeps bulky presentation assets out of every API function trace', async () => {
    const configModule = await import(pathToFileURL(path.join(process.cwd(), 'next.config.mjs')).href);
    const excludes = configModule.default.outputFileTracingExcludes;

    expect(excludes['/api/*']).toEqual(expect.arrayContaining([
      './public/checklists/**/*',
      './public/images/wizard-icons/**/*',
      './public/images/blog/**/*',
      './public/images/generated/**/*',
      './public/images/illustrations/**/*',
      './public/images/heroes/**/*',
    ]));
    expect(excludes['/api/**']).toBeUndefined();
    expect(excludes['/app/api/**']).toBeUndefined();
  });
});
