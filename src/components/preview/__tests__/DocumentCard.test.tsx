// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DocumentCard } from '../DocumentCard';

describe('DocumentCard', () => {
  const baseDocument = {
    id: 'form-n1',
    title: 'N1 claim form',
    description: 'Court-ready claim form preview.',
    icon: 'court-form' as const,
    pages: '4 pages',
    category: 'Court form',
  };

  it('opens a watermarked preview modal when a preview URL is available', () => {
    render(
      <DocumentCard
        document={{
          ...baseDocument,
          thumbnailUrl: '/api/money-claim/thumbnail/case-123?document_type=form_n1',
          previewUrl: '/api/money-claim/embed/case-123?document_type=form_n1',
        }}
        isLocked
        onUnlock={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Preview'));

    expect(screen.getByTitle('N1 claim form full preview')).toHaveAttribute(
      'src',
      '/api/money-claim/embed/case-123?document_type=form_n1'
    );
    expect(
      screen.getByText('This is a watermarked preview. Downloads stay locked until payment.')
    ).toBeInTheDocument();
  });

  it('shows a clear unavailable state instead of opening a silent fallback', () => {
    render(
      <DocumentCard
        document={{
          ...baseDocument,
          previewUnavailableReason: 'Preview temporarily unavailable',
        }}
        isLocked
        onUnlock={vi.fn()}
      />
    );

    expect(screen.getAllByText('Preview temporarily unavailable')[0]).toBeInTheDocument();
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });
});
