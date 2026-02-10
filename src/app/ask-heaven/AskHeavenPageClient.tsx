// src/app/ask-heaven/AskHeavenPageClient.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';
import type { Jurisdiction } from '@/lib/jurisdiction/types';
import { EmailCaptureModal } from '@/components/leads/EmailCaptureModal';
import { buildWizardLink, type WizardJurisdiction } from '@/lib/wizard/buildWizardLink';
import {
  initializeAskHeavenAttribution,
  getAskHeavenAttribution,
  setAskHeavenAttribution,
  incrementQuestionCount,
  markEmailCaptured,
  hasEmailBeenCaptured,
  getQuestionCount,
  updateCurrentTopic,
} from '@/lib/ask-heaven/askHeavenAttribution';
import {
  trackAskHeavenView,
  trackAskHeavenQuestionSubmitted,
  trackAskHeavenAnswerReceived,
  trackAskHeavenCtaClick,
  trackAskHeavenFollowupClick,
  trackAskHeavenEmailCapture,
  trackAskHeavenEmailGateShown,
  type AskHeavenTrackingParams,
} from '@/lib/analytics';
import {
  detectTopics,
  getPrimaryTopic,
  type Topic,
} from '@/lib/ask-heaven/topic-detection';
import {
  AskHeavenChatUI,
  type ChatMessage,
  type CaseContext,
} from '@/components/ask-heaven/AskHeavenChatUI';


const defaultJurisdiction: Jurisdiction = 'england';

// Quick prompt suggestions displayed on the welcome screen
const quickPrompts: Array<{ label: string; icon: string; prompt: string }> = [
  {
    label: 'Eviction notice help',
    icon: '📄',
    prompt: 'How do I serve an eviction notice to my tenant?',
  },
  {
    label: 'Rent arrears recovery',
    icon: '💷',
    prompt: 'How do I recover unpaid rent from a tenant?',
  },
  {
    label: 'Deposit protection rules',
    icon: '🛡️',
    prompt: 'What are the deposit protection requirements?',
  },
];

// Jurisdiction display names and flags
const jurisdictionLabels: Record<Jurisdiction, string> = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
  'northern-ireland': 'N. Ireland',
};

const jurisdictionFlags: Record<Jurisdiction, string> = {
  england: '/gb-eng.svg',
  wales: '/gb-wls.svg',
  scotland: '/gb-sct.svg',
  'northern-ireland': '/gb-nir.svg',
};

// Email gate threshold
const EMAIL_GATE_THRESHOLD = 3;

interface AskHeavenPageClientProps {
  initialQuery?: string | null;
  initialMessages?: ChatMessage[];
  initialJurisdiction?: Jurisdiction;
  initialTopic?: Topic | null;
  initialQuestionText?: string | null;
  showComposer?: boolean;
  statusBanner?: React.ReactNode;
}

