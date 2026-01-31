import { generateCompleteEvictionPack } from '../src/lib/documents/eviction-pack-generator.ts';
import { __setTestJsonAIClient } from '../src/lib/ai/openai-client.ts';
import { savePackPreview } from './helpers/save-pack.ts';

function buildSection21Facts() {
  return {
    __meta: { case_id: 'EVICT-CLI-SEC21', jurisdiction: 'england' },
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
    tenancy_start_date: '2023-09-01',
    rent_amount: 1200,
    rent_frequency: 'monthly',
    rent_due_day: 1,
    notice_type: 'Section 21',
    notice_date: '2024-06-01',
    notice_expiry_date: '2024-08-01',
    eviction_route: 'Section 21',
    // =========================================================================
    // REQUIRED FOR COMPLETE PACK - N5B form fields
    // =========================================================================
    notice_service_method: 'first_class_post', // Required for N5B field 10a
    court_name: 'Central London County Court', // Required for court form header
    // =========================================================================
    deposit_amount: 1200,
    deposit_protected: true,
    deposit_protection_date: '2023-09-10',
    deposit_scheme_name: 'TDS',
    arrears_breakdown: 'No rent arrears claimed; landlord requires possession at end of tenancy.',
    rent_arrears_amount: 0,
    case_facts: {
      eviction: {
        notice_served_date: '2024-06-01',
        tenancy_type: 'assured_shorthold',
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

  const pack = await generateCompleteEvictionPack(buildSection21Facts());
  await savePackPreview('England Section 21 Complete Eviction Pack', 'england-section21', pack.documents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
