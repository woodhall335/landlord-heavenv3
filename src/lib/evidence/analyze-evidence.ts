import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { getOpenAIClient } from '@/lib/ai/openai-client';
import { isPdfMimeType, isImageMimeType } from '@/lib/evidence/schema';
import { PDFDocument } from 'pdf-lib';
import {
  extractPdfText,
  analyzeTextForDocumentMarkers,
  LOW_TEXT_THRESHOLD,
  type PdfExtractionResult,
} from './extract-pdf-text';

// Debug logging helper - controlled by DEBUG_EVIDENCE env var
const DEBUG = process.env.DEBUG_EVIDENCE === 'true';
function debugLog(label: string, data: any, debugId?: string): void {
  if (DEBUG) {
    const prefix = debugId ? `[DEBUG_EVIDENCE][${debugId}][${label}]` : `[DEBUG_EVIDENCE][${label}]`;
    console.log(prefix, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

/**
 * Heuristic to determine if a string looks like a plausible human name.
 * Used to filter out sentence fragments that get incorrectly extracted as names.
 *
 * @param value - The string to check
 * @returns true if it looks like a name, false otherwise
 */
export function isNameLike(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false;

  const trimmed = value.trim();

  // Reject if too short or too long
  if (trimmed.length < 2 || trimmed.length > 80) return false;

  // Reject if contains newlines
  if (trimmed.includes('\n') || trimmed.includes('\r')) return false;

  // Reject if it's obviously a sentence (contains common verbs/sentence words)
  const sentenceIndicators = [
    'intends', 'begin', 'proceedings', 'possession', 'property', 'identified',
    'section', 'notice', 'tenant', 'landlord', 'pursuant', 'hereby', 'whereas',
    'therefore', 'housing', 'act', 'ground', 'arrears', 'rent', 'shall', 'will',
    'must', 'should', 'may', 'can', 'the', 'this', 'that', 'which', 'under',
    'above', 'below', 'within', 'without', 'between', 'through', 'during',
    'before', 'after', 'against', 'into', 'onto', 'from', 'with', 'about',
    'being', 'having', 'doing', 'requiring', 'seeking', 'giving', 'served',
    'dated', 'signed', 'issued', 'received', 'delivered', 'provide', 'provided',
  ];

  const lowerTrimmed = trimmed.toLowerCase();
  const words = lowerTrimmed.split(/\s+/);

  // Count how many sentence indicator words are present
  let indicatorCount = 0;
  for (const word of words) {
    if (sentenceIndicators.includes(word)) {
      indicatorCount++;
    }
  }

  // If more than 2 sentence indicators, it's probably not a name
  if (indicatorCount > 2) return false;

  // Reject if first word is a common sentence starter (lowercase)
  const sentenceStarters = ['the', 'this', 'that', 'a', 'an', 'and', 'or', 'if', 'when', 'where', 'which', 'who'];
  if (words.length > 0 && sentenceStarters.includes(words[0])) return false;

  // Reject if has too many words (names typically 1-5 words)
  if (words.length > 6) return false;

  // Reject if contains typical legal/document patterns
  const documentPatterns = [
    /\bsection\s*\d/i,
    /\bground\s*\d/i,
    /\bform\s*\d/i,
    /\bclause\s*\d/i,
    /\bschedule\s*\d/i,
    /\bparagraph\s*\d/i,
    /housing\s*act/i,
    /\d{4}/, // Year numbers - names rarely contain years
    /£\d/, // Currency amounts
    /\d+\.\d+/, // Decimal numbers
  ];
  for (const pattern of documentPatterns) {
    if (pattern.test(trimmed)) return false;
  }

  // A valid name should have at least one word that starts with uppercase
  // (unless it's all lowercase - some forms may have names in lowercase)
  const hasProperNoun = /[A-Z][a-z]/.test(trimmed);
  const allLower = trimmed === lowerTrimmed;

  // If it's mixed case but no proper noun pattern, likely not a name
  if (!hasProperNoun && !allLower) return false;

  // Names are typically 1-5 words, each word being relatively short
  const maxWordLength = Math.max(...words.map(w => w.length));
  if (maxWordLength > 25) return false; // Individual name parts shouldn't be this long

  return true;
}

/** Master timeout for entire analysis (30s) - prevents infinite hangs */
const ANALYSIS_MASTER_TIMEOUT_MS = 30000;

/** Hard timeout for OpenAI LLM calls (10s) - allows fallback to regex */
const LLM_CALL_TIMEOUT_MS = 10000;

/** Hard timeout for Level A validation calls (8s) - uses GPT-4o-mini for speed */
const LEVEL_A_CALL_TIMEOUT_MS = 8000;

/** Maximum characters to send to LLM - prevents slow responses on large docs */
const LLM_MAX_TEXT_CHARS = 6000;

/**
 * Analysis stages for observability
 */
type AnalysisStage =
  | 'init'
  | 'buffer_load'
  | 'pdf_parse'
  | 'pdf_parse_complete'
  | 'regex_start'
  | 'regex_complete'
  | 'llm_start'
  | 'llm_complete'
  | 'llm_error'
  | 'llm_timeout'
  | 'vision_start'
  | 'vision_complete'
  | 'vision_error'
  | 'vision_timeout'
  | 'classify_start'
  | 'classify_complete'
  | 'validate_start'
  | 'validate_complete'
  | 'result_merge'
  | 'complete'
  | 'timeout'
  | 'error';

/**
 * Log stage transition with timing
 */
function logStage(
  stage: AnalysisStage,
  debugId: string,
  details?: Record<string, any>,
  startTime?: number
): void {
  const elapsed = startTime ? Date.now() - startTime : 0;
  const message = {
    stage,
    debug_id: debugId,
    elapsed_ms: elapsed,
    ...details,
  };
  console.log(`[analyzeEvidence][${stage}]`, JSON.stringify(message));
}

export interface EvidenceAnalysisInput {
  storageBucket: string;
  storagePath: string;
  mimeType: string;
  filename: string;
  caseId: string;
  questionId?: string | null;
  category?: string | null;
  signedUrl?: string | null;
  fileBuffer?: Buffer | null;
  openAIClient?: ReturnType<typeof getOpenAIClient> | null;
  /** Validator key for context-specific extraction (e.g., 'tenancy_agreement', 'section_21') */
  validatorKey?: string | null;
  /** Jurisdiction for context-specific rules */
  jurisdiction?: string | null;
  /** Correlation ID for tracing (auto-generated if not provided) */
  debugId?: string | null;
}

export interface ExtractionQualityMeta {
  text_extraction_method: 'pdf_parse' | 'pdf_lib' | 'pdf_lib_metadata' | 'vision' | 'regex_only' | 'failed';
  text_length: number;
  regex_fields_found: number;
  llm_extraction_ran: boolean;
  llm_extraction_skipped_reason?: string;
  confidence_breakdown?: Record<string, number>;
  /** True if text extraction returned very little usable text (likely scanned PDF) */
  is_low_text?: boolean;
  /** True if text appears to be metadata only (no actual document content) */
  is_metadata_only?: boolean;
  /** Document markers found in extracted text */
  document_markers?: string[];
}

export interface EvidenceAnalysisResult {
  detected_type: string;
  extracted_fields: Record<string, any>;
  confidence: number;
  warnings: string[];
  raw_text?: string;
  source?: 'pdf_text' | 'vision' | 'image' | 'regex';
  extraction_quality?: ExtractionQualityMeta;
  /** Correlation ID for tracing */
  debug_id?: string;
  /** Stage where analysis ended (for debugging failures) */
  final_stage?: AnalysisStage;
  /** Total analysis duration in ms */
  duration_ms?: number;
}

/**
 * Level A validation result - structure validity + follow-up questions
 * Used by validators in Level A mode where no evidence uploads are required
 */
export interface LevelAValidationResult {
  /** Whether the notice structure appears valid based on text alone */
  structure_validity: 'valid' | 'likely_valid' | 'unclear' | 'invalid';
  /** Reason for the structure validity assessment */
  structure_reason: string;
  /** Key fields extracted from the notice */
  extracted_fields: {
    property_address?: string | null;
    tenant_names?: string[] | null;
    landlord_name?: string | null;
    service_date?: string | null;
    expiry_date?: string | null;
    grounds_cited?: number[] | null;
    arrears_amount_stated?: number | null;
    notice_type?: string | null;
    form_detected?: string | null;
    signature_present?: boolean | null;
  };
  /** Follow-up questions to clarify facts not determinable from the notice */
  follow_up_questions: Array<{
    fact_key: string;
    question: string;
    reason: string;
  }>;
  /** Warnings about issues found in the notice */
  warnings: string[];
  /** Confidence in the overall assessment (0-1) */
  confidence: number;
}

/**
 * Level A prompt for Section 21 notice validation
 */
const LEVEL_A_S21_PROMPT = `You are a UK landlord-tenant legal document analyzer specializing in Section 21 (Form 6A) notices.

TASK: Analyze this Section 21 notice and provide:
1. Structure validity assessment based strictly on the notice text
2. Extract key fields
3. Generate follow-up questions for compliance facts NOT determinable from the notice

STRUCTURE VALIDITY RULES:
- "valid": Notice is Section 21 Form 6A, has all required fields, dates look correct
- "likely_valid": Appears to be S21/Form 6A but some fields unclear or dates need checking
- "unclear": Cannot determine if this is a valid Section 21 notice
- "invalid": Wrong form type (e.g., Section 8), obviously defective, or not a possession notice

FOLLOW-UP QUESTIONS: Only ask about compliance facts that CANNOT be determined from the notice itself. Typical questions:
- Deposit protection (scheme, timing)
- Prescribed information service
- Gas safety certificate provision
- EPC provision
- How to Rent guide provision
- Property licensing compliance
- Tenancy periodic/fixed-term status

DO NOT ASK about facts that ARE visible in the notice (dates, names, address).

Return ONLY valid JSON with this exact structure:
{
  "structure_validity": "valid" | "likely_valid" | "unclear" | "invalid",
  "structure_reason": "Brief explanation of validity assessment",
  "extracted_fields": {
    "property_address": "Full address or null",
    "tenant_names": ["Name1", "Name2"] or null,
    "landlord_name": "Name or null",
    "service_date": "YYYY-MM-DD or null",
    "expiry_date": "YYYY-MM-DD or null",
    "notice_type": "section_21" | "section_8" | "other" | null,
    "form_detected": "form_6a" | "form_3" | null,
    "signature_present": true | false | null
  },
  "follow_up_questions": [
    {
      "fact_key": "deposit_protected_within_30_days",
      "question": "Was the tenant deposit protected in an approved scheme within 30 days?",
      "reason": "Cannot determine from notice - required for S21 validity"
    }
  ],
  "warnings": ["Any issues found in the notice structure"],
  "confidence": 0.85
}`;

/**
 * Level A prompt for Section 8 notice validation
 */
const LEVEL_A_S8_PROMPT = `You are a UK landlord-tenant legal document analyzer specializing in Section 8 (Form 3) notices.

TASK: Analyze this Section 8 notice and provide:
1. Structure validity assessment based strictly on the notice text
2. Extract key fields including grounds cited and arrears
3. Generate follow-up questions for facts NOT determinable from the notice

STRUCTURE VALIDITY RULES:
- "valid": Notice is Section 8 Form 3, grounds properly cited, dates/amounts clear
- "likely_valid": Appears to be S8/Form 3 but some details unclear
- "unclear": Cannot determine if this is a valid Section 8 notice
- "invalid": Wrong form type (e.g., Section 21), no grounds cited, or not a possession notice

FOLLOW-UP QUESTIONS: Only ask about facts that CANNOT be determined from the notice:
- Current arrears amount (if not stated or may have changed)
- Rent frequency (if not clear)
- Rent amount (if not stated)
- Whether arrears will remain above threshold at hearing
- Any payments made since notice

DO NOT ASK about facts visible in the notice (grounds, dates, stated arrears).

Return ONLY valid JSON with this exact structure:
{
  "structure_validity": "valid" | "likely_valid" | "unclear" | "invalid",
  "structure_reason": "Brief explanation of validity assessment",
  "extracted_fields": {
    "property_address": "Full address or null",
    "tenant_names": ["Name1"] or null,
    "landlord_name": "Name or null",
    "service_date": "YYYY-MM-DD or null",
    "expiry_date": "YYYY-MM-DD or null",
    "grounds_cited": [8, 10, 11] or null,
    "arrears_amount_stated": 2500.00 or null,
    "notice_type": "section_8" | "section_21" | "other" | null,
    "form_detected": "form_3" | "form_6a" | null
  },
  "follow_up_questions": [
    {
      "fact_key": "arrears_above_threshold_today",
      "question": "Is the rent arrears currently above the Ground 8 threshold?",
      "reason": "Arrears may have changed since notice was served"
    }
  ],
  "warnings": ["Any issues found in the notice structure"],
  "confidence": 0.85
}`;

/**
 * Run Level A validation extraction using GPT-4o-mini
 * This provides fast extraction + assessment in a single call
 */
export async function runLevelAExtraction(params: {
  text: string;
  validatorKey: 'section_21' | 'section_8';
  client: ReturnType<typeof getOpenAIClient>;
  debugId?: string;
}): Promise<LevelAValidationResult> {
  const { text, validatorKey, client, debugId } = params;
  const startTime = Date.now();

  // Select prompt based on validator type
  const systemPrompt = validatorKey === 'section_21' ? LEVEL_A_S21_PROMPT : LEVEL_A_S8_PROMPT;

  // Trim text for LLM processing
  const trimmedText = trimTextForLLM(text, LLM_MAX_TEXT_CHARS);

  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort();
  }, LEVEL_A_CALL_TIMEOUT_MS);

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `NOTICE TEXT:\n${trimmedText}` },
      ],
    } as any, { signal: abortController.signal });

    clearTimeout(timeoutHandle);

    const duration = Date.now() - startTime;
    debugLog('level_a_extraction_complete', { duration_ms: duration, debugId });

    const raw = response.choices[0]?.message?.content ?? '{}';
    return parseLevelAResult(raw, validatorKey);
  } catch (error: any) {
    clearTimeout(timeoutHandle);

    const duration = Date.now() - startTime;
    const isAborted = error.name === 'AbortError' || abortController.signal.aborted;
    const isTimeout = isAborted || duration >= LEVEL_A_CALL_TIMEOUT_MS - 100;

    if (isTimeout) {
      console.error(`[runLevelAExtraction] Timed out after ${duration}ms`);
    } else {
      console.error('[runLevelAExtraction] Failed:', error.message);
    }

    // Return fallback result
    return {
      structure_validity: 'unclear',
      structure_reason: isTimeout ? 'Analysis timed out' : `Analysis failed: ${error.message}`,
      extracted_fields: {},
      follow_up_questions: getDefaultFollowUpQuestions(validatorKey),
      warnings: [isTimeout ? 'Analysis timed out - manual review recommended' : error.message],
      confidence: 0.1,
    };
  }
}

