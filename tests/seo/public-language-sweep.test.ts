import fs from 'fs';
import path from 'path';

const FILES_TO_CHECK = [
  'src/app/(app)/wizard/WizardClientPage.tsx',
  'src/app/(marketing)/about/page.tsx',
  'src/app/(marketing)/blog/page.tsx',
  'src/app/(marketing)/help/page.tsx',
  'src/app/(marketing)/pricing/page.tsx',
  'src/app/(marketing)/products/ast/page.tsx',
  'src/app/(marketing)/products/complete-pack/page.tsx',
  'src/app/(marketing)/products/money-claim/page.tsx',
  'src/app/(marketing)/products/notice-only/page.tsx',
  'src/app/(marketing)/products/section-13-standard/page.tsx',
  'src/components/landing/heroConfigs.tsx',
  'src/lib/marketing/funnelProcessSection.ts',
  'src/lib/public-products.ts',
];

const BANNED_PHRASES = [
  'Start the right landlord workflow for your property in England',
  'straight into the guided workflow',
  'The public site is written for landlords',
  'Public product scope:',
  'Prepare the England court-possession route',
  'document-generation and workflow product',
  'England route guides',
  'Choose the route that matches the problem',
  'Start with the route you actually need',
  'current framework',
  'clearer chooser',
  'Used during your generated case pack workflow.',
  'Money Claim Workflow',
  'Current England route -> N5 + N119',
];

describe('Public language sweep regression', () => {
  it('keeps core public pages free of internal or awkward marketing phrasing', () => {
    const contents = FILES_TO_CHECK.map((file) => ({
      file,
      text: fs.readFileSync(path.join(process.cwd(), file), 'utf-8'),
    }));

    const violations: string[] = [];

    for (const { file, text } of contents) {
      for (const phrase of BANNED_PHRASES) {
        if (text.includes(phrase)) {
          violations.push(`${file}: ${phrase}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('keeps the updated landlord-facing replacements in the core public pages', () => {
    const wizard = fs.readFileSync(
      path.join(process.cwd(), 'src/app/(app)/wizard/WizardClientPage.tsx'),
      'utf-8'
    );
    const noticeOnly = fs.readFileSync(
      path.join(process.cwd(), 'src/app/(marketing)/products/notice-only/page.tsx'),
      'utf-8'
    );
    const completePack = fs.readFileSync(
      path.join(process.cwd(), 'src/app/(marketing)/products/complete-pack/page.tsx'),
      'utf-8'
    );
    const astHub = fs.readFileSync(
      path.join(process.cwd(), 'src/app/(marketing)/products/ast/page.tsx'),
      'utf-8'
    );

    expect(wizard).toContain('Choose the landlord product you need');
    expect(wizard).toContain('Choose the product that matches the job in front of you');
    expect(noticeOnly).toContain('Read the England Section 8 guides before you serve');
    expect(completePack).toContain('Read the England possession guides before you file');
    expect(astHub).toContain('Choose the agreement that fits the let');
  });
});
