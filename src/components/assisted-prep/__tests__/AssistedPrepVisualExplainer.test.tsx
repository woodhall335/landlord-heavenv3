/**
 * @vitest-environment jsdom
 */
/* eslint-disable @next/next/no-img-element */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssistedPrepVisualExplainer } from '../AssistedPrepVisualExplainer';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe('AssistedPrepVisualExplainer', () => {
  it.each([
    ['overview', '/images/illustrations/services/assisted-prep-consultation-waterbrush-v2.webp'],
    ['section8', '/images/illustrations/services/section8-service-evidence-waterbrush-v2.webp'],
    ['possession', '/images/illustrations/services/possession-court-evidence-waterbrush-v2.webp'],
  ] as const)('uses the bespoke %s waterbrush illustration', (service, assetPath) => {
    render(<AssistedPrepVisualExplainer service={service} />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      assetPath
    );
  });
});