/**
 * Parse Level A extraction result from LLM response
 */
function parseLevelAResult(raw: string, validatorKey: 'section_21' | 'section_8'): LevelAValidationResult {
  // Clean up potential markdown code blocks
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);

    // Validate structure_validity
    const validStatuses = ['valid', 'likely_valid', 'unclear', 'invalid'];
    const structure_validity = validStatuses.includes(parsed.structure_validity)
      ? parsed.structure_validity
      : 'unclear';

    return {
      structure_validity,
      structure_reason: parsed.structure_reason || 'No reason provided',
      extracted_fields: parsed.extracted_fields || {},
      follow_up_questions: Array.isArray(parsed.follow_up_questions)
        ? parsed.follow_up_questions
        : getDefaultFollowUpQuestions(validatorKey),
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
    };
  } catch (error) {
    console.error('[parseLevelAResult] Failed to parse JSON:', cleaned.slice(0, 200));
    return {
      structure_validity: 'unclear',
      structure_reason: 'Failed to parse analysis result',
      extracted_fields: {},
      follow_up_questions: getDefaultFollowUpQuestions(validatorKey),
      warnings: ['Analysis result could not be parsed'],
      confidence: 0.1,
    };
  }
}

/**
 * Get default follow-up questions for a validator when extraction fails
 */
function getDefaultFollowUpQuestions(validatorKey: 'section_21' | 'section_8'): Array<{
  fact_key: string;
  question: string;
  reason: string;
}> {
  if (validatorKey === 'section_21') {
    return [
      {
        fact_key: 'deposit_protected_within_30_days',
        question: 'Was the tenant deposit protected in an approved scheme within 30 days of receipt?',
        reason: 'Required for valid Section 21 notice',
      },
      {
        fact_key: 'prescribed_info_within_30_days',
        question: 'Was prescribed information about the deposit served within 30 days?',
        reason: 'Required for valid Section 21 notice',
      },
      {
        fact_key: 'gas_safety_before_move_in',
        question: 'Was a valid gas safety certificate provided before move-in?',
        reason: 'Required compliance document',
      },
      {
        fact_key: 'epc_provided_to_tenant',
        question: 'Was a valid EPC provided to the tenant?',
        reason: 'Required compliance document',
      },
      {
        fact_key: 'how_to_rent_guide_provided',
        question: 'Was the "How to Rent" guide provided to the tenant?',
        reason: 'Required for tenancies starting after Oct 2015',
      },
    ];
  } else {
    return [
      {
        fact_key: 'arrears_above_threshold_today',
        question: 'Is the rent arrears currently above the Ground 8 threshold?',
        reason: 'Arrears must be above threshold at notice AND hearing',
      },
      {
        fact_key: 'arrears_likely_at_hearing',
        question: 'Is the arrears likely to remain above threshold at court hearing?',
        reason: 'Courts check arrears on hearing date',
      },
      {
        fact_key: 'rent_frequency_confirmed',
        question: 'What is the rent payment frequency (weekly/monthly)?',
        reason: 'Determines Ground 8 threshold calculation',
      },
      {
        fact_key: 'rent_amount_confirmed',
        question: 'What is the rent amount per period?',
        reason: 'Needed to calculate Ground 8 threshold',
      },
    ];
  }
}

const AnalysisSchema = z.object({
  detected_type: z.string().min(1),
  extracted_fields: z.record(z.any()).default({}),
  confidence: z.number().min(0).max(1).default(0.2),
  warnings: z.array(z.string()).default([]),
});

const MAX_TEXT_CHARS = 6000;
// Use the threshold from extract-pdf-text module for consistency
const MIN_TEXT_LENGTH = LOW_TEXT_THRESHOLD;

/**
 * Trim text intelligently for LLM processing.
 * Prefers to keep the beginning of the document where Form markers typically appear.
 * Avoids cutting mid-sentence if possible.
 */
