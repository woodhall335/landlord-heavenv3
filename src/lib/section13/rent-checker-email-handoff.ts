import { createHash, randomBytes } from 'node:crypto';

export const RENT_CHECKER_EMAIL_HANDOFF_EVENT = 'rent_checker_email_handoff_saved';
export const RENT_CHECKER_EMAIL_HANDOFF_USED_EVENT = 'rent_checker_email_handoff_used';
export const RENT_CHECKER_EMAIL_HANDOFF_EXPIRES_DAYS = 14;

export function createRentCheckerEmailHandoffToken(): {
  token: string;
  tokenHash: string;
} {
  const token = randomBytes(24).toString('hex');
  return {
    token,
    tokenHash: hashRentCheckerEmailHandoffToken(token),
  };
}

export function hashRentCheckerEmailHandoffToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function getRentCheckerEmailHandoffExpiry(now = new Date()): string {
  return new Date(
    now.getTime() + RENT_CHECKER_EMAIL_HANDOFF_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();
}
