'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CaseStrengthWidget } from '../components/CaseStrengthWidget';
import { AlertCircle, CheckCircle2, FileText, X, ShieldCheck, Info } from 'lucide-react';

function ReviewPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseId = searchParams.get('case_id');

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!caseId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/wizard/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ case_id: caseId }),
        });

        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis || !caseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6">
          <p className="text-red-600">Failed to load analysis</p>
        </Card>
      </div>
    );
  }

  const hasBlockingIssues = analysis.decision_engine?.blocking_issues?.some(
    (issue: any) => issue.severity === 'blocking'
  );

  const jurisdiction = analysis.jurisdiction;
  const caseType = analysis.case_type ?? 'eviction';
  const product: string = analysis.product || 'complete_pack';

  // New fields from /api/wizard/analyze
  const recommendedRouteLabel: string =
    analysis.recommended_route_label || analysis.recommended_route || 'Recommended route';
  const caseStrengthBand: string = analysis.case_strength_band || 'unknown';
  const isCourtReady: boolean | null =
    typeof analysis.is_court_ready === 'boolean' ? analysis.is_court_ready : null;
  const readinessSummary: string | null = analysis.readiness_summary ?? null;

  const redFlags: string[] = analysis.red_flags || [];
  const complianceIssues: string[] = analysis.compliance_issues || [];
  type PreviewDocument = {
  id: string;
  title?: string;
  document_title?: string;
  type: string;
  jurisdiction: string;
  requiredToFile?: boolean;
};

