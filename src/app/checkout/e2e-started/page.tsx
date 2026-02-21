export default async function E2EStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; caseId?: string; jurisdiction?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const product = resolvedSearchParams.product ?? 'unknown';
  const caseId = resolvedSearchParams.caseId ?? 'unknown';
  const jurisdiction = resolvedSearchParams.jurisdiction ?? 'unknown';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Checkout started (E2E)</h1>
        <p className="mt-2 text-gray-600">Deterministic checkout start route for funnel auditing.</p>
        <dl className="mt-6 space-y-2 text-sm">
          <div>
            <dt className="font-semibold text-gray-800">product</dt>
            <dd className="text-gray-700 break-all">{product}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-800">caseId</dt>
            <dd className="text-gray-700 break-all">{caseId}</dd>
          </div>
          <div>
            <dt className="font-semibold text-gray-800">jurisdiction</dt>
            <dd className="text-gray-700 break-all">{jurisdiction}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
