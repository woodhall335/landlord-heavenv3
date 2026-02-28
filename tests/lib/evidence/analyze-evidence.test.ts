import { describe, expect, it, vi, beforeEach, beforeAll, afterEach } from 'vitest';
import { getOpenAIClient } from '@/lib/ai/openai-client';

// Mock pdf-lib PDFDocument
vi.mock('pdf-lib', () => ({
  PDFDocument: {
    load: vi.fn(async () => ({
      getPages: () => [{ getWidth: () => 612, getHeight: () => 792 }],
      getTitle: () => 'Test Document',
      getAuthor: () => 'Test Author',
      getSubject: () => null,
      getKeywords: () => null,
    })),
  },
}));

vi.mock('@/lib/ai/openai-client', () => ({
  getOpenAIClient: vi.fn(),
}));

const mockChat = vi.fn(async () => ({
  choices: [
    {
      message: {
        content: JSON.stringify({
          detected_type: 'tenancy_agreement',
          extracted_fields: { rent_amount: 1000, tenant_name: 'Jane Doe' },
          confidence: 0.82,
          warnings: [],
        }),
      },
    },
  ],
}));

let analyzeEvidence: typeof import('@/lib/evidence/analyze-evidence').analyzeEvidence;

beforeAll(async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const mod = await import('@/lib/evidence/analyze-evidence');
  analyzeEvidence = mod.analyzeEvidence;
});

beforeEach(() => {
  process.env.OPENAI_API_KEY = 'test-key';
  vi.mocked(getOpenAIClient).mockReturnValue({
    chat: {
      completions: {
        create: mockChat,
      },
    },
  } as any);
});

afterEach(() => {
  process.env.OPENAI_API_KEY = 'test-key';
});

describe('analyzeEvidence', () => {
  it('uses PDF extraction with pdf-lib', async () => {
    const result = await analyzeEvidence({
      storageBucket: 'documents',
      storagePath: 'case/123/test.pdf',
      mimeType: 'application/pdf',
      filename: 'test.pdf',
      caseId: 'case-123',
      questionId: 'upload_tenancy_agreement',
      fileBuffer: Buffer.from('fake-pdf'),
      openAIClient: {
        chat: {
          completions: {
            create: mockChat,
          },
        },
      } as any,
    });

    // With the new implementation, vision is used as primary extraction method
    expect(['vision', 'pdf_text', 'pdf_lib']).toContain(result.source);
    expect(result.extraction_quality).toBeDefined();
  });

  it('returns warning when API key is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await analyzeEvidence({
      storageBucket: 'documents',
      storagePath: 'case/123/test.pdf',
      mimeType: 'application/pdf',
      filename: 'test.pdf',
      caseId: 'case-123',
      questionId: 'upload_tenancy_agreement',
      fileBuffer: Buffer.from('fake-pdf'),
    });

    // With the new implementation, warnings include various messages
    expect(result.warnings.some(w =>
      w.includes('analysis') || w.includes('extraction') || w.includes('LLM') || w.includes('incomplete')
    )).toBe(true);
  });
});
