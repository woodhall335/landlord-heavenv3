/**
 * Tests for MQS Loader - Route-Aware Question Filtering
 *
 * These tests verify that S21-only questions are not shown when route=section_8
 */

import { questionIsApplicable, loadMQS, deriveRoutesFromFacts } from '../mqs-loader';

// Mock fs and yaml since we're testing the logic, not file loading
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn(() => `
id: notice_only_england
product: notice_only
jurisdiction: england
version: "1.0.0"
questions:
  - id: selected_notice_route
    question: "Which type of notice?"
    inputType: select
    options:
      - section_8
      - section_21
    maps_to:
      - selected_notice_route
  - id: epc_provided
    question: "Was EPC provided?"
    inputType: yes_no
    routes:
      - section_21
    maps_to:
      - epc_provided
  - id: how_to_rent_provided
    question: "Was How to Rent guide provided?"
    inputType: yes_no
    routes:
      - section_21
    maps_to:
      - how_to_rent_provided
  - id: property_licensing
    question: "Property licensing status"
    inputType: select
    routes:
      - section_21
    maps_to:
      - property_licensing_status
  - id: deposit_protected_scheme
    question: "Is deposit protected?"
    inputType: yes_no
    maps_to:
      - deposit_protected
`),
}));

describe('MQS Route Filtering', () => {
  let mqs: any;

  beforeAll(() => {
    mqs = loadMQS('notice_only', 'england');
  });

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
  });

  describe('questionIsApplicable - Route Filtering', () => {
    it('should hide S21-only questions when route=section_8', () => {
      const epcQuestion = mqs?.questions.find((q: any) => q.id === 'epc_provided');

      const isApplicable = questionIsApplicable(mqs, epcQuestion, {
        selected_notice_route: 'section_8',
      });

      expect(isApplicable).toBe(false);
    });

    it('should show S21-only questions when route=section_21', () => {
      const epcQuestion = mqs?.questions.find((q: any) => q.id === 'epc_provided');

      const isApplicable = questionIsApplicable(mqs, epcQuestion, {
        selected_notice_route: 'section_21',
      });

      expect(isApplicable).toBe(true);
    });

    it('should hide how_to_rent_provided when route=section_8', () => {
      const h2rQuestion = mqs?.questions.find((q: any) => q.id === 'how_to_rent_provided');

      const isApplicable = questionIsApplicable(mqs, h2rQuestion, {
        selected_notice_route: 'section_8',
      });

      expect(isApplicable).toBe(false);
    });

    it('should hide property_licensing when route=section_8', () => {
      const licensingQuestion = mqs?.questions.find((q: any) => q.id === 'property_licensing');

      const isApplicable = questionIsApplicable(mqs, licensingQuestion, {
        selected_notice_route: 'section_8',
      });

      expect(isApplicable).toBe(false);
    });

    it('should show questions without routes field for any route', () => {
      const depositQuestion = mqs?.questions.find((q: any) => q.id === 'deposit_protected_scheme');

      // Should be visible for both routes
      const isApplicableS8 = questionIsApplicable(mqs, depositQuestion, {
        selected_notice_route: 'section_8',
      });
      const isApplicableS21 = questionIsApplicable(mqs, depositQuestion, {
        selected_notice_route: 'section_21',
      });

      expect(isApplicableS8).toBe(true);
      expect(isApplicableS21).toBe(true);
    });
  });
});
