import { afterEach, describe, expect, it } from 'vitest';

import { canReadPreviewCase, getPreviewCaseAccessDenial } from '../case-preview-access';

describe('preview case access', () => {
  const originalAdminIds = process.env.ADMIN_USER_IDS;

  afterEach(() => {
    process.env.ADMIN_USER_IDS = originalAdminIds;
  });

  it('allows the owner to read a linked preview case', () => {
    expect(canReadPreviewCase({ id: 'owner-1' }, { user_id: 'owner-1' })).toBe(true);
    expect(getPreviewCaseAccessDenial({ id: 'owner-1' }, { user_id: 'owner-1' })).toBeNull();
  });

  it('allows admins to read another user preview case', () => {
    process.env.ADMIN_USER_IDS = 'admin-1';

    expect(canReadPreviewCase({ id: 'admin-1' }, { user_id: 'owner-1' })).toBe(true);
    expect(getPreviewCaseAccessDenial({ id: 'admin-1' }, { user_id: 'owner-1' })).toBeNull();
  });

  it('denies a different non-admin user without leaking ownership details', () => {
    process.env.ADMIN_USER_IDS = 'admin-1';

    expect(canReadPreviewCase({ id: 'other-user' }, { user_id: 'owner-1' })).toBe(false);
    expect(getPreviewCaseAccessDenial({ id: 'other-user' }, { user_id: 'owner-1' })).toBe(
      'different_user'
    );
  });

  it('denies anonymous access to linked customer cases', () => {
    expect(canReadPreviewCase(null, { user_id: 'owner-1' })).toBe(false);
    expect(getPreviewCaseAccessDenial(null, { user_id: 'owner-1' })).toBe(
      'anonymous_linked_case'
    );
  });

  it('allows anonymous access only for unlinked preview cases', () => {
    expect(canReadPreviewCase(null, { user_id: null })).toBe(true);
    expect(canReadPreviewCase(null, {})).toBe(true);
  });
});
