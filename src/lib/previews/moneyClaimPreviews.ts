import 'server-only';

import { existsSync } from 'fs';
import path from 'path';

import type { PreviewDoc } from '@/lib/previews/noticeOnlyPreviews';

export type MoneyClaimPreviewData = PreviewDoc[];

// Image files are uploaded manually to public/images/previews/money-claim/england/ and not committed via PR because binaries are not supported.
const MONEY_CLAIM_PREVIEW_FILES = [
  'form-n1.webp',
  'particulars-of-claim.webp',
  'schedule-of-arrears.webp',
  'interest-calculation.webp',
  'letter-before-claim.webp',
  'defendant-information-sheet.webp',
  'reply-form.webp',
  'financial-statement.webp',
  'court-filing-guide.webp',
  'enforcement-guide.webp',
] as const;

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');

const buildTitle = (filename: string) => toTitleCase(filename.replace(/\.[^/.]+$/, '').replace(/-/g, ' '));

const buildAltText = (title: string) => `Landlord Heaven England Money Claim Pack ${title} preview`;

const buildSrc = (filename: string) => `/images/previews/money-claim/england/${filename}`;

const previewImageExists = (imagePath: string) =>
  existsSync(path.join(process.cwd(), 'public', imagePath.replace(/^\//, '')));

export const getMoneyClaimPreviewData = async (): Promise<MoneyClaimPreviewData> => {
  if (process.env.E2E_MODE === 'true') {
    return [];
  }

  const previews = MONEY_CLAIM_PREVIEW_FILES.map((filename) => {
    const title = buildTitle(filename);
    return {
      key: filename.replace(/\.[^/.]+$/, ''),
      title,
      src: buildSrc(filename),
      alt: buildAltText(title),
    };
  }).filter((preview) => previewImageExists(preview.src));

  if (!previews.length) {
    // Intentionally return no previews when binaries are absent so local dev/audits never crash.
    return [];
  }

  return previews;
};
