import fs from 'fs/promises';
import path from 'path';

import {
  collectExistingPackRecords,
  REQUIRED_TENANCY_DOCUMENT_TYPES,
  TENANCY_PACK_PRODUCT_KEYS,
  type LivePackProductKey,
} from './helpers/golden-pack-selection.ts';
import type { GoldenPackRecord } from './helpers/save-golden-pack.ts';

const OUTPUT_ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs');
const AUDIT_ROOT = path.join(OUTPUT_ROOT, '_audit');
const REPORT_PATH = path.join(AUDIT_ROOT, 'tenancy-refresh-audit.md');

const BANNED_VISIBLE_PHRASES = [
  'wizard',
  'guided flow',
  'product route',
  'selected in the wizard',
];

type AuditFailure = {
  pack: string;
  level: 'error' | 'warning';
  message: string;
};

async function readManifest(key: LivePackProductKey): Promise<GoldenPackRecord> {
  return JSON.parse(
    await fs.readFile(path.join(OUTPUT_ROOT, key, 'manifest.json'), 'utf8')
  ) as GoldenPackRecord;
}

async function scanTextForBannedPhrases(filePath: string): Promise<string[]> {
  const content = (await fs.readFile(filePath, 'utf8')).toLowerCase();
  return BANNED_VISIBLE_PHRASES.filter((phrase) => content.includes(phrase));
}

async function auditPack(key: LivePackProductKey): Promise<AuditFailure[]> {
  const failures: AuditFailure[] = [];
  const manifestPath = path.join(OUTPUT_ROOT, key, 'manifest.json');

  try {
    await fs.stat(manifestPath);
  } catch {
    failures.push({ pack: key, level: 'error', message: 'manifest.json is missing.' });
    return failures;
  }

  const manifest = await readManifest(key);
  const expectedDocTypes = REQUIRED_TENANCY_DOCUMENT_TYPES[key];
  const foundDocTypes = new Set(
    manifest.documents.map((document) => document.documentType).filter(Boolean)
  );

  for (const requiredDocType of expectedDocTypes) {
    if (!foundDocTypes.has(requiredDocType)) {
      failures.push({
        pack: key,
        level: 'error',
        message: `Required document type missing from manifest: ${requiredDocType}.`,
      });
    }
  }

  for (const document of manifest.documents) {
    if (!document.files.pdf) {
      failures.push({
        pack: key,
        level: 'error',
        message: `${document.title} is missing its PDF reference in manifest.json.`,
      });
      continue;
    }

    const pdfPath = path.join(OUTPUT_ROOT, document.files.pdf);
    try {
      await fs.stat(pdfPath);
    } catch {
      failures.push({
        pack: key,
        level: 'error',
        message: `${document.title} PDF is missing on disk: ${document.files.pdf}.`,
      });
    }

    if (document.files.text) {
      const textPath = path.join(OUTPUT_ROOT, document.files.text);
      try {
        await fs.stat(textPath);
      } catch {
        failures.push({
          pack: key,
          level: 'warning',
          message: `${document.title} text extraction file is missing: ${document.files.text}.`,
        });
        continue;
      }

      const hits = await scanTextForBannedPhrases(textPath);
      for (const phrase of hits) {
        failures.push({
          pack: key,
          level: 'error',
          message: `${document.title} contains banned visible phrase "${phrase}".`,
        });
      }
    }

    if (document.extraction?.method === 'failed') {
      failures.push({
        pack: key,
        level: 'warning',
        message: `${document.title} text extraction failed: ${document.extraction.error ?? 'unknown error'}.`,
      });
    }
  }

  return failures;
}

function buildReport(params: {
  generatedAt: string;
  refreshedPackKeys: string[];
  failures: AuditFailure[];
}): string {
  const lines: string[] = [
    '# Tenancy Golden Pack Refresh Audit',
    '',
    `Generated at: ${params.generatedAt}`,
    `Refreshed pack keys: ${params.refreshedPackKeys.join(', ')}`,
    '',
  ];

  if (params.failures.length === 0) {
    lines.push('Status: PASS');
    lines.push('');
    lines.push('- All 5 tenancy pack folders are present.');
    lines.push('- Each pack has a manifest and required PDFs.');
    lines.push('- No banned internal phrases were found in visible text artifacts.');
    return lines.join('\n');
  }

  lines.push('Status: FAIL');
  lines.push('');
  for (const failure of params.failures) {
    lines.push(`- [${failure.level.toUpperCase()}] ${failure.pack}: ${failure.message}`);
  }
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(AUDIT_ROOT, { recursive: true });
  const packRecords = await collectExistingPackRecords(OUTPUT_ROOT);
  const availableKeys = new Set(packRecords.map((pack) => pack.key));
  const failures: AuditFailure[] = [];

  for (const key of TENANCY_PACK_PRODUCT_KEYS) {
    if (!availableKeys.has(key)) {
      failures.push({
        pack: key,
        level: 'error',
        message: 'Pack folder is missing from artifacts/golden-packs.',
      });
      continue;
    }

    failures.push(...(await auditPack(key)));
  }

  const report = buildReport({
    generatedAt: new Date().toISOString(),
    refreshedPackKeys: [...TENANCY_PACK_PRODUCT_KEYS],
    failures,
  });
  await fs.writeFile(REPORT_PATH, report, 'utf8');
  console.log(report);

  if (failures.some((failure) => failure.level === 'error')) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
