import type React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DocumentsPage from '@/app/(app)/dashboard/documents/page';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Dashboard Documents Page', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all tenancy pack document types from loader response', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        documents: [
          {
            id: 'doc-1',
            case_id: 'case-1',
            document_title: '',
            document_type: 'ast_agreement_hmo',
            is_preview: false,
            pdf_url: 'user/case/doc1.pdf',
            created_at: '2026-01-01T10:00:00.000Z',
          },
          {
            id: 'doc-2',
            case_id: 'case-1',
            document_title: '',
            document_type: 'inventory_schedule',
            is_preview: false,
            pdf_url: 'user/case/doc2.pdf',
            created_at: '2026-01-01T09:00:00.000Z',
          },
          {
            id: 'doc-3',
            case_id: 'case-1',
            document_title: '',
            document_type: 'pre_tenancy_checklist_england',
            is_preview: false,
            pdf_url: 'user/case/doc3.pdf',
            created_at: '2026-01-01T08:00:00.000Z',
          },
        ],
      }),
    } as Response);

    render(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Tenancy Agreement').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Inventory Schedule').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Pre-Tenancy Checklist (England)').length).toBeGreaterThan(0);
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/documents?is_preview=all&latest_per_type=false');
  });
});
