import { describe, expect, it, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/wizard/upload-evidence/route';

const mockUpdateWizardFacts = vi.fn();
const mockGetOrCreateWizardFacts = vi.fn();
const mockAnalyzeEvidence = vi.fn();
const mockApplyDocumentIntelligence = vi.fn();
const mockRunLegalValidator = vi.fn();

vi.mock('@/lib/case-facts/store', () => ({
  updateWizardFacts: (...args: any[]) => mockUpdateWizardFacts(...args),
  getOrCreateWizardFacts: (...args: any[]) => mockGetOrCreateWizardFacts(...args),
}));

vi.mock('@/lib/evidence/analyze-evidence', () => ({
  analyzeEvidence: (...args: any[]) => mockAnalyzeEvidence(...args),
}));

vi.mock('@/lib/wizard/document-intel', () => ({
  applyDocumentIntelligence: (...args: any[]) => mockApplyDocumentIntelligence(...args),
}));

vi.mock('@/lib/validators/run-legal-validator', () => ({
  runLegalValidator: (...args: any[]) => mockRunLegalValidator(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'cases') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: 'case-1', user_id: 'user-1', jurisdiction: 'england' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'documents') {
        return {
          insert: () => ({
            select: () => ({
              single: async () => ({
                data: { id: 'doc-1', document_title: 'doc.pdf', document_type: 'evidence', pdf_url: 'path', created_at: 'now' },
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        createSignedUrl: async () => ({ data: { signedUrl: 'https://signed.example' }, error: null }),
      }),
    },
  }),
  getServerUser: async () => ({ id: 'user-1' }),
}));

describe('upload-evidence route analysis', () => {
  let factsState: Record<string, any>;

  beforeEach(() => {
    factsState = {};
    mockUpdateWizardFacts.mockImplementation(async (_client: any, _caseId: string, updater: any) => {
      factsState = updater(factsState);
      return factsState;
    });
    mockGetOrCreateWizardFacts.mockImplementation(async () => factsState);
    mockAnalyzeEvidence.mockResolvedValue({ detected_type: 'tenancy_agreement', extracted_fields: { tenant_name: 'Jane' }, confidence: 0.9, warnings: [] });
    mockApplyDocumentIntelligence.mockReturnValue({ facts: { __meta: { product: 'notice_only' }, tenant_full_name: 'Jane' } });
    mockRunLegalValidator.mockReturnValue({
      validator_key: 'section_21',
      result: { status: 'warning', blockers: [], warnings: [{ code: 'S21', message: 'Check' }], upsell: null },
      recommendations: [{ code: 'BLOCKERS_PRESENT', message: 'Resolve issues' }],
      missing_questions: [
        {
          id: 'deposit_protected',
          factKey: 'deposit_protected',
          type: 'yes_no',
          question: 'Was the tenant’s deposit protected?',
          required: true,
        },
      ],
    });
  });

  it('returns analysis, intel, and validation in response', async () => {
    const formData = new FormData();
    formData.append('caseId', 'case-1');
    formData.append('questionId', 'upload_tenancy_agreement');
    formData.append('file', new File([Buffer.from('pdf')], 'doc.pdf', { type: 'application/pdf' }));

    const request = new Request('http://localhost/api/wizard/upload-evidence', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.validation_summary.status).toBe('warning');
    expect(payload.evidence.analysis.detected_type).toBe('tenancy_agreement');
    expect(payload.next_questions.length).toBe(1);
    expect(payload.next_questions[0].factKey).toBeDefined();
    expect(payload.recommendations.length).toBe(1);
    expect(payload.document_intel).toBeTruthy();
    expect(factsState.evidence?.analysis).toBeTruthy();
    expect(factsState.validation_summary?.status).toBe('warning');
  });
});
