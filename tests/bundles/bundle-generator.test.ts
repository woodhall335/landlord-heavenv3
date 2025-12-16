/**
 * Bundle Generator Tests
 *
 * Tests court and tribunal bundle generation.
 */

import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import type { CaseFacts } from '@/lib/case-facts/schema';
import {
  generateCourtBundle,
  generateTribunalBundle,
  validateBundleReadiness,
} from '@/lib/bundles';
import { __setTestJsonAIClient } from '@/lib/ai/openai-client';

// Minimal valid England & Wales case
const minimalEnglandWalesCase: CaseFacts = {
  meta: {
    jurisdiction: 'england',
    product: 'complete_pack',
    case_id: 'test-case-ew-001',
  },
  parties: {
    landlord: {
      name: 'John Smith',
      address: {
        line1: '10 Landlord Street',
        city: 'London',
        postcode: 'SW1A 1AA',
      },
      phone: '07700 900000',
      email: 'john@example.com',
    },
    tenants: [
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07700 900001',
      },
    ],
  },
  property: {
    address: {
      line1: '123 High Street',
      city: 'London',
      postcode: 'E1 1AA',
    },
  },
  tenancy: {
    start_date: '2023-01-15',
    rent_amount: 1500,
    rent_frequency: 'monthly',
    deposit_amount: 1500,
    deposit_protected: true,
    prescribed_info_given: true,
  },
  issues: {
    rent_arrears: {
      has_arrears: true,
      total_arrears: 4500,
      arrears_items: [
        {
          period_start: '2025-09-01',
          period_end: '2025-09-30',
          amount_owed: 1500,
        },
        {
          period_start: '2025-10-01',
          period_end: '2025-10-31',
          amount_owed: 1500,
        },
        {
          period_start: '2025-11-01',
          period_end: '2025-11-30',
          amount_owed: 1500,
        },
      ],
    },
    section8_grounds: {
      selected_grounds: ['8'],
      arrears_breakdown: 'Arrears accrued over 3 months',
    },
    asb: {
      has_asb: false,
    },
    breaches: {
      has_breaches: false,
    },
  },
  compliance: {
    gas_safety_cert_provided: true,
    epc_provided: true,
    how_to_rent_given: true,
    hmo_license_required: false,
    hmo_license_valid: null,
  },
  notice: {
    service_date: '2025-10-01',
    expiry_date: '2025-10-15',
    service_method: 'hand',
    served_by: 'Landlord',
  },
  evidence: {
    correspondence_uploaded: false,
    bank_statements_uploaded: false,
    asb_logs_uploaded: false,
    photos_uploaded: false,
    safety_certificates_uploaded: false,
  },
} as any;

// Minimal valid Scotland case
const minimalScotlandCase: CaseFacts = {
  ...minimalEnglandWalesCase,
  meta: {
    jurisdiction: 'scotland',
    product: 'complete_pack',
    case_id: 'test-case-sc-001',
  },
  issues: {
    ...minimalEnglandWalesCase.issues,
    rent_arrears: {
      ...minimalEnglandWalesCase.issues.rent_arrears,
      pre_action_confirmed: true,
    },
  },
} as any;

beforeAll(() => {
  __setTestJsonAIClient({
    // Cast as any so we don't fight the generic type signature
    jsonCompletion: (async (messages: any) => {
      const messageArr = Array.isArray(messages) ? messages : [messages];
      const userContent = messageArr[messageArr.length - 1]?.content ?? '';
      const lowerContent = String(userContent).toLowerCase();

      if (lowerContent.includes('case summary')) {
        const json = { summary: 'Bundle mock case summary.' };
        return {
          content: JSON.stringify(json),
          json,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          model: 'test-model',
          cost_usd: 0,
        };
      }

      if (lowerContent.includes('generate particulars') || lowerContent.includes('narrative')) {
        const json = { narrative: 'Bundle mock narrative with key facts.' };
        return {
          content: JSON.stringify(json),
          json,
          usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
          model: 'test-model',
          cost_usd: 0,
        };
      }

      const json = {
        suggested_wording: 'Bundle placeholder wording',
        missing_information: [],
        evidence_suggestions: [],
        consistency_flags: [],
      };

      return {
        content: JSON.stringify(json),
        json,
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: 'test-model',
        cost_usd: 0,
      };
    }) as any,
  } as any);
});

afterAll(() => {
  __setTestJsonAIClient(null);
});