function trimTextForLLM(text: string, maxChars: number = LLM_MAX_TEXT_CHARS): string {
  if (text.length <= maxChars) {
    return text;
  }

  // Look for key form markers in the text
  const formMarkers = [
    /form\s*6a/i,
    /form\s*3\b/i,
    /section\s*21/i,
    /section\s*8/i,
    /notice\s*requiring\s*possession/i,
    /notice\s*seeking\s*possession/i,
    /housing\s*act\s*1988/i,
  ];

  // Find the position of key markers
  let lastMarkerPos = 0;
  for (const marker of formMarkers) {
    const match = marker.exec(text);
    if (match && match.index !== undefined) {
      lastMarkerPos = Math.max(lastMarkerPos, match.index + match[0].length);
    }
  }

  // Ensure we capture at least to the last marker + 1000 chars for context
  const minInclude = Math.min(lastMarkerPos + 1000, text.length);

  // If markers are early, just take first maxChars
  // If markers are beyond maxChars, prioritize including them
  let cutPoint = maxChars;
  if (lastMarkerPos > maxChars * 0.7) {
    // Markers are late in the text - include them even if it means less trailing content
    cutPoint = Math.max(maxChars, minInclude);
  }

  // Find a good break point (paragraph or sentence)
  let breakPoint = cutPoint;
  const searchStart = Math.max(0, cutPoint - 200);
  const searchRegion = text.slice(searchStart, cutPoint);

  // Look for paragraph break
  const paragraphBreak = searchRegion.lastIndexOf('\n\n');
  if (paragraphBreak > 0) {
    breakPoint = searchStart + paragraphBreak;
  } else {
    // Look for sentence break
    const sentenceBreak = searchRegion.lastIndexOf('. ');
    if (sentenceBreak > 0) {
      breakPoint = searchStart + sentenceBreak + 1;
    }
  }

  return text.slice(0, breakPoint).trim();
}

/**
 * Validator-specific extraction instructions for compliance checks.
 * These prompts tell the AI what specific fields to look for based on the validator.
 */
const VALIDATOR_PROMPTS: Record<string, string> = {
  section_21: `
SECTION 21 NOTICE ANALYSIS:
You MUST extract these specific fields in extracted_fields:

NOTICE DETAILS:
- notice_type: should contain "section 21" or "s21" or "Form 6A"
- date_served: date notice was served (YYYY-MM-DD) - ALSO output as "service_date" with same value
- service_date: same as date_served (for compatibility)
- expiry_date: when notice expires (YYYY-MM-DD)
- property_address: full property address
- tenant_names: array of all tenant names on notice
- landlord_name: landlord name
- signature_present: true/false - is notice signed?

COMPLIANCE MENTIONS (look for statements about):
- deposit_protected: true/false - does notice mention deposit protection?
- prescribed_info_served: true/false - mentions prescribed information given?
- gas_safety_mentioned: true/false - references gas safety certificate?
- epc_mentioned: true/false - references EPC?
- how_to_rent_mentioned: true/false - references "How to Rent" guide?
- form_6a_used: true/false - is this the correct Form 6A?

IMPORTANT: Always output BOTH date_served AND service_date with the same value for compatibility.
`,

  section_8: `
SECTION 8 NOTICE ANALYSIS:
You MUST extract these specific fields in extracted_fields:

NOTICE DETAILS:
- notice_type: should contain "section 8" or "s8" or "Form 3"
- grounds_cited: array of ground numbers cited (e.g., [8, 10, 11])
- date_served: date notice was served (YYYY-MM-DD)
- notice_period: notice period given (e.g., "2 weeks", "2 months")
- expiry_date: when notice expires (YYYY-MM-DD)
- property_address: full property address
- tenant_names: tenant names
- tenant_details: any additional tenant info

ARREARS INFO (for Ground 8):
- rent_arrears_stated: amount of arrears claimed (number)
- rent_amount: periodic rent amount
- rent_frequency: "weekly" | "monthly" | "quarterly"
- arrears_period: period arrears cover

GROUND ANALYSIS:
- mandatory_grounds: array of mandatory grounds (1, 2, 5, 6, 7, 7A, 7B, 8)
- discretionary_grounds: array of discretionary grounds (9-17)
`,
};

/**
 * Build an AI extraction prompt with validator-specific instructions
 */
function buildPrompt(context: {
  filename: string;
  mimeType: string;
  category?: string | null;
  questionId?: string | null;
  caseId: string;
  validatorKey?: string | null;
  jurisdiction?: string | null;
  extra?: string;
}): string {
  const { filename, mimeType, category, questionId, caseId, validatorKey, jurisdiction, extra } = context;

  // Base prompt
  let prompt = `You are a UK landlord-tenant document extraction assistant specializing in legal compliance analysis.\n\n` +
    `Return ONLY valid JSON with keys: detected_type, extracted_fields, confidence, warnings.\n` +
    `Document types (detected_type) must be one of: tenancy, s21_notice, s8_notice, rent_schedule, bank_statement, arrears_ledger, correspondence, gas_safety_certificate, epc, deposit_certificate, prescribed_info, how_to_rent, other.\n\n`;

  // Add validator-specific instructions
  if (validatorKey && VALIDATOR_PROMPTS[validatorKey]) {
    prompt += VALIDATOR_PROMPTS[validatorKey] + '\n\n';
  }

  // Add jurisdiction context
  if (jurisdiction) {
    prompt += `JURISDICTION: ${jurisdiction.toUpperCase()}\n`;
    prompt += `Apply ${jurisdiction}-specific rules when analyzing.\n\n`;
  }

  // Add file context
  prompt += `DOCUMENT CONTEXT:\n`;
  prompt += `- Case: ${caseId}\n`;
  prompt += `- Question: ${questionId ?? 'unknown'}\n`;
  prompt += `- Category: ${category ?? 'unspecified'}\n`;
  prompt += `- Filename: ${filename}\n`;
  prompt += `- Type: ${mimeType}\n`;

  if (extra) {
    prompt += `\n${extra}`;
  }

  prompt += `\n\nIMPORTANT: Extract ALL compliance-relevant fields. Set boolean fields to true/false based on what you find in the document. If unsure about a field, set it to null rather than guessing.`;

  return prompt;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function loadBuffer(input: EvidenceAnalysisInput): Promise<Buffer> {
  if (input.fileBuffer) return input.fileBuffer;
  if (!input.signedUrl) {
    throw new Error('Signed URL missing for evidence fetch');
  }
  const response = await fetch(input.signedUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch evidence: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Extract text from PDF using pdf-lib (which is installed in package.json)
 * This is a basic extraction that gets text content where available.
 * For scanned PDFs, it will return minimal text and we fall back to vision.
 */
async function extractPdfTextWithPdfLib(buffer: Buffer): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      updateMetadata: false,
    });

    const pages = pdfDoc.getPages();
    const pageCount = Math.min(pages.length, 10); // Limit to first 10 pages

    debugLog('pdf_lib_load', { pageCount: pages.length, processingPages: pageCount });

    // pdf-lib doesn't have native text extraction, but we can check if it's a valid PDF
    // and extract what metadata we can
    const metadata: string[] = [];

    // Get title, author, subject from metadata
    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();
    const keywords = pdfDoc.getKeywords();

    if (title) metadata.push(`Title: ${title}`);
    if (author) metadata.push(`Author: ${author}`);
    if (subject) metadata.push(`Subject: ${subject}`);
    if (keywords) metadata.push(`Keywords: ${keywords}`);

    // Since pdf-lib doesn't extract text content, we return metadata only
    // The main text extraction will come from the regex patterns or vision
    return metadata.join('\n');
  } catch (error: any) {
    debugLog('pdf_lib_error', { error: error.message });
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}

/**
 * Regex-based extraction for Section 21 / Form 6A documents.
 * This runs even without LLM and provides baseline extraction.
 */
export interface RegexExtractionResult {
  form_6a_detected: boolean;
  section_21_detected: boolean;
  notice_type: string | null;
  date_served: string | null;
  expiry_date: string | null;
  property_address: string | null;
  tenant_names: string[];
  landlord_name: string | null;
  signature_present: boolean;
  housing_act_1988_mentioned: boolean;
  fields_found: string[];
}

