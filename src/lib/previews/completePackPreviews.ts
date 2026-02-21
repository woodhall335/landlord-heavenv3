import 'server-only';

import { readdir } from 'fs/promises';
import path from 'path';

import type { PreviewDoc } from '@/lib/previews/noticeOnlyPreviews';

export type CompletePackVariantKey = 'section8' | 'section21';

export type CompletePackPreviewData = Record<CompletePackVariantKey, PreviewDoc[]>;

const VARIANT_LABELS: Record<CompletePackVariantKey, string> = {
  section8: 'Section 8 Eviction Pack',
  section21: 'Section 21 Eviction Pack',
};

const SPECIAL_TITLE_WORDS: Record<string, string> = {
  ai: 'AI',
  n5: 'N5',
  n119: 'N119',
  n5b: 'N5B',
  epc: 'EPC',
  hmcts: 'HMCTS',
};

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (SPECIAL_TITLE_WORDS[lower]) {
        return SPECIAL_TITLE_WORDS[lower];
      }
      if (/^\d+[a-z]$/.test(lower)) {
        return `${lower.slice(0, -1)}${lower.slice(-1).toUpperCase()}`;
      }
      return `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    })
    .join(' ');

const buildTitle = (filename: string) => {
  const withoutExtension = filename.replace(/\.[^/.]+$/, '');
  const withoutPreviewToken = withoutExtension.replace(/-preview$/i, '');
  return toTitleCase(withoutPreviewToken.replace(/-/g, ' '));
};

const buildAltText = (variant: CompletePackVariantKey, title: string) =>
  `Landlord Heaven England ${VARIANT_LABELS[variant]} ${title} preview`;

const buildSrc = (variant: CompletePackVariantKey, filename: string) =>
  `/images/previews/complete-pack/england/${variant}/${filename}`;

const loadVariantDocs = async (variant: CompletePackVariantKey): Promise<PreviewDoc[]> => {
  const directory = path.join(
    process.cwd(),
    'public',
    'images',
    'previews',
    'complete-pack',
    'england',
    variant,
  );

  let files: string[];
  try {
    files = await readdir(directory);
  } catch {
    return [];
  }

  const webpFiles = files.filter((file) => file.toLowerCase().endsWith('.webp')).sort((a, b) => a.localeCompare(b));

  return webpFiles.map((filename) => {
    const title = buildTitle(filename);
    return {
      key: filename.replace(/\.[^/.]+$/, ''),
      title,
      src: buildSrc(variant, filename),
      alt: buildAltText(variant, title),
    };
  });
};

export const getCompletePackPreviewData = async (): Promise<CompletePackPreviewData> => {
  const variants: CompletePackVariantKey[] = ['section8', 'section21'];

  const entries = await Promise.all(
    variants.map(async (variant) => [variant, await loadVariantDocs(variant)] as const),
  );

  return entries.reduce((acc, [variant, docs]) => {
    acc[variant] = docs;
    return acc;
  }, {} as CompletePackPreviewData);
};
