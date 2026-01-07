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
import { StructuredData, faqPageSchema } from '@/lib/seo/structured-data';
import {
  ASK_HEAVEN_RECOMMENDATION_MAP,
  type AskHeavenRecommendation,
  isValidAskHeavenRecommendation,
} from '@/lib/pricing/products';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  suggestedProduct?: string | null;
  followUpQuestions?: string[];
  sources?: string[];
}

// Product CTA config now imported from @/lib/pricing/products

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

const faqItems = [
  {
    question: 'How does Ask Heaven help with eviction notices?',
    answer: 'It explains whether Section 21, Section 8 or Section 173 (Wales) fits your situation and links you to the right generator.',
  },
  {
    question: 'Can it advise on rent arrears and repayment plans?',
    answer: 'Yes, it outlines arrears options, pre-action steps, and when to move to a money claim.',
  },
  {
    question: 'Does Ask Heaven cover tenancy agreements?',
    answer: 'It provides guidance on ASTs and Scottish PRTs, highlights common errors, and links to compliant templates.',
  },
  {
    question: 'Will it warn me about illegal eviction risks?',
    answer: 'Yes, it flags when you must avoid lock changes or harassment and signposts lawful possession routes.',
  },
  {
    question: 'Which jurisdictions does it cover?',
    answer: 'England, Wales and Scotland are supported today; Northern Ireland will be added later.',
  },
  {
    question: 'Can I generate documents from Ask Heaven?',
    answer: 'You can jump straight into our notice, money-claim and pricing funnels to generate the right paperwork.',
  },
];

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

  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');
  const initialQuestion = searchParams.get('q');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle initial question from query parameter
  const submitInitialQuestion = useCallback(async (questionText: string) => {
    const trimmed = questionText.trim();
    if (!trimmed) return;

    setError(null);
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setChatMessages([userMsg]);
    setInput('');

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
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? 'Ask Heaven could not reply right now. Please try again.');
        return;
      }

      const body = (await res.json()) as {
        reply: string;
        suggested_product?: string | null;
        follow_up_questions?: string[];
        sources?: string[];
      };

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
        followUpQuestions: body.follow_up_questions,
        sources: body.sources,
      };

      setChatMessages([userMsg, assistantMsg]);
    } catch (err) {
      console.error('Ask Heaven error:', err);
      setError('Unable to reach Ask Heaven. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  }, [caseId, jurisdiction]);

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

    setError(null);
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...chatMessages, userMsg];
    setChatMessages(nextMessages);
    setInput('');

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
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? 'Ask Heaven could not reply right now. Please try again.');
        return;
      }

      const body = (await res.json()) as {
        reply: string;
        suggested_product?: string | null;
        follow_up_questions?: string[];
        sources?: string[];
      };

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
        followUpQuestions: body.follow_up_questions,
        sources: body.sources,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Ask Heaven error:', err);
      setError('Unable to reach Ask Heaven. Please check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  }, [chatMessages, jurisdiction, caseId]);

  const handleSend = useCallback(async () => {
    await submitQuestion(input);
  }, [input, submitQuestion]);

  const handleExampleQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 pt-24">
      <StructuredData data={faqPageSchema(faqItems)} />
      <Container>
        <div className="max-w-4xl mx-auto pb-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                ☁️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ask Heaven</h1>
                <p className="text-sm text-gray-500">Free UK landlord law assistant</p>
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

              {/* Compact case context UI - keeping existing functionality */}
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
                                onClick={() => setInput(question)}
                                className="text-left text-xs px-3 py-2 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg border border-primary/20 transition-colors"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Product CTA */}
                      {m.suggestedProduct && isValidAskHeavenRecommendation(m.suggestedProduct) && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          {(() => {
                            const cta = ASK_HEAVEN_RECOMMENDATION_MAP[m.suggestedProduct as AskHeavenRecommendation];
                            return (
                              <Link
                                href={cta.wizardHref}
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

          {/* SEO Content */}
          <div className="mt-10 grid gap-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900">What is Ask Heaven?</h2>
              <p className="text-sm text-gray-700">
                Ask Heaven is your free, plain-English guide for UK landlords. It helps you choose the right route—whether that is
                eviction advice, Section 21 or Section 8 in England, Section 173 in Wales, Scottish Notice to Leave, tackling rent
                arrears, checking tenancy agreements, keeping deposits compliant, or spotting illegal eviction risks. We speak in
                a firm landlord tone and cover England, Wales, and Scotland today (Northern Ireland coming soon).
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">Common problems it solves</h3>
                  <ul className="mt-2 space-y-2 text-sm text-gray-700 list-disc list-inside">
                    <li>Choosing the correct notice (Section 21, Section 8, or Section 173 Wales)</li>
                    <li>Explaining rent arrears steps, repayment offers, and money-claim escalation</li>
                    <li>Spotting errors in tenancy agreements and renewals</li>
                    <li>Deposit protection, prescribed information, and penalty warnings</li>
                    <li>Flagging harassment or illegal eviction risks before you act</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <h3 className="text-sm font-semibold text-gray-900">Move from advice to action</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    When you are ready to take the next step, jump straight into our document flows tailored for landlords in England,
                    Wales, and Scotland. Each pathway keeps you compliant, cuts out guesswork, and makes court preparation smoother.
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm font-semibold text-primary">
                    <Link href="/wizard" className="hover:underline">Start the guided wizard</Link>
                    <Link href="/products/notice-only" className="hover:underline">Serve a notice only</Link>
                    <Link href="/products/complete-pack" className="hover:underline">Get the complete eviction pack</Link>
                    <Link href="/products/money-claim" className="hover:underline">Chase arrears with a money claim</Link>
                    <Link href="/pricing" className="hover:underline">View landlord pricing</Link>
                    <Link href="/tools/validators" className="hover:underline">Check documents in Validators</Link>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Ask Heaven FAQ</h3>
              <div className="mt-3 space-y-3">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">{item.question}</p>
                    <p className="mt-1 text-sm text-gray-700">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
}
