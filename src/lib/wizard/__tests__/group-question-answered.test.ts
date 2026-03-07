/**
 * Tests for Group Question "Answered" Logic
 *
 * These tests verify that group questions with optional fields
 * are correctly marked as "answered" when only required fields are filled.
 *
 * Issue: Previously, optional fields would block wizard progression.
 * Fix: Only required fields are checked for group questions.
 */

import { describe, it, expect } from 'vitest';
import { getNextMQSQuestion } from '../mqs-loader';
import type { MasterQuestionSet } from '../mqs-loader';
import type { ExtendedWizardQuestion, WizardField } from '../types';

// Mock MQS with a group question that has required and optional fields
const mockMQS: MasterQuestionSet = {
  id: 'notice_only_england',
  product: 'notice_only',
  jurisdiction: 'england',
  version: '1.0.0',
  questions: [
    {
      id: 'landlord_details',
      section: 'Landlord Details',
      question: 'Your details',
      inputType: 'group',
      fields: [
        {
          id: 'landlord_full_name',
          label: 'Full name',
          inputType: 'text',
          validation: { required: true },
        },
        {
          id: 'landlord_address_line1',
          label: 'Address line 1',
          inputType: 'text',
          validation: { required: true },
        },
        {
          id: 'landlord_address_line2',
          label: 'Address line 2 (optional)',
          inputType: 'text',
          // No validation.required = optional
        },
        {
          id: 'landlord_city',
          label: 'Town or city',
          inputType: 'text',
          validation: { required: true },
        },
        {
          id: 'landlord_postcode',
          label: 'Postcode',
          inputType: 'text',
          validation: { required: true },
        },
        {
          id: 'landlord_phone',
          label: 'Telephone (optional)',
          inputType: 'tel',
          // No validation.required = optional
        },
      ] as WizardField[],
      maps_to: [
        'landlord_full_name',
        'landlord_address_line1',
        'landlord_address_line2',
        'landlord_city',
        'landlord_postcode',
        'landlord_phone',
      ],
    },
    {
      id: 'selected_notice_route',
      section: 'Notice Type',
      question: 'Which type of notice?',
      inputType: 'radio',
      validation: { required: true },
      maps_to: ['selected_notice_route'],
    },
    {
      id: 'tenant_full_name',
      section: 'Tenant Details',
      question: "Tenant's full name",
      inputType: 'text',
      validation: { required: true },
      maps_to: ['tenant_full_name'],
    },
  ] as ExtendedWizardQuestion[],
};

describe('Group Question Answered Logic', () => {
  describe('getNextMQSQuestion with group questions', () => {
    it('should advance when all REQUIRED fields are filled and optional fields are empty', () => {
      // Required fields filled, optional fields empty
      const facts = {
        landlord_full_name: 'John Smith',
        landlord_address_line1: '123 Main Street',
        // landlord_address_line2 is optional and empty
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        // landlord_phone is optional and empty
      };

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // Should advance to the next question, not stay on landlord_details
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion?.id).not.toBe('landlord_details');
      expect(nextQuestion?.id).toBe('selected_notice_route');
    });

    it('should stay on same question when a REQUIRED field is missing', () => {
      // Missing landlord_city (required)
      const facts = {
        landlord_full_name: 'John Smith',
        landlord_address_line1: '123 Main Street',
        // landlord_city is MISSING (required!)
        landlord_postcode: 'SW1A 1AA',
      };

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // Should return landlord_details because required field is missing
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion?.id).toBe('landlord_details');
    });

    it('should stay on same question when all fields are empty', () => {
      const facts = {};

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // Should return the first question
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion?.id).toBe('landlord_details');
    });

    it('should handle empty string for required field as unanswered', () => {
      const facts = {
        landlord_full_name: '',  // Empty string should be treated as unanswered
        landlord_address_line1: '123 Main Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
      };

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // Should return landlord_details because landlord_full_name is empty
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion?.id).toBe('landlord_details');
    });

    it('should handle whitespace-only string for required field as unanswered', () => {
      const facts = {
        landlord_full_name: '   ',  // Whitespace only should be treated as unanswered
        landlord_address_line1: '123 Main Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
      };

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // Should return landlord_details because landlord_full_name is whitespace-only
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion?.id).toBe('landlord_details');
    });

    it('should advance when optional fields contain values', () => {
      // All fields filled including optional
      const facts = {
        landlord_full_name: 'John Smith',
        landlord_address_line1: '123 Main Street',
        landlord_address_line2: 'Flat 2',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        landlord_phone: '020 1234 5678',
      };

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // Should advance to next question
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion?.id).toBe('selected_notice_route');
    });

    it('should return null when all questions are answered', () => {
      const facts = {
        landlord_full_name: 'John Smith',
        landlord_address_line1: '123 Main Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        selected_notice_route: 'section_8',
        tenant_full_name: 'Jane Doe',
      };

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // All questions answered, should return null
      expect(nextQuestion).toBeNull();
    });
  });

  describe('Non-group questions', () => {
    it('should require all maps_to paths for non-group questions', () => {
      // landlord_details is answered
      const facts = {
        landlord_full_name: 'John Smith',
        landlord_address_line1: '123 Main Street',
        landlord_city: 'London',
        landlord_postcode: 'SW1A 1AA',
        // selected_notice_route not answered
      };

      const nextQuestion = getNextMQSQuestion(mockMQS, facts);

      // Should return selected_notice_route
      expect(nextQuestion).not.toBeNull();
      expect(nextQuestion?.id).toBe('selected_notice_route');
    });
  });
});

describe('Group question with no required fields', () => {
  const mqs: MasterQuestionSet = {
    id: 'test_mqs',
    product: 'notice_only',
    jurisdiction: 'england',
    version: '1.0.0',
    questions: [
      {
        id: 'optional_group',
        section: 'Optional',
        question: 'Optional info',
        inputType: 'group',
        fields: [
          {
            id: 'optional_field1',
            label: 'Optional 1',
            inputType: 'text',
            // No validation.required
          },
          {
            id: 'optional_field2',
            label: 'Optional 2',
            inputType: 'text',
            // No validation.required
          },
        ] as WizardField[],
        maps_to: ['optional_field1', 'optional_field2'],
      },
      {
        id: 'next_question',
        section: 'Next',
        question: 'Next question',
        inputType: 'text',
        maps_to: ['next_answer'],
      },
    ] as ExtendedWizardQuestion[],
  };

  it('should mark group with no required fields as answered even when empty', () => {
    const facts = {};

    const nextQuestion = getNextMQSQuestion(mqs, facts);

    // Group with no required fields should be considered answered
    // So we should get the next question
    expect(nextQuestion).not.toBeNull();
    expect(nextQuestion?.id).toBe('next_question');
  });
});
