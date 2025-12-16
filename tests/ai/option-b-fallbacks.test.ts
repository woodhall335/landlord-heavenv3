import { afterEach, describe, expect, it } from 'vitest';

import { extractComplianceAuditContext, generateComplianceAudit } from '@/lib/ai/compliance-audit-generator';
import { extractWitnessStatementContext, generateWitnessStatement } from '@/lib/ai/witness-statement-generator';
import { __setTestJsonAIClient } from '@/lib/ai/openai-client';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

function buildWizardFacts(overrides: Record<string, any> = {}) {
  return {
    __meta: { case_id: 'FALLBACK-1', jurisdiction: 'england' },
    landlord_name: 'Fallback Landlord',
    landlord_address_line1: '1 Safety Road',
    landlord_city: 'Bristol',
    landlord_postcode: 'BS1 1AA',
    tenant1_name: 'Terry Tenant',
    tenant1_email: 'terry@example.com',
    property_address_line1: '10 Test Street',
    property_city: 'Bristol',
    property_postcode: 'BS1 2AA',
    tenancy_start_date: '2024-01-01',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Section 8',
    notice_date: '2024-06-01',
    eviction_route: 'Section 8',
    section8_grounds: ['Ground 8'],
    arrears_breakdown: 'Two months of missed rent',
    total_arrears: 2400,
    deposit_amount: 1200,
    deposit_protected: false,
    has_gas_appliances: true,
    gas_cert_date: null,
    electrical_cert_date: null,
    how_to_rent_provided: false,
    ...overrides,
  } as any;
}

afterEach(() => {
  __setTestJsonAIClient(null);
  delete process.env.DISABLE_WITNESS_STATEMENT_AI;
  delete process.env.DISABLE_COMPLIANCE_AUDIT_AI;
  delete process.env.OPENAI_API_KEY;
});

describe('Option B AI failure modes', () => {
  it('returns deterministic witness statement fallback when AI is disabled', async () => {
    process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
    const caseFacts = wizardFactsToCaseFacts(buildWizardFacts()) as any;
    const context = extractWitnessStatementContext(caseFacts);

    const result = await generateWitnessStatement(caseFacts, context);

    expect(result.introduction).toContain('Fallback Landlord');
    expect(result.evidence_references).toContain('Exhibit 1');
  });

  it('recovers with fallback compliance audit when the AI client throws', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    __setTestJsonAIClient({
      jsonCompletion: async () => {
        throw new Error('LLM unavailable');
      },
    });

    const caseFacts = wizardFactsToCaseFacts(
      buildWizardFacts({
        deposit_protected: false,
        gas_cert_date: null,
        electrical_cert_date: null,
      })
    ) as any;
    const context = extractComplianceAuditContext(caseFacts);

    const audit = await generateComplianceAudit(caseFacts, context);

    expect(audit.s21_valid).toBe(false);
    expect(audit.deposit_protection).toContain('Deposit not protected');
    expect(audit.critical_actions.some((action) => action.includes('Protect deposit'))).toBe(true);
  });
});
