import { describe, expect, it, vi } from 'vitest';
import { collectAllReportRows } from '../paginated-report-query';

describe('collectAllReportRows', () => {
  it('collects every page when the first response reaches the Supabase row cap', async () => {
    const rows = Array.from({ length: 2_150 }, (_, id) => ({ id }));
    const fetchPage = vi.fn(async (from: number, to: number) => ({
      data: rows.slice(from, to + 1),
      error: null,
    }));

    const result = await collectAllReportRows(fetchPage, 1_000);

    expect(result).toEqual({ data: rows, error: null });
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 999);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 1_000, 1_999);
    expect(fetchPage).toHaveBeenNthCalledWith(3, 2_000, 2_999);
  });

  it('returns the query error without presenting a partial report as complete', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }], error: null })
      .mockResolvedValueOnce({ data: null, error: { message: 'query failed' } });

    const result = await collectAllReportRows(fetchPage, 2);

    expect(result).toEqual({ data: null, error: { message: 'query failed' } });
  });

  it('rejects an invalid page size', async () => {
    await expect(collectAllReportRows(async () => ({ data: [], error: null }), 0)).rejects.toThrow(
      'Report page size must be a positive integer.'
    );
  });
});
