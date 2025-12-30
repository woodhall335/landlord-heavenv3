import type { CaseFacts } from '@/lib/case-facts/schema';
import { EvidenceCategory } from '@/lib/evidence/schema';

export type EvidenceDocType =
  | 'tenancy_agreement'
  | 'notice_s21'
  | 'notice_s8'
  | 'rent_schedule'
  | 'arrears_ledger'
  | 'bank_statement'
  | 'correspondence'
  | 'deposit_protection'
  | 'prescribed_info'
  | 'how_to_rent'
  | 'gas_safety'
  | 'epc'
  | 'eicr'
  | 'lba_letter'
  | 'court_claim_draft'
  | 'other';

export interface EvidenceRecord {
  id: string;
  category?: string | null;
  file_name?: string | null;
  doc_type?: string | null;
  doc_type_confidence?: number | null;
}

export interface EvidenceAnalysisRecord {
  detected_type?: string | null;
  extracted_fields?: Record<string, any> | null;
  confidence?: number | null;
}

export interface EvidenceMapInput {
  facts: CaseFacts;
  evidenceFiles: EvidenceRecord[];
  analysisMap?: Record<string, EvidenceAnalysisRecord> | null;
}

const CATEGORY_FLAG_MAP: Record<string, keyof CaseFacts['evidence']> = {
  [EvidenceCategory.TENANCY_AGREEMENT]: 'tenancy_agreement_uploaded',
  [EvidenceCategory.RENT_SCHEDULE]: 'rent_schedule_uploaded',
  [EvidenceCategory.ARREARS_LEDGER]: 'rent_schedule_uploaded',
  [EvidenceCategory.BANK_STATEMENTS]: 'bank_statements_uploaded',
  [EvidenceCategory.BANK_STATEMENT]: 'bank_statements_uploaded',
  [EvidenceCategory.NOTICE_S21]: 'correspondence_uploaded',
  [EvidenceCategory.NOTICE_S8]: 'correspondence_uploaded',
  [EvidenceCategory.CORRESPONDENCE]: 'correspondence_uploaded',
  [EvidenceCategory.GAS_SAFETY_CERTIFICATE]: 'safety_certificates_uploaded',
  [EvidenceCategory.EPC]: 'safety_certificates_uploaded',
  [EvidenceCategory.EICR]: 'safety_certificates_uploaded',
  [EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE]: 'tenancy_agreement_uploaded',
  [EvidenceCategory.PRESCRIBED_INFORMATION_PROOF]: 'tenancy_agreement_uploaded',
  [EvidenceCategory.HOW_TO_RENT_PROOF]: 'correspondence_uploaded',
  [EvidenceCategory.NOTICE_SERVED_PROOF]: 'correspondence_uploaded',
  [EvidenceCategory.DEPOSIT_PROTECTION]: 'tenancy_agreement_uploaded',
  [EvidenceCategory.LBA_LETTER]: 'correspondence_uploaded',
  [EvidenceCategory.COURT_CLAIM_DRAFT]: 'other_evidence_uploaded',
  [EvidenceCategory.OTHER]: 'other_evidence_uploaded',
};

const DOC_TYPE_FLAG_MAP: Record<EvidenceDocType, keyof CaseFacts['evidence']> = {
  tenancy_agreement: 'tenancy_agreement_uploaded',
  notice_s21: 'correspondence_uploaded',
  notice_s8: 'correspondence_uploaded',
  rent_schedule: 'rent_schedule_uploaded',
  arrears_ledger: 'rent_schedule_uploaded',
  bank_statement: 'bank_statements_uploaded',
  correspondence: 'correspondence_uploaded',
  deposit_protection: 'tenancy_agreement_uploaded',
  prescribed_info: 'tenancy_agreement_uploaded',
  how_to_rent: 'correspondence_uploaded',
  gas_safety: 'safety_certificates_uploaded',
  epc: 'safety_certificates_uploaded',
  eicr: 'safety_certificates_uploaded',
  lba_letter: 'correspondence_uploaded',
  court_claim_draft: 'other_evidence_uploaded',
  other: 'other_evidence_uploaded',
};

const MIN_CONFIDENCE = 0.6;

function normalizeDocType(value?: string | null): EvidenceDocType | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes('tenancy')) return 'tenancy_agreement';
  if (normalized.includes('notice_s21') || normalized.includes('section 21') || normalized.includes('s21')) return 'notice_s21';
  if (normalized.includes('notice_s8') || normalized.includes('section 8') || normalized.includes('s8')) return 'notice_s8';
  if (normalized.includes('rent schedule') || normalized.includes('rent_schedule')) return 'rent_schedule';
  if (normalized.includes('bank') || normalized.includes('bank_statement')) return 'bank_statement';
  if (normalized.includes('arrears')) return 'arrears_ledger';
  if (normalized.includes('deposit')) return 'deposit_protection';
  if (normalized.includes('prescribed')) return 'prescribed_info';
  if (normalized.includes('how to rent')) return 'how_to_rent';
  if (normalized.includes('gas')) return 'gas_safety';
  if (normalized.includes('epc')) return 'epc';
  if (normalized.includes('eicr')) return 'eicr';
  if (normalized.includes('lba') || normalized.includes('letter before action')) return 'lba_letter';
  if (normalized.includes('claim') || normalized.includes('n5') || normalized.includes('n119')) return 'court_claim_draft';
  if (normalized.includes('correspondence') || normalized.includes('email')) return 'correspondence';
  return 'other';
}

export function mapEvidenceToFacts(input: EvidenceMapInput): CaseFacts {
  const { facts, evidenceFiles, analysisMap } = input;
  const updated = { ...facts } as CaseFacts;
  const existingEvidence = { ...(facts.evidence || {}) } as CaseFacts['evidence'];

  const flags: Partial<CaseFacts['evidence']> = {
    tenancy_agreement_uploaded: false,
    rent_schedule_uploaded: false,
    correspondence_uploaded: false,
    damage_photos_uploaded: false,
    authority_letters_uploaded: false,
    bank_statements_uploaded: false,
    safety_certificates_uploaded: false,
    asb_evidence_uploaded: false,
    other_evidence_uploaded: false,
  };

  const mergeFlag = (flag: keyof CaseFacts['evidence']) => {
    // Type assertion is safe because we only set boolean flags from CATEGORY_FLAG_MAP and DOC_TYPE_FLAG_MAP
    (flags as Record<string, boolean>)[flag] = true;
  };

  for (const file of evidenceFiles) {
    const category = file.category?.toLowerCase();
    if (category && CATEGORY_FLAG_MAP[category]) {
      mergeFlag(CATEGORY_FLAG_MAP[category]);
    }

    const classificationType = normalizeDocType(file.doc_type);
    if (classificationType && (file.doc_type_confidence ?? 0) >= MIN_CONFIDENCE) {
      mergeFlag(DOC_TYPE_FLAG_MAP[classificationType]);
      continue;
    }

    const analysis = analysisMap?.[file.id];
    const docType = normalizeDocType(analysis?.detected_type);
    if (docType && (analysis?.confidence ?? 0) >= MIN_CONFIDENCE) {
      mergeFlag(DOC_TYPE_FLAG_MAP[docType]);
    }
  }

  updated.evidence = {
    ...existingEvidence,
    ...flags,
  } as CaseFacts['evidence'];

  return updated;
}
