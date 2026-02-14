import 'server-only';

import { readdir } from 'fs/promises';
import path from 'path';

export type JurisdictionKey = 'england' | 'wales' | 'scotland';
export type NoticeVariantKey = 'section21' | 'section8' | 'section173' | 'rhw23' | 'notice-to-leave';

export type PreviewDoc = {
  key: string;
  title: string;
  src: string;
  alt: string;
};

export type NoticeOnlyPreviewData = Record<JurisdictionKey, Record<NoticeVariantKey, PreviewDoc[]>>;

const JURISDICTION_LABELS: Record<JurisdictionKey, string> = {
  england: 'England',
  wales: 'Wales',
  scotland: 'Scotland',
};

const NOTICE_VARIANT_LABELS: Record<NoticeVariantKey, string> = {
  section21: 'Section 21 Form 6A',
  section8: 'Section 8 Form 3',
  section173: 'Section 173',
  rhw23: 'RHW23',
  'notice-to-leave': 'Notice to Leave',
};

const SPECIAL_TITLE_WORDS: Record<string, string> = {
  rhw23: 'RHW23',
  prt: 'PRT',
  epc: 'EPC',
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

const buildAltText = (jurisdiction: JurisdictionKey, variant: NoticeVariantKey, title: string) =>
  `Landlord Heaven ${JURISDICTION_LABELS[jurisdiction]} ${NOTICE_VARIANT_LABELS[variant]} ${title} preview`;

const buildSrc = (jurisdiction: JurisdictionKey, variant: NoticeVariantKey, filename: string) =>
  `/images/previews/notice-only/${jurisdiction}/${variant}/${filename}`;

const loadVariantDocs = async (jurisdiction: JurisdictionKey, variant: NoticeVariantKey): Promise<PreviewDoc[]> => {
  const directory = path.join(
    process.cwd(),
    'public',
    'images',
    'previews',
    'notice-only',
    jurisdiction,
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
      src: buildSrc(jurisdiction, variant, filename),
      alt: buildAltText(jurisdiction, variant, title),
    };
  });
};

export const getNoticeOnlyPreviewData = async (): Promise<NoticeOnlyPreviewData> => {
  const jurisdictions: JurisdictionKey[] = ['england', 'wales', 'scotland'];
  const variantsByJurisdiction: Record<JurisdictionKey, NoticeVariantKey[]> = {
    england: ['section21', 'section8'],
    wales: ['section173', 'rhw23'],
    scotland: ['notice-to-leave'],
  };

  const data = {} as NoticeOnlyPreviewData;

  await Promise.all(
    jurisdictions.map(async (jurisdiction) => {
      const variants = variantsByJurisdiction[jurisdiction];
      const variantEntries = await Promise.all(
        variants.map(async (variant) => [variant, await loadVariantDocs(jurisdiction, variant)] as const),
      );

      data[jurisdiction] = variantEntries.reduce((acc, [variant, docs]) => {
        acc[variant] = docs;
        return acc;
      }, {} as Record<NoticeVariantKey, PreviewDoc[]>);
    }),
  );

  return data;
};
