import fs from 'fs/promises';
import path from 'path';
import Module from 'node:module';

import { saveGoldenPack, type GoldenPackDocumentInput, type GoldenPackRecord } from './helpers/save-golden-pack.ts';

let __setTestJsonAIClient: ((client: any) => void) | null = null;
let generateCompleteEvictionPack: typeof import('../src/lib/documents/eviction-pack-generator.ts').generateCompleteEvictionPack;
let generateNoticeOnlyPack: typeof import('../src/lib/documents/eviction-pack-generator.ts').generateNoticeOnlyPack;
let buildSection8CourtPackQaScenarios: typeof import('../src/lib/testing/fixtures/section8-court-pack-qa.ts').buildSection8CourtPackQaScenarios;

let shimsInstalled = false;

function installScriptModuleShims() {
  if (shimsInstalled) return;

  const originalResolveFilename = (Module as any)._resolveFilename;
  (Module as any)._resolveFilename = function resolveFilename(request: string, parent: any, isMain: boolean, options: any) {
    if (request === 'server-only') {
      return path.join(process.cwd(), 'scripts', 'empty-module.js');
    }
    if (typeof request === 'string' && request.startsWith('@/')) {
      const mapped = request.startsWith('@/config/')
        ? path.join(process.cwd(), request.slice(2))
        : path.join(process.cwd(), 'src', request.slice(2));
      return originalResolveFilename.call(this, mapped, parent, isMain, options);
    }
    return originalResolveFilename.call(this, request, parent, isMain, options);
  };

  shimsInstalled = true;
}

async function loadDeps() {
  installScriptModuleShims();

  const [openAiClient, evictionGenerator, scenarioFixtures] = await Promise.all([
    import('../src/lib/ai/openai-client.ts'),
    import('../src/lib/documents/eviction-pack-generator.ts'),
    import('../src/lib/testing/fixtures/section8-court-pack-qa.ts'),
  ]);

  __setTestJsonAIClient = openAiClient.__setTestJsonAIClient;
  generateCompleteEvictionPack = evictionGenerator.generateCompleteEvictionPack;
  generateNoticeOnlyPack = evictionGenerator.generateNoticeOnlyPack;
  buildSection8CourtPackQaScenarios = scenarioFixtures.buildSection8CourtPackQaScenarios;
}

process.env.TZ = 'Europe/London';
process.env.DISABLE_WITNESS_STATEMENT_AI = 'true';
process.env.DISABLE_COMPLIANCE_AUDIT_AI = 'true';
process.env.DISABLE_MONEY_CLAIM_AI = 'true';

const OUTPUT_ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs', 'section8_court_pack_qa');

const jsonClientStub = {
  async jsonCompletion() {
    return {
      json: {} as any,
      content: '{}',
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      model: 'gpt-4o-mini',
      cost_usd: 0,
    };
  },
} as any;

function buildReadme(records: GoldenPackRecord[]): string {
  return [
    '# Section 8 Court Pack QA Golden Packs',
    '',
    'These QA-only sample packs are stored separately so they do not replace the main public-product golden packs.',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    'Scenarios:',
    ...records.map((record) => `- \`${record.outputDir}\` (${record.documentCount} documents)`),
    '',
    'Purpose:',
    '- verify deemed-service recalculation',
    '- verify N119, N215, N5, witness, summary, hearing, and bundle artifacts',
    '- provide stable QA fixtures for Section 8 court-pack regression work',
    '',
  ].join('\n');
}

async function main() {
  await loadDeps();
  if (!__setTestJsonAIClient) {
    throw new Error('Failed to load OpenAI test client shim for Section 8 QA generation.');
  }

  __setTestJsonAIClient(jsonClientStub);

  await fs.rm(OUTPUT_ROOT, { recursive: true, force: true });
  await fs.mkdir(OUTPUT_ROOT, { recursive: true });

  const scenarios = buildSection8CourtPackQaScenarios();
  const records: GoldenPackRecord[] = [];

  for (const scenario of scenarios) {
    console.log(`Generating QA golden pack: ${scenario.displayName}`);
    const pack =
      scenario.packType === 'complete_pack'
        ? await generateCompleteEvictionPack(scenario.facts)
        : await generateNoticeOnlyPack(scenario.facts);

    const record = await saveGoldenPack({
      baseDir: OUTPUT_ROOT,
      key: scenario.key,
      displayName: scenario.displayName,
      documents: pack.documents as GoldenPackDocumentInput[],
      extractText: true,
    });
    records.push(record);
  }

  await fs.writeFile(
    path.join(OUTPUT_ROOT, 'manifest.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        outputRoot: OUTPUT_ROOT,
        packs: records,
      },
      null,
      2,
    ),
    'utf8',
  );
  await fs.writeFile(path.join(OUTPUT_ROOT, 'README.md'), buildReadme(records), 'utf8');

  console.log(`Section 8 QA golden packs written to: ${OUTPUT_ROOT}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    __setTestJsonAIClient?.(null);
  });
