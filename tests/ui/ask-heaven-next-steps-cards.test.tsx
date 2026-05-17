/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AskHeavenNextStepsCards } from '@/components/ask-heaven/AskHeavenNextStepsCards';

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

describe('Ask Heaven next-step cards', () => {
  it('shows the full England commercial set for England', () => {
    render(<AskHeavenNextStepsCards jurisdiction="england" />);

    expect(screen.getByText('Eviction Notice Generator')).toBeInTheDocument();
    expect(screen.getByText('Complete Eviction Pack')).toBeInTheDocument();
    expect(screen.getByText('Money Claim Pack')).toBeInTheDocument();
    expect(screen.getByText('England Tenancy Agreements')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create my Section 8 notice' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Prepare my court pack' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Prepare my money claim' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose my tenancy agreement' })).toBeInTheDocument();
  });

  it('keeps the same public England cards when an older non-England case is present', () => {
    const { container, rerender } = render(<AskHeavenNextStepsCards jurisdiction="wales" />);

    expect(container.querySelector('[data-jurisdiction="wales"]')).toBeInTheDocument();
    expect(screen.getByText('Eviction Notice Generator')).toBeInTheDocument();
    expect(screen.getByText('Complete Eviction Pack')).toBeInTheDocument();
    expect(screen.getByText('Money Claim Pack')).toBeInTheDocument();
    expect(screen.getByText('England Tenancy Agreements')).toBeInTheDocument();

    rerender(<AskHeavenNextStepsCards jurisdiction="scotland" />);

    expect(container.querySelector('[data-jurisdiction="scotland"]')).toBeInTheDocument();
    expect(screen.getByText('Eviction Notice Generator')).toBeInTheDocument();
    expect(screen.getByText('Complete Eviction Pack')).toBeInTheDocument();
    expect(screen.getByText('Money Claim Pack')).toBeInTheDocument();
    expect(screen.getByText('England Tenancy Agreements')).toBeInTheDocument();
  });

  it('keeps Northern Ireland cases on the same public England recommendation surface', () => {
    render(<AskHeavenNextStepsCards jurisdiction="northern-ireland" />);

    expect(screen.getByText('Eviction Notice Generator')).toBeInTheDocument();
    expect(screen.getByText('Complete Eviction Pack')).toBeInTheDocument();
    expect(screen.getByText('Money Claim Pack')).toBeInTheDocument();
    expect(screen.getByText('England Tenancy Agreements')).toBeInTheDocument();
  });
});
