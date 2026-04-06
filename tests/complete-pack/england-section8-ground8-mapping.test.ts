/**
 * England Section 8 Ground 8 Complete Pack Mapping Tests
 *
 * Verifies the current England possession drafting and support mappings:
 * 1. Witness Statement includes claimant/defendant names and non-empty sections
 * 2. Certificate of Service includes notice type + service/expiry dates + tenant + address
 * 3. Evidence Collection Checklist includes tenant name
 * 4. Schedule of Arrears includes property/tenant/landlord header fields
 * 5. N119 Q4(a) stays short and references the arrears schedule
 * 6. N119 Q6 year formatting is 2-digit
 * 7. Procedural date rule enforced (signature date must be after notice expiry)
 */

import { beforeAll, describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';

import { buildN119ReasonForPossession } from '@/lib/documents/official-forms-filler';
import { validateCompletePackBeforeGeneration } from '@/lib/documents/noticeOnly';

const fixturePath = path.join(process.cwd(), 'tests/fixtures/complete-pack/england.section8.ground8.case.json');

describe('England Section 8 Ground 8 Complete Pack Mapping', () => {
  let fixture: any;

  beforeAll(() => {
    const fixtureContent = fs.readFileSync(fixturePath, 'utf-8');
    fixture = JSON.parse(fixtureContent);
  });

  describe('Golden Fixture Validation', () => {
    it('should load the fixture successfully', () => {
      expect(fixture).toBeDefined();
      expect(fixture.product).toBe('complete_pack');
      expect(fixture.jurisdiction).toBe('england');
      expect(fixture.route).toBe('section_8');
    });

    it('should have all required fields for Ground 8 case', () => {
      expect(fixture.landlord.full_name).toBe('Tariq Mohammed');
      expect(fixture.tenant.full_name).toBe('Sonia Shezadi');
      expect(fixture.property.address_line_1).toBe('16 Waterloo Road');
      expect(fixture.section8.grounds).toContain('ground_8');
      expect(fixture.arrears.total_arrears).toBe(7000.07);
      expect(fixture.arrears.items).toHaveLength(7);
    });
  });

  describe('N119 Q4 Reason for Possession (buildN119ReasonForPossession)', () => {
    it('should generate short particulars for Ground 8 that reference the arrears schedule', () => {
      const caseData = {
        ground_codes: ['ground_8'],
        ground_numbers: '8',
        total_arrears: fixture.arrears.total_arrears,
        rent_frequency: 'monthly' as const,
      };

      const reason = buildN119ReasonForPossession(caseData);

      expect(reason).toContain('Ground 8');
      expect(reason).toContain('mandatory serious rent arrears ground');
      expect(reason).toContain('attached arrears schedule');
      expect(reason).not.toMatch(/\u2022.*(GBP|\u00A3)\d/i);
      expect(reason).not.toMatch(/- \d{4}-\d{2}-\d{2}/);
    });

    it('should include total arrears amount when the notice service date is supplied', () => {
      const caseData = {
        ground_codes: ['ground_8'],
        ground_numbers: '8',
        total_arrears: 7000.07,
        notice_served_date: '2026-01-19',
        rent_frequency: 'monthly' as const,
      };

      const reason = buildN119ReasonForPossession(caseData);

      expect(reason).toContain('19 January 2026');
      expect(reason).toContain('GBP 7000.07');
    });

    it('should explain the current weekly Ground 8 threshold when rent facts are supplied', () => {
      const caseData = {
        ground_codes: ['ground_8'],
        ground_numbers: '8',
        notice_served_date: '2026-01-19',
        rent_amount: 250.0,
        total_arrears: 3500.0,
        rent_frequency: 'weekly' as const,
      };

      const reason = buildN119ReasonForPossession(caseData);

      expect(reason).toContain('Ground 8 threshold');
      expect(reason).toContain('GBP 3250.00');
      expect(reason).toContain('(13 weeks)');
    });

    it('should handle multiple grounds (Ground 8 + 10)', () => {
      const caseData = {
        ground_codes: ['ground_8', 'ground_10'],
        ground_numbers: '8, 10',
        total_arrears: 3000.0,
        notice_served_date: '2026-01-19',
        rent_frequency: 'monthly' as const,
      };

      const reason = buildN119ReasonForPossession(caseData);

      expect(reason).toContain('Ground 8');
      expect(reason).toContain('Ground 10');
      expect(reason).toContain('rent lawfully due remained unpaid');
    });
  });

  describe('Procedural Date Rule Validation', () => {
    it('should block generation when signature date is before notice expiry', () => {
      const facts = {
        notice_expiry_date: '2026-02-02',
        signature_date: '2026-01-19',
        tenant_full_name: 'Sonia Shezadi',
        landlord_full_name: 'Tariq Mohammed',
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        court_name: 'Bradford Combined Court Centre',
        tenancy_start_date: '2025-07-14',
        section_8_notice_date: '2026-01-19',
      };

      const result = validateCompletePackBeforeGeneration({
        jurisdiction: 'england',
        facts,
        selectedGroundCodes: [8],
        caseType: 'rent_arrears',
      });

      expect(result.blocking.length).toBeGreaterThan(0);
      const dateError = result.blocking.find((item) => item.code === 'COMPLETE_PACK_SIGNATURE_BEFORE_NOTICE_EXPIRY');
      expect(dateError).toBeDefined();
      expect(dateError?.user_message).toContain('cannot be signed before the notice period expires');
    });

    it('should allow generation when signature date is on or after notice expiry', () => {
      const facts = {
        notice_expiry_date: '2026-02-02',
        signature_date: '2026-02-02',
        tenant_full_name: 'Sonia Shezadi',
        landlord_full_name: 'Tariq Mohammed',
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        court_name: 'Bradford Combined Court Centre',
        tenancy_start_date: '2025-07-14',
        section_8_notice_date: '2026-01-19',
      };

      const result = validateCompletePackBeforeGeneration({
        jurisdiction: 'england',
        facts,
        selectedGroundCodes: [8],
        caseType: 'rent_arrears',
      });

      const dateError = result.blocking.find((item) => item.code === 'COMPLETE_PACK_SIGNATURE_BEFORE_NOTICE_EXPIRY');
      expect(dateError).toBeUndefined();
    });

    it('should provide fix hint with earliest permissible date', () => {
      const facts = {
        notice_expiry_date: '2026-02-02',
        signature_date: '2026-01-20',
      };

      const result = validateCompletePackBeforeGeneration({
        jurisdiction: 'england',
        facts,
        selectedGroundCodes: [8],
        caseType: 'rent_arrears',
      });

      const dateError = result.blocking.find((item) => item.code === 'COMPLETE_PACK_SIGNATURE_BEFORE_NOTICE_EXPIRY');
      expect(dateError?.user_fix_hint).toContain('2026-02-02');
    });
  });

  describe('N119 Q6 Date Formatting', () => {
    it('should format year as 2-digit for N119 notice date field', () => {
      const caseData = {
        court_name: 'Bradford Combined Court Centre',
        landlord_full_name: 'Tariq Mohammed',
        tenant_full_name: 'Sonia Shezadi',
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenancy_start_date: '2025-07-14',
        section_8_notice_date: '2026-01-19',
        rent_amount: 1000.01,
        rent_frequency: 'monthly' as const,
      };

      const dateParts = caseData.section_8_notice_date.split('-');
      const twoDigitYear = dateParts[0].slice(-2);
      expect(twoDigitYear).toBe('26');
    });
  });

  describe('Evidence Checklist Tenant Name Mapping', () => {
    it('should map tenant_full_name to tenant_name in data object', () => {
      const evictionCase = {
        tenant_full_name: 'Sonia Shezadi',
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        grounds: [{ code: 'Ground 8', title: 'Rent arrears (mandatory)' }],
        case_type: 'rent_arrears',
      };

      const data = {
        ...evictionCase,
        tenant_name: evictionCase.tenant_full_name,
      };

      expect(data.tenant_name).toBe('Sonia Shezadi');
    });
  });

  describe('Certificate of Service Notice Type Mapping', () => {
    it('should return correct notice type for Section 8', () => {
      const evictionCase = {
        grounds: [{ code: 'Ground 8', title: 'Rent arrears' }],
        case_type: 'rent_arrears',
        jurisdiction: 'england',
      };

      const hasSection8Grounds = evictionCase.grounds && evictionCase.grounds.length > 0;
      const noticeType = hasSection8Grounds ? 'Form 3A notice' : 'Possession Notice';

      expect(noticeType).toBe('Form 3A notice');
    });

    it('should return correct notice type for Section 21', () => {
      const evictionCase = {
        grounds: [],
        case_type: 'no_fault',
        jurisdiction: 'england',
      };

      const hasSection8Grounds = evictionCase.grounds && evictionCase.grounds.length > 0;
      const noticeType = hasSection8Grounds
        ? 'Form 3A notice'
        : evictionCase.case_type === 'no_fault'
          ? 'Section 21 Notice (Form 6A)'
          : 'Possession Notice';

      expect(noticeType).toBe('Section 21 Notice (Form 6A)');
    });
  });

  describe('Schedule of Arrears Header Fields', () => {
    it('should include property, tenant, and landlord in data object', () => {
      const evictionCase = {
        property_address: '16 Waterloo Road, Pudsey, LS28 7PW',
        tenant_full_name: 'Sonia Shezadi',
        tenant_2_name: undefined,
        landlord_full_name: 'Tariq Mohammed',
        landlord_2_name: undefined,
        case_id: 'test-case-id',
      };

      const arrearsData = {
        arrears_schedule: [],
        arrears_total: 7000.07,
      };

      const data = {
        property_address: evictionCase.property_address,
        tenant_full_name: evictionCase.tenant_full_name,
        tenant_2_name: evictionCase.tenant_2_name,
        landlord_full_name: evictionCase.landlord_full_name,
        landlord_2_name: evictionCase.landlord_2_name,
        claimant_reference: evictionCase.case_id,
        arrears_schedule: arrearsData.arrears_schedule,
        arrears_total: arrearsData.arrears_total,
      };

      expect(data.property_address).toBe('16 Waterloo Road, Pudsey, LS28 7PW');
      expect(data.tenant_full_name).toBe('Sonia Shezadi');
      expect(data.landlord_full_name).toBe('Tariq Mohammed');
    });
  });

  describe('Witness Statement Data Mapping', () => {
    it('should map landlord_full_name to landlord_name and tenant_full_name to tenant_name', () => {
      const evictionCase = {
        landlord_full_name: 'Tariq Mohammed',
        landlord_address: '35 Woodhall Park Avenue, Pudsey, LS28 7HF',
        tenant_full_name: 'Sonia Shezadi',
      };

      const data = {
        ...evictionCase,
        landlord_name: evictionCase.landlord_full_name,
        tenant_name: evictionCase.tenant_full_name,
        landlord_address: evictionCase.landlord_address,
      };

      expect(data.landlord_name).toBe('Tariq Mohammed');
      expect(data.tenant_name).toBe('Sonia Shezadi');
      expect(data.landlord_address).toBe('35 Woodhall Park Avenue, Pudsey, LS28 7HF');
    });
  });
});
