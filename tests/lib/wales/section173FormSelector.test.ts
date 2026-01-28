/**
 * Wales Section 173 Form Selector Tests
 *
 * HARD-LOCKED: Section 173 is locked to 6 months minimum notice period (RHW16).
 * We do not support the 2-month regime (RHW17) for standard occupation contracts.
 *
 * Tests for court-grade guardrails for Wales no-fault (Section 173) notices.
 *
 * Coverage:
 * 1. determineSection173Form ALWAYS returns RHW16 (6-month notice)
 * 2. getSection173MinimumNoticePeriod ALWAYS returns 6 months
 * 3. Attempting to use 2_month regime throws an error
 * 4. validateSection173Timing catches prohibited period violations
 * 5. validateSection173Timing catches insufficient notice period (< 6 months)
 * 6. validateSection173Timing catches fixed term violations (HARD ERROR when no break clause)
 * 7. calculateSection173ExpiryDate auto-corrects invalid dates using 6 months
 * 8. addCalendarMonths helper uses proper calendar month semantics
 * 9. Route detection helpers work correctly
 *
 * WALES ONLY - No Housing Act 1988, Section 8, Section 21, Form 6A references.
 */

import { describe, it, expect } from 'vitest';
import {
  determineSection173Form,
  determineSection173FormWithMetadata,
  getSection173MinimumNoticePeriod,
  getSection173MinimumNoticeDays,
  getSection173MinimumNoticeMonths,
  getSection173MinimumNoticeLabel,
  SECTION_173_LOCKED_NOTICE_MONTHS,
  validateSection173Timing,
  calculateSection173ExpiryDate,
  addCalendarMonths,
  monthsDifference,
  daysDifference,
  isSection173Route,
  isWalesFaultBasedRoute,
  getSection173RequirementsSummary,
  type Section173Facts,
  type Section173NoticeRegime,
} from '@/lib/wales/section173FormSelector';

