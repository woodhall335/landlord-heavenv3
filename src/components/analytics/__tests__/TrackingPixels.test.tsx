/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';

vi.mock('next/script', () => ({
  default: ({
    id,
    src,
    children,
  }: {
    id?: string;
    src?: string;
    children?: React.ReactNode;
  }) => (
    <script data-testid={id || src || 'script'} data-src={src}>
      {children}
    </script>
  ),
}));

import { TrackingPixels } from '../TrackingPixels';

describe('TrackingPixels', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    cleanup();
  });

  it('omits the Facebook Pixel when no env var is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADS_ID', '');
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', '');

    const { container } = render(<TrackingPixels />);

    expect(container.querySelector('[data-testid="fb-pixel"]')).toBeNull();
    expect(container.querySelector('img[src*="facebook.com/tr?id="]')).toBeNull();
  });

  it('renders matching JavaScript and noscript Facebook Pixel IDs when configured', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADS_ID', '');
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', '1234567890');

    const markup = renderToStaticMarkup(<TrackingPixels />);

    expect(markup).toContain("fbq('init', '1234567890')");
    expect(markup).toContain(
      'https://www.facebook.com/tr?id=1234567890&amp;ev=PageView&amp;noscript=1'
    );
  });
});
