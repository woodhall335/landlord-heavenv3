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

  const pack = await generateCompleteEvictionPack(buildEnglandSection8CompletePackFacts({ logDates: true }));
  await savePackPreview('England Section 8 Complete Eviction Pack', 'england-section8', pack.documents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
