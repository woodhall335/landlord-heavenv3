/**
 * @vitest-environment jsdom
 */
/* eslint-disable @next/next/no-img-element */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AssistedPrepServiceDetails } from '../AssistedPrepServiceDetails';

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

describe('AssistedPrepServiceDetails', () => {
  it.each([
    [
      'section8',
      'assisted-section8-notice-watercolor-v1.png',
      'assisted-section8-process-watercolor-v1.png',
    ],
    [
      'possession',
      'assisted-possession-claim-watercolor-v1.png',
      'assisted-possession-process-watercolor-v1.png',
    ],
  ] as const)('keeps only the %s process illustration with the service explanation', (service, primaryImage, processImage) => {
    render(<AssistedPrepServiceDetails service={service} showCta={false} />);

    const images = screen.getAllByRole('img');
    expect(images.some((image) => image.getAttribute('src')?.endsWith(primaryImage))).toBe(false);
    expect(images.some((image) => image.getAttribute('src')?.endsWith(processImage))).toBe(true);
  });
});
