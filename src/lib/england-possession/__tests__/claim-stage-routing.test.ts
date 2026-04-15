import { describe, expect, it } from 'vitest';

import { buildEnglandPossessionDraftingModel } from '@/lib/england-possession/pack-drafting';

describe('England claim-stage routing', () => {
  it('treats PCOL as a limited alternative for arrears-only Section 8 claims', () => {
    const model = buildEnglandPossessionDraftingModel({
      selected_grounds: ['8', '10'],
      notice_served_date: '2026-05-10',
      notice_expiry_date: '2026-06-07',
      earliest_proceedings_date: '2026-06-08',
      court_name: 'Central London County Court',
      total_arrears: 4200,
    });

    const overview = model.courtFilingGuide.overviewParagraphs.join(' ');
    const warnings = model.courtFilingGuide.warningParagraphs.join(' ');

    expect(overview).toContain('Form N5 and Form N119');
    expect(overview).toContain('Possession Claim Online may be available only for eligible rent-arrears-only Section 8 claims');
    expect(warnings).toContain('Only treat Possession Claim Online as potentially available if the claim is genuinely confined to eligible rent-arrears-only Section 8 grounds');
  });

  it('keeps non-arrears claims on the paper N5 and N119 route', () => {
    const model = buildEnglandPossessionDraftingModel({
      selected_grounds: ['1'],
      notice_served_date: '2026-05-10',
      notice_expiry_date: '2026-09-10',
      earliest_proceedings_date: '2026-09-11',
      court_name: 'Central London County Court',
    });

    const overview = model.courtFilingGuide.overviewParagraphs.join(' ');
    const warnings = model.courtFilingGuide.warningParagraphs.join(' ');

    expect(overview).toContain('paper county court route using Form N5 and Form N119');
    expect(overview).not.toContain('Possession Claim Online may be available only for eligible rent-arrears-only Section 8 claims');
    expect(warnings).toContain('Do not assume Possession Claim Online is available for every claim');
  });
});
