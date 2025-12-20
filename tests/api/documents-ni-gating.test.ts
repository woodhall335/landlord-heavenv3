import { describe, expect, it, beforeEach, vi } from 'vitest';
import { POST as generateDocument } from '@/app/api/documents/generate/route';

// Mock document generators to avoid execution
vi.mock('@/lib/documents/generator', () => ({
  generateDocument: vi.fn(async () => ({
    html: '<html>Mock</html>',
    pdf: Buffer.from('mock-pdf'),
  })),
}));

vi.mock('@/lib/documents/section8-generator', () => ({
  generateSection8Notice: vi.fn(async () => ({ html: '<html>Mock Section 8</html>', pdf: Buffer.from('mock') })),
}));

vi.mock('@/lib/documents/ast-generator', () => ({
  generateStandardAST: vi.fn(async () => ({ html: '<html>Mock AST</html>', pdf: Buffer.from('mock') })),
  generatePremiumAST: vi.fn(async () => ({ html: '<html>Mock Premium AST</html>', pdf: Buffer.from('mock') })),
}));

vi.mock('@/lib/documents/scotland/notice-to-leave-generator', () => ({
  generateNoticeToLeave: vi.fn(async () => ({ html: '<html>Mock</html>', pdf: Buffer.from('mock') })),
}));

vi.mock('@/lib/documents/scotland/prt-generator', () => ({
  generatePRTAgreement: vi.fn(async () => ({ html: '<html>Mock</html>', pdf: Buffer.from('mock') })),
}));

vi.mock('@/lib/documents/scotland/wizard-mapper', () => ({
  mapWizardToNoticeToLeave: vi.fn(() => ({})),
}));

vi.mock('@/lib/documents/northern-ireland/private-tenancy-generator', () => ({
  generatePrivateTenancyAgreement: vi.fn(async () => ({ html: '<html>Mock</html>', pdf: Buffer.from('mock') })),
}));

const supabaseClientMock = {
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  single: vi.fn(),
  eq: vi.fn(),
  is: vi.fn(),
};

supabaseClientMock.from.mockReturnValue(supabaseClientMock);
supabaseClientMock.insert.mockReturnValue(supabaseClientMock);
supabaseClientMock.select.mockReturnValue(supabaseClientMock);
supabaseClientMock.eq.mockReturnValue(supabaseClientMock);
supabaseClientMock.is.mockReturnValue(supabaseClientMock);

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseClientMock),
  requireServerAuth: vi.fn(async () => ({ id: 'user-1' })),
  createAdminClient: vi.fn(() => ({
    storage: {
      from: () => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ publicUrl: 'https://example.com/doc.pdf' })),
      }),
    },
  })),
}));

describe('Document generation Northern Ireland gating', () => {
  const validCaseId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    vi.clearAllMocks();
    supabaseClientMock.single.mockResolvedValue({
      data: {
        id: validCaseId,
        jurisdiction: 'northern-ireland',
        case_type: 'eviction',
        collected_facts: {},
        user_id: null,
      },
      error: null,
    });
  });

  it('rejects NI eviction document generation requests', async () => {
    const response = await generateDocument(
      new Request('http://localhost/api/documents/generate', {
        method: 'POST',
        body: JSON.stringify({
          case_id: validCaseId,
          document_type: 'section8_notice',
        }),
      })
    );

    const body = await response.json();
    expect(response.status).toBe(422);
    expect(body.code).toBe('NI_EVICTION_MONEY_CLAIM_NOT_SUPPORTED');
    expect(body.error).toBe('Northern Ireland eviction and money claim documents are not yet supported');
    expect(body.user_message).toContain('We currently support tenancy agreements for Northern Ireland');
    expect(body).toHaveProperty('blocking_issues');
    expect(body).toHaveProperty('warnings');
    expect(Array.isArray(body.blocking_issues)).toBe(true);
    expect(Array.isArray(body.warnings)).toBe(true);
    expect(supabaseClientMock.from).toHaveBeenCalledWith('cases');
  });
});
