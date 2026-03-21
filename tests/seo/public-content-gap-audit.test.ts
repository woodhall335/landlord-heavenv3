import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  getCandidateRedirects,
  getRetainedSeoPageTaxonomyEntries,
  getRetainedSupportingPages,
  getSeoPageTaxonomy,
  getTopInternalLinkRecipients,
} from '@/lib/seo/page-taxonomy';
import { discoverStaticPageRoutes } from '@/lib/seo/static-route-inventory.shared.mjs';

const NORMALISED_TENANCY_BATCH = [
  '/renting-homes-wales-written-statement',
  '/scotland-prt-model-agreement-guide',
  '/update-occupation-contract-wales',
  '/joint-occupation-contract-wales',
  '/fixed-term-periodic-occupation-contract-wales',
  '/update-prt-tenancy-agreement-scotland',
  '/joint-prt-tenancy-agreement-scotland',
  '/common-prt-tenancy-mistakes-scotland',
  '/update-tenancy-agreement-northern-ireland',
  '/joint-tenancy-agreement-northern-ireland',
  '/fixed-term-tenancy-agreement-northern-ireland',
] as const;
const NORMALISED_COURT_BATCH = [
  '/county-court-claim-form-guide',
  '/eviction-cost-uk',
  '/eviction-court-forms-england',
  '/eviction-timeline-england',
  '/n5-n119-possession-claim',
  '/possession-order-process',
  '/court-bailiff-eviction-guide',
  '/eviction-timeline-uk',
] as const;
const RETAINED_COURT_BATCH = [
  '/county-court-claim-form-guide',
  '/eviction-cost-uk',
  '/eviction-court-forms-england',
  '/eviction-timeline-england',
  '/n5-n119-possession-claim',
  '/possession-order-process',
] as const;
const COURT_REDIRECT_CANDIDATES = [
  '/court-bailiff-eviction-guide',
  '/eviction-timeline-uk',
] as const;
const NORMALISED_NOTICE_BATCH = [
  '/eviction-notice',
  '/eviction-notice-template',
  '/eviction-notice-england',
  '/eviction-notice-uk',
  '/notice-to-quit-northern-ireland-guide',
  '/section-21-notice-period',
  '/section-8-vs-section-21',
  '/wales-eviction-notice-template',
] as const;
const RETAINED_NOTICE_BATCH = [
  '/eviction-notice',
  '/eviction-notice-template',
  '/eviction-notice-england',
  '/notice-to-quit-northern-ireland-guide',
  '/section-21-notice-period',
  '/section-8-vs-section-21',
  '/wales-eviction-notice-template',
] as const;
const NOTICE_REDIRECT_CANDIDATES = ['/eviction-notice-uk'] as const;

const EXCLUDED_ROUTE_PREFIXES = ['/api', '/ask-heaven', '/checkout', '/products', '/tools'];
const EXCLUDED_ROUTES = new Set(['/']);
const INTENT_SHELL_PATH = path.join(
  process.cwd(),
  'src',
  'components',
  'seo',
  'EvictionIntentLandingPage.tsx'
);

function pageFileForPathname(pathname: string): string {
  const segments = pathname === '/' ? [] : pathname.slice(1).split('/');
  return path.join(process.cwd(), 'src', 'app', ...segments, 'page.tsx');
}

