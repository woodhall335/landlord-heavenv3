import { describe, expect, it } from 'vitest';
import { safeInternalRedirect } from '@/lib/security/redirects';

describe('safeInternalRedirect', () => {
  it('allows relative paths', () => expect(safeInternalRedirect('/wizard?x=1')).toBe('/wizard?x=1'));
  it('blocks absolute url', () => expect(safeInternalRedirect('https://evil.com')).toBe('/dashboard'));
  it('blocks protocol relative url', () => expect(safeInternalRedirect('//evil.com')).toBe('/dashboard'));
  it('blocks backslash and whitespace tricks', () => {
    expect(safeInternalRedirect('/\\evil')).toBe('/dashboard');
    expect(safeInternalRedirect('/ bad')).toBe('/dashboard');
  });
});
