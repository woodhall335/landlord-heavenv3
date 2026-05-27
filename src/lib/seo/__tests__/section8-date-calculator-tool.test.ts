import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { freeTools } from '@/lib/tools/tools';
import { section8RelatedLinks, tenantNotPayingRentRelatedLinks, toolLinks } from '../internal-links';

const root = process.cwd();

function readRepoFile(...parts: string[]): string {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

describe('Section 8 notice date calculator SEO integration', () => {
  it('registers the tool for the tools hub and menu', () => {
    expect(freeTools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: '/tools/section-8-notice-date-calculator',
          label: 'Section 8 Notice Date Calculator',
          category: 'calculator',
          featured: true,
        }),
      ])
    );
  });

  it('keeps the page on the UniversalHero and tool SEO pattern', () => {
    const page = readRepoFile('src', 'app', 'tools', 'section-8-notice-date-calculator', 'page.tsx');

    expect(page).toContain("import { UniversalHero }");
    expect(page).toContain('Section 8 Notice Date Calculator | England Landlord Tool');
    expect(page).toContain('Calculate the Section 8 notice period, deemed service date');
    expect(page).toContain('<StructuredData data={softwareApplicationSchema()} />');
    expect(page).toContain('<ToolFunnelTracker');
  });

  it('adds the calculator to Section 8 and arrears internal link clusters', () => {
    expect(toolLinks.section8NoticeDateCalculator.href).toBe('/tools/section-8-notice-date-calculator');
    expect(section8RelatedLinks.map((link) => link.href)).toContain('/tools/section-8-notice-date-calculator');
    expect(tenantNotPayingRentRelatedLinks.map((link) => link.href)).toContain(
      '/tools/section-8-notice-date-calculator'
    );
  });
});
