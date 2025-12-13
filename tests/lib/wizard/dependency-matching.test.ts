/**
 * Regression test for array-vs-scalar dependency matching
 *
 * Tests that questionIsApplicable correctly handles cases where:
 * - Stored answer is an array (multi-select like ["section_8"])
 * - Dependency value is a scalar (like "section_8")
 *
 * This was a critical bug: section8_grounds wasn't showing in the UI
 * because eviction_route_intent stored ["section_8"] but dependency
 * checked for "section_8" without handling the array case.
 */

import { describe, expect, it } from 'vitest';
import { questionIsApplicable, loadMQS, type MasterQuestionSet } from '@/lib/wizard/mqs-loader';
import type { ExtendedWizardQuestion } from '@/lib/wizard/types';

describe('Dependency Matching: Array vs Scalar', () => {
  /**
   * Core regression test: Multi-select answer should satisfy scalar dependency
   */
  it('should match when stored answer is array ["section_8"] and dependency is scalar "section_8"', () => {
    const mqs: MasterQuestionSet = {
      id: 'test_mqs',
      product: 'notice_only',
      jurisdiction: 'england-wales',
      version: '1.0.0',
      questions: [
        {
          id: 'eviction_route_intent',
          section: 'Route',
          question: 'Which route?',
          inputType: 'multi_select',
          options: ['section_8', 'section_21'],
          maps_to: ['eviction_route_intent'],
        },
        {
          id: 'section8_grounds',
          section: 'Grounds',
          question: 'Which grounds?',
          inputType: 'multi_select',
          options: ['Ground 8', 'Ground 10'],
          dependsOn: {
            questionId: 'eviction_route_intent',
            value: 'section_8', // Scalar dependency
          },
          routes: ['section_8'],
          maps_to: ['section8_grounds'],
        },
      ],
    };

    const facts = {
      eviction_route_intent: ['section_8'], // Array answer from multi-select
    };

    const question = mqs.questions.find((q) => q.id === 'section8_grounds')!;
    const result = questionIsApplicable(mqs, question, facts);

    // This should be true: ["section_8"] includes "section_8"
    expect(result).toBe(true);
  });

  /**
   * Test reverse: scalar answer should satisfy array dependency
   */
  it('should match when stored answer is scalar "section_8" and dependency is array ["section_8"]', () => {
    const mqs: MasterQuestionSet = {
      id: 'test_mqs',
      product: 'notice_only',
      jurisdiction: 'england-wales',
      version: '1.0.0',
      questions: [
        {
          id: 'route_type',
          section: 'Route',
          question: 'Route?',
          inputType: 'select',
          options: ['section_8', 'section_21'],
          maps_to: ['route_type'],
        },
        {
          id: 'conditional_field',
          section: 'Details',
          question: 'Details?',
          inputType: 'text',
          dependsOn: {
            questionId: 'route_type',
            value: ['section_8', 'section_21'], // Array dependency
          },
          maps_to: ['conditional_field'],
        },
      ],
    };

    const facts = {
      route_type: 'section_8', // Scalar answer
    };

    const question = mqs.questions.find((q) => q.id === 'conditional_field')!;
    const result = questionIsApplicable(mqs, question, facts);

    // This should be true: "section_8" is in ["section_8", "section_21"]
    expect(result).toBe(true);
  });

  /**
   * Test array answer with multiple selections
   */
  it('should match when array answer contains one of multiple dependency values', () => {
    const mqs: MasterQuestionSet = {
      id: 'test_mqs',
      product: 'notice_only',
      jurisdiction: 'england-wales',
      version: '1.0.0',
      questions: [
        {
          id: 'routes',
          section: 'Routes',
          question: 'Routes?',
          inputType: 'multi_select',
          options: ['section_8', 'section_21'],
          maps_to: ['routes'],
        },
        {
          id: 'grounds_field',
          section: 'Grounds',
          question: 'Grounds?',
          inputType: 'text',
          dependsOn: {
            questionId: 'routes',
            value: 'section_8', // Scalar dependency
          },
          maps_to: ['grounds_field'],
        },
      ],
    };

    const facts = {
      routes: ['section_8', 'section_21'], // Array with multiple values
    };

    const question = mqs.questions.find((q) => q.id === 'grounds_field')!;
    const result = questionIsApplicable(mqs, question, facts);

    // This should be true: ["section_8", "section_21"] includes "section_8"
    expect(result).toBe(true);
  });

  /**
   * Test NO match when array doesn't contain scalar
   */
  it('should NOT match when array answer does not contain scalar dependency', () => {
    const mqs: MasterQuestionSet = {
      id: 'test_mqs',
      product: 'notice_only',
      jurisdiction: 'england-wales',
      version: '1.0.0',
      questions: [
        {
          id: 'routes',
          section: 'Routes',
          question: 'Routes?',
          inputType: 'multi_select',
          options: ['section_8', 'section_21'],
          maps_to: ['routes'],
        },
        {
          id: 'section8_only_field',
          section: 'Section 8',
          question: 'Section 8?',
          inputType: 'text',
          dependsOn: {
            questionId: 'routes',
            value: 'section_8', // Looking for section_8
          },
          maps_to: ['section8_only_field'],
        },
      ],
    };

    const facts = {
      routes: ['section_21'], // Only section_21, not section_8
    };

    const question = mqs.questions.find((q) => q.id === 'section8_only_field')!;
    const result = questionIsApplicable(mqs, question, facts);

    // This should be false: ["section_21"] does not include "section_8"
    expect(result).toBe(false);
  });

  /**
   * Integration test with real MQS data
   */
  it('should work with real Notice Only MQS for section8_grounds', () => {
    const mqs = loadMQS('notice_only', 'england-wales');

    if (!mqs) {
      throw new Error('Failed to load notice_only MQS for england-wales');
    }

    const section8GroundsQuestion = mqs.questions.find((q) => q.id === 'section8_grounds');

    if (!section8GroundsQuestion) {
      throw new Error('section8_grounds question not found in MQS');
    }

    // Simulate user selecting Section 8 route (multi-select answer)
    const facts = {
      eviction_route_intent: ['section_8'],
    };

    const result = questionIsApplicable(mqs, section8GroundsQuestion, facts);

    // CRITICAL: This must be true for the UI to show grounds question
    expect(result).toBe(true);
  });

  /**
   * Test with both routes selected
   */
  it('should show section8_grounds when both section_8 and section_21 are selected', () => {
    const mqs = loadMQS('notice_only', 'england-wales');

    if (!mqs) {
      throw new Error('Failed to load notice_only MQS for england-wales');
    }

    const section8GroundsQuestion = mqs.questions.find((q) => q.id === 'section8_grounds');

    if (!section8GroundsQuestion) {
      throw new Error('section8_grounds question not found in MQS');
    }

    // User selecting both routes
    const facts = {
      eviction_route_intent: ['section_8', 'section_21'],
    };

    const result = questionIsApplicable(mqs, section8GroundsQuestion, facts);

    // Should still be true: ["section_8", "section_21"] includes "section_8"
    expect(result).toBe(true);
  });

  /**
   * Test section8_grounds should NOT show when only section_21 selected
   */
  it('should NOT show section8_grounds when only section_21 is selected', () => {
    const mqs = loadMQS('notice_only', 'england-wales');

    if (!mqs) {
      throw new Error('Failed to load notice_only MQS for england-wales');
    }

    const section8GroundsQuestion = mqs.questions.find((q) => q.id === 'section8_grounds');

    if (!section8GroundsQuestion) {
      throw new Error('section8_grounds question not found in MQS');
    }

    const facts = {
      eviction_route_intent: ['section_21'], // Only Section 21
    };

    const result = questionIsApplicable(mqs, section8GroundsQuestion, facts);

    // Should be false: ["section_21"] does not include "section_8"
    expect(result).toBe(false);
  });
});
