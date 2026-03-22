import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  getCandidateRedirects,
  getExplicitTaxonomyExemptions,
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
const NORMALISED_COMPLIANCE_BATCH = [
  '/eicr-landlord-requirements',
  '/how-to-evict-a-tenant-england',
  '/rent-arrears-letter-template',
  '/scotland-notice-to-leave-template',
  '/tenant-breach-of-tenancy',
  '/tenant-refuses-to-leave-after-notice',
  '/tenant-refusing-inspection',
  '/tenant-subletting-without-permission',
  '/tenant-wont-leave',
] as const;
const RETAINED_COMPLIANCE_BATCH = [
  '/eicr-landlord-requirements',
  '/how-to-evict-a-tenant-england',
  '/rent-arrears-letter-template',
  '/scotland-notice-to-leave-template',
  '/tenant-breach-of-tenancy',
  '/tenant-refuses-to-leave-after-notice',
  '/tenant-subletting-without-permission',
] as const;
const COMPLIANCE_REDIRECT_CANDIDATES = [
  '/tenant-refusing-inspection',
  '/tenant-wont-leave',
] as const;
const FINAL_REDIRECT_DECISIONS = [
  '/section-21-ban',
  '/section-21-checklist',
  '/tenancy-agreements/scotland',
  '/warrant-of-possession',
  '/n5b-form-guide',
] as const;
const QA_TAXONOMY_BATCH = ['/how-to-rent-guide', '/tenancy-agreements'] as const;
const QA_WIZARD_CLEANUP_BATCH = [
  '/how-to-rent-guide',
  '/tenancy-agreements',
  '/tenancy-agreements/scotland',
  '/warrant-of-possession',
  '/n5b-form-guide',
  '/section-21-checklist',
  '/section-21-ban',
] as const;
const FINAL_WIZARD_CLOSEOUT_BATCH = [
  '/eviction-process-scotland',
  '/eviction-process-wales',
  '/ni-private-tenancy-agreement',
  '/ni-tenancy-agreement-template-free',
  '/occupation-contract-template-wales',
  '/private-residential-tenancy-agreement-scotland',
  '/prt-template-scotland',
  '/prt-tenancy-agreement-template-scotland',
  '/scotland-eviction-notices',
  '/scottish-tenancy-agreement-template',
  '/standard-occupation-contract-wales',
  '/tenancy-agreement-northern-ireland',
  '/tenancy-agreement-template-northern-ireland',
  '/tenancy-agreements/northern-ireland',
  '/tenancy-agreements/wales',
  '/wales-eviction-notices',
] as const;
const FINAL_CONTEXTUAL_CLOSEOUT_BATCH = [
  '/court-possession-order-guide',
  '/eviction-court-hearing-guide',
  '/eviction-process-scotland',
  '/eviction-process-wales',
  '/how-to-evict-a-tenant-uk',
  '/rent-arrears-landlord-guide',
  '/scotland-eviction-notices',
  '/tenant-stopped-paying-rent',
  '/wales-eviction-notices',
] as const;
const EXPLICIT_TAXONOMY_EXEMPTIONS = getExplicitTaxonomyExemptions();
const EXPLICIT_TAXONOMY_EXEMPTION_SET = new Set(EXPLICIT_TAXONOMY_EXEMPTIONS);

