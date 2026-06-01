/**
 * @vitest-environment jsdom
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { WizardFacts } from '@/lib/case-facts/schema';
import { GroundDetailsSection } from '../GroundDetailsSection';

describe('GroundDetailsSection Ask Heaven autofill', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('bulk drafts written ground fields in one update without filling the summary or date field', async () => {
    const onUpdate = vi.fn();
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}'));

      return {
        ok: true,
        json: async () => ({
          suggested_wording: `Drafted answer for ${body.question_id}`,
        }),
      } as Response;
    });

    vi.stubGlobal('fetch', fetchMock);

    render(
      <GroundDetailsSection
        facts={{
          section8_grounds: ['Ground 1A - Sale of dwelling house'],
          property_address_line1: '64 Peach Pie Street',
          property_address_town: 'Wincanton',
          property_address_postcode: 'BA9 9FP',
          landlord_full_name: 'Charlotte Warren',
          tenant_full_name: 'Bradley Young',
          notice_served_date: '2026-05-30',
        } as WizardFacts}
        jurisdiction="england"
        caseId="case-1"
        product="notice_only"
        onUpdate={onUpdate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Draft these ground details for me/i }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledTimes(1);
    });

    expect(onUpdate).toHaveBeenCalledWith({
      'ground_1a.sale_reason': 'Drafted answer for ground_1a.sale_reason',
      'ground_1a.sale_steps_taken': 'Drafted answer for ground_1a.sale_steps_taken',
      'ground_1a.intended_sale_timing': 'Drafted answer for ground_1a.intended_sale_timing',
      'ground_1a.supporting_evidence': 'Drafted answer for ground_1a.supporting_evidence',
    });
    expect(onUpdate).not.toHaveBeenCalledWith(expect.objectContaining({
      'ground_1a.decision_date': expect.anything(),
    }));
    expect(onUpdate).not.toHaveBeenCalledWith(expect.objectContaining({
      section8_details: expect.anything(),
    }));
  });
});
