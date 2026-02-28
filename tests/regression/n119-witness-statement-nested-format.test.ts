/**
 * N119 + Witness Statement Nested Format Regression Test
 *
 * This test ensures the root cause fix for N119 and Witness Statement issues
 * is permanently verified: the `wizardFactsToCaseFacts()` function must correctly
 * extract data from nested object formats used by complete_pack fixtures.
 *
 * ROOT CAUSE (identified 2026-01-19):
 * - The fixture uses nested objects: `tenancy.start_date`, `notice.served_date`, etc.
 * - The normalize.ts lookup lists were missing these nested paths
 * - Result: Data wasn't extracted → downstream documents received empty strings
 *
 * WHY 3 PREVIOUS PASSES FAILED:
 * 1. Template fixes didn't help - templates were correct but received empty data
 * 2. PDF flattening didn't help - can't flatten empty fields
 * 3. Witness builders worked correctly - they just received empty strings from normalize
 *
 * FIX: Added nested format paths to all lookup lists in normalize.ts:
 * - `tenancy.start_date`, `tenancy.rent_amount`, `tenancy.rent_frequency`
 * - `notice.served_date`, `notice.expiry_date`
 * - `arrears.total_arrears`, `arrears.items`
 * - `section8.grounds`, `section8.particulars_text`
 * - `court.court_name`, `court.court_address`
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { buildWitnessStatementSections, extractWitnessStatementSectionsInput } from '@/lib/documents/witness-statement-sections';
import { buildN119ReasonForPossession } from '@/lib/documents/official-forms-filler';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';

// Load the golden fixture (uses nested format)
const fixturePath = path.join(
  process.cwd(),
  'tests/fixtures/complete-pack/england.section8.ground8.case.json'
);
const goldenFixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

describe('N119 + Witness Statement Nested Format Regression', () => {
  describe('PART A: Root Cause Verification - wizardFactsToCaseFacts extracts nested formats', () => {
    it('should extract landlord name from nested landlord.full_name', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.parties.landlord.name).toBe('Tariq Mohammed');
    });

    it('should extract tenant name from nested tenant.full_name', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.parties.tenants[0]?.name).toBe('Sonia Shezadi');
    });

    it('should extract property address from nested property.address_line_1', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.property.address_line1).toBe('16 Waterloo Road');
    });

    it('should extract tenancy start_date from nested tenancy.start_date', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.tenancy.start_date).toBe('2025-07-14');
    });

    it('should extract rent_amount from nested tenancy.rent_amount', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.tenancy.rent_amount).toBe(1000.01);
    });

    it('should extract rent_frequency from nested tenancy.rent_frequency', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.tenancy.rent_frequency).toBe('monthly');
    });

    it('should extract notice date from nested notice.served_date', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      // Notice date should be extracted from notice.served_date
      expect(caseFacts.notice.notice_date || caseFacts.notice.service_date).toBeTruthy();
    });

    it('should extract notice expiry from nested notice.expiry_date', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.notice.expiry_date).toBeTruthy();
    });

    it('should extract total arrears from nested arrears.total_arrears', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.issues.rent_arrears.total_arrears).toBe(7000.07);
    });

    it('should extract arrears items from nested arrears.items', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.issues.rent_arrears.arrears_items).toHaveLength(7);
    });

    it('should extract section8 grounds from nested section8.grounds', () => {
      const caseFacts = wizardFactsToCaseFacts(goldenFixture as any);
      expect(caseFacts.issues.section8_grounds.selected_grounds).toContain('ground_8');
    });
  });

  describe('PART B: N119 Q2 - Persons in Possession', () => {
    it('should have tenant name populated (not blank)', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
      expect(caseData.tenant_full_name).toBe('Sonia Shezadi');
      expect(caseData.tenant_full_name).not.toBe('');
    });
  });

  describe('PART C: N119 Q4 - Reasons for Possession', () => {
    it('Q4(a) should contain Ground 8 reference', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
      const reason = buildN119ReasonForPossession(caseData);
      expect(reason).toContain('Ground 8');
    });

    it('Q4(a) should contain Housing Act 1988 statutory reference', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
      const reason = buildN119ReasonForPossession(caseData);
      expect(reason).toContain('Schedule 2 to the Housing Act 1988');
    });

    it('Q4(a) should contain arrears amount with single £ symbol', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
      const reason = buildN119ReasonForPossession(caseData);
      expect(reason).toContain('£7000.07');
      // Ensure no double £ symbols
      expect(reason).not.toContain('££');
    });

    it('Q4(c) statutory reference should be generated when Ground 8 selected', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);
      // Ground codes should be properly extracted
      expect(caseData.ground_numbers || caseData.ground_codes?.length).toBeTruthy();
    });
  });

  describe('PART D: Witness Statement - Real Narrative Content', () => {
    it('introduction section should contain property address (not landlord name)', () => {
      // Note: The witness statement introduction says "I am the landlord of the property at..."
      // rather than including the landlord name directly - this is court-appropriate
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.introduction).toContain('I am the landlord');
      expect(sections.introduction).toContain('16 Waterloo Road');
    });

    it('introduction section should contain Housing Act 1988 reference', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.introduction).toContain('Housing Act 1988');
    });

    it('tenancy_history section should contain start date', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.tenancy_history).toContain('14 July 2025');
    });

    it('tenancy_history section should contain rent amount', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.tenancy_history).toContain('£1,000.01');
    });

    it('tenancy_history section should contain monthly frequency', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.tenancy_history.toLowerCase()).toContain('month');
    });

    it('grounds_summary section should contain Ground 8 reference', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.grounds_summary).toContain('Ground 8');
    });

    it('grounds_summary section should contain arrears amount', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.grounds_summary).toContain('7,000.07');
    });

    it('timeline section should contain tenancy start event', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.timeline).toContain('Tenancy commenced');
    });

    it('evidence_references section should not be empty', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);
      expect(sections.evidence_references.length).toBeGreaterThan(50);
    });

    it('all sections should contain real paragraphs (not just headings)', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      // Each section should have substantial content (at least 50 chars)
      expect(sections.introduction.length).toBeGreaterThan(50);
      expect(sections.tenancy_history.length).toBeGreaterThan(50);
      expect(sections.grounds_summary.length).toBeGreaterThan(50);
      expect(sections.timeline.length).toBeGreaterThan(50);
      expect(sections.evidence_references.length).toBeGreaterThan(50);
    });
  });

  describe('PART E: Full Pipeline Integration', () => {
    it('wizardFactsToEnglandWalesEviction should produce valid evictionCase', () => {
      const { evictionCase, caseData } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);

      // EvictionCase should have all key fields populated
      expect(evictionCase.landlord_full_name).toBe('Tariq Mohammed');
      expect(evictionCase.tenant_full_name).toBe('Sonia Shezadi');
      expect(evictionCase.tenancy_start_date).toBe('2025-07-14');
      expect(evictionCase.rent_amount).toBe(1000.01);
      expect(evictionCase.rent_frequency).toBe('monthly');

      // CaseData should have all key fields populated
      expect(caseData.landlord_full_name).toBe('Tariq Mohammed');
      expect(caseData.tenant_full_name).toBe('Sonia Shezadi');
    });

    it('witness statement should generate from eviction pack flow', () => {
      const { evictionCase } = wizardFactsToEnglandWalesEviction('test-case', goldenFixture as any);

      // Simulate eviction-pack-generator.ts line 1261-1267
      const sectionsInput = extractWitnessStatementSectionsInput({
        ...goldenFixture,
        ...evictionCase,
        arrears_at_notice_date: evictionCase.arrears_at_notice_date,
      });

      const sections = buildWitnessStatementSections(sectionsInput);

      // All sections should have real content
      expect(sections.introduction).toContain('16 Waterloo Road');
      expect(sections.tenancy_history).toContain('14 July 2025');
      expect(sections.grounds_summary).toContain('Ground 8');
    });
  });

  describe('PART F: Format Compliance', () => {
    it('dates should be in UK format (14 July 2025)', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      // UK date format: day month year (not month/day/year)
      expect(sections.tenancy_history).toMatch(/\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/);
    });

    it('currency should use single £ symbol', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      // Should have £ prefix
      expect(sections.tenancy_history).toContain('£');
      // Should NOT have double £
      expect(sections.tenancy_history).not.toContain('££');
    });

    it('rent frequency should show "monthly" (not checkbox format)', () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);
      const sections = buildWitnessStatementSections(input);

      // Should show clean "monthly" text
      expect(sections.tenancy_history.toLowerCase()).toContain('month');
      // Should NOT show checkbox format like (week)(fortnight)(month)
      expect(sections.tenancy_history).not.toContain('(week)');
      expect(sections.tenancy_history).not.toContain('(fortnight)');
    });
  });
});
