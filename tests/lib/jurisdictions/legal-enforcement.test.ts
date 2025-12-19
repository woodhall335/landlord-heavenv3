import { describe, expect, it, vi } from 'vitest';

import { validateNoticeOnlyBeforeRender } from '@/lib/documents/noticeOnly';
import { generateNoticeOnlyPack } from '@/lib/documents/eviction-pack-generator';
import { evaluateWizardGate } from '@/lib/wizard/gating';
import { GET as noticeOnlyPreview } from '@/app/api/notice-only/preview/[caseId]/route';
import * as supabaseServer from '@/lib/supabase/server';
import * as noticeOnlyModule from '@/lib/documents/noticeOnly';

const baseDepositFacts = {
  deposit_taken: true,
  deposit_amount: 1200,
  deposit_protected: true,
  deposit_scheme: 'DPS',
  deposit_scheme_name: 'DPS',
  deposit_protection_date: '2024-01-01',
  prescribed_info_given: true,
  prescribed_info_provided: true,
};

describe('jurisdiction gating enforcement', () => {
  it('blocks Ground 8 when arrears are below two months in England', () => {
    const facts = {
      ...baseDepositFacts,
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      rent_amount: 1000,
      rent_amount_monthly: 1000,
      rent_frequency: 'monthly',
      arrears_amount: 1000,
      arrears_duration_months: 1,
      current_arrears_amount: 1000,
    };

    const gating = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'england',
      facts,
    });

    const codes = gating.blocking.map((b) => b.code);
    expect(codes).toContain('GROUND_8_THRESHOLD_NOT_MET');
  });

  it('requires mandatory ground facts for Ground 1', () => {
    const facts = {
      ...baseDepositFacts,
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_1'],
      rent_amount_monthly: 800,
    };

    const gating = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'england',
      facts,
    });

    const codes = gating.blocking.map((b) => b.code);
    expect(codes).toContain('GROUND_REQUIRED_FACT_MISSING');
  });

  it('rejects England-only Ground 1 when jurisdiction is Wales but allows it for England validation', () => {
    const facts = {
      ...baseDepositFacts,
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_1'],
    };

    const walesGate = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'wales',
      facts,
    });

    const walesCodes = walesGate.blocking.map((b) => b.code);
    expect(walesCodes).toContain('GROUND_NOT_ALLOWED');

    const englandGate = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'england',
      facts,
    });

    const englandCodes = englandGate.blocking.map((b) => b.code);
    expect(englandCodes).not.toContain('GROUND_NOT_ALLOWED');
    expect(englandCodes).toContain('GROUND_REQUIRED_FACT_MISSING');
  });

  it('blocks deposit non-compliance when scheme/dates/prescribed info are missing', () => {
    const facts = {
      deposit_taken: true,
      deposit_amount: 1200,
      deposit_protected: true,
      selected_notice_route: 'section_21',
      section8_grounds: [],
    };

    const gating = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'england',
      facts,
    });

    const codes = gating.blocking.map((b) => b.code);
    expect(codes).toContain('DEPOSIT_FIELD_REQUIRED');
    expect(codes).toContain('PRESCRIBED_INFO_MISSING');
  });

  it('skips deposit compliance when deposit_taken is explicitly false', () => {
    const facts = {
      deposit_taken: false,
      deposit_amount: undefined,
      deposit_protected: undefined,
      selected_notice_route: 'section_21',
      section8_grounds: [],
    };

    const gating = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'england',
      facts,
    });

    expect(gating.blocking.map((b) => b.code)).not.toContain('REQUIRED_IF_EVALUATION_FAILED');
    expect(gating.blocking.map((b) => b.code)).not.toContain('DEPOSIT_FIELD_REQUIRED');
  });

  it('evaluates Scotland and Northern Ireland without short-circuiting', () => {
    const scotlandFacts = {
      ...baseDepositFacts,
      selected_notice_route: 'notice_to_leave',
      section8_grounds: ['ground_1'],
    };

    const scotland = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'scotland',
      facts: scotlandFacts,
    });

    expect(scotland.blocking.map((b) => b.code)).toContain('GROUND_REQUIRED_FACT_MISSING');

    const northernIreland = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'northern-ireland',
      facts: scotlandFacts,
    });

    const niCodes = northernIreland.blocking.map((b) => b.code);
    expect(niCodes).toEqual(['JURISDICTION_EVICTION_UNSUPPORTED']);
  });

  it('re-runs validation at render time and blocks mutated answers', () => {
    const facts = {
      ...baseDepositFacts,
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      rent_amount: 1500,
      rent_amount_monthly: 1500,
      rent_frequency: 'monthly',
      arrears_amount: 4000,
      arrears_duration_months: 3,
      current_arrears_amount: 4000,
    };

    const initialValidation = validateNoticeOnlyBeforeRender({
      jurisdiction: 'england',
      facts,
      selectedGroundCodes: [8],
      selectedRoute: 'section_8',
    });

    const initialCodes = initialValidation.blocking.map((b) => b.code);
    expect(initialCodes).not.toContain('DEPOSIT_NOT_PROTECTED');

    const mutatedFacts = { ...facts, deposit_protected: undefined };
    const mutatedValidation = validateNoticeOnlyBeforeRender({
      jurisdiction: 'england',
      facts: mutatedFacts,
      selectedGroundCodes: [8],
      selectedRoute: 'section_8',
    });

    expect(mutatedValidation.blocking.map((b) => b.code)).toContain('DEPOSIT_NOT_PROTECTED');
  });

  it('fails closed when required_if cannot be evaluated because facts are missing', () => {
    const facts = {
      ...baseDepositFacts,
      selected_notice_route: 'section_21',
      section8_grounds: [],
      deposit_taken: undefined,
      deposit_protected: undefined,
      deposit_scheme: undefined,
    };

    const gating = evaluateWizardGate({
      case_type: 'eviction',
      product: 'notice_only',
      jurisdiction: 'england',
      facts,
    });

    const codes = gating.blocking.map((b) => b.code);
    expect(codes).toContain('REQUIRED_IF_EVALUATION_FAILED');
  });

  it('fails closed during notice-only pack generation when facts become invalid', async () => {
    const facts = {
      ...baseDepositFacts,
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds: ['ground_8'],
      rent_amount: 1500,
      rent_amount_monthly: 1500,
      rent_frequency: 'monthly',
      arrears_amount: 4000,
      arrears_duration_months: 3,
      current_arrears_amount: 4000,
      deposit_protected: undefined,
    };

    await expect(generateNoticeOnlyPack(facts as any)).rejects.toThrow(/NOTICE_ONLY_VALIDATION_FAILED/);
  });

  it('validates England preview using England rules even when rendering as england-wales', async () => {
    const caseId = 'case-england';
    const queryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: caseId,
          jurisdiction: 'england',
          wizard_facts: {
            selected_notice_route: 'section_8',
            section8_grounds: ['ground_8'],
          },
        },
        error: null,
      }),
    } as any;

    const supabaseClient = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
      from: vi.fn().mockReturnValue(queryBuilder),
    } as any;

    vi.spyOn(supabaseServer, 'createServerSupabaseClient').mockResolvedValue(supabaseClient);

    const validationSpy = vi
      .spyOn(noticeOnlyModule, 'validateNoticeOnlyBeforeRender')
      .mockReturnValue({
        blocking: [
          {
            code: 'TEST_BLOCK',
            message: 'blocked',
            fields: [],
          },
        ],
        warnings: [],
      });

    const response = await noticeOnlyPreview(new Request('http://example.com'), {
      params: Promise.resolve({ caseId }),
    });

    expect(response.status).toBe(422);
    const payload = await response.json();
    expect(payload.blocking_issues).toBeDefined();
    expect(Array.isArray(payload.blocking_issues)).toBe(true);
    expect(validationSpy).toHaveBeenCalledWith(
      expect.objectContaining({ jurisdiction: 'england' })
    );

    validationSpy.mockRestore();
    vi.restoreAllMocks();
  });
});
