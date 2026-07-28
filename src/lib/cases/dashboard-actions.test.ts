import { describe, expect, it } from 'vitest';

import { getDashboardCaseActions } from './dashboard-actions';

const base = {
  id: 'case-123',
  jurisdiction: 'england',
  wizard_progress: 100,
  display_status: 'ready_to_purchase',
  has_paid_order: false,
};

describe('dashboard saved-case actions', () => {
  it.each([
    ['money_claim', 'money_claim', 'step=claimant'],
    ['eviction', 'notice_only', 'step=parties'],
    ['tenancy_agreement', 'england_standard_tenancy_agreement', 'highlight_sections=landlord%2Ctenants'],
    ['rent_increase', 'section13_standard', 'type=rent_increase'],
  ])('routes completed unpaid %s cases to preview/payment with an edit route', (caseType, product, editMarker) => {
    const actions = getDashboardCaseActions({
      ...base,
      case_type: caseType,
      resume_product: product,
    });

    expect(actions.primaryLabel).toBe('Review documents & pay');
    expect(actions.primaryHref).toContain('/wizard/preview/case-123');
    expect(actions.primaryHref).toContain(`product=${product}`);
    expect(actions.editHref).toContain(editMarker);
  });

  it('resumes an incomplete saved case in its wizard', () => {
    const actions = getDashboardCaseActions({
      ...base,
      case_type: 'money_claim',
      resume_product: 'money_claim',
      wizard_progress: 45,
      display_status: 'in_progress',
    });

    expect(actions.primaryLabel).toBe('Resume case');
    expect(actions.primaryHref).toContain('/wizard/flow?');
    expect(actions.primaryHref).toContain('case_id=case-123');
  });

  it('never sends a paid case back to checkout', () => {
    const actions = getDashboardCaseActions({
      ...base,
      case_type: 'eviction',
      resume_product: 'notice_only',
      has_paid_order: true,
    });

    expect(actions.primaryLabel).toBe('View case & documents');
    expect(actions.primaryHref).toBe('/dashboard/cases/case-123');
    expect(actions.editHref).toBeNull();
  });
});
