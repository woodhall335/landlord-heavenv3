import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { EnglandNoticePreview } from '@/components/seo/EnglandNoticePreview';
import { getNoticeOnlyPreviewData } from '@/lib/previews/noticeOnlyPreviews';

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

describe('EnglandNoticePreview server rendering', () => {
  it('renders crawler-visible notice guidance for the live and legacy England routes', async () => {
    const previews = await getNoticeOnlyPreviewData();
    const markup = renderToStaticMarkup(<EnglandNoticePreview previews={previews} />);
    const plainText = markup
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    [
      'England notice bundle preview',
      'Section 8 notice bundle preview',
      'Section 21 legacy bundle preview',
      'Service Instructions',
      'Validity Checklist',
    ].forEach((text) => {
      expect(markup).toContain(text);
    });

    expect(markup).toContain('section-8-eviction-notice.webp');
    expect(markup).toContain('section21 form6a eviction notice.webp');
    expect(plainText).toContain('Section 8 is the main live notice route in England.');
    expect(plainText).toContain('Section 21 is retained here as a legacy transition route.');
    expect(plainText.split(' ').length).toBeGreaterThan(450);
    expect(markup.indexOf('Section 8 notice bundle preview')).toBeLessThan(
      markup.indexOf('Section 21 legacy bundle preview')
    );
  });
});
