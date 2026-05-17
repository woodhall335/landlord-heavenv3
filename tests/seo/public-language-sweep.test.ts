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
  'src/components/landing/HomeContent.tsx',
  'src/components/landing/heroConfigs.tsx',
  'src/components/ask-heaven/NextBestActionCard.tsx',
  'src/components/marketing/CommercialBridge.tsx',
  'src/components/seo/CommercialSeoNextStep.tsx',
  'src/lib/blog/product-cta-map.ts',
  'src/lib/blog/next-steps-cta.ts',
  'src/lib/ask-heaven/cta-copy.ts',
  'src/lib/ask-heaven/questions/linking.ts',
  'src/lib/tools/tools.ts',
  'src/lib/marketing/funnelProcessSection.ts',
  'src/lib/marketing/product-sample-pages.ts',
  'src/lib/marketing/section13-products.ts',
  'src/lib/public-products.ts',
  'src/lib/seo/product-owner-metadata.ts',
  'src/app/(marketing)/products/notice-only/page.tsx',
  'src/app/(marketing)/products/complete-pack/page.tsx',
  'src/app/(marketing)/products/money-claim/page.tsx',
  'src/app/(marketing)/products/section-13-standard/page.tsx',
  'src/app/(marketing)/products/section-13-defence/page.tsx',
  'src/app/standard-tenancy-agreement/page.tsx',
  'src/app/premium-tenancy-agreement/page.tsx',
  'src/app/student-tenancy-agreement/page.tsx',
  'src/app/hmo-shared-house-tenancy-agreement/page.tsx',
  'src/app/lodger-agreement/page.tsx',
  'src/app/tenant-not-paying-rent/page.tsx',
  'src/app/tenant-stopped-paying-rent/page.tsx',
  'src/app/tenant-left-without-paying-rent/page.tsx',
  'src/app/tenant-wont-leave/page.tsx',
  'src/app/warrant-of-possession-guide/page.tsx',
  'src/app/warrant-of-possession/page.tsx',
  'src/app/rent-increase/RentIncreaseGuidePage.tsx',
  'src/app/wales-tenancy-agreement-template/page.tsx',
  'src/app/wales-eviction-notices/page.tsx',
  'src/app/tools/rent-arrears-calculator/page.tsx',
  'src/app/tools/hmo-license-checker/page.tsx',
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
  'Go to eviction notice route',
  'Go to complete eviction route',
  'Go to money claim route',
  'Open Eviction Notice Generator',
  'Start the Eviction Notice Generator',
  'Start the Complete Eviction Pack',
  'Start the Money Claim Pack',
  'Start your court pack',
  'Start England Notice Wizard',
  'Start Agreement Wizard',
  'Start money claim pack',
  'Start money claim',
  'Start Section 8 notice',
  'Start Notice Only',
  'Start Complete Pack',
  'Start Complete Eviction Pack',
  'Start Standard Setup Pack',
  'Start Premium Management Pack',
  'Start Student Tenancy Agreement',
  'Start HMO Management Pack',
  'Start Room Let Pack',
  'Generate a Current England Notice',
  'Generate a Section 173 Notice',
  'Generate a Notice to Leave',
  'Get the Complete Eviction Pack',
  'Start a Money Claim',
  'solicitor-approved',
  'validated',
  'court-ready',
  'Generate notice pack',
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
    expect(noticeOnly).toContain('Create my Section 8 notice');
    expect(completePack).toContain('Prepare my court pack');
    expect(astHub).toContain('Choose the agreement that fits the let');
    expect(fs.readFileSync(path.join(process.cwd(), 'src/components/landing/HomeContent.tsx'), 'utf-8')).toContain('Prepare my court pack');
    expect(fs.readFileSync(path.join(process.cwd(), 'src/lib/blog/product-cta-map.ts'), 'utf-8')).toContain('Prepare my money claim');
  });
});
