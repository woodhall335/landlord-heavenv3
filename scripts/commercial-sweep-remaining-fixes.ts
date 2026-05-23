import path from 'node:path';
import { promises as fs } from 'node:fs';

import { ensureDir } from './_auditPaths';
import {
  buildSeoOpportunityAudit,
  type SeoOpportunityAuditItem,
} from '@/lib/seo/opportunity-audit';

const OUT_DIR = path.join(process.cwd(), 'audit-output', 'commercial-sweep', 'latest');

type CompactItem = {
  url: string;
  destination: string;
  issues: string[];
};

function allIssues(item: SeoOpportunityAuditItem): string[] {
  return [...item.issues, ...item.cannibalisationWarnings];
}

function issueText(item: SeoOpportunityAuditItem): string {
  return allIssues(item).join(' | ');
}

function includesIssue(item: SeoOpportunityAuditItem, phrase: string): boolean {
  return issueText(item).toLowerCase().includes(phrase.toLowerCase());
}

function hasCopyGap(item: SeoOpportunityAuditItem): boolean {
  return (
    item.suggestedVisibleCopy.length > 0 ||
    item.suggestedInternalLinks.length > 0 ||
    item.missingOrWeakKeywords.length > 0
  );
}

function destination(item: SeoOpportunityAuditItem): string {
  return item.primaryCommercialDestination ?? (item.expectedProductLinks.join(', ') || 'None configured');
}

function compact(item: SeoOpportunityAuditItem): CompactItem {
  return {
    url: item.pageUrl,
    destination: destination(item),
    issues: allIssues(item),
  };
}

function table(rows: Array<Record<string, string>>, columns: string[]): string {
  if (!rows.length) return 'None.';

  return [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => '---').join(' | ')} |`,
    ...rows.map((row) =>
      `| ${columns
        .map((column) => String(row[column] ?? '').replace(/\|/g, '\\|'))
        .join(' | ')} |`
    ),
  ].join('\n');
}

function renderMarkdown(input: {
  generatedAt: string;
  totalPagesAudited: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  bucketCounts: Record<string, number>;
  moneyClaim: CompactItem[];
  court: CompactItem[];
  tenancy: CompactItem[];
  copy: Array<{
    url: string;
    cluster: string;
    destination: string;
    next: string;
  }>;
}): string {
  return [
    '# Remaining Commercial Sweep Fixes',
    '',
    `Generated: ${input.generatedAt}`,
    '',
    '## Summary',
    '',
    `- Pages audited: ${input.totalPagesAudited}`,
    `- Priority split: High ${input.highCount}, Medium ${input.mediumCount}, Low ${input.lowCount}`,
    `- Remaining medium pages: ${input.mediumCount}`,
    '',
    '## Fix Buckets',
    '',
    ...Object.entries(input.bucketCounts).map(([label, count]) => `- ${label}: ${count}`),
    '',
    '## Recommended Order',
    '',
    '1. Money claim metadata and cannibalisation cleanup.',
    '2. Court/possession target differentiation.',
    '3. Tenancy metadata and target differentiation.',
    '4. Jurisdiction-safe copy review only.',
    '5. Blog commercial copy polish.',
    '',
    '## Money Claim Batch',
    '',
    table(
      input.moneyClaim.map((item) => ({
        url: item.url,
        destination: item.destination,
        issue: item.issues[0] ?? 'Review metadata and target overlap.',
      })),
      ['url', 'destination', 'issue']
    ),
    '',
    '## Court / Possession Batch',
    '',
    table(
      input.court.map((item) => ({
        url: item.url,
        destination: item.destination,
        issue: item.issues[0] ?? 'Review court-stage target overlap.',
      })),
      ['url', 'destination', 'issue']
    ),
    '',
    '## Tenancy Batch',
    '',
    table(
      input.tenancy.map((item) => ({
        url: item.url,
        destination: item.destination,
        issue: item.issues[0] ?? 'Review agreement intent and metadata.',
      })),
      ['url', 'destination', 'issue']
    ),
    '',
    '## Copy / Internal Link Batch',
    '',
    table(input.copy, ['url', 'cluster', 'destination', 'next']),
    '',
  ].join('\n');
}

async function main() {
  const audit = await buildSeoOpportunityAudit();
  const medium = audit.items.filter((item) => item.priority === 'Medium');

  const buckets = {
    'Metadata length fixes': medium.filter((item) => includesIssue(item, 'Meta description length')),
    'Cannibalisation / target overlap': medium.filter((item) => includesIssue(item, 'Shares target keyword')),
    'Visible copy or internal-link gaps': medium.filter(hasCopyGap),
    'Jurisdiction-safe review only': medium.filter((item) =>
      item.primaryCommercialDestination?.startsWith('Jurisdiction-safe')
    ),
    'Money claim medium pages': medium.filter((item) => item.cluster === 'money-claim'),
    'Section 8 notice/problem medium pages': medium.filter((item) => item.cluster === 'section-8-notice'),
    'Court/possession medium pages': medium.filter((item) => item.cluster === 'section-8-court'),
    'Tenancy medium pages': medium.filter((item) => item.cluster === 'tenancy-agreements'),
    'Blog medium pages': medium.filter((item) => item.cluster === 'blog-posts'),
  };

  const copyBatch = buckets['Visible copy or internal-link gaps'].slice(0, 30).map((item) => ({
    url: item.pageUrl,
    cluster: item.cluster,
    destination: destination(item),
    next: item.suggestedInternalLinks[0]
      ? `${item.suggestedInternalLinks[0].anchor} -> ${item.suggestedInternalLinks[0].href}`
      : item.suggestedVisibleCopy[0] ?? item.missingOrWeakKeywords[0] ?? 'Review copy.',
  }));

  const generatedAt = new Date().toISOString();
  const bucketCounts = Object.fromEntries(
    Object.entries(buckets).map(([label, items]) => [label, items.length])
  );

  const report = {
    generatedAt,
    summary: {
      totalPagesAudited: audit.totalPagesAudited,
      countsByPriority: audit.countsByPriority,
      remainingMedium: medium.length,
      lowWatchlist: audit.countsByPriority.Low,
    },
    bucketCounts,
    moneyClaim: buckets['Money claim medium pages'].slice(0, 20).map(compact),
    court: buckets['Court/possession medium pages'].slice(0, 20).map(compact),
    tenancy: buckets['Tenancy medium pages'].slice(0, 20).map(compact),
    copy: copyBatch,
  };

  await ensureDir(OUT_DIR);
  await Promise.all([
    fs.writeFile(path.join(OUT_DIR, 'remaining_fixes.json'), `${JSON.stringify(report, null, 2)}\n`),
    fs.writeFile(
      path.join(OUT_DIR, 'remaining_fixes.md'),
      renderMarkdown({
        generatedAt,
        totalPagesAudited: audit.totalPagesAudited,
        highCount: audit.countsByPriority.High,
        mediumCount: audit.countsByPriority.Medium,
        lowCount: audit.countsByPriority.Low,
        bucketCounts,
        moneyClaim: report.moneyClaim,
        court: report.court,
        tenancy: report.tenancy,
        copy: report.copy,
      })
    ),
  ]);

  process.stdout.write(
    [
      `Wrote remaining fixes report to ${OUT_DIR}`,
      `Priority split: High ${audit.countsByPriority.High}, Medium ${audit.countsByPriority.Medium}, Low ${audit.countsByPriority.Low}`,
      ...Object.entries(bucketCounts).map(([label, count]) => `${label}: ${count}`),
    ].join('\n') + '\n'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
