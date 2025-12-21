/**
 * Structured Wizard - MQS-Powered
 *
 * Form-based wizard using MQS backend for all products
 * Now unified with the MQS system for consistency across all wizards
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import type { ExtendedWizardQuestion, StepFlags, WizardValidationIssue } from '@/lib/wizard/types';
import { GuidanceTips } from '@/components/wizard/GuidanceTips';
import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';
import { UploadField, type EvidenceFileSummary } from '@/components/wizard/fields/UploadField';
import { formatGroundTitle, getGroundTypeBadgeClasses, type GroundMetadata } from '@/lib/grounds/format-ground-title';
import { apiUrl } from '@/lib/api';

// ====================================================================================
// OPTION NORMALIZATION HELPER (FIX FOR [object Object] REACT ERRORS)
// ====================================================================================
type MQSOption = string | { value: string; label?: string; [k: string]: any };

interface NormalizedOption {
  key: string;
  value: string;
  label: string;
}

/**
 * Normalizes options to a consistent format, handling both string[] and object[] options.
 * Prevents React key conflicts and [object Object] rendering errors.
 */
function normalizeOptions(options?: MQSOption[]): NormalizedOption[] {
  return (options ?? []).map((opt) => {
    if (typeof opt === "string") {
      return { key: opt, value: opt, label: opt };
    }
    const value = String(opt.value ?? opt.id ?? "");
    const label = String(opt.label ?? opt.name ?? value);
    return { key: value, value, label };
  }).filter(o => o.value);
}

// ====================================================================================
// NESTED PATH HELPER FOR ASK HEAVEN (Task A)
// ====================================================================================

/**
 * Sets a value at a nested path in an object, creating intermediate objects as needed.
 * Example: setValueAtPath({}, "ground_particulars.ground_8.summary", "text")
 *   => { ground_particulars: { ground_8: { summary: "text" } } }
 *
 * For ground_particulars, the path format is "ground_8.summary" or "ground_11.summary"
 * which maps to the structure: { ground_8: { summary: "..." }, ground_11: { summary: "..." } }
 */
