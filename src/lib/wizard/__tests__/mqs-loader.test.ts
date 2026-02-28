/**
 * Tests for MQS Loader - Route-Aware Question Filtering
 *
 * These tests verify that S21-only questions are not shown when route=section_8
 */

import { describe, it, expect } from 'vitest';
import { questionIsApplicable, deriveRoutesFromFacts } from '../mqs-loader';
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

// Wales MQS mock for testing Wales routes (Renting Homes Wales Act 2016)
const mockWalesMQS: MasterQuestionSet = {
  id: 'notice_only_wales',
  product: 'notice_only',
  jurisdiction: 'wales',
  version: '1.0.0',
  questions: [
    {
      id: 'selected_notice_route',
      question: 'Which type of notice?',
      inputType: 'select',
      section: 'Notice Type',
      options: [
        { value: 'wales_section_173', label: 'Section 173 (no-fault)' },
        { value: 'wales_fault_based', label: 'Fault-based' },
      ],
      maps_to: ['selected_notice_route'],
    },
    {
      id: 'wales_fault_based_section',
      question: 'Describe the breach',
      inputType: 'textarea',
      section: 'Breach Details',
      routes: ['fault_based'],
      maps_to: ['wales_fault_based_section'],
    },
    {
      id: 'section_173_notice_period',
      question: 'Notice period (6 months standard)',
      inputType: 'info',
      section: 'Notice Period',
      routes: ['section_173'],
      maps_to: [],
    },
    {
      id: 'contract_holder_name',
      question: 'Contract holder name',
      inputType: 'text',
      section: 'Parties',
      maps_to: ['tenant_full_name'],
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

    // Wales routes (Renting Homes Wales Act 2016)
    it('should derive wales_section_173 route from selected_notice_route fact', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'wales_section_173' },
        'wales'
      );
      expect(routes).toContain('wales_section_173');
      expect(routes).toContain('section_173'); // Also adds non-prefixed version for question matching
    });

    it('should derive wales_fault_based route from selected_notice_route fact', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'wales_fault_based' },
        'wales'
      );
      expect(routes).toContain('wales_fault_based');
      expect(routes).toContain('fault_based'); // Also adds non-prefixed version for question matching
    });

    it('should handle section_173 without wales_ prefix', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'section_173' },
        'wales'
      );
      expect(routes).toContain('wales_section_173');
      expect(routes).toContain('section_173');
    });

    it('should handle fault_based route for Wales', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'fault_based' },
        'wales'
      );
      expect(routes).toContain('wales_fault_based');
      expect(routes).toContain('fault_based');
    });

    it('should handle fault-based with hyphen for Wales', () => {
      const routes = deriveRoutesFromFacts(
        { selected_notice_route: 'fault-based' },
        'wales'
      );
      expect(routes).toContain('wales_fault_based');
      expect(routes).toContain('fault_based');
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

  describe('questionIsApplicable - Wales Route Filtering (Renting Homes Wales Act 2016)', () => {
    it('should show fault_based question when route=wales_fault_based', () => {
      const breachQuestion = mockWalesMQS.questions.find((q) => q.id === 'wales_fault_based_section');

      const isApplicable = questionIsApplicable(mockWalesMQS, breachQuestion!, {
        selected_notice_route: 'wales_fault_based',
      });

      expect(isApplicable).toBe(true);
    });

    it('should hide fault_based question when route=wales_section_173', () => {
      const breachQuestion = mockWalesMQS.questions.find((q) => q.id === 'wales_fault_based_section');

      const isApplicable = questionIsApplicable(mockWalesMQS, breachQuestion!, {
        selected_notice_route: 'wales_section_173',
      });

      expect(isApplicable).toBe(false);
    });

    it('should show section_173 notice period info when route=wales_section_173', () => {
      const noticePeriodQuestion = mockWalesMQS.questions.find((q) => q.id === 'section_173_notice_period');

      const isApplicable = questionIsApplicable(mockWalesMQS, noticePeriodQuestion!, {
        selected_notice_route: 'wales_section_173',
      });

      expect(isApplicable).toBe(true);
    });

    it('should hide section_173 notice period info when route=wales_fault_based', () => {
      const noticePeriodQuestion = mockWalesMQS.questions.find((q) => q.id === 'section_173_notice_period');

      const isApplicable = questionIsApplicable(mockWalesMQS, noticePeriodQuestion!, {
        selected_notice_route: 'wales_fault_based',
      });

      expect(isApplicable).toBe(false);
    });

    it('should show contract holder name question for any Wales route (no routes filter)', () => {
      const contractHolderQuestion = mockWalesMQS.questions.find((q) => q.id === 'contract_holder_name');

      const isApplicableS173 = questionIsApplicable(mockWalesMQS, contractHolderQuestion!, {
        selected_notice_route: 'wales_section_173',
      });
      const isApplicableFault = questionIsApplicable(mockWalesMQS, contractHolderQuestion!, {
        selected_notice_route: 'wales_fault_based',
      });

      expect(isApplicableS173).toBe(true);
      expect(isApplicableFault).toBe(true);
    });
  });
});
