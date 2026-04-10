import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  currentUser: null as { id: string } | null,
  caseRow: {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: 'user-1',
    case_type: 'rent_increase',
    jurisdiction: 'england',
    collected_facts: {
      section13: {
        selectedPlan: 'section13_standard',
      },
    },
  } as Record<string, any> | null,
  getSection13Comparables: vi.fn(),
  getDefaultSection13StateForCase: vi.fn(),
  computeSection13Preview: vi.fn(),
  generateSection13PreviewableDocument: vi.fn(),
  pdfBytesToPreviewThumbnail: vi.fn(),
}));

const caseId = '11111111-1111-1111-1111-111111111111';

function createQuery(table: string) {
  const filters: Record<string, unknown> = {};

  const builder: any = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      filters[column] = value;
      return builder;
    },
    single: async () => {
      if (table !== 'cases') {
        return { data: null, error: null };
      }

      const matchesCase =
        mocks.caseRow &&
        filters.id === mocks.caseRow.id &&
        (!('user_id' in filters) || filters.user_id === mocks.caseRow.user_id);

      return matchesCase
        ? { data: mocks.caseRow, error: null }
        : { data: null, error: { message: 'Case not found' } };
    },
  };

  return builder;
}

vi.mock('@/lib/supabase/server', () => ({
  tryGetServerUser: vi.fn(async () => mocks.currentUser),
  createAdminClient: vi.fn(() => ({
    from: (table: string) => createQuery(table),
  })),
  createServerSupabaseClient: vi.fn(async () => ({
    from: (table: string) => createQuery(table),
  })),
}));

vi.mock('@/lib/section13/server', () => ({
  getDefaultSection13StateForCase: mocks.getDefaultSection13StateForCase,
  getSection13Comparables: mocks.getSection13Comparables,
}));

vi.mock('@/lib/section13/rules', () => ({
  computeSection13Preview: mocks.computeSection13Preview,
}));

vi.mock('@/lib/documents/generator', () => ({
  pdfBytesToPreviewThumbnail: mocks.pdfBytesToPreviewThumbnail,
}));

vi.mock('@/lib/documents/section13-generator', () => ({
  SECTION13_CORE_DOCUMENT_TYPES: [
    'section13_form_4a',
    'section13_justification_report',
    'section13_proof_of_service_record',
    'section13_cover_letter',
  ],
  isSection13PreviewableDocumentType: vi.fn((documentType: string) =>
    [
      'section13_form_4a',
      'section13_justification_report',
      'section13_proof_of_service_record',
      'section13_cover_letter',
      'section13_tribunal_argument_summary',
      'section13_tribunal_defence_guide',
      'section13_landlord_response_template',
      'section13_legal_briefing',
      'section13_evidence_checklist',
      'section13_negotiation_email_template',
    ].includes(documentType)
  ),
  generateSection13PreviewableDocument: mocks.generateSection13PreviewableDocument,
}));

import { GET as getSection13Thumbnail } from '../thumbnail/[caseId]/route';

function callRoute(url: string) {
  return getSection13Thumbnail(new Request(url), {
    params: Promise.resolve({ caseId }),
  });
}

describe('Section 13 thumbnail route', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.currentUser = null;
    mocks.caseRow = {
      id: caseId,
      user_id: 'user-1',
      case_type: 'rent_increase',
      jurisdiction: 'england',
      collected_facts: {
        section13: {
          selectedPlan: 'section13_standard',
        },
      },
    };
    mocks.getSection13Comparables.mockResolvedValue([]);
    mocks.getDefaultSection13StateForCase.mockReturnValue({
      selectedPlan: 'section13_standard',
      preview: null,
    });
    mocks.computeSection13Preview.mockReturnValue({
      previewSummary: 'Preview summary',
    });
    mocks.generateSection13PreviewableDocument.mockResolvedValue({
      title: 'Form 4A rent increase notice',
      document_type: 'section13_form_4a',
      file_name: `section13-form-4a-${caseId}.pdf`,
      pdf: Buffer.from('%PDF-1.4 preview'),
    });
    mocks.pdfBytesToPreviewThumbnail.mockResolvedValue(Buffer.from('jpeg-binary'));
  });

  it('returns 400 when document_type is missing', async () => {
    const response = await callRoute(`http://localhost/api/section13/thumbnail/${caseId}`);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe('MISSING_DOCUMENT_TYPE');
  });

  it('returns 400 for unsupported document types', async () => {
    const response = await callRoute(
      `http://localhost/api/section13/thumbnail/${caseId}?document_type=section13_tribunal_bundle_zip`
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.code).toBe('INVALID_DOCUMENT_TYPE');
  });

  it('returns 404 when the case cannot be found', async () => {
    mocks.caseRow = null;

    const response = await callRoute(
      `http://localhost/api/section13/thumbnail/${caseId}?document_type=section13_form_4a`
    );
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.code).toBe('CASE_NOT_FOUND');
  });

  it('returns a thumbnail for a standard Section 13 document', async () => {
    const response = await callRoute(
      `http://localhost/api/section13/thumbnail/${caseId}?document_type=section13_form_4a`
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    expect(mocks.generateSection13PreviewableDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId,
        documentType: 'section13_form_4a',
        productType: 'section13_standard',
      })
    );
  });

  it('forces defensive product generation for defensive-only documents', async () => {
    const response = await callRoute(
      `http://localhost/api/section13/thumbnail/${caseId}?document_type=section13_tribunal_argument_summary`
    );

    expect(response.status).toBe(200);
    expect(mocks.generateSection13PreviewableDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId,
        documentType: 'section13_tribunal_argument_summary',
        productType: 'section13_defensive',
      })
    );
  });
});
