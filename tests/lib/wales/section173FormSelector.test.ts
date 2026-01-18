/**
 * Wales Section 173 Form Selector Tests
 *
 * Tests for court-grade guardrails for Wales no-fault (Section 173) notices.
 *
 * Coverage:
 * 1. determineSection173Form returns correct form based on service date
 * 2. getSection173MinimumNoticeDays returns correct notice period
 * 3. validateSection173Timing catches prohibited period violations
 * 4. validateSection173Timing catches insufficient notice period
 * 5. calculateSection173ExpiryDate auto-corrects invalid dates
 * 6. addCalendarMonths helper uses proper calendar month semantics
 * 7. Route detection helpers work correctly
 *
 * WALES ONLY - No Housing Act 1988, Section 8, Section 21, Form 6A references.
 */

import { describe, it, expect } from 'vitest';
import {
  determineSection173Form,
  getSection173MinimumNoticeDays,
  validateSection173Timing,
  calculateSection173ExpiryDate,
  addCalendarMonths,
  monthsDifference,
  daysDifference,
  isSection173Route,
  isWalesFaultBasedRoute,
  getSection173RequirementsSummary,
  type Section173Facts,
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

    it('should return RHW17 for service dates before December 2022', () => {
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2022-11-30',
      };
      expect(determineSection173Form(facts)).toBe('RHW17');
    });

    it('should return RHW17 for service dates in 2021', () => {
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2021-06-15',
      };
      expect(determineSection173Form(facts)).toBe('RHW17');
    });

    it('should return RHW16 for current service dates (2026)', () => {
      const facts: Section173Facts = {
        contract_start_date: '2025-01-01',
        service_date: '2026-01-15',
      };
      expect(determineSection173Form(facts)).toBe('RHW16');
    });
  });

  describe('getSection173MinimumNoticeDays', () => {
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

    it('should return 2 months for pre-December 2022 service dates', () => {
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2022-11-15',
      };
      const result = getSection173MinimumNoticeDays(facts);
      expect(result.months).toBe(2);
      expect(result.description).toContain('Two calendar months');
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
      it('should return warning when expiry is before fixed term end without break clause', () => {
        const facts: Section173Facts = {
          contract_start_date: '2023-01-01',
          service_date: '2024-01-15',
          expiry_date: '2024-07-15',
          fixed_term_end_date: '2024-12-31',
          has_break_clause: false,
        };
        const result = validateSection173Timing(facts);
        expect(result.warnings.some(w => w.includes('fixed term'))).toBe(true);
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
        expect(result.warnings.some(w => w.includes('break clause'))).toBe(true);
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

    it('should return RHW17 for pre-December 2022 dates', () => {
      const facts: Section173Facts = {
        contract_start_date: '2020-01-01',
        service_date: '2022-11-15',
        expiry_date: '2023-01-15',
      };
      const result = calculateSection173ExpiryDate(facts);
      expect(result.form).toBe('RHW17');
      expect(result.minimumNoticeMonths).toBe(2);
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