export default function AskHeavenPageClient({
  initialQuery,
  initialMessages,
  initialJurisdiction,
  initialTopic,
  initialQuestionText,
  showComposer = true,
  statusBanner,
}: AskHeavenPageClientProps): React.ReactElement {
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(
    initialJurisdiction ?? defaultJurisdiction
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    () => initialMessages ?? []
  );
  const [input, setInput] = useState(initialQuery?.trim() ?? '');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseContext, setCaseContext] = useState<CaseContext | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, any>>({});
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [answersSubmitting, setAnswersSubmitting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailGateOpen, setEmailGateOpen] = useState(false);
  const [, setEmailGateReason] = useState<'compliance_checklist' | 'threshold_gate' | 'manual'>('threshold_gate');
  const [detectedTopic, setDetectedTopic] = useState<Topic | null>(initialTopic ?? null);
  const [suggestedNextStep, setSuggestedNextStep] = useState<'wizard' | 'checklist' | 'guide' | 'none' | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>(initialQuestionText?.trim() ?? '');
  const [attributionInitialized, setAttributionInitialized] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFiredView = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const initialQuestion = initialQuery?.trim();

  // Initialize attribution on page load
  useEffect(() => {
    if (!attributionInitialized) {
      const attribution = initializeAskHeavenAttribution();

      const jurisdictionParam = searchParams.get('jurisdiction');
      if (jurisdictionParam) {
        const normalizedJurisdiction = normalizeJurisdiction(jurisdictionParam);
        if (normalizedJurisdiction) {
          setJurisdiction(normalizedJurisdiction as Jurisdiction);
          setAskHeavenAttribution({ jurisdiction: normalizedJurisdiction });
        }
      } else if (initialJurisdiction) {
        setAskHeavenAttribution({ jurisdiction: initialJurisdiction });
      }

      setAttributionInitialized(true);

      if (!hasFiredView.current) {
        hasFiredView.current = true;
        trackAskHeavenView({
          jurisdiction: jurisdiction,
          src: attribution.src,
          topic: attribution.topic,
          utm_source: attribution.utm_source,
          utm_medium: attribution.utm_medium,
          utm_campaign: attribution.utm_campaign,
          landing_url: attribution.landing_url,
          first_seen_at: attribution.first_seen_at,
          question_count: attribution.question_count,
        });
      }
    }
  }, [attributionInitialized, searchParams, jurisdiction, initialJurisdiction]);

  useEffect(() => {
    if (attributionInitialized) {
      setAskHeavenAttribution({ jurisdiction });
    }
  }, [jurisdiction, attributionInitialized]);

  const getTrackingParams = useCallback((): AskHeavenTrackingParams => {
    const attribution = getAskHeavenAttribution();
    return {
      jurisdiction,
      src: attribution.src,
      topic: attribution.topic,
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
      landing_url: attribution.landing_url,
      first_seen_at: attribution.first_seen_at,
      question_count: attribution.question_count,
    };
  }, [jurisdiction]);

  // Auto-scroll chat container (not page) when new messages arrive
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll only within the chat container, not the whole page
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (initialQuestion && chatMessages.length === 0 && input.trim().length === 0) {
      setInput(initialQuestion);
    }
  }, [initialQuestion, chatMessages.length, input]);

  useEffect(() => {
    if (initialQuestionText && !lastQuestion) {
      setLastQuestion(initialQuestionText.trim());
    }
  }, [initialQuestionText, lastQuestion]);

  useEffect(() => {
    if (initialTopic) {
      updateCurrentTopic(initialTopic);
    }
  }, [initialTopic]);

  useEffect(() => {
    if (!caseId) return;
    const load = async () => {
      try {
        const response = await fetch(`/api/ask-heaven/case?caseId=${caseId}`);
        if (!response.ok) return;
        const payload = (await response.json()) as CaseContext & { caseId: string };
        setCaseContext(payload);
        if (payload.evidence?.length) {
          setSelectedEvidenceId(payload.evidence[0].id);
        }
      } catch (err) {
        console.error('Failed to load case context', err);
      }
    };
    void load();
  }, [caseId]);

  const selectedEvidence = useMemo(() => {
    if (!caseContext || !selectedEvidenceId) return null;
    return caseContext.evidence.find((entry) => entry.id === selectedEvidenceId) || null;
  }, [caseContext, selectedEvidenceId]);

  const updateAnswer = (factKey: string, value: any) => {
    setQuestionAnswers((prev) => ({ ...prev, [factKey]: value }));
    setQuestionErrors((prev) => ({ ...prev, [factKey]: '' }));
  };

  const handleSubmitAnswers = useCallback(async () => {
    if (!caseId) return;
    setAnswersSubmitting(true);
    setQuestionErrors({});
    try {
      const response = await fetch('/api/wizard/answer-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, answers: questionAnswers }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (Array.isArray(data?.errors)) {
          const errorMap: Record<string, string> = {};
          data.errors.forEach((item: { factKey: string; message: string }) => {
            errorMap[item.factKey] = item.message;
          });
          setQuestionErrors(errorMap);
        }
        return;
      }
      setCaseContext((prev) =>
        prev
          ? {
              ...prev,
              validation_summary: data.validation_summary ?? prev.validation_summary,
              recommendations: data.recommendations ?? prev.recommendations,
              next_questions: data.next_questions ?? prev.next_questions,
            }
          : prev
      );
    } catch (err) {
      console.error('Failed to submit answers', err);
    } finally {
      setAnswersSubmitting(false);
    }
  }, [caseId, questionAnswers]);

  const renderQuestionInput = (question: QuestionDefinition) => {
    const value = questionAnswers[question.factKey];
    const baseClassName =
      'mt-1 w-full rounded border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500';

    switch (question.type) {
      case 'yes_no':
        return (
          <select
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          >
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          />
        );
      case 'currency':
        return (
          <input
            type="number"
            step="0.01"
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          />
        );
      case 'select':
        return (
          <select
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          >
            <option value="">Select...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'multi_select':
        return (
          <div className="mt-2 space-y-1">
            {question.options?.map((option) => {
              const selected = Array.isArray(value) ? value.includes(option.value) : false;
              return (
                <label key={option.value} className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => {
                      const next = new Set(Array.isArray(value) ? value : []);
                      if (event.target.checked) {
                        next.add(option.value);
                      } else {
                        next.delete(option.value);
                      }
                      updateAnswer(question.factKey, Array.from(next));
                    }}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        );
      default:
        return (
          <input
            type="text"
            className={baseClassName}
            value={value ?? ''}
            onChange={(event) => updateAnswer(question.factKey, event.target.value)}
          />
        );
    }
  };

  const submitQuestion = useCallback(async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    const currentCount = getQuestionCount();
    const emailCaptured = hasEmailBeenCaptured();

    if (currentCount >= EMAIL_GATE_THRESHOLD && !emailCaptured && !caseId) {
      trackAskHeavenEmailGateShown(getTrackingParams());
      setEmailGateOpen(true);
      return;
    }

    setError(null);
    setIsSending(true);

    const newCount = incrementQuestionCount();
    const trackingParams = getTrackingParams();
    trackingParams.question_count = newCount;
    trackAskHeavenQuestionSubmitted(trackingParams);

    const topics = detectTopics(trimmed);
    const primaryTopic = getPrimaryTopic(topics);
    if (primaryTopic) {
      setDetectedTopic(primaryTopic);
      updateCurrentTopic(primaryTopic);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setInput('');
    setLastQuestion(trimmed);

    try {
      const res = await fetch('/api/ask-heaven/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId ?? undefined,
          jurisdiction,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          messageCount: newCount,
          emailCaptured: hasEmailBeenCaptured(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string; requires_email?: boolean } | null;
        if (body?.requires_email) {
          trackAskHeavenEmailGateShown(trackingParams);
          setEmailGateOpen(true);
          setIsSending(false);
          return;
        }
        setError(body?.error ?? 'Ask Heaven could not reply right now. Please try again.');
        return;
      }

      const body = (await res.json()) as {
        reply: string;
        suggested_product?: string | null;
        suggested_next_step?: 'wizard' | 'checklist' | 'guide' | 'none' | null;
        suggested_topic?: string | null;
        follow_up_questions?: string[];
        sources?: string[];
        requires_email?: boolean;
      };

      if (body.requires_email) {
        setEmailGateReason('threshold_gate');
        trackAskHeavenEmailGateShown(trackingParams);
        setEmailGateOpen(true);
        setIsSending(false);
        return;
      }

      if (!body.reply) {
        setError('Ask Heaven returned an empty response. Please try again.');
        return;
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: body.reply,
        createdAt: new Date().toISOString(),
        suggestedProduct: body.suggested_product,
        suggestedNextStep: body.suggested_next_step,
        suggestedTopic: body.suggested_topic,
        followUpQuestions: body.follow_up_questions,
        sources: body.sources,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);

      if (body.suggested_next_step) {
        setSuggestedNextStep(body.suggested_next_step);
      }

      const responseTopics = detectTopics(body.reply);
      const responsePrimaryTopic = getPrimaryTopic(responseTopics);
      if (responsePrimaryTopic && !primaryTopic) {
        setDetectedTopic(responsePrimaryTopic);
        updateCurrentTopic(responsePrimaryTopic);
      }
      if (body.suggested_topic && !responsePrimaryTopic && !primaryTopic) {
        setDetectedTopic(body.suggested_topic as Topic);
        updateCurrentTopic(body.suggested_topic);
      }

      trackAskHeavenAnswerReceived({
        ...trackingParams,
        suggested_product: body.suggested_product,
        suggested_next_step: body.suggested_next_step,
        suggested_topic: body.suggested_topic,
      });
    } catch (err) {
      console.error('Ask Heaven error:', err);
      setError('Unable to reach Ask Heaven. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  }, [chatMessages, jurisdiction, caseId, getTrackingParams]);

  const handleSend = useCallback(async () => {
    await submitQuestion(input);
  }, [input, submitQuestion]);

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleFollowupClick = useCallback((question: string) => {
    trackAskHeavenFollowupClick(getTrackingParams());
    // Directly submit the question
    submitQuestion(question);
  }, [getTrackingParams, submitQuestion]);

  const buildWizardLinkWithAttribution = useCallback((product: string) => {
    const attribution = getAskHeavenAttribution();
    return buildWizardLink({
      product: product as any,
      jurisdiction: jurisdiction as WizardJurisdiction,
      src: 'ask_heaven',
      topic: (attribution.topic as any) || 'general',
      utm_source: attribution.utm_source,
      utm_medium: attribution.utm_medium,
      utm_campaign: attribution.utm_campaign,
    });
  }, [jurisdiction]);

  const handleCtaClick = useCallback((ctaType: 'wizard' | 'product' | 'validator' | 'template' | 'next_best_action', targetUrl: string, ctaLabel: string, suggestedProduct?: string) => {
    const trackingParams = getTrackingParams();
    trackAskHeavenCtaClick({
      ...trackingParams,
      suggested_product: suggestedProduct,
      cta_type: ctaType,
      cta_label: ctaLabel,
      target_url: targetUrl,
    });
    // Explicitly navigate to the target URL
    router.push(targetUrl);
  }, [getTrackingParams, router]);

  const handleEmailCaptured = useCallback(() => {
    markEmailCaptured();
    trackAskHeavenEmailCapture(getTrackingParams());
    setEmailGateOpen(false);
    setEmailStatus('Thanks! You can continue your conversation.');
  }, [getTrackingParams]);

  // Determine if we're in welcome state (no messages yet)
  const isWelcomeState = chatMessages.length === 0 && !isSending;

  return (
    <>
      <AskHeavenChatUI
        jurisdiction={jurisdiction}
      jurisdictionLabels={jurisdictionLabels}
      jurisdictionFlags={jurisdictionFlags}
      onJurisdictionChange={setJurisdiction}
      isWelcomeState={isWelcomeState}
      quickPrompts={quickPrompts}
      onQuickPrompt={handleQuickPrompt}
      initialQuestion={initialQuestion}
      input={input}
      onInputChange={setInput}
      onSubmit={() => void handleSend()}
      isSending={isSending}
      chatMessages={chatMessages}
      chatContainerRef={chatContainerRef}
      chatEndRef={chatEndRef}
      inputRef={inputRef}
      onFollowupClick={handleFollowupClick}
      error={error}
      detectedTopic={detectedTopic}
      lastQuestion={lastQuestion}
      suggestedNextStep={suggestedNextStep}
      questionCount={getQuestionCount()}
      onCtaClick={handleCtaClick}
      buildWizardLinkWithAttribution={buildWizardLinkWithAttribution}
      onRequestEmailCapture={(reason) => {
        setEmailGateReason(reason);
        setEmailGateOpen(true);
      }}
      showComposer={showComposer}
      statusBanner={statusBanner}
      caseId={caseId}
      caseContext={caseContext}
      selectedEvidenceId={selectedEvidenceId}
      selectedEvidence={selectedEvidence}
      onSelectEvidence={setSelectedEvidenceId}
      questionErrors={questionErrors}
      answersSubmitting={answersSubmitting}
      renderQuestionInput={renderQuestionInput}
      onSubmitAnswers={handleSubmitAnswers}
      onOpenEmail={() => setEmailOpen(true)}
      emailStatus={emailStatus}
    />

      {/* Email Report Modal */}
      <EmailCaptureModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        source="ask_heaven"
        jurisdiction={normalizeJurisdiction(caseContext?.jurisdiction) ?? caseContext?.jurisdiction ?? jurisdiction}
        caseId={caseId ?? undefined}
        tags={['ask_heaven', 'report']}
        title="Email my report"
        description="We'll send you a copy of your analysis report and helpful resources."
        primaryLabel="Send report"
        includeEmailReport={true}
        reportCaseId={caseId ?? undefined}
        onSuccess={() => {
          setEmailStatus('Report queued - check your inbox soon.');
        }}
      />

      {/* Email Gate Modal */}
      <EmailCaptureModal
        open={emailGateOpen}
        onClose={() => setEmailGateOpen(false)}
        source="ask_heaven_gate"
        jurisdiction={jurisdiction}
        tags={['ask_heaven', 'email_gate']}
        title="Continue your conversation"
        description="Enter your email to continue chatting with Ask Heaven. We'll also send you a summary of your conversation."
        primaryLabel="Continue"
        includeEmailReport={false}
        onSuccess={handleEmailCaptured}
      />
    </>
  );
}