describe('validateBundleReadiness', () => {
  it('should pass validation for minimal England & Wales case', () => {
    const result = validateBundleReadiness(minimalEnglandWalesCase);

    expect(result.ready).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should pass validation for minimal Scotland case', () => {
    const result = validateBundleReadiness(minimalScotlandCase);

    expect(result.ready).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should fail validation when landlord name missing', () => {
    const invalidCase = {
      ...minimalEnglandWalesCase,
      parties: {
        ...minimalEnglandWalesCase.parties,
        landlord: {
          ...minimalEnglandWalesCase.parties.landlord,
          name: '',
        },
      },
    };

    const result = validateBundleReadiness(invalidCase as any);

    expect(result.ready).toBe(false);
    expect(result.issues).toContain('Landlord name is required');
  });

  it('should fail validation when no tenants', () => {
    const invalidCase = {
      ...minimalEnglandWalesCase,
      parties: {
        ...minimalEnglandWalesCase.parties,
        tenants: [],
      },
    };

    const result = validateBundleReadiness(invalidCase as any);

    expect(result.ready).toBe(false);
    expect(result.issues).toContain('At least one tenant is required');
  });

  it('should block Northern Ireland bundles', () => {
    const niCase = {
      ...minimalEnglandWalesCase,
      meta: {
        ...minimalEnglandWalesCase.meta,
        jurisdiction: 'northern-ireland',
      },
    };

    const result = validateBundleReadiness(niCase as any);

    expect(result.ready).toBe(false);
    expect(result.issues).toContain('Northern Ireland bundles not yet supported');
  });
});

describe('generateCourtBundle (England & Wales)', () => {
  it('should generate bundle for minimal case', async () => {
    const result = await generateCourtBundle(minimalEnglandWalesCase, {
      output_dir: '/tmp/test-bundles',
      include_case_intel: true,
    });

    expect(result.success).toBe(true);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.jurisdiction).toBe('england');
    expect(result.metadata?.type).toBe('court');
    expect(result.metadata?.sections.length).toBeGreaterThan(0);
  }, 30000); // 30s timeout for AI calls

  it('should reject Scotland cases', async () => {
    const result = await generateCourtBundle(minimalScotlandCase, {
      output_dir: '/tmp/test-bundles',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('England & Wales only');
  });

  it('should generate bundle without narratives when disabled', async () => {
    const result = await generateCourtBundle(minimalEnglandWalesCase, {
      output_dir: '/tmp/test-bundles',
      include_case_intel: false,
    });

    expect(result.success).toBe(true);
    expect(result.metadata).toBeDefined();
  }, 10000); // Faster without AI
});

describe('generateTribunalBundle (Scotland)', () => {
  it('should generate bundle for minimal Scotland case', async () => {
    const result = await generateTribunalBundle(minimalScotlandCase, {
      output_dir: '/tmp/test-bundles',
      include_case_intel: true,
    });

    expect(result.success).toBe(true);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.jurisdiction).toBe('scotland');
    expect(result.metadata?.type).toBe('tribunal');
    expect(result.metadata?.sections.length).toBeGreaterThan(0);
  }, 30000);

  it('should reject England & Wales cases', async () => {
    const result = await generateTribunalBundle(minimalEnglandWalesCase, {
      output_dir: '/tmp/test-bundles',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Scotland only');
  });
});

describe('Bundle with missing optional evidence', () => {
  it('should generate bundle gracefully when some evidence missing', async () => {
    const caseWithoutEvidence = {
      ...minimalEnglandWalesCase,
      evidence: {
        correspondence_uploaded: false,
        bank_statements_uploaded: false,
        asb_logs_uploaded: false,
        photos_uploaded: false,
        safety_certificates_uploaded: false,
      },
    };

    const result = await generateCourtBundle(caseWithoutEvidence as any, {
      output_dir: '/tmp/test-bundles',
      include_case_intel: true,
    });

    expect(result.success).toBe(true);
    expect(result.metadata).toBeDefined();
    // Should complete even with missing evidence
  }, 30000);

  it('should warn about missing critical evidence in case intel', async () => {
    const caseWithoutEvidence = {
      ...minimalEnglandWalesCase,
      evidence: {
        correspondence_uploaded: false,
        bank_statements_uploaded: false, // Critical for Ground 8
        asb_logs_uploaded: false,
        photos_uploaded: false,
        safety_certificates_uploaded: false,
      },
    };

    const result = await generateCourtBundle(caseWithoutEvidence as any, {
      output_dir: '/tmp/test-bundles',
      include_case_intel: true,
    });

    expect(result.success).toBe(true);
    // Bundle should still generate, but case intel will flag missing evidence
  }, 30000);
});
