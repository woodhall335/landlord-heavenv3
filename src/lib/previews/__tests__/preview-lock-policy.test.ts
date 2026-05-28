import { describe, expect, it } from 'vitest';

import { getPreviewLockState, getReadablePreviewPages } from '../preview-lock-policy';

describe('preview lock policy', () => {
  it('partially locks a one-page unpaid document', () => {
    expect(getPreviewLockState({ isPaid: false, pageCount: 1, pageNumber: 1 })).toBe('partial');
    expect(getReadablePreviewPages(1, false)).toBe(0.5);
  });

  it('shows only page one for a two-page unpaid document', () => {
    expect(getPreviewLockState({ isPaid: false, pageCount: 2, pageNumber: 1 })).toBe('clear');
    expect(getPreviewLockState({ isPaid: false, pageCount: 2, pageNumber: 2 })).toBe('locked');
    expect(getReadablePreviewPages(2, false)).toBe(1);
  });

  it('shows only the first two pages for longer unpaid documents', () => {
    expect(getPreviewLockState({ isPaid: false, pageCount: 3, pageNumber: 1 })).toBe('clear');
    expect(getPreviewLockState({ isPaid: false, pageCount: 3, pageNumber: 2 })).toBe('clear');
    expect(getPreviewLockState({ isPaid: false, pageCount: 3, pageNumber: 3 })).toBe('locked');
    expect(getPreviewLockState({ isPaid: false, pageCount: 8, pageNumber: 4 })).toBe('locked');
    expect(getReadablePreviewPages(8, false)).toBe(2);
  });

  it('clears every page after payment', () => {
    expect(getPreviewLockState({ isPaid: true, pageCount: 1, pageNumber: 1 })).toBe('clear');
    expect(getPreviewLockState({ isPaid: true, pageCount: 4, pageNumber: 4 })).toBe('clear');
    expect(getReadablePreviewPages(4, true)).toBe(4);
  });
});
