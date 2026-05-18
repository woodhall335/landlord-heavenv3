/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { GoldenPackProofData } from '@/lib/marketing/golden-pack-proof';
import { GoldenPackProof } from './GoldenPackProof';

const proofDataWithoutPdfs: GoldenPackProofData = {
  key: 'section13_standard',
  displayName: 'Supported Rent Increase Pack',
  versionToken: 'test',
  documentCount: 2,
  totalPages: 9,
  allEntries: [
    {
      documentType: 'form_4a',
      title: 'Form 4A rent increase notice',
      description: 'Section 13 notice generated with the landlord facts and proposed rent.',
      categoryLabel: 'Official notice',
      pageCount: 4,
    },
    {
      documentType: 'market_evidence',
      title: 'Market evidence summary',
      description: 'Comparable rental evidence organised around the proposed increase.',
      categoryLabel: 'Evidence tool',
      pageCount: 5,
    },
  ],
  featuredEntries: [
    {
      documentType: 'form_4a',
      title: 'Form 4A rent increase notice',
      description: 'Section 13 notice generated with the landlord facts and proposed rent.',
      categoryLabel: 'Official notice',
      pageCount: 4,
    },
  ],
  remainingTitles: ['Market evidence summary'],
};

describe('GoldenPackProof', () => {
  it('keeps sample-preview positioning visible when a pack has no embedded PDF samples yet', () => {
    render(
      <GoldenPackProof
        data={proofDataWithoutPdfs}
        samplePageHref="/samples/section13-standard"
        samplePageLabel="View sample output"
      />
    );

    expect(screen.getByText('Sample document preview')).toBeInTheDocument();
    expect(screen.getByText(/Inspect the sample pack before you pay/i)).toBeInTheDocument();
    expect(screen.getByText(/Review the documents this pack is designed to produce/i)).toBeInTheDocument();
    expect(screen.getByText('Form 4A rent increase notice')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View sample output' })).toHaveAttribute(
      'href',
      '/samples/section13-standard'
    );
  });

  it('renders the preview section from fallback entries when production proof data is unavailable', () => {
    render(
      <GoldenPackProof
        data={null}
        fallbackEntries={[
          {
            title: 'Current comparable rental evidence',
            description: 'Nearby advertised rental properties used to support the proposed figure.',
          },
        ]}
      />
    );

    expect(screen.getByText('Sample document preview')).toBeInTheDocument();
    expect(screen.getByText(/Inspect the sample pack before you pay/i)).toBeInTheDocument();
    expect(screen.getByText('Current comparable rental evidence')).toBeInTheDocument();
    expect(screen.getByText(/Nearby advertised rental properties/i)).toBeInTheDocument();
  });
});
