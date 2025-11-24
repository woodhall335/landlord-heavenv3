import type { CaseFacts } from './schema';

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return [...value] as T;
  }

  if (value && typeof value === 'object') {
    return { ...(value as Record<string, unknown>) } as T;
  }

  return value;
}

export function setFactPath(
  facts: CaseFacts,
  path: string,
  value: unknown
): CaseFacts {
  const segments = path.split('.').filter(Boolean);
  if (segments.length === 0) return facts;

  const updated: any = cloneValue(facts);
  let cursor: any = updated;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const key: string | number = Number.isInteger(Number(segment)) ? Number(segment) : segment;
    const existing = cursor[key as keyof typeof cursor];

    if (isLast) {
      cursor[key] = value;
      return;
    }

    const nextValue = existing !== undefined ? existing : {};
    const clonedNext = cloneValue(nextValue) ?? {};
    cursor[key] = clonedNext;
    cursor = clonedNext;
  });

  return updated as CaseFacts;
}

export function applyMappedAnswers(
  facts: CaseFacts,
  mapsTo: string[] | undefined,
  value: unknown
): CaseFacts {
  if (!mapsTo || mapsTo.length === 0) {
    return facts;
  }

  return mapsTo.reduce((currentFacts, path) => {
    const key = path.split('.').pop();
    let valueForPath = value as any;

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      key &&
      Object.prototype.hasOwnProperty.call(value as object, key)
    ) {
      valueForPath = (value as Record<string, unknown>)[key];
    }

    return setFactPath(currentFacts, path, valueForPath);
  }, facts);
}
