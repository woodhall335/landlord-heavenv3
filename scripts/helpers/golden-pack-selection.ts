import fs from 'fs/promises';
import path from 'path';

import type { GoldenPackRecord } from './save-golden-pack.ts';

export const NON_PACK_PUBLIC_PRODUCTS = ['ast'] as const;

export type LivePackProductKey =
  | 'notice_only'
  | 'complete_pack'
  | 'money_claim'
  | 'section13_standard'
  | 'section13_defensive'
  | 'england_standard_tenancy_agreement'
  | 'england_premium_tenancy_agreement'
  | 'england_student_tenancy_agreement'
  | 'england_hmo_shared_house_tenancy_agreement'
  | 'england_lodger_agreement';

export const LIVE_PACK_PRODUCT_KEYS: LivePackProductKey[] = [
  'notice_only',
  'complete_pack',
  'money_claim',
  'section13_standard',
  'section13_defensive',
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
];

export const TENANCY_PACK_PRODUCT_KEYS: LivePackProductKey[] = [
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
];

export const REQUIRED_TENANCY_DOCUMENT_TYPES: Record<
  typeof TENANCY_PACK_PRODUCT_KEYS[number],
  string[]
> = {
  england_standard_tenancy_agreement: [
    'england_standard_tenancy_agreement',
    'pre_tenancy_checklist_england',
    'england_keys_handover_record',
    'england_utilities_handover_sheet',
    'england_pet_request_addendum',
    'england_tenancy_variation_record',
    'deposit_protection_certificate',
    'tenancy_deposit_information',
  ],
  england_premium_tenancy_agreement: [
    'england_premium_tenancy_agreement',
    'pre_tenancy_checklist_england',
    'england_keys_handover_record',
    'england_utilities_handover_sheet',
    'england_pet_request_addendum',
    'england_tenancy_variation_record',
    'deposit_protection_certificate',
    'tenancy_deposit_information',
    'england_premium_management_schedule',
  ],
  england_student_tenancy_agreement: [
    'england_student_tenancy_agreement',
    'pre_tenancy_checklist_england',
    'england_keys_handover_record',
    'england_utilities_handover_sheet',
    'england_pet_request_addendum',
    'england_tenancy_variation_record',
    'deposit_protection_certificate',
    'tenancy_deposit_information',
    'england_student_move_out_schedule',
  ],
  england_hmo_shared_house_tenancy_agreement: [
    'england_hmo_shared_house_tenancy_agreement',
    'pre_tenancy_checklist_england',
    'england_keys_handover_record',
    'england_utilities_handover_sheet',
    'england_pet_request_addendum',
    'england_tenancy_variation_record',
    'deposit_protection_certificate',
    'tenancy_deposit_information',
    'england_hmo_house_rules_appendix',
  ],
  england_lodger_agreement: [
    'england_lodger_agreement',
    'england_lodger_checklist',
    'england_keys_handover_record',
    'england_lodger_house_rules_appendix',
  ],
};

export type GeneratorCliOptions = {
  selectedKeys: LivePackProductKey[];
  shouldClean: boolean;
  chunkSize: number;
  resume: boolean;
  refreshExisting: boolean;
  skipTextExtraction: boolean;
};

function parseOnlyKeys(argv: string[]): LivePackProductKey[] | null {
  const onlyArg = argv.find((arg) => arg.startsWith('--only='));
  if (!onlyArg) {
    return null;
  }

  const rawKeys = onlyArg
    .slice('--only='.length)
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);

  const invalidKeys = rawKeys.filter(
    (key) => !LIVE_PACK_PRODUCT_KEYS.includes(key as LivePackProductKey)
  );

  if (invalidKeys.length > 0) {
    throw new Error(`Unknown golden-pack product key(s): ${invalidKeys.join(', ')}`);
  }

  return rawKeys as LivePackProductKey[];
}

