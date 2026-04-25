/**
 * Tests for England Form 3A compatibility ground definitions
 *
 * Verifies the compatibility map stays aligned with the post-1 May 2026
 * England ground catalog and still provides synchronous statutory wording
 * lookups for older generator/preview paths.
 */

import { describe, expect, it } from 'vitest';
import {
  SECTION8_GROUND_DEFINITIONS,
  enrichGroundWithStatutoryText,
  getSection8GroundDefinition,
  getSection8StatutoryText,
} from '../section8-ground-definitions';

describe('SECTION8_GROUND_DEFINITIONS', () => {
  it('contains representative current mandatory grounds, including alphanumeric codes', () => {
    const mandatoryGrounds = ['1', '1A', '2ZA', '4A', '5H', '6B', '7B', '8'];
    for (const code of mandatoryGrounds) {
      const def = SECTION8_GROUND_DEFINITIONS[code];
      expect(def).toBeDefined();
      expect(def.mandatory).toBe(true);
      expect(def.title.length).toBeGreaterThan(3);
      expect(def.full_text.length).toBeGreaterThan(10);
    }
  });

  it('contains representative current discretionary grounds', () => {
    const discretionaryGrounds = ['9', '10', '11', '12', '13', '14', '14A', '14ZA', '15', '17', '18'];
    for (const code of discretionaryGrounds) {
      const def = SECTION8_GROUND_DEFINITIONS[code];
      expect(def).toBeDefined();
      expect(def.mandatory).toBe(false);
      expect(def.full_text.length).toBeGreaterThan(10);
    }
  });

  it('does not expose abolished/legacy grounds that are not in the post-2026 England catalog', () => {
    expect(SECTION8_GROUND_DEFINITIONS['3']).toBeUndefined();
    expect(SECTION8_GROUND_DEFINITIONS['16']).toBeUndefined();
  });

  it('Ground 8 keeps the detailed arrears wording used by compatibility callers', () => {
    const ground8 = SECTION8_GROUND_DEFINITIONS['8'];
    expect(ground8.full_text).toContain("thirteen weeks' rent is unpaid");
    expect(ground8.full_text).toContain("three months' rent is unpaid");
    expect(ground8.legal_basis).toBe('Housing Act 1988, Schedule 2, Ground 8');
  });

  it('Ground 14A handles the alphanumeric key directly', () => {
    const ground14A = SECTION8_GROUND_DEFINITIONS['14A'];
    expect(ground14A).toBeDefined();
    expect(ground14A.code).toBe('14A');
    expect(ground14A.title).toContain('Domestic abuse');
    expect(ground14A.full_text).toContain('violence or threats of violence');
  });
});

describe('getSection8StatutoryText', () => {
  it('returns statutory text for numeric grounds', () => {
    const text = getSection8StatutoryText(8);
    expect(text).toContain("thirteen weeks' rent is unpaid");
  });

  it('returns statutory text for alphanumeric grounds', () => {
    const text = getSection8StatutoryText('1A');
    expect(text).toContain('Ground 1A');
  });

  it('returns empty string for invalid ground code', () => {
    expect(getSection8StatutoryText(999)).toBe('');
  });
});

describe('getSection8GroundDefinition', () => {
  it('returns a current definition for an alphanumeric ground code', () => {
    const def = getSection8GroundDefinition('2ZA');
    expect(def).toBeDefined();
    expect(def?.code).toBe('2ZA');
    expect(def?.title).toContain('superior lease');
    expect(def?.mandatory).toBe(true);
  });

  it('returns undefined for an invalid ground code', () => {
    expect(getSection8GroundDefinition(999)).toBeUndefined();
  });
});

describe('enrichGroundWithStatutoryText', () => {
  it('adds statutory_text to a numeric ground without one', () => {
    const ground = {
      code: 8,
      title: 'Serious rent arrears',
      mandatory: true,
    };

    const enriched = enrichGroundWithStatutoryText(ground);
    expect(enriched.statutory_text).toContain("thirteen weeks' rent is unpaid");
  });

  it('adds statutory_text to an alphanumeric ground without one', () => {
    const ground = {
      code: '1A',
      title: 'Sale of dwelling house',
      mandatory: true,
    };

    const enriched = enrichGroundWithStatutoryText(ground);
    expect(enriched.statutory_text).toContain('Ground 1A');
  });

  it('preserves existing statutory_text', () => {
    const ground = {
      code: '8',
      title: 'Serious rent arrears',
      mandatory: true,
      statutory_text: 'CUSTOM STATUTORY TEXT',
    };

    const enriched = enrichGroundWithStatutoryText(ground);
    expect(enriched.statutory_text).toBe('CUSTOM STATUTORY TEXT');
  });
});