export function extractS21FieldsWithRegex(text: string): RegexExtractionResult {
  const normalizedText = text.toLowerCase();
  const originalText = text; // Keep original case for name extraction

  const result: RegexExtractionResult = {
    form_6a_detected: false,
    section_21_detected: false,
    notice_type: null,
    date_served: null,
    expiry_date: null,
    property_address: null,
    tenant_names: [],
    landlord_name: null,
    signature_present: false,
    housing_act_1988_mentioned: false,
    fields_found: [],
  };

  // Form 6A detection (multiple patterns)
  const form6aPatterns = [
    /form\s*6a/i,
    /form\s*no\.?\s*6a/i,
    /prescribed\s*form\s*6a/i,
    /form\s*6a\s*notice/i,
  ];
  result.form_6a_detected = form6aPatterns.some(p => p.test(text));
  if (result.form_6a_detected) result.fields_found.push('form_6a_detected');

  // Section 21 detection
  const s21Patterns = [
    /section\s*21/i,
    /s\.?\s*21/i,
    /s21/i,
    /notice\s*requiring\s*possession/i,
  ];
  result.section_21_detected = s21Patterns.some(p => p.test(text));
  if (result.section_21_detected) result.fields_found.push('section_21_detected');

  // Housing Act 1988 mention
  result.housing_act_1988_mentioned = /housing\s*act\s*1988/i.test(text);
  if (result.housing_act_1988_mentioned) result.fields_found.push('housing_act_1988');

  // Set notice type based on detections
  if (result.form_6a_detected && result.section_21_detected) {
    result.notice_type = 'section_21_form_6a';
  } else if (result.section_21_detected) {
    result.notice_type = 'section_21';
  } else if (result.form_6a_detected) {
    result.notice_type = 'form_6a';
  }

  // Date patterns (UK format: DD/MM/YYYY or DD Month YYYY)
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g, // DD/MM/YYYY
    /(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/gi,
  ];

  const dates: string[] = [];
  for (const pattern of datePatterns) {
    let match;
    pattern.lastIndex = 0; // Reset to avoid stale state
    while ((match = pattern.exec(text)) !== null) {
      dates.push(match[0]);
    }
  }

  // Look for served/service date context
  const servedDatePatterns = [
    /(?:served|service|dated|issued)\s*(?:on|:)?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(?:date\s*of\s*(?:service|issue))[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
  ];
  for (const pattern of servedDatePatterns) {
    const match = pattern.exec(text);
    if (match) {
      result.date_served = match[1];
      result.fields_found.push('date_served');
      break;
    }
  }

  // Look for expiry date context
  const expiryDatePatterns = [
    /(?:expire|expiry|expiration|possession\s*after)\s*(?:on|:)?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(?:not\s*earlier\s*than|on\s*or\s*after)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\s*(?:or\s*thereafter)/i,
  ];
  for (const pattern of expiryDatePatterns) {
    const match = pattern.exec(text);
    if (match) {
      result.expiry_date = match[1];
      result.fields_found.push('expiry_date');
      break;
    }
  }

  // Property address extraction
  const addressPatterns = [
    /(?:property|premises|dwelling|address)[\s:]+([^\n]{10,80})/i,
    /(?:at|of)\s+(\d+[^\n,]+(?:,\s*[^\n]+)?(?:,\s*[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2})?)/i,
  ];
  for (const pattern of addressPatterns) {
    const match = pattern.exec(originalText);
    if (match) {
      const address = match[1].trim();
      // Validate it looks like an address (has numbers or postcode-like pattern)
      if (/\d/.test(address) || /[A-Z]{1,2}\d/.test(address)) {
        result.property_address = address;
        result.fields_found.push('property_address');
        break;
      }
    }
  }

  // Tenant name extraction
  const tenantPatterns = [
    /(?:tenant|tenants?)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
    /(?:to|addressed\s*to)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
    /(?:mr|mrs|ms|miss|dr)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  ];
  const tenantNamesSet = new Set<string>();
  for (const pattern of tenantPatterns) {
    let match;
    pattern.lastIndex = 0; // Reset to avoid stale state
    while ((match = pattern.exec(originalText)) !== null) {
      const name = match[1].trim();
      if (name.length >= 4 && name.length <= 60) {
        tenantNamesSet.add(name);
      }
    }
  }
  result.tenant_names = Array.from(tenantNamesSet);
  if (result.tenant_names.length > 0) result.fields_found.push('tenant_names');

  // Landlord name extraction - enhanced patterns for Form 6A signature blocks
  // Form 6A Section 3 typically has landlord name near signature area
  // NOTE: We use spaces (not \s) in name capture to avoid matching across lines
  const landlordPatterns = [
    // Pattern 1: Explicit "Landlord:" or "Landlord's name:" label (most reliable)
    /landlord['']?s?\s*(?:name)?\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 2: "Name of landlord" - common in official forms
    /name\s*(?:of\s+)?landlord['']?s?\s*[:=]?\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 3: "Signed by:" pattern (must have colon after "by")
    /signed\s+by\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 4: "Name:" near signature area (look for name after "3." or "signature" context)
    /(?:3\.|signature)\s*[\s\S]{0,50}name\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 5: "Print name:" pattern - common in signature blocks
    /print\s*name\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 6: After "on behalf of" followed by name
    /on\s+behalf\s+of\s+([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
  ];
  for (const pattern of landlordPatterns) {
    const match = pattern.exec(originalText);
    if (match) {
      const candidate = match[1].trim();
      // Validate that extracted value looks like a name
      if (isNameLike(candidate)) {
        result.landlord_name = candidate;
        result.fields_found.push('landlord_name');
        break;
      }
    }
  }

  // Signature detection
  const signaturePatterns = [
    /signature/i,
    /signed/i,
    /\[signed?\]/i,
    /landlord['']s?\s*signature/i,
  ];
  result.signature_present = signaturePatterns.some(p => p.test(text));
  if (result.signature_present) result.fields_found.push('signature_present');

  debugLog('regex_extraction', {
    form_6a: result.form_6a_detected,
    section_21: result.section_21_detected,
    fields_found: result.fields_found,
  });

  return result;
}

/**
 * Regex-based extraction for Section 8 / Form 3 documents.
 * Extracts grounds, arrears, dates, and tenant details.
 */
export interface S8RegexExtractionResult {
  form_3_detected: boolean;
  section_8_detected: boolean;
  notice_type: string | null;
  grounds_cited: number[];
  date_served: string | null;
  expiry_date: string | null;
  /** Section 8 Form 3 Section 5: "The court proceedings will not begin earlier than" */
  earliest_proceedings_date: string | null;
  notice_period: string | null;
  rent_arrears_stated: string | null;
  rent_amount: string | null;
  /** Rent payment frequency extracted from the notice */
  rent_frequency: string | null;
  property_address: string | null;
  tenant_names: string[];
  landlord_name: string | null;
  housing_act_1988_mentioned: boolean;
  fields_found: string[];
}

export function extractS8FieldsWithRegex(text: string): S8RegexExtractionResult {
  const originalText = text;

  const result: S8RegexExtractionResult = {
    form_3_detected: false,
    section_8_detected: false,
    notice_type: null,
    grounds_cited: [],
    date_served: null,
    expiry_date: null,
    earliest_proceedings_date: null,
    notice_period: null,
    rent_arrears_stated: null,
    rent_amount: null,
    rent_frequency: null,
    property_address: null,
    tenant_names: [],
    landlord_name: null,
    housing_act_1988_mentioned: false,
    fields_found: [],
  };

  // Form 3 detection
  const form3Patterns = [
    /form\s*3\b/i,
    /form\s*no\.?\s*3\b/i,
    /notice\s*seeking\s*possession/i,
  ];
  result.form_3_detected = form3Patterns.some(p => p.test(text));
  if (result.form_3_detected) result.fields_found.push('form_3_detected');

  // Section 8 detection
  const s8Patterns = [
    /section\s*8/i,
    /s\.?\s*8\b/i,
    /\bs8\b/i,
  ];
  result.section_8_detected = s8Patterns.some(p => p.test(text));
  if (result.section_8_detected) result.fields_found.push('section_8_detected');

  // Housing Act 1988 mention
  result.housing_act_1988_mentioned = /housing\s*act\s*1988/i.test(text);
  if (result.housing_act_1988_mentioned) result.fields_found.push('housing_act_1988');

  // Set notice type
  if (result.form_3_detected || result.section_8_detected) {
    result.notice_type = 'section_8';
  }

  // Extract grounds cited (Ground 1-17)
  // Enhanced patterns to handle multiple formats:
  // - "Ground 8", "Ground 10 and 11"
  // - "Grounds 8, 10 and 11"
  // - "Ground 8 and Ground 10"
  // - "Mandatory grounds: 8" / "Discretionary grounds: 9, 10"
  // - "Schedule 2 Ground 8"
  // IMPORTANT: All patterns with 'g' flag must reset lastIndex before while loop
  const groundsSet = new Set<number>();

  // Pattern 1: Individual "Ground X" mentions (global - catches all individual mentions)
  const singleGroundPattern = /ground\s*(\d+)/gi;
  singleGroundPattern.lastIndex = 0;
  let match;
  while ((match = singleGroundPattern.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 17) {
      groundsSet.add(num);
    }
  }

  // Pattern 2: Schedule 2 ground references
  const scheduleGroundPattern = /schedule\s*2\s*ground\s*(\d+)/gi;
  scheduleGroundPattern.lastIndex = 0;
  while ((match = scheduleGroundPattern.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 17) {
      groundsSet.add(num);
    }
  }

  // Pattern 3: "Grounds 8, 10 and 11" or "Grounds: 8, 10, 11" list format
  const groundsListPattern = /grounds?\s*:?\s*([\d,\s]+(?:and\s*\d+)?)/gi;
  groundsListPattern.lastIndex = 0;
  while ((match = groundsListPattern.exec(text)) !== null) {
    const nums = match[1].match(/\d+/g);
    if (nums) {
      nums.forEach(n => {
        const num = parseInt(n, 10);
        if (num >= 1 && num <= 17) {
          groundsSet.add(num);
        }
      });
    }
  }

  // Pattern 4: "Mandatory grounds: X, Y" or "Discretionary grounds: X, Y"
  const categorizedGroundsPattern = /(?:mandatory|discretionary)\s*grounds?\s*:?\s*([\d,\s]+(?:and\s*\d+)?)/gi;
  categorizedGroundsPattern.lastIndex = 0;
  while ((match = categorizedGroundsPattern.exec(text)) !== null) {
    const nums = match[1].match(/\d+/g);
    if (nums) {
      nums.forEach(n => {
        const num = parseInt(n, 10);
        if (num >= 1 && num <= 17) {
          groundsSet.add(num);
        }
      });
    }
  }

  // Pattern 5: "Ground 8 and Ground 10" - explicit repeated Ground keyword
  const groundAndGroundPattern = /ground\s*(\d+)\s*(?:,\s*|\s+and\s+)(?:ground\s*)?(\d+)/gi;
  groundAndGroundPattern.lastIndex = 0;
  while ((match = groundAndGroundPattern.exec(text)) !== null) {
    const num1 = parseInt(match[1], 10);
    const num2 = parseInt(match[2], 10);
    if (num1 >= 1 && num1 <= 17) groundsSet.add(num1);
    if (num2 >= 1 && num2 <= 17) groundsSet.add(num2);
  }

  result.grounds_cited = Array.from(groundsSet).sort((a, b) => a - b);
  if (result.grounds_cited.length > 0) result.fields_found.push('grounds_cited');

  // Date patterns (UK format)
  const servedDatePatterns = [
    /(?:served|service|dated|issued)\s*(?:on|:)?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    /(?:date\s*of\s*(?:service|issue))[\s:]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
  ];
  for (const pattern of servedDatePatterns) {
    const match = pattern.exec(text);
    if (match) {
      result.date_served = match[1];
      result.fields_found.push('date_served');
      break;
    }
  }

  // Earliest proceedings date - Form 3 Section 5: "The court proceedings will not begin earlier than"
  // This is distinct from expiry_date - it's the earliest date court can begin
  const earliestProceedingsPatterns = [
    // Form 3 exact phrase: "The court proceedings will not begin earlier than: DD/MM/YYYY"
    /(?:proceedings?\s*will\s*not\s*begin\s*earlier\s*than|will\s*not\s*begin\s*(?:proceedings?\s*)?earlier\s*than)\s*[:;]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    // Alternative: "not earlier than DD/MM/YYYY"
    /(?:not\s*earlier\s*than)\s*[:;]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    // "proceedings after" pattern
    /(?:proceedings?\s*after)\s*(?:on|:)?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    // "on or after" pattern
    /(?:on\s*or\s*after)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
  ];
  for (const pattern of earliestProceedingsPatterns) {
    const match = pattern.exec(text);
    if (match) {
      result.earliest_proceedings_date = match[1];
      result.fields_found.push('earliest_proceedings_date');
      break;
    }
  }

  // Expiry/possession date (generic patterns, fallback)
  // Note: For S8, earliest_proceedings_date is preferred over expiry_date
  if (!result.earliest_proceedings_date) {
    const expiryDatePatterns = [
      /(?:expire|expiry|expiration)\s*(?:on|:)?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i,
    ];
    for (const pattern of expiryDatePatterns) {
      const match = pattern.exec(text);
      if (match) {
        result.expiry_date = match[1];
        result.fields_found.push('expiry_date');
        break;
      }
    }
  } else {
    // If we found earliest_proceedings_date, also set expiry_date for backwards compatibility
    result.expiry_date = result.earliest_proceedings_date;
  }

  // Notice period
  const noticePeriodPatterns = [
    /(?:notice\s*period|minimum\s*period)\s*(?:of|:)?\s*(\d+\s*(?:weeks?|months?|days?))/i,
    /(\d+)\s*(?:weeks?|months?)\s*(?:notice|period)/i,
    /(?:two|2)\s*weeks?\s*notice/i,
    /(?:two|2)\s*months?\s*notice/i,
  ];
  for (const pattern of noticePeriodPatterns) {
    const match = pattern.exec(text);
    if (match) {
      result.notice_period = match[0].trim();
      result.fields_found.push('notice_period');
      break;
    }
  }

  // Rent arrears amount
  const arrearsPatterns = [
    /(?:arrears|owed|outstanding|unpaid\s*rent)\s*(?:of|:)?\s*£?([\d,]+(?:\.\d{2})?)/i,
    /£([\d,]+(?:\.\d{2})?)\s*(?:arrears|owed|outstanding)/i,
    /(?:rent\s*arrears|amount\s*owed)\s*[:=]?\s*£?([\d,]+(?:\.\d{2})?)/i,
  ];
  for (const pattern of arrearsPatterns) {
    const match = pattern.exec(text);
    if (match) {
      result.rent_arrears_stated = match[1].replace(/,/g, '');
      result.fields_found.push('rent_arrears_stated');
      break;
    }
  }

  // Rent amount
  const rentPatterns = [
    /(?:rent|monthly\s*rent|periodic\s*rent)\s*(?:of|:)?\s*£?([\d,]+(?:\.\d{2})?)/i,
    /£([\d,]+(?:\.\d{2})?)\s*(?:per|a)\s*(?:month|week)/i,
  ];
  for (const pattern of rentPatterns) {
    const match = pattern.exec(text);
    if (match) {
      result.rent_amount = match[1].replace(/,/g, '');
      result.fields_found.push('rent_amount');
      break;
    }
  }

  // Rent frequency extraction - extract from text patterns like "per month", "monthly", etc.
  const frequencyPatterns = [
    // Pattern: "£X per month" or "£X a month" - extract "monthly"
    { pattern: /£[\d,]+(?:\.\d{2})?\s*(?:per|a)\s*month/i, value: 'monthly' },
    // Pattern: "£X per week" or "£X a week" - extract "weekly"
    { pattern: /£[\d,]+(?:\.\d{2})?\s*(?:per|a)\s*week/i, value: 'weekly' },
    // Pattern: "monthly rent" explicitly
    { pattern: /monthly\s*rent/i, value: 'monthly' },
    // Pattern: "weekly rent" explicitly
    { pattern: /weekly\s*rent/i, value: 'weekly' },
    // Pattern: "rent is payable monthly"
    { pattern: /rent\s*(?:is\s*)?payable\s*monthly/i, value: 'monthly' },
    // Pattern: "rent is payable weekly"
    { pattern: /rent\s*(?:is\s*)?payable\s*weekly/i, value: 'weekly' },
    // Pattern: "fortnightly rent"
    { pattern: /fortnightly\s*rent/i, value: 'fortnightly' },
    // Pattern: "quarterly rent"
    { pattern: /quarterly\s*rent/i, value: 'quarterly' },
    // Pattern: "2 months unpaid rent" -> implies monthly
    { pattern: /\d+\s*months?\s*(?:unpaid\s*)?rent/i, value: 'monthly' },
    // Pattern: "8 weeks rent" -> implies weekly
    { pattern: /\d+\s*weeks?\s*(?:unpaid\s*)?rent/i, value: 'weekly' },
  ];
  for (const { pattern, value } of frequencyPatterns) {
    if (pattern.test(text)) {
      result.rent_frequency = value;
      result.fields_found.push('rent_frequency');
      break;
    }
  }

  // Property address extraction (same as S21)
  const addressPatterns = [
    /(?:property|premises|dwelling|address)[\s:]+([^\n]{10,80})/i,
    /(?:at|of)\s+(\d+[^\n,]+(?:,\s*[^\n]+)?(?:,\s*[A-Z]{1,2}\d{1,2}\s*\d[A-Z]{2})?)/i,
  ];
  for (const pattern of addressPatterns) {
    const match = pattern.exec(originalText);
    if (match) {
      const address = match[1].trim();
      if (/\d/.test(address) || /[A-Z]{1,2}\d/.test(address)) {
        result.property_address = address;
        result.fields_found.push('property_address');
        break;
      }
    }
  }

  // Tenant name extraction
  const tenantPatterns = [
    /(?:tenant|tenants?)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
    /(?:to|addressed\s*to)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g,
    /(?:mr|mrs|ms|miss|dr)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
  ];
  const tenantNamesSet = new Set<string>();
  for (const pattern of tenantPatterns) {
    let match;
    pattern.lastIndex = 0; // Reset to avoid stale state
    while ((match = pattern.exec(originalText)) !== null) {
      const name = match[1].trim();
      if (name.length >= 4 && name.length <= 60) {
        tenantNamesSet.add(name);
      }
    }
  }
  result.tenant_names = Array.from(tenantNamesSet);
  if (result.tenant_names.length > 0) result.fields_found.push('tenant_names');

  // Landlord name extraction - enhanced patterns for Form 3 signature blocks
  // Form 3 Section 7 typically has: "Name(s) of landlord(s)/licensor(s)" followed by signature/name
  // NOTE: We use spaces (not \s) in name capture to avoid matching across lines
  const landlordPatterns = [
    // Pattern 1: Explicit "Landlord:" or "Landlord's name:" label (most reliable)
    /landlord['']?s?\s*(?:name)?\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 2: "Name of landlord" - common in Form 3 section 7
    /name\s*(?:of\s+)?landlord['']?s?\s*[:=]?\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 3: "Signed by:" pattern (must have colon after "by")
    /signed\s+by\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 4: "Name:" near signature area (look for name after "7." or "signature" context)
    /(?:7\.|signature)\s*[\s\S]{0,50}name\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 5: "Print name:" pattern - common in signature blocks
    /print\s*name\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 6: Name near "or their agent" - common in Form 3
    /([A-Z][a-z]+(?: [A-Z][a-z]+)+)\s*\(or\s+(?:their|his|her)\s+agent\)/,
    // Pattern 7: "Licensor:" pattern (Form 3 also covers licenses)
    /licensor['']?s?\s*(?:name)?\s*[:=]\s*([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
    // Pattern 8: After "on behalf of" followed by name
    /on\s+behalf\s+of\s+([A-Z][a-z]+(?: [A-Z][a-z]+)*)/i,
  ];

  for (const pattern of landlordPatterns) {
    const match = pattern.exec(originalText);
    if (match) {
      const candidate = match[1].trim();
      // Validate that extracted value looks like a name
      if (isNameLike(candidate)) {
        result.landlord_name = candidate;
        result.fields_found.push('landlord_name');
        break;
      }
    }
  }

  debugLog('s8_regex_extraction', {
    section_8: result.section_8_detected,
    grounds: result.grounds_cited,
    fields_found: result.fields_found,
  });

  return result;
}


/**
 * Convert S21 regex extraction result to extracted_fields format
 */
function s21RegexToExtractedFields(regex: RegexExtractionResult): Record<string, any> {
  const fields: Record<string, any> = {};

  if (regex.notice_type) {
    fields.notice_type = regex.notice_type;
  }
  if (regex.form_6a_detected) {
    fields.form_6a_used = true;
  }
  if (regex.section_21_detected) {
    fields.section_21_detected = true;
  }
  if (regex.date_served) {
    // Output both date_served and service_date for compatibility
    fields.date_served = regex.date_served;
    fields.service_date = regex.date_served;
  }
  if (regex.expiry_date) {
    fields.expiry_date = regex.expiry_date;
  }
  if (regex.property_address) {
    fields.property_address = regex.property_address;
  }
  if (regex.tenant_names.length > 0) {
    fields.tenant_names = regex.tenant_names;
    // Also output as tenant_name for validators that expect singular
    fields.tenant_name = regex.tenant_names[0];
  }
  if (regex.landlord_name) {
    fields.landlord_name = regex.landlord_name;
  }
  fields.signature_present = regex.signature_present;

  return fields;
}

/**
 * Convert S8 regex extraction result to extracted_fields format
 */
function s8RegexToExtractedFields(regex: S8RegexExtractionResult): Record<string, any> {
  const fields: Record<string, any> = {};

  if (regex.notice_type) {
    fields.notice_type = regex.notice_type;
  }
  if (regex.form_3_detected) {
    fields.form_3_used = true;
  }
  if (regex.section_8_detected) {
    fields.section_8_detected = true;
  }
  if (regex.grounds_cited.length > 0) {
    fields.grounds_cited = regex.grounds_cited;
  }
  if (regex.date_served) {
    fields.date_served = regex.date_served;
  }
  if (regex.expiry_date) {
    fields.expiry_date = regex.expiry_date;
  }
  if (regex.earliest_proceedings_date) {
    fields.earliest_proceedings_date = regex.earliest_proceedings_date;
  }
  if (regex.notice_period) {
    fields.notice_period = regex.notice_period;
  }
  if (regex.rent_arrears_stated) {
    fields.rent_arrears_stated = parseFloat(regex.rent_arrears_stated);
  }
  if (regex.rent_amount) {
    fields.rent_amount = parseFloat(regex.rent_amount);
  }
  if (regex.rent_frequency) {
    fields.rent_frequency = regex.rent_frequency;
  }
  if (regex.property_address) {
    fields.property_address = regex.property_address;
  }
  if (regex.tenant_names.length > 0) {
    fields.tenant_names = regex.tenant_names;
    fields.tenant_details = regex.tenant_names.join(', ');
  }
  if (regex.landlord_name) {
    fields.landlord_name = regex.landlord_name;
  }

  return fields;
}


/**
 * Generic type for any regex result
 */
type AnyRegexResult = RegexExtractionResult | S8RegexExtractionResult;

/**
 * Determine which regex extractor to use based on validator key and category
 */
function getRegexExtractor(validatorKey?: string | null, category?: string | null): {
  extract: (text: string) => AnyRegexResult;
  toFields: (result: AnyRegexResult) => Record<string, any>;
  type: 's21' | 's8';
} | null {
  const key = (validatorKey || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  if (key === 'section_21' || cat === 'notice_s21' || cat.includes('s21') || cat.includes('section 21')) {
    return {
      extract: extractS21FieldsWithRegex,
      toFields: s21RegexToExtractedFields as (result: AnyRegexResult) => Record<string, any>,
      type: 's21',
    };
  }

  if (key === 'section_8' || cat === 'notice_s8' || cat.includes('s8') || cat.includes('section 8')) {
    return {
      extract: extractS8FieldsWithRegex,
      toFields: s8RegexToExtractedFields as (result: AnyRegexResult) => Record<string, any>,
      type: 's8',
    };
  }

  return null;
}

/**
 * Render PDF pages to images using puppeteer (fallback for vision analysis)
 */
async function renderPdfPagesToImages(buffer: Buffer, maxPages: number): Promise<string[]> {
  // Dynamic import to avoid issues if puppeteer is not installed
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    debugLog('puppeteer_unavailable', 'Puppeteer not installed, vision fallback unavailable');
    return [];
  }

  let browser;
  try {
    browser = await puppeteer.default.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    const base64Pdf = buffer.toString('base64');
    // Use cdnjs which is more reliable, and use legacy build for better compatibility
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>body{margin:0;padding:0}</style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <canvas id="page"></canvas>
  <script>
    // PDF.js 3.x uses pdfjsLib global
    const pdfjsLib = window.pdfjsLib;
    if (!pdfjsLib) {
      window.renderError = 'PDF.js library failed to load';
      window.renderPages = async () => [];
    } else {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      window.renderPages = async function renderPages() {
        try {
          const pdfData = atob('${base64Pdf}');
          const loadingTask = pdfjsLib.getDocument({ data: pdfData });
          const pdf = await loadingTask.promise;
          const max = Math.min(pdf.numPages, ${maxPages});
          const results = [];
          for (let i = 1; i <= max; i++) {
            const pdfPage = await pdf.getPage(i);
            const viewport = pdfPage.getViewport({ scale: 1.4 });
            const canvas = document.getElementById('page');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await pdfPage.render({ canvasContext: context, viewport }).promise;
            results.push(canvas.toDataURL('image/png'));
          }
          return results;
        } catch (err) {
          window.renderError = err.message;
          return [];
        }
      };
    }
  </script>
</body>
</html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const dataUrls = await page.evaluate(async () => {
      // @ts-ignore - window properties are defined in the injected script
      if ((window as any).renderError) {
        throw new Error((window as any).renderError);
      }
      return await (window as any).renderPages();
    });
    return Array.isArray(dataUrls) ? dataUrls : [];
  } catch (error: any) {
    debugLog('puppeteer_error', { error: error.message });
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function extractViaVision(params: {
  buffer: Buffer;
  mimeType: string;
  prompt: string;
  maxPages?: number;
  client: ReturnType<typeof getOpenAIClient>;
}): Promise<EvidenceAnalysisResult> {
  const { buffer, mimeType, prompt, maxPages = 2, client } = params;

  let imageUrls: string[] = [];

  if (isPdfMimeType(mimeType)) {
    imageUrls = await renderPdfPagesToImages(buffer, maxPages);
  } else if (isImageMimeType(mimeType)) {
    const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    imageUrls = [dataUrl];
  }

  if (imageUrls.length === 0) {
    return {
      detected_type: 'unknown',
      extracted_fields: {},
      confidence: 0.1,
      warnings: ['Unable to render document for vision analysis.'],
      source: 'vision',
    };
  }

  const messageContent: any[] = [
    { type: 'text', text: prompt },
    ...imageUrls.map((url) => ({ type: 'image_url', image_url: { url } })),
  ];

  try {
    // Note: Removed response_format to avoid Zod 4 compatibility issues with OpenAI SDK
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            'You are a document analyzer. Return ONLY valid JSON with keys: detected_type, extracted_fields, confidence, warnings. ' +
            'Do not include markdown, code blocks, or explanations. Output pure JSON only.',
        },
        {
          role: 'user',
          content: messageContent,
        },
      ],
    } as any);

    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = parseAnalysisPayload(raw, 'vision');

    return parsed;
  } catch (error: any) {
    debugLog('vision_api_error', { error: error.message });
    console.error('[extractViaVision] OpenAI API error:', error.message);
    return {
      detected_type: 'unknown',
      extracted_fields: {},
      confidence: 0.1,
      warnings: [`Vision analysis API error: ${error.message}`],
      source: 'vision',
    };
  }
}

/**
 * Extract document information via text analysis with hard timeout.
 * Uses AbortController to ensure the request is cancelled on timeout.
 */
async function extractViaText(params: {
  text: string;
  prompt: string;
  client: ReturnType<typeof getOpenAIClient>;
  timeoutMs?: number;
  debugId?: string;
}): Promise<EvidenceAnalysisResult> {
  const { client, timeoutMs = LLM_CALL_TIMEOUT_MS, debugId } = params;
  const startTime = Date.now();

  // Create abort controller for hard timeout
  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => {
    abortController.abort();
  }, timeoutMs);

  try {
    // Note: Using response_format can cause issues with some Zod versions
    // Instead, we rely on strong prompting for JSON output
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content:
            'You are a document analyzer. Return ONLY valid JSON with keys: detected_type, extracted_fields, confidence, warnings. ' +
            'Do not include markdown, code blocks, or explanations. Output pure JSON only.',
        },
        {
          role: 'user',
          content: `${params.prompt}\n\nExtract from text:\n${params.text}`,
        },
      ],
      // Pass abort signal to cancel request on timeout
    } as any, { signal: abortController.signal });

    clearTimeout(timeoutHandle);

    const duration = Date.now() - startTime;
    debugLog('llm_text_response', { duration_ms: duration, debugId });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = parseAnalysisPayload(raw, 'pdf_text');

    return parsed;
  } catch (error: any) {
    clearTimeout(timeoutHandle);

    const duration = Date.now() - startTime;
    const isAborted = error.name === 'AbortError' || abortController.signal.aborted;
    const isTimeout = isAborted || duration >= timeoutMs - 100;

    if (isTimeout) {
      console.error(`[extractViaText] LLM call timed out after ${duration}ms (limit: ${timeoutMs}ms)`);
      throw new Error(`LLM extraction timed out after ${timeoutMs}ms`);
    }

    console.error('[extractViaText] LLM call failed:', error.message);
    throw error;
  }
}

