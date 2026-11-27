export interface WizardStartCount { day: string; case_type: string; product_type: string; starts: number | string }

export function buildWizardStartTrend(rows: WizardStartCount[], trackingStartedAt: string, now = new Date()) {
  const end = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const offset = (days: number) => { const date = new Date(`${end}T12:00:00Z`); date.setUTCDate(date.getUTCDate() - days); return date.toISOString().slice(0, 10); };
  const latestStart = offset(14);
  const previousStart = offset(28);
  const trackingDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(trackingStartedAt));
  const grouped = new Map<string, { product: string; caseType: string; latest: number; previous: number }>();
  for (const row of rows) {
    if (row.day < previousStart || row.day >= end) continue;
    const key = `${row.case_type}/${row.product_type}`;
    const value = grouped.get(key) || { product: row.product_type, caseType: row.case_type, latest: 0, previous: 0 };
    value[row.day >= latestStart ? 'latest' : 'previous'] += Number(row.starts) || 0;
    grouped.set(key, value);
  }
  return {
    latestStart, previousStart, end, trackingStartedAt,
    latestComplete: latestStart > trackingDate,
    previousComplete: previousStart > trackingDate,
    products: [...grouped.values()].sort((a, b) => b.latest - a.latest || a.product.localeCompare(b.product)),
  };
}
