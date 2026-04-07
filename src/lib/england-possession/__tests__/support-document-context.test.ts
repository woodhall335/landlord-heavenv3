import { describe, expect, it } from 'vitest';

import { enrichEnglandSection8SupportContext } from '@/lib/england-possession/support-document-context';

describe('England Section 8 support document context', () => {
  it('normalizes canonical labels, dates, and drafting model data for support docs', () => {
    const result = enrichEnglandSection8SupportContext({
      property_address: '16 Willow Mews, York, YO24 3HX',
      landlord_full_name: 'Daniel Mercer',
      tenant_full_name: 'Ivy Carleton',
      court_name: 'York County Court and Family Court',
      notice_served_date: '2026-03-05',
      earliest_possession_date: '2026-03-19',
      selected_grounds: ['Ground 8', 'Ground 10', 'Ground 11'],
      rent_amount: 1200,
      rent_frequency: 'monthly',
      total_arrears: 3600,
    });

    expect(result.form_name).toBe('Form 3A');
    expect(result.notice_name).toBe('Form 3A notice');
    expect(result.notice_type).toBe('Form 3A notice');
    expect(result.notice_title).toBe('Form 3A notice');
    expect(result.notice_expiry_date).toBe('2026-03-19');
    expect(result.earliest_proceedings_date).toBe('2026-03-19');
    expect(result.notice_expiry_date_formatted).toBe('19/03/2026');
    expect(result.ground_descriptions).toContain('Ground 8');
    expect(result.drafting_model.caseSummary.narrativeParagraphs.join(' ')).toContain('Ground 8 is relied on');
    expect(result.preview_summary.shortTitle).toContain('England possession case');
  });

  it('derives specialist-ground evidence sections when the wizard supplies structured facts', () => {
    const result = enrichEnglandSection8SupportContext({
      property_address: '8 Stonegate, York, YO1 8AS',
      tenant_full_name: 'Mina Cole',
      notice_service_date: '2026-04-01',
      notice_expiry_date: '2026-07-30',
      ground_codes: ['2ZA', '7B'],
      ground_2za: {
        factual_basis: 'the superior lease requires vacant possession when the term ends',
        notice_or_status_details: 'superior landlord notice dated 1 April 2026',
      },
      ground_7b: {
        status_basis: 'Home Office disqualification notice',
        supporting_evidence: 'right to rent check record',
      },
    });

    expect(result.drafting_model.evidenceChecklist.groundSections).toHaveLength(2);
    expect(result.drafting_model.evidenceChecklist.groundSections[0]?.title).toContain('Ground 2ZA');
    expect(result.drafting_model.noticeExplanationParagraphs.join(' ')).not.toContain('statutory factual basis for possession when superior lease ends is met');
  });

  it('normalizes legacy complete-pack names, addresses, and optional latest proceedings dates', () => {
    const result = enrichEnglandSection8SupportContext({
      landlord_name: 'Daniel Mercer',
      tenant1_name: 'Ivy Carleton',
      property_address_line1: '16 Willow Mews',
      property_city: 'York',
      property_county: 'North Yorkshire',
      property_postcode: 'YO24 3HX',
      landlord_address_line1: '27 Rowan Avenue',
      landlord_city: 'Leeds',
      landlord_county: 'West Yorkshire',
      landlord_postcode: 'LS8 2PF',
      notice_service_date: '2026-06-01',
      notice_expiry_date: '2026-06-29',
      earliest_proceedings_date: '2026-06-29',
      latest_proceedings_date: '2026-12-29',
      ground_codes: ['12'],
    });

    expect(result.landlord_full_name).toBe('Daniel Mercer');
    expect(result.tenant_full_name).toBe('Ivy Carleton');
    expect(result.property_address).toBe('16 Willow Mews\nYork\nNorth Yorkshire\nYO24 3HX');
    expect(result.landlord_address).toBe('27 Rowan Avenue\nLeeds\nWest Yorkshire\nLS8 2PF');
    expect(result.latest_proceedings_date_formatted).toBe('29/12/2026');
    expect(result.notice_name).toBe(result.notice_type);
  });
});
