/** @vitest-environment jsdom */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WizardStartTrend } from '../WizardStartTrend';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const result = { available: true, latestStart: '2026-11-13', previousStart: '2026-10-30', end: '2026-11-27', trackingStartedAt: '2026-11-27T10:00:00Z', latestComplete: false, previousComplete: false, products: [{ caseType: 'eviction', product: 'notice_only', previous: 4, latest: 22 }, { caseType: 'money_claim', product: 'money_claim', previous: 6, latest: 8 }] };
describe('wizard creation counts', () => {
  it('withholds percentage changes for incomplete historic coverage', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => result }));
    render(<WizardStartTrend caseType="eviction" />);
    expect(await screen.findByText(/Historical coverage is incomplete/)).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.queryByText('8')).not.toBeInTheDocument();
    expect(screen.queryByText('450%')).not.toBeInTheDocument();
  });
  it('shows a change only when both complete periods were recorded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ...result, latestComplete: true, previousComplete: true }) }));
    render(<WizardStartTrend product="notice_only" />);
    expect(await screen.findByText('450%')).toBeInTheDocument();
    expect(screen.queryByText(/Historical coverage is incomplete/)).not.toBeInTheDocument();
  });
  it('shows missing tracking setup rather than a false zero count', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ available: false, reason: 'Apply migration 031 to enable durable start counts.' }) }));
    render(<WizardStartTrend />);
    expect(await screen.findByText(/Apply migration 031/)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
