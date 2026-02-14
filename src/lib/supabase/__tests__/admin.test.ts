import { describe, expect, it } from 'vitest';
import { getSupabaseAdminJwtPreview } from '@/lib/supabase/admin';

describe('getSupabaseAdminJwtPreview', () => {
  it('returns a safe error preview for invalid tokens', () => {
    const original = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'invalid.token';

    const preview = getSupabaseAdminJwtPreview();

    expect(preview).toEqual({ ok: false, error: 'jwt_preview_failed' });

    process.env.SUPABASE_SERVICE_ROLE_KEY = original;
  });

  it('returns minimal fields for a valid payload', () => {
    const original = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const payload = Buffer.from(
      JSON.stringify({ role: 'service_role', ref: 'ref', iss: 'iss', iat: 1, exp: 2 })
    ).toString('base64url');
    process.env.SUPABASE_SERVICE_ROLE_KEY = `header.${payload}.sig`;

    const preview = getSupabaseAdminJwtPreview();

    expect(preview).toEqual({
      ok: true,
      role: 'service_role',
      ref: 'ref',
      iat: 1,
      exp: 2,
    });

    process.env.SUPABASE_SERVICE_ROLE_KEY = original;
  });
});
