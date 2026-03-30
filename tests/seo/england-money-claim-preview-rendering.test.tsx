import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { EnglandMoneyClaimPreview } from '@/components/seo/EnglandMoneyClaimPreview';

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string | { src: string };
    alt: string;
    [key: string]: unknown;
  }) => <img src={typeof src === 'string' ? src : src.src} alt={alt} {...rest} />,
}));

describe('England money claim preview', () => {
  it('renders server-visible claim and evidence sections even when binaries are absent', () => {
    const html = renderToStaticMarkup(<EnglandMoneyClaimPreview previews={[]} />);

    expect(html).toContain('England landlord money claim example');
    expect(html).toContain('Claim paperwork overview');
    expect(html).toContain('Before you issue: pre-action documents');
    expect(html).toContain('Evidence and debt schedule');
    expect(html).toContain('Issue route: N1, particulars, and MCOL context');
    expect(html).toContain('After issue: filing and enforcement');
    expect(html).toContain('Letter Before Claim');
    expect(html).toContain('Schedule Of Arrears');
    expect(html).toContain('Form N1 Claim Form');
    expect(html).toContain('Particulars Of Claim');
    expect(html).toContain('Enforcement Guide');
    expect(html).toContain('Money Claim Online');

    const words = html
      .replace(/<[^>]+>/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    expect(words.length).toBeGreaterThan(450);

    const overviewIndex = html.indexOf('Claim paperwork overview');
    const preActionIndex = html.indexOf('Before you issue: pre-action documents');
    const evidenceIndex = html.indexOf('Evidence and debt schedule');
    const issueIndex = html.indexOf('Issue route: N1, particulars, and MCOL context');
    const enforcementIndex = html.indexOf('After issue: filing and enforcement');

    expect(overviewIndex).toBeGreaterThan(-1);
    expect(preActionIndex).toBeGreaterThan(overviewIndex);
    expect(evidenceIndex).toBeGreaterThan(preActionIndex);
    expect(issueIndex).toBeGreaterThan(evidenceIndex);
    expect(enforcementIndex).toBeGreaterThan(issueIndex);
  });
});
