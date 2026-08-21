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
    ['overview', 'assisted-prep-consultation-watercolor-v1.png'],
    ['section8', 'assisted-section8-notice-watercolor-v1.png'],
    ['possession', 'assisted-possession-claim-watercolor-v1.png'],
  ] as const)('uses the bespoke %s watercolour illustration', (service, assetName) => {
    render(<AssistedPrepVisualExplainer service={service} />);

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      `/images/generated/assisted-prep/${assetName}`
    );
  });
});
