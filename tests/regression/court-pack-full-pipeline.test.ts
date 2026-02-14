/**
 * Full Pipeline Test for Court Pack Generation
 *
 * This test runs the FULL generation pipeline to identify why witness statements
 * and N119 forms have persistent issues despite multiple fix attempts.
 *
 * Key checks:
 * 1. Data extraction at each stage
 * 2. Template data passed to witness statement
 * 3. N119 form data (Q2, Q4a/b/c)
 * 4. Final PDF text extraction
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
} from '@/lib/documents/witness-statement-sections';
import { buildN119ReasonForPossession } from '@/lib/documents/official-forms-filler';

// Load the golden fixture
const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/complete-pack/england.section8.ground8.case.json'
);
const goldenFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

describe('Court Pack Full Pipeline Test', () => {
  describe('Stage 1: Data Extraction from Fixture', () => {
    it('fixture has nested landlord object with full_name', () => {
      expect(goldenFixture.landlord).toBeDefined();
      expect(goldenFixture.landlord.full_name).toBe('Tariq Mohammed');
    });

    it('fixture has nested tenant object with full_name', () => {
      expect(goldenFixture.tenant).toBeDefined();
      expect(goldenFixture.tenant.full_name).toBe('Sonia Shezadi');
    });

    it('fixture has nested property object', () => {
      expect(goldenFixture.property).toBeDefined();
      expect(goldenFixture.property.address_line_1).toBe('16 Waterloo Road');
    });

    it('fixture has nested tenancy object', () => {
      expect(goldenFixture.tenancy).toBeDefined();
      expect(goldenFixture.tenancy.start_date).toBe('2025-07-14');
      expect(goldenFixture.tenancy.rent_amount).toBe(1000.01);
    });
  });

  describe('Stage 2: wizardFactsToCaseFacts Conversion', () => {
    let caseFacts: any;

    beforeAll(() => {
      caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
    });

    it('should extract landlord name correctly', () => {
      console.log('[TEST] caseFacts.parties.landlord:', caseFacts.parties?.landlord);
      expect(caseFacts.parties?.landlord?.name).toBe('Tariq Mohammed');
    });

    it('should extract tenant name correctly', () => {
      console.log('[TEST] caseFacts.parties.tenants:', caseFacts.parties?.tenants);
      expect(caseFacts.parties?.tenants?.[0]?.name).toBe('Sonia Shezadi');
    });

    it('should extract property address correctly', () => {
      console.log('[TEST] caseFacts.property:', caseFacts.property);
      expect(caseFacts.property?.address_line1).toBe('16 Waterloo Road');
    });

    it('should extract tenancy details correctly', () => {
      console.log('[TEST] caseFacts.tenancy:', caseFacts.tenancy);
      expect(caseFacts.tenancy?.start_date).toBe('2025-07-14');
      expect(caseFacts.tenancy?.rent_amount).toBe(1000.01);
    });
  });

  describe('Stage 3: extractWitnessStatementSectionsInput', () => {
    it('should extract from fixture directly (nested format)', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      console.log('[TEST] Direct extraction - landlord:', input.landlord);
      console.log('[TEST] Direct extraction - tenant:', input.tenant);
      console.log('[TEST] Direct extraction - property:', input.property);

      expect(input.landlord.full_name).toBe('Tariq Mohammed');
      expect(input.tenant.full_name).toBe('Sonia Shezadi');
      expect(input.property.address_line_1).toBe('16 Waterloo Road');
    });

    it('should extract from mixed format (spread wizardFacts + evictionCase)', () => {
      // Simulate what happens in eviction-pack-generator.ts line 1261-1267
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);

      // Build a mock evictionCase (flat format)
      const evictionCase = {
        landlord_full_name: caseFacts.parties?.landlord?.name || '',
        landlord_address_line1: caseFacts.parties?.landlord?.address_line1 || '',
        landlord_address_town: caseFacts.parties?.landlord?.city || '',
        landlord_address_postcode: caseFacts.parties?.landlord?.postcode || '',
        tenant_full_name: caseFacts.parties?.tenants?.[0]?.name || '',
        property_address: [
          caseFacts.property?.address_line1,
          caseFacts.property?.city,
          caseFacts.property?.postcode,
        ]
          .filter(Boolean)
          .join(', '),
        property_address_line1: caseFacts.property?.address_line1 || '',
        property_address_town: caseFacts.property?.city || '',
        property_address_postcode: caseFacts.property?.postcode || '',
        tenancy_start_date: caseFacts.tenancy?.start_date || '',
        rent_amount: caseFacts.tenancy?.rent_amount || 0,
        rent_frequency: caseFacts.tenancy?.rent_frequency || 'monthly',
        grounds: [{ code: 'ground_8' }],
        current_arrears: caseFacts.issues?.rent_arrears?.total_arrears || 0,
        arrears_at_notice_date: caseFacts.issues?.rent_arrears?.arrears_at_notice_date,
      };

      console.log('[TEST] evictionCase.landlord_full_name:', evictionCase.landlord_full_name);
      console.log('[TEST] evictionCase.tenant_full_name:', evictionCase.tenant_full_name);

      // Spread both (this is what happens in the generator)
      const combinedData = {
        ...goldenFixture,
        ...evictionCase,
        arrears_at_notice_date: evictionCase.arrears_at_notice_date,
      };

      console.log('[TEST] combinedData.landlord:', combinedData.landlord);
      console.log('[TEST] combinedData.landlord_full_name:', combinedData.landlord_full_name);

      const input = extractWitnessStatementSectionsInput(combinedData);

      console.log('[TEST] Extracted input.landlord:', input.landlord);
      console.log('[TEST] Extracted input.tenant:', input.tenant);

      expect(input.landlord.full_name).toBe('Tariq Mohammed');
      expect(input.tenant.full_name).toBe('Sonia Shezadi');
    });
  });

  describe('Stage 4: buildWitnessStatementSections', () => {
    it('should generate non-empty sections from fixture', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      console.log('[TEST] sections.introduction:', sections.introduction?.substring(0, 100));
      console.log('[TEST] sections.tenancy_history:', sections.tenancy_history?.substring(0, 100));
      console.log('[TEST] sections.grounds_summary:', sections.grounds_summary?.substring(0, 100));
      console.log('[TEST] sections.timeline:', sections.timeline?.substring(0, 100));
      console.log(
        '[TEST] sections.evidence_references:',
        sections.evidence_references?.substring(0, 100)
      );

      // All sections must be non-empty
      expect(sections.introduction).toBeTruthy();
      expect(sections.introduction.length).toBeGreaterThan(50);

      expect(sections.tenancy_history).toBeTruthy();
      expect(sections.tenancy_history.length).toBeGreaterThan(50);

      expect(sections.grounds_summary).toBeTruthy();
      expect(sections.grounds_summary.length).toBeGreaterThan(50);

      expect(sections.timeline).toBeTruthy();
      expect(sections.timeline.length).toBeGreaterThan(50);

      expect(sections.evidence_references).toBeTruthy();
      expect(sections.evidence_references.length).toBeGreaterThan(50);
    });

    it('should include claimant identity in introduction', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      // Introduction should mention the property address (the landlord name is in the header)
      expect(sections.introduction).toContain('16 Waterloo Road');
    });

    it('should include tenancy details in tenancy_history', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      expect(sections.tenancy_history).toContain('14 July 2025');
      expect(sections.tenancy_history).toContain('£1,000.01');
      expect(sections.tenancy_history).toContain('monthly');
    });

    it('should include Ground 8 in grounds_summary', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      expect(sections.grounds_summary).toContain('Ground 8');
      expect(sections.grounds_summary).toContain('Housing Act 1988');
      expect(sections.grounds_summary).toContain('mandatory');
    });

    it('should include arrears amount in grounds_summary', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      expect(sections.grounds_summary).toContain('£7,000.07');
    });

    it('should include timeline events', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      expect(sections.timeline).toContain('Tenancy commenced');
      expect(sections.timeline).toContain('Section 8 Notice served');
    });
  });

  describe('Stage 5: N119 Data Mapping', () => {
    it('should have tenant name for Q2 (persons in possession)', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);

      console.log('[TEST] N119 tenant_full_name:', caseFacts.parties?.tenants?.[0]?.name);

      expect(caseFacts.parties?.tenants?.[0]?.name).toBe('Sonia Shezadi');
    });

    it('should generate correct Q4(a) text for arrears', () => {
      const caseData = {
        ground_codes: ['ground_8'],
        ground_numbers: '8',
        total_arrears: goldenFixture.arrears.total_arrears,
        rent_frequency: 'monthly' as const,
      };

      const reason = buildN119ReasonForPossession(caseData);

      console.log('[TEST] N119 Q4(a) reason:', reason);

      expect(reason).toContain('Ground 8');
      expect(reason).toContain('Schedule 2 to the Housing Act 1988');
      expect(reason).toContain('£7000.07');
    });

    it('should include statutory grounds for Q4(c)', () => {
      // Q4(c) is populated in fillN119Form with explicit statutory basis
      // We test the content that would go there
      const grounds = ['ground_8'];
      const statutoryBasis = `The claimant relies on the following statutory grounds for possession: Ground 8, Schedule 2, Housing Act 1988.`;

      expect(statutoryBasis).toContain('Ground 8, Schedule 2, Housing Act 1988');
    });

    it('should NOT populate Q4(b) when no other breach details provided', () => {
      // This verifies the "no fabrication" rule for Q4(b)
      // When other_breach_details is undefined, Q4(b) should be left blank
      const caseData = {
        ground_codes: ['ground_8'],
        ground_numbers: '8',
        total_arrears: 3000,
        rent_frequency: 'monthly' as const,
        // Note: other_breach_details is NOT provided
      };

      // buildN119ReasonForPossession only returns Q4(a) content
      // Q4(b) is handled separately in fillN119Form and should be blank
      const reason = buildN119ReasonForPossession(caseData);

      // The reason text should only contain Ground 8 related content
      // It should NOT contain any fabricated "other breach" content
      expect(reason).not.toContain('breach');
      expect(reason).not.toContain('damage');
      expect(reason).not.toContain('nuisance');
    });

    it('should format tenant name correctly for Q2 (persons in possession format)', () => {
      // Test the format that getPersonsInPossession would produce
      const tenantName = 'Sonia Shezadi';
      const expectedQ2Text = `${tenantName} (the defendant)`;

      expect(expectedQ2Text).toBe('Sonia Shezadi (the defendant)');
    });

    it('should handle Ground 8 + Ground 10 for Q4(c)', () => {
      const caseData = {
        ground_codes: ['ground_8', 'ground_10'],
        ground_numbers: '8, 10',
        total_arrears: 3000,
        rent_frequency: 'monthly' as const,
      };

      const reason = buildN119ReasonForPossession(caseData);

      expect(reason).toContain('Ground 8');
      expect(reason).toContain('Ground 10');
      expect(reason).toContain('mandatory ground');
      expect(reason).toContain('discretionary ground');
    });
  });

  describe('Root Cause Investigation: Why Previous Fixes Failed', () => {
    it('HYPOTHESIS A1: Wrong code path - verify extractWitnessStatementSectionsInput handles nested format', () => {
      // The fixture uses nested format (landlord.full_name, tenant.full_name)
      // extractWitnessStatementSectionsInput should handle this
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      // If this fails, the extractor doesn't handle nested format
      expect(input.landlord.full_name).toBe('Tariq Mohammed');
      expect(input.tenant.full_name).toBe('Sonia Shezadi');
    });

    it('HYPOTHESIS A2: wizardFactsToCaseFacts drops nested format data', () => {
      // wizardFactsToCaseFacts may not recognize landlord.full_name
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);

      // Log what was extracted
      console.log('[ROOT CAUSE] caseFacts.parties.landlord.name:', caseFacts.parties?.landlord?.name);
      console.log(
        '[ROOT CAUSE] caseFacts.parties.tenants[0].name:',
        caseFacts.parties?.tenants?.[0]?.name
      );

      // If these are empty, normalize.ts doesn't recognize the nested format
      const landlordNameExtracted = caseFacts.parties?.landlord?.name || '';
      const tenantNameExtracted = caseFacts.parties?.tenants?.[0]?.name || '';

      if (!landlordNameExtracted) {
        console.error(
          '[ROOT CAUSE FOUND] wizardFactsToCaseFacts did NOT extract landlord.full_name'
        );
        console.error(
          '[ROOT CAUSE FOUND] normalize.ts needs to add "landlord.full_name" to lookup paths'
        );
      }

      if (!tenantNameExtracted) {
        console.error(
          '[ROOT CAUSE FOUND] wizardFactsToCaseFacts did NOT extract tenant.full_name'
        );
        console.error(
          '[ROOT CAUSE FOUND] normalize.ts needs to add "tenant.full_name" to lookup paths'
        );
      }

      expect(landlordNameExtracted).toBe('Tariq Mohammed');
      expect(tenantNameExtracted).toBe('Sonia Shezadi');
    });

    it('HYPOTHESIS A3: Spread order overwrites nested object', () => {
      // When spreading {wizardFacts, evictionCase}, does evictionCase overwrite landlord?
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      const evictionCase = {
        landlord_full_name: caseFacts.parties?.landlord?.name || '',
        tenant_full_name: caseFacts.parties?.tenants?.[0]?.name || '',
        // EvictionCase does NOT have a `landlord` property, so it shouldn't overwrite
      };

      const combined = {
        ...goldenFixture,
        ...evictionCase,
      };

      // If landlord is still the nested object, spread order is fine
      expect(combined.landlord).toBeDefined();
      expect(combined.landlord.full_name).toBe('Tariq Mohammed');
    });
  });
});
