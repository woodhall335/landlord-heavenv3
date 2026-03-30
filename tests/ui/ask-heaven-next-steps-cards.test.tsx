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

    expect(screen.getByText('Notice Only Pack')).toBeInTheDocument();
    expect(screen.getByText('Complete Eviction Pack')).toBeInTheDocument();
    expect(screen.getByText('Money Claims Pack')).toBeInTheDocument();
    expect(screen.getByText('Tenancy Agreements')).toBeInTheDocument();
  });

  it('hides England-only packs for Wales and Scotland', () => {
    const { rerender } = render(<AskHeavenNextStepsCards jurisdiction="wales" />);

    expect(screen.getByText('Notice Only Pack')).toBeInTheDocument();
    expect(screen.getByText('Tenancy Agreements')).toBeInTheDocument();
    expect(screen.queryByText('Complete Eviction Pack')).not.toBeInTheDocument();
    expect(screen.queryByText('Money Claims Pack')).not.toBeInTheDocument();

    rerender(<AskHeavenNextStepsCards jurisdiction="scotland" />);

    expect(screen.getByText('Notice Only Pack')).toBeInTheDocument();
    expect(screen.getByText('Tenancy Agreements')).toBeInTheDocument();
    expect(screen.queryByText('Complete Eviction Pack')).not.toBeInTheDocument();
    expect(screen.queryByText('Money Claims Pack')).not.toBeInTheDocument();
  });

  it('keeps Northern Ireland limited to tenancy help only', () => {
    render(<AskHeavenNextStepsCards jurisdiction="northern-ireland" />);

    expect(screen.getByText('Tenancy Agreements')).toBeInTheDocument();
    expect(screen.queryByText('Notice Only Pack')).not.toBeInTheDocument();
    expect(screen.queryByText('Complete Eviction Pack')).not.toBeInTheDocument();
    expect(screen.queryByText('Money Claims Pack')).not.toBeInTheDocument();
  });
});
