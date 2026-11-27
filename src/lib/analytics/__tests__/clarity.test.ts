/** @vitest-environment jsdom */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackClarityWizardEvent } from '../clarity';
const target = window as Window & { clarity?: any };
afterEach(() => { delete target.clarity; vi.unstubAllEnvs(); });
describe('Clarity wizard diagnostics', () => {
  it('queues safe route tags before the asynchronous loader finishes', () => {
    trackClarityWizardEvent('wizard_step_view', { product: 'notice_only', step: 'property', jurisdiction: 'england' });
    expect(target.clarity.q).toContainEqual(['set', 'wizard_product', 'notice_only']);
    expect(target.clarity.q).toContainEqual(['event', 'wizard_step_view']);
  });
  it('omits free text and honours the analytics disable switch', () => {
    trackClarityWizardEvent('wizard_save_failed', { product: 'Customer name and email@example.com' });
    expect(target.clarity.q).toEqual([['event', 'wizard_save_failed']]);
    delete target.clarity;
    vi.stubEnv('NEXT_PUBLIC_DISABLE_JOURNEY_ANALYTICS', 'true');
    trackClarityWizardEvent('wizard_save_failed');
    expect(target.clarity).toBeUndefined();
  });
  it('cannot break saving or payment when the analytics script throws', () => {
    target.clarity = () => { throw new Error('script failure'); };
    expect(() => trackClarityWizardEvent('wizard_checkout_started', { product: 'notice_only' })).not.toThrow();
  });
});
