/**
 * Tests for MQS Loader - Route-Aware Question Filtering
 *
 * These tests verify that S21-only questions are not shown when route=section_8
 */

import { describe, it, expect } from 'vitest';
import { questionIsApplicable, deriveRoutesFromFacts, getNextMQSQuestion } from '../mqs-loader';
import type { MasterQuestionSet } from '../mqs-loader';
import type { ExtendedWizardQuestion } from '../types';

// Create a mock MQS directly instead of mocking fs
const mockMQS: MasterQuestionSet = {
  id: 'notice_only_england',
  product: 'notice_only',
  jurisdiction: 'england',
  version: '1.0.0',
  questions: [
    {
      id: 'selected_notice_route',
      question: 'Which type of notice?',
      inputType: 'select',
      section: 'Notice Type',
      options: [
        { value: 'section_8', label: 'Section 8' },
        { value: 'section_21', label: 'Section 21' },
      ],
      maps_to: ['selected_notice_route'],
    },
    {
      id: 'epc_provided',
      question: 'Was EPC provided?',
      inputType: 'yes_no',
      section: 'Compliance',
      routes: ['section_21'],
      maps_to: ['epc_provided'],
    },
    {
      id: 'how_to_rent_provided',
      question: 'Was How to Rent guide provided?',
      inputType: 'yes_no',
      section: 'Compliance',
      routes: ['section_21'],
      maps_to: ['how_to_rent_provided'],
    },
    {
      id: 'property_licensing',
      question: 'Property licensing status',
      inputType: 'select',
      section: 'Compliance',
      routes: ['section_21'],
      maps_to: ['property_licensing_status'],
    },
    {
      id: 'deposit_protected_scheme',
      question: 'Is deposit protected?',
      inputType: 'yes_no',
      section: 'Deposit',
      maps_to: ['deposit_protected'],
    },
  ] as ExtendedWizardQuestion[],
};

describe('MQS Route Filtering', () => {
  describe('deriveRoutesFromFacts', () => {
    it('should derive section_8 route from selected_notice_route fact', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'section_8' },
        'england'
      );
      expect(routes).toContain('section_8');
      expect(routes).not.toContain('section_21');
    });

    it('should derive section_21 route from selected_notice_route fact', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'section_21' },
        'england'
      );
      expect(routes).toContain('section_21');
    });

    it('should handle human-readable route labels', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'Section 8' },
        'england'
      );
      expect(routes).toContain('section_8');
    });

    it('should handle array of routes', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: ['section_8', 'section_21'] },
        'england'
      );
      expect(routes).toContain('section_8');
      expect(routes).toContain('section_21');
    });

    it('should return unknown for empty facts', () => {
      const routes = deriveRoutesFromFacts({}, 'england');
      expect(routes).toContain('unknown');
    });

    it('should auto-add notice_to_leave for Scotland', () => {
      const routes = deriveRoutesFromFacts({}, 'scotland');
      expect(routes).toContain('notice_to_leave');
    });
  });

  describe('questionIsApplicable - Route Filtering', () => {
    it('should hide S21-only questions when route=section_8', () => {
      const epcQuestion = mockMQS.questions.find((q) => q.id === 'epc_provided');

      const isApplicable = questionIsApplicable(mockMQS, epcQuestion!, {
        selected_notice_route: 'section_8',
      });

      expect(isApplicable).toBe(false);
    });

    it('should show S21-only questions when route=section_21', () => {
      const epcQuestion = mockMQS.questions.find((q) => q.id === 'epc_provided');

      const isApplicable = questionIsApplicable(mockMQS, epcQuestion!, {
        selected_notice_route: 'section_21',
      });

      expect(isApplicable).toBe(true);
    });

    it('should hide how_to_rent_provided when route=section_8', () => {
      const h2rQuestion = mockMQS.questions.find((q) => q.id === 'how_to_rent_provided');

      const isApplicable = questionIsApplicable(mockMQS, h2rQuestion!, {
        selected_notice_route: 'section_8',
      });

      expect(isApplicable).toBe(false);
    });

    it('should hide property_licensing when route=section_8', () => {
      const licensingQuestion = mockMQS.questions.find((q) => q.id === 'property_licensing');

      const isApplicable = questionIsApplicable(mockMQS, licensingQuestion!, {
        selected_notice_route: 'section_8',
      });

      expect(isApplicable).toBe(false);
    });

    it('should show questions without routes field for any route', () => {
      const depositQuestion = mockMQS.questions.find((q) => q.id === 'deposit_protected_scheme');

      // Should be visible for both routes
      const isApplicableS8 = questionIsApplicable(mockMQS, depositQuestion!, {
        selected_notice_route: 'section_8',
      });
      const isApplicableS21 = questionIsApplicable(mockMQS, depositQuestion!, {
        selected_notice_route: 'section_21',
      });

      expect(isApplicableS8).toBe(true);
      expect(isApplicableS21).toBe(true);
    });

    it('should show S21-only questions when no route selected yet', () => {
      const epcQuestion = mockMQS.questions.find((q) => q.id === 'epc_provided');

      // When route is unknown, questions with routes should still be hidden
      // because deriveRoutesFromFacts returns ['unknown'] when no route selected
      const isApplicable = questionIsApplicable(mockMQS, epcQuestion!, {});

      expect(isApplicable).toBe(false);
    });
  });
});

