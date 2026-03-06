/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FunnelProcessSection } from '@/components/funnels/FunnelProcessSection';
import type { NoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';

const emptyNoticeVariantSet = {
  section21: [],
  section8: [],
  section173: [],
  rhw23: [],
  'notice-to-leave': [],
};

const noticePreviews: NoticeOnlyPreviewData = {
  england: {
    ...emptyNoticeVariantSet,
    section21: [
      {
        key: 'section21 form6a eviction notice',
        title: 'Section 21 Form 6A Eviction Notice',
        src: '/images/previews/notice-only/england/section21/section21 form6a eviction notice.webp',
        alt: 'Section 21 notice',
      },
    ],
    section8: [
      {
        key: 'section-8-eviction-notice',
        title: 'Section 8 Eviction Notice',
        src: '/images/previews/notice-only/england/section8/section-8-eviction-notice.webp',
        alt: 'Section 8 notice',
      },
    ],
  },
  wales: {
    ...emptyNoticeVariantSet,
    section173: [
      {
        key: 'section173_notice -2',
        title: 'Section 173 Notice',
        src: '/images/previews/notice-only/wales/section173/section173_notice -2.webp',
        alt: 'Section 173 notice',
      },
    ],
    rhw23: [
      {
        key: 'eviction_notice',
        title: 'Eviction Notice',
        src: '/images/previews/notice-only/wales/rhw23/eviction_notice.webp',
        alt: 'RHW23 notice',
      },
    ],
  },
  scotland: {
    ...emptyNoticeVariantSet,
  },
};

describe('FunnelProcessSection', () => {
  it('shows CTA link, arrows, and route-selected carousel content for notice-only', () => {
    render(<FunnelProcessSection product="notice_only" noticePreviews={noticePreviews} />);

    expect(screen.getByText('Understand Why Each Notice Document Matters')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Generate your notice now' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Section 21 \(No-fault\)/i }));

    const cta = screen.getByRole('link', { name: 'Generate your notice now' });
    expect(cta).toHaveAttribute(
      'href',
      'https://landlordheaven.co.uk/wizard?product=notice_only&src=product_page&topic=eviction',
    );

    expect(screen.getByLabelText('Previous slide desktop')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide desktop')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous slide mobile')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide mobile')).toBeInTheDocument();

    expect(screen.getAllByText('Section 21 Form 6A Eviction Notice').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Section 8 \(Fault-based\)/i }));
    expect(screen.getAllByText('Section 8 Eviction Notice').length).toBeGreaterThan(0);
  });

  it('renders complete-pack under an England tab with both route cards and the correct CTA URL', () => {
    render(<FunnelProcessSection product="complete_pack" />);

    expect(screen.getByRole('tab', { name: 'England' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Section 21 Route' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Section 8 Route' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Section 21 -> N5B/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Section 8 -> N5 \+ N119/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Section 21 -> N5B/i }));

    const cta = screen.getByRole('link', { name: 'Generate your complete eviction pack now' });
    expect(cta).toHaveAttribute(
      'href',
      'https://landlordheaven.co.uk/wizard?product=complete_pack&src=product_page&topic=eviction',
    );
  });

  it('renders fallback content and money-claim CTA with slide controls', () => {
    render(<FunnelProcessSection product="money_claim" moneyClaimPreviews={[]} />);

    expect(screen.getAllByText('Form N1 Claim Form').length).toBeGreaterThan(0);
    expect(screen.getAllByText('What it does').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Why this matters').length).toBeGreaterThan(0);

    const cta = screen.getByRole('link', { name: 'Start your money claim now' });
    expect(cta).toHaveAttribute(
      'href',
      'https://landlordheaven.co.uk/wizard?product=money_claim&topic=debt&src=product_page',
    );

    expect(screen.getByLabelText('Previous slide desktop')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide desktop')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous slide mobile')).toBeInTheDocument();
    expect(screen.getByLabelText('Next slide mobile')).toBeInTheDocument();
  });
});
