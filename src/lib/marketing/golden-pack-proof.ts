import 'server-only';

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import type { PreviewDoc } from '@/lib/previews/noticeOnlyPreviews';

export type GoldenPackKey =
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

export type GoldenPackAssetKind = 'pdf' | 'html' | 'text';

type GoldenPackManifestDocument = {
  title: string;
  description: string;
  category: string;
  documentType: string;
  fileName: string;
  files: {
    pdf?: string;
    text?: string;
    html?: string;
  };
  extraction?: {
    pageCount?: number;
    isLowText?: boolean;
    isMetadataOnly?: boolean;
    method?: string;
  };
};

type GoldenPackManifest = {
  key: GoldenPackKey;
  displayName: string;
  outputDir: string;
  documentCount: number;
  documents: GoldenPackManifestDocument[];
};

type GoldenPackRootManifest = {
  generatedAt?: string;
  packs?: GoldenPackManifest[];
};

export type GoldenPackProofEntry = {
  documentType: string;
  title: string;
  description: string;
  categoryLabel: string;
  pageCount: number;
  excerpt?: string;
  previewSrc?: string;
  previewAlt?: string;
  pdfHref?: string;
  thumbnailHref?: string;
  embedHref?: string;
};

export type GoldenPackProofData = {
  key: GoldenPackKey;
  displayName: string;
  generatedAt?: string;
  versionToken: string;
  documentCount: number;
  totalPages: number;
  featuredEntries: GoldenPackProofEntry[];
  remainingTitles: string[];
};

const GOLDEN_PACKS_ROOT = path.join(process.cwd(), 'artifacts', 'golden-packs');
const GOLDEN_PACK_ROOT_PREFIX = `${path.resolve(GOLDEN_PACKS_ROOT)}${path.sep}`;

const GOLDEN_PACK_KEYS: GoldenPackKey[] = [
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

const CATEGORY_LABELS: Record<string, string> = {
  notice: 'Official notice',
  court_form: 'Court form',
  particulars: 'Claim particulars',
  evidence_tool: 'Evidence tool',
  guidance: 'Guidance',
  bonus: 'Bonus file',
  agreement: 'Agreement',
  checklist: 'Checklist',
  schedule: 'Supporting record',
};

const PREVIEW_HINTS: Partial<Record<GoldenPackKey, Record<string, string[]>>> = {
  notice_only: {
    section8_notice: ['section-8-eviction-notice', 'section8', 'notice'],
    arrears_schedule: ['rent arrears schedule', 'arrears'],
    service_instructions: ['service instructions'],
    validity_checklist: ['validity checklist'],
    compliance_declaration: ['compliance declaration'],
  },
  complete_pack: {
    section8_notice: ['notice'],
    n5_claim: ['n5'],
    n119_particulars: ['n119'],
    evidence_checklist: ['evidence checklist'],
    proof_of_service: ['proof of service'],
    witness_statement: ['witness statement', 'witness'],
    court_bundle_index: ['court bundle index'],
    hearing_checklist: ['hearing checklist'],
    arrears_engagement_letter: ['arrears engagement letter'],
    case_summary: ['case summary'],
  },
  money_claim: {
    particulars_of_claim: ['particulars of claim'],
    arrears_schedule: ['schedule of arrears'],
    interest_calculation: ['interest calculation'],
    letter_before_claim: ['letter before claim'],
    information_sheet: ['information sheet for defendants'],
    reply_form: ['reply form'],
    financial_statement: ['financial statement'],
    filing_guide: ['filing guide'],
    enforcement_guide: ['enforcement guide'],
    n1_claim_form: ['n1 claim form', 'form n1'],
  },
  england_standard_tenancy_agreement: {
    england_standard_tenancy_agreement: ['tenancy agreement'],
    pre_tenancy_checklist_england: ['compliance checklist'],
    deposit_protection_certificate: ['deposit protection certificate'],
    tenancy_deposit_information: ['prescribed information pack'],
  },
  england_premium_tenancy_agreement: {
    england_premium_tenancy_agreement: ['tenancy agreement'],
    pre_tenancy_checklist_england: ['compliance checklist'],
    deposit_protection_certificate: ['deposit protection certificate'],
    tenancy_deposit_information: ['prescribed information pack'],
    england_premium_management_schedule: ['property maintenance guide'],
    england_keys_handover_record: ['key schedule'],
  },
  section13_standard: {
    section13_form_4a: ['form 4a'],
    section13_justification_report: ['justification report'],
    section13_cover_letter: ['cover letter'],
    section13_proof_of_service: ['proof of service'],
  },
  section13_defensive: {
    section13_form_4a: ['form 4a'],
    section13_justification_report: ['justification report'],
    section13_cover_letter: ['cover letter'],
    section13_evidence_checklist: ['evidence checklist'],
    section13_tribunal_argument_summary: ['tribunal argument summary'],
  },
};

function readJsonFile<T>(filePath: string): T | null {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function normalizeValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function cleanExtractedText(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/Â£/g, '£')
    .replace(/Â©/g, '')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€“/g, '-')
    .replace(/â€”/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function isUsefulExcerptLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) {
    return false;
  }
  if (/^page\s+\d+$/i.test(trimmed)) {
    return false;
  }
  if (/^--\s*\d+\s+of\s+\d+\s*--$/i.test(trimmed)) {
    return false;
  }
  if (/crown copyright/i.test(trimmed)) {
    return false;
  }
  if (/prepared using landlord heaven/i.test(trimmed)) {
    return false;
  }
  if (trimmed.length < 18) {
    return false;
  }
  return true;
}

