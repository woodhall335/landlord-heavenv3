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

  it('does not render legacy mascot media', () => {
    const { container } = render(<UniversalHero {...baseProps} />);
    expect(container.querySelector(`img[src="${baseProps.mascotSrc}"]`)).toBeNull();
  });

  it('does not render legacy secondary media such as the laptop preview', () => {
    const { container } = render(
      <UniversalHero
        {...baseProps}
        mediaSrc="/images/laptop.webp"
        mediaAlt="Legacy laptop preview"
      />,
    );

    expect(container.querySelector('img[src="/images/laptop.webp"]')).toBeNull();
  });

  it('lets a page-specific universal image override a route-family default', () => {
    const { container } = render(
      <UniversalHero
        {...baseProps}
        backgroundImageSrc="/images/heroes/library/hero-guide-court-hearing-v2.webp"
        backgroundImageAlt="Route-specific guide artwork"
      />,
    );

    expect(
      container.querySelector(
        'img[src="/images/heroes/library/hero-guide-court-hearing-v2.webp"]',
      ),
    ).toHaveAttribute('alt', 'Route-specific guide artwork');
  });

  it('preserves a word boundary between the plain and highlighted H1 text', () => {
    render(
      <UniversalHero
        {...baseProps}
        title="Create the right England"
        highlightTitle="tenancy agreement for the let"
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Create the right England tenancy agreement for the let',
    );
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent(
      'Englandtenancy',
    );
  });

  it('overrides the default aria-label when ariaLabel is provided', () => {
    render(<UniversalHero {...baseProps} ariaLabel="Custom hero label" />);
    expect(screen.getByLabelText('Custom hero label')).toBeInTheDocument();
  });

  it('applies the provided id to the hero section', () => {
    const { container } = render(<UniversalHero {...baseProps} id="hero-section" />);
    expect(container.querySelector('section')).toHaveAttribute('id', 'hero-section');
  });

  it('does not render an empty heading when title is blank', () => {
    render(<UniversalHero {...baseProps} title="" highlightTitle={undefined} />);
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(screen.getByText(baseProps.subtitle)).toBeInTheDocument();
  });

  it('renders the trust positioning bar when requested without bringing back the old badge', () => {
    render(
      <UniversalHero
        {...baseProps}
        badge="For landlords in England"
        showTrustPositioningBar
        trustPositioningHeadline="Need to serve an eviction notice fast?"
        trustPositioningPreset="notice_only"
      />,
    );

    expect(screen.queryByText('For landlords in England')).not.toBeInTheDocument();
    expect(
      screen.getByText('Need to serve an eviction notice fast?'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Preview your notice pack before you pay/i),
    ).toBeInTheDocument();
  });
});
