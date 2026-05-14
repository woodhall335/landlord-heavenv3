import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const SITEMAP_SOURCE = fs.readFileSync(path.join(APP_DIR, 'sitemap.ts'), 'utf8');
const TAXONOMY_SOURCE = fs.readFileSync(
  path.join(process.cwd(), 'src', 'lib', 'seo', 'page-taxonomy.ts'),
  'utf8'
);
const HUB_SOURCE = fs.readFileSync(
  path.join(APP_DIR, 'section-8-grounds-explained', 'page.tsx'),
  'utf8'
);
const BLOG_SOURCE = fs.readFileSync(
  path.join(process.cwd(), 'src', 'lib', 'blog', 'posts.tsx'),
  'utf8'
);

const groundPages = [
  {
    code: '1',
    slugCode: '1',
    h1: 'How to Evict a Tenant Using Ground 1 - Landlord or Family Moving In',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-1a'],
  },
  {
    code: '1A',
    slugCode: '1a',
    h1: 'How to Evict a Tenant Using Ground 1A - Selling the Property',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-1'],
  },
  {
    code: '2',
    slugCode: '2',
    h1: 'How to Evict a Tenant Using Ground 2 - Mortgage Lender Sale',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-1a'],
  },
  {
    code: '7A',
    slugCode: '7a',
    h1: 'How to Evict a Tenant Using Ground 7A - Serious ASB or Criminal Behaviour',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-14', '/section-8-grounds/how-to-evict-a-tenant-using-ground-12'],
  },
  {
    code: '8',
    slugCode: '8',
    h1: 'How to Evict a Tenant Using Ground 8 - Serious Rent Arrears',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-10', '/section-8-grounds/how-to-evict-a-tenant-using-ground-11'],
  },
  {
    code: '10',
    slugCode: '10',
    h1: 'How to Evict a Tenant Using Ground 10 - Any Rent Arrears',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-8', '/section-8-grounds/how-to-evict-a-tenant-using-ground-11'],
  },
  {
    code: '11',
    slugCode: '11',
    h1: 'How to Evict a Tenant Using Ground 11 - Persistent Late Rent',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-8', '/section-8-grounds/how-to-evict-a-tenant-using-ground-10'],
  },
  {
    code: '12',
    slugCode: '12',
    h1: 'How to Evict a Tenant Using Ground 12 - Breach of Tenancy',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-13', '/section-8-grounds/how-to-evict-a-tenant-using-ground-14'],
  },
  {
    code: '13',
    slugCode: '13',
    h1: 'How to Evict a Tenant Using Ground 13 - Property Deterioration',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-15', '/section-8-grounds/how-to-evict-a-tenant-using-ground-12'],
  },
  {
    code: '14',
    slugCode: '14',
    h1: 'How to Evict a Tenant Using Ground 14 - Antisocial Behaviour',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-7a', '/section-8-grounds/how-to-evict-a-tenant-using-ground-12'],
  },
  {
    code: '15',
    slugCode: '15',
    h1: 'How to Evict a Tenant Using Ground 15 - Furniture Deterioration',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-13', '/section-8-grounds/how-to-evict-a-tenant-using-ground-12'],
  },
  {
    code: '17',
    slugCode: '17',
    h1: 'How to Evict a Tenant Using Ground 17 - False Statement by Tenant',
    related: ['/section-8-grounds/how-to-evict-a-tenant-using-ground-12'],
  },
] as const;

function routePath(slugCode: string) {
  return `/section-8-grounds/how-to-evict-a-tenant-using-ground-${slugCode}`;
}

function legacyRoutePath(slugCode: string) {
  return `/how-to-evict-a-tenant-using-ground-${slugCode}`;
}

function pageSource(slugCode: string) {
  return fs.readFileSync(path.join(APP_DIR, routePath(slugCode).slice(1), 'page.tsx'), 'utf8');
}

function metadataString(source: string, key: 'title' | 'description') {
  const match = source.match(new RegExp(`${key}:\\s*["']([^"']+)["']`));
  expect(match?.[1], `missing ${key}`).toBeTruthy();
  return match![1];
}

