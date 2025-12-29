import { z } from 'zod';
import { getOpenAIClient } from '@/lib/ai/openai-client';
import { isPdfMimeType, isImageMimeType } from '@/lib/evidence/schema';
import puppeteer from 'puppeteer';

// Polyfill for pdfjs-dist in Node.js environment
if (typeof globalThis !== 'undefined' && typeof globalThis.document === 'undefined') {
  // @ts-ignore - Create minimal DOM-like environment for pdfjs-dist
  globalThis.document = {
    createElement: () => ({ getContext: () => null }),
    documentElement: { style: {} },
  };
}

// Use pdfjs-dist directly for more reliable PDF text extraction
async function extractPdfTextWithPdfJs(buffer: Buffer): Promise<string> {
  try {
    // Set up environment for pdfjs-dist
    const isNode = typeof window === 'undefined';

    // Dynamic import
    const pdfjsModule = await import('pdfjs-dist');
    const pdfjsLib = pdfjsModule.default || pdfjsModule;

    // Handle different export styles
    const getDocument = pdfjsLib.getDocument;
    if (!getDocument) {
      throw new Error('pdfjs-dist getDocument not found');
    }

    // Disable worker for Node.js environment
    if (isNode && pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    }

    // Create a typed array from the buffer
    const data = new Uint8Array(buffer);

    // Load the PDF document with worker disabled for server-side
    const loadingTask = getDocument({
      data,
      disableFontFace: true,
      useSystemFonts: true,
      standardFontDataUrl: undefined,
    });
    const pdf = await loadingTask.promise;

    const textParts: string[] = [];

    // Extract text from each page (limit to first 10 pages for performance)
    const maxPages = Math.min(pdf.numPages, 10);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n');
  } catch (error: any) {
    console.error('[extractPdfTextWithPdfJs] Failed:', error.message, error.stack);
    throw error;
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

export interface EvidenceAnalysisResult {
  detected_type: string;
  extracted_fields: Record<string, any>;
  confidence: number;
  warnings: string[];
  raw_text?: string;
  source?: 'pdf_text' | 'vision' | 'image';
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

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Try pdfjs-dist first, fall back to pdf-parse if it fails
  try {
    return await extractPdfTextWithPdfJs(buffer);
  } catch (pdfjsError: any) {
    console.warn('[extractPdfText] pdfjs-dist failed, trying pdf-parse:', pdfjsError.message);

    // Fallback to pdf-parse with proper configuration
    try {
      // Set up environment for pdf-parse
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;

      // pdf-parse expects a Buffer
      const result = await pdfParse(buffer, {
        // Disable test mode which causes issues
        max: 10, // Max pages
      });

      return result.text || '';
    } catch (parseError: any) {
      console.error('[extractPdfText] pdf-parse also failed:', parseError.message);
      throw new Error(`PDF text extraction failed: ${pdfjsError.message} | ${parseError.message}`);
    }
  }
}

async function renderPdfPagesToImages(buffer: Buffer, maxPages: number): Promise<string[]> {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
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
  } finally {
    await browser.close();
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
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 1200,
      messages: [
        {
          role: 'system',
          content: 'Return only JSON with keys detected_type, extracted_fields, confidence, warnings. Do not guess.',
        },
        {
          role: 'user',
          content: messageContent,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = parseAnalysisPayload(raw, 'vision');

    return parsed;
  } catch (error: any) {
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
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 1200,
    messages: [
      {
        role: 'system',
        content: 'Return only JSON with keys detected_type, extracted_fields, confidence, warnings. Do not guess.',
      },
      {
        role: 'user',
        content: `${params.prompt}\n\nExtract from text:\n${params.text}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0]?.message?.content ?? '{}';
  const parsed = parseAnalysisPayload(raw, 'pdf_text');

  return parsed;
}

function parseAnalysisPayload(raw: string, source: EvidenceAnalysisResult['source']): EvidenceAnalysisResult {
  let parsedJson: any = {};
  try {
    parsedJson = JSON.parse(raw);
  } catch (error: any) {
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

export async function analyzeEvidence(input: EvidenceAnalysisInput): Promise<EvidenceAnalysisResult> {
  const warnings: string[] = [];

  console.log('[analyzeEvidence] Starting analysis for:', {
    filename: input.filename,
    mimeType: input.mimeType,
    category: input.category,
    validatorKey: input.validatorKey,
    hasSignedUrl: !!input.signedUrl,
    hasFileBuffer: !!input.fileBuffer,
  });

  if (!process.env.OPENAI_API_KEY) {
    console.warn('[analyzeEvidence] OpenAI API key missing');
    return {
      detected_type: input.category || 'unknown',
      extracted_fields: {},
      confidence: 0,
      warnings: ['OpenAI API key missing; analysis skipped.'],
    };
  }

  try {
    const buffer = await loadBuffer(input);
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

    // Track any extracted text even if we fall back to vision (for classification)
    let extractedPdfText: string | undefined;

    if (isPdfMimeType(input.mimeType)) {
      console.log('[analyzeEvidence] Processing PDF...');
      try {
        const text = await withTimeout(extractPdfText(buffer), 5000, 'PDF text extraction');
        const normalizedText = text?.trim() ?? '';
        console.log('[analyzeEvidence] PDF text extracted, length:', normalizedText.length);
        if (normalizedText.length > 0) {
          const trimmed = text.slice(0, MAX_TEXT_CHARS);
          extractedPdfText = trimmed; // Save for fallback
          console.log('[analyzeEvidence] Calling OpenAI text analysis...');
          try {
            const result = await withTimeout(
              extractViaText({ text: trimmed, prompt, client }),
              15000,
              'Text analysis'
            );
            console.log('[analyzeEvidence] Text analysis complete:', {
              detected_type: result.detected_type,
              confidence: result.confidence,
              fieldsCount: Object.keys(result.extracted_fields || {}).length,
            });
            if (normalizedText.length < MIN_TEXT_LENGTH) {
              result.warnings = [
                ...(result.warnings ?? []),
                'PDF text extraction returned limited text; results may be incomplete.',
              ];
            }
            return {
              ...result,
              raw_text: trimmed,
            };
          } catch (error: any) {
            console.error('[analyzeEvidence] Text analysis failed:', error.message);
            return {
              detected_type: input.category || 'unknown',
              extracted_fields: {},
              confidence: 0.1,
              warnings: [`Text analysis failed: ${error.message}`],
              raw_text: trimmed,
              source: 'pdf_text',
            };
          }
        }
        console.log('[analyzeEvidence] Insufficient text, falling back to vision');
        warnings.push('PDF text extraction returned insufficient text; falling back to vision.');
      } catch (error: any) {
        console.error('[analyzeEvidence] PDF text extraction failed:', error.message);
        warnings.push(`PDF text extraction failed: ${error.message}`);
      }
    }

    if (isImageMimeType(input.mimeType) || isPdfMimeType(input.mimeType)) {
      console.log('[analyzeEvidence] Starting vision analysis...');
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

        console.log('[analyzeEvidence] Vision analysis complete:', {
          detected_type: visionResult.detected_type,
          confidence: visionResult.confidence,
          fieldsCount: Object.keys(visionResult.extracted_fields || {}).length,
        });

        return {
          ...visionResult,
          warnings: [...(visionResult.warnings ?? []), ...warnings],
          // Use extracted PDF text if available (even if we fell back to vision for analysis)
          // This ensures classification can still use the text
          raw_text: extractedPdfText || visionResult.raw_text,
        };
      } catch (visionError: any) {
        console.error('[analyzeEvidence] Vision analysis failed:', visionError.message);
        warnings.push(`Vision analysis failed: ${visionError.message}`);
      }
    }

    return {
      detected_type: input.category || input.mimeType || 'unknown',
      extracted_fields: {},
      confidence: 0.1,
      warnings: ['Unsupported MIME type for analysis.'],
    };
  } catch (error: any) {
    return {
      detected_type: input.category || 'unknown',
      extracted_fields: {},
      confidence: 0.1,
      warnings: [`Evidence analysis failed: ${error.message}`],
    };
  }
}
