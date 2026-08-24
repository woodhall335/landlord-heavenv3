/**
 * @vitest-environment jsdom
 */
/* eslint-disable @next/next/no-img-element */

import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AssistedPrepAllServiceDetails, AssistedPrepServiceDetails } from '../AssistedPrepServiceDetails';

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

  it('renders the shared scope and questions once when both services are shown together', () => {
    render(<AssistedPrepAllServiceDetails />);

    expect(screen.getAllByRole('heading', { name: 'Clear scope' })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: 'Common questions about assisted prep' })).toHaveLength(1);
    expect(screen.getAllByRole('heading', { name: 'How the free consultation becomes a prepared document file' })).toHaveLength(1);
    expect(screen.queryByRole('heading', { name: 'How we take the pressure off' })).not.toBeInTheDocument();
  });

  it('explains the correct role of Form N119 in possession preparation', () => {
    render(<AssistedPrepServiceDetails service="possession" showCta={false} />);

    expect(screen.getByText(/N119 is the particulars-of-claim form, not the tenant’s defence form/i)).toBeInTheDocument();
  });
});
