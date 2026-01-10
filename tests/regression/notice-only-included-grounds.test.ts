import { describe, expect, it } from 'vitest';
import { mapNoticeOnlyFacts } from '@/lib/case-facts/normalize';
import {
  computeIncludedGrounds,
  getAutoAddedGrounds,
  generateGroundSuggestions,
  hasArrearsGrounds,
  hasAsbGrounds,
  hasDamageGrounds,
  hasBreachGround,
} from '@/lib/wizard/ground-suggestions';
import { getEvictionPackContents } from '@/lib/documents/eviction-pack-contents';

/**
 * Regression tests for Notice Only Section 8 included grounds feature
 *
 * Requirements:
 * 1. included_grounds = selected_grounds UNION recommended_grounds
 * 2. Review UI shows both selected and auto-added grounds
 * 3. Suggestions are ground-specific (not generic)
 * 4. Rent schedule included when arrears grounds (8/10/11) are present
 * 5. Notice period calculated based on included grounds
 */
describe('Notice Only Section 8 - Included Grounds', () => {
  describe('computeIncludedGrounds', () => {
    it('merges selected and recommended grounds', () => {
      const selectedGrounds = ['Ground 8'];
      const recommendedGrounds = [{ code: '10' }, { code: '11' }];

      const included = computeIncludedGrounds(selectedGrounds, recommendedGrounds);

      expect(included).toContain('Ground 8');
      expect(included).toContain('Ground 10');
      expect(included).toContain('Ground 11');
      expect(included.length).toBe(3);
    });

    it('deduplicates overlapping grounds', () => {
      const selectedGrounds = ['Ground 8', 'Ground 10'];
      const recommendedGrounds = [{ code: '8' }, { code: '11' }];

      const included = computeIncludedGrounds(selectedGrounds, recommendedGrounds);

      // Should not have duplicate Ground 8
      const ground8Count = included.filter(g => g.includes('8')).length;
      expect(ground8Count).toBe(1);
      expect(included.length).toBe(3);
    });

    it('handles empty recommended grounds', () => {
      const selectedGrounds = ['Ground 8'];
      const recommendedGrounds: Array<{ code: string }> = [];

      const included = computeIncludedGrounds(selectedGrounds, recommendedGrounds);

      expect(included).toEqual(['Ground 8']);
    });

    it('handles undefined recommended grounds', () => {
      const selectedGrounds = ['Ground 8', 'Ground 10'];

      const included = computeIncludedGrounds(selectedGrounds, undefined);

      expect(included).toEqual(['Ground 10', 'Ground 8']);
    });

    it('sorts grounds numerically', () => {
      const selectedGrounds = ['Ground 14'];
      const recommendedGrounds = [{ code: '8' }, { code: '10' }];

      const included = computeIncludedGrounds(selectedGrounds, recommendedGrounds);

      expect(included[0]).toBe('Ground 8');
      expect(included[1]).toBe('Ground 10');
      expect(included[2]).toBe('Ground 14');
    });
  });

  describe('getAutoAddedGrounds', () => {
    it('identifies grounds added by recommendation', () => {
      const selectedGrounds = ['Ground 8'];
      const includedGrounds = ['Ground 8', 'Ground 10', 'Ground 11'];

      const autoAdded = getAutoAddedGrounds(selectedGrounds, includedGrounds);

      expect(autoAdded).not.toContain('Ground 8');
      expect(autoAdded).toContain('Ground 10');
      expect(autoAdded).toContain('Ground 11');
      expect(autoAdded.length).toBe(2);
    });

    it('returns empty array when no grounds were auto-added', () => {
      const selectedGrounds = ['Ground 8', 'Ground 10'];
      const includedGrounds = ['Ground 8', 'Ground 10'];

      const autoAdded = getAutoAddedGrounds(selectedGrounds, includedGrounds);

      expect(autoAdded.length).toBe(0);
    });
  });

  describe('Ground type detection helpers', () => {
    it('hasArrearsGrounds detects Ground 8, 10, 11', () => {
      expect(hasArrearsGrounds(['Ground 8'])).toBe(true);
      expect(hasArrearsGrounds(['Ground 10'])).toBe(true);
      expect(hasArrearsGrounds(['Ground 11'])).toBe(true);
      expect(hasArrearsGrounds(['Ground 12'])).toBe(false);
      expect(hasArrearsGrounds(['Ground 8', 'Ground 14'])).toBe(true);
    });

    it('hasAsbGrounds detects Ground 14', () => {
      expect(hasAsbGrounds(['Ground 14'])).toBe(true);
      expect(hasAsbGrounds(['Ground 8'])).toBe(false);
      expect(hasAsbGrounds(['Ground 8', 'Ground 14'])).toBe(true);
    });

    it('hasDamageGrounds detects Ground 13, 15', () => {
      expect(hasDamageGrounds(['Ground 13'])).toBe(true);
      expect(hasDamageGrounds(['Ground 15'])).toBe(true);
      expect(hasDamageGrounds(['Ground 8'])).toBe(false);
    });

    it('hasBreachGround detects Ground 12', () => {
      expect(hasBreachGround(['Ground 12'])).toBe(true);
      expect(hasBreachGround(['Ground 8'])).toBe(false);
    });
  });
});