function setValueAtPath(obj: any, path: string, value: string): any {
  if (!path) return obj;

  const parts = path.split('.');
  const result = typeof obj === 'object' && obj !== null ? { ...obj } : {};

  let current = result;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    } else {
      current[part] = { ...current[part] };
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

/**
 * Gets a value at a nested path in an object.
 * Example: getValueAtPath({ ground_8: { summary: "text" } }, "ground_8.summary") => "text"
 */
function getValueAtPath(obj: any, path: string): string | null {
  if (!path || !obj || typeof obj !== 'object') return null;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return typeof current === 'string' ? current : null;
}

interface StructuredWizardProps {
  caseId: string;
  caseType: 'eviction' | 'money_claim' | 'tenancy_agreement';
  jurisdiction: 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
  product: 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';
  initialQuestion?: ExtendedWizardQuestion | null;
  onComplete: (caseId: string) => void;
  mode?: 'default' | 'edit';
}

interface CaseAnalysisState {
  case_strength_score: number;
  red_flags: string[];
  compliance_issues: string[];
  case_summary?: any;
  case_health?: any;
}

export const StructuredWizard: React.FC<StructuredWizardProps> = ({
  caseId,
  caseType,
  jurisdiction,
  product,
  initialQuestion,
  onComplete,
  mode = 'default',
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<ExtendedWizardQuestion | null>(
    initialQuestion ?? null,
  );
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [reviewStepIndex, setReviewStepIndex] = useState(0);
  const [askHeavenSuggestion, setAskHeavenSuggestion] = useState<string | null>(null);
  const [askHeavenResult, setAskHeavenResult] = useState<{
    suggested_wording: string;
    missing_information: string[];
    evidence_suggestions: string[];
    consistency_flags?: string[];
  } | null>(null);
  const [questionHistory, setQuestionHistory] = useState<
    Array<{ question: ExtendedWizardQuestion; answer: any; uploads?: EvidenceFileSummary[] }>
  >([]);
  const [depositWarning, setDepositWarning] = useState<string | null>(null);
  const [epcWarning, setEpcWarning] = useState<string | null>(null);
  const [astSuitabilityWarning, setAstSuitabilityWarning] = useState<string | null>(null);
  const [caseFacts, setCaseFacts] = useState<Record<string, any>>({});

  // ====================================================================================
  // ACTIVE FIELD TRACKING FOR ASK HEAVEN (Task A)
  // ====================================================================================
  const [activeTextFieldPath, setActiveTextFieldPath] = useState<string | null>(null);

  // ====================================================================================
  // NOTICE EXPIRY DATE OVERRIDE STATE (Task B)
  // ====================================================================================
  const [expiryDateOverride, setExpiryDateOverride] = useState(false);

  // ====================================================================================
  // NOTICE COMPLIANCE ERROR STATE
  // ====================================================================================
  const [noticeComplianceError, setNoticeComplianceError] = useState<{
    failures: Array<{
      code: string;
      affected_question_id: string;
      legal_reason: string;
      user_fix_hint: string;
    }>;
    warnings: Array<{
      code: string;
      affected_question_id: string;
      legal_reason: string;
      user_fix_hint: string;
    }>;
  } | null>(null);

  // ====================================================================================
  // PHASE 2: PRE-STEP GATE + ROUTE GUARD STATE
  // ====================================================================================
  const [mqsLocked, setMqsLocked] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'england' | 'wales' | null>(null);
  const previousRouteRef = React.useRef<string | null>(null);
  const routeGuardTriggeredRef = React.useRef(false);

  // ====================================================================================
  // SMART GUIDANCE STATE (Phase 3)
  // ====================================================================================
  const [routeRecommendation, setRouteRecommendation] = useState<{
    recommended_route: string;
    reasoning: string;
    blocked_routes: string[];
    blocking_issues: Array<{
      route: string;
      issue: string;
      description: string;
      action_required: string;
      legal_basis: string;
    }>;
    warnings: string[];
    allowed_routes: string[];
  } | null>(null);

  const [groundRecommendations, setGroundRecommendations] = useState<Array<{
    code: number;
    title: string;
    type: string;
    notice_period_days: number;
    success_probability: string;
    reasoning: string;
    required_evidence: string[];
    legal_basis: string;
  }> | null>(null);

  // ====================================================================================
  // GROUNDS SELECTOR STATE
  // ====================================================================================
  const [availableGrounds, setAvailableGrounds] = useState<GroundMetadata[] | null>(null);
  const [loadingGrounds, setLoadingGrounds] = useState(false);
  const [groundsFetchError, setGroundsFetchError] = useState<string | null>(null);

  // ====================================================================================
  // PREVIEW VALIDATION STATE (for inline blocking issues - ALL MODES)
  // ====================================================================================
  // Canonical validation issues from /api/wizard/answer
  // These are now returned in ALL modes (not just edit mode) to enable
  // inline per-step warnings across all notice-only wizards.
  const [previewBlockingIssues, setPreviewBlockingIssues] = useState<WizardValidationIssue[]>([]);
  const [previewWarnings, setPreviewWarnings] = useState<WizardValidationIssue[]>([]);
  const [wizardWarnings, setWizardWarnings] = useState<WizardValidationIssue[]>([]);
  const [hasBlockingIssues, setHasBlockingIssues] = useState(false);
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [issueCounts, setIssueCounts] = useState<{ blocking: number; warnings: number }>({ blocking: 0, warnings: 0 });
  // Service date validation warning
  const [pastServiceDateWarning, setPastServiceDateWarning] = useState<string | null>(null);

  const [calculatedDate, setCalculatedDate] = useState<{
    date: string;
    notice_period_days: number;
    explanation: string;
    legal_basis: string;
    warnings: string[];
  } | null>(null);
  const [showIntro, setShowIntro] = useState(caseType === 'money_claim');
  const [uploadFilesForCurrentQuestion, setUploadFilesForCurrentQuestion] = useState<
    EvidenceFileSummary[]
  >([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Step 3: money-claim case health / readiness
  const [analysis, setAnalysis] = useState<CaseAnalysisState | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const deriveAnswerFromFacts = useCallback(
    (question: ExtendedWizardQuestion | null, facts: Record<string, any>) => {
      if (!question) return null;

      const resolveValue = (paths: string[]): any => {
        for (const path of paths) {
          const value = getValueAtPath(facts, path);
          if (value !== null && value !== undefined) {
            return value;
          }
        }
        return null;
      };

      if (question.inputType === 'group' && question.fields) {
        const hydrated: Record<string, any> = {};

        question.fields.forEach((field: any) => {
          const fieldPaths =
            (field.maps_to && Array.isArray(field.maps_to) && field.maps_to.length > 0
              ? field.maps_to
              : [field.id]
            ).filter(Boolean);
          const value = resolveValue(fieldPaths as string[]);
          if (value !== null) {
            hydrated[field.id] = value;
          }
        });

        return Object.keys(hydrated).length > 0 ? hydrated : null;
      }

      const questionPaths =
        (question.maps_to && question.maps_to.length > 0 ? question.maps_to : [question.id]).filter(
          Boolean,
        );

      return resolveValue(questionPaths as string[]);
    },
    [],
  );

  // Checkpoint state for live validation
  const [checkpoint, setCheckpoint] = useState<any>(null);
  const [stepFlags, setStepFlags] = useState<StepFlags | null>(null);

  const initializeQuestion = useCallback((question: ExtendedWizardQuestion) => {
    setCurrentQuestion(question);
    setUploadFilesForCurrentQuestion([]);
    setStepFlags(null);
    setNoticeComplianceError(null); // Clear compliance error when question changes
    setActiveTextFieldPath(null); // Clear active field when question changes (Task A)
    setExpiryDateOverride(false); // Reset expiry date override when question changes (Task B)
    setPastServiceDateWarning(null); // Clear past service date warning when question changes

    if (question.inputType === 'group' && question.fields) {
      const defaults: Record<string, any> = {};
      question.fields.forEach((field: any) => {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      });
      setCurrentAnswer(Object.keys(defaults).length > 0 ? defaults : null);
    } else if (question.inputType === 'upload' || question.inputType === 'file_upload') {
      setCurrentAnswer({ uploaded_document_ids: [], file_count: 0 });
    } else {
      setCurrentAnswer(null);
    }
  }, []);

  const handleIntroContinue = () => {
    setShowIntro(false);

    if (!currentQuestion) {
      void loadNextQuestion();
    }
  };

  const getJurisdictionName = () => {
    if (jurisdiction === 'england') return 'England';
    if (jurisdiction === 'wales') return 'Wales';
    if (jurisdiction === 'scotland') return 'Scotland';
    if (jurisdiction === 'northern-ireland') return 'Northern Ireland';
    return 'your area';
  };

  /**
   * Step 3 helper: call /api/wizard/analyze to get case strength & readiness.
   * Used for money claims (and can be reused for AST/eviction later).
   */
  const refreshAnalysis = useCallback(async () => {
    if (!caseId || caseType !== 'money_claim') return;

    setAnalysisLoading(true);
    setAnalysisError(null);

    try {
      const response = await fetch(apiUrl('/api/wizard/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analyse failed: ${response.status}`);
      }

      const data = await response.json();

      setAnalysis({
        case_strength_score: data.case_strength_score ?? 0,
        red_flags: Array.isArray(data.red_flags) ? data.red_flags : [],
        compliance_issues: Array.isArray(data.compliance_issues) ? data.compliance_issues : [],
        case_summary: data.case_summary,
        case_health: data.case_health,
      });
    } catch (err: any) {
      console.error('Case analysis error:', err);
      setAnalysisError(
        'We could not analyse your case just yet. You can keep answering questions and we will try again automatically.',
      );
    } finally {
      setAnalysisLoading(false);
    }
  }, [caseId, caseType]);

  /**
   * Run checkpoint for eviction cases to get live blocking issues and warnings
   */
  const runCheckpoint = useCallback(async () => {
    if (!caseId || caseType !== 'eviction') return;

    try {
      const response = await fetch(apiUrl('/api/wizard/checkpoint'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      });

      if (response.ok) {
        const data = await response.json();
        setCheckpoint(data);
      }
    } catch (error) {
      console.error('Checkpoint failed:', error);
      // Non-fatal - continue wizard
    }
  }, [caseId, caseType]);

  const handleApplySuggestion = useCallback(
    (newText: string) => {
      // Use active field path to determine where to write the text
      if (activeTextFieldPath) {
        // For ground_particulars fields with paths like "ground_8.summary"
        if (currentQuestion?.id === 'ground_particulars') {
          const structuredValue = typeof currentAnswer === 'object' && currentAnswer !== null ? currentAnswer : {};
          const updatedValue = setValueAtPath(structuredValue, activeTextFieldPath, newText);
          setCurrentAnswer(updatedValue);
        } else {
          // For other nested fields (future-proofing)
          const updatedValue = setValueAtPath(currentAnswer || {}, activeTextFieldPath, newText);
          setCurrentAnswer(updatedValue);
        }
      } else if (currentQuestion?.inputType === 'textarea') {
        // Fallback: simple textarea (original behavior)
        setCurrentAnswer(newText);
      }
    },
    [currentQuestion, activeTextFieldPath, currentAnswer],
  );

  const handleComplete = useCallback(
    async (options?: { redirect?: boolean }) => {
      const shouldRedirect = options?.redirect ?? mode !== 'edit';

      try {
        setLoading(true);

        // Final analysis before redirect (non-blocking for UX, but awaited here)
        await refreshAnalysis();

        if (mode === 'edit' && !shouldRedirect) {
          setLoading(false);
          return;
        }

        onComplete(caseId);
      } catch (err: any) {
        setError(err.message || 'Failed to complete wizard');
        setLoading(false);
      }
    },
    [caseId, mode, onComplete, refreshAnalysis],
  );

  const loadNextQuestion = useCallback(async (opts?: { currentQuestionId?: string }) => {
    if (!caseId) return;

    setLoading(true);
    setError(null);
    setAskHeavenSuggestion(null);
    setAskHeavenResult(null);

    try {
      const response = await fetch(apiUrl('/api/wizard/next-question'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          mode,
          include_answered: mode === 'edit',
          review_mode: mode === 'edit',
          current_question_id: opts?.currentQuestionId ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load question: ${response.status}`);
      }

      const data = await response.json();

      if (data.is_complete) {
        setProgress(data.progress || 100);
        setIsComplete(true);
        if (mode === 'edit') {
          if (opts?.currentQuestionId) {
            setReviewStepIndex((prev) => prev + 1);
          }
          setCurrentQuestion(null);
          setCurrentAnswer(null);
          setUploadFilesForCurrentQuestion([]);
          setLoading(false);
          return;
        }
        await handleComplete();
      } else if (data.next_question) {
        if (mode === 'edit') {
          setReviewStepIndex((prev) => (opts?.currentQuestionId ? prev + 1 : 0));
        }
        initializeQuestion(data.next_question);
        setProgress(data.progress || 0);
      } else {
        throw new Error('No question returned from API');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load question');
      console.error('Load question error:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId, handleComplete, initializeQuestion, mode]);

  // ====================================================================================
  // JUMP-TO-QUESTION FUNCTIONALITY (for issue links)
  // ====================================================================================
  // Allows users to click on validation issues to navigate directly to the question
  // that can fix the issue. Preserves case context (case_id, type, jurisdiction, product).
  const jumpToQuestion = useCallback(async (questionId: string) => {
    if (!caseId || !questionId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch the specific question by ID
      const response = await fetch(apiUrl('/api/wizard/next-question'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          mode: 'edit', // Always use edit mode for jumping to questions
          include_answered: true,
          review_mode: true,
          target_question_id: questionId, // Request specific question
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load question: ${response.status}`);
      }

      const data = await response.json();

      if (data.next_question) {
        initializeQuestion(data.next_question);
        setProgress(data.progress || 0);
        console.log('[VALIDATION-UI] Jumped to question:', questionId);
      } else {
        // If specific question not found, just log it
        console.warn('[VALIDATION-UI] Question not found:', questionId);
        setError(`Question "${questionId}" not found in current flow`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to navigate to question');
      console.error('Jump to question error:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId, initializeQuestion]);

  // ====================================================================================
  // PHASE 2: MQS LOADING FUNCTION
  // ====================================================================================
  const loadWizardWithMQS = useCallback(async (location: 'england' | 'wales') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/wizard/mqs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          propertyLocation: location,
          jurisdiction: location, // Use canonical jurisdiction (england or wales)
          product: 'notice_only',
        }),
      });

      if (!response.ok) throw new Error('Failed to load MQS');

      const mqs = await response.json();

      setCaseFacts((prev) => ({
        ...prev,
        property_location: location,
        legal_framework: mqs.legal_framework,
        tenancy_type: mqs.tenancy_type,
      }));

      setMqsLocked(true);
      setSelectedLocation(location);

      console.log(`[Wizard] Loaded ${mqs.file_loaded} for ${location}`);

      // Load first question
      await loadNextQuestion();
    } catch (error: any) {
      console.error('[Wizard] MQS error:', error);
      setError('Failed to load wizard');
    } finally {
      setLoading(false);
    }
  }, [caseId, loadNextQuestion]);

  // Load first question after intro or when no initial question was provided
  useEffect(() => {
    if (initialQuestion && !currentQuestion) {
      if (mode === 'edit') {
        setReviewStepIndex(0);
      }
      initializeQuestion(initialQuestion);
      return;
    }

    if (!showIntro && !currentQuestion) {
      void loadNextQuestion();
    }
  }, [currentQuestion, initialQuestion, initializeQuestion, loadNextQuestion, mode, showIntro]);

  // Fetch case facts when question changes (for validation and side panels)
  useEffect(() => {
    const fetchCaseFacts = async () => {
      try {
        const response = await fetch(apiUrl(`/api/cases/${caseId}`));
        if (response.ok) {
          const data = await response.json();
          setCaseFacts(data.case?.collected_facts || {});
        }
      } catch (err) {
        console.error('Failed to fetch case facts:', err);
      }
    };

    if (currentQuestion && caseId) {
      void fetchCaseFacts();
    }
  }, [currentQuestion, caseId]);

  useEffect(() => {
    if (!currentQuestion) return;

    const hydrated = deriveAnswerFromFacts(currentQuestion, caseFacts);

    const shouldHydrate =
      hydrated !== null &&
      (currentAnswer === null ||
        currentAnswer === undefined ||
        (typeof currentAnswer === 'string' && currentAnswer.trim().length === 0));

    if (shouldHydrate) {
      setCurrentAnswer(hydrated);
    }
  }, [caseFacts, currentAnswer, currentQuestion, deriveAnswerFromFacts]);

  // ====================================================================================
  // PHASE 2: ROUTE GUARD (CLAUDE CODE FIX #4 + #7 WITH LOOP PROTECTION)
  // ====================================================================================
  useEffect(() => {
    // Only for Wales
    if (caseFacts.property_location !== 'wales') return;

    const currentRoute = caseFacts.selected_notice_route;
    const previousRoute = previousRouteRef.current;

    // Update previous route tracker
    previousRouteRef.current = currentRoute;

    // Check if route guard should run
    if (currentRoute === 'wales_section_173') {
      const contractCategory = caseFacts.wales_contract_category;

      // If contract doesn't support Section 173
      if (contractCategory === 'supported_standard' || contractCategory === 'secure') {
        // CLAUDE CODE FIX #7: Check if we already triggered guard
        if (routeGuardTriggeredRef.current && previousRoute === 'wales_fault_based') {
          // Already switched, don't run again
          return;
        }

        // CLAUDE CODE FIX #7: Only run once per invalid selection
        routeGuardTriggeredRef.current = true;

        // Auto-switch to fault-based
        setCaseFacts((prev) => {
          return {
            ...prev,
            selected_notice_route: 'wales_fault_based',
          };
        });

        // Notify user (if toast is available)
        console.warn(
          '[Route Guard] Section 173 not available for contract type. Switched to fault-based.',
        );

        console.log(
          `[Route Guard] Auto-switched from Section 173 to fault-based (contract: ${contractCategory})`,
        );
      } else {
        // Valid contract type, reset trigger
        routeGuardTriggeredRef.current = false;
      }
    } else {
      // Not Section 173 route, reset trigger
      routeGuardTriggeredRef.current = false;
    }
  }, [caseFacts.selected_notice_route, caseFacts.wales_contract_category, caseFacts.property_location]);

  // Reset route guard trigger when location changes
  useEffect(() => {
    routeGuardTriggeredRef.current = false;
    previousRouteRef.current = null;
  }, [caseFacts.property_location]);

  // Optional: kick off an early analysis once the wizard starts (money claims only)
  useEffect(() => {
    if (!showIntro && caseType === 'money_claim' && caseId) {
      void refreshAnalysis();
    }
  }, [showIntro, caseType, caseId, refreshAnalysis]);

  // Run checkpoint after key sections (eviction cases only)
  useEffect(() => {
    const KEY_SECTIONS = [
      'tenancy_details',
      'deposit_compliance',
      'route_selection',
      'grounds_selection',
      'evidence',
    ];

    if (currentQuestion && caseType === 'eviction') {
      const section = currentQuestion.section || '';
      if (KEY_SECTIONS.some((s) => section.toLowerCase().includes(s.toLowerCase()))) {
        void runCheckpoint();
      }
    }
  }, [currentQuestion, caseType, runCheckpoint]);

  // Inline deposit validation
  useEffect(() => {
    if (currentQuestion?.id === 'deposit_details' && currentAnswer?.deposit_amount) {
      const depositAmount = parseFloat(currentAnswer.deposit_amount);
      const rentAmount = parseFloat(caseFacts.rent_amount || 0);
      const rentPeriod = caseFacts.rent_period || 'month';

      if (rentAmount > 0 && depositAmount > 0) {
        // Calculate 5 weeks rent
        let weeklyRent = rentAmount;
        if (rentPeriod === 'month') weeklyRent = (rentAmount * 12) / 52;
        else if (rentPeriod === 'quarter') weeklyRent = (rentAmount * 4) / 52;
        else if (rentPeriod === 'year') weeklyRent = rentAmount / 52;

        const maxDeposit = weeklyRent * 5;

        if (depositAmount > maxDeposit) {
          setDepositWarning(
            `⚠️ ILLEGAL DEPOSIT: £${depositAmount.toFixed(
              2,
            )} exceeds 5 weeks rent (£${maxDeposit.toFixed(
              2,
            )}). This VIOLATES the Tenant Fees Act 2019. Maximum permitted: £${maxDeposit.toFixed(2)}.`,
          );
        } else {
          setDepositWarning(null);
        }
      }
    } else {
      setDepositWarning(null);
    }
  }, [currentAnswer, currentQuestion, caseFacts]);

  // EPC rating validation (England & Wales tenancies)
  useEffect(() => {
    if (
      currentQuestion?.id === 'safety_compliance' &&
      currentAnswer?.epc_rating &&
      (jurisdiction === 'england' || jurisdiction === 'wales')
    ) {
      const epcRating = currentAnswer.epc_rating;
      if (epcRating === 'F' || epcRating === 'G') {
        setEpcWarning(
          `⚠️ EPC COMPLIANCE WARNING: EPC rating ${epcRating} is below the minimum energy efficiency standard (E) required for most lettings in England & Wales. You may need an exemption or must improve the property before letting.`,
        );
      } else {
        setEpcWarning(null);
      }
    } else {
      setEpcWarning(null);
    }
  }, [currentAnswer, currentQuestion, jurisdiction]);

  // AST suitability validation (England & Wales tenancies)
  useEffect(() => {
    if (
      currentQuestion?.id === 'ast_suitability' &&
      currentAnswer &&
      caseType === 'tenancy_agreement' &&
      (jurisdiction === 'england' || jurisdiction === 'wales')
    ) {
      const warnings: string[] = [];

      if (currentAnswer.tenant_is_individual === false) {
        warnings.push('Tenant must be an individual (not a company) for an AST');
      }
      if (currentAnswer.main_home === false) {
        warnings.push("Property must be the tenant's main home for an AST");
      }
      if (currentAnswer.landlord_lives_at_property === true) {
        warnings.push(
          'If landlord lives at property, this is likely a lodger/licence arrangement, not an AST',
        );
      }
      if (currentAnswer.holiday_or_licence === true) {
        warnings.push('Holiday lets and licence arrangements are not covered by AST regulations');
      }

      if (warnings.length > 0) {
        setAstSuitabilityWarning(
          `⚠️ AST SUITABILITY WARNING: ${warnings.join(
            '. ',
          )}. You may need a different type of agreement.`,
        );
      } else {
        setAstSuitabilityWarning(null);
      }
    } else {
      setAstSuitabilityWarning(null);
    }
  }, [currentAnswer, currentQuestion, caseType, jurisdiction]);

  // Auto-calculate end date based on start date + term length
  useEffect(() => {
    if (currentQuestion?.id === 'tenancy_type_and_dates' && currentAnswer) {
      const startDate = currentAnswer.tenancy_start_date;
      const termLength = currentAnswer.term_length;
      const isFixedTerm = currentAnswer.is_fixed_term;

      if (isFixedTerm === true && startDate && termLength) {
        const start = new Date(startDate);
        let endDate = new Date(start);

        // Parse term length (e.g., "12 months", "6 months")
        const months = parseInt(termLength.match(/\d+/)?.[0] || '0', 10);

        if (months > 0) {
          endDate.setMonth(endDate.getMonth() + months);
          endDate.setDate(endDate.getDate() - 1); // Subtract 1 day

          const endDateStr = endDate.toISOString().split('T')[0];

          // Only update if different from current value
          if (currentAnswer.tenancy_end_date !== endDateStr) {
            setCurrentAnswer({
              ...currentAnswer,
              tenancy_end_date: endDateStr,
            });
          }
        }
      }
    }
  }, [currentAnswer, currentQuestion]);

  // ====================================================================================
  // FETCH GROUNDS FOR GROUNDS SELECTION QUESTIONS
  // ====================================================================================
  useEffect(() => {
    const isGroundsQuestion =
      currentQuestion?.id === 'section8_grounds_selection' || // England
      currentQuestion?.id === 'ground_particulars' || // England particulars (needs metadata too)
      currentQuestion?.id === 'eviction_grounds' || // Scotland
      currentQuestion?.id === 'wales_fault_based_section'; // Wales (not technically "grounds" but similar)

    if (isGroundsQuestion && jurisdiction && !availableGrounds && !loadingGrounds) {
      const fetchGrounds = async () => {
        setLoadingGrounds(true);
        setGroundsFetchError(null);
        try {
          const response = await fetch(apiUrl(`/api/grounds/${jurisdiction}`));
          if (response.ok) {
            const data = await response.json();
            // API returns grounds with proper GroundMetadata shape
            setAvailableGrounds(data.grounds as GroundMetadata[]);
            setGroundsFetchError(null);
          } else {
            const errorMessage = `Failed to load ground descriptions (status ${response.status})`;
            setGroundsFetchError(errorMessage);
            console.error('Failed to fetch grounds:', response.status);
          }
        } catch (error) {
          const errorMessage = 'Failed to load ground descriptions';
          setGroundsFetchError(errorMessage);
          console.error('Error fetching grounds:', error);
        } finally {
          setLoadingGrounds(false);
        }
      };

      void fetchGrounds();
    }

    // Reset grounds when question changes to non-grounds question
    if (!isGroundsQuestion && availableGrounds) {
      setAvailableGrounds(null);
    }
    if (!isGroundsQuestion && groundsFetchError) {
      setGroundsFetchError(null);
    }
  }, [currentQuestion, jurisdiction, availableGrounds, loadingGrounds, groundsFetchError]);

  const isCurrentAnswerValid = (): boolean => {
    if (!currentQuestion) return false;

    const resolvedInputType =
      currentQuestion.inputType === 'address' ? 'group' : currentQuestion.inputType;

    // Info questions are always valid - they don't require an answer
    if (resolvedInputType === 'info') {
      return true;
    }

    if (resolvedInputType === 'upload' || resolvedInputType === 'file_upload') {
      if (currentQuestion.validation?.required && uploadFilesForCurrentQuestion.length === 0) {
        setError('Please upload at least one file');
        return false;
      }
      return true;
    }

    // For grouped inputs, validate all fields
    if (resolvedInputType === 'group' && currentQuestion.fields) {
      for (const field of currentQuestion.fields) {
        const fieldValue = currentAnswer?.[field.id];

        // ====================================================================================
        // SPECIAL VALIDATION: Notice expiry date (Task B)
        // Skip validation if auto-calc is available and override is OFF
        // ====================================================================================
        if (
          field.id === 'notice_expiry_date' &&
          currentQuestion.id === 'notice_service' &&
          !expiryDateOverride &&
          calculatedDate
        ) {
          // Auto-calc is being used, skip validation
          continue;
        }

        // ====================================================================================
        // SPECIAL VALIDATION: Past service date warning
        // Warn user if the notice_service_date is in the past (implies already served)
        // ====================================================================================
        if (field.id === 'notice_service_date' && currentQuestion.id === 'notice_service' && fieldValue) {
          const serviceDate = new Date(fieldValue);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          serviceDate.setHours(0, 0, 0, 0);

          if (serviceDate < today) {
            // Show warning but don't block - user may have already served
            setPastServiceDateWarning(
              `The service date (${fieldValue}) is in the past. This is valid if you've already served the notice. ` +
              `If you haven't served it yet, please update the date to when you plan to serve.`
            );
          } else {
            setPastServiceDateWarning(null);
          }
        }

        // Check for required fields - must handle boolean false as valid
        if (
          field.validation?.required &&
          (fieldValue === null || fieldValue === undefined || fieldValue === '')
        ) {
          setError(`Please fill in ${field.label?.toLowerCase?.() ?? 'this field'}`);
          return false;
        }

        // Validate pattern (e.g., postcode)
        if (field.validation?.pattern && fieldValue) {
          const regex = new RegExp(field.validation.pattern, 'i');
          if (!regex.test(fieldValue)) {
            setError(`Invalid format for ${field.label?.toLowerCase?.() ?? 'this field'}`);
            return false;
          }
        }

        // Validate number range
        if ((field.inputType === 'number' || field.inputType === 'currency') && fieldValue) {
          const num = parseFloat(fieldValue);
          if (Number.isNaN(num)) {
            setError(`${field.label ?? 'This field'} must be a valid number`);
            return false;
          }
          if (field.validation?.min !== undefined && num < field.validation.min) {
            setError(`${field.label ?? 'This field'} must be at least ${field.validation.min}`);
            return false;
          }
          if (field.validation?.max !== undefined && num > field.validation.max) {
            setError(`${field.label ?? 'This field'} must be at most ${field.validation.max}`);
            return false;
          }
        }
      }
      return true;
    }

    // ====================================================================================
    // SPECIAL VALIDATION: Ground-specific particulars (Problem 1 fix)
    // ====================================================================================
    if (currentQuestion.id === 'ground_particulars' && currentQuestion.validation?.required) {
      // Get selected grounds from case facts
      const selectedGrounds = caseFacts.section8_grounds || [];

      // Extract ground IDs and deduplicate (caseFacts may contain duplicates or mixed formats)
      const groundIds: string[] = Array.from(new Set<string>(selectedGrounds.map((g: string) => {
        if (g.startsWith('ground_')) return g;
        const match = g.match(/Ground (\d+[A-Za-z]?)/i);
        return match ? `ground_${match[1].toLowerCase()}` : g;
      })));

      // Ensure answer is an object
      if (typeof currentAnswer !== 'object' || currentAnswer === null) {
        setError('Please provide details for each selected ground');
        return false;
      }

      // Check if any arrears grounds are selected
      const hasArrearsGrounds = groundIds.some((id: string) =>
        id === 'ground_8' || id === 'ground_10' || id === 'ground_11'
      );

      // Validate shared arrears if any arrears ground is selected
      if (hasArrearsGrounds) {
        const sharedArrears = currentAnswer.shared_arrears;
        if (!sharedArrears || !sharedArrears.amount || !sharedArrears.period) {
          setError('Please provide the total amount owed and period of arrears in the shared arrears section');
          return false;
        }
        if (Number(sharedArrears.amount) <= 0) {
          setError('Arrears amount must be greater than zero');
          return false;
        }
        if (sharedArrears.period.trim() === '') {
          setError('Please specify the period of arrears');
          return false;
        }
      }

      // Validate each ground has a summary
      for (const groundId of groundIds) {
        const groundParticulars = currentAnswer[groundId];
        if (!groundParticulars || !groundParticulars.summary || groundParticulars.summary.trim() === '') {
          const groundNum = groundId.replace('ground_', '').toUpperCase();
          setError(`Please provide a factual summary for Ground ${groundNum}`);
          return false;
        }
      }

      return true;
    }

    // For single inputs
    // Note: Must check for null/undefined specifically, not falsy values (false is valid for yes_no)
    if (
      currentQuestion.validation?.required &&
      (currentAnswer === null || currentAnswer === undefined)
    ) {
      setError('This field is required');
      return false;
    }

    // Validate numbers and currency
    if (
      (currentQuestion.inputType === 'currency' || currentQuestion.inputType === 'number') &&
      currentAnswer
    ) {
      const num = parseFloat(currentAnswer);
      if (Number.isNaN(num)) {
        setError('Please enter a valid number');
        return false;
      }
      if (currentQuestion.validation?.min !== undefined && num < currentQuestion.validation.min) {
        setError(`Must be at least ${currentQuestion.validation.min}`);
        return false;
      }
      if (currentQuestion.validation?.max !== undefined && num > currentQuestion.validation.max) {
        setError(`Must be at most ${currentQuestion.validation.max}`);
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    if (!caseId || !currentQuestion) {
      console.warn('No caseId or currentQuestion; skipping save');
      return;
    }

    if (!isCurrentAnswerValid()) {
      if (!error) {
        setError('Please provide a valid answer to continue');
      }
      return;
    }

    if (uploadingEvidence) {
      setError('Please wait for your files to finish uploading.');
      return;
    }

    // Block progression if deposit warning exists
    if (depositWarning) {
      setError(
        'Please reduce the deposit amount to comply with the Tenant Fees Act 2019 before continuing.',
      );
      return;
    }

    // Block progression if AST suitability warning exists
    if (astSuitabilityWarning) {
      setError(
        'This scenario is not appropriate for an AST. Please review the suitability checks and adjust your answers, or consider a different type of agreement.',
      );
      return;
    }

    setError(null);
    setLoading(true);

    // For info questions, skip saving answer and go directly to next question
    if (currentQuestion.inputType === 'info') {
      try {
        // Save to history before moving forward
        if (currentQuestion) {
          setQuestionHistory((prev) => [
            ...prev,
            { question: currentQuestion, answer: null, uploads: [] },
          ]);
        }

        // Load next question directly without saving
        await loadNextQuestion({ currentQuestionId: currentQuestion.id });
      } catch (err: any) {
        setError(err.message || 'Failed to load next question');
        console.error('Load next question error:', err);
        setLoading(false);
      }
      return;
    }

    try {
      // Save answer to backend
      const response = await fetch(apiUrl('/api/wizard/answer'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: currentQuestion.id,
          answer: currentAnswer,
          mode,
          include_answered: mode === 'edit',
          review_mode: mode === 'edit',
          current_question_id: currentQuestion.id,
        }),
      });

      // Parse response once upfront
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Handle NOTICE_NONCOMPLIANT (422) gracefully - DO NOT BLOCK navigation
        // UX Rule: Wizard steps never hard-block based on compliance. Only Preview/Generate is a hard stop.
        // Capture the compliance issues for inline display, but continue to next question.
        if (response.status === 422 && data.error === 'NOTICE_NONCOMPLIANT') {
          console.info('[WIZARD-UX] Notice compliance issues detected, continuing without blocking:', {
            failures: data.failures?.length || data.blocking_issues?.length || 0,
            warnings: data.warnings?.length || 0,
          });
          // Store compliance issues for inline banner display (non-blocking)
          setNoticeComplianceError({
            failures: data.failures || data.blocking_issues || [],
            warnings: data.warnings || [],
          });
          // Continue to load next question despite compliance issues
          // The issues will be displayed as inline warnings, not blocking the flow
          await loadNextQuestion({ currentQuestionId: currentQuestion.id });
          return;
        }

        // Handle case not found (404) gracefully - this DOES block
        if (response.status === 404 && data.code === 'CASE_NOT_FOUND') {
          setError('Your session has expired or the case could not be found. Please restart the wizard from the beginning.');
          setLoading(false);
          return;
        }

        // Handle other validation errors that allow continuation (e.g., LEGAL_BLOCK)
        if (response.status === 422 && (data.code === 'LEGAL_BLOCK' || data.blocking_issues)) {
          console.info('[WIZARD-UX] Validation issues detected, continuing without blocking');
          setPreviewBlockingIssues(data.blocking_issues || []);
          setPreviewWarnings(data.warnings || []);
          setHasBlockingIssues((data.blocking_issues?.length || 0) > 0);
          // Continue to load next question despite validation issues
          await loadNextQuestion({ currentQuestionId: currentQuestion.id });
          return;
        }

        // Other errors - throw as before
        throw new Error(data.error || `Failed to save answer: ${response.status}`);
      }

      // Clear any previous compliance errors on successful save
      setNoticeComplianceError(null);

      // Check for validation errors from AST generator
      if (data.error && data.error.includes('validation failed')) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Check for Ask Heaven suggestions (backend-driven inline hints)
      if (data.suggested_wording) {
        setAskHeavenSuggestion(data.suggested_wording);
      }

      if (data.ask_heaven) {
        setAskHeavenResult(data.ask_heaven);
      } else if (data.enhanced_answer) {
        setAskHeavenResult({
          suggested_wording: data.enhanced_answer.suggested,
          missing_information: data.enhanced_answer.missing_information || [],
          evidence_suggestions: data.enhanced_answer.evidence_suggestions || [],
          consistency_flags: data.enhanced_answer.consistency_flags || [],
        });
      }

      // ====================================================================================
      // SMART GUIDANCE: Capture recommendations from backend (Phase 3)
      // ====================================================================================
      if (data.route_recommendation) {
        setRouteRecommendation(data.route_recommendation);
        console.log('[SMART-GUIDANCE-UI] Route recommendation received:', data.route_recommendation.recommended_route);
      }

      if (data.ground_recommendations) {
        setGroundRecommendations(data.ground_recommendations);
        console.log('[SMART-GUIDANCE-UI] Ground recommendations received:', data.ground_recommendations.length, 'grounds');
      }

      if (data.calculated_date) {
        setCalculatedDate(data.calculated_date);
        console.log('[SMART-GUIDANCE-UI] Calculated date received:', data.calculated_date.date);
      }

      if (data.step_flags) {
        setStepFlags(data.step_flags as StepFlags);
      } else {
        setStepFlags(null);
      }

      // ====================================================================================
      // CANONICAL VALIDATION: Capture blocking issues for inline display (ALL MODES)
      // ====================================================================================
      // Always update with the latest validation state - this enables inline per-step
      // warnings across ALL notice-only wizards (Section 21, Section 8, Wales, Scotland, etc.)
      // Key UX rule: Never block navigation - only warn early and persistently.
      setPreviewBlockingIssues(data.preview_blocking_issues || []);
      setPreviewWarnings(data.preview_warnings || []);
      setWizardWarnings(data.wizard_warnings || []);
      setHasBlockingIssues(data.has_blocking_issues || false);
      setIssueCounts(data.issue_counts || { blocking: 0, warnings: 0 });

      if (mode === 'edit') {
        setIsReviewComplete(data.is_review_complete || false);
      }

      if (data.preview_blocking_issues?.length > 0) {
        console.log('[VALIDATION-UI] Preview blocking issues:', data.preview_blocking_issues.length);
      }

      // Update progress
      setProgress(data.progress || 0);

      // Save to history before moving forward
      if (currentQuestion) {
        setQuestionHistory((prev) => [
          ...prev,
          { question: currentQuestion, answer: currentAnswer, uploads: uploadFilesForCurrentQuestion },
        ]);
      }

      // After a successful save, refresh analysis for money-claims
      if (caseType === 'money_claim') {
        void refreshAnalysis();
      }

      // Check if complete
      if (data.is_complete) {
        setIsComplete(true);
        if (mode === 'edit') {
          setReviewStepIndex((prev) => prev + 1);
          setLoading(false);
          return;
        }
        await handleComplete();
      } else {
        // Load next question
        await loadNextQuestion({ currentQuestionId: currentQuestion.id });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save answer');
      console.error('Save answer error:', err);
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (questionHistory.length === 0) return;

    // Pop the last question from history
    const previousEntry = questionHistory[questionHistory.length - 1];
    setQuestionHistory((prev) => prev.slice(0, -1));

    // Restore the previous question and answer
    setCurrentQuestion(previousEntry.question);
    setCurrentAnswer(previousEntry.answer);
    setUploadFilesForCurrentQuestion(previousEntry.uploads || []);
    setUploadingEvidence(false);
    setError(null);
    setAskHeavenSuggestion(null);

    // Decrease progress (approximate)
    setProgress((prev) => Math.max(0, prev - 5));
  };

  const renderInput = () => {
    if (!currentQuestion) return null;

    const value = currentAnswer ?? '';
    const inputType =
      currentQuestion.inputType === 'address' ? 'group' : currentQuestion.inputType;

    switch (inputType) {
      case 'select': {
        const options = normalizeOptions(currentQuestion.options as MQSOption[]);
        return (
          <select
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- Select an option --</option>
            {options.map((option) => (
              <option key={option.key} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      }

      case 'yes_no':
        return (
          <div className="flex gap-4">
            <Button
              onClick={() => setCurrentAnswer(true)}
              variant={value === true ? 'primary' : 'secondary'}
              disabled={loading}
            >
              Yes
            </Button>
            <Button
              onClick={() => setCurrentAnswer(false)}
              variant={value === false ? 'primary' : 'secondary'}
              disabled={loading}
            >
              No
            </Button>
          </div>
        );

      case 'multi_select':
      case 'multiselect': {
        const selectedValues = Array.isArray(value) ? value : [];

        // Special handling for grounds selection questions
        const isGroundsQuestion =
          currentQuestion.id === 'section8_grounds_selection' || // England
          currentQuestion.id === 'eviction_grounds'; // Scotland

        if (isGroundsQuestion && availableGrounds && availableGrounds.length > 0) {
          // Render grounds selector with detailed information from config
          return (
            <div className="space-y-3">
              {loadingGrounds && (
                <div className="text-sm text-gray-500">Loading grounds...</div>
              )}
              {availableGrounds.map((ground) => {
                const groundId = `ground_${ground.ground}`;
                const isSelected = selectedValues.includes(groundId) || selectedValues.includes(ground.ground);
                const titleInfo = formatGroundTitle(ground.ground, availableGrounds);

                return (
                  <label
                    key={ground.ground}
                    className={`
                      flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all
                      ${isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, groundId]
                          : selectedValues.filter((v: string) => v !== groundId && v !== ground.ground);
                        setCurrentAnswer(newValues);
                      }}
                      className="w-4 h-4 mt-1 text-primary"
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>Ground {titleInfo.groundNum} – {titleInfo.name || ground.name}</span>
                        {titleInfo.type && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getGroundTypeBadgeClasses(titleInfo.type)}`}>
                            {titleInfo.type === 'mandatory' ? 'Mandatory' : 'Discretionary'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {ground.short_description}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          );
        }

        // Default multi-select rendering for non-grounds questions
        // OR for grounds questions where API fetch failed
        const options = normalizeOptions(currentQuestion.options as MQSOption[]);
        return (
          <div className="space-y-2">
            {groundsFetchError && isGroundsQuestion && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <div className="flex-1 text-sm text-yellow-800">
                    <strong>Warning:</strong> {groundsFetchError}. You can still select grounds below, but detailed descriptions may not be available.
                  </div>
                </div>
              </div>
            )}
            {options.map((option) => (
              <label key={option.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter((v: string) => v !== option.value);
                    setCurrentAnswer(newValues);
                  }}
                  className="w-4 h-4 text-primary"
                  disabled={loading}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
      }

      case 'radio': {
        // Handle options with nested structure (value, label, helperText)
        const normalizedOptions = normalizeOptions(currentQuestion.options as MQSOption[]);

        // Preserve helperText from original options if they were objects
        const optionsWithHelpers = normalizedOptions.map((normalized, idx) => {
          const original = (currentQuestion.options as MQSOption[])?.[idx];
          const helperText = typeof original === 'object' && original !== null && 'helperText' in original ? original.helperText : undefined;
          return { ...normalized, helperText };
        });

        return (
          <div className="space-y-3">
            {optionsWithHelpers.map((option) => {
              return (
                <label
                  key={option.key}
                  className={`
                    flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all
                    ${value === option.value
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
                    }
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    className="w-4 h-4 mt-1 text-primary focus:ring-2 focus:ring-primary"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    {option.helperText && (
                      <div className="text-sm text-gray-600 mt-1">{option.helperText}</div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        );
      }

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">£</span>
            <Input
              type="number"
              value={value}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={currentQuestion.placeholder}
              className="pl-8"
              min={currentQuestion.validation?.min}
              max={currentQuestion.validation?.max}
              disabled={loading}
            />
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            disabled={loading}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );

      case 'tel':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );

      case 'textarea': {
        // ====================================================================================
        // SPECIAL HANDLING: Ground-specific particulars (Problem 1 fix)
        // ====================================================================================
        if (currentQuestion.id === 'ground_particulars') {
          // Get selected grounds from case facts
          const selectedGrounds = caseFacts.section8_grounds || [];

          // Extract ground IDs from selected grounds and deduplicate
          // (caseFacts may contain duplicates or mixed formats like ["ground_8", "Ground 8 - ..."])
          const groundIds: string[] = Array.from(new Set<string>(selectedGrounds.map((g: string) => {
            // If already in format "ground_8", use as-is
            if (g.startsWith('ground_')) return g;
            // If in format "Ground 8 - ...", extract the number
            const match = g.match(/Ground (\d+[A-Za-z]?)/i);
            return match ? `ground_${match[1].toLowerCase()}` : g;
          })));

          // Initialize structured answer if needed
          const structuredValue = typeof value === 'object' && value !== null ? value : {};

          if (groundIds.length === 0) {
            return (
              <div className="text-sm text-gray-500 italic">
                No grounds selected. Please go back and select at least one ground.
              </div>
            );
          }

          // Check if any arrears grounds are selected
          const hasArrearsGrounds = groundIds.some((id: string) =>
            id === 'ground_8' || id === 'ground_10' || id === 'ground_11'
          );

          return (
            <div className="space-y-6">
              {/* Shared arrears section for grounds 8, 10, 11 */}
              {hasArrearsGrounds && (
                <div className="p-5 border-2 border-blue-300 rounded-lg bg-blue-50">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-2xl">💰</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-1">
                        Shared Arrears Information
                      </h3>
                      <p className="text-sm text-blue-800 mb-3">
                        This section applies to all arrears-related grounds you've selected (8, 10, 11).
                        Enter the overall arrears information once here.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Total amount owed (£) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-gray-500">£</span>
                        <input
                          type="number"
                          value={structuredValue.shared_arrears?.amount || ''}
                          onChange={(e) => setCurrentAnswer({
                            ...structuredValue,
                            shared_arrears: {
                              ...structuredValue.shared_arrears,
                              amount: e.target.value
                            }
                          })}
                          className="w-full pl-8 p-2 border border-blue-300 rounded-lg"
                          placeholder="e.g., 3000"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">
                        Period of arrears <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={structuredValue.shared_arrears?.period || ''}
                        onChange={(e) => setCurrentAnswer({
                          ...structuredValue,
                          shared_arrears: {
                            ...structuredValue.shared_arrears,
                            period: e.target.value
                          }
                        })}
                        className="w-full p-2 border border-blue-300 rounded-lg"
                        placeholder="e.g., October 2025 – December 2025"
                        disabled={loading}
                      />
                      <p className="text-xs text-blue-700 mt-1">
                        Example formats: "Oct-Dec 2025", "1 October 2025 to 31 December 2025"
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual ground panels */}
              {groundIds.map((groundId: string) => {
                // Extract ground number for display
                const groundNum = groundId.replace('ground_', '').toUpperCase();

                // Find ground metadata and format title using shared helper
                const titleInfo = formatGroundTitle(groundNum, availableGrounds);

                // Get current particulars for this ground
                const groundParticulars = structuredValue[groundId] || {};

                // Determine if this is an arrears ground
                const isArrearsGround = groundId === 'ground_8' || groundId === 'ground_10' || groundId === 'ground_11';

                return (
                  <div
                    key={groundId}
                    className="p-4 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>
                        Ground {titleInfo.groundNum}
                        {titleInfo.name && ` – ${titleInfo.name}`}
                      </span>
                      {titleInfo.type && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getGroundTypeBadgeClasses(titleInfo.type)}`}>
                          {titleInfo.type === 'mandatory' ? 'Mandatory' : 'Discretionary'}
                        </span>
                      )}
                    </h3>

                    {/* Show shared arrears summary for arrears grounds */}
                    {isArrearsGround && structuredValue.shared_arrears && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Shared Arrears Information:</p>
                        <p className="text-sm text-blue-800">
                          <strong>Amount owed:</strong> £{structuredValue.shared_arrears.amount || '0'}
                        </p>
                        <p className="text-sm text-blue-800">
                          <strong>Period:</strong> {structuredValue.shared_arrears.period || 'Not specified'}
                        </p>
                        <p className="text-xs text-blue-700 mt-1 italic">
                          This information applies to all arrears-related grounds (8, 10, 11).
                          You can edit it in the shared arrears section above.
                        </p>
                      </div>
                    )}

                    {/* Factual summary (required for all grounds) */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Factual summary <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-600 mb-2">
                        Provide specific details for Ground {groundNum}. Include dates, incidents, and factual evidence.
                      </p>
                    <textarea
                      value={groundParticulars.summary || ''}
                      onChange={(e) => setCurrentAnswer({
                        ...structuredValue,
                        [groundId]: { ...groundParticulars, summary: e.target.value }
                      })}
                      onFocus={() => setActiveTextFieldPath(`${groundId}.summary`)}
                      className="w-full p-2 border border-gray-300 rounded-lg min-h-[100px]"
                      placeholder="Provide specific dates, incidents, and factual details..."
                      disabled={loading}
                      rows={4}
                    />
                    <div className="mt-2 flex justify-end">
                      <AskHeavenPanel
                        caseId={caseId}
                        caseType={caseType}
                        jurisdiction={jurisdiction || 'england'}
                        product={product}
                        currentQuestionId={currentQuestion.id}
                        currentQuestionText={currentQuestion.question}
                        currentAnswer={groundParticulars.summary || ''}
                        variant="inline"
                        onImproveClick={() => setActiveTextFieldPath(`${groundId}.summary`)}
                        onApplySuggestion={handleApplySuggestion}
                      />
                    </div>
                  </div>

                  {/* Evidence available */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evidence available
                      </label>
                      <input
                        type="text"
                        value={groundParticulars.evidence || ''}
                        onChange={(e) => setCurrentAnswer({
                          ...structuredValue,
                          [groundId]: { ...groundParticulars, evidence: e.target.value }
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="e.g., rent schedule, photographs, witness statements"
                        disabled={loading}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-500 italic mt-2">
                Each selected ground must have a factual summary to continue.
              </p>
            </div>
          );
        }

        // Default textarea rendering
        return (
          <div className="space-y-2">
            <textarea
              value={value}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onFocus={() => setActiveTextFieldPath(currentQuestion.id)}
              placeholder={currentQuestion.placeholder}
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
              rows={4}
            />
            <div className="flex justify-end">
              <AskHeavenPanel
                caseId={caseId}
                caseType={caseType}
                jurisdiction={jurisdiction || 'england'}
                product={product}
                currentQuestionId={currentQuestion.id}
                currentQuestionText={currentQuestion.question}
                currentAnswer={typeof value === 'string' ? value : ''}
                variant="inline"
                onImproveClick={() => setActiveTextFieldPath(currentQuestion.id)}
                onApplySuggestion={handleApplySuggestion}
              />
            </div>
          </div>
        );
      }

      case 'upload':
      case 'file_upload':
        return (
          <UploadField
            caseId={caseId}
            questionId={currentQuestion.id}
            // Some MQS questions include a separate label, but it's not in the TS type.
            // Fall back to the main question text when label is missing.
            label={(currentQuestion as any).label ?? currentQuestion.question}
            description={currentQuestion.helperText}
            // Use label as the evidence category tag if present
            evidenceCategory={(currentQuestion as any).label}
            required={!!currentQuestion.validation?.required}
            disabled={loading}
            value={uploadFilesForCurrentQuestion}
            onChange={(files) => {
              setUploadFilesForCurrentQuestion(files);
              setCurrentAnswer({
                uploaded_document_ids: files.map((file) => file.documentId),
                file_count: files.length,
              });
            }}
            onUploadingChange={(state) => setUploadingEvidence(state)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            min={currentQuestion.validation?.min}
            max={currentQuestion.validation?.max}
            disabled={loading}
          />
        );

      case 'group':
        // Render multiple fields in a grouped layout
        if (!currentQuestion.fields) return null;

        const groupValue = currentAnswer || {};

        return (
          <div className="flex flex-wrap gap-4">
            {currentQuestion.fields.map((field) => {
              // Check conditional logic (dependsOn)
              if ((field as any).dependsOn) {
                const dep = (field as any).dependsOn;
                const depValue = groupValue[dep.questionId];

                // Handle array values (multi-select)
                if (Array.isArray(dep.value)) {
                  if (Array.isArray(depValue)) {
                    const hasMatch = depValue.some((val: any) => dep.value.includes(val));
                    if (!hasMatch) return null;
                  } else if (!dep.value.includes(depValue)) {
                    return null;
                  }
                } else {
                  // dep.value is scalar
                  if (Array.isArray(depValue)) {
                    // But user's answer is array (multi-select): check if it includes the scalar value
                    if (!depValue.includes(dep.value)) return null;
                  } else if (depValue !== dep.value) {
                    return null;
                  }
                }
              }

              const fieldValue = groupValue[field.id] ?? '';
              const widthClass =
                field.width === 'full'
                  ? 'w-full'
                  : field.width === 'half'
                  ? 'w-full md:w-[calc(50%-0.5rem)]'
                  : 'w-full md:w-[calc(33.333%-0.5rem)]';

              return (
                <div key={field.id} className={widthClass}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.validation?.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {(field as any).helperText && (
                    <p className="text-sm text-gray-600 mb-2">{(field as any).helperText}</p>
                  )}
                  {field.inputType === 'yes_no' ? (
                    <div className="flex gap-4">
                      <Button
                        onClick={() =>
                          setCurrentAnswer({
                            ...groupValue,
                            [field.id]: true,
                          })
                        }
                        variant={fieldValue === true ? 'primary' : 'secondary'}
                        disabled={loading}
                        type="button"
                      >
                        Yes
                      </Button>
                      <Button
                        onClick={() =>
                          setCurrentAnswer({
                            ...groupValue,
                            [field.id]: false,
                          })
                        }
                        variant={fieldValue === false ? 'primary' : 'secondary'}
                        disabled={loading}
                        type="button"
                      >
                        No
                      </Button>
                    </div>
                  ) : field.inputType === 'select' ? (
                    <select
                      value={fieldValue}
                      onChange={(e) =>
                        setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="">-- Select --</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.inputType === 'currency' ? (
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">£</span>
                      <Input
                        type="number"
                        value={fieldValue}
                        onChange={(e) =>
                          setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                        }
                        placeholder={field.placeholder}
                        className="pl-8 w-full"
                        min={field.validation?.min}
                        max={field.validation?.max}
                        disabled={loading}
                      />
                    </div>
                  ) : field.inputType === 'textarea' ? (
                    <div className="space-y-2">
                      <textarea
                        value={fieldValue}
                        onChange={(e) =>
                          setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                        }
                        onFocus={() =>
                          setActiveTextFieldPath(
                            (field.maps_to && field.maps_to[0]) || field.id,
                          )
                        }
                        placeholder={field.placeholder}
                        disabled={loading}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-20"
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <AskHeavenPanel
                          caseId={caseId}
                          caseType={caseType}
                          jurisdiction={jurisdiction || 'england'}
                          product={product}
                          currentQuestionId={currentQuestion.id}
                          currentQuestionText={currentQuestion.question}
                          currentAnswer={fieldValue || ''}
                          variant="inline"
                          onImproveClick={() =>
                            setActiveTextFieldPath(
                              (field.maps_to && field.maps_to[0]) || field.id,
                            )
                          }
                          onApplySuggestion={handleApplySuggestion}
                        />
                      </div>
                    </div>
                  ) : field.id === 'notice_expiry_date' && currentQuestion.id === 'notice_service' ? (
                    // ====================================================================================
                    // SPECIAL HANDLING: Notice expiry date with auto-calc and override (Task B)
                    // ====================================================================================
                    <div className="space-y-3">
                      {/* Show calculated date if available and override is OFF */}
                      {calculatedDate && !expiryDateOverride && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-blue-900">
                              Auto-calculated: {new Date(calculatedDate.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs text-blue-700">
                            Based on your grounds and service date ({calculatedDate.notice_period_days} days notice)
                          </p>
                        </div>
                      )}

                      {/* Override toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={expiryDateOverride}
                          onChange={(e) => {
                            const isOverriding = e.target.checked;
                            setExpiryDateOverride(isOverriding);

                            // If turning off override, clear the manual value and use calculated date
                            if (!isOverriding && calculatedDate) {
                              setCurrentAnswer({
                                ...groupValue,
                                [field.id]: calculatedDate.date
                              });
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-700">
                          Override expiry date (advanced)
                        </span>
                      </label>

                      {/* Editable input when override is ON */}
                      {expiryDateOverride && (
                        <div>
                          <Input
                            type="date"
                            value={fieldValue}
                            onChange={(e) =>
                              setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                            }
                            placeholder={field.placeholder}
                            disabled={loading}
                            className="w-full"
                          />
                          <p className="text-xs text-yellow-600 mt-1">
                            ⚠️ Ensure the date complies with statutory notice period requirements
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Input
                      type={field.inputType}
                      value={fieldValue}
                      onChange={(e) =>
                        setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="w-full"
                      min={field.validation?.min}
                      max={field.validation?.max}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );

      case 'info':
        // Render read-only informational content
        const content = (currentQuestion as any).content || '';
        return (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm text-blue-700 whitespace-pre-wrap">{content}</div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
          />
        );
    }
  };

  // ------------------------------
  // Upload / navigation helpers
  // ------------------------------
  const isUploadQuestion =
    currentQuestion?.inputType === 'upload' || currentQuestion?.inputType === 'file_upload';
  const isInfoQuestion = currentQuestion?.inputType === 'info';
  const uploadRequiredMissing = !!(
    isUploadQuestion &&
    currentQuestion?.validation?.required &&
    uploadFilesForCurrentQuestion.length === 0
  );
  const disableNextButton =
    loading ||
    uploadingEvidence ||
    uploadRequiredMissing ||
    (!isUploadQuestion && !isInfoQuestion && (currentAnswer === null || currentAnswer === undefined));

  // ------------------------------
  // Intro + completion states
  // ------------------------------

  if (showIntro) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="p-8">
          <p className="text-sm uppercase tracking-wide text-primary font-semibold mb-2">
            Welcome
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Hi! I&apos;m here to help you recover money owed by creating a money claim pack for{' '}
            {getJurisdictionName()}.
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            I&apos;ll gather the details of what you&apos;re owed, then prepare all the forms and
            guidance you need. When you&apos;re ready, continue below and we&apos;ll start with the
            first question.
          </p>
          <Button onClick={handleIntroContinue} variant="primary" size="large" className="w-full md:w-auto">
            Continue →
          </Button>
        </Card>
      </div>
    );
  }

  if (isComplete && mode === 'edit') {
    // Determine if there are blocking issues that prevent regeneration
    const canRegenerate = !hasBlockingIssues && previewBlockingIssues.length === 0;
    const totalIssues = previewBlockingIssues.length;
    const totalWarnings = previewWarnings.length;

    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card className="p-8 space-y-4">
          {/* Show blocking issues banner if any exist */}
          {!canRegenerate && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg mb-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-1">
                    {totalIssues} Blocking {totalIssues === 1 ? 'Issue' : 'Issues'} Must Be Fixed
                  </h3>
                  <p className="text-sm text-red-800 mb-3">
                    You cannot regenerate the preview until these issues are resolved.
                  </p>
                  <div className="space-y-2">
                    {previewBlockingIssues.map((issue, index) => (
                      <div key={`${issue.code}-${index}`} className="bg-white border border-red-200 rounded p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm text-gray-900 flex-1">
                            {issue.user_fix_hint || issue.user_message || `Missing: ${issue.fields.join(', ')}`}
                          </p>
                          {issue.affected_question_id && (
                            <Button
                              onClick={() => {
                                // Navigate back to the question to fix
                                const url = new URL(window.location.href);
                                url.searchParams.set('jump_to', issue.affected_question_id || '');
                                url.searchParams.set('mode', 'edit');
                                window.location.href = url.toString();
                              }}
                              variant="primary"
                              size="small"
                            >
                              Go to question →
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show warnings if any exist */}
          {totalWarnings > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4">
              <div className="flex items-start gap-3">
                <div className="text-xl">⚡</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                    {totalWarnings} {totalWarnings === 1 ? 'Warning' : 'Warnings'}
                  </h3>
                  <div className="space-y-1">
                    {previewWarnings.slice(0, 3).map((warning, index) => (
                      <p key={`${warning.code}-${index}`} className="text-sm text-yellow-800">
                        • {warning.user_fix_hint || warning.user_message || `Warning: ${warning.fields.join(', ')}`}
                      </p>
                    ))}
                    {totalWarnings > 3 && (
                      <p className="text-sm text-yellow-700 italic">
                        + {totalWarnings - 3} more warning{totalWarnings - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${canRegenerate ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} rounded-full flex items-center justify-center text-xl`}>
              {canRegenerate ? '✓' : '!'}
            </div>
            <div>
              <p className={`text-sm uppercase tracking-wide ${canRegenerate ? 'text-green-700' : 'text-amber-700'} font-semibold mb-1`}>
                {canRegenerate ? 'Review complete' : 'Review complete - Issues found'}
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {canRegenerate ? 'Your answers have been updated' : 'Please fix the issues above'}
              </h2>
            </div>
          </div>

          <p className="text-gray-700">
            {canRegenerate
              ? 'All answers have been reviewed. Choose whether to regenerate your preview now or just save your changes.'
              : 'You have reviewed all questions, but there are blocking issues that must be fixed before you can regenerate the preview.'
            }
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => void handleComplete({ redirect: true })}
              variant="primary"
              size="large"
              disabled={!canRegenerate}
              className={!canRegenerate ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {canRegenerate ? 'Regenerate preview' : 'Fix issues to regenerate'}
            </Button>
            <Button onClick={() => void handleComplete({ redirect: false })} variant="secondary" size="large">
              Save and exit
            </Button>
          </div>

          <p className="text-sm text-gray-500">Reviewed steps: {reviewStepIndex}</p>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    // Ask Heaven-branded loading modal for Complete Pack
    if (product === 'complete_pack') {
      const [currentStep, setCurrentStep] = useState(0);

      const steps = [
        'Ask Heaven Drafting Witness Statement',
        'Ask Heaven Analyzing Compliance',
        'Ask Heaven Calculating Risk Assessment',
        'Filling Official Court Forms',
      ];

      // Auto-advance through steps
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentStep((prev) => {
            if (prev < steps.length - 1) {
              return prev + 1;
            }
            return prev;
          });
        }, 1500); // Change step every 1.5 seconds

        return () => clearInterval(interval);
      }, []);

      return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">☁️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ask Heaven is Preparing Your Pack
              </h2>
              <p className="text-gray-600">
                Creating your complete eviction documentation...
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3 mb-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    index === currentStep
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : index < currentStep
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  {index < currentStep ? (
                    <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : index === currentStep ? (
                    <div className="flex-shrink-0 w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      index === currentStep
                        ? 'text-purple-900'
                        : index < currentStep
                        ? 'text-green-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Did You Know Tip */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-1">💡 Did you know?</p>
              <p className="text-sm text-blue-800">
                Ask Heaven-drafted witness statements typically save landlords{' '}
                <span className="font-bold">£200-500</span> in solicitor fees while ensuring
                legal compliance.
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Simple completion for other products
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Wizard Complete!</h2>
        <p className="text-gray-600">Redirecting to preview...</p>
      </div>
    );
  }

  // ====================================================================================
  // PHASE 2: PRE-STEP LOCATION GATE
  // ====================================================================================
  // This gate should only show if jurisdiction somehow got through as null
  // In normal flow, jurisdiction should already be set to 'england' or 'wales'
  if (!mqsLocked && !selectedLocation && !jurisdiction) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Property Location</h2>
          <p className="text-gray-700 mb-6">
            England and Wales have different legal frameworks for evictions. Select your property location to continue.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => void loadWizardWithMQS('england')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="font-bold text-lg mb-1">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</div>
              <div className="text-sm text-gray-600 mb-2">Housing Act 1988</div>
              <div className="text-xs text-gray-500">
                • Section 21 (no-fault) + Section 8 (grounds-based)
                <br />• Assured Shorthold Tenancies (ASTs)
              </div>
            </button>

            <button
              onClick={() => void loadWizardWithMQS('wales')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all text-left"
            >
              <div className="font-bold text-lg mb-1">🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales</div>
              <div className="text-sm text-gray-600 mb-2">Renting Homes (Wales) Act 2016</div>
              <div className="text-xs text-gray-500">
                • Section 173 (no-fault) + fault-based notices
                <br />• Occupation Contracts
              </div>
            </button>
          </div>

          {loading && (
            <div className="mt-6 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 text-gray-600">Loading wizard...</span>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  // ------------------------------
  // Main layout: wizard + side panels
  // ------------------------------

  const summary = analysis?.case_summary || {};
  const readyStatus = summary.ready_for_issue;
  const missingPrereqs: string[] = summary.missing_prerequisites || [];
  const evidenceOverview = summary.evidence_overview || {};

  let readinessLabel = 'Building your case...';
  let readinessBadgeClass = 'bg-gray-100 text-gray-800';

  if (readyStatus === true) {
    readinessLabel = 'Ready to issue (subject to evidence)';
    readinessBadgeClass = 'bg-green-100 text-green-800';
  } else if (readyStatus === false) {
    readinessLabel = 'Not ready to issue yet';
    readinessBadgeClass = 'bg-amber-100 text-amber-800';
  }

  if (analysis && readyStatus == null) {
    // Fallback to simple score interpretation
    if (analysis.case_strength_score >= 80) {
      readinessLabel = 'Strong on paper – check evidence';
      readinessBadgeClass = 'bg-green-100 text-green-800';
    } else if (analysis.case_strength_score >= 50) {
      readinessLabel = 'Mixed – some gaps to fix';
      readinessBadgeClass = 'bg-amber-100 text-amber-800';
    } else {
      readinessLabel = 'Weak / incomplete information';
      readinessBadgeClass = 'bg-red-100 text-red-800';
    }
  }

  // Narrow jurisdiction for GuidanceTips to avoid TS errors with Northern Ireland
  const guidanceJurisdiction: 'england' | 'wales' | 'scotland' | undefined =
    jurisdiction === 'england' || jurisdiction === 'wales' || jurisdiction === 'scotland'
      ? jurisdiction
      : undefined;

  // ------------------------------
  // Tenancy Agreement overview data (right-hand card)
  // ------------------------------
  const jurisdictionLabel = getJurisdictionName();
  const meta = (caseFacts && caseFacts.__meta) || {};
  const productTier = (meta.product_tier || caseFacts.product_tier) as string | undefined;
  const originalProduct = meta.original_product as string | undefined;

  const tenancyTypeLabel =
    productTier ||
    (jurisdiction === 'scotland'
      ? 'Scottish Private Residential Tenancy'
      : jurisdiction === 'northern-ireland'
      ? 'Northern Ireland Private Tenancy'
      : jurisdiction === 'wales'
      ? 'Occupation Contract (Wales)'
      : 'Assured Shorthold Tenancy (AST)');

  const productLabel = (() => {
    switch (originalProduct) {
      case 'ast_standard':
        return 'Standard AST';
      case 'ast_premium':
        return 'Premium AST';
      default:
        return 'Tenancy agreement';
    }
  })();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)] gap-6 items-start">
        {/* LEFT: Wizard content */}
        <div>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{currentQuestion.section || 'Question'}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checkpoint: Blocking Issues Banner */}
          {checkpoint?.blocking_issues && checkpoint.blocking_issues.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="text-sm font-semibold text-red-900 mb-2">
                ⚠️ Route(s) Currently Blocked
              </h3>
              {checkpoint.blocking_issues.map((issue: any, i: number) => (
                <div key={i} className="text-sm text-red-800 mb-1">
                  <strong>{issue.route?.toUpperCase() || 'ISSUE'}:</strong> {issue.description}
                </div>
              ))}
            </div>
          )}

          {/* Checkpoint: Warnings Banner */}
          {checkpoint?.warnings && checkpoint.warnings.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <h3 className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Warnings</h3>
              <ul className="text-sm text-yellow-800 list-disc list-inside">
                {checkpoint.warnings.map((warning: string, i: number) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Checkpoint: Completeness Indicator */}
          {checkpoint?.completeness_hint && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-blue-900">Application Completeness</h3>
                <span className="text-lg font-bold text-blue-900">
                  {checkpoint.completeness_hint.completeness_percent}%
                </span>
              </div>
              {checkpoint.completeness_hint.missing_critical?.length > 0 && (
                <>
                  <p className="text-sm text-blue-800 mb-1">Still need:</p>
                  <ul className="text-sm text-blue-700 list-disc list-inside">
                    {checkpoint.completeness_hint.missing_critical.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Wales Section 8 Warning */}
          {jurisdiction === 'wales' &&
           caseType === 'eviction' &&
           (caseFacts.selected_notice_route === 'section_8' ||
            caseFacts.notice_type === 'section_8' ||
            currentQuestion?.section?.toLowerCase()?.includes('section 8') ||
            currentQuestion?.section?.toLowerCase()?.includes('grounds')) && (
            <div className="mb-6 p-4 bg-warning-50 border-l-4 border-warning-500 rounded">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0 mt-0.5">⚠️</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-warning-900 mb-1">
                    Wales: Section 8 Terminology Warning
                  </h4>
                  <p className="text-sm text-warning-800 mb-2">
                    "Section 8" applies to England only (Housing Act 1988).
                    Wales uses Renting Homes (Wales) Act 2016 with different grounds and notice types.
                  </p>
                  <p className="text-sm text-warning-800 font-medium">
                    <strong>Documents generated may not be valid in Wales.</strong>
                    We strongly recommend consulting a Welsh property law solicitor.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Question Card */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.question}</h2>

            {currentQuestion.helperText && (
              <p className="text-sm text-gray-600 mb-6">{currentQuestion.helperText}</p>
            )}

            <div className="mb-6">{renderInput()}</div>

            {stepFlags && (
              <div className="mb-6 space-y-3">
                {stepFlags.route_hint && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                    <p className="font-semibold">Route hint</p>
                    <p className="text-blue-800">
                      {stepFlags.route_hint.recommended.toUpperCase()} – {stepFlags.route_hint.reason}
                    </p>
                  </div>
                )}

                {stepFlags.missing_critical && stepFlags.missing_critical.length > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                    <p className="font-semibold mb-1">Critical blockers</p>
                    <ul className="list-disc list-inside space-y-1">
                      {stepFlags.missing_critical.map((item, idx) => (
                        <li key={`crit-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {stepFlags.inconsistencies && stepFlags.inconsistencies.length > 0 && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    <p className="font-semibold mb-1">Possible inconsistencies</p>
                    <ul className="list-disc list-inside space-y-1">
                      {stepFlags.inconsistencies.map((item, idx) => (
                        <li key={`inc-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {stepFlags.recommended_uploads && stepFlags.recommended_uploads.length > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                    <p className="font-semibold mb-1">Recommended uploads</p>
                    <ul className="list-disc list-inside space-y-1">
                      {stepFlags.recommended_uploads.map((item, idx) => (
                        <li key={`up-${idx}`}>
                          <span className="font-medium">{item.type}:</span> {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {stepFlags.compliance_hints && stepFlags.compliance_hints.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900">
                    <p className="font-semibold mb-1">Compliance hints</p>
                    <ul className="list-disc list-inside space-y-1">
                      {stepFlags.compliance_hints.map((item, idx) => (
                        <li key={`comp-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Contextual guidance helper – eviction, money claim, tenancy */}
            <GuidanceTips
              questionId={currentQuestion.id}
              jurisdiction={guidanceJurisdiction}
              caseType={caseType}
            />

            {/* Ask Heaven Suggestion (backend-driven) */}
            {askHeavenSuggestion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-sm font-semibold">💡 Suggestion:</div>
                  <p className="text-sm text-blue-800 flex-1">{askHeavenSuggestion}</p>
                </div>
              </div>
            )}

            {/* Rich Ask Heaven breakdown from backend */}
            {askHeavenResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  Ask Heaven checks (not legal advice):
                </p>
                {askHeavenResult.suggested_wording && (
                  <p className="text-sm text-blue-800 whitespace-pre-wrap mb-2">
                    {askHeavenResult.suggested_wording}
                  </p>
                )}
                {askHeavenResult.missing_information?.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-yellow-800">Missing information</p>
                    <ul className="list-disc list-inside text-xs text-yellow-800">
                      {askHeavenResult.missing_information.map((item, idx) => (
                        <li key={`missing-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {askHeavenResult.evidence_suggestions?.length > 0 && (
                  <div className="mb-1">
                    <p className="text-xs font-semibold text-green-800">Evidence to gather</p>
                    <ul className="list-disc list-inside text-xs text-green-800">
                      {askHeavenResult.evidence_suggestions.map((item, idx) => (
                        <li key={`evidence-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(askHeavenResult.consistency_flags) &&
                  askHeavenResult.consistency_flags.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs font-semibold text-red-800">Consistency issues</p>
                      <ul className="list-disc list-inside text-xs text-red-800">
                        {askHeavenResult.consistency_flags.map((item, idx) => (
                          <li key={`flag-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Notice Compliance Error Panel */}
            {noticeComplianceError && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-5 mb-6 shadow-md">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl flex-shrink-0">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-900 mb-1">
                      Notice May Be Non-Compliant
                    </h3>
                    <p className="text-sm text-orange-800">
                      We've detected potential compliance issues with this notice. Please review and fix the
                      issues below before continuing.
                    </p>
                  </div>
                </div>

                {/* Blocking Issues */}
                {noticeComplianceError.failures.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center gap-2">
                      <span>🚫</span>
                      Blocking Issues (must fix to continue):
                    </h4>
                    <div className="space-y-2">
                      {noticeComplianceError.failures.map((failure, idx) => (
                        <div key={idx} className="bg-white border border-red-300 rounded-lg p-3">
                          <p className="text-xs font-semibold text-red-900 mb-1">
                            {failure.code}
                          </p>
                          <p className="text-sm text-red-800 mb-2">
                            <strong>Legal Reason:</strong> {failure.legal_reason}
                          </p>
                          <p className="text-sm text-red-700">
                            <strong>How to fix:</strong> {failure.user_fix_hint}
                          </p>
                          {failure.affected_question_id && (
                            <p className="text-xs text-red-600 mt-1">
                              Affected field: {failure.affected_question_id}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {noticeComplianceError.warnings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-bold text-yellow-900 mb-2 flex items-center gap-2">
                      <span>⚠️</span>
                      Warnings (review carefully):
                    </h4>
                    <div className="space-y-2">
                      {noticeComplianceError.warnings.map((warning, idx) => (
                        <div key={idx} className="bg-white border border-yellow-300 rounded-lg p-3">
                          <p className="text-xs font-semibold text-yellow-900 mb-1">
                            {warning.code}
                          </p>
                          <p className="text-sm text-yellow-800 mb-2">
                            <strong>Legal Reason:</strong> {warning.legal_reason}
                          </p>
                          <p className="text-sm text-yellow-700">
                            <strong>Recommendation:</strong> {warning.user_fix_hint}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <strong>Next step:</strong> Update your answers above to resolve the blocking issues.
                    Once fixed, try clicking "Next" again.
                  </p>
                </div>
              </div>
            )}

            {depositWarning && (
              <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-900 font-medium">{depositWarning}</p>
              </div>
            )}

            {epcWarning && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-900 font-medium">{epcWarning}</p>
              </div>
            )}

            {astSuitabilityWarning && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-900 font-medium">{astSuitabilityWarning}</p>
              </div>
            )}

            {/* Past service date warning */}
            {pastServiceDateWarning && currentQuestion?.id === 'notice_service' && (
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📅</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">Past Service Date</p>
                    <p className="text-sm text-amber-800">{pastServiceDateWarning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================================
                INLINE VALIDATION ISSUES - PER-STEP WARNINGS (ALL MODES)
                ============================================================================
                Display blocking issues and warnings that match the current question.
                This surfaces compliance issues early across ALL notice-only wizards.
                Key UX: Never block navigation - only warn early and persistently.

                UX Rules:
                - Show only AFTER user saves a step (issues are now filtered in API)
                - Use friendly action phrases instead of raw fact keys
                - Include "Why?" expandable with legal reason
            */}
            {(() => {
              // Filter issues that match the current question
              const currentQuestionId = currentQuestion?.id;
              const currentFields = currentQuestion?.maps_to || [currentQuestionId];

              // Match issues to current question by affected_question_id or fields
              const matchingBlockingIssues = previewBlockingIssues.filter(issue =>
                issue.affected_question_id === currentQuestionId ||
                issue.alternate_question_ids?.includes(currentQuestionId || '') ||
                issue.fields?.some(field => currentFields?.includes(field))
              );

              const matchingWarnings = previewWarnings.filter(issue =>
                issue.affected_question_id === currentQuestionId ||
                issue.alternate_question_ids?.includes(currentQuestionId || '') ||
                issue.fields?.some(field => currentFields?.includes(field))
              );

              return (
                <>
                  {/* Inline blocking issues for current step */}
                  {matchingBlockingIssues.length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">📋</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900 mb-1">
                            Fix {matchingBlockingIssues.length === 1 ? 'this' : 'these'} before generating your notice
                          </p>
                          <ul className="text-sm text-red-700 space-y-2 mt-2">
                            {matchingBlockingIssues.map((issue, i) => (
                              <li key={`block-${issue.code}-${i}`} className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <div className="flex-1">
                                  <span className="font-medium">
                                    {(issue as any).friendlyAction || issue.user_fix_hint || issue.user_message}
                                  </span>
                                  {issue.legal_reason && (
                                    <details className="mt-1">
                                      <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                                        Why?
                                      </summary>
                                      <p className="text-xs text-red-600 mt-1 pl-2 border-l-2 border-red-200">
                                        {issue.legal_reason}
                                      </p>
                                    </details>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline warnings for current step */}
                  {matchingWarnings.length > 0 && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-lg">💡</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 mb-1">
                            {matchingWarnings.length === 1 ? 'Recommendation' : 'Recommendations'}
                          </p>
                          <ul className="text-sm text-amber-700 space-y-1 mt-2">
                            {matchingWarnings.map((issue, i) => (
                              <li key={`warn-${issue.code}-${i}`} className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                <span>
                                  {(issue as any).friendlyAction || issue.user_fix_hint || issue.user_message}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Navigation */}
            <div className="flex gap-4">
              {questionHistory.length > 0 && (
                <Button onClick={handleBack} variant="secondary" size="large" disabled={loading}>
                  ← Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                variant="primary"
                size="large"
                className="flex-1"
                disabled={disableNextButton}
              >
                {loading ? 'Saving...' : 'Next →'}
              </Button>
            </div>
          </Card>

        </div>

        {/* RIGHT: Side panels – case-specific widgets */}
        <aside className="space-y-4">
          {/* ============================================================================
              PERSISTENT ISSUES SUMMARY PANEL (ALL MODES)
              ============================================================================
              Displays a compact summary of all blocking issues and warnings.
              Users can click issues to jump to the relevant question.
              Visible whenever there are any issues detected.

              UX Rules:
              - Title: "Fix before generating notice" (not "Compliance Issues")
              - Sections: "Will block preview" (blocking), "Warnings" (non-blocking)
              - User-friendly wording with friendly labels
              - "Why?" expandable section with legal reason
              - "Go to: [Question Label]" with friendly names
          */}
          {(issueCounts.blocking > 0 || issueCounts.warnings > 0) && caseType === 'eviction' && (
            <div className="hidden lg:block sticky top-4 z-10 mb-4">
              <Card className={`p-4 ${issueCounts.blocking > 0 ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  {issueCounts.blocking > 0 ? '📋' : '⚠️'}
                  Fix before generating notice
                </h3>

                {/* Will block preview section */}
                {issueCounts.blocking > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between p-2 bg-red-100 rounded mb-2">
                      <span className="text-sm font-medium text-red-900">
                        Will block preview
                      </span>
                      <span className="text-sm font-bold text-red-600 bg-red-200 px-2 py-0.5 rounded-full">
                        {issueCounts.blocking}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {previewBlockingIssues.slice(0, 3).map((issue, i) => (
                        <div
                          key={`summary-block-${issue.code}-${i}`}
                          className="text-xs p-2 bg-white rounded border border-red-200"
                        >
                          <p className="text-red-800 font-medium">
                            {(issue as any).friendlyAction || issue.user_fix_hint || issue.user_message}
                          </p>
                          {issue.legal_reason && (
                            <details className="mt-1">
                              <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                                Why?
                              </summary>
                              <p className="text-xs text-red-700 mt-1 pl-2 border-l-2 border-red-200">
                                {issue.legal_reason}
                              </p>
                            </details>
                          )}
                          {issue.affected_question_id && (
                            <button
                              type="button"
                              onClick={() => void jumpToQuestion(issue.affected_question_id!)}
                              disabled={loading}
                              className="mt-1 text-xs text-red-600 hover:text-red-800 hover:underline"
                            >
                              → Go to: {(issue as any).friendlyQuestionLabel || issue.affected_question_id.replace(/_/g, ' ')}
                            </button>
                          )}
                        </div>
                      ))}
                      {previewBlockingIssues.length > 3 && (
                        <p className="text-xs text-red-600 italic">
                          + {previewBlockingIssues.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Warnings section */}
                {issueCounts.warnings > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between p-2 bg-amber-100 rounded mb-2">
                      <span className="text-sm font-medium text-amber-900">
                        Warnings
                      </span>
                      <span className="text-sm font-bold text-amber-600 bg-amber-200 px-2 py-0.5 rounded-full">
                        {issueCounts.warnings}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {previewWarnings.slice(0, 2).map((issue, i) => (
                        <div
                          key={`summary-warn-${issue.code}-${i}`}
                          className="text-xs p-2 bg-white rounded border border-amber-200"
                        >
                          <p className="text-amber-800">
                            {(issue as any).friendlyAction || issue.user_fix_hint || issue.user_message}
                          </p>
                          {issue.affected_question_id && (
                            <button
                              type="button"
                              onClick={() => void jumpToQuestion(issue.affected_question_id!)}
                              disabled={loading}
                              className="mt-1 text-xs text-amber-600 hover:text-amber-800 hover:underline"
                            >
                              → Go to: {(issue as any).friendlyQuestionLabel || issue.affected_question_id.replace(/_/g, ' ')}
                            </button>
                          )}
                        </div>
                      ))}
                      {previewWarnings.length > 2 && (
                        <p className="text-xs text-amber-600 italic">
                          + {previewWarnings.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Info message */}
                <div className="p-2 bg-gray-100 rounded">
                  <p className="text-xs text-gray-700">
                    {issueCounts.blocking > 0
                      ? 'You can continue through the wizard. Fix these before generating your preview.'
                      : 'These are recommended but not required.'}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Smart Guidance panels for Notice Only (eviction) - sticky sidebar */}
          {caseType === 'eviction' && product === 'notice_only' && (
            <div className="hidden lg:block sticky top-32 space-y-4">
              {/* Placeholder panel when no Smart Guidance data exists yet */}
              {!routeRecommendation && !groundRecommendations && !calculatedDate && (
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
                  <div className="text-center mb-4">
                    <div className="text-5xl mb-3">☁️</div>
                    <h3 className="text-lg font-bold text-purple-900 mb-2">
                      Smart Guidance
                    </h3>
                    <p className="text-sm text-purple-800 mb-4">
                      AI-powered legal guidance will appear here as you answer questions
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl">💡</div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-900">Route Recommendation</p>
                        <p className="text-xs text-blue-700">
                          We'll analyze your compliance and recommend Section 8 or Section 21
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <div className="text-2xl">⚖️</div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-green-900">Ground Recommendations</p>
                        <p className="text-xs text-green-700">
                          We'll suggest the strongest legal grounds for your case
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                      <div className="text-2xl">📅</div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-purple-900">Auto-calculated Dates</p>
                        <p className="text-xs text-purple-700">
                          We'll calculate the earliest valid notice expiry date
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-300">
                    <p className="text-xs text-purple-900 text-center">
                      <strong>💎 Smart Guidance is included</strong> with your Notice Only pack
                    </p>
                  </div>
                </Card>
              )}

              {/* ROUTE RECOMMENDATION PANEL */}
              {routeRecommendation && (
                <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-600 rounded-r-lg shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">💡</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 text-base mb-2">
                        Smart Route Recommendation
                      </h3>

                      <div className="bg-white rounded-lg p-3 mb-3 border border-blue-200">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          We recommend:{' '}
                          <span className="text-blue-600">
                            {routeRecommendation.recommended_route === 'section_8'
                              ? 'Section 8 (Fault-Based)'
                              : routeRecommendation.recommended_route === 'section_21'
                              ? 'Section 21 (No-Fault)'
                              : 'Notice to Leave'}
                          </span>
                        </p>
                        <p className="text-xs text-blue-800">{routeRecommendation.reasoning}</p>
                      </div>

                      {routeRecommendation.blocking_issues.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3">
                          <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2 text-xs">
                            <span className="text-lg">⚠️</span>
                            Compliance Issues
                          </p>
                          <div className="space-y-2">
                            {routeRecommendation.blocking_issues.slice(0, 2).map((issue, i) => (
                              <div key={i} className="bg-white rounded p-2">
                                <p className="font-semibold text-gray-900 text-xs">
                                  {issue.route === 'section_21' ? 'Section 21' : issue.route} blocked:
                                </p>
                                <p className="text-gray-700 text-xs mt-1">
                                  {issue.description}
                                </p>
                                <p className="text-gray-600 text-xs mt-1">
                                  <strong>Action:</strong> {issue.action_required}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-1">Why this matters:</p>
                        <ul className="text-xs text-blue-800 space-y-0.5">
                          <li>✓ Ensures legal validity</li>
                          <li>✓ Reduces court rejection risk</li>
                          <li>✓ Saves time and money</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GROUND RECOMMENDATIONS PANEL */}
              {groundRecommendations && groundRecommendations.length > 0 && (
                <div className="p-5 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-600 rounded-r-lg shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">⚖️</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-green-900 text-base mb-2">
                        Recommended Grounds
                      </h3>
                      <p className="text-xs text-green-800 mb-3">
                        Based on your situation, we recommend:
                      </p>

                      <div className="space-y-2">
                        {groundRecommendations.slice(0, 3).map((ground) => (
                          <div key={ground.code} className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex items-start justify-between mb-1">
                              <div className="font-semibold text-green-900 text-xs flex-1">
                                Ground {ground.code}: {ground.title}
                              </div>
                              {ground.type === 'mandatory' && (
                                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-bold ml-2 flex-shrink-0">
                                  MANDATORY
                                </span>
                              )}
                            </div>

                            <p className="text-green-800 text-xs mb-2">{ground.reasoning}</p>

                            <div className="bg-green-50 rounded p-2 text-xs">
                              <p className="text-green-700">
                                <strong>Notice period:</strong> {ground.notice_period_days} days
                              </p>
                              {ground.success_probability && (
                                <p className="text-green-700">
                                  <strong>Success rate:</strong> {ground.success_probability}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-xs text-green-800">
                          <strong>Next step:</strong> These grounds have been pre-selected. You can adjust if needed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CALCULATED DATE PANEL */}
              {calculatedDate && (
                <div className="p-5 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-600 rounded-r-lg shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">📅</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-purple-900 text-base mb-2">
                        Notice Period Calculated
                      </h3>

                      <div className="bg-white rounded-lg p-4 mb-3 border border-purple-200">
                        <p className="text-xs text-purple-600 mb-1">Earliest Legal Expiry Date:</p>
                        <p className="text-2xl font-bold text-purple-900 mb-1">
                          {new Date(calculatedDate.date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-purple-700">
                          Notice Period: <strong>{calculatedDate.notice_period_days} days</strong>
                        </p>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3 mb-3 border border-purple-200">
                        <p className="font-semibold text-purple-900 mb-1 text-xs">How we calculated this:</p>
                        <p className="text-purple-800 text-xs leading-relaxed">
                          {calculatedDate.explanation}
                        </p>
                      </div>

                      {calculatedDate.warnings && calculatedDate.warnings.length > 0 && (
                        <div className="bg-yellow-50 rounded-lg p-3 mb-3 border border-yellow-300">
                          <p className="font-semibold text-yellow-900 mb-1 flex items-center gap-1 text-xs">
                            <span>⚠️</span> Important:
                          </p>
                          <ul className="text-yellow-800 text-xs space-y-0.5">
                            {calculatedDate.warnings.slice(0, 2).map((warning, i) => (
                              <li key={i}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-800">
                          <strong>Legal Basis:</strong> {calculatedDate.legal_basis}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Case health & readiness (money claims only) */}
          {caseType === 'money_claim' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">Case health &amp; readiness</h3>
                {analysis && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${readinessBadgeClass}`}
                  >
                    {readinessLabel}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">
                This is an automated readiness check based on your answers. It&apos;s guidance only
                – not legal advice.
              </p>

              {/* Score */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {analysis ? analysis.case_strength_score : '--'}
                  </span>
                  <span className="text-sm text-gray-600">/ 100 strength score</span>
                </div>
                <div className="mt-2 w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysis ? analysis.case_strength_score : 0}%` }}
                  />
                </div>
              </div>

              {/* Quick facts */}
              {summary && (
                <div className="mb-4 text-sm text-gray-700 space-y-1">
                  {typeof summary.total_arrears === 'number' && (
                    <p>
                      <span className="font-medium">Arrears entered:</span>{' '}
                      {summary.total_arrears > 0 ? `~£${summary.total_arrears}` : 'not yet provided'}
                    </p>
                  )}
                  {summary.is_money_claim && (
                    <p>
                      <span className="font-medium">Route:</span> Money claim (County Court)
                    </p>
                  )}
                  {summary.pre_action_status && (
                    <p>
                      <span className="font-medium">Pre-action:</span>{' '}
                      {summary.pre_action_status === 'complete'
                        ? 'looks complete'
                        : summary.pre_action_status === 'partial'
                        ? 'partially complete – some steps missing'
                        : 'not clearly recorded yet'}
                    </p>
                  )}
                </div>
              )}

              {/* Missing prerequisites */}
              {missingPrereqs.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    Must-have items before issuing
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {missingPrereqs.map((item: string, idx: number) => (
                      <li key={`${item}-${idx}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Evidence overview */}
              {evidenceOverview && Object.keys(evidenceOverview).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Evidence overview</h4>
                  <ul className="text-sm text-gray-700 space-y-0.5">
                    <li>
                      <span className="font-medium">Tenancy agreement:</span>{' '}
                      {evidenceOverview.tenancy_agreement_uploaded
                        ? 'uploaded / recorded'
                        : 'not uploaded yet'}
                    </li>
                    <li>
                      <span className="font-medium">Rent schedule:</span>{' '}
                      {evidenceOverview.rent_schedule_uploaded
                        ? 'uploaded / recorded'
                        : 'not uploaded yet'}
                    </li>
                    <li>
                      <span className="font-medium">Bank statements:</span>{' '}
                      {evidenceOverview.bank_statements_uploaded
                        ? 'uploaded / recorded'
                        : 'not flagged'}
                    </li>
                    <li>
                      <span className="font-medium">Other evidence:</span>{' '}
                      {evidenceOverview.other_evidence_uploaded
                        ? 'uploaded / recorded'
                        : 'not flagged'}
                    </li>
                  </ul>
                </div>
              )}

              {/* Red flags / compliance notes */}
              {analysis && (analysis.red_flags.length > 0 || analysis.compliance_issues.length > 0) && (
                <div className="mt-4 space-y-3">
                  {analysis.red_flags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-700 mb-1">Key risks</h4>
                      <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                        {analysis.red_flags.slice(0, 3).map((flag, idx) => (
                          <li key={`flag-${idx}`}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.compliance_issues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-amber-700 mb-1">
                        Housekeeping to tidy
                      </h4>
                      <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
                        {analysis.compliance_issues.slice(0, 3).map((item, idx) => (
                          <li key={`comp-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Loading / error state */}
              {!analysis && !analysisError && (
                <p className="mt-2 text-xs text-gray-500">
                  As you answer questions, we&apos;ll show how ready your claim looks to issue and
                  what still needs work.
                </p>
              )}

              {analysisLoading && (
                <p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Updating case health…
                </p>
              )}

              {analysisError && (
                <p className="mt-2 text-xs text-red-600">
                  {analysisError}
                </p>
              )}
            </Card>
          )}

          {/* Agreement overview (tenancy agreements) */}
          {caseType === 'tenancy_agreement' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Agreement overview</h3>
              <p className="text-xs text-gray-500 mb-4">
                A quick snapshot of the agreement you&apos;re building. We&apos;ll keep this in sync
                with your selections.
              </p>

              <div className="text-sm text-gray-800 space-y-1 mb-4">
                <p>
                  <span className="font-medium">Jurisdiction:</span> {jurisdictionLabel}
                </p>

                <p>
                  <span className="font-medium">Tenancy type:</span>{' '}
                  {tenancyTypeLabel}
                </p>
                <p>
                  <span className="font-medium">Product:</span> {productLabel}
                </p>
              </div>

              <div className="text-xs text-gray-700 space-y-2">
                <p>
                  You&apos;ve already chosen the product and country. The wizard will handle the
                  legal clauses, so focus on accurate facts (names, dates, rent, deposit, etc.).
                </p>
                <p>
                  You don&apos;t need everything perfect on the first pass – you can download,
                  review, and come back to tweak any answers before you sign with the tenant.
                </p>
              </div>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
};
