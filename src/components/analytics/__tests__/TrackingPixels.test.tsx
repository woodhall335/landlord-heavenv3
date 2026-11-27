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
  it('loads the supplied Clarity project once without requiring other tracking IDs', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', '');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADS_ID', '');
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', '');
    vi.stubEnv('NEXT_PUBLIC_DISABLE_JOURNEY_ANALYTICS', 'false');
    const { container } = render(<TrackingPixels />);
    const scripts = container.querySelectorAll('[data-testid="microsoft-clarity"]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].textContent).toContain('https://www.clarity.ms/tag/');
    expect(scripts[0].textContent).toContain('v23tn3v249');
  });

  it('honours the existing analytics disable flag for Clarity', () => {
    vi.stubEnv('NEXT_PUBLIC_DISABLE_JOURNEY_ANALYTICS', 'true');
    const { container } = render(<TrackingPixels />);
    expect(container.querySelector('[data-testid="microsoft-clarity"]')).toBeNull();
  });

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

  it('omits placeholder tracking IDs from production markup', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_MEASUREMENT_ID', 'G-XXXXXXXXX');
    vi.stubEnv('NEXT_PUBLIC_GOOGLE_ADS_ID', 'AW-XXXXXXXXX');
    vi.stubEnv('NEXT_PUBLIC_FB_PIXEL_ID', '123456789012345');

    const markup = renderToStaticMarkup(<TrackingPixels />);

    expect(markup).not.toContain('G-XXXXXXXXX');
    expect(markup).not.toContain('AW-XXXXXXXXX');
    expect(markup).not.toContain('123456789012345');
    expect(markup).not.toContain('googletagmanager.com/gtag/js');
    expect(markup).not.toContain('connect.facebook.net/en_US/fbevents.js');
  });
});
