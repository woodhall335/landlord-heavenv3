/** @vitest-environment jsdom */
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWizardProgressPersistence } from '../useWizardProgressPersistence';
vi.mock('@/lib/session-token', () => ({ getSessionTokenHeaders: () => ({ 'x-session-token': 'test-token' }) }));
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  window.history.replaceState({}, '', '/wizard/flow?case_id=11111111-1111-4111-8111-111111111111');
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); window.history.replaceState({}, '', '/'); });
describe('wizard progress reporting', () => {
  it('debounces changes and sends the actual completion percentage with the case token', async () => {
    const { rerender } = renderHook(({ progress }) => useWizardProgressPersistence(progress), { initialProps: { progress: 0 } });
    rerender({ progress: 37.8 });
    await act(async () => { vi.advanceTimersByTime(600); });
    expect(fetch).toHaveBeenCalledTimes(1);
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(options!.body as string)).toEqual({ case_id: '11111111-1111-4111-8111-111111111111', progress: 38 });
    expect(options!.headers).toMatchObject({ 'x-session-token': 'test-token' });
  });
  it('does not report for pages without a case or after unmount', async () => {
    const { unmount } = renderHook(() => useWizardProgressPersistence(30));
    unmount();
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(fetch).not.toHaveBeenCalled();
    window.history.replaceState({}, '', '/wizard');
    renderHook(() => useWizardProgressPersistence(30));
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(fetch).not.toHaveBeenCalled();
  });
});
