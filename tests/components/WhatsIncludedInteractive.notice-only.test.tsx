/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhatsIncludedInteractive } from '@/components/value-proposition/WhatsIncludedInteractive';
import type { NoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    unoptimized: _unoptimized,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    unoptimized?: boolean;
    [key: string]: unknown;
  }) => <img src={typeof src === 'string' ? src : src.src} alt={alt} {...rest} />,
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

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
  },
  scotland: {
    ...emptyNoticeVariantSet,
  },
};

describe('WhatsIncludedInteractive notice-only', () => {
  it('can lock the notice preview to England and hide other jurisdictions', () => {
    render(
      <WhatsIncludedInteractive
        product="notice_only"
        defaultJurisdiction="england"
        lockJurisdiction
        previews={noticePreviews}
      />,
    );

    expect(screen.queryByText('Jurisdiction')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'England' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Wales' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Scotland' })).not.toBeInTheDocument();
    expect(screen.getByText('Documents included in your pack')).toBeInTheDocument();
    expect(screen.getByText('Section 8 Eviction Notice')).toBeInTheDocument();
  });
});
