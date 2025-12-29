export interface DocumentClassificationInput {
  fileName: string;
  mimeType?: string | null;
  extractedText?: string | null;
}

export interface DocumentClassificationResult {
  docType: string;
  confidence: number;
  reasons: string[];
}

const RULES: Array<{
  docType: string;
  keywords: string[];
}> = [
  { docType: 'notice_s21', keywords: ['section 21', 'form 6a', 'accelerated possession'] },
  { docType: 'notice_s8', keywords: ['section 8', 'form 3', 'grounds for possession'] },
  { docType: 'tenancy_agreement', keywords: ['tenancy agreement', 'assured shorthold', 'ast', 'occupation contract'] },
  { docType: 'rent_schedule', keywords: ['rent schedule', 'rent ledger', 'payment schedule'] },
  { docType: 'arrears_ledger', keywords: ['arrears', 'rent arrears', 'balance outstanding'] },
  { docType: 'bank_statement', keywords: ['bank statement', 'account number', 'statement period'] },
  { docType: 'deposit_protection', keywords: ['deposit protection', 'mydeposits', 'dps', 'tenancy deposit scheme'] },
  { docType: 'prescribed_info', keywords: ['prescribed information', 'deposit information'] },
  { docType: 'how_to_rent', keywords: ['how to rent', 'checklist for renting in england'] },
  { docType: 'gas_safety', keywords: ['gas safety', 'cp12', 'gas safety record'] },
  { docType: 'epc', keywords: ['energy performance certificate', 'epc rating'] },
  { docType: 'eicr', keywords: ['electrical installation condition report', 'eicr'] },
  { docType: 'correspondence', keywords: ['dear tenant', 'email', 'letter', 'notice served'] },
  { docType: 'lba_letter', keywords: ['letter before action', 'pre-action', 'lba'] },
  { docType: 'court_claim_draft', keywords: ['claim form', 'n5', 'n5b', 'n119', 'particulars of claim'] },
];

function normalizeText(value: string | null | undefined): string {
  return (value || '').toLowerCase();
}

export function classifyDocument(input: DocumentClassificationInput): DocumentClassificationResult {
  const sourceText = `${input.fileName || ''}\n${input.extractedText || ''}`;
  const text = normalizeText(sourceText);
  const reasons: string[] = [];

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

  const confidence = bestMatch.score === 0 ? 0.2 : Math.min(0.95, 0.3 + 0.15 * bestMatch.score);

  return {
    docType: bestMatch.docType,
    confidence,
    reasons,
  };
}
