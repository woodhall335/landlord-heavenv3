// src/app/ask-heaven/AskHeavenPageClient.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';
import type { Jurisdiction } from '@/lib/jurisdiction/types';
import { EmailCaptureModal } from '@/components/leads/EmailCaptureModal';
import { RiSendPlaneFill, RiAddLine, RiMicLine, RiBookLine, RiArrowRightLine, RiShieldCheckLine } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';
import {
  ASK_HEAVEN_RECOMMENDATION_MAP,
  type AskHeavenRecommendation,
  isValidAskHeavenRecommendation,
} from '@/lib/pricing/products';
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
import { detectTopics, getPrimaryTopic, type Topic } from '@/lib/ask-heaven/topic-detection';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  suggestedProduct?: string | null;
  suggestedNextStep?: 'wizard' | 'checklist' | 'guide' | 'none' | null;
  suggestedTopic?: string | null;
  followUpQuestions?: string[];
  sources?: string[];
}

interface EvidenceSummary {
  id: string;
  file_name?: string;
  doc_type?: string | null;
  doc_type_confidence?: number | null;
  doc_type_reasons?: string[] | null;
}

interface CaseContext {
  evidence: EvidenceSummary[];
  jurisdiction?: string;
  validation_summary: {
    validator_key?: string | null;
    status: string;
    blockers?: Array<{ code: string; message: string }>;
    warnings?: Array<{ code: string; message: string }>;
    upsell?: { product: string; reason: string } | null;
  } | null;
  recommendations: Array<{ code: string; message: string }>;
  next_questions: QuestionDefinition[];
}

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

// Jurisdiction display names
const jurisdictionLabels: Record<Jurisdiction, string> = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
  'northern-ireland': 'N. Ireland',
};

// Email gate threshold
const EMAIL_GATE_THRESHOLD = 3;