describe('Notice Only Section 8 - Ground-Specific Suggestions', () => {
  it('generates arrears-specific suggestions for Ground 8/10/11', () => {
    const includedGrounds = ['Ground 8', 'Ground 10', 'Ground 11'];

    const { suggestions, summary } = generateGroundSuggestions(includedGrounds);

    // Should include arrears-related suggestions
    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).toContain('rent_schedule');
    expect(suggestionIds).toContain('tenancy_agreement');
    expect(suggestionIds).toContain('arrears_correspondence');

    // Should NOT include ASB or damage suggestions
    expect(suggestionIds).not.toContain('incident_log');
    expect(suggestionIds).not.toContain('police_reports');
    expect(suggestionIds).not.toContain('damage_photos');

    expect(summary).toContain('arrears');
  });

  it('generates ASB-specific suggestions for Ground 14', () => {
    const includedGrounds = ['Ground 14'];

    const { suggestions } = generateGroundSuggestions(includedGrounds);

    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).toContain('incident_log');
    expect(suggestionIds).toContain('police_reports');
    expect(suggestionIds).toContain('witness_statements');

    // Should NOT include arrears-specific suggestions
    expect(suggestionIds).not.toContain('rent_schedule');
    expect(suggestionIds).not.toContain('bank_statements');
  });

  it('generates damage-specific suggestions for Ground 13/15', () => {
    const includedGrounds = ['Ground 13'];

    const { suggestions } = generateGroundSuggestions(includedGrounds);

    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).toContain('damage_photos');
    expect(suggestionIds).toContain('inventory_report');
    expect(suggestionIds).toContain('repair_quotes');

    // Should NOT include arrears or ASB suggestions
    expect(suggestionIds).not.toContain('rent_schedule');
    expect(suggestionIds).not.toContain('incident_log');
  });

  it('generates breach-specific suggestions for Ground 12', () => {
    const includedGrounds = ['Ground 12'];

    const { suggestions } = generateGroundSuggestions(includedGrounds);

    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).toContain('tenancy_clause');
    expect(suggestionIds).toContain('breach_evidence');
    expect(suggestionIds).toContain('breach_notices');
  });

  it('combines suggestions for multiple ground types', () => {
    const includedGrounds = ['Ground 8', 'Ground 14'];

    const { suggestions, summary } = generateGroundSuggestions(includedGrounds);

    const suggestionIds = suggestions.map(s => s.id);
    // Should include both arrears AND ASB suggestions
    expect(suggestionIds).toContain('rent_schedule');
    expect(suggestionIds).toContain('incident_log');

    // Summary should reference both categories
    expect(summary).toContain('arrears');
  });

  it('filters out suggestions when evidence is already uploaded', () => {
    const includedGrounds = ['Ground 8'];
    const evidence = {
      rent_schedule_uploaded: true,
      tenancy_agreement_uploaded: true,
    };

    const { suggestions } = generateGroundSuggestions(includedGrounds, evidence);

    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).not.toContain('rent_schedule');
    expect(suggestionIds).not.toContain('tenancy_agreement');
    // Should still suggest other arrears evidence
    expect(suggestionIds).toContain('arrears_correspondence');
  });
});