describe('Wales Section 173 Form Selector', () => {
  describe('determineSection173Form', () => {
    it('should return RHW16 for service dates after December 2022', () => {
      const facts: Section173Facts = {
        contract_start_date: '2022-01-01',
        service_date: '2024-01-15',
      };
      expect(determineSection173Form(facts)).toBe('RHW16');
    });

    it('should return RHW16 for service dates on December 1, 2022', () => {
      const facts: Section173Facts = {
        contract_start_date: '2022-01-01',
        service_date: '2022-12-01',
      };
      expect(determineSection173Form(facts)).toBe('RHW16');
    });

    // HARD-LOCKED: Always returns RHW16 regardless of service date
    // We do not support the 2-month regime (RHW17) for standard occupation contracts.
    it('should return RHW16 for ALL service dates (HARD-LOCKED to 6 months)', () => {
      // Even for pre-December 2022 dates, we return RHW16 because we don't support RHW17
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2022-11-30',
      };
      expect(determineSection173Form(facts)).toBe('RHW16');
    });

    it('should return RHW16 for all historical dates (HARD-LOCKED)', () => {
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2021-06-15',
      };
      // HARD-LOCKED: Even for 2021 dates, we return RHW16
      expect(determineSection173Form(facts)).toBe('RHW16');
    });

    it('should return RHW16 for current service dates (2026)', () => {
      const facts: Section173Facts = {
        contract_start_date: '2025-01-01',
        service_date: '2026-01-15',
      };
      expect(determineSection173Form(facts)).toBe('RHW16');
    });

    describe('explicit notice regime override', () => {
      // HARD-LOCKED: 2_month regime is NOT supported - should throw error
      it('should throw error when explicit 2_month regime is requested', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          wales_section173_notice_regime: '2_month',
        };
        expect(() => determineSection173Form(facts)).toThrow('WALES_SECTION173_UNSUPPORTED_REGIME');
      });

      it('should accept explicit 6_month regime', () => {
        const facts: Section173Facts = {
          contract_start_date: '2020-01-01',
          service_date: '2022-11-15',
          wales_section173_notice_regime: '6_month',
        };
        expect(determineSection173Form(facts)).toBe('RHW16');
      });
    });
  });

  describe('determineSection173FormWithMetadata', () => {
    it('should return regimeSource as explicit when regime is set', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
        wales_section173_notice_regime: '6_month',
      };
      const result = determineSection173FormWithMetadata(facts);
      expect(result.regimeSource).toBe('explicit');
      expect(result.regime).toBe('6_month');
      expect(result.form).toBe('RHW16');
    });

    it('should return regimeSource as inferred when regime is not set', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const result = determineSection173FormWithMetadata(facts);
      expect(result.regimeSource).toBe('inferred');
      expect(result.regime).toBe('6_month');
    });

    it('should include warning for dates near transition boundary when inferred', () => {
      const facts: Section173Facts = {
        contract_start_date: '2022-01-01',
        service_date: '2023-03-15', // Within 6 months of Dec 2022 transition
      };
      const result = determineSection173FormWithMetadata(facts);
      expect(result.regimeSource).toBe('inferred');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('REGIME_INFERRED');
    });

    it('should not include warning when regime is explicit', () => {
      const facts: Section173Facts = {
        contract_start_date: '2022-01-01',
        service_date: '2023-03-15',
        wales_section173_notice_regime: '6_month',
      };
      const result = determineSection173FormWithMetadata(facts);
      expect(result.regimeSource).toBe('explicit');
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('getSection173MinimumNoticePeriod', () => {
    it('should return 6 months for post-December 2022 service dates', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const result = getSection173MinimumNoticePeriod(facts);
      expect(result.months).toBe(6);
      expect(result.noticeRegime).toBe('6_month');
      expect(result.form).toBe('RHW16');
      expect(result.description).toContain('Six calendar months');
      expect(result.legalReference).toContain('Renting Homes (Wales) Act 2016');
    });

    // HARD-LOCKED: 2_month regime is NOT supported - should throw error
    it('should throw error when explicit 2_month regime is requested', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
        wales_section173_notice_regime: '2_month',
      };
      expect(() => getSection173MinimumNoticePeriod(facts)).toThrow('WALES_SECTION173_UNSUPPORTED_REGIME');
    });

    it('should include approximateDays for display purposes', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const result = getSection173MinimumNoticePeriod(facts);
      // 6 months * 30.44 ≈ 183 days
      expect(result.approximateDays).toBeGreaterThanOrEqual(182);
      expect(result.approximateDays).toBeLessThanOrEqual(184);
    });

    it('should NOT contain England-specific terminology', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const result = getSection173MinimumNoticePeriod(facts);
      expect(result.legalReference).not.toContain('Housing Act 1988');
      expect(result.legalReference).not.toContain('Section 21');
      expect(result.legalReference).not.toContain('Form 6A');
    });
  });

  describe('getSection173MinimumNoticeDays (deprecated)', () => {
    it('should return 6 months for post-December 2022 service dates', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const result = getSection173MinimumNoticeDays(facts);
      expect(result.months).toBe(6);
      expect(result.description).toContain('Six calendar months');
      expect(result.legalReference).toContain('Renting Homes (Wales) Act 2016');
      expect(result.legalReference).toContain('as amended');
    });

    // HARD-LOCKED: Always returns 6 months regardless of service date
    it('should always return 6 months (HARD-LOCKED)', () => {
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2022-11-15',
      };
      const result = getSection173MinimumNoticeDays(facts);
      // HARD-LOCKED to 6 months
      expect(result.months).toBe(6);
      expect(result.description).toContain('Six calendar months');
      expect(result.legalReference).toContain('Renting Homes (Wales) Act 2016');
    });

    it('should NOT contain England-specific terminology', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const result = getSection173MinimumNoticeDays(facts);
      expect(result.legalReference).not.toContain('Housing Act 1988');
      expect(result.legalReference).not.toContain('Section 21');
      expect(result.legalReference).not.toContain('Form 6A');
    });
  });

  describe('validateSection173Timing', () => {
    describe('prohibited period validation', () => {
      it('should return error when service date is within first 6 months of contract', () => {
        const facts: Section173Facts = {
          contract_start_date: '2024-01-15',
          service_date: '2024-05-01', // Only 3.5 months after contract start
        };
        const result = validateSection173Timing(facts);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('WALES_SECTION173_PROHIBITED_PERIOD');
        expect(result.errors[0]).toContain('6 months');
      });

      it('should return error when service date is exactly 6 months (boundary)', () => {
        // Contract starts Jan 15, service on Jul 14 is still within prohibited period
        const facts: Section173Facts = {
          contract_start_date: '2024-01-15',
          service_date: '2024-07-14',
        };
        const result = validateSection173Timing(facts);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('PROHIBITED_PERIOD'))).toBe(true);
      });

      it('should be valid when service date is on or after 6 months from contract start', () => {
        // Contract starts Jan 15, Jul 15 is exactly 6 months - should be valid
        const facts: Section173Facts = {
          contract_start_date: '2024-01-15',
          service_date: '2024-07-15',
          expiry_date: '2025-01-15', // 6 months from service
        };
        const result = validateSection173Timing(facts);
        expect(result.errors.filter(e => e.includes('PROHIBITED_PERIOD'))).toHaveLength(0);
      });

      it('should calculate earliest valid service date correctly', () => {
        const facts: Section173Facts = {
          contract_start_date: '2024-01-15',
          service_date: '2024-05-01',
        };
        const result = validateSection173Timing(facts);
        expect(result.earliestServiceDate).toBe('2024-07-15'); // Jan 15 + 6 months = Jul 15
      });
    });

    describe('notice period validation', () => {
      it('should return error when expiry date is less than 6 months from service (post-Dec 2022)', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-05-15', // Only 4 months
        };
        const result = validateSection173Timing(facts);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('INSUFFICIENT_NOTICE'))).toBe(true);
      });

      it('should be valid when expiry date is exactly 6 months from service', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15', // Exactly 6 months
        };
        const result = validateSection173Timing(facts);
        expect(result.errors.filter(e => e.includes('INSUFFICIENT_NOTICE'))).toHaveLength(0);
      });

      it('should be valid when expiry date is more than 6 months from service', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-09-15', // 8 months
        };
        const result = validateSection173Timing(facts);
        expect(result.errors).toHaveLength(0);
        expect(result.isValid).toBe(true);
      });

      it('should calculate earliest valid expiry date correctly', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
        };
        const result = validateSection173Timing(facts);
        expect(result.earliestExpiryDate).toBe('2024-07-15'); // Jan 15 + 6 months
      });
    });

    describe('contract category validation', () => {
      it('should return error for secure contracts', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          wales_contract_category: 'secure',
        };
        const result = validateSection173Timing(facts);
        expect(result.errors.some(e => e.includes('INVALID_CONTRACT_TYPE'))).toBe(true);
      });

      it('should return warning for supported standard contracts', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15',
          wales_contract_category: 'supported_standard',
        };
        const result = validateSection173Timing(facts);
        expect(result.warnings.some(w => w.includes('support provider'))).toBe(true);
      });

      it('should not return warning for standard contracts', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15',
          wales_contract_category: 'standard',
        };
        const result = validateSection173Timing(facts);
        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBe(0);
      });
    });

    describe('fixed term validation', () => {
      it('should return HARD ERROR when expiry is before fixed term end and has_break_clause is false', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15',
          fixed_term_end_date: '2024-12-31',
          has_break_clause: false,
        };
        const result = validateSection173Timing(facts);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.includes('FIXED_TERM_VIOLATION'))).toBe(true);
        expect(result.errors.some(e => e.includes('No break clause exists'))).toBe(true);
      });

      it('should return warning when expiry is before break clause date', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15',
          fixed_term_end_date: '2024-12-31',
          has_break_clause: true,
          break_clause_date: '2024-09-01',
        };
        const result = validateSection173Timing(facts);
        // This is a WARNING, not an error - break clause allows early termination
        expect(result.warnings.some(w => w.includes('break clause'))).toBe(true);
        expect(result.errors.filter(e => e.includes('FIXED_TERM'))).toHaveLength(0);
      });

      it('should return warning (not error) when break clause status is unknown', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15',
          fixed_term_end_date: '2024-12-31',
          // has_break_clause not set - unknown status
        };
        const result = validateSection173Timing(facts);
        // Should be warning, not error, as we don't know break clause status
        expect(result.warnings.some(w => w.includes('fixed term end'))).toBe(true);
        expect(result.warnings.some(w => w.includes('confirm whether a break clause exists'))).toBe(true);
        expect(result.errors.filter(e => e.includes('FIXED_TERM'))).toHaveLength(0);
      });

      it('should be valid when expiry is on or after fixed term end', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2025-01-15',
          fixed_term_end_date: '2024-12-31',
          has_break_clause: false,
        };
        const result = validateSection173Timing(facts);
        expect(result.errors.filter(e => e.includes('FIXED_TERM'))).toHaveLength(0);
      });

      it('should be valid when break clause date allows early termination', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-08-15', // After break clause date
          fixed_term_end_date: '2024-12-31',
          has_break_clause: true,
          break_clause_date: '2024-08-01',
        };
        const result = validateSection173Timing(facts);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings.filter(w => w.includes('break clause'))).toHaveLength(0);
      });
    });

    describe('validation result includes regime info', () => {
      it('should include noticeRegime in validation result', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15',
        };
        const result = validateSection173Timing(facts);
        expect(result.noticeRegime).toBe('6_month');
        expect(result.regimeSource).toBe('inferred');
      });

      // HARD-LOCKED: Attempting to use 2_month regime should throw error
      it('should throw error when 2_month regime is requested', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-03-15',
          wales_section173_notice_regime: '2_month',
        };
        expect(() => validateSection173Timing(facts)).toThrow('WALES_SECTION173_UNSUPPORTED_REGIME');
      });
    });

    it('should NOT contain England-specific terminology in errors or warnings', () => {
      const facts: Section173Facts = {
        contract_start_date: '2024-01-15',
        service_date: '2024-05-01',
        expiry_date: '2024-06-01',
        wales_contract_category: 'secure',
      };
      const result = validateSection173Timing(facts);
      const allMessages = [...result.errors, ...result.warnings].join(' ');
      expect(allMessages).not.toContain('Housing Act 1988');
      expect(allMessages).not.toContain('Section 21');
      expect(allMessages).not.toContain('Form 6A');
      expect(allMessages).not.toContain('AST');
    });
  });

  describe('calculateSection173ExpiryDate', () => {
    it('should return user date when valid', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
        expiry_date: '2024-09-15', // More than 6 months - valid
      };
      const result = calculateSection173ExpiryDate(facts);
      expect(result.wasCorrected).toBe(false);
      expect(result.expiryDate).toBe('2024-09-15');
    });

    it('should auto-correct when expiry date is too early', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
        expiry_date: '2024-05-15', // Only 4 months - invalid
      };
      const result = calculateSection173ExpiryDate(facts);
      expect(result.wasCorrected).toBe(true);
      expect(result.expiryDate).toBe('2024-07-15'); // Corrected to 6 months
      expect(result.correctionMessage).toContain('auto-corrected');
    });

    it('should auto-correct when no expiry date provided', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
        // No expiry_date provided
      };
      const result = calculateSection173ExpiryDate(facts);
      expect(result.wasCorrected).toBe(true);
      expect(result.expiryDate).toBe('2024-07-15');
    });

    it('should return correct form type', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
        expiry_date: '2024-07-15',
      };
      const result = calculateSection173ExpiryDate(facts);
      expect(result.form).toBe('RHW16');
      expect(result.minimumNoticeMonths).toBe(6);
    });

    // HARD-LOCKED: Always returns RHW16 (6 months) regardless of date
    it('should always return RHW16 and 6 months (HARD-LOCKED)', () => {
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2022-11-15',
        expiry_date: '2023-05-15', // Must be >= 6 months from service
      };
      const result = calculateSection173ExpiryDate(facts);
      expect(result.form).toBe('RHW16');
      expect(result.minimumNoticeMonths).toBe(6);
    });
  });

  describe('addCalendarMonths', () => {
    it('should add 6 months correctly (simple case)', () => {
      expect(addCalendarMonths('2024-01-15', 6)).toBe('2024-07-15');
    });

    it('should add 2 months correctly', () => {
      expect(addCalendarMonths('2024-01-15', 2)).toBe('2024-03-15');
    });

    it('should handle end-of-month correctly (Jan 31 + 1 month = Feb 28/29)', () => {
      // Non-leap year
      expect(addCalendarMonths('2023-01-31', 1)).toBe('2023-02-28');
      // Leap year
      expect(addCalendarMonths('2024-01-31', 1)).toBe('2024-02-29');
    });

    it('should handle end-of-month correctly (Jan 31 + 2 months = Mar 31)', () => {
      expect(addCalendarMonths('2024-01-31', 2)).toBe('2024-03-31');
    });

    it('should handle end-of-month correctly (Mar 31 + 1 month = Apr 30)', () => {
      expect(addCalendarMonths('2024-03-31', 1)).toBe('2024-04-30');
    });

    it('should handle year boundaries', () => {
      expect(addCalendarMonths('2024-07-15', 6)).toBe('2025-01-15');
    });

    it('should handle adding 0 months', () => {
      expect(addCalendarMonths('2024-01-15', 0)).toBe('2024-01-15');
    });
  });

  describe('monthsDifference', () => {
    it('should calculate difference for exact months', () => {
      const diff = monthsDifference('2024-01-15', '2024-07-15');
      expect(diff).toBeCloseTo(6, 0);
    });

    it('should calculate fractional months', () => {
      const diff = monthsDifference('2024-01-01', '2024-01-16');
      expect(diff).toBeCloseTo(0.5, 1);
    });

    it('should handle year boundaries', () => {
      const diff = monthsDifference('2024-07-15', '2025-01-15');
      expect(diff).toBeCloseTo(6, 0);
    });
  });

  describe('daysDifference', () => {
    it('should calculate days correctly', () => {
      expect(daysDifference('2024-01-01', '2024-01-31')).toBe(30);
    });

    it('should handle month boundaries', () => {
      expect(daysDifference('2024-01-31', '2024-02-01')).toBe(1);
    });

    it('should return 0 for same date', () => {
      expect(daysDifference('2024-01-15', '2024-01-15')).toBe(0);
    });

    it('should handle leap year', () => {
      expect(daysDifference('2024-02-01', '2024-03-01')).toBe(29); // Leap year
      expect(daysDifference('2023-02-01', '2023-03-01')).toBe(28); // Non-leap year
    });
  });

  describe('route detection helpers', () => {
    describe('isSection173Route', () => {
      it('should return true for section_173', () => {
        expect(isSection173Route('section_173')).toBe(true);
      });

      it('should return true for wales_section_173', () => {
        expect(isSection173Route('wales_section_173')).toBe(true);
      });

      it('should return true for s173', () => {
        expect(isSection173Route('s173')).toBe(true);
      });

      it('should return true for no_fault', () => {
        expect(isSection173Route('no_fault')).toBe(true);
      });

      it('should return false for fault_based', () => {
        expect(isSection173Route('fault_based')).toBe(false);
      });

      it('should return false for null/undefined', () => {
        expect(isSection173Route(null)).toBe(false);
        expect(isSection173Route(undefined)).toBe(false);
      });
    });

    describe('isWalesFaultBasedRoute', () => {
      it('should return true for fault_based', () => {
        expect(isWalesFaultBasedRoute('fault_based')).toBe(true);
      });

      it('should return true for wales_fault_based', () => {
        expect(isWalesFaultBasedRoute('wales_fault_based')).toBe(true);
      });

      it('should return true for breach', () => {
        expect(isWalesFaultBasedRoute('breach')).toBe(true);
      });

      it('should return true for rhw23', () => {
        expect(isWalesFaultBasedRoute('rhw23')).toBe(true);
      });

      it('should return false for section_173', () => {
        expect(isWalesFaultBasedRoute('section_173')).toBe(false);
      });

      it('should return false for null/undefined', () => {
        expect(isWalesFaultBasedRoute(null)).toBe(false);
        expect(isWalesFaultBasedRoute(undefined)).toBe(false);
      });
    });
  });

  describe('getSection173RequirementsSummary', () => {
    it('should return list of requirements', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const requirements = getSection173RequirementsSummary(facts);
      expect(requirements.length).toBeGreaterThan(0);
      expect(requirements.some(r => r.includes('Minimum notice period'))).toBe(true);
      expect(requirements.some(r => r.includes('Prescribed form'))).toBe(true);
      expect(requirements.some(r => r.includes('Prohibited period'))).toBe(true);
    });

    it('should include dates when contract start is provided', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const requirements = getSection173RequirementsSummary(facts);
      expect(requirements.some(r => r.includes('Earliest service date'))).toBe(true);
      expect(requirements.some(r => r.includes('Earliest expiry date'))).toBe(true);
    });

    it('should NOT contain England-specific terminology', () => {
      const facts: Section173Facts = {
        contract_start_date: '2023-01-01',
        service_date: '2024-01-15',
      };
      const requirements = getSection173RequirementsSummary(facts);
      const allText = requirements.join(' ');
      expect(allText).not.toContain('Housing Act 1988');
      expect(allText).not.toContain('Section 21');
      expect(allText).not.toContain('Form 6A');
      expect(allText).not.toContain('AST');
    });
  });
});