export default function AskHeavenPageClient(): React.ReactElement {
  const router = useRouter();
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(defaultJurisdiction);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
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
  const [detectedTopic, setDetectedTopic] = useState<Topic | null>(null);
  const [suggestedNextStep, setSuggestedNextStep] = useState<'wizard' | 'checklist' | 'guide' | 'none' | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [attributionInitialized, setAttributionInitialized] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAutoSubmitted = useRef(false);
  const hasFiredView = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const initialQuestion = searchParams.get('q');

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
  }, [attributionInitialized, searchParams, jurisdiction]);

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

  const submitInitialQuestion = useCallback(async (questionText: string) => {
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

    setChatMessages([userMsg]);
    setInput('');
    setLastQuestion(trimmed);

    try {
      const res = await fetch('/api/ask-heaven/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseId ?? undefined,
          jurisdiction,
          messages: [{ role: userMsg.role, content: userMsg.content }],
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

      setChatMessages([userMsg, assistantMsg]);

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
  }, [caseId, jurisdiction, getTrackingParams]);

  useEffect(() => {
    if (initialQuestion && !hasAutoSubmitted.current && chatMessages.length === 0) {
      hasAutoSubmitted.current = true;
      setInput(initialQuestion);
      setTimeout(() => {
        submitInitialQuestion(initialQuestion);
      }, 100);
    }
  }, [initialQuestion, chatMessages.length, submitInitialQuestion]);

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
    <div className="min-h-[80vh] relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-cyan-50 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-200/30 via-transparent to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Jurisdiction Toggle - Copilot-style pill buttons */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-gray-200/50">
            {(Object.keys(jurisdictionLabels) as Jurisdiction[]).map((jur) => (
              <button
                key={jur}
                type="button"
                onClick={() => setJurisdiction(jur)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  jurisdiction === jur
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                {jurisdictionLabels[jur]}
              </button>
            ))}
          </div>
        </div>

        {/* Case Context Panel (if caseId present) */}
        {caseId && caseContext && (
          <div className="mb-6 p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Document Review</p>
                <p className="text-xs text-gray-500">Case-linked evidence and validation insights</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Case {caseId.slice(0, 8)}...
              </span>
            </div>

            <div className="space-y-3">
              {caseContext.evidence.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-700">Uploaded evidence</label>
                  <select
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={selectedEvidenceId ?? ''}
                    onChange={(event) => setSelectedEvidenceId(event.target.value)}
                  >
                    {caseContext.evidence.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.file_name || 'Uploaded document'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedEvidence && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
                  <p className="font-semibold text-gray-700">Classification</p>
                  <p className="text-gray-600">
                    {selectedEvidence.doc_type || 'unknown'}{' '}
                    {selectedEvidence.doc_type_confidence !== null && selectedEvidence.doc_type_confidence !== undefined
                      ? `(${Math.round(selectedEvidence.doc_type_confidence * 100)}% confidence)`
                      : ''}
                  </p>
                </div>
              )}

              {caseContext.validation_summary && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-700">Validation</p>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] text-gray-600">
                      {caseContext.validation_summary.status}
                    </span>
                  </div>
                </div>
              )}

              {caseContext.next_questions.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
                  <p className="font-semibold text-gray-700 mb-2">Additional Questions</p>
                  <div className="space-y-2">
                    {caseContext.next_questions.map((question) => (
                      <label key={question.id} className="block">
                        <span className="text-gray-700">{question.question}</span>
                        {renderQuestionInput(question)}
                        {questionErrors[question.factKey] && (
                          <span className="mt-1 block text-[11px] text-red-600">
                            {questionErrors[question.factKey]}
                          </span>
                        )}
                      </label>
                    ))}
                    <button
                      type="button"
                      disabled={answersSubmitting}
                      onClick={async () => {
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
                      }}
                      className="mt-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:bg-primary-700 transition-colors"
                    >
                      {answersSubmitting ? 'Re-checking...' : 'Save & re-check'}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => setEmailOpen(true)}
              >
                Email my report
              </button>
              {emailStatus && <p className="text-xs text-gray-500">{emailStatus}</p>}
            </div>
          </div>
        )}

        {/* Main Chat Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
          {isWelcomeState ? (
            /* Welcome State - Copilot-inspired centered layout */
            <div className="px-6 py-12 md:px-12 md:py-16">
              {/* Ask Heaven Branding */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <Image
                  src="/favicon.png"
                  alt="Ask Heaven"
                  width={48}
                  height={48}
                  className="rounded-xl"
                />
                <span className="text-2xl font-bold text-gray-900">Ask Heaven</span>
              </div>

              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Hi, how can I help you?
                </h2>
                <p className="text-gray-500 text-lg">
                  Free UK landlord advice for {jurisdictionLabels[jurisdiction]}
                </p>
              </div>

              {/* Main Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isSending && input.trim()) {
                    void handleSend();
                  }
                }}
                className="max-w-2xl mx-auto mb-10"
              >
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:border-primary/30 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                    <button
                      type="button"
                      className="p-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Add attachment"
                      disabled
                    >
                      <RiAddLine className="w-5 h-5" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 py-4 text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none text-base"
                      placeholder="Ask about evictions, rent arrears, deposits..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isSending}
                    />
                    <button
                      type="button"
                      className="p-4 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Voice input"
                      disabled
                    >
                      <RiMicLine className="w-5 h-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={isSending || !input.trim()}
                      className="m-2 p-3 bg-primary hover:bg-primary-700 text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      aria-label="Send message"
                    >
                      <RiSendPlaneFill className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </form>

              {/* Quick Prompt Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                {quickPrompts.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickPrompt(item.prompt)}
                    className="group p-4 bg-white rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-lg text-left transition-all duration-200"
                  >
                    <span className="text-2xl mb-2 block">{item.icon}</span>
                    <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.prompt}</p>
                  </button>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  Free to use
                </span>
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  No sign-up required
                </span>
                <span className="flex items-center gap-2">
                  <RiShieldCheckLine className="w-4 h-4 text-green-500" />
                  UK law focused
                </span>
              </div>
            </div>
          ) : (
            /* Chat State - Fixed container with scrollable messages */
            <div className="flex flex-col h-[600px]">
              {/* Messages Area - scrollable */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'user' ? (
                      <div className="max-w-[85%] md:max-w-[70%]">
                        <div className="rounded-2xl rounded-br-md px-5 py-3 bg-primary">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#ffffff' }}>{m.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%] md:max-w-[70%]">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src="/favicon.png"
                              alt="Ask Heaven"
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="rounded-2xl rounded-tl-md px-5 py-3 bg-gray-100 text-gray-800">
                              <div className="prose prose-sm prose-gray max-w-none [&>p]:mb-2 [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-0.5 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-bold [&>h2]:font-semibold [&>h3]:font-semibold [&>strong]:text-gray-900 [&>p:last-child]:mb-0">
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                              </div>
                            </div>

                            {/* Sources */}
                            {m.sources && m.sources.length > 0 && (
                              <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <RiBookLine className="w-4 h-4 text-gray-400" />
                                {m.sources.map((source, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-md"
                                  >
                                    {source}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Follow-up questions */}
                            {m.followUpQuestions && m.followUpQuestions.length > 0 && (
                              <div className="mt-4 space-y-2">
                                {m.followUpQuestions.map((question, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleFollowupClick(question)}
                                    className="block w-full text-left text-sm px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                  >
                                    <span className="text-gray-700 group-hover:text-primary">{question}</span>
                                    <RiArrowRightLine className="inline-block ml-2 w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                  </button>
                                ))}
                              </div>
                            )}

                            {/* Product CTA */}
                            {m.suggestedProduct && isValidAskHeavenRecommendation(m.suggestedProduct) && (
                              <div className="mt-4">
                                {(() => {
                                  const cta = ASK_HEAVEN_RECOMMENDATION_MAP[m.suggestedProduct as AskHeavenRecommendation];
                                  const wizardUrl = buildWizardLinkWithAttribution(cta.primarySku);
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => handleCtaClick('wizard', wizardUrl, cta.label, m.suggestedProduct ?? undefined)}
                                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all group cursor-pointer text-left"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-primary group-hover:text-primary-700">
                                          {cta.label}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{cta.description}</p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-sm font-bold text-gray-900">{cta.displayPrice}</span>
                                        {cta.priceNote && (
                                          <span className="block text-[10px] text-gray-400">{cta.priceNote}</span>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src="/favicon.png"
                          alt="Ask Heaven"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="rounded-2xl rounded-tl-md px-5 py-4 bg-gray-100">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!isSending && input.trim()) {
                      void handleSend();
                    }
                  }}
                  className="flex gap-3"
                >
                  <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 px-4 py-3 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none"
                      placeholder="Ask a follow-up question..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isSending}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || !input.trim()}
                    className="px-5 py-3 bg-primary hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
                    <RiSendPlaneFill className="w-5 h-5" />
                  </button>
                </form>
                <p className="mt-3 text-xs text-gray-400 text-center">
                  For guidance only - not legal advice.
                  <Link href="/terms" className="text-primary hover:underline ml-1">Terms apply</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
}