const EXCLUDED_ROUTE_PREFIXES = [
  '/api',
  '/ask-heaven',
  '/auth',
  '/checkout',
  '/dashboard',
  '/products',
  '/success',
  '/tools',
  '/wizard',
];
const EXCLUDED_ROUTES = new Set(['/', '/about', '/blog', '/contact', '/help', '/pricing']);
const INTENT_SHELL_PATH = path.join(
  process.cwd(),
  'src',
  'components',
  'seo',
  'EvictionIntentLandingPage.tsx'
);
const PILLAR_SHELL_PATH = path.join(process.cwd(), 'src', 'components', 'seo', 'PillarPageShell.tsx');
const ENGLAND_TENANCY_SHELL_PATH = path.join(
  process.cwd(),
  'src',
  'components',
  'seo',
  'EnglandTenancyPage.tsx'
);
const HIGH_INTENT_SHELL_PATH = path.join(
  process.cwd(),
  'src',
  'components',
  'seo',
  'HighIntentPageShell.tsx'
);
const FINAL_HIGH_PRIORITY_CTA_BATCH = [
  '/section-21-court-pack',
  '/section-8-court-pack',
  '/no-fault-eviction',
  '/eviction-pack-england',
  '/form-6a-section-21',
  '/form-3-section-8',
  '/assured-shorthold-tenancy-agreement',
  '/ast-template-england',
  '/ast-tenancy-agreement-template',
  '/periodic-tenancy-agreement',
] as const;
const FINAL_RETAINED_GUIDE_LINK_BATCH = [
  '/accelerated-possession-guide',
  '/bailiff-eviction-process',
  '/eviction-process-england',
  '/section-8-eviction-process',
  '/section-8-grounds-explained',
  '/warrant-of-possession-guide',
  '/how-long-does-eviction-take',
  '/what-happens-after-section-21',
  '/what-happens-after-section-8',
] as const;
const FAQ_DUPLICATE_AFFECTED_ROUTES = [
  '/pricing',
  '/tenancy-agreement-template',
  '/eviction-notice-template',
  '/tools/rent-arrears-calculator',
  '/rent-arrears-letter-template',
  '/how-long-does-eviction-take',
  '/tools/validators/section-21',
] as const;
const FAQ_PUBLIC_ROUTE_PREFIX_EXCLUSIONS = ['/api', '/auth', '/checkout', '/dashboard', '/success', '/wizard'];
const APP_SOURCE_ROOT = path.join(process.cwd(), 'src', 'app');

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

let runtimeRedirectSourceSetPromise: Promise<Set<string>> | null = null;

async function getRuntimeRedirectSourceSet(): Promise<Set<string>> {
  if (!runtimeRedirectSourceSetPromise) {
    runtimeRedirectSourceSetPromise = (async () => {
      const configModule = await import(
        pathToFileURL(path.join(process.cwd(), 'next.config.mjs')).href
      );
      const redirects = await configModule.default.redirects();

      return new Set(
        redirects
          .filter((item: { source?: string; has?: unknown[] }) => typeof item.source === 'string')
          .filter((item: { has?: unknown[] }) => !item.has?.length)
          .map((item: { source?: string }) => item.source as string)
      );
    })();
  }

  return runtimeRedirectSourceSetPromise;
}

async function getRemainingOutsideTaxonomyRoutes(): Promise<string[]> {
  const routes = await getPublicContentRoutes();
  return routes
    .filter((pathname) => !EXPLICIT_TAXONOMY_EXEMPTION_SET.has(pathname))
    .filter((pathname) => !getSeoPageTaxonomy(pathname))
    .sort();
}

