// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
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

vi.mock('@/components/layout/HeaderConfig', () => ({
  HeaderConfig: () => <div data-testid="header-config" />,
}));

vi.mock('@/components/seo/SeoLandingWrapper', () => ({
  SeoLandingWrapper: () => null,
}));

vi.mock('@/components/seo/FAQSection', () => ({
  FAQSection: ({ title }: { title: string }) => <section>{title}</section>,
}));

vi.mock('@/components/seo/RelatedLinks', () => ({
  RelatedLinks: ({ title }: { title: string }) => <section>{title}</section>,
}));

vi.mock('@/lib/previews/noticeOnlyPreviews', () => ({
  getNoticeOnlyPreviewData: async () => ({
    england: {
      section8: [
        {
          key: 'section-8-eviction-notice',
          title: 'Section 8 Eviction Notice',
          src: '/images/previews/notice-only/england/section8/section-8-eviction-notice.webp',
          alt: 'Section 8 eviction notice preview',
        },
        {
          key: 'rent-arrears-schedule',
          title: 'Rent Arrears Schedule',
          src: '/images/previews/notice-only/england/section8/rent arrears schedule.webp',
          alt: 'Rent arrears schedule preview',
        },
        {
          key: 'service-instructions',
          title: 'Service Instructions',
          src: '/images/previews/notice-only/england/section8/service instructions.webp',
          alt: 'Service instructions preview',
        },
        {
          key: 'validity-checklist',
          title: 'Validity Checklist',
          src: '/images/previews/notice-only/england/section8/validity checklist.webp',
          alt: 'Validity checklist preview',
        },
      ],
      section21: [
        {
          key: 'section21-form6a-eviction-notice',
          title: 'Section21 Form6A Eviction Notice',
          src: '/images/previews/notice-only/england/section21/section21 form6a eviction notice.webp',
          alt: 'Section 21 notice preview',
        },
        {
          key: 'service-instructions',
          title: 'Service Instructions',
          src: '/images/previews/notice-only/england/section21/service instructions.webp',
          alt: 'Section 21 service instructions preview',
        },
        {
          key: 'validity-checklist',
          title: 'Validity Checklist',
          src: '/images/previews/notice-only/england/section21/validity checklist.webp',
          alt: 'Section 21 validity checklist preview',
        },
      ],
    },
    wales: {
      section173: [],
      rhw23: [],
    },
    scotland: {
      'notice-to-leave': [],
    },
  }),
}));

describe('eviction notice template page', () => {
  it('puts the England notice preview and route guidance ahead of conversion CTAs', async () => {
    const pageModule = await import('@/app/eviction-notice-template/page');
    const Page = pageModule.default;

    render(await Page());

    const h1 = screen.getByRole('heading', {
      level: 1,
      name: 'Eviction Notice Template (England)',
    });
    const preview = screen.getByRole('heading', {
      level: 2,
      name: 'England notice bundle preview',
    });
    const routeGuidance = screen.getByRole('heading', {
      level: 2,
      name: 'Choose the right England notice route',
    });
    const section8 = screen.getByRole('heading', {
      level: 3,
      name: 'Section 8 Notice',
    });
    const section21 = screen.getByRole('heading', {
      level: 3,
      name: 'Section 21 legacy transition',
    });
    const noticeOnlyCta = screen.getByRole('link', {
      name: 'Start with Notice Only',
    });

    expect(h1).toBeInTheDocument();
    expect(preview).toBeInTheDocument();
    expect(routeGuidance).toBeInTheDocument();
    expect(section8).toBeInTheDocument();
    expect(section21).toBeInTheDocument();
    expect(noticeOnlyCta).toBeInTheDocument();

    expect(preview.compareDocumentPosition(routeGuidance) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(routeGuidance.compareDocumentPosition(section8) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(section8.compareDocumentPosition(section21) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(section21.compareDocumentPosition(noticeOnlyCta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
