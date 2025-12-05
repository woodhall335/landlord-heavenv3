/**
 * Wizard Container
 *
 * Main conversational wizard - THE PRIMARY SALES FUNNEL
 * Guided fact-finding for all products (evictions, money claims, ASTs, HMO Pro)
 * Fully conversational, intelligent, complete
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import {
  MultipleChoice,
  CurrencyInput,
  DateInput,
  YesNoToggle,
  TextInput,
  MultipleSelection,
  FileUpload,
  ScaleSlider,
} from './index';
import { GuidanceTips } from './GuidanceTips';
import type { WizardQuestion as BaseWizardQuestion } from '@/lib/ai/fact-finder';

// Extend the base WizardQuestion type with optional fields that come from MQS/backend
type WizardQuestion = BaseWizardQuestion & {
  id?: string;
  question?: string;
  inputType?: string;
  type?: string;
  helper_text?: string;
  is_required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
};

// Helper function to get product display name
function getDocumentTypeName(caseType: string, product?: string): string {
  // If product parameter is provided, use it for specific naming
  if (product) {
    switch (product) {
      case 'notice_only':
        return 'Notice Only';
      case 'complete_pack':
        return 'Complete Eviction Pack';
      case 'money_claim':
      case 'money_claim_england_wales':
      case 'money_claim_scotland':
        return 'Money Claim Pack';
      case 'ast_standard':
        return 'Standard AST';
      case 'ast_premium':
        return 'Premium AST';
      default:
        break;
    }
  }

  // Fallback to case type if no product specified
  switch (caseType) {
    case 'eviction':
      return 'Eviction Pack';
    case 'money_claim':
      return 'Money Claim';
    case 'tenancy_agreement':
      return 'Tenancy Agreement';
    default:
      return 'Document';
  }
}

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface CollectedFact {
  question_id: string;
  question: string;
  answer: any;
  timestamp: Date;
}

interface WizardContainerProps {
  caseType: 'eviction' | 'money_claim' | 'tenancy_agreement';
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
  product?: string; // Specific product: notice_only, complete_pack, money_claim, ast_standard, ast_premium
  editCaseId?: string; // Optional: Case ID to edit existing answers
  onComplete: (caseId: string, analysis: any) => void;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({
  caseType,
  jurisdiction,
  product,
  editCaseId,
  onComplete,
}) => {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<WizardQuestion | null>(null);
  const [collectedFacts, setCollectedFacts] = useState<Record<string, any>>({});
  const [factsList, setFactsList] = useState<CollectedFact[]>([]);
  const [submittedQuestionIds, setSubmittedQuestionIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [askHeavenResult, setAskHeavenResult] = useState<{
    suggested_wording: string;
    missing_information: string[];
    evidence_suggestions: string[];
    consistency_flags?: string[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    const el = messagesEndRef.current;

    // In tests or odd environments, this ref may not have scrollIntoView
    if (el && typeof (el as any).scrollIntoView === 'function') {
      (el as any).scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // When the question actually changes, clear local input + Ask Heaven panel.
  useEffect(() => {
    setCurrentAnswer(null);
    setAskHeavenResult(null);
  }, [currentQuestion]);

  const addMessage = useCallback((role: 'assistant' | 'user', content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  const getWelcomeMessage = useCallback((type: string, jur: string): string => {
    const jurName =
      jur === 'england-wales'
        ? 'England & Wales'
        : jur === 'scotland'
        ? 'Scotland'
        : 'Northern Ireland';

    switch (type) {
      case 'eviction':
        return `👋 Hi! I'm here to help you create the right eviction documents for ${jurName}.\n\nI'll ask you some questions to understand your situation, then recommend the best legal route and generate court-ready documents.\n\nLet's get started...`;
      case 'money_claim':
        return `👋 Hi! I'm here to help you recover money owed by creating a money claim pack for ${jurName}.\n\nI'll gather the details of what you're owed, then prepare all the forms and guidance you need.\n\nLet's begin...`;
      case 'tenancy_agreement':
        return `👋 Hi! I'm here to help you create a professional tenancy agreement for ${jurName}.\n\nI'll ask about your property and tenancy terms, then generate a legally compliant agreement.\n\nShall we start?`;
      default:
        return "👋 Hi! Let's get started...";
    }
  }, []);

  const formatAnswerForDisplay = (answer: any, inputType: string): string => {
    switch (inputType) {
      case 'currency':
        return `£${Number(answer).toFixed(2)}`;
      case 'date':
        return String(answer);
      case 'yes_no':
        return answer === 'yes' ? 'Yes' : answer === 'no' ? 'No' : 'Not sure';
      case 'multiple_choice':
        return String(answer);
      case 'multiple_selection':
        return Array.isArray(answer) ? answer.join(', ') : String(answer);
      case 'scale_slider':
        return `Level ${answer}`;
      case 'file_upload':
        return Array.isArray(answer) ? `${answer.length} file(s) uploaded` : '1 file uploaded';
      default:
        return String(answer);
    }
  };

  const handleAnswer = async (answer: any) => {
    // Prevent duplicate submissions while loading
    if (!currentQuestion || !caseId || isLoading) return;

    const questionId = currentQuestion.question_id ?? currentQuestion.id;
    const effectiveQuestionId = questionId || currentQuestion.id || 'unknown_question';
    const questionText = currentQuestion.question_text ?? currentQuestion.question ?? '';
    const inputType: string =
      (currentQuestion.input_type as any) ??
      currentQuestion.inputType ??
      (currentQuestion.type as any) ??
      'text';

    const answerText = formatAnswerForDisplay(answer, inputType);

    // If this MQS question has already been submitted, treat any further messages for it
    // as conversational follow-ups only: show them in the chat, but DO NOT call /api/wizard/answer.
    if (submittedQuestionIds.includes(effectiveQuestionId)) {
      if (answer !== undefined && answer !== null && answer !== '') {
        addMessage('user', answerText);
        setCurrentAnswer(null);
      }
      return;
    }

    try {
      setIsLoading(true);

      // Add user's answer to messages
      addMessage('user', answerText);

      // Save answer into local facts
      const newFacts = {
        ...collectedFacts,
        [effectiveQuestionId]: answer,
      };
      setCollectedFacts(newFacts);

      // Add to facts list for sidebar
      setFactsList([
        ...factsList,
        {
          question_id: effectiveQuestionId,
          question: questionText,
          answer,
          timestamp: new Date(),
        },
      ]);

      // Save to backend
      try {
        const response = await fetch('/api/wizard/answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: caseId,
            question_id: questionId,
            answer,
            progress,
          }),
        });

        if (response && !response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to save answer');
        }

        const payload = response ? await response.json() : null;

        if (payload?.ask_heaven) {
          setAskHeavenResult(payload.ask_heaven);

          const suggestionBlocks = [
            payload.ask_heaven.suggested_wording
              ? `💡 Ask Heaven suggestion:\n${payload.ask_heaven.suggested_wording}`
              : null,
            Array.isArray(payload.ask_heaven.missing_information) &&
            payload.ask_heaven.missing_information.length > 0
              ? `Missing information:\n- ${payload.ask_heaven.missing_information.join('\n- ')}`
              : null,
            Array.isArray(payload.ask_heaven.evidence_suggestions) &&
            payload.ask_heaven.evidence_suggestions.length > 0
              ? `Evidence suggestions:\n- ${payload.ask_heaven.evidence_suggestions.join('\n- ')}`
              : null,
          ].filter(Boolean);

          if (suggestionBlocks.length > 0) {
            addMessage('assistant', suggestionBlocks.join('\n\n'));
          }
        } else {
          setAskHeavenResult(null);
        }
      } catch (error) {
        console.error('Failed to save answer:', error);
        setIsLoading(false);
        return;
      }

      // Mark this MQS question as having had its canonical answer submitted
      setSubmittedQuestionIds((prev) =>
        prev.includes(effectiveQuestionId) ? prev : [...prev, effectiveQuestionId],
      );

      // Clear current answer
      setCurrentAnswer(null);

      // Get next question (this will handle its own loading state)
      setIsLoading(false);
      await getNextQuestion(caseId, newFacts);
    } catch (error) {
      console.error('Error handling answer:', error);
      setIsLoading(false);
    }
  };

  const formatAnalysisResults = useCallback(
    (analysis: any): string => {
      let message = '✅ **Analysis Complete!**\n\n';

      if (caseType === 'eviction') {
        message += `**Recommended Route:** ${analysis.recommended_route}\n\n`;

        if (analysis.primary_grounds && analysis.primary_grounds.length > 0) {
          message += '**Strongest Grounds:**\n';
          analysis.primary_grounds.forEach((ground: any) => {
            message += `• Ground ${ground.ground_number}: ${ground.name} (${ground.success_probability}% success probability)\n`;
          });
        }

        if (analysis.red_flags && analysis.red_flags.length > 0) {
          message += '\n⚠️ **Important Warnings:**\n';
          analysis.red_flags.forEach((flag: string) => {
            message += `• ${flag}\n`;
          });
        }
      }

      message += '\n🎉 **Ready to generate your documents!**\n\nClick below to preview and purchase.';
      return message;
    },
    [caseType],
  );

  const analyzeCase = useCallback(
    async (currentCaseId: string) => {
      setIsLoading(true);

      try {
        const response = await fetch('/api/wizard/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ case_id: currentCaseId }),
        });

        const data = await response.json();

        if (data.success) {
          setProgress(100);

          // Show analysis results
          const resultsMessage = formatAnalysisResults(data.analysis);
          addMessage('assistant', resultsMessage);

          // Complete wizard
          setTimeout(() => {
            onComplete(currentCaseId, data.analysis);
          }, 2000);
        }
      } catch (error) {
        console.error('Analysis failed:', error);
        addMessage(
          'assistant',
          'I encountered an issue analyzing your case. Please contact support.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, formatAnalysisResults, onComplete],
  );

  const getNextQuestion = useCallback(
    async (currentCaseId: string, facts: Record<string, any>) => {
      setIsLoading(true);

      try {
        // Call fact-finder to get next question
        const response = await fetch('/api/wizard/next-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_id: currentCaseId,
            case_type: caseType,
            jurisdiction,
            collected_facts: facts,
          }),
        });

        const data = await response.json();

        if (data.is_complete) {
          // Wizard complete - analyze case
          setIsComplete(true);
          addMessage(
            'assistant',
            'Perfect! I have everything I need. Let me analyze your case...',
          );
          await analyzeCase(currentCaseId);
        } else if (data.next_question) {
          setAskHeavenResult(null);
          setCurrentQuestion(data.next_question as WizardQuestion);
          addMessage('assistant', data.next_question.question_text ?? data.next_question.question);

          // Update progress
          const totalQuestions = 10; // Estimate
          const answered = Object.keys(facts).length;
          setProgress(Math.min((answered / totalQuestions) * 100, 95));
        }
      } catch (error) {
        console.error('Failed to get next question:', error);
        addMessage('assistant', 'Sorry, I encountered an error. Let me try again...');
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage, analyzeCase, caseType, jurisdiction],
  );

  const hasStartedRef = useRef(false);

  const startWizard = useCallback(async () => {
    setIsLoading(true);

    try {
      // If editing, load existing case data
      if (editCaseId) {
        const caseResponse = await fetch(`/api/cases/${editCaseId}`);
        if (caseResponse.ok) {
          const caseData = await caseResponse.json();
          setCaseId(editCaseId);
          setCollectedFacts(caseData.case.collected_facts || {});

          // Calculate progress based on existing facts
          const factsCount = Object.keys(caseData.case.collected_facts || {}).length;
          setProgress(Math.min((factsCount / 15) * 100, 95));

          // Add edit message
          const editMessage: Message = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content:
              "✏️ **Editing Mode**\n\nI've loaded your previous answers. You can review and change any information. Let's continue from where you left off.",
            timestamp: new Date(),
          };
          setMessages([editMessage]);

          // Get next question
          await getNextQuestion(editCaseId, caseData.case.collected_facts || {});
        } else {
          throw new Error('Failed to load case for editing');
        }
      } else {
        // Create new case

        // Prefer the explicit product prop if provided; otherwise derive a sensible default.
        const derivedProduct =
          product ||
          (caseType === 'eviction'
            ? 'complete_pack'
            : caseType === 'money_claim'
            ? 'money_claim'
            : 'tenancy_agreement');

        const response = await fetch('/api/wizard/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product: derivedProduct, jurisdiction }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error('Failed to start wizard');
        }

        const newCaseId = data.case_id || data.case?.id;

        if (!newCaseId) {
          throw new Error('Missing case identifier from start response');
        }

        setCaseId(newCaseId);

        // Add welcome message
        const welcomeMessage: Message = {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: getWelcomeMessage(caseType, jurisdiction),
          timestamp: new Date(),
        };
        setMessages([welcomeMessage]);

        const firstQuestion = (data.next_question || data.current_question) as
          | WizardQuestion
          | undefined;

        if (firstQuestion) {
          setCurrentQuestion(firstQuestion);
          addMessage(
            'assistant',
            firstQuestion.question_text ?? firstQuestion.question ?? '',
          );
          setProgress(0);
        } else {
          await getNextQuestion(newCaseId, {});
        }
      }
    } catch (error: any) {
      console.error('Failed to start wizard:', error);

      // Show helpful error message based on error type
      if (error.message?.includes('Supabase') || error.message?.includes('URL and Key')) {
        setError('Database connection failed. Please configure Supabase credentials in .env.local');
      } else if (error.message?.includes('Unauthorized')) {
        setError('Please log in to use the wizard.');
      } else if (error.message?.includes('OpenAI')) {
        setError('Service unavailable. Please check OPENAI_API_KEY in .env.local');
      } else {
        setError('Failed to start wizard. Please check your environment configuration.');
      }

      addMessage(
        'assistant',
        'Sorry, something went wrong. Please check the error message above.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    addMessage,
    caseType,
    editCaseId,
    getNextQuestion,
    getWelcomeMessage,
    jurisdiction,
    product,
  ]);

  // Initialize wizard
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    void startWizard();
  }, [startWizard]);

  const renderInput = () => {
    if (!currentQuestion || isLoading || isComplete) return null;

    const inputType: string =
      (currentQuestion.input_type as any) ??
      currentQuestion.inputType ??
      (currentQuestion.type as any) ??
      'text';

    const props = {
      value: currentAnswer,
      onChange: setCurrentAnswer,
      disabled: false,
    };

    switch (inputType) {
      case 'multiple_choice':
        return (
          <MultipleChoice
            options={
              currentQuestion.options?.map((opt) => ({
                value: opt,
                label: opt,
              })) || []
            }
            value={currentAnswer}
            onChange={(val) => {
              setCurrentAnswer(val);
              // Auto-submit for multiple choice
              setTimeout(() => handleAnswer(val), 300);
            }}
          />
        );

      case 'currency':
        return (
          <CurrencyInput
            {...props}
            min={currentQuestion.min}
            max={currentQuestion.max}
            helperText={currentQuestion.helper_text}
            allowUnsure={true}
          />
        );

      case 'date':
        return (
          <DateInput
            {...props}
            helperText={currentQuestion.helper_text}
            allowApproximate={true}
          />
        );

      case 'yes_no':
        return <YesNoToggle {...props} helperText={currentQuestion.helper_text} />;

      case 'text':
        return (
          <TextInput
            {...props}
            value={currentAnswer || ''}
            placeholder={currentQuestion.helper_text}
            required={currentQuestion.is_required}
          />
        );

      // "textarea" is a purely UI-level hint; we still treat it as a multi-line text input.
      case 'textarea':
        return (
          <TextInput
            {...props}
            value={currentAnswer || ''}
            placeholder={currentQuestion.helper_text}
            required={currentQuestion.is_required}
            multiline
            rows={5}
          />
        );

      case 'multiple_selection':
        return (
          <MultipleSelection
            options={
              currentQuestion.options?.map((opt) => ({
                value: opt,
                label: opt,
              })) || []
            }
            value={currentAnswer || []}
            onChange={setCurrentAnswer}
          />
        );

      case 'file_upload':
        return (
          <FileUpload
            value={currentAnswer || []}
            onChange={setCurrentAnswer}
            helperText={currentQuestion.helper_text}
          />
        );

      case 'scale_slider':
        return (
          <ScaleSlider
            {...props}
            min={currentQuestion.min || 1}
            max={currentQuestion.max || 10}
            helperText={currentQuestion.helper_text}
          />
        );

      default:
        return <TextInput {...props} value={currentAnswer || ''} />;
    }
  };

  const canSubmit = () => {
    if (!currentQuestion || isLoading || isComplete) return false;
    const inputType: string =
      (currentQuestion.input_type as any) ??
      currentQuestion.inputType ??
      (currentQuestion.type as any) ??
      'text';
    if (inputType === 'multiple_choice') return false; // Auto-submits
    if (currentQuestion.is_required && !currentAnswer) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-red-600 text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-red-900 font-semibold mb-1">Configuration Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  Check the browser console for more details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Conversation (60%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Messages */}
              <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={clsx(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    <div
                      className={clsx(
                        'max-w-[80%] rounded-lg px-4 py-3',
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-charcoal',
                      )}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div
                        className={clsx(
                          'text-xs mt-1',
                          message.role === 'user'
                            ? 'text-primary-light'
                            : 'text-gray-500',
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {!isComplete && currentQuestion && (
                <div className="border-t border-gray-200 pt-6">
                  {/* Guidance Tips */}
                  <GuidanceTips
                    questionId={currentQuestion.question_id ?? currentQuestion.id ?? ''}
                    jurisdiction={jurisdiction}
                    caseType={caseType}
                  />

                  {askHeavenResult && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-blue-600">✨</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-900">
                            Ask Heaven suggestions
                          </p>
                          {askHeavenResult.suggested_wording && (
                            <p className="text-sm text-blue-800 whitespace-pre-wrap mt-1">
                              {askHeavenResult.suggested_wording}
                            </p>
                          )}
                        </div>
                      </div>

                      {askHeavenResult.missing_information?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-yellow-800">
                            Missing information
                          </p>
                          <ul className="text-xs text-yellow-800 list-disc list-inside">
                            {askHeavenResult.missing_information.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {askHeavenResult.evidence_suggestions?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-green-800">
                            Evidence to gather
                          </p>
                          <ul className="text-xs text-green-800 list-disc list-inside">
                            {askHeavenResult.evidence_suggestions.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(askHeavenResult.consistency_flags) &&
                        askHeavenResult.consistency_flags.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-red-800">
                              Consistency issues
                            </p>
                            <ul className="text-xs text-red-800 list-disc list-inside">
                              {(askHeavenResult.consistency_flags || []).map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}

                  {renderInput()}

                  {/* Submit Button (for non-auto-submit inputs) */}
                  {currentQuestion.input_type !== 'multiple_choice' && (
                    <button
                      onClick={() => handleAnswer(currentAnswer)}
                      disabled={!canSubmit()}
                      className={clsx(
                        'mt-4 w-full px-6 py-3 rounded-lg font-medium text-base transition-all duration-200',
                        'min-h-touch',
                        canSubmit()
                          ? 'bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed',
                      )}
                    >
                      Continue →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Context Panel (40%) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                📋 What we know so far
              </h3>

              <div className="space-y-3">
                {/* Jurisdiction */}
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-charcoal">Location</div>
                    <div className="text-sm text-gray-600">
                      {jurisdiction === 'england-wales'
                        ? 'England & Wales'
                        : jurisdiction === 'scotland'
                        ? 'Scotland'
                        : 'Northern Ireland'}
                    </div>
                  </div>
                </div>

                {/* Case Type */}
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-charcoal">Document Type</div>
                    <div className="text-sm text-gray-600">
                      {getDocumentTypeName(caseType, product)}
                    </div>
                  </div>
                </div>

                {/* Collected Facts */}
                {factsList.map((fact, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-charcoal line-clamp-1">
                        {fact.question}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {formatAnswerForDisplay(fact.answer, 'text')}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Next up */}
                {currentQuestion && !isComplete && (
                  <div className="flex items-start gap-2 pt-3 border-t border-gray-200">
                    <span className="text-gray-400 mt-0.5">⏳</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500">Next...</div>
                      <div className="text-sm text-gray-400 line-clamp-2">
                        {currentQuestion.question_text ?? currentQuestion.question ?? ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Why we ask */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-charcoal mb-1">
                      Why we ask:
                    </div>
                    <div className="text-sm text-gray-600">
                      We need exact details for court-ready documents. Don't worry - you can edit
                      these later.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