function parseAnalysisPayload(raw: string, source: EvidenceAnalysisResult['source']): EvidenceAnalysisResult {
  let parsedJson: any = {};

  // Clean up potential markdown code blocks
  let cleanedRaw = raw.trim();
  if (cleanedRaw.startsWith('```json')) {
    cleanedRaw = cleanedRaw.slice(7);
  } else if (cleanedRaw.startsWith('```')) {
    cleanedRaw = cleanedRaw.slice(3);
  }
  if (cleanedRaw.endsWith('```')) {
    cleanedRaw = cleanedRaw.slice(0, -3);
  }
  cleanedRaw = cleanedRaw.trim();

  try {
    parsedJson = JSON.parse(cleanedRaw);
  } catch (error: any) {
    console.error('[parseAnalysisPayload] Failed to parse JSON:', cleanedRaw.slice(0, 200));
    return {
      detected_type: 'unknown',
      extracted_fields: {},
      confidence: 0.1,
      warnings: [`${source === 'vision' ? 'Vision' : 'Text'} analysis returned invalid JSON.`],
      source,
    };
  }

  const parsed = AnalysisSchema.safeParse(parsedJson);
  if (parsed.success) {
    return { ...parsed.data, source };
  }

  if (parsedJson && typeof parsedJson === 'object') {
    return {
      detected_type: parsedJson.detected_type || 'unknown',
      extracted_fields: parsedJson.extracted_fields || {},
      confidence: typeof parsedJson.confidence === 'number' ? parsedJson.confidence : 0.1,
      warnings: parsedJson.warnings || ['Analysis payload incomplete; defaults applied.'],
      source,
    };
  }

  return {
    detected_type: 'unknown',
    extracted_fields: {},
    confidence: 0.1,
    warnings: ['Analysis payload could not be parsed.'],
    source,
  };
}

