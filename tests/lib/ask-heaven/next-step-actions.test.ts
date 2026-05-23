import { describe, expect, it } from 'vitest';

import { getAskHeavenNextStepActions } from '@/lib/ask-heaven/next-step-actions';

describe('Ask Heaven next-step actions', () => {
  it('routes England arrears claim intent to the money claim pack', () => {
    const actions = getAskHeavenNextStepActions({
      topic: 'arrears',
      jurisdiction: 'england',
      intent: 'arrears_claim',
    });

    expect(actions.productLed).toBe(true);
    expect(actions.primaryAction).toEqual({
      label: 'Prepare my money claim',
      href: '/products/money-claim',
    });
    expect(actions.secondaryAction.href).toBe('/products/notice-only');
  });

  it('routes England court eviction intent to the complete pack', () => {
    const actions = getAskHeavenNextStepActions({
      topic: 'eviction',
      jurisdiction: 'england',
      intent: 'court_process',
    });

    expect(actions.productLed).toBe(true);
    expect(actions.primaryAction.href).toBe('/products/complete-pack');
    expect(actions.secondaryAction.href).toBe('/products/notice-only');
  });

  it('keeps non-England questions away from England-only product checkout', () => {
    const actions = getAskHeavenNextStepActions({
      topic: 'eviction',
      jurisdiction: 'scotland',
      intent: 'eviction',
    });

    expect(actions.productLed).toBe(false);
    expect(actions.primaryAction.href).toBe('/eviction-process-scotland');
    expect(actions.primaryAction.href.startsWith('/products/')).toBe(false);
    expect(actions.description).toContain('England-only');
  });
});
