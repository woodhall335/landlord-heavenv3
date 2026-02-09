import { describe, expect, it } from 'vitest';
import { buildAskHeavenRestUrl } from '@/lib/ask-heaven/admin-parity';

describe('buildAskHeavenRestUrl', () => {
  it('builds a rest url with encoded slug', () => {
    const url = buildAskHeavenRestUrl('https://example.supabase.co', 'hello world');
    expect(url).not.toBeNull();
    const parsed = new URL(url ?? '');
    expect(parsed.pathname).toBe('/rest/v1/ask_heaven_questions');
    expect(parsed.searchParams.get('select')).toBe('id,slug,status');
    expect(parsed.searchParams.get('slug')).toBe('eq.hello%20world');
  });

  it('returns null for invalid urls', () => {
    const url = buildAskHeavenRestUrl('not-a-url', 'slug');
    expect(url).toBeNull();
  });
});
