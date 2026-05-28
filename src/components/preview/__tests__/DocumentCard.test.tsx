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

  it('opens a protected sample preview modal when a preview URL is available', () => {
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

    fireEvent.load(screen.getByAltText('Preview of N1 claim form'));
    fireEvent.click(screen.getByText('Preview'));

    expect(screen.getByTitle('N1 claim form sample preview')).toHaveAttribute(
      'src',
      '/api/money-claim/embed/case-123?document_type=form_n1'
    );
    expect(screen.getByTitle('N1 claim form sample preview')).toHaveAttribute('sandbox', 'allow-scripts');
    expect(
      screen.getByText('Preview sample pages before payment. Unlock the full document pack after checkout.')
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

  it('keeps the sample preview available if only the thumbnail fails', () => {
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

    fireEvent.error(screen.getByAltText('Preview of N1 claim form'));
    fireEvent.click(screen.getByText('Preview'));

    expect(screen.getByTitle('N1 claim form sample preview')).toHaveAttribute(
      'src',
      '/api/money-claim/embed/case-123?document_type=form_n1'
    );
    expect(screen.queryByText('Preview temporarily unavailable')).not.toBeInTheDocument();
  });
});
