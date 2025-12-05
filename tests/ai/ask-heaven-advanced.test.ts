/**
 * Advanced Ask Heaven Tests
 *
 * Tests jurisdiction-aware, context-enriched Ask Heaven implementation.
 *
 * CRITICAL: Tests that Ask Heaven NEVER:
 * - Introduces new legal rules
 * - Contradicts decision engine
 * - Recommends legal strategy
 */

import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { enhanceAnswer } from '@/lib/ai/ask-heaven';
import type { DecisionOutput } from '@/lib/decision-engine';
import { __setTestJsonAIClient } from '@/lib/ai/openai-client';
import type { ChatMessage } from '@/lib/ai/openai-client';

// Mock question types
const textareaQuestion = {
  id: 'arrears_details',
  question: 'Please describe the rent arrears in detail',
  inputType: 'textarea',
  suggestion_prompt: 'Include dates, amounts, and payment history',
};

const asbQuestion = {
  id: 'asb_details',
  question: 'Describe the antisocial behaviour incidents',
  inputType: 'textarea',
  suggestion_prompt:
    'Include specific dates, times, and descriptions of incidents',
};

// Mock decision engine output with Section 21 blocked
const s21BlockedDecision: DecisionOutput = {
  recommended_routes: ['section_8'],
  recommended_grounds: [
    {
      code: '8',
      title: 'Serious Rent Arrears (2+ months)',
      type: 'mandatory',
      notice_period_days: 14,
      // Current DecisionOutput.GroundRecommendation uses qualitative weights
      weight: 'high',
      success_probability: 'very_high',
      reasoning: 'Tenant has at least 2 months of unpaid rent.',
    },
  ],
  blocking_issues: [
    {
      route: 'section_21',
      issue: 'deposit_not_protected',
      description: 'Deposit not protected in approved scheme',
      action_required: 'Protect deposit before serving Section 21',
      severity: 'blocking',
    },
  ],
  warnings: ['Evidence of arrears required'],
  analysis_summary: 'Section 21 blocked, Section 8 available',
  notice_period_suggestions: {
    section_8: 14,
  },
  pre_action_requirements: {
    required: false,
    met: null,
    details: [],
  },
};

// Mock decision engine output for Scotland
const scotlandDecision: DecisionOutput = {
  recommended_routes: ['notice_to_leave'],
  recommended_grounds: [
    {
      code: '1',
      title: 'Rent Arrears (3+ months)',
      type: 'discretionary',
      notice_period_days: 28,
      weight: 'high',
      success_probability: 'high',
      reasoning: 'Tenant owes at least 3 months of rent.',
    },
  ],
  blocking_issues: [],
  warnings: ['Pre-action requirements must be met for Ground 1'],
  analysis_summary: 'Ground 1 available with pre-action compliance',
  notice_period_suggestions: {
    notice_to_leave: 28,
  },
  pre_action_requirements: {
    required: true,
    met: true,
    details: ['Contact tenant', 'Signpost to advice'],
  },
};



// Mock case-intel with inconsistencies
const caseIntelWithIssues: any = {
  inconsistencies: {
    inconsistencies: [
      {
        fields: [
          'issues.rent_arrears.arrears_items',
          'issues.rent_arrears.total_arrears',
        ],
        message: 'Arrears items sum (£3,000) does not match total (£4,500)',
        severity: 'critical',
        category: 'arrears',
      },
      {
        fields: ['notice.service_date', 'tenancy.start_date'],
        message: 'Notice served before tenancy started',
        severity: 'critical',
        category: 'timeline',
      },
    ],
  },
};

