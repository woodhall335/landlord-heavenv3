/**
 * Evidence Index & Timeline Generator
 *
 * Formats evidence and timeline from case-intel for bundle inclusion.
 *
 * CRITICAL: No legal rules here - purely formatting.
 */

import type { EvidenceAnalysis, TimelineEvent } from '@/lib/case-intel';
import type {
  EvidenceIndex,
  EvidenceIndexItem,
  BundleTimeline,
  TimelineEntry,
} from './types';

/**
 * Generate evidence index from case-intel evidence analysis
 */
export function generateEvidenceIndex(
  evidenceAnalysis: EvidenceAnalysis,
  tabPrefix: string = 'E'
): EvidenceIndex {
  const byCategory: { [category: string]: EvidenceIndexItem[] } = {};
  const byGround: { [ground: string]: EvidenceIndexItem[] } = {};
  const chronological: EvidenceIndexItem[] = [];

  let itemNumber = 1;
  let currentPage = 1; // Will be updated when assembling bundle

  // Process all evidence items by category
  for (const [category, items] of Object.entries(evidenceAnalysis.summary)) {
    if (items.length === 0) continue;

    byCategory[category] = [];

    for (const item of items) {
      const indexItem: EvidenceIndexItem = {
        id: item.id,
        item_number: `${tabPrefix}${itemNumber}`,
        description: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
        category,
        date: item.dates?.[0],
        tab: tabPrefix,
        page: currentPage,
        quality: item.quality,
      };

      byCategory[category].push(indexItem);
      chronological.push(indexItem);

      // Link to grounds
      for (const [ground, evidenceIds] of Object.entries(evidenceAnalysis.ground_links)) {
        if (evidenceIds.includes(item.id)) {
          if (!indexItem.grounds) indexItem.grounds = [];
          indexItem.grounds.push(ground);

          if (!byGround[ground]) byGround[ground] = [];
          byGround[ground].push(indexItem);
        }
      }

      itemNumber++;
      currentPage += 1; // Estimate 1 page per item (will be refined in bundle assembly)
    }
  }

  // Sort chronological by date
  chronological.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return a.date.localeCompare(b.date);
  });

  return {
    title: 'Evidence Index',
    by_category: byCategory,
    by_ground: byGround,
    chronological,
    total_count: chronological.length,
  };
}

/**
 * Generate timeline from case-intel extracted timeline
 */
export function generateBundleTimeline(
  extractedTimeline: TimelineEvent[],
  jurisdiction: string
): BundleTimeline {
  const events: TimelineEntry[] = extractedTimeline.map((event) => ({
    date: event.date,
    description: event.description,
    category: mapEventCategory(event.category),
    source: event.source,
  }));

  // Sort chronologically
  events.sort((a, b) => a.date.localeCompare(b.date));

  // Determine date range
  const dates = events.map((e) => e.date).filter(Boolean);
  const dateRange = {
    start: dates.length > 0 ? dates[0] : 'unknown',
    end: dates.length > 0 ? dates[dates.length - 1] : 'unknown',
  };

  return {
    title: getTimelineTitle(jurisdiction),
    events,
    date_range: dateRange,
  };
}

/**
 * Map event category to standardized timeline category
 */
function mapEventCategory(category: string): TimelineEntry['category'] {
  const cat = category.toLowerCase();

  if (cat.includes('arrear')) return 'arrears';
  if (cat.includes('asb') || cat.includes('antisocial')) return 'asb';
  if (cat.includes('breach')) return 'breach';
  if (cat.includes('compliance') || cat.includes('deposit') || cat.includes('gas'))
    return 'compliance';
  if (
    cat.includes('procedural') ||
    cat.includes('notice') ||
    cat.includes('service') ||
    cat.includes('tenancy')
  )
    return 'procedural';

  return 'other';
}

/**
 * Get jurisdiction-appropriate timeline title
 */
function getTimelineTitle(jurisdiction: string): string {
  switch (jurisdiction.toLowerCase()) {
    case 'england-wales':
    case 'england':
    case 'wales':
      return 'Chronology of Events';

    case 'scotland':
      return 'Timeline of Events';

    case 'northern-ireland':
      return 'Chronology of Events';

    default:
      return 'Timeline';
  }
}

/**
 * Format evidence index as plain text (for PDF rendering)
 */
export function formatEvidenceIndexAsText(index: EvidenceIndex): string {
  let text = `${index.title}\n`;
  text += '='.repeat(index.title.length) + '\n\n';

  text += `Total Evidence Items: ${index.total_count}\n\n`;

  // By category
  text += 'BY CATEGORY\n';
  text += '-----------\n\n';

  for (const [category, items] of Object.entries(index.by_category)) {
    if (items.length === 0) continue;

    text += `${category.toUpperCase()} (${items.length} items)\n`;
    for (const item of items) {
      text += `  ${item.item_number}. ${item.description}`;
      if (item.date) text += ` [${item.date}]`;
      text += `\n`;
    }
    text += '\n';
  }

  // By ground (if applicable)
  if (Object.keys(index.by_ground).length > 0) {
    text += '\nBY GROUND\n';
    text += '---------\n\n';

    for (const [ground, items] of Object.entries(index.by_ground)) {
      text += `Ground ${ground} (${items.length} items)\n`;
      for (const item of items) {
        text += `  ${item.item_number}. ${item.description}\n`;
      }
      text += '\n';
    }
  }

  return text;
}

/**
 * Format timeline as plain text (for PDF rendering)
 */
export function formatTimelineAsText(timeline: BundleTimeline): string {
  let text = `${timeline.title}\n`;
  text += '='.repeat(timeline.title.length) + '\n\n';

  text += `Period: ${timeline.date_range.start} to ${timeline.date_range.end}\n\n`;

  // Group by category
  const byCategory: { [cat: string]: TimelineEntry[] } = {};
  for (const event of timeline.events) {
    if (!byCategory[event.category]) byCategory[event.category] = [];
    byCategory[event.category].push(event);
  }

  // Output chronologically with category markers
  let currentCategory = '';

  for (const event of timeline.events) {
    if (event.category !== currentCategory) {
      currentCategory = event.category;
      text += `\n[${currentCategory.toUpperCase()}]\n`;
    }

    text += `${event.date} - ${event.description}`;
    if (event.source) text += ` (Source: ${event.source})`;
    text += '\n';
  }

  return text;
}

/**
 * Generate evidence summary for cover page or case summary
 */
export function generateEvidenceSummary(evidenceAnalysis: EvidenceAnalysis): string {
  const summary: string[] = [];

  // Count by category
  const categoryCounts = Object.entries(evidenceAnalysis.summary).map(([cat, items]) => ({
    category: cat,
    count: items.length,
  }));

  const totalItems = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  summary.push(`Total Evidence Items: ${totalItems}`);

  if (totalItems > 0) {
    summary.push('\nBreakdown:');
    for (const { category, count } of categoryCounts) {
      if (count > 0) {
        summary.push(`  - ${category}: ${count} item(s)`);
      }
    }
  }

  // Completeness
  summary.push(`\nEvidence Completeness: ${evidenceAnalysis.completeness_score}%`);

  // Missing critical evidence
  const criticalMissing = evidenceAnalysis.missing_evidence.filter(
    (m) => m.priority === 'critical'
  );
  if (criticalMissing.length > 0) {
    summary.push(`\nCritical Evidence Missing: ${criticalMissing.length} item(s)`);
    for (const missing of criticalMissing.slice(0, 3)) {
      summary.push(`  - ${missing.item}`);
    }
  }

  return summary.join('\n');
}
