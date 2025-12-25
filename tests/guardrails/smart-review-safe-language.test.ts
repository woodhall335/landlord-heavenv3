/**
 * Smart Review Safe Language Guardrails Tests
 *
 * Ensures Smart Review warnings NEVER use forbidden legal language:
 * - "invalid" / "not valid"
 * - "guarantee" / "guaranteed"
 * - "court will" / "court would"
 * - "legal advice" / "legal opinion"
 * - "legally" / "legally binding"
 * - "must be" / "shall be"
 *
 * Instead, warnings should use safe language:
 * - "possible mismatch" / "appears different"
 * - "could not verify" / "could not confirm"
 * - "missing evidence" / "no evidence found"
 * - "consider" / "you may want to"
 *
 * @module tests/guardrails/smart-review-safe-language.test
 */

import { describe, it, expect } from 'vitest';
import {
  WarningCode,
  createWarning,
  validateWarningSafeLanguage,
  validateAllWarningTemplates,
} from '@/lib/evidence/warnings';

// =============================================================================
// Forbidden Phrases
// =============================================================================

const FORBIDDEN_PHRASES = [
  'invalid',
  'not valid',
  'guarantee',
  'guaranteed',
  'court will',
  'court would',
  'legal advice',
  'legal opinion',
  'legally',
  'legally binding',
  'legally required',
  'must be',
  'shall be',
  'is required by law',
  'will be rejected',
  'will be accepted',
  'you must',
  'you should consult',
];

// =============================================================================
// Safe Phrase Examples
// =============================================================================

const EXPECTED_SAFE_PHRASES = [
  'possible mismatch',
  'appears different',
  'could not verify',
  'could not find',
  'missing',
  'consider',
  'you may want to',
  'please verify',
  'check that',
];

// =============================================================================
// Tests
// =============================================================================

