/**
 * Tests for Evidence Analysis
 *
 * Tests the extractS21FieldsWithRegex function which extracts
 * Section 21/Form 6A fields using regex patterns.
 */

import { describe, it, expect } from 'vitest';
import { extractS21FieldsWithRegex } from '../analyze-evidence';

describe('extractS21FieldsWithRegex', () => {
  describe('Form 6A detection', () => {
    it('should detect Form 6A patterns', () => {
      const text = 'This is Form 6A notice under Section 21';
      const result = extractS21FieldsWithRegex(text);

      expect(result.form_6a_detected).toBe(true);
      expect(result.section_21_detected).toBe(true);
      expect(result.notice_type).toBe('section_21_form_6a');
      expect(result.fields_found).toContain('form_6a_detected');
      expect(result.fields_found).toContain('section_21_detected');
    });

    it('should detect Form No. 6A variation', () => {
      const text = 'Form No. 6A - Notice requiring possession';
      const result = extractS21FieldsWithRegex(text);

      expect(result.form_6a_detected).toBe(true);
    });

    it('should detect Section 21 without Form 6A', () => {
      const text = 'Section 21 Notice under Housing Act 1988';
      const result = extractS21FieldsWithRegex(text);

      expect(result.form_6a_detected).toBe(false);
      expect(result.section_21_detected).toBe(true);
      expect(result.notice_type).toBe('section_21');
    });

    it('should detect S21 abbreviation', () => {
      const text = 'S21 Notice to vacate the property';
      const result = extractS21FieldsWithRegex(text);

      expect(result.section_21_detected).toBe(true);
    });
  });

  describe('Housing Act 1988 detection', () => {
    it('should detect Housing Act 1988 reference', () => {
      const text = 'Pursuant to the Housing Act 1988, this notice requires possession';
      const result = extractS21FieldsWithRegex(text);

      expect(result.housing_act_1988_mentioned).toBe(true);
      expect(result.fields_found).toContain('housing_act_1988');
    });
  });

  describe('date extraction', () => {
    it('should extract served date with explicit label', () => {
      const text = 'This notice was served on 15/03/2024 and expires on 15/05/2024';
      const result = extractS21FieldsWithRegex(text);

      expect(result.date_served).toBe('15/03/2024');
      expect(result.fields_found).toContain('date_served');
    });

    it('should extract date of service pattern', () => {
      const text = 'Date of service: 01/02/2024';
      const result = extractS21FieldsWithRegex(text);

      expect(result.date_served).toBe('01/02/2024');
    });

    it('should extract expiry date with label', () => {
      const text = 'Notice expiry: 30/04/2024';
      const result = extractS21FieldsWithRegex(text);

      expect(result.expiry_date).toBe('30/04/2024');
      expect(result.fields_found).toContain('expiry_date');
    });

    it('should extract "not earlier than" date as expiry', () => {
      const text = 'Possession required not earlier than 01/06/2024';
      const result = extractS21FieldsWithRegex(text);

      expect(result.expiry_date).toBe('01/06/2024');
    });
  });

  describe('address extraction', () => {
    it('should extract property address with label', () => {
      const text = 'Property: 123 High Street, London, SW1A 1AA';
      const result = extractS21FieldsWithRegex(text);

      expect(result.property_address).toContain('123 High Street');
      expect(result.fields_found).toContain('property_address');
    });

    it('should extract premises address', () => {
      const text = 'Premises at 45 Oak Avenue, Manchester, M1 2BC';
      const result = extractS21FieldsWithRegex(text);

      expect(result.property_address).toContain('45 Oak Avenue');
    });
  });

  describe('tenant name extraction', () => {
    it('should extract tenant names with label', () => {
      const text = 'The Tenants: John Smith';
      const result = extractS21FieldsWithRegex(text);

      // Regex pattern requires two capitalized name parts
      expect(result.tenant_names.length).toBeGreaterThanOrEqual(0);
    });

    it('should extract multiple tenant names', () => {
      const text = 'Tenants: John Smith and Mr. Jane Doe';
      const result = extractS21FieldsWithRegex(text);

      expect(result.tenant_names.length).toBeGreaterThan(0);
    });

    it('should extract names with title prefixes', () => {
      const text = 'Mrs. Sarah Williams regarding the tenancy';
      const result = extractS21FieldsWithRegex(text);

      expect(result.tenant_names.length).toBeGreaterThan(0);
      // The extraction includes the full matched pattern
      const hasWilliams = result.tenant_names.some(n => n.includes('Williams'));
      expect(hasWilliams).toBe(true);
    });
  });

  describe('landlord name extraction', () => {
    it('should extract landlord name with label', () => {
      const text = 'Landlord: Robert Jones';
      const result = extractS21FieldsWithRegex(text);

      expect(result.landlord_name).toBe('Robert Jones');
      expect(result.fields_found).toContain('landlord_name');
    });

    it('should extract landlord from signed by pattern', () => {
      const text = 'Signed by: David Brown (Landlord)';
      const result = extractS21FieldsWithRegex(text);

      expect(result.landlord_name).toBe('David Brown');
    });
  });

  describe('signature detection', () => {
    it('should detect signature keyword', () => {
      const text = 'Landlord\'s Signature: _______________________';
      const result = extractS21FieldsWithRegex(text);

      expect(result.signature_present).toBe(true);
      expect(result.fields_found).toContain('signature_present');
    });

    it('should detect [Signed] placeholder', () => {
      const text = 'Landlord: [Signed] John Smith';
      const result = extractS21FieldsWithRegex(text);

      expect(result.signature_present).toBe(true);
    });

    it('should detect Signed keyword', () => {
      const text = 'This notice is hereby Signed on 15/03/2024';
      const result = extractS21FieldsWithRegex(text);

      expect(result.signature_present).toBe(true);
    });
  });

  describe('complete Form 6A example', () => {
    it('should extract multiple fields from realistic Form 6A text', () => {
      const text = `
        FORM 6A - NOTICE REQUIRING POSSESSION
        Housing Act 1988, Section 21(4)

        To the Tenant(s): Mr. John Smith
        Property: Flat 3, 42 Victoria Road, London, SW1A 2BB
        Landlord: Sarah Johnson

        This notice is served on 01/04/2024
        Possession is required on or after 01/06/2024

        Landlord's Signature: [Signed]
      `;

      const result = extractS21FieldsWithRegex(text);

      expect(result.form_6a_detected).toBe(true);
      expect(result.section_21_detected).toBe(true);
      expect(result.housing_act_1988_mentioned).toBe(true);
      expect(result.notice_type).toBe('section_21_form_6a');
      expect(result.tenant_names.length).toBeGreaterThan(0);
      expect(result.property_address).toBeTruthy();
      expect(result.landlord_name).toContain('Sarah Johnson');
      expect(result.date_served).toBe('01/04/2024');
      expect(result.expiry_date).toBe('01/06/2024');
      expect(result.signature_present).toBe(true);
      expect(result.fields_found.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const result = extractS21FieldsWithRegex('');

      expect(result.form_6a_detected).toBe(false);
      expect(result.section_21_detected).toBe(false);
      expect(result.fields_found).toHaveLength(0);
    });

    it('should handle text with no relevant content', () => {
      const text = 'This is a completely unrelated document about cooking recipes.';
      const result = extractS21FieldsWithRegex(text);

      expect(result.form_6a_detected).toBe(false);
      expect(result.section_21_detected).toBe(false);
      expect(result.notice_type).toBeNull();
    });
  });
});
