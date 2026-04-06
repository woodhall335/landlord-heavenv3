import { generateCompleteEvictionPack } from '../src/lib/documents/eviction-pack-generator.ts';
import { __setTestJsonAIClient } from '../src/lib/ai/openai-client.ts';
import { savePackPreview } from './helpers/save-pack.ts';
import { buildEnglandSection8CompletePackFacts } from '../src/lib/testing/fixtures/complete-pack.ts';

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

  const arrearsItems = [
    {
      period_start: '2026-01-01',
      period_end: '2026-01-31',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
    {
      period_start: '2026-02-01',
      period_end: '2026-02-28',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
    {
      period_start: '2026-03-01',
      period_end: '2026-03-31',
      rent_due: 1200,
      rent_paid: 0,
      amount_owed: 1200,
    },
  ];

  const pack = await generateCompleteEvictionPack({
    ...buildEnglandSection8CompletePackFacts({ logDates: true }),
    landlord_name: 'Daniel Mercer',
    landlord_address_line1: '27 Rowan Avenue',
    landlord_city: 'Leeds',
    landlord_postcode: 'LS8 2PF',
    tenant1_name: 'Ivy Carleton',
    property_address_line1: '16 Willow Mews',
    property_city: 'York',
    property_postcode: 'YO24 3HX',
    court_name: 'York County Court and Family Court',
    total_arrears: 3600,
    rent_arrears_amount: 3600,
    arrears_items: arrearsItems,
  });
  await savePackPreview('England Section 8 Complete Eviction Pack', 'england-section8', pack.documents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
