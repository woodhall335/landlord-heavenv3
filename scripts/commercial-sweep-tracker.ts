import path from 'node:path';
import { promises as fs } from 'node:fs';

import { ensureDir } from './_auditPaths';
import { buildSeoOpportunityAudit } from '@/lib/seo/opportunity-audit';
import { getCommercialSweepResolutions } from '@/lib/seo/sitewide-sweep';

const OUT_DIR = path.join(process.cwd(), 'audit-output', 'commercial-sweep', 'latest');

const PRIORITY_ORDER = {
  High: 0,
  Medium: 1,
  Low: 2,
} as const;

const ROUTE_STATUS_ORDER = {
  product: 0,
  jurisdiction_safe: 1,
  unresolved: 2,
} as const;

type TrackerRow = {
  url: string;
  priority: 'High' | 'Medium' | 'Low';
  pageType: string;
  cluster: string;
  targetKeyword: string;
  routeStatus: 'product' | 'jurisdiction_safe' | 'unresolved';
  primaryRoute: string;
  secondaryRoute: string;
  jurisdiction: string;
  routingNote: string;
  suggestedCopyCount: number;
  suggestedLinkCount: number;
  issueCount: number;
  nextAction: string;
};

const COMMERCIAL_OWNER_ROUTES = new Set([
  '/standard-tenancy-agreement',
  '/premium-tenancy-agreement',
  '/student-tenancy-agreement',
  '/hmo-shared-house-tenancy-agreement',
  '/lodger-agreement',
]);

function csvEscape(value: unknown): string {
  const text = String(value ?? '');
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function isCommercialHref(href: string): boolean {
  return href.startsWith('/products/') || COMMERCIAL_OWNER_ROUTES.has(href);
}

function inferJurisdiction(pathname: string): string {
  if (pathname.includes('wales')) return 'wales';
  if (pathname.includes('scotland')) return 'scotland';
  if (pathname.includes('northern-ireland')) return 'northern-ireland';
  if (pathname.includes('/uk-')) return 'uk';
  return '';
}

function toCsv(rows: TrackerRow[]): string {
  const headers = [
    'url',
    'priority',
    'pageType',
    'cluster',
    'targetKeyword',
    'routeStatus',
    'primaryRoute',
    'secondaryRoute',
    'jurisdiction',
    'routingNote',
    'suggestedCopyCount',
    'suggestedLinkCount',
    'issueCount',
    'nextAction',
  ] satisfies Array<keyof TrackerRow>;

  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
  ].join('\n');
}

function nextActionFor(row: Omit<TrackerRow, 'nextAction'>): string {
  if (row.routeStatus === 'unresolved') {
    return 'Add commercial routing contract or explicit jurisdiction-safe exemption.';
  }

  if (row.routeStatus === 'jurisdiction_safe') {
    return 'Keep page on jurisdiction-safe guidance; avoid England-only product hard sell.';
  }

  if (row.priority === 'Medium') {
    return 'Review visible CTA copy and internal anchor placement in the next commercial copy batch.';
  }

  return 'Monitor; commercial route is resolved and no high-priority action is flagged.';
}

function renderMarkdown(rows: TrackerRow[], generatedAt: string): string {
  const counts = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc.byPriority[row.priority] += 1;
      acc.byRouteStatus[row.routeStatus] += 1;
      acc.byCluster[row.cluster] = (acc.byCluster[row.cluster] ?? 0) + 1;
      return acc;
    },
    {
      total: 0,
      byPriority: { High: 0, Medium: 0, Low: 0 },
      byRouteStatus: { product: 0, jurisdiction_safe: 0, unresolved: 0 },
      byCluster: {} as Record<string, number>,
    }
  );

  const mediumRows = rows.filter((row) => row.priority === 'Medium').slice(0, 30);
  const jurisdictionRows = rows.filter((row) => row.routeStatus === 'jurisdiction_safe');

  const lines = [
    '# Commercial Sweep Tracker',
    '',
    `Generated: ${generatedAt}`,
    '',
    '## Summary',
    '',
    `- Pages tracked: ${counts.total}`,
    `- Priority split: High ${counts.byPriority.High}, Medium ${counts.byPriority.Medium}, Low ${counts.byPriority.Low}`,
    `- Route status: Product ${counts.byRouteStatus.product}, Jurisdiction-safe ${counts.byRouteStatus.jurisdiction_safe}, Unresolved ${counts.byRouteStatus.unresolved}`,
    `- Cluster split: ${Object.entries(counts.byCluster)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cluster, count]) => `${cluster} ${count}`)
      .join(', ')}`,
    '',
    '## First Medium Batch',
    '',
    '| URL | Cluster | Primary route | Secondary route | Next action |',
    '| --- | --- | --- | --- | --- |',
    ...mediumRows.map((row) =>
      [
        row.url,
        row.cluster,
        row.primaryRoute || 'None',
        row.secondaryRoute || 'None',
        row.nextAction,
      ]
        .map((value) => value.replace(/\|/g, '\\|'))
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |')
    ),
    '',
    '## Jurisdiction-Safe Pages',
    '',
    jurisdictionRows.length
      ? '| URL | Jurisdiction | Safe route | Note |\n| --- | --- | --- | --- |\n' +
        jurisdictionRows
          .map((row) =>
            `| ${row.url} | ${row.jurisdiction} | ${row.primaryRoute} | ${row.routingNote.replace(/\|/g, '\\|')} |`
          )
          .join('\n')
      : 'None.',
    '',
    '## Files',
    '',
    '- `commercial_sweep_tracker.csv` is the page-by-page working sheet.',
    '- `commercial_sweep_tracker.json` keeps the same rows for programmatic follow-up.',
  ];

  return `${lines.join('\n').trim()}\n`;
}

