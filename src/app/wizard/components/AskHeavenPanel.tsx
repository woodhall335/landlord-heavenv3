'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loader2, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface AskHeavenPanelProps {
  questionId: string;
  rawAnswer: string;
  jurisdiction: string;
  caseId: string;
  onAccept: (improvedText: string) => void;
  initialResult?: {
    suggested_wording: string;
    missing_information: string[];
    evidence_suggestions: string[];
    consistency_flags?: string[];
  } | null;
}

export function AskHeavenPanel({
  questionId,
  rawAnswer,
  jurisdiction,
  caseId,
  onAccept,
  initialResult,
}: AskHeavenPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(initialResult || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setResult(initialResult || null);
  }, [initialResult]);

  const handleImprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: questionId,
          answer: rawAnswer,
        }),
      });

      const data = await response.json();

      const improved = data.ask_heaven || data.enhanced_answer || data.enhanced;

      if (improved) {
        setResult(improved);
      } else {
        setError('Ask Heaven is not available for this question');
      }
    } catch (err) {
      setError('Failed to improve text. Please try again.');
      console.error('Ask Heaven error:', err);
    } finally {
      setLoading(false);
    }
  };

  const jurisdictionLabel = {
    'england-wales': 'England & Wales County Court',
    'scotland': 'Scotland First-tier Tribunal',
    'northern-ireland': 'Northern Ireland',
  }[jurisdiction] || jurisdiction;

  if (!rawAnswer || rawAnswer.length < 10) {
    return null; // Don't show for very short answers
  }

  return (
    <div className="mt-4 space-y-4">
      {!result && (
        <Button
          onClick={handleImprove}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Improving with Ask Heaven...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Improve with Ask Heaven
            </>
          )}
        </Button>
      )}

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Unable to improve text</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {result && (
        <Card className="p-4 space-y-4 border-blue-200 bg-blue-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Improved Wording</p>
                <p className="text-xs text-blue-700">
                  Tailored for {jurisdictionLabel}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setResult(null)}
              variant="ghost"
              size="sm"
            >
              Dismiss
            </Button>
          </div>

          {/* Improved Wording */}
          <div className="bg-white p-3 rounded border border-blue-200">
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {result.suggested_wording}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onAccept(result.suggested_wording);
                setResult(null);
              }}
              size="sm"
              className="flex-1"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Accept Improved Text
            </Button>
            <Button
              onClick={() => setResult(null)}
              variant="outline"
              size="sm"
            >
              Keep Original
            </Button>
          </div>

          {/* Missing Information */}
          {result.missing_information && result.missing_information.length > 0 && (
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Missing Information</p>
                  <ul className="mt-1 text-sm text-yellow-800 list-disc list-inside">
                    {result.missing_information.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Evidence Suggestions */}
          {result.evidence_suggestions && result.evidence_suggestions.length > 0 && (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Evidence to Gather</p>
                  <ul className="mt-1 text-sm text-green-800 list-disc list-inside">
                    {result.evidence_suggestions.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Consistency Flags */}
          {result.consistency_flags && result.consistency_flags.length > 0 && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Consistency Issues</p>
                  <ul className="mt-1 text-sm text-red-800 list-disc list-inside">
                    {result.consistency_flags.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