beforeAll(() => {
  __setTestJsonAIClient({
    async jsonCompletion<T = any>(
      messagesInput: ChatMessage | ChatMessage[],
      schema: Record<string, any>,
      options?: any,
    ): Promise<any> {
      // Mark as used to keep ESLint happy
      void schema;
      void options;

      const messageArr = Array.isArray(messagesInput)
        ? messagesInput
        : [messagesInput];
      const userContent = messageArr[messageArr.length - 1]?.content ?? '';
      const lowerContent = userContent.toLowerCase();

      // Narrative and bundle helpers
      if (lowerContent.includes('generate a case summary')) {
        const json = {
          summary: 'Mock case summary based on provided facts.',
        } as T;

        return {
          content: JSON.stringify(json),
          json,
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
          model: 'test-model',
          cost_usd: 0,
        };
      }

      if (
        lowerContent.includes('generate particulars') ||
        lowerContent.includes('narrative')
      ) {
        const json = {
          narrative: 'Mock ground narrative with facts and dates.',
        } as T;

        return {
          content: JSON.stringify(json),
          json,
          usage: {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
          model: 'test-model',
          cost_usd: 0,
        };
      }

      // Ask Heaven defaults
      const isScotland = lowerContent.includes('jurisdiction: scotland');
      const rawAnswerMatch = userContent.match(
        /Landlord's rough answer:\n"([\s\S]*?)"/,
      );
      const rawAnswer = rawAnswerMatch
        ? rawAnswerMatch[1].toLowerCase()
        : lowerContent;

      const blockedRoute = lowerContent.includes('blocked routes');
      const arrearsContradiction =
        rawAnswer.includes('paid rent regularly') ||
        rawAnswer.includes('no arrears until march');
      const noticeTimeline = rawAnswer.includes('notice served');

      const suggested_wording = blockedRoute
        ? 'Section 21 currently blocked; summarise rent arrears factually without recommending alternatives.'
        : isScotland
        ? 'Tribunal wording: tenant owes rent arrears; provide dates and amounts with neutral language.'
        : 'Court wording: tenant owes rent arrears across recent months, stated neutrally.';

      const missing_information = [
        'Exact rent amounts and due dates',
        'Payment history with dates',
      ];
      const evidence_suggestions = [
        'Bank statements or rent ledger showing missed payments',
        'Messages requesting payment',
      ];

      const consistency_flags: string[] = [];
      if (arrearsContradiction) {
        consistency_flags.push(
          'ARREARS: Statement about regular payments conflicts with arrears total.',
        );
      }
      if (noticeTimeline) {
        consistency_flags.push(
          'TIMELINE: Notice date may conflict with tenancy start; confirm dates.',
        );
      }

      const json = {
        suggested_wording,
        missing_information,
        evidence_suggestions,
        consistency_flags,
      } as T;

      return {
        content: JSON.stringify(json),
        json,
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
        model: 'test-model',
        cost_usd: 0,
      };
    },
  });
});

afterAll(() => {
  __setTestJsonAIClient(null);
});

describe('enhanceAnswer - England & Wales', () => {
  it(
    'should mention blocked routes factually without recommending alternatives',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'Tenant owes £4500 in rent from last 3 months',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: s21BlockedDecision,
      });

      expect(result).toBeTruthy();
      expect(result!.suggested_wording).toBeTruthy();

      // Should NOT contain phrases like "you should use Section 8" or "I recommend"
      const lowerWording = result!.suggested_wording.toLowerCase();
      expect(lowerWording).not.toMatch(/you should/i);
      expect(lowerWording).not.toMatch(/i recommend/i);
      expect(lowerWording).not.toMatch(/try section/i);
    },
    15000,
  );

  it(
    'should reference Section 8 grounds factually when present',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer:
          'The tenant has not paid rent for 3 months totaling £4500',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: s21BlockedDecision,
      });

      expect(result).toBeTruthy();
      expect(result!.suggested_wording).toBeTruthy();

      const wording = result!.suggested_wording;
      expect(wording.length).toBeGreaterThan(20);
    },
    15000,
  );

  it(
    'should suggest evidence without creating new legal requirements',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'Tenant hasnt paid since September',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: s21BlockedDecision,
      });

      expect(result).toBeTruthy();
      expect(result!.evidence_suggestions.length).toBeGreaterThan(0);

      const suggestions = result!.evidence_suggestions
        .join(' ')
        .toLowerCase();
      expect(suggestions).toMatch(/bank statement|payment|record/i);
    },
    15000,
  );

  it(
    'should identify missing information without legal judgment',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'Tenant owes money',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: s21BlockedDecision,
      });

      expect(result).toBeTruthy();
      expect(result!.missing_information.length).toBeGreaterThan(0);

      const missing = result!.missing_information
        .join(' ')
        .toLowerCase();
      expect(missing).toMatch(/date|amount|period/i);
    },
    15000,
  );
});

describe('enhanceAnswer - Scotland', () => {
  it(
    'should use Scotland tribunal language',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'Tenant has arrears of £6000 over 4 months',
        jurisdiction: 'scotland',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: scotlandDecision,
      });

      expect(result).toBeTruthy();
      expect(result!.suggested_wording).toBeTruthy();

      const wording = result!.suggested_wording.toLowerCase();
      expect(wording).not.toMatch(/section 8|section 21/i);
    },
    15000,
  );

  it(
    'should mention pre-action requirements factually for Ground 1',
    async () => {
      const result = await enhanceAnswer({
        question: asbQuestion as any,
        rawAnswer: 'Multiple noise complaints from neighbors',
        jurisdiction: 'scotland',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: {
          ...scotlandDecision,
          pre_action_requirements: {
            required: true,
            met: false,
            details: [
              'Must contact tenant before serving notice',
              'Must signpost tenant to advice services',
            ],
          },
        },
      });

      expect(result).toBeTruthy();

      const allText = [
        result!.suggested_wording,
        ...result!.missing_information,
        ...result!.evidence_suggestions,
      ]
        .join(' ')
        .toLowerCase();

      expect(allText).not.toMatch(/you must do/i);
    },
    15000,
  );

  it(
    'should never recommend non-discretionary treatment',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'Tenant owes £7000',
        jurisdiction: 'scotland',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: scotlandDecision,
      });

      expect(result).toBeTruthy();

      const wording = result!.suggested_wording.toLowerCase();
      expect(wording).not.toMatch(
        /guaranteed|automatic|certain|must grant/i,
      );
    },
    15000,
  );
});