function isPublicContentRoute(pathname: string): boolean {
  if (EXCLUDED_ROUTES.has(pathname)) {
    return false;
  }

  return !EXCLUDED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function getPublicContentRoutes(): Promise<string[]> {
  const routes = await discoverStaticPageRoutes();
  return routes.filter(isPublicContentRoute);
}

async function getRemainingOutsideTaxonomyRoutes(): Promise<string[]> {
  const routes = await getPublicContentRoutes();
  return routes.filter((pathname) => !getSeoPageTaxonomy(pathname)).sort();
}

async function getRemainingWizardFirstPageFiles(): Promise<string[]> {
  const routes = await getPublicContentRoutes();
  const sharedIntentShellSource = fs.readFileSync(INTENT_SHELL_PATH, 'utf8');
  const sharedIntentShellSupportsMappedProductRouting =
    sharedIntentShellSource.includes('getSeoPageTaxonomyBySlug') &&
    sharedIntentShellSource.includes('getPrimaryDestinationAboveFold') &&
    sharedIntentShellSource.includes('SeoPageContextPanel');

  const directWizardFiles = routes
    .map((pathname) => pageFileForPathname(pathname))
    .filter((filePath) => fs.existsSync(filePath))
    .filter((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      return source.includes('buildWizardLink') || source.includes('/wizard?');
    })
    .sort();

  if (sharedIntentShellSupportsMappedProductRouting) {
    return directWizardFiles;
  }

  const mappedIntentWrapperFiles = routes
    .filter((pathname) => getSeoPageTaxonomy(pathname))
    .map((pathname) => ({
      pathname,
      filePath: pageFileForPathname(pathname),
    }))
    .filter(({ filePath }) => fs.existsSync(filePath))
    .filter(({ filePath }) => {
      const source = fs.readFileSync(filePath, 'utf8');
      return source.includes('EvictionIntentLandingPage');
    })
    .map(({ filePath }) => filePath);

  return [...new Set([...directWizardFiles, ...mappedIntentWrapperFiles])].sort();
}

function hasSharedContextSupport(filePath: string): boolean {
  const source = fs.readFileSync(filePath, 'utf8');

  if (source.includes('SeoPageContextPanel')) {
    return true;
  }

  if (!source.includes('EvictionIntentLandingPage')) {
    return false;
  }

  const sharedIntentShellSource = fs.readFileSync(INTENT_SHELL_PATH, 'utf8');
  return (
    sharedIntentShellSource.includes('SeoPageContextPanel') &&
    sharedIntentShellSource.includes('getSeoPageTaxonomyBySlug')
  );
}

function getPagesMissingContextSupport(): string[] {
  return getRetainedSeoPageTaxonomyEntries()
    .filter((entry) => entry.freshnessRequired)
    .filter((entry) => {
      const filePath = pageFileForPathname(entry.pathname);
      return fs.existsSync(filePath) && !hasSharedContextSupport(filePath);
    })
    .map((entry) => entry.pathname)
    .sort();
}

function getPagesMissingContextualLinks(): string[] {
  return getRetainedSeoPageTaxonomyEntries()
    .filter((entry) => {
      const filePath = pageFileForPathname(entry.pathname);
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const source = fs.readFileSync(filePath, 'utf8');
      const hasSharedContextPanel = hasSharedContextSupport(filePath);
      const hasExplicitLinkTriplet =
        source.includes(entry.primaryPillar) &&
        source.includes(entry.supportingPage) &&
        source.includes(entry.primaryProduct);

      return !hasSharedContextPanel && !hasExplicitLinkTriplet;
    })
    .map((entry) => entry.pathname)
    .sort();
}

describe('Public content gap audit', () => {
  it('removes the selected tenancy batch from the remaining public SEO gap inventories', async () => {
    const outsideTaxonomy = await getRemainingOutsideTaxonomyRoutes();
    const wizardFirstFiles = await getRemainingWizardFirstPageFiles();
    const missingContextSupport = getPagesMissingContextSupport();
    const missingContextualLinks = getPagesMissingContextualLinks();

    expect(outsideTaxonomy).not.toEqual(expect.arrayContaining([...NORMALISED_TENANCY_BATCH]));
    expect(wizardFirstFiles).not.toEqual(
      expect.arrayContaining(NORMALISED_TENANCY_BATCH.map((pathname) => pageFileForPathname(pathname)))
    );
    expect(missingContextSupport).not.toEqual(expect.arrayContaining([...NORMALISED_TENANCY_BATCH]));
    expect(missingContextualLinks).not.toEqual(expect.arrayContaining([...NORMALISED_TENANCY_BATCH]));
  });

  it('removes the selected court batch from the remaining public SEO gap inventories', async () => {
    const outsideTaxonomy = await getRemainingOutsideTaxonomyRoutes();
    const wizardFirstFiles = await getRemainingWizardFirstPageFiles();
    const missingContextSupport = getPagesMissingContextSupport();
    const missingContextualLinks = getPagesMissingContextualLinks();

    expect(outsideTaxonomy).not.toEqual(expect.arrayContaining([...NORMALISED_COURT_BATCH]));
    expect(wizardFirstFiles).not.toEqual(
      expect.arrayContaining(NORMALISED_COURT_BATCH.map((pathname) => pageFileForPathname(pathname)))
    );
    expect(missingContextSupport).not.toEqual(expect.arrayContaining([...RETAINED_COURT_BATCH]));
    expect(missingContextualLinks).not.toEqual(expect.arrayContaining([...RETAINED_COURT_BATCH]));
  });

  it('removes the selected notice batch from the remaining public SEO gap inventories', async () => {
    const outsideTaxonomy = await getRemainingOutsideTaxonomyRoutes();
    const wizardFirstFiles = await getRemainingWizardFirstPageFiles();
    const missingContextSupport = getPagesMissingContextSupport();
    const missingContextualLinks = getPagesMissingContextualLinks();

    expect(outsideTaxonomy).not.toEqual(expect.arrayContaining([...NORMALISED_NOTICE_BATCH]));
    expect(wizardFirstFiles).not.toEqual(
      expect.arrayContaining(NORMALISED_NOTICE_BATCH.map((pathname) => pageFileForPathname(pathname)))
    );
    expect(missingContextSupport).not.toEqual(expect.arrayContaining([...RETAINED_NOTICE_BATCH]));
    expect(missingContextualLinks).not.toEqual(expect.arrayContaining([...RETAINED_NOTICE_BATCH]));
  });

  it('keeps redirect, supporting-live, and inbound-link reporting available for the audit pass', () => {
    const redirects = getCandidateRedirects().map(({ source }) => source);

    expect(getCandidateRedirects().length).toBeGreaterThan(0);
    expect(getRetainedSupportingPages()).toEqual(
      expect.arrayContaining([
        ...NORMALISED_TENANCY_BATCH,
        ...RETAINED_COURT_BATCH,
        ...RETAINED_NOTICE_BATCH,
      ])
    );
    expect(redirects).toEqual(
      expect.arrayContaining([...COURT_REDIRECT_CANDIDATES, ...NOTICE_REDIRECT_CANDIDATES])
    );
    expect(getTopInternalLinkRecipients(20).length).toBeGreaterThan(0);
  });
});
