// Debug logging helper - controlled by DEBUG_EVIDENCE env var
const DEBUG = process.env.DEBUG_EVIDENCE === 'true';
function debugLog(label: string, data: any): void {
  if (DEBUG) {
    console.log(`[DEBUG_EVIDENCE][classify][${label}]`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

export interface DocumentClassificationInput {
  fileName: string;
  mimeType?: string | null;
  extractedText?: string | null;
  /** Category hint from validator context (e.g., 'notice_s21' when uploading to Section 21 validator) */
  categoryHint?: string | null;
  /** Extraction quality info - helps decide whether to trust content analysis */
  extractionQuality?: {
    text_extraction_method?: string;
    text_length?: number;
    regex_fields_found?: number;
    llm_extraction_ran?: boolean;
    is_low_text?: boolean;
    is_metadata_only?: boolean;
    document_markers?: string[];
  };
  /** Extracted fields from analysis - can be used to boost classification confidence */
  extractedFields?: Record<string, any> | null;
}

export interface DocumentClassificationResult {
  docType: string;
  confidence: number;
  reasons: string[];
  strongMarkersFound?: string[];
  /** Whether classification primarily relied on user's category hint due to weak content signals */
  usedCategoryHint?: boolean;
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
  // Lowercase and normalize common separators (underscores, hyphens, dots) to spaces
  // This helps match filenames like "Section_21_Notice.pdf" against keywords like "section 21"
  return (value || '')
    .toLowerCase()
    .replace(/[_\-.]+/g, ' ')
    .replace(/\s+/g, ' ');
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
    // Normalize markers the same way we normalize text (handle hyphens, etc.)
    const allMarkersPresent = rule.markers.every((marker) => {
      const normalizedMarker = normalizeText(marker);
      return text.includes(normalizedMarker);
    });
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

/**
 * Check if a filename looks like a UUID (no meaningful extension hints).
 */
function isUuidLikeFilename(filename: string): boolean {
  const name = filename.toLowerCase().replace(/\.(pdf|jpg|jpeg|png|gif|webp)$/i, '');
  // UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx or similar
  const uuidPattern = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
  const hexPattern = /^[0-9a-f]{24,}$/i;
  return uuidPattern.test(name) || hexPattern.test(name);
}

/**
 * Known document type categories that we can trust from validator context.
 */
const KNOWN_CATEGORY_HINTS = new Set([
  'notice_s21', 'notice_s8', 'tenancy_agreement', 'wales_notice',
  'scotland_notice_to_leave', 'rent_schedule', 'arrears_ledger',
  'bank_statement', 'deposit_protection', 'prescribed_info',
  'how_to_rent', 'gas_safety', 'epc', 'eicr', 'correspondence',
  'lba_letter', 'court_claim_draft',
]);

export function classifyDocument(input: DocumentClassificationInput): DocumentClassificationResult {
  const sourceText = `${input.fileName || ''}\n${input.extractedText || ''}`;
  const text = normalizeText(sourceText);
  const reasons: string[] = [];

  debugLog('input', {
    fileName: input.fileName,
    categoryHint: input.categoryHint,
    extractedTextLength: input.extractedText?.length || 0,
    extractionQuality: input.extractionQuality,
    hasExtractedFields: !!input.extractedFields,
  });

  // Check extracted fields for classification signals
  const extractedFields = input.extractedFields || {};
  const documentMarkers = input.extractionQuality?.document_markers || [];

  // High-confidence classification from extracted field signals
  const hasForm6aFlag = extractedFields.form_6a_used === true || extractedFields.form_6a_detected === true;
  const hasSection21Flag = extractedFields.section_21_detected === true;
  const hasSection8Flag = extractedFields.section_8_detected === true || extractedFields.form_3_detected === true;
  const hasWalesFlag = !!extractedFields.rhw_form_number || extractedFields.occupation_contract_mentioned === true;
  const hasScotlandFlag = extractedFields.notice_to_leave_detected === true || extractedFields.prt_mentioned === true;

  // Use document markers from extraction quality
  const markersSet = new Set(documentMarkers);
  const hasForm6aMarker = markersSet.has('form_6a');
  const hasSection21Marker = markersSet.has('section_21');
  const hasSection8Marker = markersSet.has('section_8');
  const hasWalesMarker = markersSet.has('wales_rhw');
  const hasScotlandMarker = markersSet.has('scotland_ntl');
  const hasTenancyMarker = markersSet.has('tenancy_agreement');

  // Immediate high-confidence classification from extracted flags/markers
  if ((hasForm6aFlag || hasForm6aMarker) && (hasSection21Flag || hasSection21Marker)) {
    reasons.push('Detected Form 6A and Section 21 markers from extraction');
    debugLog('early_s21_match', { hasForm6aFlag, hasSection21Flag, hasForm6aMarker, hasSection21Marker });
    return {
      docType: 'notice_s21',
      confidence: 0.92,
      reasons,
      strongMarkersFound: ['form 6a', 'section 21'],
    };
  }

  if (hasSection21Flag || hasSection21Marker || hasForm6aFlag || hasForm6aMarker) {
    reasons.push('Detected Section 21 / Form 6A markers from extraction');
    return {
      docType: 'notice_s21',
      confidence: 0.85,
      reasons,
      strongMarkersFound: hasForm6aFlag || hasForm6aMarker ? ['form 6a'] : ['section 21'],
    };
  }

  if (hasSection8Flag || hasSection8Marker) {
    reasons.push('Detected Section 8 / Form 3 markers from extraction');
    return {
      docType: 'notice_s8',
      confidence: 0.85,
      reasons,
      strongMarkersFound: ['section 8'],
    };
  }

  if (hasWalesFlag || hasWalesMarker) {
    reasons.push('Detected Wales RHW notice markers from extraction');
    return {
      docType: 'wales_notice',
      confidence: 0.85,
      reasons,
      strongMarkersFound: ['wales rhw'],
    };
  }

  if (hasScotlandFlag || hasScotlandMarker) {
    reasons.push('Detected Scotland Notice to Leave markers from extraction');
    return {
      docType: 'scotland_notice_to_leave',
      confidence: 0.85,
      reasons,
      strongMarkersFound: ['notice to leave'],
    };
  }

  if (hasTenancyMarker) {
    reasons.push('Detected tenancy agreement markers from extraction');
    return {
      docType: 'tenancy_agreement',
      confidence: 0.80,
      reasons,
      strongMarkersFound: ['tenancy agreement'],
    };
  }

  // Check extraction quality - if we failed to extract content and have a UUID filename,
  // we should strongly trust the category hint
  const hasLimitedContent = !input.extractedText || input.extractedText.length < 50;
  const isUuidFilename = isUuidLikeFilename(input.fileName || '');
  const extractionFailed = input.extractionQuality?.text_extraction_method === 'failed' ||
    (input.extractionQuality && !input.extractionQuality.llm_extraction_ran &&
     input.extractionQuality.regex_fields_found === 0);

  debugLog('quality_check', {
    hasLimitedContent,
    isUuidFilename,
    extractionFailed,
  });

  // If we have a valid category hint and extraction quality was poor, trust the hint immediately
  if (input.categoryHint && KNOWN_CATEGORY_HINTS.has(input.categoryHint)) {
    if ((hasLimitedContent && isUuidFilename) || extractionFailed) {
      reasons.push(`Using validator context: ${input.categoryHint}`);
      reasons.push('Content extraction was limited; trusting upload context');
      debugLog('using_category_hint_early', { hint: input.categoryHint, reason: 'limited_extraction' });
      return {
        docType: input.categoryHint,
        confidence: 0.70, // Good confidence - user explicitly chose this validator
        reasons,
        usedCategoryHint: true,
      };
    }
  }

  // First, check for strong marker combinations (high-confidence patterns)
  const strongMatch = findStrongMarkerMatch(text);
  if (strongMatch) {
    reasons.push(`Strong match: ${strongMatch.description}`);
    reasons.push(...strongMatch.markersFound.map((m) => `Matched marker: "${m}"`));
    debugLog('strong_match', { docType: strongMatch.docType, confidence: strongMatch.confidence });
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
    // Normalize keywords the same way we normalize text (handle hyphens, etc.)
    const matched = rule.keywords.filter((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return text.includes(normalizedKeyword);
    });
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

  debugLog('keyword_match', { docType: bestMatch.docType, score: bestMatch.score });

  // If keyword matching found "other" or has very weak match (score <= 1), use category hint
  if ((bestMatch.docType === 'other' || bestMatch.score <= 1) && input.categoryHint) {
    if (KNOWN_CATEGORY_HINTS.has(input.categoryHint)) {
      reasons.push(`Using validator context: ${input.categoryHint}`);
      if (bestMatch.score === 0) {
        reasons.push('No keywords matched in document');
      } else {
        reasons.push(`Weak keyword match only (score: ${bestMatch.score})`);
      }
      debugLog('using_category_hint', { hint: input.categoryHint, originalScore: bestMatch.score });
      return {
        docType: input.categoryHint,
        confidence: 0.70, // Good confidence - user chose this validator context
        reasons,
        usedCategoryHint: true,
      };
    }
  }

  if (bestMatch.docType === 'other') {
    reasons.push('No strong keyword match found.');
  } else {
    reasons.push(...bestMatch.reasons);
  }

  // Improved confidence: base 0.25, +0.18 per match, max 0.85 for keyword-only
  let confidence = bestMatch.score === 0 ? 0.2 : Math.min(0.85, 0.25 + 0.18 * bestMatch.score);

  // Boost confidence if category hint matches the detected type
  if (input.categoryHint && input.categoryHint === bestMatch.docType && confidence < 0.85) {
    confidence = Math.min(0.88, confidence + 0.15);
    reasons.push('Confidence boosted by matching validator context');
    debugLog('confidence_boost', { newConfidence: confidence });
  }

  debugLog('final_result', { docType: bestMatch.docType, confidence, reasons });

  return {
    docType: bestMatch.docType,
    confidence,
    reasons,
  };
}
