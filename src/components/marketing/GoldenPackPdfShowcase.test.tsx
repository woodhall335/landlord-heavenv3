/**
 * @vitest-environment jsdom
 */

import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GoldenPackPdfShowcase } from './GoldenPackPdfShowcase';

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({
    isOpen,
    title,
    children,
  }: {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
  }) => (isOpen ? <div aria-label={title}>{children}</div> : null),
}));

describe('GoldenPackPdfShowcase', () => {
  it('renders a left-hand document list and switches the main preview when a document is selected', () => {
    render(
      <GoldenPackPdfShowcase
        entries={[
          {
            title: 'Form 3A Notice',
            categoryLabel: 'Official notice',
            pageCount: 6,
            description: 'Official Form 3A notice for England possession proceedings.',
            excerpt: 'Form 3A Notice seeking possession of a property let on an assured tenancy.',
            pdfHref: '/sample/form-3a.pdf',
            embedHref: '/sample/form-3a/embed',
            thumbnailHref: '/sample/form-3a-thumb.jpg',
          },
          {
            title: 'Arrears Schedule',
            categoryLabel: 'Supporting record',
            pageCount: 3,
            description: 'Period-by-period breakdown of rent arrears.',
            excerpt: 'Schedule of arrears showing each missed rent period and running balance.',
            pdfHref: '/sample/arrears.pdf',
            embedHref: '/sample/arrears/embed',
            thumbnailHref: '/sample/arrears-thumb.jpg',
          },
        ]}
      />
    );

    expect(screen.getByText(/Documents in this sample pack/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Choose a document from the list to load its full sample preview/i)
    ).toBeInTheDocument();
    expect(
      screen.getByTitle('Form 3A Notice embedded sample preview')
    ).toHaveAttribute('src', '/sample/form-3a/embed');
    expect(
      screen.getAllByText(/Official Form 3A notice for England possession proceedings\./i).length
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Arrears Schedule/i }));

    expect(
      screen.getByTitle('Arrears Schedule embedded sample preview')
    ).toHaveAttribute('src', '/sample/arrears/embed');
    expect(screen.getAllByText(/Period-by-period breakdown of rent arrears\./i).length).toBeGreaterThan(0);
    expect(
      screen.queryByText(/Schedule of arrears showing each missed rent period and running balance\./i)
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Open larger preview/i }));

    expect(screen.getByLabelText('Arrears Schedule')).toBeInTheDocument();
    expect(
      screen.getAllByTitle('Arrears Schedule embedded sample preview').every((frame) =>
        frame.getAttribute('src') === '/sample/arrears/embed'
      )
    ).toBe(true);
  });

  it('keeps PDF embed zoom controls stacked on mobile', () => {
    const embedRouteSource = fs.readFileSync(
      path.join(
        process.cwd(),
        'src/app/api/golden-pack-samples/[packKey]/[documentType]/embed/route.ts'
      ),
      'utf8'
    );
    const documentEmbedShellSource = fs.readFileSync(
      path.join(process.cwd(), 'src/lib/previews/documentEmbedShell.ts'),
      'utf8'
    );

    for (const source of [embedRouteSource, documentEmbedShellSource]) {
      expect(source).toContain('@media (max-width: 640px)');
      expect(source).toContain('.toolbar-actions');
      expect(source).toContain('flex-direction: column');
      expect(source).toContain('width: 100%');
    }
  });
});