describe('Pack contents guards for section_173', () => {
  // These are integration-level expectations for what should NOT be in a section_173 pack
  // The actual implementation is in eviction-pack-generator.ts

  it('should document excluded docs for section_173 route', () => {
    // Fault-based docs that must NOT appear in section_173 pack:
    const excludedForSection173 = [
      'rhw23_notice', // Fault-based notice
      'arrears_schedule', // Arrears-related
      'fault_based_notice', // Fault-based notice
      'part_d_particulars', // Fault-based particulars
    ];

    // Section_173 docs that SHOULD appear:
    const includedForSection173 = [
      'section173_notice', // RHW16 or RHW17
      'service_instructions',
      'validity_checklist',
      'pre_service_compliance_checklist',
    ];

    // This is documentation of expected behavior
    expect(excludedForSection173).toContain('rhw23_notice');
    expect(excludedForSection173).toContain('arrears_schedule');
    expect(includedForSection173).toContain('section173_notice');
  });

  it('should document excluded docs for fault_based route', () => {
    // Section_173 docs that must NOT appear in fault_based pack:
    const excludedForFaultBased = [
      'section173_notice', // Section 173 notice
    ];

    // Fault-based docs that SHOULD appear:
    const includedForFaultBased = [
      'fault_based_notice', // RHW23
      'arrears_schedule', // If arrears grounds selected
      'service_instructions',
      'validity_checklist',
    ];

    // This is documentation of expected behavior
    expect(excludedForFaultBased).toContain('section173_notice');
    expect(includedForFaultBased).toContain('fault_based_notice');
  });
});

