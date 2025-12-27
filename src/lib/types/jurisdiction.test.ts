import { describe, expect, test } from 'vitest';
import { normalizeJurisdiction, renderingJurisdictionKey } from './jurisdiction';

describe('jurisdiction helpers', () => {
  test('normalizeJurisdiction FAILS CLOSED for legacy england-wales (returns undefined)', () => {
    // IMPORTANT: Do NOT map to england - requires explicit migration with property_location
    expect(normalizeJurisdiction('england-wales')).toBeUndefined();
    expect(normalizeJurisdiction('England & Wales')).toBeUndefined();
  });

  test('normalizeJurisdiction returns canonical values and rejects invalid entries', () => {
    expect(normalizeJurisdiction('wales')).toBe('wales');
    expect(normalizeJurisdiction('scotland')).toBe('scotland');
    expect(normalizeJurisdiction('northern-ireland')).toBe('northern-ireland');
    expect(normalizeJurisdiction('mars')).toBeUndefined();
    expect(normalizeJurisdiction(null)).toBeUndefined();
  });

  test('renderingJurisdictionKey echoes canonical keys for templates', () => {
    expect(renderingJurisdictionKey('england')).toBe('england');
    expect(renderingJurisdictionKey('wales')).toBe('wales');
    expect(renderingJurisdictionKey('scotland')).toBe('scotland');
  });
});
