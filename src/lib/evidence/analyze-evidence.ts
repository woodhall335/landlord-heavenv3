import { z } from 'zod';
import { getOpenAIClient } from '@/lib/ai/openai-client';
import { isPdfMimeType, isImageMimeType } from '@/lib/evidence/schema';
import puppeteer from 'puppeteer';

// pdf-parse is a CommonJS module, use dynamic import
async function getPdfParser(): Promise<(buffer: Buffer) => Promise<{ text: string }>> {
  const pdfParse = await import('pdf-parse').then((m) => m.default || m);
  return pdfParse;
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

function buildPrompt(context: {
  filename: string;
  mimeType: string;
  category?: string | null;
  questionId?: string | null;
  caseId: string;
  extra?: string;
}): string {
  const { filename, mimeType, category, questionId, caseId, extra } = context;
  return `You are a UK landlord-tenant document extraction assistant.\n\n` +
    `Return ONLY JSON with keys: detected_type, extracted_fields, confidence, warnings.\n` +
    `Document types (detected_type) must be one of: tenancy, s21_notice, s8_notice, rent_schedule, bank_statement, arrears_ledger, correspondence, gas_safety_certificate, epc, deposit_certificate, prescribed_info, how_to_rent, other.\n` +
    `Do not guess; if unsure, leave fields blank.\n\n` +
    `Case: ${caseId}\n` +
    `Question: ${questionId ?? 'unknown'}\n` +
    `Category: ${category ?? 'unspecified'}\n` +
    `Filename: ${filename}\n` +
    `Mime: ${mimeType}\n` +
    `${extra ?? ''}`;
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
  const pdfParse = await getPdfParser();
  const data = await pdfParse(buffer);
  return data.text || '';
}

async function renderPdfPagesToImages(buffer: Buffer, maxPages: number): Promise<string[]> {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    const base64Pdf = buffer.toString('base64');
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>body{margin:0;padding:0}</style>
  <script src="https://unpkg.com/pdfjs-dist@4.7.76/build/pdf.min.js"></script>
</head>
<body>
  <canvas id="page"></canvas>
  <script>
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.7.76/build/pdf.worker.min.js';
    async function renderPages() {
      const pdfData = atob('${base64Pdf}');
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      const max = Math.min(pdf.numPages, ${maxPages});
      const results = [];
      for (let i = 1; i <= max; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.4 });
        const canvas = document.getElementById('page');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        results.push(canvas.toDataURL('image/png'));
      }
      return results;
    }
    window.renderPages = renderPages;
  </script>
</body>
</html>`;
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const dataUrls = await page.evaluate(async () => {
      // @ts-ignore
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

  if (!process.env.OPENAI_API_KEY) {
    return {
      detected_type: input.category || 'unknown',
      extracted_fields: {},
      confidence: 0,
      warnings: ['OpenAI API key missing; analysis skipped.'],
    };
  }

  try {
    const buffer = await loadBuffer(input);
    const client = input.openAIClient ?? getOpenAIClient();
    const prompt = buildPrompt({
      filename: input.filename,
      mimeType: input.mimeType,
      category: input.category,
      questionId: input.questionId,
      caseId: input.caseId,
    });

    if (isPdfMimeType(input.mimeType)) {
      try {
        const text = await withTimeout(extractPdfText(buffer), 5000, 'PDF text extraction');
        const normalizedText = text?.trim() ?? '';
        if (normalizedText.length > 0) {
          const trimmed = text.slice(0, MAX_TEXT_CHARS);
          try {
            const result = await withTimeout(
              extractViaText({ text: trimmed, prompt, client }),
              15000,
              'Text analysis'
            );
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
        warnings.push('PDF text extraction returned insufficient text; falling back to vision.');
      } catch (error: any) {
        warnings.push(`PDF text extraction failed: ${error.message}`);
      }
    }

    if (isImageMimeType(input.mimeType) || isPdfMimeType(input.mimeType)) {
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

      return {
        ...visionResult,
        warnings: [...(visionResult.warnings ?? []), ...warnings],
        raw_text: visionResult.raw_text,
      };
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
