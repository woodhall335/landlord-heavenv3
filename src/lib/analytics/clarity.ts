type Clarity = ((...args: unknown[]) => void) & { q?: unknown[][] };

/** Only route dimensions: never customer names, case IDs, answers or error text. */
export function trackClarityWizardEvent(event: 'wizard_step_view' | 'wizard_save_failed' | 'wizard_checkout_started', dimensions: { product?: string; jurisdiction?: string; step?: string } = {}) {
  if (typeof window === 'undefined' || process.env.NEXT_PUBLIC_DISABLE_JOURNEY_ANALYTICS === 'true') return;
  const target = window as Window & { clarity?: Clarity };
  if (!target.clarity) {
    const queue: Clarity = (...args) => { (queue.q ||= []).push(args); };
    target.clarity = queue;
  }
  try {
    for (const [key, value] of Object.entries(dimensions)) {
      if (value && /^[a-z0-9_-]{1,80}$/i.test(value)) target.clarity('set', `wizard_${key}`, value);
    }
    target.clarity('event', event);
  } catch {
    // Analytics must never interrupt saving answers or starting payment.
  }
}
