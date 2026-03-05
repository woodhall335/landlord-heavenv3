// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { WizardContainer } from '@/components/wizard/WizardContainer';

describe('Conversational wizard follow-up handling', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();

    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/wizard/start')) {
        return new Response(
          JSON.stringify({
            case_id: 'case-1',
            next_question: {
              id: 'case_overview',
              question: 'Briefly describe the situation',
              input_type: 'textarea',
              helper_text: 'Describe the issue',
            },
          }),
          { status: 200 },
        );
      }

      if (url.includes('/api/wizard/answer')) {
        return new Response(
          JSON.stringify({
            case_id: 'case-1',
            question_id: 'case_overview',
            answer_saved: true,
            ask_heaven: {
              suggested_wording: 'Improved wording',
              missing_information: [],
              evidence_suggestions: [],
              consistency_flags: [],
            },
            next_question: null,
            is_complete: false,
            progress: 10,
          }),
          { status: 200 },
        );
      }

      if (url.includes('/api/wizard/next-question')) {
        return new Response(
          JSON.stringify({
            next_question: {
              id: 'case_overview',
              question: 'Briefly describe the situation (again)',
              input_type: 'textarea',
              helper_text: 'Describe the issue',
            },
            is_complete: false,
          }),
          { status: 200 },
        );
      }

      return new Response('{}', { status: 404 });
    });

    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not resubmit follow-up chat for the same MQS question', async () => {
    render(
      <WizardContainer
        caseType="eviction"
        jurisdiction="england"
        onComplete={() => undefined}
      />,
    );

    const textarea = await screen.findByPlaceholderText('Describe the issue');
    fireEvent.change(textarea, {
      target: { value: 'First detailed description' },
    });

    fireEvent.click(await screen.findByRole('button', { name: /continue/i }));

    // Wait for the initial save + next question fetches
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/wizard/next-question'), expect.anything()));

    fireEvent.change(textarea, {
      target: { value: 'Yes thats correct' },
    });

    fireEvent.click(await screen.findByRole('button', { name: /continue/i }));

    // Ensure no extra /api/wizard/answer call was made for the follow-up chatty message
    const answerCalls = fetchMock.mock.calls.filter(([url]) =>
      typeof url === 'string' && url.includes('/api/wizard/answer'),
    );

    expect(answerCalls.length).toBe(1);
  });

  it('sends x-session-token on start, next-question, answer, and analyze requests', async () => {
    fetchMock.mockReset();

    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes('/api/wizard/start')) {
        return new Response(
          JSON.stringify({
            case_id: 'case-token-check',
            next_question: {
              id: 'q1',
              question: 'Was rent paid?',
              input_type: 'yes_no',
            },
          }),
          { status: 200 },
        );
      }

      if (url.includes('/api/wizard/answer')) {
        return new Response(JSON.stringify({ answer_saved: true }), { status: 200 });
      }

      if (url.includes('/api/wizard/next-question')) {
        return new Response(JSON.stringify({ is_complete: true }), { status: 200 });
      }

      if (url.includes('/api/wizard/analyze')) {
        return new Response(JSON.stringify({ success: true, analysis: {} }), { status: 200 });
      }

      return new Response('{}', { status: 404 });
    });

    const onComplete = vi.fn();

    render(
      <WizardContainer
        caseType="eviction"
        jurisdiction="england"
        onComplete={onComplete}
      />,
    );

    const yesButton = await screen.findByRole('button', { name: /^yes$/i });
    fireEvent.click(yesButton);
    fireEvent.click(await screen.findByRole('button', { name: /continue/i }));

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([callUrl]) => typeof callUrl === 'string' && callUrl.includes('/api/wizard/analyze'),
        ),
      ).toBe(true),
    );

    const wizardCalls = fetchMock.mock.calls.filter(([callUrl]) =>
      typeof callUrl === 'string' &&
      ['/api/wizard/start', '/api/wizard/next-question', '/api/wizard/answer', '/api/wizard/analyze'].some((path) =>
        callUrl.includes(path),
      ),
    );

    expect(wizardCalls.length).toBeGreaterThanOrEqual(4);

    const sessionTokens = wizardCalls.map(([, options]) => {
      const headers = (options as RequestInit | undefined)?.headers as Record<string, string> | undefined;
      return headers?.['x-session-token'];
    });

    expect(sessionTokens.every(Boolean)).toBe(true);
    expect(new Set(sessionTokens).size).toBe(1);
  });

});
