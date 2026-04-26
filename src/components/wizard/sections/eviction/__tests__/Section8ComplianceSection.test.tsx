/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WizardFacts } from '@/lib/case-facts/schema';
import Section8ComplianceSection from '../Section8ComplianceSection';

describe('Section8ComplianceSection', () => {
  it('collects defence-risk facts into both top-level and nested risk payloads', () => {
    const onUpdate = vi.fn();

    render(
      <Section8ComplianceSection
        facts={{
          __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
          eviction_route: 'section_8',
          section8_grounds: ['Ground 8'],
        } as WizardFacts}
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByLabelText(/Yes, disputed/i));

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        tenant_disputes_claim: true,
        risk: expect.objectContaining({
          tenant_disputes_claim: true,
        }),
      }),
    );
  });

  it('shows arrears-defence follow-up questions when arrears grounds are selected', () => {
    render(
      <Section8ComplianceSection
        facts={{
          __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
          eviction_route: 'section_8',
          section8_grounds: ['Ground 8', 'Ground 10'],
        } as WizardFacts}
        onUpdate={vi.fn()}
      />,
    );

    expect(screen.getByText(/Benefit or Universal Credit arrears context/i)).toBeInTheDocument();
    expect(screen.getByText(/Was a payment plan or arrears arrangement offered/i)).toBeInTheDocument();
  });
});
