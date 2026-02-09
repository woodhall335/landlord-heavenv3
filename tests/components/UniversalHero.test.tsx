import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { UniversalHero } from '@/components/landing/UniversalHero';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill,
    priority,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    fill?: boolean;
    priority?: boolean;
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

const baseProps = {
  trustText: 'Trusted by landlords',
  title: 'Create Legal Documents',
  highlightTitle: 'Fast and Secure',
  subtitle: 'Subtitle content',
  primaryCta: { label: 'Start now', href: '/start' },
  secondaryCta: { label: 'Learn more', href: '/learn' },
  feature: 'Feature highlight',
  mascotSrc: '/images/mascot.png',
  mascotAlt: 'Mascot illustration',
};

describe('UniversalHero', () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders exactly one H1 when headingAs is h1', () => {
    render(<UniversalHero {...baseProps} headingAs="h1" />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it('renders H2 when headingAs is h2', () => {
    render(<UniversalHero {...baseProps} headingAs="h2" />);
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('marks the mobile mascot as decorative by default', () => {
    const { container } = render(<UniversalHero {...baseProps} />);
    const mascotImages = Array.from(
      container.querySelectorAll(`img[src="${baseProps.mascotSrc}"]`),
    );
    const mobileMascot = mascotImages.find(
      (image) => image.getAttribute('aria-hidden') === 'true',
    );
    expect(mobileMascot).toBeTruthy();
    expect(mobileMascot).toHaveAttribute('alt', '');
  });

  it('uses the provided mascotAlt on the desktop mascot', () => {
    render(<UniversalHero {...baseProps} />);
    expect(screen.getByAltText(baseProps.mascotAlt)).toBeInTheDocument();
  });

  it('overrides the default aria-label when ariaLabel is provided', () => {
    render(<UniversalHero {...baseProps} ariaLabel="Custom hero label" />);
    expect(screen.getByLabelText('Custom hero label')).toBeInTheDocument();
  });

  it('warns when multiple H1 elements are detected in development', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    document.body.innerHTML = '<h1>Existing H1</h1>';
    render(<UniversalHero {...baseProps} headingAs="h1" />);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Multiple <h1> elements detected'),
    );
  });
});
