'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { RiSendPlaneFill, RiSearchLine, RiBookLine, RiArrowRightLine } from 'react-icons/ri';
import { NextBestActionCard } from '@/components/ask-heaven/NextBestActionCard';
import { isValidAskHeavenRecommendation } from '@/lib/pricing/products';
import type { QuestionDefinition } from '@/lib/validators/question-schema';
import type { Jurisdiction } from '@/lib/jurisdiction/types';
import {
  detectAskHeavenCtaIntent,
  getDefaultIntentForProduct,
  getAskHeavenCtaCopy,
} from '@/lib/ask-heaven/cta-copy';
import {
  getRecommendedProduct,
  type Topic,
} from '@/lib/ask-heaven/topic-detection';
import { getAskHeavenAttribution } from '@/lib/ask-heaven/askHeavenAttribution';
import type { WizardJurisdiction } from '@/lib/wizard/buildWizardLink';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
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

export interface EvidenceSummary {
  id: string;
  file_name?: string;
  doc_type?: string | null;
  doc_type_confidence?: number | null;
  doc_type_reasons?: string[] | null;
}

export interface CaseContext {
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

export interface AskHeavenChatUIProps {
  jurisdiction: Jurisdiction;
  jurisdictionLabels: Record<Jurisdiction, string>;
  jurisdictionFlags: Record<Jurisdiction, string>;
  onJurisdictionChange: (jurisdiction: Jurisdiction) => void;
  isWelcomeState: boolean;
  quickPrompts: Array<{ label: string; icon: string; prompt: string }>;
  onQuickPrompt: (prompt: string) => void;
  initialQuestion?: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isSending: boolean;
  chatMessages: ChatMessage[];
  chatContainerRef: React.RefObject<HTMLDivElement>;
  chatEndRef: React.RefObject<HTMLDivElement>;
  inputRef: React.RefObject<HTMLInputElement>;
  onFollowupClick: (question: string) => void;
  error?: string | null;
  detectedTopic: Topic | null;
  lastQuestion: string;
  suggestedNextStep: 'wizard' | 'checklist' | 'guide' | 'none' | null;
  questionCount: number;
  onCtaClick: (
    ctaType: 'wizard' | 'product' | 'validator' | 'template' | 'next_best_action',
    targetUrl: string,
    ctaLabel: string,
    suggestedProduct?: string
  ) => void;
  buildWizardLinkWithAttribution: (product: string) => string;
  onRequestEmailCapture: (reason: 'compliance_checklist' | 'threshold_gate' | 'manual') => void;
  showComposer?: boolean;
  statusBanner?: React.ReactNode;
  caseId?: string | null;
  caseContext?: CaseContext | null;
  selectedEvidenceId?: string | null;
  selectedEvidence?: EvidenceSummary | null;
  onSelectEvidence?: (id: string) => void;
  questionErrors: Record<string, string>;
  answersSubmitting: boolean;
  renderQuestionInput?: (question: QuestionDefinition) => React.ReactNode;
  onSubmitAnswers: () => void;
  onOpenEmail: () => void;
  emailStatus?: string | null;
}

export function AskHeavenChatUI({
  jurisdiction,
  jurisdictionLabels,
  jurisdictionFlags,
  onJurisdictionChange,
  isWelcomeState,
  quickPrompts,
  onQuickPrompt,
  initialQuestion,
  input,
  onInputChange,
  onSubmit,
  isSending,
  chatMessages,
  chatContainerRef,
  chatEndRef,
  inputRef,
  onFollowupClick,
  error,
  detectedTopic,
  lastQuestion,
  suggestedNextStep,
  questionCount,
  onCtaClick,
  buildWizardLinkWithAttribution,
  onRequestEmailCapture,
  showComposer = true,
  statusBanner,
  caseId,
  caseContext,
  selectedEvidenceId,
  selectedEvidence,
  onSelectEvidence,
  questionErrors,
  answersSubmitting,
  renderQuestionInput,
  onSubmitAnswers,
  onOpenEmail,
  emailStatus,
}: AskHeavenChatUIProps): React.ReactElement {
  return (
    <div className="min-h-[80vh] relative">
      {/* Hero background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/herobg.png)' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {statusBanner && <div className="mb-6">{statusBanner}</div>}

        {/* Jurisdiction Toggle - Copilot-style pill buttons with flags */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm border border-gray-200/50">
            {(Object.keys(jurisdictionLabels) as Jurisdiction[]).map((jur) => (
              <button
                key={jur}
                type="button"
                onClick={() => onJurisdictionChange(jur)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  jurisdiction === jur
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <Image
                  src={jurisdictionFlags[jur]}
                  alt={jurisdictionLabels[jur]}
                  width={20}
                  height={15}
                  className="w-5 h-auto rounded-sm"
                />
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
                    onChange={(event) => onSelectEvidence?.(event.target.value)}
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

              {caseContext.validation_summary?.blockers && caseContext.validation_summary.blockers.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs">
                  <p className="font-semibold text-red-700 mb-1">Blocking Issues</p>
                  <ul className="list-disc pl-4 space-y-1 text-red-600">
                    {caseContext.validation_summary.blockers.map((blocker) => (
                      <li key={blocker.code}>{blocker.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {caseContext.validation_summary?.warnings && caseContext.validation_summary.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs">
                  <p className="font-semibold text-amber-800 mb-1">Warnings</p>
                  <ul className="list-disc pl-4 space-y-1 text-amber-700">
                    {caseContext.validation_summary.warnings.map((warning) => (
                      <li key={warning.code}>{warning.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {caseContext.recommendations?.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs">
                  <p className="font-semibold text-gray-700 mb-1">Recommendations</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    {caseContext.recommendations.map((recommendation) => (
                      <li key={recommendation.code}>{recommendation.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {caseContext.next_questions.length > 0 && renderQuestionInput && (
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
                      onClick={onSubmitAnswers}
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
                onClick={onOpenEmail}
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
              {/* Owl Icon */}
              <div className="flex justify-center mb-6">
                <Image
                  src="/favicon.png"
                  alt="Ask Heaven"
                  width={64}
                  height={64}
                  className="drop-shadow-lg"
                  priority
                />
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
                    onSubmit();
                  }
                }}
                className="max-w-2xl mx-auto mb-10"
              >
                <div className="relative">
                  <div className="flex items-center bg-white border-2 border-gray-200 rounded-full shadow-lg hover:border-primary/30 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                    <div className="pl-5 text-gray-400">
                      <RiSearchLine className="w-5 h-5" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      className="flex-1 py-4 px-3 text-gray-900 placeholder-gray-400 bg-transparent focus:outline-none text-base"
                      placeholder="Ask about evictions, rent arrears, deposits..."
                      value={input}
                      onChange={(e) => onInputChange(e.target.value)}
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={isSending || !input.trim()}
                      className="m-2 p-3 bg-primary hover:bg-primary-700 text-white rounded-full disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      aria-label="Send message"
                    >
                      <RiSendPlaneFill className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {initialQuestion && (
                  <p className="mt-3 text-sm text-gray-500 text-center">
                    We’ve prefilled your question — edit or submit.
                  </p>
                )}
              </form>

              {/* Popular Topics Section with Mascot */}
              <div className="relative max-w-3xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 pr-32 md:pr-48">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📋</span>
                    <h3 className="font-bold text-gray-900">Popular Topics</h3>
                  </div>
                  <div className="space-y-3">
                    {quickPrompts.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => onQuickPrompt(item.prompt)}
                        className="group w-full flex items-start gap-3 p-3 bg-gray-50 hover:bg-primary/5 rounded-xl border border-gray-100 hover:border-primary/30 text-left transition-all duration-200"
                      >
                        <span className="text-lg flex-shrink-0">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-500">{item.prompt}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Mascot positioned on the right */}
                <div className="absolute -right-4 md:-right-8 bottom-0 w-32 md:w-56 pointer-events-none">
                  <Image
                    src="/images/heromascot.png"
                    alt="Ask Heaven Mascot"
                    width={224}
                    height={280}
                    className="w-full h-auto drop-shadow-xl"
                    priority
                  />
                </div>
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
                                    onClick={() => onFollowupClick(question)}
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
                                  const topicForIntent = (m.suggestedTopic as Topic) ?? detectedTopic;
                                  const intent = detectAskHeavenCtaIntent(
                                    topicForIntent,
                                    lastQuestion
                                  ) ?? getDefaultIntentForProduct(m.suggestedProduct as any);
                                  let cta = intent
                                    ? getAskHeavenCtaCopy({
                                        product: m.suggestedProduct as any,
                                        jurisdiction,
                                        intent,
                                      })
                                    : null;
                                  if (!cta && topicForIntent && intent) {
                                    const fallback = getRecommendedProduct(
                                      topicForIntent,
                                      jurisdiction as WizardJurisdiction,
                                      intent
                                    );
                                    if (fallback) {
                                      cta = getAskHeavenCtaCopy({
                                        product: fallback.product,
                                        jurisdiction,
                                        intent,
                                      });
                                    }
                                  }
                                  if (!cta) {
                                    return null;
                                  }
                                  const wizardUrl = buildWizardLinkWithAttribution(cta.product);
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => onCtaClick('wizard', wizardUrl, cta.title, m.suggestedProduct ?? undefined)}
                                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/40 transition-all group cursor-pointer text-left"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-primary group-hover:text-primary-700">
                                          {cta.title}
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

                            {/* Next Best Action CTA - shown when topic matches eviction/money claim/tenancy intent */}
                            {(!m.suggestedProduct || !isValidAskHeavenRecommendation(m.suggestedProduct)) &&
                              m.suggestedNextStep === 'wizard' &&
                              m.suggestedTopic &&
                              ['eviction', 'arrears', 'tenancy'].includes(m.suggestedTopic) && (
                                <NextBestActionCard
                                  topic={m.suggestedTopic as Topic}
                                  jurisdiction={jurisdiction}
                                  suggestedNextStep={m.suggestedNextStep}
                                  lastQuestion={lastQuestion}
                                  questionCount={questionCount}
                                  attribution={getAskHeavenAttribution()}
                                  onCtaClick={(ctaType, targetUrl, ctaLabel) => onCtaClick(ctaType as any, targetUrl, ctaLabel, m.suggestedProduct ?? undefined)}
                                  onRequestEmailCapture={onRequestEmailCapture}
                                />
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
              {showComposer && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!isSending && input.trim()) {
                        onSubmit();
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
                        onChange={(e) => onInputChange(e.target.value)}
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
