import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
  PremiumParallax,
  Reveal,
  StaggerReveal,
} from '@/components/marketing/PremiumMotion';
import { Section8WorkflowStory } from '@/components/marketing/Section8WorkflowStory';

vi.mock('@/components/analytics/TrackedLink', () => ({
  TrackedLink: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ui/Container', () => ({
  Container: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

function mockMatchMedia(matches: boolean | ((query: string) => boolean)) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: typeof matches === 'function' ? matches(query) : matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('premium motion primitives', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal('IntersectionObserver', undefined);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('Reveal renders children and marks them visible without IntersectionObserver', async () => {
    const { container } = render(<Reveal>Premium content</Reveal>);

    expect(screen.getByText('Premium content')).toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelector('.premium-reveal')).toHaveAttribute(
        'data-motion-state',
        'visible',
      );
    });
  });

  it('Reveal marks content visible on mobile even when IntersectionObserver never fires', async () => {
    mockMatchMedia((query) => query === '(max-width: 767px)');
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
      })),
    );

    const { container } = render(<Reveal>Mobile content</Reveal>);

    expect(screen.getByText('Mobile content')).toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelector('.premium-reveal')).toHaveAttribute(
        'data-motion-state',
        'visible',
      );
    });
  });

  it('PremiumParallax disables movement when reduced motion is preferred', async () => {
    mockMatchMedia(true);
    const { container } = render(<PremiumParallax>Hero media</PremiumParallax>);

    await waitFor(() => {
      expect(container.querySelector('[data-parallax]')).toHaveAttribute(
        'data-parallax',
        'disabled',
      );
    });
  });

  it('StaggerReveal assigns deterministic stagger classes and indexes', () => {
    const { container } = render(
      <StaggerReveal>
        <span>Eyebrow</span>
        <span>Heading</span>
      </StaggerReveal>,
    );

    const children = container.querySelectorAll('.premium-stagger-child');
    expect(children).toHaveLength(2);
    expect(children[0]).toHaveStyle('--premium-stagger-index: 0');
    expect(children[1]).toHaveStyle('--premium-stagger-index: 1');
  });
});

describe('Section 8 workflow story', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal('IntersectionObserver', undefined);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('preserves the Notice Only and Complete Pack destinations', () => {
    render(<Section8WorkflowStory />);

    expect(screen.getByRole('link', { name: 'Create my Section 8 notice' })).toHaveAttribute(
      'href',
      '/products/notice-only',
    );
    expect(screen.getByRole('link', { name: 'Prepare my court pack' })).toHaveAttribute(
      'href',
      '/products/complete-pack',
    );
  });
});
