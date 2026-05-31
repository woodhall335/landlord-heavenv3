/**
 * @vitest-environment jsdom
 */

import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import type { WizardFacts } from '@/lib/case-facts/schema';
import { NoticeSection, PlannedNoticeServiceReviewPanel } from '../NoticeSection';

function renderControlledNoticeSection(initialFacts: WizardFacts, mode: 'complete_pack' | 'notice_only' = 'notice_only') {
  const updatesSpy = vi.fn();

  const Wrapper = () => {
    const [facts, setFacts] = useState<WizardFacts>(initialFacts);

    const handleUpdate = (updates: Record<string, any>) => {
      updatesSpy(updates);
      setFacts((current) => ({ ...current, ...updates }));
    };

    return (
      <NoticeSection
        facts={facts}
        jurisdiction="england"
        onUpdate={handleUpdate}
        mode={mode}
      />
    );
  };

  render(<Wrapper />);

  return updatesSpy;
}

describe('NoticeSection specialist England ground capture', () => {
  it('marks the notice grounds as manually touched when a specialist ground is selected in notice-only mode', () => {
    const updatesSpy = renderControlledNoticeSection({
      __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
      eviction_route: 'section_8',
      section8_grounds: [],
    });

    fireEvent.click(screen.getByLabelText(/Ground 1A - Sale of dwelling house/i));

    expect(updatesSpy).toHaveBeenCalledWith({
      section8_grounds: ['Ground 1A'],
      section8_grounds_touched: true,
      section8_grounds_seeded_from_selector: false,
    });
    expect(screen.queryByText('Specialist Ground Details')).not.toBeInTheDocument();
  });

  it('keeps specialist detail capture out of the notice step on the already-served complete-pack path', () => {
    renderControlledNoticeSection({
      __meta: { product: 'complete_pack', original_product: 'complete_pack', jurisdiction: 'england' },
      eviction_route: 'section_8',
      notice_already_served: true,
      notice_served_date: '2026-03-12',
      notice_service_method: 'first_class_post',
      section8_grounds: ['Ground 6', 'Ground 7B'],
    }, 'complete_pack');

    expect(screen.queryByText('Specialist Ground Details')).not.toBeInTheDocument();
    expect(screen.getByText(/Have you already served a valid notice on the tenant\?/i)).toBeInTheDocument();
  });

  it('keeps England complete-pack notice generation on the Form 3A path', () => {
    renderControlledNoticeSection({
      __meta: { product: 'complete_pack', original_product: 'complete_pack', jurisdiction: 'england' },
      eviction_route: 'section_8',
      notice_already_served: false,
      section8_grounds: [],
    }, 'complete_pack');

    expect(screen.getByText(/current England Form 3A notice/i)).toBeInTheDocument();
    expect(screen.queryByText(/Form 6A/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Section 21/i)).not.toBeInTheDocument();
  });

  it('keeps England notice-only mode on the Form 3A route', () => {
    renderControlledNoticeSection({
      __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
      eviction_route: 'section_8',
      section8_grounds: [],
    });

    expect(screen.getByText(/Form 3A Grounds/i)).toBeInTheDocument();
    expect(screen.queryByText(/Generate Your Form 3A/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Notice checkpoint/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Section 21/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Form 6A/i)).not.toBeInTheDocument();
  });

  it('keeps generated England Section 8 notice setup focused on grounds only', () => {
    renderControlledNoticeSection({
      __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
      eviction_route: 'section_8',
      section8_grounds: ['Ground 8'],
    });

    expect(screen.getByText(/Form 3A notice grounds/i)).toBeInTheDocument();
    expect(screen.queryByText(/Notice details - Step/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Notice Service Details/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Notice Will Be Generated/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument();
  });

  it('keeps already-served complete-pack service fields in the notice step', () => {
    renderControlledNoticeSection({
      __meta: { product: 'complete_pack', original_product: 'complete_pack', jurisdiction: 'england' },
      eviction_route: 'section_8',
      notice_already_served: true,
      notice_served_date: '2026-03-12',
      notice_service_method: 'first_class_post',
      section8_grounds: ['Ground 8'],
    }, 'complete_pack');

    expect(screen.getByText(/Date notice was served/i)).toBeInTheDocument();
    expect(screen.getByText(/How was the notice served/i)).toBeInTheDocument();
  });

  it('review service panel writes all notice service date aliases', () => {
    const updatesSpy = vi.fn();

    render(
      <PlannedNoticeServiceReviewPanel
        facts={{
          __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
          eviction_route: 'section_8',
          section8_grounds: ['Ground 8'],
          notice_date: '2026-05-07',
          notice_service_date: '2026-05-07',
          notice_served_date: '2026-05-07',
        }}
        onUpdate={updatesSpy}
      />
    );

    fireEvent.change(screen.getByLabelText(/Date you will serve the notice/i), {
      target: { value: '2026-05-08' },
    });

    expect(updatesSpy).toHaveBeenCalledWith({
      notice_date: '2026-05-08',
      notice_service_date: '2026-05-08',
      notice_served_date: '2026-05-08',
    });
  });

  it('review service panel enforces the Ground 1A calendar-month minimum while allowing later dates', async () => {
    const updatesSpy = vi.fn();

    render(
      <PlannedNoticeServiceReviewPanel
        facts={{
          __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
          eviction_route: 'section_8',
          section8_grounds: ['Ground 1A'],
          notice_date: '2026-05-30',
          notice_service_date: '2026-05-30',
          notice_served_date: '2026-05-30',
          notice_service_method: 'email',
          notice_expiry_date: '2026-08-15',
        }}
        onUpdate={updatesSpy}
      />
    );

    const expiryInput = screen.getByLabelText(/Notice expiry date/i);
    expect(expiryInput).toHaveAttribute('min', '2026-09-30');
    expect(screen.getByText(/Notice expiry date is too early\. Earliest valid date is 30 September 2026\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(updatesSpy).toHaveBeenCalledWith({ notice_expiry_date: '2026-09-30' });
    });

    fireEvent.change(expiryInput, { target: { value: '2026-10-15' } });
    expect(updatesSpy).toHaveBeenCalledWith({ notice_expiry_date: '2026-10-15' });
  });

  it('uses arrears-specific helper copy when only arrears grounds are selected', () => {
    renderControlledNoticeSection({
      __meta: { product: 'notice_only', original_product: 'notice_only', jurisdiction: 'england' },
      eviction_route: 'section_8',
      section8_grounds: ['Ground 8'],
    });

    expect(screen.getByText(/Minimum notice period: 4 weeks/i)).toBeInTheDocument();
    expect(
      screen.getByText(/This is an arrears-led notice, so the rent schedule, chronology, and support documents will keep using the same arrears story from here\./i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/specialist ground/i)).not.toBeInTheDocument();
  });
});
