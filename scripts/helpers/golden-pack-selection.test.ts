import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  isPackComplete,
  parseGeneratorCliOptions,
  TENANCY_PACK_PRODUCT_KEYS,
} from './golden-pack-selection.ts';

const tempDirs: string[] = [];

async function makeTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'golden-pack-selection-'));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

describe('parseGeneratorCliOptions', () => {
  it('selects all tenancy packs for --group=tenancy and defaults chunk size to 1', () => {
    const parsed = parseGeneratorCliOptions(['--group=tenancy']);
    expect(parsed.selectedKeys).toEqual(TENANCY_PACK_PRODUCT_KEYS);
    expect(parsed.chunkSize).toBe(1);
  });

  it('parses resume, refresh-existing, and skip-text-extraction flags', () => {
    const parsed = parseGeneratorCliOptions([
      '--group=tenancy',
      '--resume',
      '--refresh-existing',
      '--skip-text-extraction',
      '--chunk-size=2',
      '--no-clean',
    ]);

    expect(parsed.resume).toBe(true);
    expect(parsed.refreshExisting).toBe(true);
    expect(parsed.skipTextExtraction).toBe(true);
    expect(parsed.chunkSize).toBe(2);
    expect(parsed.shouldClean).toBe(false);
  });
});

describe('isPackComplete', () => {
  it('returns true for a standard tenancy manifest with required PDFs present', async () => {
    const tempDir = await makeTempDir();
    const packDir = path.join(tempDir, 'england_standard_tenancy_agreement');
    await fs.mkdir(packDir, { recursive: true });

    const manifest = {
      key: 'england_standard_tenancy_agreement',
      displayName: 'Standard Tenancy Agreement',
      outputDir: 'england_standard_tenancy_agreement',
      documentCount: 6,
      documents: [
        'england_standard_tenancy_agreement',
        'pre_tenancy_checklist_england',
        'england_keys_handover_record',
        'england_utilities_handover_sheet',
        'england_pet_request_addendum',
        'england_tenancy_variation_record',
        'deposit_protection_certificate',
        'tenancy_deposit_information',
      ].map((documentType) => ({
        title: documentType,
        documentType,
        fileName: `${documentType}.pdf`,
        files: {
          pdf: `england_standard_tenancy_agreement/${documentType}.pdf`,
        },
      })),
    };

    await fs.writeFile(path.join(packDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    for (const document of manifest.documents) {
      await fs.writeFile(path.join(tempDir, document.files.pdf), Buffer.from('pdf'));
    }

    await expect(isPackComplete(tempDir, 'england_standard_tenancy_agreement')).resolves.toBe(true);
  });

  it('returns false when a required tenancy document is missing from the manifest', async () => {
    const tempDir = await makeTempDir();
    const packDir = path.join(tempDir, 'england_standard_tenancy_agreement');
    await fs.mkdir(packDir, { recursive: true });

    const manifest = {
      key: 'england_standard_tenancy_agreement',
      displayName: 'Standard Tenancy Agreement',
      outputDir: 'england_standard_tenancy_agreement',
      documentCount: 1,
      documents: [
        {
          title: 'Standard Tenancy Agreement',
          documentType: 'england_standard_tenancy_agreement',
          fileName: 'england_standard_tenancy_agreement.pdf',
          files: {
            pdf: 'england_standard_tenancy_agreement/england_standard_tenancy_agreement.pdf',
          },
        },
      ],
    };

    await fs.writeFile(path.join(packDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    await fs.writeFile(
      path.join(tempDir, 'england_standard_tenancy_agreement', 'england_standard_tenancy_agreement.pdf'),
      Buffer.from('pdf')
    );

    await expect(isPackComplete(tempDir, 'england_standard_tenancy_agreement')).resolves.toBe(false);
  });
});
