/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CaseBasicsSection } from '@/components/wizard/sections/eviction/CaseBasicsSection';
import type { WizardFacts } from '@/lib/case-facts/schema';

describe('CaseBasicsSection', () => {
  it('keeps Notice Only focused on notice-stage England wording', () => {
    const onUpdate = vi.fn();

    render(
      <CaseBasicsSection
        facts={{ eviction_route: 'section_8' } as WizardFacts}
        jurisdiction="england"
        flowProduct="notice_only"
        onUpdate={onUpdate}
      />
    );

    expect(screen.getByText('Section 8 notice basics')).toBeInTheDocument();
    expect(screen.queryByText('Jurisdiction')).not.toBeInTheDocument();
    expect(screen.getByText(/Form 3A notice-stage pack/i)).toBeInTheDocument();
    expect(screen.getByText(/service instructions/i)).toBeInTheDocument();
    expect(screen.getByText(/rent schedule \/ arrears statement/i)).toBeInTheDocument();
    expect(screen.queryByText(/Form N5/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Form N119/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/PCOL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Which eviction route are you using/i)).not.toBeInTheDocument();
  });

  it('keeps Complete Pack focused on notice plus court-stage wording', () => {
    const onUpdate = vi.fn();

    render(
      <CaseBasicsSection
        facts={{ eviction_route: 'section_8' } as WizardFacts}
        jurisdiction="england"
        flowProduct="complete_pack"
        onUpdate={onUpdate}
      />
    );

    expect(screen.queryByText('Jurisdiction')).not.toBeInTheDocument();
    expect(screen.getByText(/Possession case basics/i)).toBeInTheDocument();
    expect(screen.getByText(/Form 3A route with court-stage pack/i)).toBeInTheDocument();
    expect(screen.getByText(/Form N5/i)).toBeInTheDocument();
    expect(screen.getByText(/Form N119/i)).toBeInTheDocument();
    expect(screen.queryByText(/Which eviction route are you using/i)).not.toBeInTheDocument();
  });
});
