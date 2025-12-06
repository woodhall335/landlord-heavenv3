// src/components/wizard/AskHeavenPanel.tsx
'use client';

import React, { useCallback, useState } from 'react';

type CaseType = 'eviction' | 'money_claim' | 'tenancy_agreement';
type Jurisdiction = 'england-wales' | 'scotland' | 'northern-ireland';
type Product = 'notice_only' | 'complete_pack' | 'money_claim' | 'tenancy_agreement';

interface AskHeavenPanelProps {
  caseId: string;
  caseType: CaseType;
  jurisdiction: Jurisdiction;
  product: Product;
  currentQuestionId?: string | null;
  currentQuestionText?: string | null;
  currentAnswer?: string | null;
}

type ChatRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

type TabId = 'writing' | 'chat';

export const AskHeavenPanel: React.FC<AskHeavenPanelProps> = ({
  caseId,
  caseType,
  jurisdiction,
  product,
  currentQuestionId,
  currentQuestionText,
  currentAnswer,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('writing');

  // Writing helper state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanced, setEnhanced] = useState<{
    suggested?: string;
    missing_information?: string[];
    evidence_suggestions?: string[];
  } | null>(null);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleEnhance = useCallback(async () => {
    if (!currentQuestionId || !currentAnswer) {
      setEnhanceError('Please answer the question first so Ask Heaven can help you refine it.');
      return;
    }

    setIsEnhancing(true);
    setEnhanceError(null);

    try {
      const res = await fetch('/api/ask-heaven/enhance-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseId,
          case_type: caseType,
          jurisdiction,
          product,
          question_id: currentQuestionId,
          question_text: currentQuestionText,
          answer: currentAnswer,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setEnhanceError(body?.error ?? 'Ask Heaven could not enhance this answer right now.');
        setEnhanced(null);
        return;
      }

      const body = (await res.json()) as {
        suggested_wording?: string;
        missing_information?: string[];
        evidence_suggestions?: string[];
      };

      setEnhanced({
        suggested: body.suggested_wording,
        missing_information: body.missing_information ?? [],
        evidence_suggestions: body.evidence_suggestions ?? [],
      });
    } catch {
      setEnhanceError('Ask Heaven encountered a problem. Please try again.');
      setEnhanced(null);
    } finally {
      setIsEnhancing(false);
    }
  }, [caseId, caseType, jurisdiction, product, currentQuestionId, currentQuestionText, currentAnswer]);

  const handleSendChat = useCallback(async () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    setChatError(null);
    setIsChatting(true);

    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...chatMessages, newMessage];
    setChatMessages(nextMessages);
    setChatInput('');

    try {
      const res = await fetch('/api/ask-heaven/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_id: caseId,
          case_type: caseType,
          jurisdiction,
          product,
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setChatError(body?.error ?? 'Ask Heaven could not reply right now.');
        return;
      }

      const body = (await res.json()) as {
        reply: string;
      };

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: body.reply,
        createdAt: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setChatError('Ask Heaven encountered a problem. Please try again.');
    } finally {
      setIsChatting(false);
    }
  }, [chatInput, chatMessages, caseId, caseType, jurisdiction, product]);

  const renderWritingTab = () => (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        Ask Heaven can refine your wording and highlight missing details based on your{' '}
        <span className="font-medium">{product.replace('_', ' ')}</span> answers for{' '}
        <span className="font-medium">{jurisdiction}</span>. It behaves like a cautious senior
        housing solicitor, but cannot give personalised legal advice.
      </p>

      <button
        type="button"
        onClick={handleEnhance}
        disabled={isEnhancing || !currentAnswer}
        className="inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm disabled:opacity-50"
      >
        {isEnhancing ? 'Analyzing…' : 'Improve this answer'}
      </button>

      {enhanceError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {enhanceError}
        </div>
      )}

      {enhanced && (
        <div className="flex flex-col gap-3">
          {enhanced.suggested && (
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested wording
              </div>
              <p className="whitespace-pre-wrap text-sm">{enhanced.suggested}</p>
            </div>
          )}

          {enhanced.missing_information && enhanced.missing_information.length > 0 && (
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Missing information
              </div>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {enhanced.missing_information.map((item, idx) => (
                  <li key={`missing-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {enhanced.evidence_suggestions && enhanced.evidence_suggestions.length > 0 && (
            <div className="rounded-md border bg-muted/40 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Evidence suggestions
              </div>
              <ul className="list-disc space-y-1 pl-4 text-sm">
                {enhanced.evidence_suggestions.map((item, idx) => (
                  <li key={`evidence-${idx}`}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {!enhanced.suggested &&
            (!enhanced.missing_information || enhanced.missing_information.length === 0) &&
            (!enhanced.evidence_suggestions || enhanced.evidence_suggestions.length === 0) && (
              <p className="text-sm text-muted-foreground">
                Ask Heaven did not find any obvious improvements, but you can still use the chat tab to
                ask follow-up questions.
              </p>
            )}
        </div>
      )}
    </div>
  );

  const renderChatTab = () => (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-md border bg-muted/40 p-3 text-sm">
        {chatMessages.length === 0 && (
          <p className="text-muted-foreground">
            Ask questions about your <span className="font-medium">{caseType}</span> for{' '}
            <span className="font-medium">{jurisdiction}</span>. Ask Heaven uses your case details
            where available, but cannot change your answers or create new legal rules, and it does not
            replace a solicitor.
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

      {chatError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {chatError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isChatting) {
            void handleSendChat();
          }
        }}
        className="flex gap-2"
      >
        <textarea
          className="min-h-12 flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Ask a question about your notice, eviction pack, or money claim…"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={isChatting || !chatInput.trim()}
          className="inline-flex h-12 items-center justify-center rounded-md border px-3 text-sm font-medium shadow-sm disabled:opacity-50"
        >
          {isChatting ? 'Sending…' : 'Ask'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Ask Heaven</h2>
          <p className="text-xs text-muted-foreground">
            Smart landlord assistant for{' '}
            <span className="font-medium">
              {product.replace('_', ' ')} · {jurisdiction}
            </span>
            . It thinks like a £500/hour housing solicitor, but stays within strict safety rules and
            does not replace legal advice.
          </p>
        </div>
      </div>

      <div className="mb-3 flex gap-2 border-b pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('writing')}
          className={`rounded-md px-2 py-1 ${
            activeTab === 'writing'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Writing helper
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`rounded-md px-2 py-1 ${
            activeTab === 'chat'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          Ask questions
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'writing' ? renderWritingTab() : renderChatTab()}
      </div>
    </div>
  );
};
