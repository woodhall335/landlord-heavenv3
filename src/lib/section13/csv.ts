import { maybeNormalizeUkPostcode, getDomainFromUrl } from './postcode';
import { buildComparableFromPartial } from './server';
import type { Section13Comparable } from './types';

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normaliseHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

export function parseSection13Csv(csvText: string): Section13Comparable[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map(normaliseHeader);

  return lines.slice(1).map((line, index) => {
    const cells = splitCsvLine(line);
    const row = headers.reduce<Record<string, string>>((acc, header, cellIndex) => {
      acc[header] = cells[cellIndex] || '';
      return acc;
    }, {});

    const sourceUrl = row.source_url || row.listing_url || row.url || '';
    const rawRentValue = Number(
      (row.rent_pcm || row.rent || row.price || '')
        .replace(/[^\d.]/g, '')
    );
    const postcodeRaw = row.postcode || row.search_postcode || '';

    return buildComparableFromPartial(
      {
        source: sourceUrl ? 'csv_import' : 'manual_unlinked',
        sourceUrl: sourceUrl || null,
        sourceDomain: getDomainFromUrl(sourceUrl || undefined),
        sourceDateKind: row.date_listed || row.published_date ? 'published' : 'unknown',
        sourceDateValue: row.date_listed || row.published_date || null,
        addressSnippet: row.address || row.address_snippet || `Imported comparable ${index + 1}`,
        propertyType: row.property_type || row.type || null,
        postcodeRaw: postcodeRaw || null,
        postcodeNormalized: maybeNormalizeUkPostcode(postcodeRaw) || null,
        bedrooms: row.bedrooms ? Number(row.bedrooms) : null,
        rawRentValue,
        rawRentFrequency: 'pcm',
        distanceMiles: row.distance_miles ? Number(row.distance_miles) : null,
        isManual: false,
        adjustments: [],
      },
      index
    );
  }).filter((item) => item.rawRentValue > 0);
}

