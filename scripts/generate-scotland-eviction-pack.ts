import { generateCompleteEvictionPack } from '../src/lib/documents/eviction-pack-generator.ts';
import { __setTestJsonAIClient } from '../src/lib/ai/openai-client.ts';
import { savePackPreview } from './helpers/save-pack.ts';

function buildScotlandFacts() {
  return {
    __meta: { case_id: 'EVICT-CLI-SCOT', jurisdiction: 'scotland' },
    landlord_name: 'Fiona Landlord',
    landlord_address_line1: '10 Royal Mile',
    landlord_city: 'Edinburgh',
    landlord_postcode: 'EH1 1AA',
    landlord_email: 'fiona@example.com',
    landlord_phone: '07111111111',
    tenant1_name: 'Sean Tenant',
    tenant1_email: 'sean@example.com',
    tenant1_phone: '07000000001',
    property_address_line1: '50 Princes Street',
    property_city: 'Edinburgh',
    property_postcode: 'EH2 2BB',
    tenancy_start_date: '2023-05-01',
    rent_amount: 900,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Notice to Leave',
    notice_date: '2024-07-01',
    notice_expiry_date: '2024-10-01',
    scotland_ground_codes: ['Ground 12'],
    scotland_ground_explanation: 'Serious rent arrears',
    total_arrears: 1800,
    rent_arrears_amount: 1800,
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

  const pack = await generateCompleteEvictionPack(buildScotlandFacts());
  await savePackPreview('Scotland Eviction Pack', 'scotland-eviction', pack.documents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
