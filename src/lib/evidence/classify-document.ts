export interface DocumentClassificationInput {
  fileName: string;
  mimeType?: string | null;
  extractedText?: string | null;
}

export interface DocumentClassificationResult {
  docType: string;
  confidence: number;
  reasons: string[];
  strongMarkersFound?: string[];
}

/**
 * Strong marker combinations for high-confidence classification.
 * When ALL markers in a group are found, confidence is boosted.
 */
interface StrongMarkerRule {
  docType: string;
  markers: string[];
  confidence: number;
  description: string;
}

const STRONG_MARKER_RULES: StrongMarkerRule[] = [
  // Section 21 (England)
  { docType: 'notice_s21', markers: ['form 6a', 'section 21'], confidence: 0.92, description: 'Form 6A Section 21' },
  { docType: 'notice_s21', markers: ['form 6a', 's21'], confidence: 0.90, description: 'Form 6A S21' },
  { docType: 'notice_s21', markers: ['section 21', 'housing act 1988'], confidence: 0.88, description: 'Section 21 Housing Act' },
  { docType: 'notice_s21', markers: ['notice requiring possession', 'assured shorthold'], confidence: 0.85, description: 'AST Possession Notice' },
  // Section 8 (England)
  { docType: 'notice_s8', markers: ['form 3', 'section 8'], confidence: 0.92, description: 'Form 3 Section 8' },
  { docType: 'notice_s8', markers: ['section 8', 'grounds for possession'], confidence: 0.88, description: 'Section 8 Grounds' },
  { docType: 'notice_s8', markers: ['notice seeking possession', 'ground 8'], confidence: 0.90, description: 'Ground 8 Notice' },
  // Scotland
  { docType: 'scotland_notice_to_leave', markers: ['notice to leave', 'first-tier tribunal'], confidence: 0.90, description: 'Scotland Notice to Leave' },
  { docType: 'scotland_notice_to_leave', markers: ['notice to leave', 'private residential tenancy'], confidence: 0.88, description: 'Scotland PRT Notice' },
  // Wales
  { docType: 'wales_notice', markers: ['rhw16', 'occupation contract'], confidence: 0.92, description: 'Wales RHW16' },
  { docType: 'wales_notice', markers: ['rhw17', 'occupation contract'], confidence: 0.92, description: 'Wales RHW17' },
  { docType: 'wales_notice', markers: ['rhw', 'renting homes (wales)'], confidence: 0.90, description: 'Wales RHW' },
  // Tenancy Agreement
  { docType: 'tenancy_agreement', markers: ['assured shorthold tenancy', 'agreement'], confidence: 0.88, description: 'AST Agreement' },
  // Compliance docs
  { docType: 'gas_safety', markers: ['gas safety', 'cp12'], confidence: 0.92, description: 'CP12 Gas Safety' },
  { docType: 'epc', markers: ['energy performance certificate', 'rating'], confidence: 0.92, description: 'EPC' },
  { docType: 'deposit_protection', markers: ['deposit protection', 'certificate'], confidence: 0.88, description: 'Deposit Certificate' },
];