/**
 * Merge regex extraction results with LLM results.
 * Regex provides high-confidence baseline, LLM enriches.
 *
 * For name fields (landlord_name, tenant_name), applies isNameLike() validation
 * to prefer plausible names and reject sentence fragments.
 */
function mergeExtractionResults(
  regexFields: Record<string, any>,
  llmFields: Record<string, any>
): Record<string, any> {
  const merged = { ...llmFields };

  // Fields that should be validated as names
  const nameFields = ['landlord_name', 'landlord_full_name', 'tenant_name', 'tenant_full_name'];

  // For name fields, apply special merge logic
  for (const nameField of nameFields) {
    const regexValue = regexFields[nameField];
    const llmValue = llmFields[nameField];

    const regexIsNameLike = isNameLike(regexValue);
    const llmIsNameLike = isNameLike(llmValue);

    if (regexIsNameLike && !llmIsNameLike) {
      // Regex value is name-like, LLM value is not - use regex
      merged[nameField] = regexValue;
    } else if (!regexIsNameLike && llmIsNameLike) {
      // LLM value is name-like, regex value is not - use LLM
      merged[nameField] = llmValue;
    } else if (regexIsNameLike && llmIsNameLike) {
      // Both are name-like - prefer regex (more reliable for structured fields)
      merged[nameField] = regexValue;
    } else {
      // Neither is name-like - set to null (don't keep junk)
      merged[nameField] = null;
    }
  }

  // Regex fields that we're confident about take precedence or fill gaps (non-name fields)
  for (const [key, value] of Object.entries(regexFields)) {
    // Skip name fields - already handled above
    if (nameFields.includes(key)) continue;

    if (value !== null && value !== undefined && value !== false) {
      // If LLM didn't find it, use regex
      if (merged[key] === null || merged[key] === undefined || merged[key] === '') {
        merged[key] = value;
      }
      // For booleans like form_6a_used, if regex found it, trust it
      if (typeof value === 'boolean' && value === true) {
        merged[key] = true;
      }
    }
  }

  return merged;
}

