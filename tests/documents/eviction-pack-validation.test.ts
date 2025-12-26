import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { generateCompleteEvictionPack } from '@/lib/documents/eviction-pack-generator';
import { assertCompletePackValid, validateCompletePackBeforeGeneration } from '@/lib/documents/noticeOnly';
import { __setTestJsonAIClient } from '@/lib/ai/openai-client';
import {
  calculateSection8ExpiryDate,
  validateSection8ExpiryDate,
} from '@/lib/documents/notice-date-calculator';

// Mock the document generator to avoid template loading issues
vi.mock('@/lib/documents/generator', async () => {
  const actual = await vi.importActual<typeof import('@/lib/documents/generator')>(
    '@/lib/documents/generator'
  );
  return {
    ...actual,
    htmlToPdf: vi.fn(async (html: string) => Buffer.from(html)),
  };
});

beforeEach(() => {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  __setTestJsonAIClient({
    jsonCompletion: async () => ({
      json: {} as unknown as any,
      content: '{}',
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      model: 'gpt-4o-mini',
      cost_usd: 0,
    }),
  });
});

afterEach(() => {
  delete process.env.DISABLE_WITNESS_STATEMENT_AI;
  delete process.env.DISABLE_COMPLIANCE_AUDIT_AI;
  __setTestJsonAIClient(null);
  vi.restoreAllMocks();
});

