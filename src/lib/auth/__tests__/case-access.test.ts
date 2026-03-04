import { describe, it, expect } from 'vitest';
import { assertCaseReadAccess, assertCaseWriteAccess } from '@/lib/auth/case-access';

const req = (token?: string) =>
  new Request('http://localhost/test', {
    headers: token ? { 'x-session-token': token } : {},
  });

describe('case-access', () => {
  it('blocks anonymous case read without token', () => {
    const result = assertCaseReadAccess({
      request: req(),
      user: null,
      caseRow: { user_id: null, session_token: 'abc' },
    });
    expect(result?.status).toBe(404);
  });

  it('blocks anonymous case write with wrong token', () => {
    const result = assertCaseWriteAccess({
      request: req('wrong'),
      user: null,
      caseRow: { user_id: null, session_token: 'abc' },
    });
    expect(result?.status).toBe(404);
  });

  it('allows anonymous case access with correct token', () => {
    const result = assertCaseReadAccess({
      request: req('abc'),
      user: null,
      caseRow: { user_id: null, session_token: 'abc' },
    });
    expect(result).toBeNull();
  });

  it('blocks owned case for non-owner', () => {
    const result = assertCaseWriteAccess({
      request: req(),
      user: { id: 'user-2' },
      caseRow: { user_id: 'user-1', session_token: null },
    });
    expect(result?.status).toBe(404);
  });
});
