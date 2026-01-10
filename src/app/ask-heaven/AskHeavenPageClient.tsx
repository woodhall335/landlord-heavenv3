// src/app/ask-heaven/AskHeavenPageClient.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';
import type { Jurisdiction } from '@/lib/jurisdiction/types';
import { EmailCaptureModal } from '@/components/leads/EmailCaptureModal';
import { Container } from '@/components/ui';
import { RiSendPlaneFill, RiCheckLine, RiQuestionLine, RiBookLine } from 'react-icons/ri';
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
import { NextBestActionCard } from '@/components/ask-heaven/NextBestActionCard';

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

const exampleQuestionsByJurisdiction: Record<Jurisdiction, string[]> = {
  england: [
    "How do I serve a Section 21 notice?",
    "What are the grounds for Section 8?",
    "Can I increase rent on an AST?",
    "What's the notice period for rent arrears?",
  ],
  wales: [
    "How do I serve a Section 173 notice?",
    "What changed with the Renting Homes Act?",
    "What notice do I give a contract holder?",
    "Do I need Rent Smart Wales registration?",
  ],
  scotland: [
    "How do I serve a Notice to Leave?",
    "What are the eviction grounds in Scotland?",
    "Do I need pre-action requirements?",
    "How does the First-tier Tribunal work?",
  ],
  'northern-ireland': [
    "How do I serve a Notice to Quit in NI?",
    "What are my landlord obligations in NI?",
    "What notice period do I need to give?",
    "How do I recover rent arrears?",
  ],
};

const jurisdictionWelcome: Record<Jurisdiction, { title: string; subtitle: string }> = {
  england: {
    title: "Ask me about English landlord law",
    subtitle: "Section 21, Section 8, ASTs, and more",
  },
  wales: {
    title: "Ask me about Welsh landlord law",
    subtitle: "Renting Homes Act, occupation contracts, and more",
  },
  scotland: {
    title: "Ask me about Scottish landlord law",
    subtitle: "Notice to Leave, PRT, First-tier Tribunal, and more",
  },
  'northern-ireland': {
    title: "Ask me about NI landlord law",
    subtitle: "Notice to Quit, tenancy agreements, and more",
  },
};

// Email gate threshold
const EMAIL_GATE_THRESHOLD = 3;