describe('Section 8 ground commercial pages', () => {
  it('creates all one-off nested route files and removes old page files', () => {
    for (const page of groundPages) {
      expect(fs.existsSync(path.join(APP_DIR, routePath(page.slugCode).slice(1), 'page.tsx'))).toBe(true);
      expect(fs.existsSync(path.join(APP_DIR, legacyRoutePath(page.slugCode).slice(1), 'page.tsx'))).toBe(false);
    }

    expect(fs.existsSync(path.join(APP_DIR, 'evict-tenant-landlord-moving-back-in', 'page.tsx'))).toBe(false);
  });

  it('has unique metadata with self-canonicals and 140-155 character descriptions', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const page of groundPages) {
      const source = pageSource(page.slugCode);
      const title = metadataString(source, 'title');
      const description = metadataString(source, 'description');
      const route = routePath(page.slugCode);

      expect(title, route).toBeTruthy();
      expect(titles.has(title), route).toBe(false);
      titles.add(title);

      expect(description.length, `${route}: ${description}`).toBeGreaterThanOrEqual(140);
      expect(description.length, `${route}: ${description}`).toBeLessThanOrEqual(155);
      expect(descriptions.has(description), route).toBe(false);
      descriptions.add(description);

      expect(source).toContain(`const canonical = \"https://landlordheaven.co.uk${route}\"`);
      expect(source).not.toContain('noindex');
    }
  });

  it('includes required visible content, CTAs, sample links, and checklist PDFs', () => {
    for (const page of groundPages) {
      const source = pageSource(page.slugCode);

      expect(source).toContain(page.h1);
      expect(source).toContain('Ground meaning');
      expect(source).toContain('Mandatory or discretionary status');
      expect(source).toContain('Current notice period');
      expect(source).toContain('When this ground fits and when it does not');
      expect(source).toContain('What the landlord must prove');
      expect(source).toContain('Step-by-step landlord workflow before serving Form 3A');
      expect(source).toContain('Post-May 2026 compliance note');
      expect(source).toContain('Court progression and Complete Pack next step');
      expect(source).toContain(`Common mistakes with Ground ${page.code}`);
      expect(source).toContain(`Ground ${page.code} evidence checklist`);
      expect(source).toContain('ChecklistPreview');
      expect(source).toContain(`/checklists/ground-${page.slugCode}.png`);
      expect(source).toContain(`Download the ungated Ground ${page.code} PDF checklist.`);
      expect(source).toContain('/samples/notice-only');
      expect(source).toContain('See a real Form 3A notice with sample Ground');
      expect(source).toContain(`/checklists/ground-${page.slugCode}.pdf`);
      expect(source).toContain(
        `/products/notice-only?route=section-8&ground=${page.code}&src=seo_ground_${page.slugCode}`
      );
      expect(source).toContain(
        `/products/complete-pack?route=section-8&ground=${page.code}&src=seo_ground_${page.slugCode}_complete`
      );
      expect(source).toContain('FAQSection');

      expect(fs.existsSync(path.join(process.cwd(), 'public', 'checklists', `ground-${page.slugCode}.pdf`))).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), 'public', 'checklists', `ground-${page.slugCode}.png`))).toBe(true);
    }
  });

  it('keeps related grounds configured where relevant', () => {
    for (const page of groundPages) {
      const source = pageSource(page.slugCode);
      for (const href of page.related) {
        expect(source, `${routePath(page.slugCode)} should link ${href}`).toContain(href);
      }
    }
  });

  it('adds sitemap and taxonomy coverage for all ground pages but not the redirect alias', () => {
    for (const page of groundPages) {
      const route = routePath(page.slugCode);
      expect(SITEMAP_SOURCE).toContain(`path: '${route}'`);
      expect(TAXONOMY_SOURCE).toContain(`'${route}'`);
    }

    expect(SITEMAP_SOURCE).not.toContain("path: '/evict-tenant-landlord-moving-back-in'");
    expect(TAXONOMY_SOURCE).not.toContain("'/evict-tenant-landlord-moving-back-in'");
  });

  it('avoids a landlord-returning Ground 3 page and keeps Ground 1 copy explicit', () => {
    const ground1 = pageSource('1');
    expect(ground1).toContain('handled under Ground 1');
    expect(ground1).toContain('Do not frame a landlord-moving-back-in case as a Ground 3 route');
    expect(groundPages.map((page) => routePath(page.slugCode))).not.toContain('/section-8-grounds/how-to-evict-a-tenant-using-ground-3');
  });

  it('redirects legacy ground URLs and the landlord-moving-back-in alias', async () => {
    const configModule = await import(pathToFileURL(path.join(process.cwd(), 'next.config.mjs')).href);
    const redirects = await configModule.default.redirects();

    for (const page of groundPages) {
      expect(redirects).toContainEqual({
        source: legacyRoutePath(page.slugCode),
        destination: routePath(page.slugCode),
        permanent: true,
      });
    }

    expect(redirects).toContainEqual({
      source: '/evict-tenant-landlord-moving-back-in',
      destination: routePath('1'),
      permanent: true,
    });
  });

  it('distinguishes Ground 7A and Ground 14 in both ASB pages', () => {
    const ground7a = pageSource('7a');
    const ground14 = pageSource('14');

    expect(ground7a).toContain('mandatory serious ASB or criminal behaviour ground');
    expect(ground7a).toContain('Ground 14 is broader, discretionary');
    expect(ground14).toContain('Ground 14 is broader and discretionary');
    expect(ground14).toContain('Ground 7A is mandatory but narrower');
  });

  it('links from the Section 8 hub and existing ground blog content to the commercial pages', () => {
    for (const page of groundPages) {
      const route = routePath(page.slugCode);
      expect(HUB_SOURCE, route).toContain(route);
      expect(BLOG_SOURCE, route).toContain(route);
    }
  });
});