async function getRemainingWizardFirstPageFiles(): Promise<string[]> {
  const redirectSources = await getRuntimeRedirectSourceSet();
  const routes = (await getPublicContentRoutes()).filter(
    (pathname) => !redirectSources.has(pathname)
  );
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

async function getRemainingUnresolvedRedirectCandidates(): Promise<string[]> {
  const redirectSources = await getRuntimeRedirectSourceSet();

  return getCandidateRedirects()
    .filter(({ source }) => !redirectSources.has(source))
    .map(({ source }) => source)
    .sort();
}

function hasSharedContextSupport(filePath: string): boolean {
  const source = fs.readFileSync(filePath, 'utf8');

  if (source.includes('SeoPageContextPanel')) {
    return true;
  }

  if (source.includes('PillarPageShell')) {
    const pillarShellSource = fs.readFileSync(PILLAR_SHELL_PATH, 'utf8');
    return pillarShellSource.includes('SeoPageContextPanel');
  }

  if (source.includes('EnglandTenancyPage')) {
    const englandTenancyShellSource = fs.readFileSync(ENGLAND_TENANCY_SHELL_PATH, 'utf8');
    return englandTenancyShellSource.includes('SeoPageContextPanel');
  }

  if (source.includes('HighIntentPageShell')) {
    const highIntentShellSource = fs.readFileSync(HIGH_INTENT_SHELL_PATH, 'utf8');
    return highIntentShellSource.includes('SeoPageContextPanel');
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

function isFaqAuditPublicRoute(pathname: string): boolean {
  return !FAQ_PUBLIC_ROUTE_PREFIX_EXCLUSIONS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function getPageFilesRecursively(dirPath: string): string[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...getPageFilesRecursively(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name === 'page.tsx') {
      files.push(entryPath);
    }
  }

  return files;
}

function getPublicRoutePageFileMap(): Map<string, string> {
  const routeMap = new Map<string, string>();
  const pageFiles = getPageFilesRecursively(APP_SOURCE_ROOT);

  for (const filePath of pageFiles) {
    const relativeDir = path.relative(APP_SOURCE_ROOT, path.dirname(filePath));
    const rawSegments =
      relativeDir === '' || relativeDir === '.'
        ? []
        : relativeDir.split(path.sep).filter(Boolean);

    if (rawSegments.some((segment) => segment.includes('['))) {
      continue;
    }

    const pathname = `/${rawSegments
      .filter((segment) => !segment.startsWith('(') || !segment.endsWith(')'))
      .join('/')}`.replace(/\/+/g, '/');

    routeMap.set(pathname === '/' ? '/' : pathname.replace(/\/$/, ''), filePath);
  }

  return routeMap;
}

function getAncestorLayoutFilesForPageFile(pageFile: string): string[] {
  const layouts: string[] = [];
  let currentDir = path.dirname(pageFile);

  while (currentDir.startsWith(APP_SOURCE_ROOT)) {
    const layoutPath = path.join(currentDir, 'layout.tsx');
    if (fs.existsSync(layoutPath)) {
      layouts.push(layoutPath);
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return layouts.reverse();
}

function countFaqSectionSchemaEmissions(source: string): number {
  const matches = [...source.matchAll(/<FAQSection\b/g)];
  let count = 0;

  for (const match of matches) {
    const start = match.index ?? 0;
    const snippet = source.slice(start, start + 500);
    if (!snippet.includes('includeSchema={false}')) {
      count += 1;
    }
  }

  return count;
}

function countManualFaqPageEmissions(source: string): number {
  const faqPageSchemaCalls = (source.match(/StructuredData\s+data=\{faqPageSchema\(/g) ?? []).length;
  const namedFaqSchemaBlocks = (source.match(/<StructuredData\s+data=\{faqSchema\}/g) ?? []).length;
  const faqSchemaScripts = (source.match(/JSON\.stringify\(faqSchema\)/g) ?? []).length;
  const inlineFaqPageBlocks =
    source.match(/<StructuredData[\s\S]{0,700}?['"]@type['"]\s*:\s*['"]FAQPage['"]/g)?.length ?? 0;

  return faqPageSchemaCalls + namedFaqSchemaBlocks + faqSchemaScripts + inlineFaqPageBlocks;
}

function auditFaqSourceFile(filePath: string): { count: number; reasons: string[] } {
  const source = fs.readFileSync(filePath, 'utf8');
  const reasons: string[] = [];
  const manualCount = countManualFaqPageEmissions(source);
  const faqSectionCount = countFaqSectionSchemaEmissions(source);

  if (manualCount > 0) {
    reasons.push(`${path.relative(process.cwd(), filePath)} manual FAQPage x${manualCount}`);
  }

  if (faqSectionCount > 0) {
    reasons.push(`${path.relative(process.cwd(), filePath)} FAQSection schema x${faqSectionCount}`);
  }

  return {
    count: manualCount + faqSectionCount,
    reasons,
  };
}

function auditFaqEmittersForRoute(
  pathname: string,
  routePageFileMap: Map<string, string>
): { count: number; reasons: string[] } {
  const pageFile = routePageFileMap.get(pathname);
  if (!pageFile) {
    return { count: 0, reasons: [] };
  }

  let count = 0;
  const reasons: string[] = [];
  const pageAudit = auditFaqSourceFile(pageFile);
  count += pageAudit.count;
  reasons.push(...pageAudit.reasons);

  for (const layoutFile of getAncestorLayoutFilesForPageFile(pageFile)) {
    const layoutAudit = auditFaqSourceFile(layoutFile);
    count += layoutAudit.count;
    reasons.push(...layoutAudit.reasons);
  }

  const pageSource = fs.readFileSync(pageFile, 'utf8');
  const sharedComponents: string[] = [];

  if (pageSource.includes('<HighIntentPageShell')) {
    sharedComponents.push(HIGH_INTENT_SHELL_PATH);
  }
  if (pageSource.includes('<EnglandTenancyPage')) {
    sharedComponents.push(ENGLAND_TENANCY_SHELL_PATH);
  }
  if (pageSource.includes('<PillarPageShell')) {
    sharedComponents.push(PILLAR_SHELL_PATH);
  }
  if (pageSource.includes('<EvictionIntentLandingPage')) {
    sharedComponents.push(INTENT_SHELL_PATH);
  }

  for (const componentPath of sharedComponents) {
    const componentAudit = auditFaqSourceFile(componentPath);
    count += componentAudit.count;
    reasons.push(...componentAudit.reasons);
  }

  return { count, reasons };
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

  it('removes the selected compliance batch from the remaining public SEO gap inventories', async () => {
    const outsideTaxonomy = await getRemainingOutsideTaxonomyRoutes();
    const wizardFirstFiles = await getRemainingWizardFirstPageFiles();
    const missingContextSupport = getPagesMissingContextSupport();
    const missingContextualLinks = getPagesMissingContextualLinks();

    expect(outsideTaxonomy).not.toEqual(expect.arrayContaining([...NORMALISED_COMPLIANCE_BATCH]));
    expect(wizardFirstFiles).not.toEqual(
      expect.arrayContaining(NORMALISED_COMPLIANCE_BATCH.map((pathname) => pageFileForPathname(pathname)))
    );
    expect(missingContextSupport).not.toEqual(expect.arrayContaining([...RETAINED_COMPLIANCE_BATCH]));
    expect(missingContextualLinks).not.toEqual(expect.arrayContaining([...RETAINED_COMPLIANCE_BATCH]));
  });

  it('removes the final QA cleanup batch from the remaining public SEO gap inventories', async () => {
    const outsideTaxonomy = await getRemainingOutsideTaxonomyRoutes();
    const wizardFirstFiles = await getRemainingWizardFirstPageFiles();
    const missingContextSupport = getPagesMissingContextSupport();
    const missingContextualLinks = getPagesMissingContextualLinks();

    expect(outsideTaxonomy).not.toEqual(expect.arrayContaining([...QA_TAXONOMY_BATCH]));
    expect(wizardFirstFiles).not.toEqual(
      expect.arrayContaining(QA_WIZARD_CLEANUP_BATCH.map((pathname) => pageFileForPathname(pathname)))
    );
    expect(missingContextSupport).not.toEqual(
      expect.arrayContaining([
        '/eviction-process-uk',
        '/section-21-ban-uk',
        '/section-21-notice',
        '/section-8-notice',
        '/premium-tenancy-agreement',
        '/tenancy-agreement',
      ])
    );
    expect(missingContextualLinks).not.toEqual(
      expect.arrayContaining([
        '/eviction-process-uk',
        '/section-21-ban-uk',
        '/section-21-notice',
        '/section-8-notice',
        '/premium-tenancy-agreement',
        '/tenancy-agreement',
      ])
    );
  });

  it('removes the final high-priority CTA and retained-link batch from the remaining SEO gap inventories', async () => {
    const wizardFirstFiles = await getRemainingWizardFirstPageFiles();
    const missingContextSupport = getPagesMissingContextSupport();
    const missingContextualLinks = getPagesMissingContextualLinks();

    expect(wizardFirstFiles).not.toEqual(
      expect.arrayContaining(
        FINAL_HIGH_PRIORITY_CTA_BATCH.map((pathname) => pageFileForPathname(pathname))
      )
    );
    expect(missingContextSupport).not.toEqual(
      expect.arrayContaining([...FINAL_RETAINED_GUIDE_LINK_BATCH])
    );
    expect(missingContextualLinks).not.toEqual(
      expect.arrayContaining([...FINAL_RETAINED_GUIDE_LINK_BATCH])
    );
  });

  it('keeps redirect, supporting-live, and inbound-link reporting available for the audit pass', () => {
    const redirects = getCandidateRedirects().map(({ source }) => source);

    expect(getCandidateRedirects().length).toBeGreaterThan(0);
    expect(getRetainedSupportingPages()).toEqual(
      expect.arrayContaining([
        ...NORMALISED_TENANCY_BATCH,
        ...RETAINED_COURT_BATCH,
        ...RETAINED_NOTICE_BATCH,
        ...RETAINED_COMPLIANCE_BATCH,
      ])
    );
    expect(redirects).toEqual(
      expect.arrayContaining([
        ...COURT_REDIRECT_CANDIDATES,
        ...NOTICE_REDIRECT_CANDIDATES,
        ...COMPLIANCE_REDIRECT_CANDIDATES,
        ...FINAL_REDIRECT_DECISIONS,
      ])
    );
    expect(getTopInternalLinkRecipients(20).length).toBeGreaterThan(0);
  });

  it('tracks explicit taxonomy exemptions separately from the remaining-gap inventory', async () => {
    const outsideTaxonomy = await getRemainingOutsideTaxonomyRoutes();

    expect(outsideTaxonomy).not.toEqual(expect.arrayContaining([...EXPLICIT_TAXONOMY_EXEMPTIONS]));
    expect(EXPLICIT_TAXONOMY_EXEMPTIONS).toEqual(
      expect.arrayContaining([
        '/cookies',
        '/landlord-documents-england',
        '/lodger-agreement-template',
        '/privacy',
        '/refunds',
        '/tenancy-agreements/england-wales',
        '/terms',
      ])
    );
  });

  it('reports only unresolved redirect candidates after runtime redirect decisions are applied', async () => {
    const unresolvedRedirects = await getRemainingUnresolvedRedirectCandidates();

    expect(unresolvedRedirects).not.toEqual(
      expect.arrayContaining([
        '/complete-eviction-pack-england',
        '/court-bailiff-eviction-guide',
        '/eviction-pack-england',
        '/n5b-possession-claim-form',
        '/ni-tenancy-agreement-template-free',
        '/section-21-notice-generator',
        '/section-8-notice-generator',
        '/tenant-refusing-inspection',
        '/tenant-wont-leave',
      ])
    );
    expect(unresolvedRedirects).toEqual(
      expect.arrayContaining([
        '/eviction-timeline-uk',
        '/form-3-section-8',
        '/form-6a-section-21',
        '/no-fault-eviction',
        '/periodic-tenancy-agreement',
        '/section-21-court-pack',
        '/section-8-court-pack',
        '/section-8-rent-arrears-eviction',
      ])
    );
  });

  it('removes the final closeout batch from the remaining wizard-first and contextual-link inventories', async () => {
    const wizardFirstFiles = await getRemainingWizardFirstPageFiles();
    const missingContextualLinks = getPagesMissingContextualLinks();

    expect(wizardFirstFiles).not.toEqual(
      expect.arrayContaining(FINAL_WIZARD_CLOSEOUT_BATCH.map((pathname) => pageFileForPathname(pathname)))
    );
    expect(missingContextualLinks).not.toEqual(
      expect.arrayContaining([...FINAL_CONTEXTUAL_CLOSEOUT_BATCH])
    );
  });

  it('keeps every public route to at most one FAQPage schema emission path', () => {
    const routePageFileMap = getPublicRoutePageFileMap();
    const routes = [...routePageFileMap.keys()].filter(isFaqAuditPublicRoute).sort();
    const duplicates = routes
      .map((pathname) => ({
        pathname,
        ...auditFaqEmittersForRoute(pathname, routePageFileMap),
      }))
      .filter(({ count }) => count > 1)
      .map(({ pathname, reasons }) => `${pathname}: ${reasons.join(' | ')}`);

    expect(routes).toEqual(expect.arrayContaining([...FAQ_DUPLICATE_AFFECTED_ROUTES]));
    expect(duplicates).toEqual([]);

    for (const pathname of FAQ_DUPLICATE_AFFECTED_ROUTES) {
      expect(auditFaqEmittersForRoute(pathname, routePageFileMap).count).toBe(1);
    }
  });
});