function buildExcerpt(textPath: string | undefined): string | undefined {
  if (!textPath) {
    return undefined;
  }

  const absolutePath = path.join(GOLDEN_PACKS_ROOT, textPath);
  if (!existsSync(absolutePath)) {
    return undefined;
  }

  const raw = readFileSync(absolutePath, 'utf8');
  const usefulLines = raw
    .split(/\r?\n/)
    .map((line) => cleanExtractedText(line))
    .filter(isUsefulExcerptLine);

  if (!usefulLines.length) {
    return undefined;
  }

  const excerpt = usefulLines.join(' ');
  if (excerpt.length <= 220) {
    return excerpt;
  }

  return `${excerpt.slice(0, 217).trimEnd()}...`;
}

function buildPreviewLookup(previewDocs?: PreviewDoc[]): PreviewDoc[] {
  return previewDocs ?? [];
}

function findPreviewForDocument(
  packKey: GoldenPackKey,
  document: GoldenPackManifestDocument,
  previewDocs?: PreviewDoc[]
): PreviewDoc | undefined {
  const docs = buildPreviewLookup(previewDocs);
  if (!docs.length) {
    return undefined;
  }

  const hints = PREVIEW_HINTS[packKey]?.[document.documentType] ?? [];
  const candidates = [
    ...hints,
    document.documentType,
    document.title,
    document.fileName.replace(/\.[^/.]+$/, ''),
  ].map(normalizeValue);

  return docs.find((preview) => {
    const haystack = [
      preview.key,
      preview.title,
      preview.description ?? '',
      preview.alt,
    ]
      .map(normalizeValue)
      .join(' ');

    return candidates.some((candidate) => candidate && haystack.includes(candidate));
  });
}

function getRootManifest(): GoldenPackRootManifest | null {
  return readJsonFile<GoldenPackRootManifest>(path.join(GOLDEN_PACKS_ROOT, 'manifest.json'));
}

function getPackManifest(packKey: GoldenPackKey): GoldenPackManifest | null {
  return readJsonFile<GoldenPackManifest>(path.join(GOLDEN_PACKS_ROOT, packKey, 'manifest.json'));
}

function buildVersionToken(value?: string): string {
  if (!value) {
    return 'latest';
  }

  const numeric = Date.parse(value);
  if (!Number.isNaN(numeric)) {
    return String(numeric);
  }

  return value.replace(/[^a-zA-Z0-9_-]+/g, '-');
}

function buildGoldenPackSampleUrl(
  packKey: GoldenPackKey,
  documentType: string,
  kind: 'pdf' | 'thumbnail' | 'embed',
  versionToken: string
): string {
  const encodedType = encodeURIComponent(documentType);
  const pathname =
    kind === 'pdf'
      ? `/api/golden-pack-samples/${packKey}/${encodedType}`
      : kind === 'thumbnail'
        ? `/api/golden-pack-samples/${packKey}/${encodedType}/thumbnail`
        : `/api/golden-pack-samples/${packKey}/${encodedType}/embed`;

  return `${pathname}?v=${encodeURIComponent(versionToken)}`;
}

