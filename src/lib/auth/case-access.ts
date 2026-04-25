import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth/admin-ids';

export type CaseAccessCaseRow = {
  user_id: string | null;
  session_token?: string | null;
};

export function getSessionTokenFromRequest(request: Request): string | null {
  const token = request.headers.get('x-session-token');
  return token && token.trim() ? token.trim() : null;
}

function deniedResponse() {
  return NextResponse.json({ error: 'Case not found' }, { status: 404 });
}

export function assertCaseReadAccess(params: {
  request: Request;
  user: { id: string } | null;
  caseRow: CaseAccessCaseRow;
}): NextResponse | null {
  const { request, user, caseRow } = params;

  if (user && isAdmin(user.id)) {
    return null;
  }

  if (caseRow.user_id) {
    if (!user || caseRow.user_id !== user.id) {
      return deniedResponse();
    }
    return null;
  }

  const requestToken = getSessionTokenFromRequest(request);
  if (!requestToken || !caseRow.session_token || requestToken !== caseRow.session_token) {
    return deniedResponse();
  }

  return null;
}

export function assertCaseWriteAccess(params: {
  request: Request;
  user: { id: string } | null;
  caseRow: CaseAccessCaseRow;
}): NextResponse | null {
  return assertCaseReadAccess(params);
}