export default function AskHeavenPageClient(): React.ReactElement {
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
  const [emailGateReason, setEmailGateReason] = useState<'compliance_checklist' | 'threshold_gate' | 'manual'>('threshold_gate');
  const [detectedTopic, setDetectedTopic] = useState<Topic | null>(null);
  const [suggestedNextStep, setSuggestedNextStep] = useState<'wizard' | 'checklist' | 'guide' | 'none' | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [attributionInitialized, setAttributionInitialized] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
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

      // Also store jurisdiction if from URL
      const jurisdictionParam = searchParams.get('jurisdiction');
      if (jurisdictionParam) {
        const normalizedJurisdiction = normalizeJurisdiction(jurisdictionParam);
        if (normalizedJurisdiction) {
          setJurisdiction(normalizedJurisdiction as Jurisdiction);
          setAskHeavenAttribution({ jurisdiction: normalizedJurisdiction });
        }
      }

      setAttributionInitialized(true);

      // Fire view event (only once)
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

  // Update attribution when jurisdiction changes
  useEffect(() => {
    if (attributionInitialized) {
      setAskHeavenAttribution({ jurisdiction });
    }
  }, [jurisdiction, attributionInitialized]);

  // Helper to get current tracking params
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle initial question from query parameter
  const submitInitialQuestion = useCallback(async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    // Check email gate before submitting
    const currentCount = getQuestionCount();
    const emailCaptured = hasEmailBeenCaptured();

    if (currentCount >= EMAIL_GATE_THRESHOLD && !emailCaptured && !caseId) {
      trackAskHeavenEmailGateShown(getTrackingParams());
      setEmailGateOpen(true);
      return;
    }

    setError(null);
    setIsSending(true);

    // Increment question count and track
    const newCount = incrementQuestionCount();
    const trackingParams = getTrackingParams();
    trackingParams.question_count = newCount;
    trackAskHeavenQuestionSubmitted(trackingParams);

    // Detect topics from the question
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
        headers: {
          'Content-Type': 'application/json',
        },
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

        // Handle email gate from API
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

      // Handle email gate response
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

      // Set suggested next step from API
      if (body.suggested_next_step) {
        setSuggestedNextStep(body.suggested_next_step);
      }

      // Detect topics from response as well
      const responseTopics = detectTopics(body.reply);
      const responsePrimaryTopic = getPrimaryTopic(responseTopics);
      if (responsePrimaryTopic && !primaryTopic) {
        setDetectedTopic(responsePrimaryTopic);
        updateCurrentTopic(responsePrimaryTopic);
      }
      // Also use API-suggested topic if available
      if (body.suggested_topic && !responsePrimaryTopic && !primaryTopic) {
        setDetectedTopic(body.suggested_topic as Topic);
        updateCurrentTopic(body.suggested_topic);
      }

      // Track answer received
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
      // Auto-submit after a brief delay to allow state to settle
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
            <option value="">Select…</option>
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
            <option value="">Select…</option>
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

    // Check email gate before submitting
    const currentCount = getQuestionCount();
    const emailCaptured = hasEmailBeenCaptured();

    if (currentCount >= EMAIL_GATE_THRESHOLD && !emailCaptured && !caseId) {
      trackAskHeavenEmailGateShown(getTrackingParams());
      setEmailGateOpen(true);
      return;
    }

    setError(null);
    setIsSending(true);

    // Increment question count and track
    const newCount = incrementQuestionCount();
    const trackingParams = getTrackingParams();
    trackingParams.question_count = newCount;
    trackAskHeavenQuestionSubmitted(trackingParams);

    // Detect topics from the question
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseId ?? undefined,
          jurisdiction,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          messageCount: newCount,
          emailCaptured: hasEmailBeenCaptured(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string; requires_email?: boolean } | null;

        // Handle email gate from API
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

      // Handle email gate response
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

      // Set suggested next step from API
      if (body.suggested_next_step) {
        setSuggestedNextStep(body.suggested_next_step);
      }

      // Detect topics from response as well
      const responseTopics = detectTopics(body.reply);
      const responsePrimaryTopic = getPrimaryTopic(responseTopics);
      if (responsePrimaryTopic && !primaryTopic) {
        setDetectedTopic(responsePrimaryTopic);
        updateCurrentTopic(responsePrimaryTopic);
      }
      // Also use API-suggested topic if available
      if (body.suggested_topic && !responsePrimaryTopic && !primaryTopic) {
        setDetectedTopic(body.suggested_topic as Topic);
        updateCurrentTopic(body.suggested_topic);
      }

      // Track answer received
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

  const handleExampleQuestion = (question: string) => {
    setInput(question);
  };

  const handleFollowupClick = (question: string) => {
    trackAskHeavenFollowupClick(getTrackingParams());
    setInput(question);
  };

  // Build wizard link with attribution
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

  // Handle CTA click with tracking
  const handleCtaClick = useCallback((ctaType: 'wizard' | 'product' | 'validator' | 'template' | 'next_best_action', targetUrl: string, ctaLabel: string, suggestedProduct?: string) => {
    const trackingParams = getTrackingParams();
    trackAskHeavenCtaClick({
      ...trackingParams,
      suggested_product: suggestedProduct,
      cta_type: ctaType,
      cta_label: ctaLabel,
      target_url: targetUrl,
    });
  }, [getTrackingParams]);

  // Handle email capture success
  const handleEmailCaptured = useCallback(() => {
    markEmailCaptured();
    trackAskHeavenEmailCapture(getTrackingParams());
    setEmailGateOpen(false);
    setEmailStatus('Thanks! You can continue your conversation.');
  }, [getTrackingParams]);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 pb-8">
      <Container>
        <div className="max-w-4xl mx-auto pb-6">
          {/* Chat Widget Header - H1 is in SSR page.tsx */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                ☁️
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 block" aria-hidden="true">Ask Heaven</span>
                <p className="text-sm text-gray-500">Select your jurisdiction and ask a question</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
              >
                <option value="england">England</option>
                <option value="wales">Wales</option>
                <option value="scotland">Scotland</option>
                <option value="northern-ireland">Northern Ireland</option>
              </select>
            </div>
          </div>

          {/* Case Context Panel (if caseId present) */}
          {caseId && caseContext && (
            <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Document Review</p>
                  <p className="text-xs text-gray-500">Case-linked evidence and validation insights</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Case {caseId.slice(0, 8)}…
                </span>
              </div>

              {/* Compact case context UI */}
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
                        {answersSubmitting ? 'Re-checking…' : 'Save & re-check'}
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

          {/* Main Chat Area */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Chat Messages */}
            <div className="min-h-[300px] max-h-[400px] overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {chatMessages.length === 0 && !isSending && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl mb-4">
                    ☁️
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {jurisdictionWelcome[jurisdiction].title}
                  </h2>
                  <p className="text-sm text-primary font-medium mb-2">
                    {jurisdictionWelcome[jurisdiction].subtitle}
                  </p>
                  <p className="text-gray-500 mb-6 max-w-md text-sm">
                    Get plain-English explanations about UK landlord problems. I help you understand notices, eviction routes, money claims, and tenancy agreements so you can speak to tenants, agents, or your own solicitor with confidence.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                    {exampleQuestionsByJurisdiction[jurisdiction].map((question) => (
                      <button
                        key={question}
                        onClick={() => handleExampleQuestion(question)}
                        className="text-left p-3 bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-md transition-all text-sm text-gray-700 cursor-pointer hover:bg-primary/5"
                        type="button"
                      >
                        <RiQuestionLine className="inline-block w-4 h-4 mr-2 text-primary" />
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'user' ? (
                    <div
                      className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-br-md px-4 py-3"
                      style={{ backgroundColor: '#7C3AED' }}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: '#ffffff' }}>
                        {m.content}
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-[85%] md:max-w-[75%] rounded-2xl rounded-bl-md px-4 py-3 bg-white border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">☁️</span>
                        <span className="text-xs font-semibold text-primary">Ask Heaven</span>
                      </div>
                      {/* Markdown-rendered response */}
                      <div className="prose prose-sm prose-gray max-w-none text-gray-700 [&>p]:mb-2 [&>ul]:my-2 [&>ol]:my-2 [&>li]:my-0.5 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm [&>h1]:font-bold [&>h2]:font-semibold [&>h3]:font-semibold [&>strong]:text-gray-900 [&>p:last-child]:mb-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>

                      {/* Sources citations */}
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 mb-2">
                            <RiBookLine className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Sources</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {m.sources.map((source, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-md"
                              >
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up questions */}
                      {m.followUpQuestions && m.followUpQuestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-2">Follow-up questions</p>
                          <div className="flex flex-col gap-1.5">
                            {m.followUpQuestions.map((question, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleFollowupClick(question)}
                                className="text-left text-xs px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg border border-primary/20 transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product CTA - updated with buildWizardLink */}
                      {m.suggestedProduct && isValidAskHeavenRecommendation(m.suggestedProduct) && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          {(() => {
                            const cta = ASK_HEAVEN_RECOMMENDATION_MAP[m.suggestedProduct as AskHeavenRecommendation];
                            const wizardUrl = buildWizardLinkWithAttribution(cta.primarySku);
                            return (
                              <Link
                                href={wizardUrl}
                                onClick={() => handleCtaClick('wizard', wizardUrl, cta.label, m.suggestedProduct ?? undefined)}
                                className="block p-3 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/20 transition-all group"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-primary group-hover:text-primary-700">
                                      {cta.label} →
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {cta.description}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold text-gray-900">{cta.displayPrice}</span>
                                    {cta.priceNote && (
                                      <span className="text-[10px] text-gray-400">{cta.priceNote}</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">☁️</span>
                      <span className="text-xs font-semibold text-primary">Ask Heaven</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Next Best Action Card - shown after first answer */}
            {chatMessages.some(m => m.role === 'assistant') && detectedTopic && (
              <div className="px-4 md:px-6 pb-4">
                <NextBestActionCard
                  topic={detectedTopic}
                  jurisdiction={jurisdiction as WizardJurisdiction}
                  suggestedNextStep={suggestedNextStep}
                  lastQuestion={lastQuestion}
                  questionCount={getQuestionCount()}
                  attribution={{
                    src: getAskHeavenAttribution().src,
                    utm_source: getAskHeavenAttribution().utm_source,
                    utm_medium: getAskHeavenAttribution().utm_medium,
                    utm_campaign: getAskHeavenAttribution().utm_campaign,
                  }}
                  onCtaClick={(ctaType, targetUrl, ctaLabel) => {
                    handleCtaClick(ctaType as any, targetUrl, ctaLabel);
                  }}
                  onRequestEmailCapture={(reason) => {
                    setEmailGateReason(reason);
                    setEmailGateOpen(true);
                    trackAskHeavenEmailGateShown({
                      ...getTrackingParams(),
                      reason,
                    } as AskHeavenTrackingParams & { reason: string });
                  }}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mx-4 md:mx-6 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-white p-4 md:p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!isSending) {
                    void handleSend();
                  }
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-colors"
                  placeholder="Ask a question about UK landlord-tenant law..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="px-6 py-3 bg-primary hover:bg-primary-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Ask'}</span>
                  <RiSendPlaneFill className="w-5 h-5" />
                </button>
              </form>
              <p className="mt-3 text-xs text-gray-500 text-center">
                For guidance only — not legal advice.
                <Link href="/terms" className="text-primary hover:underline ml-1">Terms apply</Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <RiCheckLine className="w-4 h-4 text-green-500" />
              Free to use
            </span>
            <span className="flex items-center gap-1.5">
              <RiCheckLine className="w-4 h-4 text-green-500" />
              UK law focused
            </span>
            <span className="flex items-center gap-1.5">
              <RiCheckLine className="w-4 h-4 text-green-500" />
              All 4 jurisdictions
            </span>
            <span className="flex items-center gap-1.5">
              <RiCheckLine className="w-4 h-4 text-green-500" />
              No sign-up required
            </span>
          </div>
        </div>
      </Container>

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
          setEmailStatus('Report queued — check your inbox soon.');
        }}
      />

      {/* Email Gate Modal - blocks chat after 3 questions */}
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
