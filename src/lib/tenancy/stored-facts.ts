type FactRecord = Record<string, any>;

type StoredTenancyFactContainers = {
  collected_facts?: unknown;
  wizard_facts?: unknown;
  facts?: unknown;
  case_facts?: unknown;
};

function isNonEmptyFactRecord(value: unknown): value is FactRecord {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as Record<string, unknown>).length > 0
  );
}

export function resolveStoredTenancyFacts(
  row: StoredTenancyFactContainers | null | undefined
): FactRecord {
  if (!row) return {};

  return [
    row.collected_facts,
    row.wizard_facts,
    row.facts,
    row.case_facts,
  ].find(isNonEmptyFactRecord) || {};
}
