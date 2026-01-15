import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WarrantOfPossessionPage from '@/app/warrant-of-possession/page';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock components that aren't needed for this test
vi.mock('@/components/ui/SocialProofCounter', () => ({
  SocialProofCounter: () => <div data-testid="social-proof" />,
}));

vi.mock('@/components/marketing/StandardHero', () => ({
  StandardHero: ({ children }: { children: React.ReactNode }) => <div data-testid="hero">{children}</div>,
}));

vi.mock('@/components/seo/RelatedLinks', () => ({
  RelatedLinks: () => <div data-testid="related-links" />,
}));

vi.mock('@/components/seo/SeoCtaBlock', () => ({
  SeoCtaBlock: () => <div data-testid="seo-cta" />,
  SeoDisclaimer: () => <div data-testid="seo-disclaimer" />,
}));

vi.mock('@/lib/seo/structured-data', () => ({
  StructuredData: () => null,
  breadcrumbSchema: () => ({}),
  faqPageSchema: () => ({}),
}));

describe('Warrant of Possession Page - N325 Download Links', () => {
  it('renders the N325 download link with correct href', () => {
    render(<WarrantOfPossessionPage />);

    const n325Link = screen.getByRole('link', {
      name: /Download free — Form N325 \(Request for Warrant/i,
    });

    expect(n325Link).toBeInTheDocument();
    expect(n325Link).toHaveAttribute('href', '/official-forms/n325-eng.pdf');
    expect(n325Link).toHaveAttribute('download');
    expect(n325Link).toHaveAttribute('target', '_blank');
    expect(n325Link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the N325A download link with correct href', () => {
    render(<WarrantOfPossessionPage />);

    const n325aLink = screen.getByRole('link', {
      name: /Download free — Form N325A$/i,
    });

    expect(n325aLink).toBeInTheDocument();
    expect(n325aLink).toHaveAttribute('href', '/official-forms/N325A.pdf');
    expect(n325aLink).toHaveAttribute('download');
    expect(n325aLink).toHaveAttribute('target', '_blank');
    expect(n325aLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the download section heading with SEO-friendly text', () => {
    render(<WarrantOfPossessionPage />);

    const heading = screen.getByRole('heading', {
      name: /Download N325 & N325A Forms \(Free PDF\)/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it('renders the legal clarification note', () => {
    render(<WarrantOfPossessionPage />);

    expect(screen.getByText(/These are official court forms/i)).toBeInTheDocument();
    expect(screen.getByText(/You must already have a possession order before applying for a warrant/i)).toBeInTheDocument();
  });
});
