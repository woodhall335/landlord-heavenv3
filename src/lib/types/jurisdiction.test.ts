import { describe, expect, test } from 'vitest';
import { normalizeJurisdiction, renderingJurisdictionKey } from './jurisdiction';

describe('jurisdiction helpers', () => {
  test('normalizeJurisdiction maps legacy england-wales to england', () => {
    expect(normalizeJurisdiction('england-wales')).toBe('england');
    expect(normalizeJurisdiction('England & Wales')).toBe('england');
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
