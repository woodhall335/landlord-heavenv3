import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('recovery unsubscribe helper', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = 'test-recovery-secret';
    process.env.NEXT_PUBLIC_APP_URL = 'https://landlordheaven.co.uk';
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it('creates a signed unsubscribe URL that verifies back to the normalized email', async () => {
    const {
      buildRecoveryUnsubscribeUrl,
      verifyRecoveryUnsubscribeToken,
    } = await import('@/lib/recovery/unsubscribe');

    const unsubscribeUrl = buildRecoveryUnsubscribeUrl('Alex@Example.COM ', 'wizard');
    const url = new URL(unsubscribeUrl);

    expect(url.origin).toBe('https://landlordheaven.co.uk');
    expect(url.pathname).toBe('/api/recovery/unsubscribe');
    expect(url.searchParams.get('source')).toBe('wizard');
    expect(verifyRecoveryUnsubscribeToken(url.searchParams.get('token'))).toEqual({
      email: 'alex@example.com',
    });
  });

  it('detects recovery unsubscribe events for matching email addresses', async () => {
    const { isRecoveryUnsubscribedFromEvents } = await import('@/lib/recovery/unsubscribe');

    expect(
      isRecoveryUnsubscribedFromEvents(
        [
          { email: 'other@example.com', event_type: 'recovery_unsubscribed' },
          { email: 'LANDLORD@example.com', event_type: 'recovery_unsubscribed' },
        ],
        'landlord@example.com'
      )
    ).toBe(true);
  });
});
