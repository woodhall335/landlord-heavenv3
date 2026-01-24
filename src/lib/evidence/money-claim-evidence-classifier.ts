/**
 * Money Claim Evidence Classifier
 *
 * Deterministic classification of uploaded documents into evidence types
 * for use in the validation rules engine.
 *
 * Evidence types:
 * - photo: General photos (damage evidence, property condition)
 * - tenancy_agreement: Tenancy/lease agreements
 * - inventory_checkin: Check-in inventory reports
 * - inventory_checkout: Check-out inventory reports
 * - invoice_quote_receipt: Invoices, quotes, or receipts for repairs/cleaning
 * - rent_ledger_bank_statement: Rent ledgers or bank statements
 * - correspondence: Letters, emails, or other correspondence
 */

export type MoneyClaimEvidenceType =
  | 'photo'
  | 'tenancy_agreement'
  | 'inventory_checkin'
  | 'inventory_checkout'
  | 'invoice_quote_receipt'
  | 'rent_ledger_bank_statement'
  | 'correspondence'
  | 'council_tax_statement'
  | 'utility_bill'
  | 'other';

export interface ClassifiedEvidence {
  id: string;
  name: string;
  mimeType?: string;
  category?: string; // User-selected category from upload
  evidenceType: MoneyClaimEvidenceType;
  confidence: number;
  reasons: string[];
}

export interface EvidenceClassificationSummary {
  /** All classified evidence items */
  items: ClassifiedEvidence[];
  /** Evidence types present (for rules engine queries) */
  typesPresent: Set<MoneyClaimEvidenceType>;
  /** Convenience flags for common checks */
  hasPhoto: boolean;
  hasTenancyAgreement: boolean;
  hasInventoryCheckin: boolean;
  hasInventoryCheckout: boolean;
  hasInvoiceQuoteReceipt: boolean;
  hasRentLedgerBankStatement: boolean;
  hasCorrespondence: boolean;
  hasCouncilTaxStatement: boolean;
  hasUtilityBill: boolean;
}

// Image MIME types
const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

// Photo file extensions
const PHOTO_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif',
]);

/**
 * Filename patterns for evidence type detection
 */
interface PatternRule {
  type: MoneyClaimEvidenceType;
  patterns: RegExp[];
  confidence: number;
}

