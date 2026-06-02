import { describe, expect, it } from 'vitest';
import { isAdminStartedDraftCase } from '@/lib/admin/case-manager';

describe('isAdminStartedDraftCase', () => {
  it('includes unpaid in-progress cases with no checkout order', () => {
    expect(
      isAdminStartedDraftCase({
        status: 'in_progress',
        payment_status: null,
        has_any_order: false,
        has_final_documents: false,
        wizard_progress: 20,
      })
    ).toBe(true);
  });

  it('includes completed unpaid cases that have not reached checkout', () => {
    expect(
      isAdminStartedDraftCase({
        status: 'completed',
        payment_status: null,
        has_any_order: false,
        has_final_documents: false,
        wizard_progress: 100,
        wizard_completed_at: '2026-06-01T12:00:00.000Z',
      })
    ).toBe(true);
  });

  it('excludes cases with a checkout order even if unpaid', () => {
    expect(
      isAdminStartedDraftCase({
        status: 'completed',
        payment_status: 'pending',
        has_any_order: true,
        has_final_documents: false,
        wizard_progress: 100,
      })
    ).toBe(false);
  });

  it('excludes paid, generated, and archived cases', () => {
    const base = {
      status: 'in_progress',
      payment_status: null,
      has_any_order: false,
      has_final_documents: false,
      wizard_progress: 40,
    };

    expect(isAdminStartedDraftCase({ ...base, payment_status: 'paid' })).toBe(false);
    expect(isAdminStartedDraftCase({ ...base, has_final_documents: true })).toBe(false);
    expect(isAdminStartedDraftCase({ ...base, status: 'archived' })).toBe(false);
  });
});