async function main() {
  const [audit, resolutions] = await Promise.all([
    buildSeoOpportunityAudit(),
    getCommercialSweepResolutions(),
  ]);

  const resolutionByPathname = new Map(resolutions.map((resolution) => [resolution.pathname, resolution]));

  const rows = audit.items
    .map((item): TrackerRow => {
      const resolution = resolutionByPathname.get(item.pageUrl);
      const fallbackPrimary = item.primaryCommercialDestination?.replace(/^Jurisdiction-safe:\s*/, '') ?? item.expectedProductLinks[0] ?? '';
      const fallbackSecondary =
        item.expectedProductLinks.find((href) => href !== fallbackPrimary) ?? '';
      const routeStatus = resolution?.kind ?? (fallbackPrimary ? (isCommercialHref(fallbackPrimary) ? 'product' : 'jurisdiction_safe') : 'unresolved');
      const baseRow = {
        url: item.pageUrl,
        priority: item.priority,
        pageType: item.pageType,
        cluster: item.cluster,
        targetKeyword: item.targetKeyword,
        routeStatus,
        primaryRoute: resolution?.primaryHref ?? fallbackPrimary,
        secondaryRoute: resolution?.kind === 'product' ? (resolution.secondaryHref ?? '') : fallbackSecondary,
        jurisdiction:
          resolution?.kind === 'jurisdiction_safe'
            ? resolution.jurisdiction
            : routeStatus === 'jurisdiction_safe'
              ? inferJurisdiction(item.pageUrl)
              : '',
        routingNote:
          resolution?.kind === 'jurisdiction_safe'
            ? resolution.message
            : resolution?.kind === 'product'
              ? resolution.reason
              : fallbackPrimary
                ? 'Resolved from dynamic page SEO config/opportunity audit.'
                : 'No commercial sweep route resolved.',
        suggestedCopyCount: item.suggestedVisibleCopy.length,
        suggestedLinkCount: item.suggestedInternalLinks.length,
        issueCount: item.issues.length + item.cannibalisationWarnings.length,
      };

      return {
        ...baseRow,
        nextAction: nextActionFor(baseRow),
      };
    })
    .sort((a, b) => {
      const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      const routeStatusDiff = ROUTE_STATUS_ORDER[a.routeStatus] - ROUTE_STATUS_ORDER[b.routeStatus];
      if (routeStatusDiff !== 0) return routeStatusDiff;
      return a.url.localeCompare(b.url);
    });

  await ensureDir(OUT_DIR);

  const generatedAt = new Date().toISOString();
  const summary = {
    generatedAt,
    totalPagesTracked: rows.length,
    prioritySplit: audit.countsByPriority,
    unresolvedRoutes: rows.filter((row) => row.routeStatus === 'unresolved').map((row) => row.url),
    jurisdictionSafeRoutes: rows
      .filter((row) => row.routeStatus === 'jurisdiction_safe')
      .map((row) => row.url),
  };

  await Promise.all([
    fs.writeFile(path.join(OUT_DIR, 'commercial_sweep_tracker.csv'), `${toCsv(rows)}\n`),
    fs.writeFile(path.join(OUT_DIR, 'commercial_sweep_tracker.json'), `${JSON.stringify({ summary, rows }, null, 2)}\n`),
    fs.writeFile(path.join(OUT_DIR, 'commercial_sweep_tracker.md'), renderMarkdown(rows, generatedAt)),
  ]);

  process.stdout.write(
    [
      `Wrote commercial sweep tracker to ${OUT_DIR}`,
      `Pages tracked: ${rows.length}`,
      `Priority split: High ${audit.countsByPriority.High}, Medium ${audit.countsByPriority.Medium}, Low ${audit.countsByPriority.Low}`,
      `Unresolved routes: ${summary.unresolvedRoutes.length}`,
      `Jurisdiction-safe routes: ${summary.jurisdictionSafeRoutes.length}`,
    ].join('\n') + '\n'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
