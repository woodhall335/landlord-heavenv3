import { z } from 'zod';
import { getOpenAIClient } from '@/lib/ai/openai-client';
import { isPdfMimeType, isImageMimeType } from '@/lib/evidence/schema';
import { PDFDocument } from 'pdf-lib';

// Debug logging helper - controlled by DEBUG_EVIDENCE env var
const DEBUG = process.env.DEBUG_EVIDENCE === 'true';
function debugLog(label: string, data: any): void {
  if (DEBUG) {
    console.log(`[DEBUG_EVIDENCE][${label}]`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
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
}

export interface ExtractionQualityMeta {
  text_extraction_method: 'pdf_lib' | 'vision' | 'regex_only' | 'failed';
  text_length: number;
  regex_fields_found: number;
  llm_extraction_ran: boolean;
  llm_extraction_skipped_reason?: string;
  confidence_breakdown?: Record<string, number>;
}

export interface EvidenceAnalysisResult {
  detected_type: string;
  extracted_fields: Record<string, any>;
  confidence: number;
  warnings: string[];
  raw_text?: string;
  source?: 'pdf_text' | 'vision' | 'image' | 'regex';
  extraction_quality?: ExtractionQualityMeta;
}

const AnalysisSchema = z.object({
  detected_type: z.string().min(1),
  extracted_fields: z.record(z.any()).default({}),
  confidence: z.number().min(0).max(1).default(0.2),
  warnings: z.array(z.string()).default([]),
});

const MAX_TEXT_CHARS = 6000;
const MIN_TEXT_LENGTH = 50;

/**
 * Validator-specific extraction instructions for compliance checks.
 * These prompts tell the AI what specific fields to look for based on the validator.
 */
const VALIDATOR_PROMPTS: Record<string, string> = {
  tenancy_agreement: `
TENANCY AGREEMENT COMPLIANCE ANALYSIS:
You MUST extract these specific fields in extracted_fields:

BASIC INFO:
- tenancy_type: "ast" | "prt" | "occupation_contract" | "other" (AST for England, PRT for Scotland, Occupation Contract for Wales)
- start_date: tenancy start date (YYYY-MM-DD)
- end_date: fixed term end date if specified (YYYY-MM-DD)
- rent_amount: monthly/weekly rent amount (number)
- rent_frequency: "weekly" | "monthly" | "quarterly"
- deposit_amount: deposit amount (number)
- deposit_scheme: name of deposit protection scheme if mentioned
- property_address: full property address
- tenant_names: array of tenant names
- landlord_name: landlord or agent name

COMPLIANCE FLAGS (critical for validation):
- prohibited_fees_present: true/false - Look for ANY fees charged to tenant beyond rent and deposit:
  * Admin fees, reference fees, checkout fees, inventory fees, renewal fees, guarantor fees
  * These are BANNED under the Tenant Fees Act 2019 (England) and similar laws
- unfair_terms_present: true/false - Look for one-sided or unconscionable terms:
  * Excessive penalty clauses, unreasonable restrictions, waiver of statutory rights
  * Terms that heavily favor landlord with no tenant protections
- missing_clauses: true/false - Check if these REQUIRED clauses are present:
  * Deposit protection details (scheme, certificate reference)
  * Right to quiet enjoyment
  * Landlord repair obligations
  * Break clause terms (if fixed term)
  * How to serve notices

JURISDICTION DETECTION:
- jurisdiction: "england" | "wales" | "scotland" | "northern_ireland"
  * Look for references to "Assured Shorthold Tenancy" (England)
  * Look for "Occupation Contract" or "Renting Homes Wales Act" (Wales)
  * Look for "Private Residential Tenancy" or "Housing Scotland Act" (Scotland)
`,

  section_21: `
SECTION 21 NOTICE ANALYSIS:
You MUST extract these specific fields in extracted_fields:

NOTICE DETAILS:
- notice_type: should contain "section 21" or "s21" or "Form 6A"
- date_served: date notice was served (YYYY-MM-DD)
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

  wales_notice: `
WALES OCCUPATION CONTRACT NOTICE ANALYSIS:
You MUST extract these specific fields in extracted_fields:

NOTICE DETAILS:
- rhw_form_number: "RHW16" | "RHW17" | "RHW23" | other form number
- bilingual_text_present: true/false - CRITICAL: Wales notices MUST have Welsh and English
- notice_type: type of notice
- date_served: service date (YYYY-MM-DD)
- expiry_date: expiry date (YYYY-MM-DD)
- contract_holder_details: contract holder (tenant) names/details
- landlord_details: landlord name

COMPLIANCE (Renting Homes Wales Act 2016):
- written_statement_referenced: true/false - references written statement?
- fitness_for_habitation_confirmed: true/false - confirms property is fit?
- deposit_protection_confirmed: true/false - references deposit protection?
- occupation_type: "standard" | "secure" occupation contract type
`,

  scotland_notice_to_leave: `
SCOTLAND NOTICE TO LEAVE ANALYSIS:
You MUST extract these specific fields in extracted_fields:

NOTICE DETAILS:
- ground_cited: specific ground for eviction (1-18)
- ground_description: text description of ground
- notice_period: notice period given
- date_served: service date (YYYY-MM-DD)
- property_address: property address
- tenant_name: tenant name

PRT COMPLIANCE:
- ground_mandatory: true/false - is this a mandatory ground?
- ground_evidence_mentioned: true/false - does notice reference supporting evidence?
- tenancy_start_date: when tenancy started
- tribunal_reference: First-tier Tribunal reference if mentioned
`,

  money_claim: `
MONEY CLAIM / ARREARS DOCUMENTATION ANALYSIS:
You MUST extract these specific fields in extracted_fields:

CLAIM DETAILS:
- claim_amount: total amount claimed (number)
- arrears_breakdown: breakdown of arrears if provided
- claim_period: period the claim covers
- parties: plaintiff and defendant names

RENT SCHEDULE:
- rent_amount: periodic rent amount
- rent_frequency: "weekly" | "monthly"
- payment_history: any payment history mentioned
- last_payment_date: date of last payment received
- outstanding_balance: current balance owed

PRE-ACTION COMPLIANCE:
- lba_sent: true/false - Letter Before Action mentioned?
- lba_date: date of LBA if mentioned
- response_received: true/false - did debtor respond?
- payment_plan_offered: true/false - was payment plan discussed?
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
    while ((match = pattern.exec(originalText)) !== null) {
      const name = match[1].trim();
      if (name.length >= 4 && name.length <= 60) {
        tenantNamesSet.add(name);
      }
    }
  }
  result.tenant_names = Array.from(tenantNamesSet);
  if (result.tenant_names.length > 0) result.fields_found.push('tenant_names');

  // Landlord name extraction
  const landlordPatterns = [
    /(?:landlord|landlord's?\s*name)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i,
    /(?:signed|from|by)[\s:]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)(?:\s*\(landlord\))?/i,
  ];
  for (const pattern of landlordPatterns) {
    const match = pattern.exec(originalText);
    if (match) {
      result.landlord_name = match[1].trim();
      result.fields_found.push('landlord_name');
      break;
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
 * Convert regex extraction result to extracted_fields format
 */
function regexToExtractedFields(regex: RegexExtractionResult): Record<string, any> {
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
    fields.date_served = regex.date_served;
  }
  if (regex.expiry_date) {
    fields.expiry_date = regex.expiry_date;
  }
  if (regex.property_address) {
    fields.property_address = regex.property_address;
  }
  if (regex.tenant_names.length > 0) {
    fields.tenant_names = regex.tenant_names;
  }
  if (regex.landlord_name) {
    fields.landlord_name = regex.landlord_name;
  }
  fields.signature_present = regex.signature_present;

  return fields;
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
      // @ts-ignore
      if (window.renderError) {
        throw new Error(window.renderError);
      }
      return await window.renderPages();
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

async function extractViaText(params: {
  text: string;
  prompt: string;
  client: ReturnType<typeof getOpenAIClient>;
}): Promise<EvidenceAnalysisResult> {
  const { client } = params;

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
    // Removed response_format to avoid Zod 4 compatibility issues with OpenAI SDK
  } as any);

  const raw = response.choices[0]?.message?.content ?? '{}';
  const parsed = parseAnalysisPayload(raw, 'pdf_text');

  return parsed;
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
 */
function mergeExtractionResults(
  regexFields: Record<string, any>,
  llmFields: Record<string, any>
): Record<string, any> {
  const merged = { ...llmFields };

  // Regex fields that we're confident about take precedence or fill gaps
  for (const [key, value] of Object.entries(regexFields)) {
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

export async function analyzeEvidence(input: EvidenceAnalysisInput): Promise<EvidenceAnalysisResult> {
  const warnings: string[] = [];
  const qualityMeta: ExtractionQualityMeta = {
    text_extraction_method: 'failed',
    text_length: 0,
    regex_fields_found: 0,
    llm_extraction_ran: false,
  };

  debugLog('analyze_start', {
    filename: input.filename,
    mimeType: input.mimeType,
    category: input.category,
    validatorKey: input.validatorKey,
    hasSignedUrl: !!input.signedUrl,
    hasFileBuffer: !!input.fileBuffer,
  });

  console.log('[analyzeEvidence] Starting analysis for:', {
    filename: input.filename,
    mimeType: input.mimeType,
    category: input.category,
    validatorKey: input.validatorKey,
    hasSignedUrl: !!input.signedUrl,
    hasFileBuffer: !!input.fileBuffer,
  });

  // Track regex extraction results even if LLM fails
  let regexResult: RegexExtractionResult | null = null;
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

    if (isPdfMimeType(input.mimeType)) {
      debugLog('processing_pdf', true);
      console.log('[analyzeEvidence] Processing PDF...');

      // Step 1: Try to extract text with pdf-lib (for metadata)
      try {
        const pdfLibText = await withTimeout(extractPdfTextWithPdfLib(buffer), 3000, 'PDF metadata extraction');
        if (pdfLibText.length > 0) {
          extractedPdfText = pdfLibText;
          qualityMeta.text_extraction_method = 'pdf_lib';
        }
        debugLog('pdf_lib_result', { textLength: pdfLibText.length });
      } catch (error: any) {
        debugLog('pdf_lib_error', { error: error.message });
        warnings.push(`PDF metadata extraction failed: ${error.message}`);
      }

      // Step 2: If we have a validator context for S21, run regex extraction
      // This provides baseline fields even without LLM
      if (input.validatorKey === 'section_21' || input.category === 'notice_s21') {
        // Try vision-based text extraction for regex analysis
        try {
          const images = await renderPdfPagesToImages(buffer, 2);
          if (images.length > 0) {
            // We have images - we can use vision for both regex patterns and LLM
            qualityMeta.text_extraction_method = 'vision';
            debugLog('vision_images_rendered', { count: images.length });
          }
        } catch {
          // Vision rendering failed, continue with what we have
        }

        // If we managed to get some text, run regex
        if (extractedPdfText.length > 0) {
          regexResult = extractS21FieldsWithRegex(extractedPdfText);
          qualityMeta.regex_fields_found = regexResult.fields_found.length;
          debugLog('regex_result', {
            fields_found: regexResult.fields_found.length,
            form_6a: regexResult.form_6a_detected,
            section_21: regexResult.section_21_detected,
          });
        }
      }

      // Step 3: Try LLM extraction (text-based if we have text, vision otherwise)
      if (process.env.OPENAI_API_KEY) {
        qualityMeta.llm_extraction_ran = true;

        if (extractedPdfText.length >= MIN_TEXT_LENGTH) {
          // Use text-based extraction
          debugLog('llm_text_extraction', { textLength: extractedPdfText.length });
          console.log('[analyzeEvidence] Calling OpenAI text analysis...');

          try {
            const trimmedText = extractedPdfText.slice(0, MAX_TEXT_CHARS);
            const llmResult = await withTimeout(
              extractViaText({ text: trimmedText, prompt, client }),
              15000,
              'Text analysis'
            );

            debugLog('llm_text_result', {
              detected_type: llmResult.detected_type,
              confidence: llmResult.confidence,
              fieldsCount: Object.keys(llmResult.extracted_fields || {}).length,
            });

            console.log('[analyzeEvidence] Text analysis complete:', {
              detected_type: llmResult.detected_type,
              confidence: llmResult.confidence,
              fieldsCount: Object.keys(llmResult.extracted_fields || {}).length,
            });

            // Merge regex and LLM results
            const mergedFields = regexResult
              ? mergeExtractionResults(regexToExtractedFields(regexResult), llmResult.extracted_fields)
              : llmResult.extracted_fields;

            // Boost confidence if regex confirmed key fields
            let finalConfidence = llmResult.confidence;
            if (regexResult?.form_6a_detected || regexResult?.section_21_detected) {
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
            debugLog('llm_text_error', { error: error.message });
            console.error('[analyzeEvidence] Text analysis failed:', error.message);
            warnings.push(`Text analysis failed: ${error.message}`);
          }
        }

        // Fall back to vision analysis
        debugLog('falling_back_to_vision', { reason: extractedPdfText.length < MIN_TEXT_LENGTH ? 'insufficient_text' : 'text_extraction_failed' });
        console.log('[analyzeEvidence] Starting vision analysis...');

        try {
          const visionResult = await withTimeout(
            extractViaVision({
              buffer,
              mimeType: input.mimeType,
              prompt,
              client,
            }),
            25000,
            'Vision analysis'
          );

          debugLog('vision_result', {
            detected_type: visionResult.detected_type,
            confidence: visionResult.confidence,
            fieldsCount: Object.keys(visionResult.extracted_fields || {}).length,
          });

          console.log('[analyzeEvidence] Vision analysis complete:', {
            detected_type: visionResult.detected_type,
            confidence: visionResult.confidence,
            fieldsCount: Object.keys(visionResult.extracted_fields || {}).length,
          });

          // Merge regex and vision results
          const mergedFields = regexResult
            ? mergeExtractionResults(regexToExtractedFields(regexResult), visionResult.extracted_fields)
            : visionResult.extracted_fields;

          // Boost confidence if regex confirmed key fields
          let finalConfidence = visionResult.confidence;
          if (regexResult?.form_6a_detected || regexResult?.section_21_detected) {
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
          debugLog('vision_error', { error: visionError.message });
          console.error('[analyzeEvidence] Vision analysis failed:', visionError.message);
          warnings.push(`Vision analysis failed: ${visionError.message}`);
        }
      } else {
        qualityMeta.llm_extraction_skipped_reason = 'OPENAI_API_KEY missing';
        debugLog('llm_skipped', { reason: 'no_api_key' });
        console.warn('[analyzeEvidence] OpenAI API key missing, using regex only');
      }

      // If LLM failed but we have regex results, use them
      if (regexResult && regexResult.fields_found.length > 0) {
        debugLog('using_regex_fallback', { fields: regexResult.fields_found });
        console.log('[analyzeEvidence] Using regex extraction fallback');

        const regexFields = regexToExtractedFields(regexResult);
        let detectedType = 'unknown';
        let confidence = 0.5;

        if (regexResult.form_6a_detected && regexResult.section_21_detected) {
          detectedType = 's21_notice';
          confidence = 0.75;
        } else if (regexResult.section_21_detected) {
          detectedType = 's21_notice';
          confidence = 0.65;
        } else if (regexResult.form_6a_detected) {
          detectedType = 's21_notice';
          confidence = 0.60;
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
      extracted_fields: regexResult ? regexToExtractedFields(regexResult) : {},
      confidence: regexResult && regexResult.fields_found.length > 0 ? 0.4 : 0.1,
      warnings: ['Document analysis incomplete; limited extraction available.', ...warnings],
      source: regexResult ? 'regex' : undefined,
      extraction_quality: qualityMeta,
    };
  } catch (error: any) {
    debugLog('analysis_error', { error: error.message });
    console.error('[analyzeEvidence] Analysis error:', error.message);

    return {
      detected_type: input.category || 'unknown',
      extracted_fields: regexResult ? regexToExtractedFields(regexResult) : {},
      confidence: 0.1,
      warnings: [`Evidence analysis failed: ${error.message}`, ...warnings],
      extraction_quality: qualityMeta,
    };
  }
}
