/**
 * Structured Wizard - MQS-Powered
 *
 * Form-based wizard using MQS backend for all products
 * Now unified with the MQS system for consistency across all wizards
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Button, Input, Card } from '@/components/ui';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';
import { GuidanceTips } from '@/components/wizard/GuidanceTips';
import { AskHeavenPanel } from '@/components/wizard/AskHeavenPanel';

interface StructuredWizardProps {
  caseId: string;
  caseType: 'eviction' | 'money_claim' | 'tenancy_agreement';
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland' | null;
  product: 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';
  initialQuestion?: ExtendedWizardQuestion | null;
  onComplete: (caseId: string) => void;
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
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<ExtendedWizardQuestion | null>(
    initialQuestion ?? null,
  );
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [askHeavenSuggestion, setAskHeavenSuggestion] = useState<string | null>(null);
  const [askHeavenResult, setAskHeavenResult] = useState<{
    suggested_wording: string;
    missing_information: string[];
    evidence_suggestions: string[];
    consistency_flags?: string[];
  } | null>(null);
  const [questionHistory, setQuestionHistory] = useState<
    Array<{ question: ExtendedWizardQuestion; answer: any }>
  >([]);
  const [depositWarning, setDepositWarning] = useState<string | null>(null);
  const [epcWarning, setEpcWarning] = useState<string | null>(null);
  const [astSuitabilityWarning, setAstSuitabilityWarning] = useState<string | null>(null);
  const [caseFacts, setCaseFacts] = useState<Record<string, any>>({});
  const [showIntro, setShowIntro] = useState(caseType === 'money_claim');

  // Step 3: money-claim case health / readiness
  const [analysis, setAnalysis] = useState<CaseAnalysisState | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Checkpoint state for live validation
  const [checkpoint, setCheckpoint] = useState<any>(null);

  const initializeQuestion = useCallback((question: ExtendedWizardQuestion) => {
    setCurrentQuestion(question);

    if (question.inputType === 'group' && question.fields) {
      const defaults: Record<string, any> = {};
      question.fields.forEach((field: any) => {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      });
      setCurrentAnswer(Object.keys(defaults).length > 0 ? defaults : null);
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
    if (jurisdiction === 'england-wales') return 'England & Wales';
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
      const response = await fetch('/api/wizard/analyze', {
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
      const response = await fetch('/api/wizard/checkpoint', {
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

  const handleComplete = useCallback(
    async () => {
      try {
        setLoading(true);

        // Final analysis before redirect (non-blocking for UX, but awaited here)
        await refreshAnalysis();

        onComplete(caseId);
      } catch (err: any) {
        setError(err.message || 'Failed to complete wizard');
        setLoading(false);
      }
    },
    [caseId, onComplete, refreshAnalysis],
  );

  const loadNextQuestion = useCallback(async () => {
    if (!caseId) return;

    setLoading(true);
    setError(null);
    setAskHeavenSuggestion(null);
    setAskHeavenResult(null);

    try {
      const response = await fetch('/api/wizard/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to load question: ${response.status}`);
      }

      const data = await response.json();

      if (data.is_complete) {
        setIsComplete(true);
        await handleComplete();
      } else if (data.next_question) {
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
  }, [caseId, handleComplete, initializeQuestion]);

  // Load first question after intro or when no initial question was provided
  useEffect(() => {
    if (initialQuestion && !currentQuestion) {
      initializeQuestion(initialQuestion);
      return;
    }

    if (!showIntro && !currentQuestion) {
      void loadNextQuestion();
    }
  }, [currentQuestion, initialQuestion, initializeQuestion, loadNextQuestion, showIntro]);

  // Fetch case facts when question changes (for validation and side panels)
  useEffect(() => {
    const fetchCaseFacts = async () => {
      try {
        const response = await fetch(`/api/cases/${caseId}`);
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
      jurisdiction === 'england-wales'
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
      jurisdiction === 'england-wales'
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

  const isCurrentAnswerValid = (): boolean => {
    if (!currentQuestion) return false;

    const resolvedInputType =
      currentQuestion.inputType === 'address' ? 'group' : currentQuestion.inputType;

    // For grouped inputs, validate all fields
    if (resolvedInputType === 'group' && currentQuestion.fields) {
      for (const field of currentQuestion.fields) {
        const fieldValue = currentAnswer?.[field.id];

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

    try {
      // Save answer to backend
      const response = await fetch('/api/wizard/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId,
          question_id: currentQuestion.id,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save answer: ${response.status}`);
      }

      const data = await response.json();

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

      // Update progress
      setProgress(data.progress || 0);

      // Save to history before moving forward
      if (currentQuestion) {
        setQuestionHistory((prev) => [...prev, { question: currentQuestion, answer: currentAnswer }]);
      }

      // After a successful save, refresh analysis for money-claims
      if (caseType === 'money_claim') {
        void refreshAnalysis();
      }

      // Check if complete
      if (data.is_complete) {
        setIsComplete(true);
        await handleComplete();
      } else {
        // Load next question
        await loadNextQuestion();
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
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- Select an option --</option>
            {currentQuestion.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

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

      case 'multi_select': {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v: string) => v !== option);
                    setCurrentAnswer(newValues);
                  }}
                  className="w-4 h-4 text-primary"
                  disabled={loading}
                />
                <span>{option}</span>
              </label>
            ))}
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

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px]"
            rows={4}
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
                } else if (depValue !== dep.value) {
                  return null;
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
                    <textarea
                      value={fieldValue}
                      onChange={(e) =>
                        setCurrentAnswer({ ...groupValue, [field.id]: e.target.value })
                      }
                      placeholder={field.placeholder}
                      disabled={loading}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent min-h-20"
                      rows={3}
                    />
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

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold mb-2">Wizard Complete!</h2>
        <p className="text-gray-600">Redirecting to preview...</p>
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
  const guidanceJurisdiction: 'england-wales' | 'scotland' | undefined =
    jurisdiction === 'england-wales' || jurisdiction === 'scotland'
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

          {/* Question Card */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.question}</h2>

            {currentQuestion.helperText && (
              <p className="text-sm text-gray-600 mb-6">{currentQuestion.helperText}</p>
            )}

            <div className="mb-6">{renderInput()}</div>

            {/* Ask Heaven Panel - inline on mobile (below the answer box) */}
            {currentQuestion.inputType === 'textarea' && (
              <div className="mb-6 lg:hidden">
                <AskHeavenPanel
                  caseId={caseId}
                  caseType={caseType}
                  jurisdiction={(jurisdiction || 'england-wales') as 'england-wales' | 'scotland' | 'northern-ireland'}
                  product={product}
                  currentQuestionId={currentQuestion.id}
                  currentQuestionText={currentQuestion.question}
                  currentAnswer={typeof currentAnswer === 'string' ? currentAnswer : null}
                />
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
                disabled={loading || currentAnswer === null || currentAnswer === undefined}
              >
                {loading ? 'Saving...' : 'Next →'}
              </Button>
            </div>
          </Card>
        </div>

        {/* RIGHT: Side panels – Ask Heaven + case-specific widgets */}
        <aside className="space-y-4">
          {/* Ask Heaven sidebar – stays in view on larger screens */}
          {currentQuestion?.inputType === 'textarea' && (
            <div className="hidden lg:block sticky top-24">
              <AskHeavenPanel
                caseId={caseId}
                caseType={caseType}
                jurisdiction={(jurisdiction || 'england-wales') as 'england-wales' | 'scotland' | 'northern-ireland'}
                product={product}
                currentQuestionId={currentQuestion.id}
                currentQuestionText={currentQuestion.question}
                currentAnswer={typeof currentAnswer === 'string' ? currentAnswer : null}
              />
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
