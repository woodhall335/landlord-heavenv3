'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CaseStrengthWidget } from '../components/CaseStrengthWidget';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';

export default function ReviewPage() {
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Review Your Application</h1>

      {/* Blocking Issues - Critical */}
      {hasBlockingIssues && (
        <Card className="p-6 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <X className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                Critical Issues Detected
              </h2>
              <p className="text-sm text-red-800 mb-3">
                The following route(s) are currently blocked. You must resolve these before proceeding:
              </p>
              {analysis.decision_engine.blocking_issues
                .filter((issue: any) => issue.severity === 'blocking')
                .map((issue: any, i: number) => (
                  <div key={i} className="mb-2 p-3 bg-white rounded border border-red-200">
                    <p className="font-medium text-red-900">
                      {issue.route.toUpperCase()}: {issue.description}
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                      Action Required: {issue.action_required}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Case Strength */}
      {analysis.score_report && (
        <CaseStrengthWidget scoreReport={analysis.score_report} />
      )}

      {/* Recommended Routes & Grounds */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Legal Assessment</h2>

        {/* Available Routes */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Available Routes:</h3>
          {analysis.decision_engine?.recommended_routes?.length > 0 ? (
            <div className="flex gap-2">
              {analysis.decision_engine.recommended_routes.map((route: string) => (
                <span key={route} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle2 className="inline h-4 w-4 mr-1" />
                  {route.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-600">No routes currently available</p>
          )}
        </div>

        {/* Recommended Grounds */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended Grounds:</h3>
          {analysis.decision_engine?.recommended_grounds?.length > 0 ? (
            <div className="space-y-2">
              {analysis.decision_engine.recommended_grounds.map((ground: any) => (
                <div key={ground.code} className="p-3 bg-gray-50 rounded border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        Ground {ground.code}: {ground.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {ground.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      ground.type === 'mandatory'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ground.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No grounds recommended</p>
          )}
        </div>
      </Card>

      {/* Documents to be Generated */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          <FileText className="inline h-5 w-5 mr-2" />
          Documents to be Generated
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Based on your case details and jurisdiction, the following documents will be prepared:
        </p>
        <ul className="space-y-2">
          {analysis.jurisdiction === 'scotland' ? (
            <>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Notice to Leave
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Form E (Tribunal Application)
              </li>
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
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Form N5 / N119 (Court Forms)
              </li>
            </>
          )}
        </ul>
      </Card>

      {/* Warnings */}
      {analysis.decision_engine?.warnings?.length > 0 && (
        <Card className="p-6 border-yellow-300 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                Important Warnings
              </h2>
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
      <div className="flex gap-4">
        <Button
          onClick={() => router.push(`/wizard/flow?case_id=${caseId}`)}
          variant="outline"
          className="flex-1"
        >
          Go Back & Edit
        </Button>
        <Button
          onClick={() => router.push(`/wizard/preview/${caseId}`)}
          disabled={hasBlockingIssues}
          className="flex-1"
        >
          {hasBlockingIssues ? 'Resolve Issues First' : 'Proceed to Payment'}
        </Button>
      </div>

      {hasBlockingIssues && (
        <p className="text-sm text-center text-red-600">
          ⚠️ You must resolve all blocking issues before proceeding to payment
        </p>
      )}
    </div>
  );
}