const FILENAME_PATTERNS: PatternRule[] = [
  // Tenancy agreement patterns
  {
    type: 'tenancy_agreement',
    patterns: [
      /tenancy[\s_-]?agreement/i,
      /ast[\s_-]?(agreement|contract)?/i,
      /assured[\s_-]?shorthold/i,
      /lease[\s_-]?(agreement|contract)/i,
      /rental[\s_-]?agreement/i,
      /occupation[\s_-]?contract/i,
    ],
    confidence: 0.9,
  },
  // Check-in inventory patterns
  {
    type: 'inventory_checkin',
    patterns: [
      /check[\s_-]?in[\s_-]?inventory/i,
      /check[\s_-]?in[\s_-]?report/i,
      /inventory[\s_-]?check[\s_-]?in/i,
      /move[\s_-]?in[\s_-]?inventory/i,
      /start[\s_-]?of[\s_-]?tenancy[\s_-]?inventory/i,
      /initial[\s_-]?inventory/i,
      /ingoing[\s_-]?inventory/i,
    ],
    confidence: 0.9,
  },
  // Check-out inventory patterns
  {
    type: 'inventory_checkout',
    patterns: [
      /check[\s_-]?out[\s_-]?inventory/i,
      /check[\s_-]?out[\s_-]?report/i,
      /inventory[\s_-]?check[\s_-]?out/i,
      /move[\s_-]?out[\s_-]?inventory/i,
      /end[\s_-]?of[\s_-]?tenancy[\s_-]?inventory/i,
      /final[\s_-]?inventory/i,
      /outgoing[\s_-]?inventory/i,
    ],
    confidence: 0.9,
  },
  // Invoice/quote/receipt patterns
  {
    type: 'invoice_quote_receipt',
    patterns: [
      /invoice/i,
      /quote/i,
      /quotation/i,
      /receipt/i,
      /estimate/i,
      /repair[\s_-]?quote/i,
      /cleaning[\s_-]?invoice/i,
      /contractor[\s_-]?(invoice|quote)/i,
      /builder[\s_-]?(invoice|quote)/i,
    ],
    confidence: 0.85,
  },
  // Rent ledger / bank statement patterns
  {
    type: 'rent_ledger_bank_statement',
    patterns: [
      /rent[\s_-]?ledger/i,
      /rent[\s_-]?schedule/i,
      /rent[\s_-]?statement/i,
      /arrears[\s_-]?ledger/i,
      /bank[\s_-]?statement/i,
      /account[\s_-]?statement/i,
      /payment[\s_-]?history/i,
      /transaction[\s_-]?history/i,
    ],
    confidence: 0.85,
  },
  // Council tax statement patterns
  {
    type: 'council_tax_statement',
    patterns: [
      /council[\s_-]?tax/i,
      /local[\s_-]?authority[\s_-]?tax/i,
      /council[\s_-]?bill/i,
    ],
    confidence: 0.85,
  },
  // Utility bill patterns
  {
    type: 'utility_bill',
    patterns: [
      /utility[\s_-]?bill/i,
      /gas[\s_-]?bill/i,
      /electric(ity)?[\s_-]?bill/i,
      /water[\s_-]?bill/i,
      /energy[\s_-]?bill/i,
      /broadband[\s_-]?bill/i,
    ],
    confidence: 0.85,
  },
  // Correspondence patterns
  {
    type: 'correspondence',
    patterns: [
      /letter/i,
      /email/i,
      /correspondence/i,
      /message/i,
      /demand[\s_-]?letter/i,
      /notice/i,
    ],
    confidence: 0.7,
  },
  // Photo patterns (explicit naming)
  {
    type: 'photo',
    patterns: [
      /photo/i,
      /image/i,
      /picture/i,
      /damage[\s_-]?(photo|pic|image)/i,
      /property[\s_-]?(photo|pic|image)/i,
      /before/i,
      /after/i,
      /condition/i,
    ],
    confidence: 0.75,
  },
];

/**
 * Map user-selected categories to evidence types
 */
const CATEGORY_TO_TYPE: Record<string, MoneyClaimEvidenceType> = {
  tenancy_agreement: 'tenancy_agreement',
  rent_schedule: 'rent_ledger_bank_statement',
  bank_statements: 'rent_ledger_bank_statement',
  demand_letters: 'correspondence',
  property_photos_before: 'inventory_checkin',
  property_photos_after: 'inventory_checkout',
  repair_quotes: 'invoice_quote_receipt',
  cleaning_invoice: 'invoice_quote_receipt',
  utility_bills: 'utility_bill',
  council_tax_bills: 'council_tax_statement',
  other_evidence: 'other',
  letter_before_claim: 'correspondence',
};

/**
 * Classify a single document based on filename, mime type, and user category
 */
export function classifyEvidenceDocument(
  doc: { id: string; name: string; type?: string; category?: string }
): ClassifiedEvidence {
  const reasons: string[] = [];
  const name = doc.name?.toLowerCase() || '';
  const mimeType = doc.type?.toLowerCase() || '';
  const userCategory = doc.category;

  // 1. Check user-selected category first (high confidence)
  if (userCategory && CATEGORY_TO_TYPE[userCategory]) {
    const mappedType = CATEGORY_TO_TYPE[userCategory];
    reasons.push(`User selected category: ${userCategory}`);
    return {
      id: doc.id,
      name: doc.name,
      mimeType: doc.type,
      category: doc.category,
      evidenceType: mappedType,
      confidence: 0.95,
      reasons,
    };
  }

  // 2. Check filename patterns
  for (const rule of FILENAME_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(name)) {
        reasons.push(`Filename matches pattern: ${pattern.source}`);
        return {
          id: doc.id,
          name: doc.name,
          mimeType: doc.type,
          category: doc.category,
          evidenceType: rule.type,
          confidence: rule.confidence,
          reasons,
        };
      }
    }
  }

  // 3. Check MIME type for photos
  if (IMAGE_MIME_TYPES.has(mimeType)) {
    reasons.push(`MIME type indicates image: ${mimeType}`);
    return {
      id: doc.id,
      name: doc.name,
      mimeType: doc.type,
      category: doc.category,
      evidenceType: 'photo',
      confidence: 0.8,
      reasons,
    };
  }

  // 4. Check file extension for photos
  const ext = name.substring(name.lastIndexOf('.'));
  if (PHOTO_EXTENSIONS.has(ext)) {
    reasons.push(`File extension indicates photo: ${ext}`);
    return {
      id: doc.id,
      name: doc.name,
      mimeType: doc.type,
      category: doc.category,
      evidenceType: 'photo',
      confidence: 0.75,
      reasons,
    };
  }

  // 5. Default to 'other'
  reasons.push('No matching patterns found');
  return {
    id: doc.id,
    name: doc.name,
    mimeType: doc.type,
    category: doc.category,
    evidenceType: 'other',
    confidence: 0.3,
    reasons,
  };
}