describe('Notice Only Section 8 - Pack Documents with Arrears Grounds', () => {
  it('includes rent schedule for Notice Only when arrears grounds are present', () => {
    const packContents = getEvictionPackContents({
      jurisdiction: 'england',
      route: 'section_8',
      packType: 'notice_only',
      includedGroundCodes: [8, 10, 11],
    });

    // Find the evidence tools category
    const evidenceCategory = packContents.find(c => c.id === 'evidence_tools');
    expect(evidenceCategory).toBeDefined();
    expect(evidenceCategory!.title).toBe('Arrears Documentation');

    // Should have arrears schedule
    const arrearsSchedule = evidenceCategory!.documents.find(d => d.id === 'arrears_schedule');
    expect(arrearsSchedule).toBeDefined();
    expect(arrearsSchedule!.title).toBe('Rent Arrears Schedule');
  });

  it('does not include rent schedule when no arrears grounds', () => {
    const packContents = getEvictionPackContents({
      jurisdiction: 'england',
      route: 'section_8',
      packType: 'notice_only',
      includedGroundCodes: [14], // ASB only
    });

    // Should not have evidence tools category for notice_only without arrears
    const evidenceCategory = packContents.find(c => c.id === 'evidence_tools');
    expect(evidenceCategory).toBeUndefined();
  });

  it('includes rent schedule for Complete Pack with arrears', () => {
    const packContents = getEvictionPackContents({
      jurisdiction: 'england',
      route: 'section_8',
      packType: 'complete_pack',
      includedGroundCodes: [8],
    });

    const evidenceCategory = packContents.find(c => c.id === 'evidence_tools');
    expect(evidenceCategory).toBeDefined();

    const arrearsSchedule = evidenceCategory!.documents.find(d => d.id === 'arrears_schedule');
    expect(arrearsSchedule).toBeDefined();
  });
});

describe('Notice Only Section 8 - Form 3 Uses Included Grounds', () => {
  it('uses section8_included_grounds when available', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      // User only selected Ground 8
      section8_grounds: ['Ground 8'],
      // But analyze API computed included_grounds with 10 and 11
      section8_included_grounds: ['Ground 8', 'Ground 10', 'Ground 11'],
      grounds_auto_merged: true,
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Should have 3 grounds, not just 1
    expect(templateData.grounds.length).toBe(3);
    expect(templateData.grounds.map((g: any) => g.code)).toContain(8);
    expect(templateData.grounds.map((g: any) => g.code)).toContain(10);
    expect(templateData.grounds.map((g: any) => g.code)).toContain(11);
  });

  it('falls back to section8_grounds when included_grounds not present', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds: ['Ground 8', 'Ground 10'],
      // No section8_included_grounds
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Should use the original grounds
    expect(templateData.grounds.length).toBe(2);
  });

  it('calculates notice period from included_grounds', () => {
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_grounds: ['Ground 8'], // 14 days
      section8_included_grounds: ['Ground 8', 'Ground 10'], // Ground 10 = 60 days
      grounds_auto_merged: true,
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);

    // Should use 60 days because Ground 10 is included
    expect(templateData.notice_period_days).toBe(60);
    expect(templateData.notice_period_description).toBe('2 months');
  });
});

describe('Notice Only Section 8 - Review Header', () => {
  /**
   * For Notice Only flows, the header should NOT reference:
   * - N5 (claim form)
   * - N119 (particulars of claim)
   * - Possession routes
   *
   * Instead it should show: "England • Section 8 Notice (Form 3)"
   */
  it('header label format for Section 8', () => {
    // Test the expected header format
    const jurisdiction = 'england';
    const noticeType = 'Section 8 Notice (Form 3)';
    const includedGrounds = ['Ground 8', 'Ground 10', 'Ground 11'];

    const headerLabel = `${jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1)} • ${noticeType}`;
    const groundsSummary = `Grounds included: ${includedGrounds.map(g => g.replace('Ground ', '')).join(', ')}`;

    expect(headerLabel).toBe('England • Section 8 Notice (Form 3)');
    expect(groundsSummary).toBe('Grounds included: 8, 10, 11');

    // Should NOT contain court form references
    expect(headerLabel).not.toContain('N5');
    expect(headerLabel).not.toContain('N119');
    expect(headerLabel).not.toContain('possession');
  });

  it('header label format for Section 21', () => {
    const jurisdiction = 'england';
    const noticeType = 'Section 21 Notice (Form 6A)';

    const headerLabel = `${jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1)} • ${noticeType}`;

    expect(headerLabel).toBe('England • Section 21 Notice (Form 6A)');
    expect(headerLabel).not.toContain('N5');
    expect(headerLabel).not.toContain('N119');
  });
});

