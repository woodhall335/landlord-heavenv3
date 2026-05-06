'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { RiArrowLeftLine, RiBarChart2Line, RiRefreshLine } from 'react-icons/ri';

import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import type { GrowthMetricGroup, GrowthRateMetric, GrowthReportResponse } from '@/lib/marketing/growth-report';

const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Number(value || 0));
}

function formatPercent(value: number | null) {
  return value === null ? 'n/a' : `${Number(value || 0).toFixed(1)}%`;
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <Card padding="medium" className="rounded-lg">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-charcoal">{value}</p>
      {note ? <p className="mt-1 text-xs text-gray-500">{note}</p> : null}
    </Card>
  );
}

function GroupTable({
  title,
  groups,
  emptyLabel,
}: {
  title: string;
  groups: GrowthMetricGroup[];
  emptyLabel: string;
}) {
  return (
    <Card padding="medium" className="rounded-lg">
      <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Revenue</th>
              <th className="py-2 pr-4">Orders</th>
              <th className="py-2 pr-4">AOV</th>
            </tr>
          </thead>
          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td className="py-4 text-gray-500" colSpan={4}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr key={group.key} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-charcoal">{group.label}</td>
                  <td className="py-3 pr-4 text-gray-700">{formatCurrency(group.revenue)}</td>
                  <td className="py-3 pr-4 text-gray-700">{group.orders}</td>
                  <td className="py-3 pr-4 text-gray-700">{formatCurrency(group.aov)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RateTable({
  title,
  rows,
  emptyLabel,
}: {
  title: string;
  rows: GrowthRateMetric[];
  emptyLabel: string;
}) {
  return (
    <Card padding="medium" className="rounded-lg">
      <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="py-2 pr-4">Segment</th>
              <th className="py-2 pr-4">Rate</th>
              <th className="py-2 pr-4">Numerator</th>
              <th className="py-2 pr-4">Denominator</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="py-4 text-gray-500" colSpan={4}>
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-charcoal">{row.label}</td>
                  <td className="py-3 pr-4 text-gray-700">{formatPercent(row.rate)}</td>
                  <td className="py-3 pr-4 text-gray-700">{row.numerator}</td>
                  <td className="py-3 pr-4 text-gray-700">{row.denominator}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AdminGrowthPage() {
  const [days, setDays] = useState<7 | 30>(7);
  const [report, setReport] = useState<GrowthReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async (nextDays = days) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/growth?days=${nextDays}`, {
        credentials: 'same-origin',
      });

      if (!response.ok) {
        setError(response.status === 403 ? 'Admin access required' : 'Failed to load growth report');
        setReport(null);
        return;
      }

      const data = (await response.json()) as GrowthReportResponse;
      setReport(data);
    } catch {
      setError('Failed to load growth report');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReport(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const summaryCards = useMemo(() => {
    if (!report) return [];

    return [
      {
        label: `${report.days}-day revenue`,
        value: formatCurrency(report.summary.revenue),
        note: `${report.summary.orders} paid orders`,
      },
      {
        label: 'AOV',
        value: formatCurrency(report.summary.aov),
        note: 'Average paid order value',
      },
      {
        label: 'Rolling 7-day revenue',
        value: formatCurrency(report.summary.rolling7DayRevenue),
        note: `Gap: ${formatCurrency(report.summary.rolling7DayGap)}`,
      },
      {
        label: 'Target',
        value: formatCurrency(report.target.dailyRevenue),
        note: `${formatCurrency(report.target.rolling7DayRevenue)} over 7 days`,
      },
    ];
  }, [report]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white">
        <Container size="large" className="py-8">
          <Link href="/dashboard/admin" className="mb-4 inline-flex items-center gap-2 text-white/90 hover:text-white">
            <RiArrowLeftLine className="h-4 w-4" />
            Back to admin
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold">Growth Report</h1>
              <p className="mt-1 text-white/90">Revenue, attribution, and funnel conversion by marketing path.</p>
            </div>
            <div className="flex gap-2">
              {[7, 30].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDays(option as 7 | 30)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    days === option ? 'bg-white text-[#7C3AED]' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  {option} days
                </button>
              ))}
              <button
                type="button"
                onClick={() => void loadReport(days)}
                className="inline-flex items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/25"
              >
                <RiRefreshLine className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </Container>
      </div>

      <Container size="large" className="py-8">
        {isLoading ? (
          <Card padding="large" className="rounded-lg text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
              <RiBarChart2Line className="h-6 w-6 animate-pulse text-[#7C3AED]" />
            </div>
            <p className="text-gray-600">Loading growth report...</p>
          </Card>
        ) : error ? (
          <Card padding="large" className="rounded-lg text-center">
            <p className="font-semibold text-charcoal">{error}</p>
          </Card>
        ) : report ? (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <MetricCard key={card.label} {...card} />
              ))}
            </div>

            <Card padding="medium" className="rounded-lg">
              <h2 className="text-lg font-semibold text-charcoal">Revenue by day</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Revenue</th>
                      <th className="py-2 pr-4">Orders</th>
                      <th className="py-2 pr-4">AOV</th>
                      <th className="py-2 pr-4">Rolling 7-day</th>
                      <th className="py-2 pr-4">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.revenueByDay.map((day) => (
                      <tr key={day.date} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-4 font-medium text-charcoal">{day.date}</td>
                        <td className="py-3 pr-4 text-gray-700">{formatCurrency(day.revenue)}</td>
                        <td className="py-3 pr-4 text-gray-700">{day.orders}</td>
                        <td className="py-3 pr-4 text-gray-700">{formatCurrency(day.aov)}</td>
                        <td className="py-3 pr-4 text-gray-700">{formatCurrency(day.rolling7DayRevenue)}</td>
                        <td className="py-3 pr-4 text-gray-700">{formatCurrency(day.gapToDailyTarget)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-6 xl:grid-cols-2">
              <GroupTable title="Revenue by product" groups={report.revenueByProduct} emptyLabel="No product revenue yet." />
              <GroupTable title="Revenue by landing path" groups={report.revenueByLandingPath} emptyLabel="No landing attribution yet." />
              <GroupTable title="Revenue by source/medium" groups={report.revenueBySourceMedium} emptyLabel="No source attribution yet." />
              <RateTable title="CTA click rate by page" rows={report.funnelRates.ctaClickRateByPage} emptyLabel="No bridge views or clicks yet." />
              <RateTable title="Tool start rate" rows={report.funnelRates.toolStartRate} emptyLabel="No tool starts yet." />
              <RateTable title="Tool completion rate" rows={report.funnelRates.toolCompletionRate} emptyLabel="No completed tools yet." />
              <RateTable title="Product page conversion rate" rows={report.funnelRates.productPageConversionRate} emptyLabel="No product CTA or checkout starts yet." />
              <RateTable title="Checkout start rate" rows={report.funnelRates.checkoutStartRate} emptyLabel="No bridge-to-checkout data yet." />
            </div>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
