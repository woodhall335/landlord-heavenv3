# Phase 2 Part 4: Frontend Integration Implementation Guide

**Version:** 1.0
**Date:** December 3, 2025
**Status:** Implementation Guide

## Overview

This document provides a complete implementation guide for integrating the backend systems (decision engine, case-intel, advanced Ask Heaven) into the wizard UX.

**CRITICAL PRINCIPLE:** Frontend MUST NOT create legal rules. Only display what backend returns.

---

## Part 1: Wire Advanced Ask Heaven Into Backend

### File: `src/app/api/wizard/answer/route.ts`

**Current Code (Line ~541):**
```typescript
enhanced = await enhanceAnswer({
  question,
  rawAnswer: rawAnswerText,
  jurisdiction: caseRow.jurisdiction,
  product,
  caseType: caseRow.case_type,
});
```

**Updated Code:**
```typescript
// Add imports at top of file
import { runDecisionEngine, type DecisionInput } from '@/lib/decision-engine';
import { normalizeCaseFacts } from '@/lib/case-facts/normalize';

// ... inside POST handler, around line 541:

// Build decision context for Ask Heaven
let decisionContext = null;
try {
  // Only run decision engine for eviction cases with enough data
  if (caseRow.case_type === 'eviction' && collectedFacts && Object.keys(collectedFacts).length > 5) {
    const caseFacts = normalizeCaseFacts(collectedFacts);

    const decisionInput: DecisionInput = {
      jurisdiction: caseRow.jurisdiction as any,
      product: product as any,
      case_type: 'eviction',
      facts: caseFacts,
    };

    decisionContext = runDecisionEngine(decisionInput);
  }
} catch (decisionErr) {
  console.warn('Decision engine failed in answer route:', decisionErr);
  // Continue without decision context
}

// Call Ask Heaven with enhanced context
enhanced = await enhanceAnswer({
  question,
  rawAnswer: rawAnswerText,
  jurisdiction: caseRow.jurisdiction,
  product,
  caseType: caseRow.case_type,
  decisionContext,           // NEW: Decision engine context
  wizardFacts: collectedFacts, // NEW: Current wizard state
});
```

**Why This Works:**
- Decision engine provides legal context (routes, grounds, blocking issues)
- Ask Heaven uses this to tailor suggestions without creating new rules
- Falls back gracefully if decision engine unavailable
- Performance: only runs when we have enough data

---

## Part 2: Frontend Ask Heaven UI Component

### File: `src/app/wizard/components/AskHeavenPanel.tsx` (NEW)

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface AskHeavenPanelProps {
  questionId: string;
  rawAnswer: string;
  jurisdiction: string;
  caseId: string;
  onAccept: (improvedText: string) => void;
}