function parseGroupKeys(argv: string[]): LivePackProductKey[] | null {
  const groupArg = argv.find((arg) => arg.startsWith('--group='));
  if (!groupArg) {
    return null;
  }

  const value = groupArg.slice('--group='.length).trim();
  if (value === 'tenancy') {
    return [...TENANCY_PACK_PRODUCT_KEYS];
  }

  throw new Error(`Unknown golden-pack group: ${value}`);
}

function parseChunkSize(argv: string[]): number {
  const chunkArg = argv.find((arg) => arg.startsWith('--chunk-size='));
  if (!chunkArg) {
    return 0;
  }

  const raw = Number(chunkArg.slice('--chunk-size='.length));
  if (!Number.isInteger(raw) || raw <= 0) {
    throw new Error(`Invalid --chunk-size value: ${chunkArg}`);
  }

  return raw;
}

export function parseGeneratorCliOptions(argv: string[]): GeneratorCliOptions {
  const groupKeys = parseGroupKeys(argv);
  const onlyKeys = parseOnlyKeys(argv);

  if (groupKeys && onlyKeys) {
    throw new Error('Use either --group or --only, not both.');
  }

  const selectedKeys = groupKeys ?? onlyKeys ?? LIVE_PACK_PRODUCT_KEYS;
  const parsedChunkSize = parseChunkSize(argv);
  const defaultChunkSize =
    groupKeys?.every((key) => TENANCY_PACK_PRODUCT_KEYS.includes(key)) ? 1 : selectedKeys.length;

  const options: GeneratorCliOptions = {
    selectedKeys,
    shouldClean: !argv.includes('--no-clean'),
    chunkSize: parsedChunkSize || defaultChunkSize,
    resume: argv.includes('--resume'),
    refreshExisting: argv.includes('--refresh-existing'),
    skipTextExtraction: argv.includes('--skip-text-extraction'),
  };

  if (options.refreshExisting && options.shouldClean) {
    throw new Error('--refresh-existing requires --no-clean so existing pack folders remain available.');
  }

  return options;
}

export async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}

export async function collectExistingPackRecords(baseDir: string): Promise<GoldenPackRecord[]> {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    const packs: GoldenPackRecord[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const manifestPath = path.join(baseDir, entry.name, 'manifest.json');
      try {
        const manifest = await readJson<GoldenPackRecord>(manifestPath);
        packs.push(manifest);
      } catch {
        // Ignore non-pack folders.
      }
    }

    return packs.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch {
    return [];
  }
}

export async function packDirectoryExists(baseDir: string, key: LivePackProductKey): Promise<boolean> {
  try {
    const stat = await fs.stat(path.join(baseDir, key));
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function isPackComplete(
  baseDir: string,
  key: LivePackProductKey,
): Promise<boolean> {
  const manifestPath = path.join(baseDir, key, 'manifest.json');
  let manifest: GoldenPackRecord;
  try {
    manifest = await readJson<GoldenPackRecord>(manifestPath);
  } catch {
    return false;
  }

  if (!manifest.documents.length) {
    return false;
  }

  const requiredDocTypes = REQUIRED_TENANCY_DOCUMENT_TYPES[
    key as keyof typeof REQUIRED_TENANCY_DOCUMENT_TYPES
  ];
  if (requiredDocTypes) {
    const available = new Set(
      manifest.documents.map((document) => document.documentType).filter(Boolean)
    );
    for (const requiredDocType of requiredDocTypes) {
      if (!available.has(requiredDocType)) {
        return false;
      }
    }
  }

  for (const document of manifest.documents) {
    if (!document.files.pdf) {
      return false;
    }
    try {
      await fs.stat(path.join(baseDir, document.files.pdf));
    } catch {
      return false;
    }
  }

  return true;
}

export function chunkKeys(
  keys: LivePackProductKey[],
  chunkSize: number,
): LivePackProductKey[][] {
  const chunks: LivePackProductKey[][] = [];
  for (let index = 0; index < keys.length; index += chunkSize) {
    chunks.push(keys.slice(index, index + chunkSize));
  }
  return chunks;
}