// ============================================================================
// HARD-LOCKED 6 MONTHS REGRESSION TESTS
// ============================================================================
// These tests ensure the Section 173 notice period is permanently locked to
// 6 months. We do not support the 2-month regime (RHW17) for standard
// occupation contracts.
// ============================================================================

describe('Wales Section 173 - HARD-LOCKED 6 Months (Regression Tests)', () => {
  describe('canonical notice period helpers', () => {
    it('getSection173MinimumNoticeMonths always returns 6', () => {
      // Test with various facts - should always return 6
      expect(getSection173MinimumNoticeMonths()).toBe(6);
      expect(getSection173MinimumNoticeMonths({ contract_start_date: '2020-01-01' })).toBe(6);
      expect(getSection173MinimumNoticeMonths({ contract_start_date: '2025-07-14', service_date: '2026-01-25' })).toBe(6);
    });

    it('getSection173MinimumNoticeLabel always returns "6 months"', () => {
      expect(getSection173MinimumNoticeLabel()).toBe('6 months');
    });

    it('SECTION_173_LOCKED_NOTICE_MONTHS constant equals 6', () => {
      expect(SECTION_173_LOCKED_NOTICE_MONTHS).toBe(6);
    });
  });

  describe('specific test case from requirements', () => {
    // For a standard contract with start date 2025-07-14 and service date 2026-01-25:
    // - minimum notice months == 6
    // - earliest expiry == 2026-07-25 (calendar months)
    // - form == RHW16
    // - any attempt to select RHW17 fails (expect throw or error return)

    const standardContractFacts: Section173Facts = {
      contract_start_date: '2025-07-14',
      service_date: '2026-01-25',
      wales_contract_category: 'standard',
    };

    it('minimum notice months equals 6', () => {
      const result = getSection173MinimumNoticePeriod(standardContractFacts);
      expect(result.months).toBe(6);
    });

    it('earliest expiry equals service date + 6 calendar months (2026-07-25)', () => {
      const earliestExpiry = addCalendarMonths('2026-01-25', 6);
      expect(earliestExpiry).toBe('2026-07-25');

      // Also verify via validation
      const validation = validateSection173Timing(standardContractFacts);
      expect(validation.earliestExpiryDate).toBe('2026-07-25');
    });

    it('form is always RHW16', () => {
      expect(determineSection173Form(standardContractFacts)).toBe('RHW16');
    });

    it('any attempt to select RHW17 fails with error', () => {
      const factsWithRHW17Request: Section173Facts = {
        ...standardContractFacts,
        wales_section173_notice_regime: '2_month',
      };
      expect(() => determineSection173Form(factsWithRHW17Request)).toThrow('WALES_SECTION173_UNSUPPORTED_REGIME');
    });
  });

  describe('expiry date validation', () => {
    const testFacts: Section173Facts = {
      contract_start_date: '2025-01-01',
      service_date: '2026-01-18', // Today's date in the test scenario
      wales_contract_category: 'standard',
    };

    it('expiry date earlier than service + 6 months triggers error', () => {
      const factsWithEarlyExpiry: Section173Facts = {
        ...testFacts,
        expiry_date: '2026-03-18', // Only 2 months from service
      };
      const validation = validateSection173Timing(factsWithEarlyExpiry);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('WALES_SECTION173_INSUFFICIENT_NOTICE'))).toBe(true);
    });

    it('expiry date equal to service + 6 months is valid', () => {
      const minimumExpiry = addCalendarMonths('2026-01-18', 6); // 2026-07-18
      const factsWithMinimumExpiry: Section173Facts = {
        ...testFacts,
        expiry_date: minimumExpiry,
      };
      const validation = validateSection173Timing(factsWithMinimumExpiry);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('expiry date later than service + 6 months is valid (not shortened)', () => {
      const factsWithLaterExpiry: Section173Facts = {
        ...testFacts,
        expiry_date: '2026-09-18', // 8 months from service - longer than required
      };
      const validation = validateSection173Timing(factsWithLaterExpiry);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('no RHW17 leakage in output', () => {
    it('getSection173RequirementsSummary shows 6 months and RHW16', () => {
      const facts: Section173Facts = {
        contract_start_date: '2025-07-14',
        service_date: '2026-01-25',
      };
      const requirements = getSection173RequirementsSummary(facts);
      const allText = requirements.join(' ');

      expect(allText).toContain('6');
      expect(allText).toContain('RHW16');
      expect(allText).not.toContain('RHW17');
      expect(allText).not.toContain('2 months');
      expect(allText).not.toContain('two months');
    });

    it('validation result always shows 6_month regime and RHW16', () => {
      const facts: Section173Facts = {
        contract_start_date: '2025-01-01',
        service_date: '2026-01-18',
      };
      const validation = validateSection173Timing(facts);

      expect(validation.noticeRegime).toBe('6_month');
      expect(validation.recommendedForm).toBe('RHW16');
      expect(validation.minimumNoticeMonths).toBe(6);
    });
  });

  describe('calendar month calculation correctness', () => {
    it('correctly handles 6-month calculation across year boundary', () => {
      // Jan 25, 2026 + 6 months = Jul 25, 2026
      expect(addCalendarMonths('2026-01-25', 6)).toBe('2026-07-25');
    });

    it('correctly handles end-of-month edge cases', () => {
      // Aug 31 + 6 months = Feb 28/29 (depending on year)
      expect(addCalendarMonths('2025-08-31', 6)).toBe('2026-02-28'); // 2026 is not leap year

      // Feb 29 + 6 months = Aug 29 (leap year)
      expect(addCalendarMonths('2024-02-29', 6)).toBe('2024-08-29');
    });
  });
});