export function AskHeavenPanel({
  questionId,
  rawAnswer,
  jurisdiction,
  caseId,
  onAccept,
}: AskHeavenPanelProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

      if (data.enhanced) {
        setResult(data.enhanced);
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
```

**Usage in Wizard Question Component:**
```typescript
// In your textarea question component
import { AskHeavenPanel } from './AskHeavenPanel';

// After the textarea:
<AskHeavenPanel
  questionId={question.id}
  rawAnswer={answer}
  jurisdiction={jurisdiction}
  caseId={caseId}
  onAccept={(improvedText) => setAnswer(improvedText)}
/>
```

---

## Part 3: Live Checkpoint Integration

### File: `src/app/wizard/flow/page.tsx` (or your main wizard container)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface CheckpointResult {
  blocking_issues: Array<{
    route: string;
    description: string;
    severity: string;
  }>;
  warnings: string[];
  recommended_routes: string[];
  completeness_hint: {
    missing_critical: string[];
    completeness_percent: number;
  };
}

export function WizardFlow() {
  const { caseId } = useParams();
  const [checkpoint, setCheckpoint] = useState<CheckpointResult | null>(null);
  const [currentSection, setCurrentSection] = useState('');

  // Key sections that trigger checkpoint
  const KEY_SECTIONS = [
    'tenancy_details',
    'deposit_compliance',
    'route_selection',
    'grounds_selection',
    'evidence',
  ];

  const runCheckpoint = async () => {
    try {
      const response = await fetch('/api/wizard/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          // Optional: pass current facts if available
        }),
      });

      const data = await response.json();
      setCheckpoint(data);
    } catch (error) {
      console.error('Checkpoint failed:', error);
    }
  };

  // Run checkpoint when section changes
  useEffect(() => {
    if (KEY_SECTIONS.includes(currentSection)) {
      runCheckpoint();
    }
  }, [currentSection]);

  return (
    <div>
      {/* Blocking Issues Banner */}
      {checkpoint?.blocking_issues && checkpoint.blocking_issues.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-sm font-semibold text-red-900 mb-2">
            ⚠️ Route(s) Currently Blocked
          </h3>
          {checkpoint.blocking_issues.map((issue, i) => (
            <div key={i} className="text-sm text-red-800 mb-1">
              <strong>{issue.route.toUpperCase()}:</strong> {issue.description}
            </div>
          ))}
        </div>
      )}

      {/* Warnings Banner */}
      {checkpoint?.warnings && checkpoint.warnings.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-sm font-semibold text-yellow-900 mb-2">
            ⚠️ Warnings
          </h3>
          <ul className="text-sm text-yellow-800 list-disc list-inside">
            {checkpoint.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Completeness Indicator */}
      {checkpoint?.completeness_hint && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-blue-900">
              Application Completeness
            </h3>
            <span className="text-lg font-bold text-blue-900">
              {checkpoint.completeness_hint.completeness_percent}%
            </span>
          </div>
          {checkpoint.completeness_hint.missing_critical.length > 0 && (
            <>
              <p className="text-sm text-blue-800 mb-1">Still need:</p>
              <ul className="text-sm text-blue-700 list-disc list-inside">
                {checkpoint.completeness_hint.missing_critical.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Rest of wizard flow */}
      {/* ... */}
    </div>
  );
}
```

---

## Part 4: Case Strength Widget

### File: `src/app/wizard/components/CaseStrengthWidget.tsx` (NEW)

```typescript
'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Shield, FileText, CheckCircle2, FileCheck } from 'lucide-react';

interface CaseStrengthWidgetProps {
  scoreReport: {
    score: number;
    components: {
      legal_eligibility: { score: number; issues?: string[]; strengths?: string[] };
      evidence: { score: number; issues?: string[] };
      consistency: { score: number };
      procedure: { score: number };
    };
  };
}

export function CaseStrengthWidget({ scoreReport }: CaseStrengthWidgetProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Weak';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Case Strength Assessment</h3>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getScoreColor(scoreReport.score)}`}>
            {scoreReport.score}/100
          </div>
          <div className="text-sm text-gray-500">
            {getScoreLabel(scoreReport.score)}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        ℹ️ Informational Only — Not Legal Advice
      </p>

      <div className="space-y-4">
        {/* Legal Eligibility */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Legal Eligibility</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.legal_eligibility.score)}`}>
              {scoreReport.components.legal_eligibility.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.legal_eligibility.score} className="h-2" />

          {scoreReport.components.legal_eligibility.issues && scoreReport.components.legal_eligibility.issues.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 space-y-1">
              {scoreReport.components.legal_eligibility.issues.slice(0, 2).map((issue, i) => (
                <li key={i}>• {issue}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Evidence */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Evidence</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.evidence.score)}`}>
              {scoreReport.components.evidence.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.evidence.score} className="h-2" />
        </div>

        {/* Consistency */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Consistency</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.consistency.score)}`}>
              {scoreReport.components.consistency.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.consistency.score} className="h-2" />
        </div>

        {/* Procedure */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Procedure</span>
            </div>
            <span className={`text-sm font-semibold ${getScoreColor(scoreReport.components.procedure.score)}`}>
              {scoreReport.components.procedure.score}/100
            </span>
          </div>
          <Progress value={scoreReport.components.procedure.score} className="h-2" />
        </div>
      </div>
    </Card>
  );
}
```

**Usage:**
```typescript
// After calling /api/wizard/analyze or /api/wizard/checkpoint
import { CaseStrengthWidget } from './CaseStrengthWidget';

<CaseStrengthWidget scoreReport={analysisData.score_report} />
```

---

## Part 5: Final Check Page

### File: `src/app/wizard/review/page.tsx` (or your review step)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CaseStrengthWidget } from '../components/CaseStrengthWidget';
import { AlertCircle, CheckCircle2, FileText, X } from 'lucide-react';