/**
 * Classify all uploaded documents and return a summary
 */
export function classifyAllEvidence(
  documents: Array<{ id: string; name: string; type?: string; category?: string }>
): EvidenceClassificationSummary {
  const items: ClassifiedEvidence[] = documents.map(classifyEvidenceDocument);
  const typesPresent = new Set<MoneyClaimEvidenceType>();

  for (const item of items) {
    typesPresent.add(item.evidenceType);
  }

  return {
    items,
    typesPresent,
    hasPhoto: typesPresent.has('photo'),
    hasTenancyAgreement: typesPresent.has('tenancy_agreement'),
    hasInventoryCheckin: typesPresent.has('inventory_checkin'),
    hasInventoryCheckout: typesPresent.has('inventory_checkout'),
    hasInvoiceQuoteReceipt: typesPresent.has('invoice_quote_receipt'),
    hasRentLedgerBankStatement: typesPresent.has('rent_ledger_bank_statement'),
    hasCorrespondence: typesPresent.has('correspondence'),
    hasCouncilTaxStatement: typesPresent.has('council_tax_statement'),
    hasUtilityBill: typesPresent.has('utility_bill'),
  };
}

/**
 * Build evidence context for rules engine evaluation
 * Returns an object that can be spread into the evaluation context
 */
export function buildEvidenceContext(
  documents: Array<{ id: string; name: string; type?: string; category?: string }> | undefined
): {
  evidence_summary: EvidenceClassificationSummary | null;
  has_photo_evidence: boolean;
  has_tenancy_agreement_evidence: boolean;
  has_inventory_checkin_evidence: boolean;
  has_inventory_checkout_evidence: boolean;
  has_invoice_quote_receipt_evidence: boolean;
  has_rent_ledger_bank_statement_evidence: boolean;
  has_correspondence_evidence: boolean;
  has_council_tax_statement_evidence: boolean;
  has_utility_bill_evidence: boolean;
  has_any_inventory_evidence: boolean;
} {
  if (!documents || documents.length === 0) {
    return {
      evidence_summary: null,
      has_photo_evidence: false,
      has_tenancy_agreement_evidence: false,
      has_inventory_checkin_evidence: false,
      has_inventory_checkout_evidence: false,
      has_invoice_quote_receipt_evidence: false,
      has_rent_ledger_bank_statement_evidence: false,
      has_correspondence_evidence: false,
      has_council_tax_statement_evidence: false,
      has_utility_bill_evidence: false,
      has_any_inventory_evidence: false,
    };
  }

  const summary = classifyAllEvidence(documents);

  return {
    evidence_summary: summary,
    has_photo_evidence: summary.hasPhoto,
    has_tenancy_agreement_evidence: summary.hasTenancyAgreement,
    has_inventory_checkin_evidence: summary.hasInventoryCheckin,
    has_inventory_checkout_evidence: summary.hasInventoryCheckout,
    has_invoice_quote_receipt_evidence: summary.hasInvoiceQuoteReceipt,
    has_rent_ledger_bank_statement_evidence: summary.hasRentLedgerBankStatement,
    has_correspondence_evidence: summary.hasCorrespondence,
    has_council_tax_statement_evidence: summary.hasCouncilTaxStatement,
    has_utility_bill_evidence: summary.hasUtilityBill,
    has_any_inventory_evidence: summary.hasInventoryCheckin || summary.hasInventoryCheckout,
  };
}