const previewDocuments: PreviewDocument[] = Array.isArray(analysis.preview_documents)
  ? analysis.preview_documents
  : [];

  // Evidence overview from analysis (booleans: tenancy_agreement_uploaded, etc.)
  const evidence = analysis.evidence_overview || {};

  const handleEdit = () => {
    const params = new URLSearchParams({
      case_id: caseId,
      type: caseType,
      jurisdiction: jurisdiction,
      product,
    });

    router.push(`/wizard/flow?${params.toString()}`);
  };

  const handleProceed = () => {
    router.push(`/wizard/preview/${caseId}`);
  };

  const readinessBadge = (() => {
    if (isCourtReady === true) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ShieldCheck className="h-3 w-3" />
          Court-ready
        </span>
      );
    }
    if (isCourtReady === false) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <AlertCircle className="h-3 w-3" />
          Not court-ready yet
        </span>
      );
    }
    return null;
  })();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Final Case Analysis</h1>
          <p className="text-sm text-gray-600 mt-1">
            We’ve analysed your answers against the current rules for{' '}
            <span className="font-medium">
              {jurisdiction === 'england-wales'
                ? 'England & Wales'
                : jurisdiction === 'scotland'
                ? 'Scotland'
                : jurisdiction}
            </span>
            .
          </p>
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-semibold">Recommended route: </span>
            {recommendedRouteLabel}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {readinessBadge}
          {analysis.case_strength_score != null && (
            <div className="text-right text-sm text-gray-600">
              <div className="font-semibold">Case strength: {analysis.case_strength_score}/100</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">{caseStrengthBand}</div>
            </div>
          )}
        </div>
      </div>

      {/* Readiness summary */}
      {readinessSummary && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-blue-900 mb-1">
                What this means in practice
              </h2>
              <p className="text-sm text-blue-800">{readinessSummary}</p>
              <p className="text-xs text-blue-700 mt-2">
                We will still generate your full pack, including notices, court forms and a
                procedural guide. Use the roadmap and evidence checklist to fix any issues
                before you file at court.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Blocking Issues - still surfaced, but NOT gating payment */}
      {hasBlockingIssues && (
        <Card className="p-6 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <X className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Critical Issues Affecting Court Readiness
              </h2>
              <p className="text-sm text-red-800 mb-3">
                These issues may stop a judge granting possession unless they are fixed. Your
                pack will include a procedural guide explaining how to deal with them.
              </p>
              {analysis.decision_engine.blocking_issues
                .filter((issue: any) => issue.severity === 'blocking')
                .map((issue: any, i: number) => (
                  <div key={i} className="mb-2 p-3 bg-white rounded border border-red-200">
                    <p className="font-medium text-red-900">
                      {issue.route?.toUpperCase?.() || 'ROUTE'}: {issue.description}
                    </p>
                    {issue.action_required && (
                      <p className="text-sm text-red-700 mt-1">
                        Action suggested: {issue.action_required}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Case Strength Widget */}
      {analysis.score_report && <CaseStrengthWidget scoreReport={analysis.score_report} />}

      {/* Legal Assessment: routes & grounds */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Legal Assessment</h2>

        {/* Available Routes */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Available routes:</h3>
          {analysis.decision_engine?.recommended_routes?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.decision_engine.recommended_routes.map((route: string) => (
                <span
                  key={route}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  <CheckCircle2 className="inline h-4 w-4 mr-1" />
                  {route.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-600">No routes currently available.</p>
          )}
        </div>

        {/* Recommended Grounds */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended grounds:</h3>
          {analysis.decision_engine?.recommended_grounds?.length > 0 ? (
            <div className="space-y-2">
              {analysis.decision_engine.recommended_grounds.map((ground: any) => (
                <div key={ground.code} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Ground {ground.code}: {ground.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{ground.description}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ground.type === 'mandatory'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ground.type?.toUpperCase?.() || 'GROUND'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No grounds recommended.</p>
          )}
        </div>
      </Card>

      {/* Things to Fix or Improve */}
      {(redFlags.length > 0 || complianceIssues.length > 0) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Things to Fix or Improve</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {redFlags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-amber-800 mb-2">Red flags</h3>
                <ul className="space-y-1 text-sm text-amber-900">
                  {redFlags.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {complianceIssues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-2">Compliance issues</h3>
                <ul className="space-y-1 text-sm text-red-900">
                  {complianceIssues.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Your eviction pack will include a checklist and roadmap to help you address these
            before or shortly after issuing your claim.
          </p>
        </Card>
      )}

      {/* Evidence & documents checklist */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Evidence &amp; documents checklist</h2>
        <p className="text-sm text-gray-600 mb-3">
          This is a quick snapshot of the key documents courts expect to see. Uploading them
          now makes your pack much stronger and reduces the risk of delays.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            {evidence.tenancy_agreement_uploaded ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Tenancy agreement</p>
              <p className="text-xs text-gray-600">
                {evidence.tenancy_agreement_uploaded
                  ? 'Marked as provided in your case facts.'
                  : 'Not uploaded yet – strongly recommended so the judge can see the contract.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.rent_schedule_uploaded ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Rent / arrears schedule</p>
              <p className="text-xs text-gray-600">
                {evidence.rent_schedule_uploaded
                  ? 'Arrears schedule recorded for the claim.'
                  : 'Not uploaded yet – courts expect a clear chronology of missed payments.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.bank_statements_uploaded ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Bank statements</p>
              <p className="text-xs text-gray-600">
                {evidence.bank_statements_uploaded
                  ? 'Supporting payment history has been flagged.'
                  : 'Not flagged yet – optional, but helpful to prove what was paid or missed.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            {evidence.other_evidence_uploaded ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Other supporting evidence</p>
              <p className="text-xs text-gray-600">
                {evidence.other_evidence_uploaded
                  ? 'You have flagged additional documents (photos, quotes, correspondence, etc.).'
                  : 'Not flagged yet – think about emails, texts, photos or reports that support your case.'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents to be generated */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          <FileText className="inline h-5 w-5 mr-2" />
          Documents that will be generated
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Based on your case details and jurisdiction, the following documents will be prepared
          in your pack:
        </p>
        <ul className="space-y-2">
          {previewDocuments.length > 0 ? (
            previewDocuments.map((doc) => (
              <li key={doc.id} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="font-medium">
  {doc.title ?? doc.document_title ?? 'Untitled document'}
</span>

                {doc.requiredToFile && (

                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">
                    Required for filing
                  </span>
                )}
              </li>
            ))
          ) : jurisdiction === 'scotland' ? (
            <>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Notice to Leave
              </li>
              {!product.includes('notice_only') && (
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Form E (Tribunal application)
                </li>
              )}
            </>
          ) : (
            <>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Section 8 Notice (if applicable)
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Section 21 Notice (if available)
              </li>
              {!product.includes('notice_only') && (
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Form N5 / N119 (court forms)
                </li>
              )}
            </>
          )}
        </ul>
      </Card>

      {/* Warnings (non-blocking) */}
      {analysis.decision_engine?.warnings?.length > 0 && (
        <Card className="p-6 border-yellow-300 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">Important warnings</h2>
              <ul className="space-y-1">
                {analysis.decision_engine.warnings.map((warning: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-800">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button onClick={handleEdit} variant="outline" className="flex-1">
          Go back &amp; edit answers
        </Button>
        <Button onClick={handleProceed} className="flex-1">
          Proceed to payment &amp; pack
        </Button>
      </div>

      <p className="text-xs text-center text-gray-500 mt-2">
        We will generate your full pack regardless of readiness. Use the guidance to reach a
        safe, court-ready position before issuing.
      </p>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ReviewPageInner />
    </Suspense>
  );
}
