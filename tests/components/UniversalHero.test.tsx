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
    render(<UniversalHero {...baseProps} />);
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

  it('overrides the default aria-label when ariaLabel is provided', () => {
    render(<UniversalHero {...baseProps} ariaLabel="Custom hero label" />);
    expect(screen.getByLabelText('Custom hero label')).toBeInTheDocument();
  });

  it('applies the provided id to the hero section', () => {
    const { container } = render(<UniversalHero {...baseProps} id="hero-section" />);
    expect(container.querySelector('section')).toHaveAttribute('id', 'hero-section');
  });

  it('renders the desktop mascot as decorative when mascotDecorativeOnDesktop is true', () => {
    const { container } = render(
      <UniversalHero {...baseProps} mascotDecorativeOnDesktop />,
    );
    const mascotImages = Array.from(
      container.querySelectorAll(`img[src="${baseProps.mascotSrc}"]`),
    );
    expect(mascotImages).toHaveLength(2);
    mascotImages.forEach((image) => {
      expect(image).toHaveAttribute('alt', '');
      expect(image.closest('div')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('warns when mascotAlt is empty while the desktop mascot is not decorative', () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(<UniversalHero {...baseProps} mascotAlt="   " />);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('mascotAlt should be non-empty when mascotDecorativeOnDesktop is false'),
    );
    process.env.NODE_ENV = previousEnv;
  });
});