describe('Complete eviction pack validation', () => {
  describe('S21 (no-fault) validation', () => {
    it('throws EVICTION_PACK_VALIDATION_FAILED if notice_service_method is missing for S21', async () => {
      const s21FactsMissingServiceMethod = {
        __meta: { case_id: 'TEST-S21-001', jurisdiction: 'england' },
        landlord_name: 'Test Landlord',
        landlord_address_line1: '1 Test Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        tenant1_name: 'Test Tenant',
        property_address_line1: '2 Test Road',
        property_city: 'London',
        property_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        eviction_route: 'Section 21',
        notice_type: 'Section 21',
        section_21_notice_date: '2024-06-01',
        notice_date: '2024-06-01',
        court_name: 'Test County Court',
        deposit_protected: true,
        deposit_amount: 1200,
        // notice_service_method is MISSING - should cause validation to fail
      };

      await expect(generateCompleteEvictionPack(s21FactsMissingServiceMethod)).rejects.toThrow(
        /EVICTION_PACK_VALIDATION_FAILED.*COMPLETE_PACK_MISSING_NOTICE_SERVICE_METHOD/
      );
    });

    it('throws EVICTION_PACK_VALIDATION_FAILED if court_name is missing for S21', async () => {
      const s21FactsMissingCourtName = {
        __meta: { case_id: 'TEST-S21-002', jurisdiction: 'england' },
        landlord_name: 'Test Landlord',
        landlord_address_line1: '1 Test Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        tenant1_name: 'Test Tenant',
        property_address_line1: '2 Test Road',
        property_city: 'London',
        property_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        eviction_route: 'Section 21',
        notice_type: 'Section 21',
        section_21_notice_date: '2024-06-01',
        notice_date: '2024-06-01',
        notice_service_method: 'First class post',
        deposit_protected: true,
        deposit_amount: 1200,
        // court_name is MISSING - should cause validation to fail
      };

      await expect(generateCompleteEvictionPack(s21FactsMissingCourtName)).rejects.toThrow(
        /EVICTION_PACK_VALIDATION_FAILED.*COMPLETE_PACK_MISSING_COURT_NAME/
      );
    });

    it('throws EVICTION_PACK_VALIDATION_FAILED if tenancy_start_date is missing for S21', async () => {
      const s21FactsMissingTenancyStart = {
        __meta: { case_id: 'TEST-S21-003', jurisdiction: 'england' },
        landlord_name: 'Test Landlord',
        landlord_address_line1: '1 Test Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        tenant1_name: 'Test Tenant',
        property_address_line1: '2 Test Road',
        property_city: 'London',
        property_postcode: 'SW1A 2BB',
        // tenancy_start_date is MISSING
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        eviction_route: 'Section 21',
        notice_type: 'Section 21',
        section_21_notice_date: '2024-06-01',
        notice_date: '2024-06-01',
        notice_service_method: 'First class post',
        court_name: 'Test County Court',
        deposit_protected: true,
        deposit_amount: 1200,
      };

      await expect(generateCompleteEvictionPack(s21FactsMissingTenancyStart)).rejects.toThrow(
        /EVICTION_PACK_VALIDATION_FAILED.*COMPLETE_PACK_MISSING_TENANCY_START_DATE/
      );
    });
  });

  describe('Ground 8 threshold enforcement', () => {
    it('throws EVICTION_PACK_VALIDATION_FAILED if Ground 8 arrears < 2 months', async () => {
      const ground8BelowThreshold = {
        __meta: { case_id: 'TEST-G8-001', jurisdiction: 'england' },
        landlord_name: 'Test Landlord',
        landlord_address_line1: '1 Test Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        tenant1_name: 'Test Tenant',
        property_address_line1: '2 Test Road',
        property_city: 'London',
        property_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        eviction_route: 'Section 8',
        notice_type: 'Section 8',
        section8_grounds: ['Ground 8'],
        // Arrears of £1000 is less than 2 months (2 x £1200 = £2400)
        arrears_amount: 1000,
        total_arrears: 1000,
        court_name: 'Test County Court',
        arrears_breakdown: 'Total £1000',
      };

      await expect(generateCompleteEvictionPack(ground8BelowThreshold)).rejects.toThrow(
        /EVICTION_PACK_VALIDATION_FAILED.*GROUND_8_THRESHOLD_NOT_MET/
      );
    });

    it('passes validation if Ground 8 arrears >= 2 months with authoritative schedule', () => {
      // Ground 8 validation requires authoritative arrears_items schedule, not just flat totals.
      // The arrears engine treats flat totals as non-authoritative for court proceedings.
      const outcome = validateCompletePackBeforeGeneration({
        jurisdiction: 'england',
        facts: {
          rent_amount: 1200,
          rent_frequency: 'monthly',
          arrears_amount: 2500, // Legacy flat total (backup, but not authoritative)
          section8_grounds: ['Ground 8'],
          // AUTHORITATIVE: arrears_items schedule provides period-by-period breakdown
          arrears_items: [
            {
              period_start: '2024-04-01',
              period_end: '2024-04-30',
              rent_due: 1200,
              rent_paid: 0,
              amount_owed: 1200,
            },
            {
              period_start: '2024-05-01',
              period_end: '2024-05-31',
              rent_due: 1200,
              rent_paid: 0,
              amount_owed: 1200,
            },
            {
              period_start: '2024-06-01',
              period_end: '2024-06-30',
              rent_due: 1200,
              rent_paid: 1100,
              amount_owed: 100,
            },
          ],
        },
        selectedGroundCodes: [8],
        caseType: 'rent_arrears',
      });

      // Should not have the threshold blocker (2500/1200 = 2.08 months)
      const ground8Blocker = outcome.blocking.find(b => b.code === 'GROUND_8_THRESHOLD_NOT_MET');
      expect(ground8Blocker).toBeUndefined();
    });
  });

  describe('assertCompletePackValid', () => {
    it('throws for S21 with missing notice_service_method', () => {
      expect(() => {
        assertCompletePackValid({
          jurisdiction: 'england',
          facts: {
            tenancy_start_date: '2023-01-01',
            section_21_notice_date: '2024-06-01',
            court_name: 'Test County Court',
            // notice_service_method is MISSING
          },
          selectedGroundCodes: [],
          caseType: 'no_fault',
        });
      }).toThrow(/EVICTION_PACK_VALIDATION_FAILED.*COMPLETE_PACK_MISSING_NOTICE_SERVICE_METHOD/);
    });

    it('does not throw for S21 with all required fields', () => {
      expect(() => {
        assertCompletePackValid({
          jurisdiction: 'england',
          facts: {
            tenancy_start_date: '2023-01-01',
            section_21_notice_date: '2024-06-01',
            notice_date: '2024-06-01',
            notice_service_method: 'First class post',
            court_name: 'Test County Court',
          },
          selectedGroundCodes: [],
          caseType: 'no_fault',
        });
      }).not.toThrow();
    });

    it('throws for Ground 8 below threshold', () => {
      expect(() => {
        assertCompletePackValid({
          jurisdiction: 'england',
          facts: {
            rent_amount: 1000,
            rent_frequency: 'monthly',
            arrears_amount: 500, // Only 0.5 months
            section8_grounds: ['Ground 8'],
          },
          selectedGroundCodes: [8],
          caseType: 'rent_arrears',
        });
      }).toThrow(/EVICTION_PACK_VALIDATION_FAILED.*GROUND_8_THRESHOLD_NOT_MET/);
    });
  });

  describe('Scotland packs bypass England/Wales validation', () => {
    it('Scotland complete pack does not require notice_service_method', async () => {
      const scotlandFacts = {
        __meta: { case_id: 'TEST-SCOT-001', jurisdiction: 'scotland' },
        landlord_name: 'Test Landlord',
        landlord_address_line1: '1 Royal Mile',
        landlord_city: 'Edinburgh',
        landlord_postcode: 'EH1 1AA',
        tenant1_name: 'Test Tenant',
        property_address_line1: '2 Princes Street',
        property_city: 'Edinburgh',
        property_postcode: 'EH2 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 900,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_type: 'Notice to Leave',
        notice_date: '2024-06-01',
        notice_expiry_date: '2024-09-01',
        scotland_ground_codes: ['Ground 12'],
        scotland_ground_explanation: 'Rent arrears',
        total_arrears: 1800,
        // No notice_service_method - should still work for Scotland
      };

      // Should not throw for Scotland - the validation is England/Wales specific
      const pack = await generateCompleteEvictionPack(scotlandFacts);
      expect(pack.jurisdiction).toBe('scotland');
      expect(pack.documents.length).toBeGreaterThan(0);
    }, 30000);
  });

  // ============================================================================
  // SECTION 8 DATE VALIDATION (Phase 3.3)
  // ============================================================================
  describe('Section 8 expiry date validation', () => {
    describe('calculateSection8ExpiryDate', () => {
      it('calculates 14-day notice period for Ground 8 only', () => {
        const today = new Date().toISOString().split('T')[0];
        const result = calculateSection8ExpiryDate({
          service_date: today,
          grounds: [{ code: 8, mandatory: true }],
        });

        expect(result.notice_period_days).toBe(14);
        expect(result.minimum_legal_days).toBe(14);
        expect(result.explanation).toContain('14 days');
      });

      it('calculates 60-day notice period for Ground 10', () => {
        const today = new Date().toISOString().split('T')[0];
        const result = calculateSection8ExpiryDate({
          service_date: today,
          grounds: [{ code: 10, mandatory: false }],
        });

        expect(result.notice_period_days).toBe(60);
        expect(result.minimum_legal_days).toBe(60);
        expect(result.explanation).toContain('60 days');
      });

      it('calculates 60-day notice period for Ground 11', () => {
        const today = new Date().toISOString().split('T')[0];
        const result = calculateSection8ExpiryDate({
          service_date: today,
          grounds: [{ code: 11, mandatory: false }],
        });

        expect(result.notice_period_days).toBe(60);
        expect(result.minimum_legal_days).toBe(60);
        expect(result.explanation).toContain('60 days');
      });

      it('uses MAXIMUM period when multiple grounds selected (Ground 8 + Ground 10 = 60 days)', () => {
        const today = new Date().toISOString().split('T')[0];
        const result = calculateSection8ExpiryDate({
          service_date: today,
          grounds: [
            { code: 8, mandatory: true },   // 14 days
            { code: 10, mandatory: false }, // 60 days
          ],
        });

        // Should use maximum: 60 days
        expect(result.notice_period_days).toBe(60);
        expect(result.minimum_legal_days).toBe(60);
        expect(result.explanation).toContain('60 days');
        expect(result.explanation).toContain('Ground 10');
      });

      it('returns correct earliest_valid_date', () => {
        const serviceDate = '2025-01-15';
        const result = calculateSection8ExpiryDate({
          service_date: serviceDate,
          grounds: [{ code: 8, mandatory: true }],
        });

        // 14 days from 2025-01-15 = 2025-01-29
        expect(result.earliest_valid_date).toBe('2025-01-29');
      });
    });

    describe('validateSection8ExpiryDate', () => {
      it('returns valid=true for dates on or after earliest valid date', () => {
        const serviceDate = '2025-01-15';
        const validExpiry = '2025-01-30'; // 15 days after service (> 14 days minimum for Ground 8)

        const result = validateSection8ExpiryDate(validExpiry, {
          service_date: serviceDate,
          grounds: [{ code: 8, mandatory: true }],
        });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('returns valid=false with suggestedDate for dates too early', () => {
        const serviceDate = '2025-01-15';
        const invalidExpiry = '2025-01-20'; // Only 5 days (< 14 days minimum for Ground 8)

        const result = validateSection8ExpiryDate(invalidExpiry, {
          service_date: serviceDate,
          grounds: [{ code: 8, mandatory: true }],
        });

        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0]).toContain('too early');
        expect(result.suggested_date).toBe('2025-01-29'); // Correct earliest date
      });

      it('returns valid=false when Ground 10 requires 60 days but given only 14', () => {
        const serviceDate = '2025-01-15';
        const invalidExpiry = '2025-01-29'; // 14 days (valid for Ground 8, NOT for Ground 10)

        const result = validateSection8ExpiryDate(invalidExpiry, {
          service_date: serviceDate,
          grounds: [
            { code: 8, mandatory: true },   // 14 days
            { code: 10, mandatory: false }, // 60 days - this drives the requirement!
          ],
        });

        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('too early');
        // 60 days from 2025-01-15 = 2025-03-16
        expect(result.suggested_date).toBe('2025-03-16');
      });

      it('includes suggestedDate in validation response', () => {
        const serviceDate = '2025-01-15';
        const invalidExpiry = '2025-01-20';

        const result = validateSection8ExpiryDate(invalidExpiry, {
          service_date: serviceDate,
          grounds: [{ code: 8, mandatory: true }],
        });

        expect(result.suggested_date).toBeDefined();
        expect(typeof result.suggested_date).toBe('string');
        // Suggested date should be a valid ISO date
        expect(result.suggested_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    describe('Section 8 complete pack with dynamic dates', () => {
      it('generates complete pack successfully when no expiry date provided (auto-calculates)', async () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        // Calculate arrears period dates dynamically
        const twoMonthsAgo = new Date(today);
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const section8Facts = {
          __meta: { case_id: 'TEST-S8-DYNAMIC', jurisdiction: 'england' },
          landlord_name: 'Test Landlord',
          landlord_address_line1: '1 Test Street',
          landlord_city: 'London',
          landlord_postcode: 'SW1A 1AA',
          tenant1_name: 'Test Tenant',
          property_address_line1: '2 Test Road',
          property_city: 'London',
          property_postcode: 'SW1A 2BB',
          tenancy_start_date: '2024-01-01',
          rent_amount: 1200,
          rent_frequency: 'monthly',
          rent_due_day: 1,
          eviction_route: 'Section 8',
          notice_type: 'Section 8',
          section8_grounds: ['Ground 8', 'Ground 10'],
          // Use today's date as service date
          notice_date: todayStr,
          notice_served_date: todayStr,
          // Do NOT provide notice_expiry_date - let it auto-calculate
          notice_service_method: 'first_class_post',
          court_name: 'Central London County Court',
          arrears_breakdown: 'Total arrears £2400',
          total_arrears: 2400,
          arrears_items: [
            {
              period_start: twoMonthsAgo.toISOString().split('T')[0],
              period_end: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0).toISOString().split('T')[0],
              rent_due: 1200,
              rent_paid: 0,
              amount_owed: 1200,
            },
            {
              period_start: oneMonthAgo.toISOString().split('T')[0],
              period_end: new Date(oneMonthAgo.getFullYear(), oneMonthAgo.getMonth() + 1, 0).toISOString().split('T')[0],
              rent_due: 1200,
              rent_paid: 0,
              amount_owed: 1200,
            },
          ],
        };

        // Should successfully generate pack with auto-calculated expiry date
        const pack = await generateCompleteEvictionPack(section8Facts);
        expect(pack.jurisdiction).toBe('england');
        expect(pack.documents.length).toBeGreaterThan(0);

        // Should include Section 8 notice
        const s8Notice = pack.documents.find(d => d.title.includes('Section 8'));
        expect(s8Notice).toBeDefined();
      }, 30000);
    });
  });
});
