// src/app/ask-heaven/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import { getWizardCta } from '@/lib/checkout/cta-mapper';
import { normalizeJurisdiction } from '@/lib/jurisdiction/normalize';
import type { Jurisdiction } from '@/lib/jurisdiction/types';

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement';
type Product = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
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
const defaultCaseType: CaseType = 'eviction';
const defaultProduct: Product = 'notice_only';

export default function AskHeavenPage(): React.ReactElement {
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>(defaultJurisdiction);
  const [caseType, setCaseType] = useState<CaseType>(defaultCaseType);
  const [product, setProduct] = useState<Product>(defaultProduct);
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
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const caseId = searchParams.get('caseId');

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

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
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
          case_type: caseType,
          product,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? 'Ask Heaven could not reply right now.');
        return;
      }

      const body = (await res.json()) as { reply: string };

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: body.reply,
        createdAt: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setError('Ask Heaven encountered a problem. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [input, chatMessages, jurisdiction, caseType, product, caseId]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-4 py-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Ask Heaven</h1>
        <p className="text-sm text-muted-foreground">
          Get plain-English explanations about UK landlord problems. Ask Heaven thinks like a cautious
          £500/hour UK housing solicitor, but it is not a law firm and does not give personalised legal
          advice. It helps you understand notices, eviction routes, money claims, and tenancy agreements
          so you can speak to tenants, agents, or your own solicitor with confidence.
        </p>
      </header>

      <section className="flex flex-wrap gap-3 rounded-xl border bg-card p-3 text-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Jurisdiction</label>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
          >
            <option value="england">England</option>
            <option value="wales">Wales</option>
            <option value="scotland">Scotland</option>
            <option value="northern-ireland">Northern Ireland</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Scenario</label>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={caseType}
            onChange={(e) => setCaseType(e.target.value as CaseType)}
          >
            <option value="eviction">Eviction / Notice</option>
            <option value="money_claim">Money claim (rent arrears)</option>
            <option value="tenancy_agreement">Tenancy agreements</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium">Product stage</label>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={product}
            onChange={(e) => setProduct(e.target.value as Product)}
          >
            <option value="notice_only">Notice only</option>
            <option value="complete_pack">Court/tribunal pack</option>
            <option value="money_claim">Money claim pack</option>
            <option value="tenancy_agreement">Tenancy agreement</option>
          </select>
        </div>
      </section>

      {caseId && caseContext && (
        <section className="space-y-3 rounded-xl border bg-card p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-charcoal">Review a document</p>
              <p className="text-xs text-gray-500">Case-linked evidence and validation insights.</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              Case {caseId.slice(0, 8)}…
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium">Uploaded evidence</label>
            <select
              className="rounded-md border px-2 py-1 text-sm"
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

          {selectedEvidence && (
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs">
              <p className="font-semibold text-gray-700">Classification</p>
              <p className="text-gray-600">
                {selectedEvidence.doc_type || 'unknown'}{' '}
                {selectedEvidence.doc_type_confidence !== null && selectedEvidence.doc_type_confidence !== undefined
                  ? `(${Math.round(selectedEvidence.doc_type_confidence * 100)}% confidence)`
                  : ''}
              </p>
              {selectedEvidence.doc_type_reasons?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-gray-500">
                  {selectedEvidence.doc_type_reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          {caseContext.validation_summary && (
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-700">Validation summary</p>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
                  {caseContext.validation_summary.status}
                </span>
              </div>
              {caseContext.validation_summary.upsell?.reason && (
                <p className="mt-2 text-[11px] text-gray-500">
                  {caseContext.validation_summary.upsell.reason}
                </p>
              )}
            </div>
          )}

          {caseContext.recommendations.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs">
              <p className="font-semibold text-gray-700">Recommendations</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-gray-500">
                {caseContext.recommendations.map((rec) => (
                  <li key={rec.code}>{rec.message}</li>
                ))}
              </ul>
            </div>
          )}

          {caseContext.next_questions.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs">
              <p className="font-semibold text-gray-700">Re-check document</p>
              <div className="mt-2 space-y-2">
                {caseContext.next_questions.map((question) => (
                  <label key={question.id} className="block">
                    <span className="text-gray-700">• {question.question}</span>
                    {question.helpText && (
                      <span className="block text-[11px] text-gray-400">{question.helpText}</span>
                    )}
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
                  className="mt-2 rounded bg-purple-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                >
                  {answersSubmitting ? 'Re-checking…' : 'Save answers & re-check'}
                </button>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-xs">
            <p className="font-semibold text-purple-800">Recommended next step</p>
            {(() => {
              const ctas = getWizardCta({
                jurisdiction: normalizeJurisdiction(caseContext.jurisdiction) ?? caseContext.jurisdiction ?? undefined,
                validator_key: caseContext.validation_summary?.validator_key,
                validation_summary: caseContext.validation_summary ?? null,
                caseId,
                source: 'ask_heaven',
              });
              return (
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={ctas.primary.href}
                    className="rounded bg-purple-600 px-3 py-2 text-xs font-medium text-white"
                  >
                    {ctas.primary.label} (£{ctas.primary.price.toFixed(2)})
                  </a>
                  {ctas.secondary && (
                    <a
                      href={ctas.secondary.href}
                      className="rounded border border-purple-300 px-3 py-2 text-xs font-medium text-purple-700"
                    >
                      {ctas.secondary.label} (£{ctas.secondary.price.toFixed(2)})
                    </a>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-700">Email me my report/checklist</p>
              <button
                type="button"
                className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700"
                onClick={() => setEmailOpen(true)}
              >
                Email me this report
              </button>
            </div>
            {emailStatus && <p className="mt-2 text-xs text-gray-500">{emailStatus}</p>}
          </div>
        </section>
      )}

      {emailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 text-sm shadow-lg">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Email me this report</p>
              <button
                type="button"
                className="text-xs text-gray-500"
                onClick={() => setEmailOpen(false)}
              >
                Close
              </button>
            </div>
            <input
              type="email"
              className="mt-3 w-full rounded border border-gray-200 px-2 py-2 text-sm"
              placeholder="you@example.com"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                className="rounded border border-gray-300 px-3 py-2 text-xs"
                onClick={() => setEmailOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-purple-600 px-3 py-2 text-xs text-white"
                onClick={async () => {
                  if (!caseId) return;
                  try {
                    setEmailStatus(null);
                    const email = emailInput.trim();
                    if (!email) {
                      setEmailStatus('Please enter a valid email.');
                      return;
                    }
                    await fetch('/api/leads/capture', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        source: 'ask_heaven',
                        jurisdiction: normalizeJurisdiction(caseContext?.jurisdiction) ?? caseContext?.jurisdiction,
                        caseId,
                        tags: ['report'],
                      }),
                    });
                    await fetch('/api/leads/email-report', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        source: 'ask_heaven',
                        jurisdiction: normalizeJurisdiction(caseContext?.jurisdiction) ?? caseContext?.jurisdiction,
                        caseId,
                      }),
                    });
                    setEmailStatus('Report queued. Check your inbox soon.');
                    setEmailOpen(false);
                  } catch (err) {
                    console.error('Failed to capture email', err);
                    setEmailStatus('Unable to send email right now.');
                  }
                }}
              >
                Send report
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="flex flex-1 flex-col gap-3 rounded-xl border bg-card p-3">
        <div className="flex-1 space-y-3 overflow-y-auto rounded-md border bg-muted/40 p-3 text-sm">
          {chatMessages.length === 0 && (
            <p className="text-muted-foreground">
              Example questions:
              <br />
              • “Can I serve a Section 8 notice if the tenant has paid part of the arrears?”
              <br />
              • “What happens after I send a Notice to Leave in Scotland?”
              <br />
              • “How do I start a money claim for rent arrears?”
            </p>
          )}

          {chatMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-md px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isSending) {
              void handleSend();
            }
          }}
          className="flex gap-2"
        >
          <textarea
            className="min-h-14 flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Ask a question about your landlord problem…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex h-14 items-center justify-center rounded-md border px-3 text-sm font-medium shadow-sm disabled:opacity-50"
          >
            {isSending ? 'Sending…' : 'Ask Heaven'}
          </button>
        </form>
      </section>
    </main>
  );
}