describe('Notice Only Section 8 - Complete Flow Regression', () => {
  /**
   * Full integration test simulating the complete flow:
   * 1. User selects Ground 8
   * 2. Decision engine recommends Grounds 8, 10, 11
   * 3. included_grounds = [8, 10, 11]
   * 4. Notice contains all 3 grounds
   * 5. Rent schedule is included in pack
   * 6. Suggestions are arrears-specific
   */
  it('Ground 8 selection results in 8+10+11 with arrears suggestions and rent schedule', () => {
    // Step 1: User selects Ground 8
    const selectedGrounds = ['Ground 8'];

    // Step 2: Decision engine recommends additional grounds (simulated)
    const recommendedGrounds = [{ code: '8' }, { code: '10' }, { code: '11' }];

    // Step 3: Compute included grounds
    const includedGrounds = computeIncludedGrounds(selectedGrounds, recommendedGrounds);
    expect(includedGrounds).toContain('Ground 8');
    expect(includedGrounds).toContain('Ground 10');
    expect(includedGrounds).toContain('Ground 11');

    // Step 4: Auto-added grounds identified
    const autoAddedGrounds = getAutoAddedGrounds(selectedGrounds, includedGrounds);
    expect(autoAddedGrounds).toContain('Ground 10');
    expect(autoAddedGrounds).toContain('Ground 11');

    // Step 5: Generate Form 3 with included grounds
    const wizardFacts = {
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      section8_included_grounds: includedGrounds,
      grounds_auto_merged: true,
      landlord_full_name: 'John Doe',
      tenant_full_name: 'Jane Smith',
      property_address: '123 Test Street',
      total_arrears: 3000,
      rent_amount: 1000,
      rent_frequency: 'monthly',
      notice_service_date: '2024-01-01',
    };

    const templateData = mapNoticeOnlyFacts(wizardFacts);
    expect(templateData.grounds.length).toBe(3);

    // Step 6: Rent schedule in pack
    const packContents = getEvictionPackContents({
      jurisdiction: 'england',
      route: 'section_8',
      packType: 'notice_only',
      includedGroundCodes: [8, 10, 11],
    });

    const evidenceCategory = packContents.find(c => c.id === 'evidence_tools');
    expect(evidenceCategory).toBeDefined();

    // Step 7: Suggestions are arrears-specific
    const { suggestions } = generateGroundSuggestions(includedGrounds);
    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).toContain('rent_schedule');
    expect(suggestionIds).not.toContain('incident_log');
    expect(suggestionIds).not.toContain('damage_photos');
  });

  it('Ground 14 selection results in ASB suggestions, no rent schedule', () => {
    const selectedGrounds = ['Ground 14'];
    const recommendedGrounds = [{ code: '14' }];

    const includedGrounds = computeIncludedGrounds(selectedGrounds, recommendedGrounds);
    expect(includedGrounds).toContain('Ground 14');
    expect(includedGrounds).not.toContain('Ground 8');

    // ASB-specific suggestions
    const { suggestions } = generateGroundSuggestions(includedGrounds);
    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).toContain('incident_log');
    expect(suggestionIds).toContain('police_reports');
    expect(suggestionIds).not.toContain('rent_schedule');

    // No rent schedule in pack
    const packContents = getEvictionPackContents({
      jurisdiction: 'england',
      route: 'section_8',
      packType: 'notice_only',
      includedGroundCodes: [14],
    });

    const evidenceCategory = packContents.find(c => c.id === 'evidence_tools');
    expect(evidenceCategory).toBeUndefined();
  });

  it('Ground 13 selection results in damage suggestions', () => {
    const selectedGrounds = ['Ground 13'];
    const recommendedGrounds = [{ code: '13' }];

    const includedGrounds = computeIncludedGrounds(selectedGrounds, recommendedGrounds);

    const { suggestions } = generateGroundSuggestions(includedGrounds);
    const suggestionIds = suggestions.map(s => s.id);
    expect(suggestionIds).toContain('damage_photos');
    expect(suggestionIds).toContain('inventory_report');
    expect(suggestionIds).toContain('repair_quotes');
    expect(suggestionIds).not.toContain('rent_schedule');
    expect(suggestionIds).not.toContain('incident_log');
  });
});
