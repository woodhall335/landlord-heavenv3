export type BundleIndexManifestRow = {
  indexedItem: string;
  existsInZip: boolean;
  status: 'PASS' | 'FAIL';
};

export type BundleIndexManifestReconciliation = {
  ok: boolean;
  rows: BundleIndexManifestRow[];
  missingIndexedItems: string[];
  unindexedTopLevelItems: string[];
  actualTopLevelItems: string[];
  indexedItems: string[];
};

const DEFAULT_EXCLUDED_TOP_LEVEL_ITEMS = new Set(['__MACOSX']);

export function normalizeBundleManifestPath(value: string): string {
  return value
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .trim();
}

export function extractBundleIndexItems(indexText: string): string[] {
  const items = new Set<string>();

  for (const rawLine of indexText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const colonMatch = line.match(/^((?:\d{2}_[A-Z0-9_]+|audit-[a-z0-9-]+)(?:[\\/][^:]+)?):/i);
    if (colonMatch?.[1]) {
      items.add(normalizeBundleManifestPath(colonMatch[1]));
      continue;
    }

    const standaloneMatch = line.match(/^((?:\d{2}_[A-Z0-9_]+|audit-[a-z0-9-]+)(?:[\\/]\S+)?)$/i);
    if (standaloneMatch?.[1]) {
      items.add(normalizeBundleManifestPath(standaloneMatch[1]));
      continue;
    }

    const tableMatch = line.match(/^((?:\d{2}_[A-Z0-9_]+|audit-[a-z0-9-]+)(?:[\\/]\S+)?)\s+(?:Yes|No|Removed)\s+(?:PASS|FAIL)$/i);
    if (tableMatch?.[1] && !/\sRemoved\s/i.test(line)) {
      items.add(normalizeBundleManifestPath(tableMatch[1]));
    }
  }

  return [...items];
}

export function reconcileBundleIndexWithZipManifest(
  indexedItems: string[],
  zipEntries: string[],
  intentionallyExcludedTopLevelItems: string[] = [],
): BundleIndexManifestReconciliation {
  const actualEntries = new Set<string>();
  const actualTopLevelItems = new Set<string>();

  for (const entry of zipEntries) {
    const normalized = normalizeBundleManifestPath(entry);
    if (!normalized) continue;
    actualEntries.add(normalized);
    const [topLevel] = normalized.split('/');
    if (topLevel) {
      actualTopLevelItems.add(topLevel);
    }
  }

  const indexed = [...new Set(indexedItems.map(normalizeBundleManifestPath).filter(Boolean))];
  const indexedTopLevelItems = new Set(indexed.map((item) => item.split('/')[0]).filter(Boolean));

  const rows = indexed.map((indexedItem) => {
    const existsInZip =
      actualEntries.has(indexedItem) ||
      actualTopLevelItems.has(indexedItem) ||
      [...actualEntries].some((entry) => entry.startsWith(`${indexedItem}/`));

    return {
      indexedItem,
      existsInZip,
      status: existsInZip ? 'PASS' : 'FAIL',
    } satisfies BundleIndexManifestRow;
  });

  const missingIndexedItems = rows.filter((row) => !row.existsInZip).map((row) => row.indexedItem);
  const excluded = new Set([...DEFAULT_EXCLUDED_TOP_LEVEL_ITEMS, ...intentionallyExcludedTopLevelItems]);
  const unindexedTopLevelItems = [...actualTopLevelItems]
    .filter((item) => !excluded.has(item))
    .filter((item) => !indexedTopLevelItems.has(item))
    .sort();

  return {
    ok: missingIndexedItems.length === 0 && unindexedTopLevelItems.length === 0,
    rows,
    missingIndexedItems,
    unindexedTopLevelItems,
    actualTopLevelItems: [...actualTopLevelItems].sort(),
    indexedItems: indexed,
  };
}
