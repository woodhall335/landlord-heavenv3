/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WizardFacts } from '@/lib/case-facts/schema';
import { EvidenceSection } from '../EvidenceSection';

describe('EvidenceSection', () => {
  it('surfaces the defence-risk checkpoint for England complete-pack cases', () => {
    render(
      <EvidenceSection
        facts={{
          __meta: { product: 'complete_pack', original_product: 'complete_pack', jurisdiction: 'england' },
          eviction_route: 'section_8',
          section8_grounds: ['Ground 8'],
          tenant_disputes_claim: true,
          risk: {
            tenant_disputes_claim: true,
          },
        } as WizardFacts}
        jurisdiction="england"
        caseId="case-1"
        onUpdate={vi.fn()}
      />,
    );

    expect(screen.getByText(/Anticipate the tenant's likely defence points/i)).toBeInTheDocument();
    expect(screen.getByText(/Benefit or Universal Credit arrears context/i)).toBeInTheDocument();
  });

  it('writes known defence details back into the shared risk payload', () => {
    const onUpdate = vi.fn();

    render(
      <EvidenceSection
        facts={{
          __meta: { product: 'complete_pack', original_product: 'complete_pack', jurisdiction: 'england' },
          eviction_route: 'section_8',
          section8_grounds: ['Ground 8'],
          risk: {
            tenant_disputes_claim: true,
            known_tenant_defences: 'Tenant says the arrears reflect UC delay.',
          },
          tenant_disputes_claim: true,
          known_tenant_defences: 'Tenant says the arrears reflect UC delay.',
        } as WizardFacts}
        jurisdiction="england"
        caseId="case-2"
        onUpdate={onUpdate}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Known tenant defence or dispute points/i), {
      target: { value: 'Tenant says the arrears figure is wrong.' },
    });

    expect(onUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        known_tenant_defences: 'Tenant says the arrears figure is wrong.',
        risk: expect.objectContaining({
          known_tenant_defences: 'Tenant says the arrears figure is wrong.',
        }),
      }),
    );
  });
});
