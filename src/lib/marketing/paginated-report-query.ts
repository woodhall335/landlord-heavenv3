export interface ReportPage<T, TError> {
  data: T[] | null;
  error: TError | null;
}

const DEFAULT_PAGE_SIZE = 1000;

/**
 * Supabase projects commonly cap a select response at 1,000 rows. Growth
 * reports must page through the complete date range or the earliest funnel
 * stages disappear first and conversion rates become misleading.
 */
export async function collectAllReportRows<T, TError>(
  fetchPage: (from: number, to: number) => PromiseLike<ReportPage<T, TError>>,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<ReportPage<T, TError>> {
  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error('Report page size must be a positive integer.');
  }

  const rows: T[] = [];

  for (let from = 0; ; from += pageSize) {
    const page = await fetchPage(from, from + pageSize - 1);

    if (page.error) {
      return { data: null, error: page.error };
    }

    const pageRows = page.data || [];
    rows.push(...pageRows);

    if (pageRows.length < pageSize) {
      return { data: rows, error: null };
    }
  }
}
