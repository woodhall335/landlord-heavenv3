import { isAdmin } from '@/lib/auth';

export type PreviewUser = { id: string } | null;
export type PreviewCaseOwner = { user_id?: string | null };

export function canReadPreviewCase(user: PreviewUser, caseRow: PreviewCaseOwner): boolean {
  if (!caseRow.user_id) return true;
  if (!user) return false;
  return caseRow.user_id === user.id || isAdmin(user.id);
}

export function getPreviewCaseAccessDenial(
  user: PreviewUser,
  caseRow: PreviewCaseOwner
): 'anonymous_linked_case' | 'different_user' | null {
  if (canReadPreviewCase(user, caseRow)) {
    return null;
  }

  return user ? 'different_user' : 'anonymous_linked_case';
}
