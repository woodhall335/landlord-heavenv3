import 'server-only';

import { readdir } from 'fs/promises';
import path from 'path';

import type { PreviewDoc } from '@/lib/previews/noticeOnlyPreviews';

export type MoneyClaimPreviewData = PreviewDoc[];

const SPECIAL_TITLE_WORDS: Record<string, string> = {
  n1: 'N1',
  pap: 'PAP',
  mcol: 'MCOL',
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

const buildAltText = (title: string) => `Landlord Heaven England Money Claim Pack ${title} preview`;

const buildSrc = (filename: string) => `/images/previews/money-claim/england/${filename}`;

const loadPreviewDocs = async (): Promise<PreviewDoc[]> => {
  const directory = path.join(process.cwd(), 'public', 'images', 'previews', 'money-claim', 'england');

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
      src: buildSrc(filename),
      alt: buildAltText(title),
    };
  });
};

export const getMoneyClaimPreviewData = async (): Promise<MoneyClaimPreviewData> => loadPreviewDocs();