/**
 * Internal implementation of analyzeEvidence (without master timeout).
 * This is wrapped by analyzeEvidence with a master timeout.
 */
async function analyzeEvidenceInternal(
  input: EvidenceAnalysisInput,
  debugId: string,
  startTime: number
): Promise<EvidenceAnalysisResult> {
  const warnings: string[] = [];
  const qualityMeta: ExtractionQualityMeta = {
    text_extraction_method: 'failed',
    text_length: 0,
    regex_fields_found: 0,
    llm_extraction_ran: false,
  };

  logStage('init', debugId, {
    filename: input.filename,
    mimeType: input.mimeType,
    category: input.category,
    validatorKey: input.validatorKey,
    hasSignedUrl: !!input.signedUrl,
    hasFileBuffer: !!input.fileBuffer,
  }, startTime);

  debugLog('analyze_start', {
    filename: input.filename,
    mimeType: input.mimeType,
    category: input.category,
    validatorKey: input.validatorKey,
    hasSignedUrl: !!input.signedUrl,
    hasFileBuffer: !!input.fileBuffer,
  }, debugId);

  // Track regex extraction results even if LLM fails
  let regexResult: AnyRegexResult | null = null;
  let regexExtractor: ReturnType<typeof getRegexExtractor> = null;
  let extractedPdfText: string = '';

  try {
    const buffer = await loadBuffer(input);
    debugLog('buffer_loaded', { size: buffer.length });
    console.log('[analyzeEvidence] Buffer loaded, size:', buffer.length);

    const client = input.openAIClient ?? getOpenAIClient();
    const prompt = buildPrompt({
      filename: input.filename,
      mimeType: input.mimeType,
      category: input.category,
      questionId: input.questionId,
      caseId: input.caseId,
      validatorKey: input.validatorKey,
      jurisdiction: input.jurisdiction,
    });

    // Determine which regex extractor to use based on validator/category
    regexExtractor = getRegexExtractor(input.validatorKey, input.category);
    debugLog('regex_extractor_selected', { type: regexExtractor?.type ?? 'none' });

    if (isPdfMimeType(input.mimeType)) {
      debugLog('processing_pdf', true);
      console.log('[analyzeEvidence] Processing PDF...');

      // Step 1: Extract text using pdf-parse (real text extraction, not just metadata)
      logStage('pdf_parse', debugId, { filename: input.filename }, startTime);
      let pdfExtractionResult: PdfExtractionResult | null = null;
      try {
        pdfExtractionResult = await withTimeout(
          extractPdfText(buffer, 10),
          10000,
          'PDF text extraction'
        );

        if (pdfExtractionResult.text.length > 0) {
          extractedPdfText = pdfExtractionResult.text;
          qualityMeta.text_extraction_method = pdfExtractionResult.method;
          qualityMeta.is_low_text = pdfExtractionResult.isLowText;
          qualityMeta.is_metadata_only = pdfExtractionResult.isMetadataOnly;
        }

        // Log pdf_parse_complete stage
        logStage('pdf_parse_complete', debugId, {
          textLength: pdfExtractionResult.text.length,
          pageCount: pdfExtractionResult.pageCount,
          isLowText: pdfExtractionResult.isLowText,
          isMetadataOnly: pdfExtractionResult.isMetadataOnly,
          method: pdfExtractionResult.method,
        }, startTime);

        debugLog('pdf_parse_result', {
          textLength: pdfExtractionResult.text.length,
          pageCount: pdfExtractionResult.pageCount,
          isLowText: pdfExtractionResult.isLowText,
          isMetadataOnly: pdfExtractionResult.isMetadataOnly,
          method: pdfExtractionResult.method,
        });

        // Analyze text for document type markers
        if (extractedPdfText.length > 0) {
          const markers = analyzeTextForDocumentMarkers(extractedPdfText);
          qualityMeta.document_markers = markers.markers;
          debugLog('document_markers', markers);
        }
      } catch (error: any) {
        debugLog('pdf_parse_error', { error: error.message });
        console.error('[analyzeEvidence] PDF text extraction failed:', error.message);
        warnings.push(`PDF text extraction failed: ${error.message}`);
        // Mark as failed - will trigger vision fallback
        qualityMeta.text_extraction_method = 'failed';
        qualityMeta.is_low_text = true;
      }

      qualityMeta.text_length = extractedPdfText.length;

      // Step 2: Run regex extraction if we have text and a context-specific extractor
      // This provides baseline fields even without LLM
      logStage('regex_start', debugId, { extractorType: regexExtractor?.type ?? 'none', textLength: extractedPdfText.length }, startTime);
      if (regexExtractor && extractedPdfText.length > 0) {
        regexResult = regexExtractor.extract(extractedPdfText);
        qualityMeta.regex_fields_found = regexResult.fields_found.length;
        logStage('regex_complete', debugId, {
          type: regexExtractor.type,
          fields_found: regexResult.fields_found.length,
          fields: regexResult.fields_found,
        }, startTime);
        debugLog('regex_result', {
          type: regexExtractor.type,
          fields_found: regexResult.fields_found.length,
          fields: regexResult.fields_found,
        });
      }

      // Determine if we should use vision extraction
      const shouldUseVision =
        pdfExtractionResult?.isLowText ||
        pdfExtractionResult?.isMetadataOnly ||
        qualityMeta.text_extraction_method === 'failed' ||
        extractedPdfText.length < MIN_TEXT_LENGTH;

      // Step 3: Try LLM extraction (text-based if we have good text, vision if LOW_TEXT)
      if (process.env.OPENAI_API_KEY) {
        qualityMeta.llm_extraction_ran = true;

        // Use vision extraction if text is low quality, otherwise use text
        if (!shouldUseVision && extractedPdfText.length >= MIN_TEXT_LENGTH) {
          // Use text-based extraction - we have good extracted text
          // Trim text intelligently, preferring Form markers
          const trimmedText = trimTextForLLM(extractedPdfText, LLM_MAX_TEXT_CHARS);

          logStage('llm_start', debugId, {
            originalTextLength: extractedPdfText.length,
            trimmedTextLength: trimmedText.length,
            timeoutMs: LLM_CALL_TIMEOUT_MS,
          }, startTime);
          console.log('[analyzeEvidence] Calling OpenAI text analysis (good text quality)...');

          try {
            // Use extractViaText with built-in hard timeout
            const llmResult = await extractViaText({
              text: trimmedText,
              prompt,
              client,
              timeoutMs: LLM_CALL_TIMEOUT_MS,
              debugId,
            });

            logStage('llm_complete', debugId, {
              detected_type: llmResult.detected_type,
              confidence: llmResult.confidence,
              fieldsCount: Object.keys(llmResult.extracted_fields || {}).length,
            }, startTime);

            console.log('[analyzeEvidence] Text analysis complete:', {
              detected_type: llmResult.detected_type,
              confidence: llmResult.confidence,
              fieldsCount: Object.keys(llmResult.extracted_fields || {}).length,
            });

            // Merge regex and LLM results
            const mergedFields = (regexResult && regexExtractor)
              ? mergeExtractionResults(regexExtractor.toFields(regexResult), llmResult.extracted_fields)
              : llmResult.extracted_fields;

            // Boost confidence if regex confirmed key document markers
            let finalConfidence = llmResult.confidence;
            if (regexResult && regexResult.fields_found.length >= 2) {
              finalConfidence = Math.min(1, finalConfidence + 0.15);
            }

            return {
              ...llmResult,
              extracted_fields: mergedFields,
              confidence: finalConfidence,
              raw_text: trimmedText,
              extraction_quality: qualityMeta,
            };
          } catch (error: any) {
            const isTimeout = error.message?.includes('timed out');
            if (isTimeout) {
              logStage('llm_timeout', debugId, { error: error.message }, startTime);
              console.error('[analyzeEvidence] LLM call timed out - falling back to regex/vision');
              warnings.push(`LLM extraction timed out after ${LLM_CALL_TIMEOUT_MS}ms`);
            } else {
              logStage('llm_error', debugId, { error: error.message }, startTime);
              console.error('[analyzeEvidence] Text analysis failed:', error.message);
              warnings.push(`Text analysis failed: ${error.message}`);
            }
          }
        }

        // Use vision analysis (either as primary choice for LOW_TEXT or as fallback)
        const visionReason = shouldUseVision
          ? (qualityMeta.is_metadata_only ? 'metadata_only' : 'low_text_detected')
          : 'text_extraction_failed';

        logStage('vision_start', debugId, { reason: visionReason, textLength: extractedPdfText.length }, startTime);
        console.log('[analyzeEvidence] Starting vision analysis (reason: ' + visionReason + ')...');

        try {
          const visionResult = await withTimeout(
            extractViaVision({
              buffer,
              mimeType: input.mimeType,
              prompt,
              client,
            }),
            20000, // 20s timeout for vision (reduced from 25s)
            'Vision analysis'
          );

          logStage('vision_complete', debugId, {
            detected_type: visionResult.detected_type,
            confidence: visionResult.confidence,
            fieldsCount: Object.keys(visionResult.extracted_fields || {}).length,
          }, startTime);

          console.log('[analyzeEvidence] Vision analysis complete:', {
            detected_type: visionResult.detected_type,
            confidence: visionResult.confidence,
            fieldsCount: Object.keys(visionResult.extracted_fields || {}).length,
          });

          // Merge regex and vision results
          const mergedFields = (regexResult && regexExtractor)
            ? mergeExtractionResults(regexExtractor.toFields(regexResult), visionResult.extracted_fields)
            : visionResult.extracted_fields;

          // Boost confidence if regex confirmed key document markers
          let finalConfidence = visionResult.confidence;
          if (regexResult && regexResult.fields_found.length >= 2) {
            finalConfidence = Math.min(1, finalConfidence + 0.15);
          }

          qualityMeta.text_extraction_method = 'vision';

          return {
            ...visionResult,
            extracted_fields: mergedFields,
            confidence: finalConfidence,
            warnings: [...(visionResult.warnings ?? []), ...warnings],
            raw_text: extractedPdfText || undefined,
            extraction_quality: qualityMeta,
          };
        } catch (visionError: any) {
          const isTimeout = visionError.message?.includes('timed out');
          if (isTimeout) {
            logStage('vision_timeout', debugId, { error: visionError.message }, startTime);
            console.error('[analyzeEvidence] Vision analysis timed out - falling back to regex');
            warnings.push('Vision analysis timed out');
          } else {
            logStage('vision_error', debugId, { error: visionError.message }, startTime);
            console.error('[analyzeEvidence] Vision analysis failed:', visionError.message);
            warnings.push(`Vision analysis failed: ${visionError.message}`);
          }
        }
      } else {
        qualityMeta.llm_extraction_skipped_reason = 'OPENAI_API_KEY missing';
        debugLog('llm_skipped', { reason: 'no_api_key' });
        console.warn('[analyzeEvidence] OpenAI API key missing, using regex only');
      }

      // If LLM failed but we have regex results, use them
      if (regexResult && regexExtractor && regexResult.fields_found.length > 0) {
        debugLog('using_regex_fallback', { type: regexExtractor.type, fields: regexResult.fields_found });
        console.log('[analyzeEvidence] Using regex extraction fallback');

        const regexFields = regexExtractor.toFields(regexResult);

        // Determine detected type and confidence based on extractor type
        let detectedType = 'unknown';
        let confidence = 0.5 + (regexResult.fields_found.length * 0.05);
        confidence = Math.min(confidence, 0.75);

        if (regexExtractor.type === 's21') {
          const s21Result = regexResult as RegexExtractionResult;
          if (s21Result.form_6a_detected && s21Result.section_21_detected) {
            detectedType = 's21_notice';
            confidence = 0.75;
          } else if (s21Result.section_21_detected || s21Result.form_6a_detected) {
            detectedType = 's21_notice';
            confidence = 0.65;
          }
        } else if (regexExtractor.type === 's8') {
          const s8Result = regexResult as S8RegexExtractionResult;
          if (s8Result.section_8_detected || s8Result.form_3_detected) {
            detectedType = 's8_notice';
            confidence = s8Result.grounds_cited.length > 0 ? 0.75 : 0.65;
          }
        }

        qualityMeta.text_extraction_method = 'regex_only';

        return {
          detected_type: detectedType,
          extracted_fields: regexFields,
          confidence,
          warnings: [
            'LLM extraction unavailable; using regex-based extraction only.',
            ...warnings,
          ],
          raw_text: extractedPdfText || undefined,
          source: 'regex',
          extraction_quality: qualityMeta,
        };
      }
    }

    // Handle images
    if (isImageMimeType(input.mimeType)) {
      debugLog('processing_image', true);
      console.log('[analyzeEvidence] Processing image...');

      if (process.env.OPENAI_API_KEY) {
        qualityMeta.llm_extraction_ran = true;

        try {
          const visionResult = await withTimeout(
            extractViaVision({
              buffer,
              mimeType: input.mimeType,
              prompt,
              client,
            }),
            20000,
            'Vision analysis'
          );

          debugLog('image_vision_result', {
            detected_type: visionResult.detected_type,
            confidence: visionResult.confidence,
          });

          console.log('[analyzeEvidence] Image vision analysis complete:', {
            detected_type: visionResult.detected_type,
            confidence: visionResult.confidence,
            fieldsCount: Object.keys(visionResult.extracted_fields || {}).length,
          });

          qualityMeta.text_extraction_method = 'vision';

          return {
            ...visionResult,
            extraction_quality: qualityMeta,
          };
        } catch (visionError: any) {
          debugLog('image_vision_error', { error: visionError.message });
          console.error('[analyzeEvidence] Image vision analysis failed:', visionError.message);
          warnings.push(`Vision analysis failed: ${visionError.message}`);
        }
      } else {
        qualityMeta.llm_extraction_skipped_reason = 'OPENAI_API_KEY missing';
      }
    }

    // Final fallback - return category-based result
    debugLog('final_fallback', { category: input.category });

    return {
      detected_type: input.category || input.mimeType || 'unknown',
      extracted_fields: (regexResult && regexExtractor) ? regexExtractor.toFields(regexResult) : {},
      confidence: regexResult && regexResult.fields_found.length > 0 ? 0.4 : 0.1,
      warnings: ['Document analysis incomplete; limited extraction available.', ...warnings],
      source: regexResult ? 'regex' : undefined,
      extraction_quality: qualityMeta,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    debugLog('analysis_error', { error: error.message, durationMs: duration }, debugId);
    logStage('error', debugId, { error: error.message }, startTime);
    console.error('[analyzeEvidence] Analysis error:', error.message);

    return {
      detected_type: input.category || 'unknown',
      extracted_fields: (regexResult && regexExtractor) ? regexExtractor.toFields(regexResult) : {},
      confidence: 0.1,
      warnings: [`Evidence analysis failed: ${error.message}`, ...warnings],
      extraction_quality: qualityMeta,
      debug_id: debugId,
      final_stage: 'error',
      duration_ms: duration,
    };
  }
}

/**
 * Analyze evidence document (PDF or image) with extraction and classification.
 *
 * This is the main entry point for evidence analysis. It wraps the internal
 * implementation with a master timeout to ensure the function always returns
 * within a reasonable time (30s max).
 *
 * @param input - Evidence analysis input
 * @returns Analysis result with extracted fields, confidence, and quality metadata
 */
export async function analyzeEvidence(input: EvidenceAnalysisInput): Promise<EvidenceAnalysisResult> {
  const startTime = Date.now();
  const debugId = input.debugId || randomUUID().slice(0, 8);

  console.log('[analyzeEvidence] Starting analysis:', {
    debug_id: debugId,
    filename: input.filename,
    mimeType: input.mimeType,
    category: input.category,
    validatorKey: input.validatorKey,
  });

  try {
    // Run analysis with master timeout
    const result = await withTimeout(
      analyzeEvidenceInternal(input, debugId, startTime),
      ANALYSIS_MASTER_TIMEOUT_MS,
      'Evidence analysis'
    );

    // Add debug_id and timing if not already present
    const duration = Date.now() - startTime;
    logStage('complete', debugId, {
      detected_type: result.detected_type,
      confidence: result.confidence,
      fieldsCount: Object.keys(result.extracted_fields || {}).length,
    }, startTime);

    return {
      ...result,
      debug_id: result.debug_id || debugId,
      final_stage: result.final_stage || 'complete',
      duration_ms: result.duration_ms || duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const isTimeout = error.message?.includes('timed out');

    // Log appropriate stage based on whether it was a timeout or error
    if (isTimeout) {
      logStage('timeout', debugId, {
        error: error.message,
        duration_ms: duration,
        master_timeout_ms: ANALYSIS_MASTER_TIMEOUT_MS,
      }, startTime);
      console.error('[analyzeEvidence] MASTER TIMEOUT - analysis did not complete in time:', {
        debug_id: debugId,
        duration_ms: duration,
        timeout_ms: ANALYSIS_MASTER_TIMEOUT_MS,
      });
    } else {
      logStage('error', debugId, {
        error: error.message,
      }, startTime);
      console.error('[analyzeEvidence] Analysis failed:', {
        debug_id: debugId,
        error: error.message,
        duration_ms: duration,
      });
    }

    // Return degraded result instead of throwing - ensures API always returns JSON
    return {
      detected_type: input.category || 'unknown',
      extracted_fields: {},
      confidence: 0.1,
      warnings: [
        isTimeout
          ? `Evidence analysis timed out after ${ANALYSIS_MASTER_TIMEOUT_MS}ms`
          : `Evidence analysis failed: ${error.message}`,
      ],
      extraction_quality: {
        text_extraction_method: 'failed',
        text_length: 0,
        regex_fields_found: 0,
        llm_extraction_ran: false,
      },
      debug_id: debugId,
      final_stage: isTimeout ? 'timeout' : 'error',
      duration_ms: duration,
    };
  }
}
