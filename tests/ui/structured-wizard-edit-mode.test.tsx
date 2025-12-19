// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
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
  });
});
