// src/app/ask-heaven/page.tsx
'use client';

import React, { useCallback, useState } from 'react';
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

const defaultJurisdiction: Jurisdiction = 'england-wales';
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
  }, [input, chatMessages, jurisdiction, caseType, product]);

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
            <option value="england-wales">England &amp; Wales</option>
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
