// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { StructuredWizard } from '@/components/wizard/StructuredWizard';

const originalFetch = global.fetch;

describe('StructuredWizard edit mode', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ next_question: null, is_complete: true, progress: 100 }),
    } as any);
    // @ts-expect-error - mock fetch for tests
    global.fetch = fetchMock;
  });

  afterEach(() => {
    fetchMock.mockReset();
    global.fetch = originalFetch;
  });

  it('does not auto-redirect when a completed case is opened in edit mode', async () => {
    const onComplete = vi.fn();

    render(
      <StructuredWizard
        caseId="case-edit-123"
        caseType="eviction"
        jurisdiction="england"
        product="notice_only"
        onComplete={onComplete}
        mode="edit"
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    await waitFor(() => expect(onComplete).not.toHaveBeenCalled());

    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.mode).toBe('edit');
    expect(body.include_answered).toBe(true);
  });

  it('saves answers in edit mode without redirecting and requests the next question in review order', async () => {
    fetchMock.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url.includes('/api/wizard/next-question')) {
        const body = options?.body ? JSON.parse(options.body as string) : {};

        if (!body.current_question_id) {
          return new Response(
            JSON.stringify({
              next_question: {
                id: 'your_details',
                question: 'Your details',
                inputType: 'text',
                section: 'Your details',
              },
              is_complete: false,
              progress: 90,
            }),
            { status: 200 },
          );
        }

        return new Response(
          JSON.stringify({
            next_question: null,
            is_complete: true,
            progress: 100,
          }),
          { status: 200 },
        );
      }

      if (url.includes('/api/wizard/answer')) {
        return new Response(JSON.stringify({ is_complete: false, progress: 95 }), { status: 200 });
      }

      if (url.includes('/api/cases/')) {
        return new Response(JSON.stringify({ case: { collected_facts: {} } }), { status: 200 });
      }

      return new Response('{}', { status: 200 });
    });

    const onComplete = vi.fn();

    render(
      <StructuredWizard
        caseId="case-edit-123"
        caseType="eviction"
        jurisdiction="england"
        product="notice_only"
        onComplete={onComplete}
        mode="edit"
      />,
    );

    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'Alice' } });

    fireEvent.click(await screen.findByRole('button', { name: /next/i }));

    await waitFor(() => expect(onComplete).not.toHaveBeenCalled());

    const nextQuestionCalls = fetchMock.mock.calls.filter(([callUrl]) =>
      typeof callUrl === 'string' && callUrl.includes('/api/wizard/next-question'),
    );

    expect(nextQuestionCalls.length).toBe(2);
    nextQuestionCalls.forEach(([, requestInit]) => {
      const body = JSON.parse((requestInit as RequestInit).body as string);
      expect(body.mode).toBe('edit');
      expect(body.include_answered).toBe(true);
    });
  });
});
