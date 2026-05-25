import { createHmac, timingSafeEqual } from 'node:crypto';

export const RECOVERY_UNSUBSCRIBED_EVENT = 'recovery_unsubscribed';

type RecoveryEmailEvent = {
  email?: string | null;
  event_type?: string | null;
};

type RecoveryUnsubscribeSource = 'checkout' | 'preview' | 'wizard' | 'manual' | 'recovery';

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://landlordheaven.co.uk';
}

function getSigningSecret(): string {
  return (
    process.env.RECOVERY_UNSUBSCRIBE_SECRET ||
    process.env.CRON_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'development-recovery-unsubscribe-secret'
  );
}

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(encodedPayload: string): string {
  return createHmac('sha256', getSigningSecret()).update(encodedPayload).digest('base64url');
}

export function normalizeRecoveryEmail(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
}

export function createRecoveryUnsubscribeToken(email: string): string {
  const normalizedEmail = normalizeRecoveryEmail(email);
  if (!normalizedEmail) {
    throw new Error('Cannot create recovery unsubscribe token without an email address');
  }

  const payload = base64UrlEncode(
    JSON.stringify({
      v: 1,
      purpose: RECOVERY_UNSUBSCRIBED_EVENT,
      email: normalizedEmail,
    })
  );
  return `${payload}.${signPayload(payload)}`;
}

export function verifyRecoveryUnsubscribeToken(token: string | null | undefined): { email: string } | null {
  if (!token || !token.includes('.')) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expectedSignature = signPayload(payload);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as {
      v?: number;
      purpose?: string;
      email?: string;
    };
    const email = normalizeRecoveryEmail(decoded.email);
    if (decoded.v !== 1 || decoded.purpose !== RECOVERY_UNSUBSCRIBED_EVENT || !email) {
      return null;
    }
    return { email };
  } catch {
    return null;
  }
}

export function buildRecoveryUnsubscribeUrl(
  email: string,
  source: RecoveryUnsubscribeSource = 'recovery'
): string {
  const url = new URL('/api/recovery/unsubscribe', getAppUrl());
  url.searchParams.set('token', createRecoveryUnsubscribeToken(email));
  url.searchParams.set('source', source);
  return url.toString();
}

export function isRecoveryUnsubscribedFromEvents(
  events: RecoveryEmailEvent[],
  email: string | null | undefined
): boolean {
  const normalizedEmail = normalizeRecoveryEmail(email);
  if (!normalizedEmail) return false;

  return events.some(
    (event) =>
      event.event_type === RECOVERY_UNSUBSCRIBED_EVENT &&
      normalizeRecoveryEmail(event.email) === normalizedEmail
  );
}
