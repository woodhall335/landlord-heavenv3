import { describe, expect, it } from 'vitest';
import {
  doesDocumentTypeMatch,
  getDashboardDocumentCategory,
  getDashboardDocumentTitle,
  isTenancyAgreementVariant,
} from '@/lib/documents/dashboard-document-display';

describe('dashboard document display mapping', () => {
  it('classifies ast_agreement_hmo as tenancy agreement variant', () => {
    expect(isTenancyAgreementVariant('ast_agreement_hmo')).toBe(true);
    expect(getDashboardDocumentCategory('ast_agreement_hmo')).toBe('tenancy_agreement');
    expect(getDashboardDocumentTitle('ast_agreement_hmo')).toBe('Tenancy Agreement');
  });

  it('maps required tenancy pack docs to friendly titles', () => {
    expect(getDashboardDocumentTitle('inventory_schedule')).toBe('Inventory Schedule');
    expect(getDashboardDocumentTitle('pre_tenancy_checklist_england')).toBe(
      'Pre-Tenancy Checklist (England)'
    );
  });

  it('matches canonical ast_agreement key to generated variant keys', () => {
    expect(doesDocumentTypeMatch('ast_agreement', 'ast_agreement_hmo')).toBe(true);
    expect(doesDocumentTypeMatch('ast_agreement', 'ast_agreement')).toBe(true);
    expect(doesDocumentTypeMatch('inventory_schedule', 'inventory_schedule')).toBe(true);
    expect(doesDocumentTypeMatch('inventory_schedule', 'pre_tenancy_checklist_england')).toBe(false);
  });
});