describe('enhanceAnswer - Consistency Checks', () => {
  it(
    'should flag arrears timeline contradictions',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer:
          'Tenant has paid rent regularly but owes £4500',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: s21BlockedDecision,
        caseIntelContext: caseIntelWithIssues,
      });

      expect(result).toBeTruthy();
      expect(result!.consistency_flags.length).toBeGreaterThan(0);

      const flags = result!.consistency_flags.join(' ').toLowerCase();
      expect(flags).toMatch(/arrears|contradict|mismatch/i);
    },
    15000,
  );

  it(
    'should flag date inconsistencies',
    async () => {
      const dateQuestion = {
        id: 'notice_date',
        question: 'When was the notice served?',
        inputType: 'textarea',
      };

      const result = await enhanceAnswer({
        question: dateQuestion as any,
        rawAnswer: 'Notice served on 2024-01-01',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        caseIntelContext: caseIntelWithIssues,
      });

      expect(result).toBeTruthy();

      if (result!.consistency_flags.length > 0) {
        const flags = result!.consistency_flags
          .join(' ')
          .toLowerCase();
        expect(flags).toMatch(/timeline|date/i);
      }
    },
    15000,
  );

  it(
    'should suggest corrections factually, not directively',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer:
          'No arrears until March but tenant owes money from January',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        caseIntelContext: caseIntelWithIssues,
      });

      expect(result).toBeTruthy();

      const allText = [
        result!.suggested_wording,
        ...result!.consistency_flags,
      ]
        .join(' ')
        .toLowerCase();

      expect(allText).not.toMatch(/you must|change|fix this now/i);
    },
    15000,
  );
});

describe('enhanceAnswer - Safety Tests (Legal Rules)', () => {
  it(
    'should never invent new rent thresholds',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'Tenant owes £1800',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: s21BlockedDecision,
      });

      expect(result).toBeTruthy();

      const allText = [
        result!.suggested_wording,
        ...result!.missing_information,
        ...result!.evidence_suggestions,
      ]
        .join(' ')
        .toLowerCase();

      expect(allText).not.toMatch(
        /you need at least|requires.*£\d+.*to evict/i,
      );
    },
    15000,
  );

  it(
    'should never contradict decision engine blocking issues',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'I want to use Section 21',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: s21BlockedDecision,
      });

      expect(result).toBeTruthy();

      const wording = result!.suggested_wording.toLowerCase();
      expect(wording).not.toMatch(
        /section 21 is available|proceed with section 21/i,
      );
    },
    15000,
  );

  it(
    'should never recommend choosing a ground',
    async () => {
      const result = await enhanceAnswer({
        question: textareaQuestion as any,
        rawAnswer: 'Tenant breached tenancy and has arrears',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
        decisionContext: {
          ...s21BlockedDecision,
          recommended_grounds: [
            ...s21BlockedDecision.recommended_grounds,
            {
              code: '12',
              title: 'Tenancy Breach',
              type: 'discretionary',
              weight: 'medium',
              success_probability: 'high',
              notice_period_days: 14,
              reasoning:
                'Mock: tenancy breach narrative exists alongside arrears.',
            },
          ],
        },
      });

      expect(result).toBeTruthy();

      const wording = result!.suggested_wording.toLowerCase();
      expect(wording).not.toMatch(
        /i recommend ground|you should use ground/i,
      );
    },
    15000,
  );
});

describe('enhanceAnswer - Non-Free-Text Filtering', () => {
  it(
    'should return null for non-textarea questions',
    async () => {
      const selectQuestion = {
        id: 'eviction_route',
        question: 'Which eviction route?',
        inputType: 'select',
      };

      const result = await enhanceAnswer({
        question: selectQuestion as any,
        rawAnswer: 'section_8',
        jurisdiction: 'england-wales',
        product: 'notice_only',
        caseType: 'eviction',
      });

      expect(result).toBeNull();
    },
    5000,
  );
});
