export type PreviewLockState = 'clear' | 'partial' | 'locked';

export interface PreviewLockPolicyInput {
  isPaid: boolean;
  pageCount: number;
  pageNumber: number;
}

export interface PreviewLockSummary {
  isPaid: boolean;
  mode: 'smart-hybrid';
  readablePages: number;
}

export function getReadablePreviewPages(pageCount: number, isPaid: boolean): number {
  const safePageCount = Math.max(0, Math.floor(pageCount));

  if (isPaid) {
    return safePageCount;
  }

  if (safePageCount <= 0) {
    return 0;
  }

  if (safePageCount === 1) {
    return 0.5;
  }

  if (safePageCount === 2) {
    return 1;
  }

  return 2;
}

export function getPreviewLockState({
  isPaid,
  pageCount,
  pageNumber,
}: PreviewLockPolicyInput): PreviewLockState {
  const safePageCount = Math.max(0, Math.floor(pageCount));
  const safePageNumber = Math.max(1, Math.floor(pageNumber));

  if (isPaid) {
    return 'clear';
  }

  if (safePageCount <= 1) {
    return safePageNumber === 1 ? 'partial' : 'locked';
  }

  if (safePageCount === 2) {
    return safePageNumber === 1 ? 'clear' : 'locked';
  }

  return safePageNumber <= 2 ? 'clear' : 'locked';
}

export function buildPreviewLockSummary(pageCount: number, isPaid: boolean): PreviewLockSummary {
  return {
    isPaid,
    mode: 'smart-hybrid',
    readablePages: getReadablePreviewPages(pageCount, isPaid),
  };
}
