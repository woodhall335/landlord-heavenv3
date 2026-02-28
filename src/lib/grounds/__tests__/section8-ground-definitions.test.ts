/**
 * Tests for Section 8 Ground Definitions
 *
 * Verifies the shared ground definitions module works correctly
 * and includes all required statutory text from Schedule 2.
 */

import { describe, it, expect } from 'vitest';
import {
  SECTION8_GROUND_DEFINITIONS,
  getSection8StatutoryText,
  getSection8GroundDefinition,
  enrichGroundWithStatutoryText,
} from '../section8-ground-definitions';

describe('SECTION8_GROUND_DEFINITIONS', () => {
  it('contains all mandatory grounds (1, 2, 3, 4, 5, 6, 7, 8)', () => {
    const mandatoryGrounds = [1, 2, 3, 4, 5, 6, 7, 8];
    for (const code of mandatoryGrounds) {
      const def = SECTION8_GROUND_DEFINITIONS[code];
      expect(def).toBeDefined();
      expect(def.mandatory).toBe(true);
      expect(def.full_text.length).toBeGreaterThan(50);
    }
  });

  it('contains all discretionary grounds (9, 10, 11, 12, 13, 14, 14A, 15, 16, 17)', () => {
    const discretionaryGrounds = [9, 10, 11, 12, 13, 14, '14A', 15, 16, 17];
    for (const code of discretionaryGrounds) {
      const def = SECTION8_GROUND_DEFINITIONS[code];
      expect(def).toBeDefined();
      expect(def.mandatory).toBe(false);
      expect(def.full_text.length).toBeGreaterThan(30);
    }
  });

  it('Ground 8 contains key statutory phrases', () => {
    const ground8 = SECTION8_GROUND_DEFINITIONS[8];
    expect(ground8.full_text).toContain('eight weeks\' rent is unpaid');
    expect(ground8.full_text).toContain('two months\' rent is unpaid');
    expect(ground8.full_text).toContain('one quarter\'s rent');
    expect(ground8.legal_basis).toBe('Housing Act 1988, Schedule 2, Ground 8');
  });

  it('Ground 10 contains key statutory phrases', () => {
    const ground10 = SECTION8_GROUND_DEFINITIONS[10];
    expect(ground10.full_text).toContain('Some rent lawfully due from the tenant is unpaid');
    expect(ground10.legal_basis).toBe('Housing Act 1988, Schedule 2, Ground 10');
  });

  it('Ground 11 contains key statutory phrases', () => {
    const ground11 = SECTION8_GROUND_DEFINITIONS[11];
    expect(ground11.full_text).toContain('persistently delayed paying rent');
    expect(ground11.legal_basis).toBe('Housing Act 1988, Schedule 2, Ground 11');
  });

  it('Ground 14A handles string key correctly', () => {
    const ground14A = SECTION8_GROUND_DEFINITIONS['14A'];
    expect(ground14A).toBeDefined();
    expect(ground14A.code).toBe(14); // Note: code is 14, not 14A
    expect(ground14A.title).toContain('violence');
    expect(ground14A.full_text).toContain('violence or threats of violence');
  });
});

describe('getSection8StatutoryText', () => {
  it('returns statutory text for valid ground code', () => {
    const text = getSection8StatutoryText(8);
    expect(text).toContain('eight weeks\' rent is unpaid');
  });

  it('returns statutory text for string ground code', () => {
    const text = getSection8StatutoryText('14A');
    expect(text).toContain('violence or threats of violence');
  });

  it('returns empty string for invalid ground code', () => {
    const text = getSection8StatutoryText(999);
    expect(text).toBe('');
  });
});

describe('getSection8GroundDefinition', () => {
  it('returns full definition for valid ground code', () => {
    const def = getSection8GroundDefinition(8);
    expect(def).toBeDefined();
    expect(def?.code).toBe(8);
    expect(def?.title).toContain('rent arrears');
    expect(def?.mandatory).toBe(true);
    expect(def?.full_text.length).toBeGreaterThan(100);
  });

  it('returns undefined for invalid ground code', () => {
    const def = getSection8GroundDefinition(999);
    expect(def).toBeUndefined();
  });
});

describe('enrichGroundWithStatutoryText', () => {
  it('adds statutory_text to ground without one', () => {
    const ground = {
      code: 8,
      title: 'Serious rent arrears',
      mandatory: true,
    };

    const enriched = enrichGroundWithStatutoryText(ground);
    expect(enriched.statutory_text).toContain('eight weeks\' rent is unpaid');
  });

  it('preserves existing statutory_text', () => {
    const customText = 'CUSTOM STATUTORY TEXT';
    const ground = {
      code: 8,
      title: 'Serious rent arrears',
      mandatory: true,
      statutory_text: customText,
    };

    const enriched = enrichGroundWithStatutoryText(ground);
    expect(enriched.statutory_text).toBe(customText);
  });

  it('returns empty string for unknown ground', () => {
    const ground = {
      code: 999,
      title: 'Unknown ground',
      mandatory: false,
    };

    const enriched = enrichGroundWithStatutoryText(ground);
    expect(enriched.statutory_text).toBe('');
  });
});