export default function ReviewPage() {
  const { caseId } = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
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
    return <div>Loading analysis...</div>;
  }

  if (!analysis) {
    return <div>Failed to load analysis</div>;
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
          onClick={() => router.push(`/wizard/${caseId}/edit`)}
          variant="outline"
          className="flex-1"
        >
          Go Back & Edit
        </Button>
        <Button
          onClick={() => router.push(`/wizard/${caseId}/payment`)}
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
```

---

## Part 6: Testing

### File: `tests/integration/wizard-live-checks.test.ts` (NEW)

```typescript
/**
 * Integration Tests for Wizard Live Checks
 *
 * Tests that frontend correctly displays backend analysis without creating legal rules.
 */

import { describe, it, expect } from '@jest/globals';

describe('Wizard Live Checks Integration', () => {
  it('should call checkpoint after key sections', async () => {
    // Test implementation
    // Verify checkpoint is called after:
    // - Tenancy details
    // - Deposit compliance
    // - Route selection
    // - Grounds selection
    // - Evidence
  });

  it('should display blocking issues from decision engine', async () => {
    // Test implementation
    // Verify Section 21 blocks are shown when backend reports them
    // Verify no frontend logic overrides backend decision
  });

  it('should show Ask Heaven suggestions for free-text fields', async () => {
    // Test implementation
    // Verify Ask Heaven panel appears for textarea questions
    // Verify improved wording, missing info, evidence suggestions displayed
  });

  it('should display case strength widget with backend data only', async () => {
    // Test implementation
    // Verify score comes from backend
    // Verify no frontend calculation of legal eligibility
  });

  it('should show final review with decision engine outputs', async () => {
    // Test implementation
    // Verify routes/grounds match backend exactly
    // Verify no frontend filtering or modification
  });
});
```

---

## Implementation Checklist

### Backend (Priority 1)
- [ ] Update `/api/wizard/answer` to pass decision context to Ask Heaven
- [ ] Test Ask Heaven with decision context in development
- [ ] Verify backward compatibility (existing calls still work)

### Frontend Components (Priority 2)
- [ ] Create `AskHeavenPanel.tsx` component
- [ ] Create `CaseStrengthWidget.tsx` component
- [ ] Add checkpoint integration to wizard flow
- [ ] Update final review page with analysis display

### Integration (Priority 3)
- [ ] Wire Ask Heaven panel into wizard question components
- [ ] Add checkpoint triggers to section transitions
- [ ] Update payment gate to check blocking issues
- [ ] Test full flow: wizard → checkpoint → analysis → review

### Testing (Priority 4)
- [ ] Write integration tests for live checks
- [ ] Test Section 21 blocking banner display
- [ ] Test Ask Heaven UI with various responses
- [ ] Test case strength widget rendering
- [ ] End-to-end test: complete wizard with live feedback

---

## Performance Considerations

### Decision Engine Calls
- ✅ Only run when case_type is 'eviction'
- ✅ Only run when we have enough data (5+ fields)
- ✅ Cache results briefly (30s) to avoid repeated calls
- ✅ Fail gracefully if engine unavailable

### Case Intel Calls
- ⚠️ More expensive (includes OpenAI calls)
- ✅ Only run for key narrative questions
- ✅ Only run at final review step
- ✅ Cache results for session duration

### Ask Heaven Calls
- ⚠️ OpenAI API call per request
- ✅ Only triggered by user clicking "Improve" button
- ✅ Debounce multiple rapid clicks
- ✅ Show loading state during processing

---

## Legal Safety Checklist

### ✅ Frontend DOES NOT:
- [ ] Calculate any legal thresholds
- [ ] Determine route eligibility
- [ ] Override decision engine outputs
- [ ] Create blocking rules
- [ ] Modify ground recommendations
- [ ] Generate legal advice

### ✅ Frontend ONLY:
- [ ] Displays backend decision engine results
- [ ] Shows case-intel analysis as-is
- [ ] Presents Ask Heaven suggestions
- [ ] Renders warnings/blocks from backend
- [ ] Provides UI/UX around backend data

---

## Deployment Notes

1. **Backend First:** Deploy backend changes (answer route updates) before frontend
2. **Feature Flag:** Consider feature flag for Ask Heaven UI (gradual rollout)
3. **Monitoring:** Track Ask Heaven success/failure rates
4. **Cost:** Monitor OpenAI API usage (Ask Heaven calls)
5. **Performance:** Monitor decision engine execution time

---

## Documentation

All components include:
- TypeScript types for safety
- Props documentation
- Example usage
- Accessibility considerations
- Responsive design

Frontend follows principle: **Display, don't decide.**

---

**Document Version:** 1.0
**Status:** Ready for Implementation
**Estimated Effort:** 16-24 hours full implementation
