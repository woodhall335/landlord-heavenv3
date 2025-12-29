import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest';
import { getOpenAIClient } from '@/lib/ai/openai-client';
import pdfParse from 'pdf-parse';

vi.mock('pdf-parse', () => ({
  default: vi.fn(async () => ({
    text: 'Tenancy Agreement\nRent: 1000\nTenant: Jane Doe\nLandlord: John Smith\nProperty: 10 High Street\nTerm: 12 months\nDeposit: 1000',
  })),
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
const mockedPdfParse = vi.mocked(pdfParse);

beforeAll(async () => {
  process.env.OPENAI_API_KEY = 'test-key';
  const module = await import('@/lib/evidence/analyze-evidence');
  analyzeEvidence = module.analyzeEvidence;
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

describe('analyzeEvidence', () => {
  it('uses PDF text extraction when available', async () => {
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

    expect(mockedPdfParse).toHaveBeenCalled();
    expect(mockChat).toHaveBeenCalled();
    expect(result.source).toBe('pdf_text');
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

    expect(result.warnings[0]).toContain('OpenAI API key missing');
  });
});
