'use client';
import { useEffect, useState } from 'react';
import type { buildWizardStartTrend } from '@/lib/admin/wizard-start-trend';
import { getAdminProductLabel } from '@/lib/admin/products';

type Trend = ReturnType<typeof buildWizardStartTrend>;
export function WizardStartTrend({ caseType = 'all', product = 'all' }: { caseType?: string; product?: string }) {
  const [data, setData] = useState<Trend | null>(null);
  const [message, setMessage] = useState('Loading creation counts…');
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/admin/wizard-starts', { signal: controller.signal }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error('Could not load creation counts.');
      if (!result.available) { setMessage(result.reason); return; }
      setData(result);
    }).catch(error => { if (error.name !== 'AbortError') setMessage('Creation counts are temporarily unavailable.'); });
    return () => controller.abort();
  }, []);
  const products = data?.products.filter(row => (caseType === 'all' || row.caseType === caseType) && (product === 'all' || row.product === product)) || [];
  return <section aria-label="Wizard creation trend" className="mb-6 rounded-xl border border-violet-200 bg-white p-5">
    <h2 className="text-lg font-semibold">Wizard starts by creation date</h2>
    <p className="mt-1 text-sm text-gray-600">Case creations, including anonymous starts, across all payment stages. Cleanup does not reduce these counts. Starts are not unique customers and may include testing.</p>
    {!data ? <p className="mt-3 text-sm text-gray-600" role="status">{message}</p> : <>
      <p className="mt-3 text-sm">Latest 14 complete days: {data.latestStart} to {data.end} (end excluded). Compared with the preceding 14 days.</p>
      {(!data.latestComplete || !data.previousComplete) && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-950">Historical coverage is incomplete. Continuous counting started {new Date(data.trackingStartedAt).toLocaleDateString('en-GB')}; earlier values include only drafts and cases still retained. Deleted starts cannot be recovered. Percentage changes are withheld until both periods have full coverage.</p>}
      <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Product</th><th className="px-3 text-right">Previous 14 days{!data.previousComplete ? ' (partial)' : ''}</th><th className="px-3 text-right">Latest 14 days{!data.latestComplete ? ' (partial)' : ''}</th><th className="pl-3 text-right">Change</th></tr></thead><tbody>{products.map(row => <tr key={`${row.caseType}/${row.product}`} className="border-b border-gray-100"><td className="py-3">{getAdminProductLabel(row.product)}</td><td className="px-3 text-right tabular-nums">{row.previous}</td><td className="px-3 text-right tabular-nums">{row.latest}</td><td className="pl-3 text-right">{data.latestComplete && data.previousComplete && row.previous > 0 ? `${Math.round((row.latest - row.previous) / row.previous * 100)}%` : '—'}</td></tr>)}</tbody></table></div>
      {products.length === 0 && <p className="mt-3 text-sm text-gray-600">No retained creation counts for the selected products in this period.</p>}
    </>}
  </section>;
}