function isPdfFilePath(relativePath?: string): relativePath is string {
  return Boolean(relativePath && relativePath.toLowerCase().endsWith('.pdf'));
}

export function isGoldenPackKey(value: string): value is GoldenPackKey {
  return GOLDEN_PACK_KEYS.includes(value as GoldenPackKey);
}

export function getGoldenPackAsset(
  packKey: GoldenPackKey,
  documentType: string,
  kind: GoldenPackAssetKind
):
  | {
      absolutePath: string;
      fileName: string;
      contentType: string;
    }
  | null {
  const packManifest = getPackManifest(packKey);
  if (!packManifest) {
    return null;
  }

  const document = packManifest.documents.find((entry) => entry.documentType === documentType);
  if (!document) {
    return null;
  }

  const relativePath =
    kind === 'pdf' ? document.files.pdf : kind === 'html' ? document.files.html : document.files.text;

  if (!relativePath) {
    return null;
  }

  const absolutePath = path.resolve(GOLDEN_PACKS_ROOT, relativePath);
  if (!absolutePath.startsWith(GOLDEN_PACK_ROOT_PREFIX)) {
    return null;
  }

  return {
    absolutePath,
    fileName: path.basename(absolutePath),
    contentType:
      kind === 'pdf' ? 'application/pdf' : kind === 'html' ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
  };
}

function getCategoryLabel(document: GoldenPackManifestDocument): string {
  if (document.category && CATEGORY_LABELS[document.category]) {
    return CATEGORY_LABELS[document.category];
  }

  const documentType = document.documentType.toLowerCase();

  if (documentType.includes('form') || documentType.includes('_n1') || documentType.endsWith('_claim')) {
    return 'Official form';
  }
  if (documentType.includes('report') || documentType.includes('summary')) {
    return 'Report';
  }
  if (documentType.includes('guide') || documentType.includes('briefing')) {
    return 'Guidance';
  }
  if (documentType.includes('checklist')) {
    return 'Checklist';
  }
  if (documentType.includes('bundle')) {
    return 'Bundle';
  }
  if (documentType.includes('template') || documentType.includes('response') || documentType.includes('email')) {
    return 'Response tool';
  }

  return 'Included file';
}

export function getGoldenPackProofData(
  packKey: GoldenPackKey,
  options?: {
    previewDocs?: PreviewDoc[];
    featuredLimit?: number;
  }
): GoldenPackProofData | null {
  const packManifest = getPackManifest(packKey);
  if (!packManifest) {
    return null;
  }

  const rootManifest = getRootManifest();
  const versionToken = buildVersionToken(rootManifest?.generatedAt);

  const entries = packManifest.documents.map((document) => {
    const preview = findPreviewForDocument(packKey, document, options?.previewDocs);
    const hasPreviewablePdf = isPdfFilePath(document.files.pdf);

    return {
      documentType: document.documentType,
      title: document.title,
      description: document.description,
      categoryLabel: getCategoryLabel(document),
      pageCount: document.extraction?.pageCount ?? 0,
      excerpt: buildExcerpt(document.files.text),
      previewSrc: preview?.src,
      previewAlt: preview?.alt,
      pdfHref: hasPreviewablePdf
        ? buildGoldenPackSampleUrl(packKey, document.documentType, 'pdf', versionToken)
        : undefined,
      thumbnailHref: hasPreviewablePdf
        ? buildGoldenPackSampleUrl(packKey, document.documentType, 'thumbnail', versionToken)
        : undefined,
      embedHref: hasPreviewablePdf
        ? buildGoldenPackSampleUrl(packKey, document.documentType, 'embed', versionToken)
        : undefined,
    } satisfies GoldenPackProofEntry;
  });

  const previewableEntries = entries.filter((entry) => Boolean(entry.pdfHref));
  const featuredLimit = options?.featuredLimit ?? previewableEntries.length;

  return {
    key: packManifest.key,
    displayName: packManifest.displayName,
    generatedAt: rootManifest?.generatedAt,
    versionToken,
    documentCount: packManifest.documentCount,
    totalPages: packManifest.documents.reduce(
      (sum, document) => sum + (document.extraction?.pageCount ?? 0),
      0
    ),
    featuredEntries: previewableEntries.slice(0, featuredLimit),
    remainingTitles: entries
      .filter((entry) => !entry.pdfHref)
      .map((entry) => entry.title),
  };
}
