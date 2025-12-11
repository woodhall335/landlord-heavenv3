import { generateCompleteEvictionPack } from '../src/lib/documents/eviction-pack-generator.ts';
import { __setTestJsonAIClient } from '../src/lib/ai/openai-client.ts';
import { savePackPreview } from './helpers/save-pack.ts';

function buildEnglandWalesFacts() {
  return {
    __meta: { case_id: 'EVICT-CLI-SEC8', jurisdiction: 'england-wales' },
    landlord_name: 'Alex Landlord',
    landlord_address_line1: '1 High Street',
    landlord_city: 'London',
    landlord_postcode: 'SW1A1A1',
    landlord_email: 'alex@example.com',
    landlord_phone: '07123456789',
    tenant1_name: 'Tina Tenant',
    tenant1_email: 'tina@example.com',
    tenant1_phone: '07000000000',
    property_address_line1: '2 Low Road',
    property_city: 'London',
    property_postcode: 'SW1A2BB',
    tenancy_start_date: '2024-01-01',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Section 8',
    notice_date: '2024-06-01',
    eviction_route: 'Section 8',
    section8_grounds: ['Ground 8', 'Ground 10'],
    arrears_breakdown: 'Total arrears £2400',
    total_arrears: 2400,
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_protection_date: '2024-01-15',
    deposit_scheme_name: 'TDS',
    rent_arrears_amount: 2400,
    case_facts: {
      eviction: {
        notice_served_date: '2024-06-01',
        rent_arrears_amount: 2400,
      },
    },
  } as any;
}

async function main() {
  process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
  process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
  __setTestJsonAIClient({
    async jsonCompletion() {
      return {
        json: {} as any,
        content: '{}',
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
        model: 'gpt-4o-mini',
        cost_usd: 0,
      };
    },
  } as any);

  const pack = await generateCompleteEvictionPack(buildEnglandWalesFacts());
  await savePackPreview('E&W Section 8 Complete Eviction Pack', 'ew-section8', pack.documents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
