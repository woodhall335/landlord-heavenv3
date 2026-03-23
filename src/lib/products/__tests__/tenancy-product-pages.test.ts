import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string) {
  return readFileSync(join(process.cwd(), relativePath), 'utf8');
}

describe('tenancy product pages', () => {
  it('/products/ast uses the shared tenancy pack section and pack-first copy', () => {
    const source = readSource('src/app/(marketing)/products/ast/page.tsx');

    expect(source).toContain('<TenancyPackSection');
    expect(source).toContain('title="What\'s included"');
    expect(source).toContain('You get more than a tenancy agreement.');
    expect(source).toContain('preview the documents before paying');
  });

  it.each([
    'src/app/tenancy-agreements/england/page.tsx',
    'src/app/tenancy-agreements/wales/page.tsx',
    'src/app/tenancy-agreements/scotland/page.tsx',
    'src/app/tenancy-agreements/northern-ireland/page.tsx',
  ])('%s includes the shared tenancy pack section', (relativePath) => {
    const source = readSource(relativePath);

    expect(source).toContain('<TenancyPackSection');
    expect(source).toContain('lockJurisdiction');
  });
});