describe('Smart Review Safe Language Guardrails', () => {
  describe('validateAllWarningTemplates', () => {
    it('all warning templates pass safe language validation', () => {
      const result = validateAllWarningTemplates();

      expect(result.valid).toBe(true);

      if (!result.valid) {
        // Log which warnings failed
        for (const [code, violations] of Object.entries(result.violations)) {
          if (violations.length > 0) {
            console.error(`WARNING ${code} has violations:`, violations);
          }
        }
      }
    });
  });

  describe('Individual Warning Codes', () => {
    // Test each warning code individually for clarity
    for (const code of Object.values(WarningCode)) {
      it(`${code} uses safe language`, () => {
        const warning = createWarning(code);
        const result = validateWarningSafeLanguage(warning);

        expect(result.valid).toBe(true);

        if (!result.valid) {
          console.error(`${code} violations:`, result.violations);
        }
      });
    }
  });

  describe('Forbidden Phrase Checks', () => {
    for (const phrase of FORBIDDEN_PHRASES) {
      it(`no warning contains "${phrase}"`, () => {
        const allPass = Object.values(WarningCode).every((code) => {
          const warning = createWarning(code);
          const fullText =
            `${warning.title} ${warning.message} ${warning.suggestedUserAction}`.toLowerCase();
          return !fullText.includes(phrase.toLowerCase());
        });

        expect(allPass).toBe(true);
      });
    }
  });

  describe('Mismatch Warnings Use "Possible" Language', () => {
    const mismatchCodes = Object.values(WarningCode).filter((code) =>
      code.startsWith('FACT_MISMATCH')
    );

    for (const code of mismatchCodes) {
      it(`${code} uses "possible" or "appears" language`, () => {
        const warning = createWarning(code);
        const titleAndMessage = `${warning.title} ${warning.message}`.toLowerCase();

        const usesSafeLanguage =
          titleAndMessage.includes('possible') ||
          titleAndMessage.includes('appears') ||
          titleAndMessage.includes('may') ||
          titleAndMessage.includes('could');

        expect(usesSafeLanguage).toBe(true);
      });
    }
  });

  describe('Missing Category Warnings Use Neutral Language', () => {
    const missingCodes = Object.values(WarningCode).filter((code) =>
      code.startsWith('UPLOAD_MISSING') || code.startsWith('FACT_MISSING')
    );

    for (const code of missingCodes) {
      it(`${code} does not say "required" or "must"`, () => {
        const warning = createWarning(code);
        const fullText =
          `${warning.title} ${warning.message} ${warning.suggestedUserAction}`.toLowerCase();

        const containsStrong =
          fullText.includes('required') ||
          fullText.includes('must') ||
          fullText.includes('mandatory');

        expect(containsStrong).toBe(false);
      });
    }
  });

  describe('Blocker Severity Warnings', () => {
    const blockerCodes = Object.values(WarningCode).filter((code) => {
      const warning = createWarning(code);
      return warning.severity === 'blocker';
    });

    for (const code of blockerCodes) {
      it(`${code} (blocker) still uses safe language`, () => {
        const warning = createWarning(code);
        const result = validateWarningSafeLanguage(warning);

        expect(result.valid).toBe(true);
      });

      it(`${code} (blocker) does not guarantee outcomes`, () => {
        const warning = createWarning(code);
        const fullText =
          `${warning.title} ${warning.message} ${warning.suggestedUserAction}`.toLowerCase();

        expect(fullText).not.toContain('will fail');
        expect(fullText).not.toContain('will be rejected');
        expect(fullText).not.toContain('will not be accepted');
        expect(fullText).not.toContain('court will reject');
      });
    }
  });

  describe('Suggested User Actions', () => {
    for (const code of Object.values(WarningCode)) {
      it(`${code} suggests action without demanding`, () => {
        const warning = createWarning(code);
        const action = warning.suggestedUserAction.toLowerCase();

        // Should not demand action
        expect(action).not.toMatch(/^you must/);
        expect(action).not.toMatch(/^you should consult/);
        expect(action).not.toMatch(/^seek legal/);

        // Should suggest or recommend
        const suggestive =
          action.startsWith('consider') ||
          action.startsWith('upload') ||
          action.startsWith('verify') ||
          action.startsWith('check') ||
          action.startsWith('review') ||
          action.startsWith('try') ||
          action.startsWith('ensure') ||
          action.includes('you may want') ||
          action.includes('please verify');

        expect(suggestive).toBe(true);
      });
    }
  });

  describe('Warning Titles', () => {
    for (const code of Object.values(WarningCode)) {
      it(`${code} title is descriptive, not judgmental`, () => {
        const warning = createWarning(code);
        const title = warning.title.toLowerCase();

        // Should not be judgmental
        expect(title).not.toContain('invalid');
        expect(title).not.toContain('illegal');
        expect(title).not.toContain('wrong');
        expect(title).not.toContain('bad');
        expect(title).not.toContain('error');

        // Should be descriptive - these cover all current warning titles
        const descriptive =
          title.includes('possible') ||
          title.includes('missing') ||
          title.includes('mismatch') ||
          title.includes('could not') ||
          title.includes('uncertain') ||
          title.includes('may') ||
          title.includes('not verified') ||
          title.includes('not found') ||
          title.includes('attention') ||
          title.includes('low confidence') ||
          title.includes('inconsistency') ||
          title.includes('detected') ||
          title.includes('suggested') ||
          title.includes('require') ||
          title.includes('no ') || // "No bank statements uploaded"
          title.includes('failed') || // "Extraction failed"
          title.includes('partial') || // "Partial information extracted"
          title.includes('consider') || // "Consider redacting..."
          title.includes('sensitive'); // "Sensitive data detected"

        expect(descriptive).toBe(true);
      });
    }
  });
});

describe('Smart Review Warning Severity', () => {
  it('BLOCKER severity is informational only in v1', () => {
    // Document the intended behavior
    const blockerCodes = Object.values(WarningCode).filter((code) => {
      const warning = createWarning(code);
      return warning.severity === 'blocker';
    });

    // All blockers should still be present
    expect(blockerCodes.length).toBeGreaterThan(0);

    // But the system should NOT block generation based on Smart Review
    // This is enforced at the orchestrator level, not the warning level
    // The test here documents the intention
    for (const code of blockerCodes) {
      const warning = createWarning(code);
      // Severity is 'blocker' but in v1, Smart Review never blocks generation
      expect(warning.severity).toBe('blocker');
    }
  });
});
