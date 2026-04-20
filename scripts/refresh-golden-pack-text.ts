import fs from 'fs/promises';
import path from 'path';

import {
  collectExistingPackRecords,
  parseGeneratorCliOptions,
  type LivePackProductKey,
} from './helpers/golden-pack-selection.ts';
import {
  extractTextArtifactsForPdf,
  type GoldenPackRecord,
} from './helpers/save-golden-pack.ts';

const OUTPUT_ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs');

async function refreshPackTextArtifacts(key: LivePackProductKey): Promise<{
  refreshed: number;
  skipped: number;
}> {
  const manifestPath = path.join(OUTPUT_ROOT, key, 'manifest.json');
  const manifest = JSON.parse(
    await fs.readFile(manifestPath, 'utf8')
  ) as GoldenPackRecord;

  let refreshed = 0;
  let skipped = 0;

  for (const document of manifest.documents) {
    if (!document.files.pdf) {
      skipped += 1;
      continue;
    }

    const pdfPath = path.join(OUTPUT_ROOT, document.files.pdf);
    const pdfBuffer = await fs.readFile(pdfPath);
    const baseName = path.parse(document.fileName).name;
    const productDir = path.join(OUTPUT_ROOT, key);
    const existingTextPath = document.files.text
      ? path.join(OUTPUT_ROOT, document.files.text)
      : null;

    if (existingTextPath) {
      await fs.rm(existingTextPath, { force: true });
    }

    const extractionArtifacts = await extractTextArtifactsForPdf({
      baseDir: OUTPUT_ROOT,
      productDir,
      baseName,
      pdfBuffer,
    });

    if (extractionArtifacts.textPath) {
      document.files.text = extractionArtifacts.textPath;
    } else {
      delete document.files.text;
    }

    document.extraction = extractionArtifacts.extraction;
    refreshed += 1;
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  return { refreshed, skipped };
}

async function main() {
  const cli = parseGeneratorCliOptions(process.argv.slice(2));
  const summary: Array<{ key: LivePackProductKey; refreshed: number; skipped: number }> = [];

  for (const key of cli.selectedKeys) {
    console.log(`Refreshing golden-pack text artifacts: ${key}`);
    const result = await refreshPackTextArtifacts(key);
    summary.push({ key, ...result });
    console.log(
      `Completed ${key}: ${result.refreshed} refreshed, ${result.skipped} skipped.`
    );
  }

  const packs = await collectExistingPackRecords(OUTPUT_ROOT);
  const rootManifestPath = path.join(OUTPUT_ROOT, 'manifest.json');
  try {
    const rootManifest = JSON.parse(await fs.readFile(rootManifestPath, 'utf8')) as {
      generatedAt: string;
      outputRoot: string;
      packs: GoldenPackRecord[];
      nonPackProducts?: Array<{ key: string; displayName: string; reason: string }>;
    };
    rootManifest.generatedAt = new Date().toISOString();
    rootManifest.packs = packs;
    await fs.writeFile(rootManifestPath, JSON.stringify(rootManifest, null, 2), 'utf8');
  } catch {
    // Root manifest may not exist yet; skip.
  }

  console.log('\nGolden-pack text refresh summary:');
  for (const item of summary) {
    console.log(`- ${item.key}: ${item.refreshed} refreshed, ${item.skipped} skipped`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