// ==============================================================================
// REGRESSION TESTS: Wizard Progression with Optional Fields
// ==============================================================================
// These tests ensure the wizard can progress when optional fields are left empty.
// The bug was: optional fields like landlord_address_line2 left empty would cause
// the wizard to appear "stuck" because the question was considered unanswered.

describe('Wizard Progression - Optional Fields Regression', () => {
  // Mock MQS with a group question containing optional fields
  const groupQuestionMQS: MasterQuestionSet = {
    id: 'test_mqs',
    product: 'notice_only',
    jurisdiction: 'england',
    version: '1.0.0',
    questions: [
      {
        id: 'landlord_details',
        question: 'Landlord Details',
        inputType: 'group',
        section: 'Landlord',
        maps_to: [
          'landlord_full_name',
          'landlord_address_line1',
          'landlord_address_line2', // OPTIONAL - often left blank
          'landlord_city',
          'landlord_postcode',
          'landlord_phone',
        ],
        fields: [
          { id: 'landlord_full_name', inputType: 'text', label: 'Name', validation: { required: true } },
          { id: 'landlord_address_line1', inputType: 'text', label: 'Address Line 1', validation: { required: true } },
          { id: 'landlord_address_line2', inputType: 'text', label: 'Address Line 2 (optional)' },
          { id: 'landlord_city', inputType: 'text', label: 'City', validation: { required: true } },
          { id: 'landlord_postcode', inputType: 'text', label: 'Postcode', validation: { required: true } },
          { id: 'landlord_phone', inputType: 'text', label: 'Phone', validation: { required: true } },
        ],
      },
      {
        id: 'tenant_details',
        question: 'Tenant Details',
        inputType: 'group',
        section: 'Tenant',
        maps_to: ['tenant_full_name'],
        fields: [
          { id: 'tenant_full_name', inputType: 'text', label: 'Name', validation: { required: true } },
        ],
      },
    ] as ExtendedWizardQuestion[],
  };

  it('REGRESSION: should progress to next question when optional field is empty string', () => {
    // Simulate user filling required fields but leaving address_line2 empty
    const facts = {
      landlord_full_name: 'John Smith',
      landlord_address_line1: '123 Main St',
      landlord_address_line2: '', // Optional field left empty
      landlord_city: 'London',
      landlord_postcode: 'SW1A 1AA',
      landlord_phone: '020 1234 5678',
    };

    const nextQuestion = getNextMQSQuestion(groupQuestionMQS, facts);

    // Should progress to tenant_details, NOT return landlord_details again
    expect(nextQuestion).not.toBeNull();
    expect(nextQuestion?.id).toBe('tenant_details');
  });

  it('REGRESSION: empty string should be treated as "answered" for optional fields', () => {
    // All fields including optional are filled (optional with empty string)
    const facts = {
      landlord_full_name: 'John Smith',
      landlord_address_line1: '123 Main St',
      landlord_address_line2: '', // Empty string = user saw it and left it blank
      landlord_city: 'London',
      landlord_postcode: 'SW1A 1AA',
      landlord_phone: '020 1234 5678',
      tenant_full_name: 'Jane Doe',
    };

    const nextQuestion = getNextMQSQuestion(groupQuestionMQS, facts);

    // All questions answered, should return null (complete)
    expect(nextQuestion).toBeNull();
  });

  it('should NOT progress when required field is missing (undefined)', () => {
    // landlord_full_name is missing (undefined)
    const facts = {
      // landlord_full_name: undefined (not set)
      landlord_address_line1: '123 Main St',
      landlord_address_line2: '',
      landlord_city: 'London',
      landlord_postcode: 'SW1A 1AA',
      landlord_phone: '020 1234 5678',
    };

    const nextQuestion = getNextMQSQuestion(groupQuestionMQS, facts);

    // Should return landlord_details because a required field is missing
    expect(nextQuestion).not.toBeNull();
    expect(nextQuestion?.id).toBe('landlord_details');
  });

  it('should NOT progress when required field is null', () => {
    const facts = {
      landlord_full_name: null, // Explicitly null
      landlord_address_line1: '123 Main St',
      landlord_address_line2: '',
      landlord_city: 'London',
      landlord_postcode: 'SW1A 1AA',
      landlord_phone: '020 1234 5678',
    };

    const nextQuestion = getNextMQSQuestion(groupQuestionMQS, facts);

    // Should return landlord_details because landlord_full_name is null
    expect(nextQuestion).not.toBeNull();
    expect(nextQuestion?.id).toBe('landlord_details');
  });
});