const RULES: Array<{ docType: string; keywords: string[] }> = [
  { docType: 'notice_s21', keywords: ['section 21', 'form 6a', 'accelerated possession', 's21', 'notice requiring possession'] },
  { docType: 'notice_s8', keywords: ['section 8', 'form 3', 'grounds for possession', 's8', 'notice seeking possession'] },
  { docType: 'tenancy_agreement', keywords: ['tenancy agreement', 'assured shorthold', 'ast', 'occupation contract', 'private residential tenancy'] },
  { docType: 'rent_schedule', keywords: ['rent schedule', 'rent ledger', 'payment schedule'] },
  { docType: 'arrears_ledger', keywords: ['arrears', 'rent arrears', 'balance outstanding'] },
  { docType: 'bank_statement', keywords: ['bank statement', 'account number', 'statement period'] },
  { docType: 'deposit_protection', keywords: ['deposit protection', 'mydeposits', 'dps', 'tenancy deposit scheme', 'deposit certificate'] },
  { docType: 'prescribed_info', keywords: ['prescribed information', 'deposit information'] },
  { docType: 'how_to_rent', keywords: ['how to rent', 'checklist for renting in england'] },
  { docType: 'gas_safety', keywords: ['gas safety', 'cp12', 'gas safety record', 'landlord gas safety'] },
  { docType: 'epc', keywords: ['energy performance certificate', 'epc rating', 'energy efficiency rating'] },
  { docType: 'eicr', keywords: ['electrical installation condition report', 'eicr', 'electrical safety'] },
  { docType: 'correspondence', keywords: ['dear tenant', 'email', 'letter', 'notice served'] },
  { docType: 'lba_letter', keywords: ['letter before action', 'pre-action', 'lba', 'formal demand'] },
  { docType: 'court_claim_draft', keywords: ['claim form', 'n5', 'n5b', 'n119', 'particulars of claim'] },
  { docType: 'scotland_notice_to_leave', keywords: ['notice to leave', 'first-tier tribunal', 'housing (scotland)'] },
  { docType: 'wales_notice', keywords: ['rhw', 'renting homes (wales)', 'rhw16', 'rhw17', 'contract-holder'] },
];

function normalizeText(value: string | null | undefined): string {
  return (value || '').toLowerCase();
}

/**
 * Check for strong marker combinations that definitively identify a document type.
 */
function findStrongMarkerMatch(text: string): {
  docType: string;
  confidence: number;
  description: string;
  markersFound: string[];
} | null {
  let bestMatch: {
    docType: string;
    confidence: number;
    description: string;
    markersFound: string[];
  } | null = null;

  for (const rule of STRONG_MARKER_RULES) {
    const allMarkersPresent = rule.markers.every((marker) => text.includes(marker));
    if (allMarkersPresent) {
      if (!bestMatch || rule.confidence > bestMatch.confidence) {
        bestMatch = {
          docType: rule.docType,
          confidence: rule.confidence,
          description: rule.description,
          markersFound: [...rule.markers],
        };
      }
    }
  }

  return bestMatch;
}

export function classifyDocument(input: DocumentClassificationInput): DocumentClassificationResult {
  const sourceText = `${input.fileName || ''}\n${input.extractedText || ''}`;
  const text = normalizeText(sourceText);
  const reasons: string[] = [];

  // First, check for strong marker combinations (high-confidence patterns)
  const strongMatch = findStrongMarkerMatch(text);
  if (strongMatch) {
    reasons.push(`Strong match: ${strongMatch.description}`);
    reasons.push(...strongMatch.markersFound.map((m) => `Matched marker: "${m}"`));
    return {
      docType: strongMatch.docType,
      confidence: strongMatch.confidence,
      reasons,
      strongMarkersFound: strongMatch.markersFound,
    };
  }

  // Fall back to keyword matching
  let bestMatch: { docType: string; score: number; reasons: string[] } = {
    docType: 'other',
    score: 0,
    reasons: [],
  };

  RULES.forEach((rule) => {
    const matched = rule.keywords.filter((keyword) => text.includes(keyword));
    if (matched.length === 0) return;
    const score = matched.length;
    if (score > bestMatch.score) {
      bestMatch = {
        docType: rule.docType,
        score,
        reasons: matched.map((keyword) => `Matched keyword: "${keyword}"`),
      };
    }
  });

  if (bestMatch.docType === 'other') {
    reasons.push('No strong keyword match found.');
  } else {
    reasons.push(...bestMatch.reasons);
  }

  // Improved confidence: base 0.25, +0.18 per match, max 0.85 for keyword-only
  const confidence = bestMatch.score === 0 ? 0.2 : Math.min(0.85, 0.25 + 0.18 * bestMatch.score);

  return {
    docType: bestMatch.docType,
    confidence,
    reasons,
  };
}
