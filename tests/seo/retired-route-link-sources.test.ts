import { readFileSync } from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { RETIRED_PUBLIC_ROUTES } from '@/lib/public-retirements';

const LINK_SOURCE_FILES = [
  'src/lib/seo/internal-links.ts',
  'src/lib/tools/tools.ts',
  'src/lib/ask-heaven/questions/linking.ts',
  'src/app/tools/page.tsx',
  'src/components/ui/NavBar.tsx',
  'src/components/layout/Footer.tsx',
];

describe('retired route link sources', () => {
  it('do not emit retired public routes from shared public link sources', () => {
    LINK_SOURCE_FILES.forEach((relativePath) => {
      const source = readFileSync(path.join(process.cwd(), relativePath), 'utf8');

      RETIRED_PUBLIC_ROUTES.forEach((retiredRoute) => {
        expect(source).not.toContain(retiredRoute);
      });
    });
  });
});
