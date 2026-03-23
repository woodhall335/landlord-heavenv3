/**
 * @vitest-environment jsdom
 */

import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { TenancyAgreementPreviewData } from '@/lib/previews/tenancyAgreementPreviews';
import { WhatsIncludedInteractive } from './WhatsIncludedInteractive';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    unoptimized: _unoptimized,
    ...props
  }: {
    src: string;
    alt: string;
    unoptimized?: boolean;
  }) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const previews: TenancyAgreementPreviewData = {
  england: {
    standard: [
      {
        key: 'ast_agreement',
        title: 'Assured Periodic Tenancy Agreement',
        description: 'Core England agreement preview.',
        src: '/images/previews/tenancy-agreement/england/standard/tenancy-agreement-preview.webp',
        alt: 'England standard agreement preview',
      },
    ],
    premium: [
      {
        key: 'ast_agreement_hmo',
        title: 'Premium Assured Periodic Tenancy Agreement',
        description: 'Broader drafting for more complex England lets.',
        src: '/images/previews/tenancy-agreement/england/premium/tenancy-agreement-preview.webp',
        alt: 'England premium agreement preview',
      },
      {
        key: 'key_schedule',
        title: 'Key Receipt & Handover Schedule',
        description: 'Premium support document preview.',
        src: '/images/previews/tenancy-agreement/england/premium/key-schedule-preview.webp',
        alt: 'England premium key schedule preview',
      },
    ],
  },
  wales: {
    standard: [
      {
        key: 'soc_agreement',
        title: 'Standard Occupation Contract',
        description: 'Core Wales agreement preview.',
        src: '/images/previews/tenancy-agreement/wales/standard/occupation-contract-preview.webp',
        alt: 'Wales standard agreement preview',
      },
    ],
    premium: [
      {
        key: 'soc_agreement_hmo',
        title: 'Premium Occupation Contract',
        description: 'Broader drafting for more complex Welsh lets.',
        src: '/images/previews/tenancy-agreement/wales/premium/occupation-contract-preview.webp',
        alt: 'Wales premium agreement preview',
      },
      {
        key: 'checkout_procedure',
        title: 'Checkout Procedure',
        description: 'Premium support document preview.',
        src: '/images/previews/tenancy-agreement/wales/premium/checkout-procedure-preview.webp',
        alt: 'Wales premium checkout preview',
      },
    ],
  },
  scotland: {
    standard: [
      {
        key: 'prt_agreement',
        title: 'Private Residential Tenancy Agreement',
        description: 'Core Scotland agreement preview.',
        src: '/images/previews/tenancy-agreement/scotland/standard/prt-agreement-preview.webp',
        alt: 'Scotland standard agreement preview',
      },
    ],
    premium: [
      {
        key: 'prt_agreement_hmo',
        title: 'Premium Private Residential Tenancy Agreement',
        description: 'Broader drafting for more complex Scottish lets.',
        src: '/images/previews/tenancy-agreement/scotland/premium/prt-agreement-preview.webp',
        alt: 'Scotland premium agreement preview',
      },
    ],
  },
  'northern-ireland': {
    standard: [
      {
        key: 'private_tenancy_agreement',
        title: 'Private Tenancy Agreement',
        description: 'Core Northern Ireland agreement preview.',
        src: '/images/previews/tenancy-agreement/northern-ireland/standard/private-tenancy-agreement-preview.webp',
        alt: 'Northern Ireland standard agreement preview',
      },
    ],
    premium: [
      {
        key: 'private_tenancy_agreement_hmo',
        title: 'Premium Private Tenancy Agreement',
        description: 'Broader drafting for more complex Northern Ireland lets.',
        src: '/images/previews/tenancy-agreement/northern-ireland/premium/private-tenancy-agreement-preview.webp',
        alt: 'Northern Ireland premium agreement preview',
      },
    ],
  },
};

describe('WhatsIncludedInteractive tenancy mode', () => {
  it('renders tenancy pack messaging and switches between standard and premium', () => {
    render(<WhatsIncludedInteractive product="ast" previews={previews} />);

    expect(screen.getByText("What's included in your tenancy agreement pack")).toBeInTheDocument();
    expect(screen.getByText('Assured Periodic Tenancy Agreement')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start my standard tenancy pack ->' }).getAttribute('href')).toContain(
      'product=ast_standard'
    );

    fireEvent.click(screen.getByRole('button', { name: /Premium/i }));

    expect(screen.getByText('Premium Assured Periodic Tenancy Agreement')).toBeInTheDocument();
    expect(screen.getByText('Key Receipt & Handover Schedule')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start my premium tenancy pack ->' }).getAttribute('href')).toContain(
      'product=ast_premium'
    );
  });

  it('updates the pack when the jurisdiction changes', () => {
    render(<WhatsIncludedInteractive product="ast" previews={previews} />);

    fireEvent.click(screen.getByRole('button', { name: 'Wales' }));

    expect(screen.getByText('Standard Occupation Contract')).toBeInTheDocument();
    expect(screen.getByText('Core pack for straightforward Welsh occupation contracts.')).toBeInTheDocument();
  });
});
