/**
 * Tests for Tenancy Agreement Integration Layer
 *
 * Validates:
 * 1. UI tests - Standard vs Premium feature display
 * 2. Document tests - PDF content inclusion by tier
 * 3. Consistency tests - UI matches PDF contents
 */

import {
  getIncludedFeatures,
  getIncludedSummary,
  getInventoryBehaviour,
  validatePDFMatchesAdvertised,
  isFeatureIncluded,
  getTierRecommendation,
  JURISDICTION_AGREEMENT_INFO,
  COMPLIANCE_CHECKLIST_INFO,
  type TenancyJurisdiction,
  type TenancyTier,
} from '../included-features';

describe('Tenancy Included Features - Integration Layer', () => {
  const jurisdictions: TenancyJurisdiction[] = ['england', 'wales', 'scotland', 'northern-ireland'];
  const tiers: TenancyTier[] = ['standard', 'premium'];

  // ============================================================================
  // PART 1: UI TESTS - Feature display by tier
  // ============================================================================

  describe('UI Tests - Feature Display by Tier', () => {
    describe('Standard tier', () => {
      it('should show "Blank Inventory Template" for standard tier', () => {
        const inventoryInfo = getInventoryBehaviour('standard');
        expect(inventoryInfo.label).toBe('Blank Inventory Template');
        expect(inventoryInfo.wizardRequired).toBe(false);
      });

      it('should NOT include premium-only features in standard tier', () => {
        expect(isFeatureIncluded('guarantor_provisions', 'standard')).toBe(false);
        expect(isFeatureIncluded('hmo_clauses', 'standard')).toBe(false);
        expect(isFeatureIncluded('late_payment', 'standard')).toBe(false);
        expect(isFeatureIncluded('rent_review', 'standard')).toBe(false);
      });

      it('should always include compliance checklist', () => {
        expect(isFeatureIncluded('compliance_checklist', 'standard')).toBe(true);
      });

      jurisdictions.forEach((jurisdiction) => {
        it(`should return correct standard features for ${jurisdiction}`, () => {
          const features = getIncludedFeatures(jurisdiction, 'standard');

          // Must have main agreement
          const hasAgreement = features.some(f => f.id === 'main_agreement');
          expect(hasAgreement).toBe(true);

          // Must have inventory schedule
          const hasInventory = features.some(f => f.id === 'schedule_inventory');
          expect(hasInventory).toBe(true);

          // Must have compliance checklist
          const hasChecklist = features.some(f => f.id === 'compliance_checklist');
          expect(hasChecklist).toBe(true);

          // Must NOT have premium-only features
          const hasPremiumFeatures = features.some(f => f.isPremiumOnly);
          expect(hasPremiumFeatures).toBe(false);
        });
      });
    });

    describe('Premium tier', () => {
      it('should show "Wizard-Completed Inventory" for premium tier', () => {
        const inventoryInfo = getInventoryBehaviour('premium');
        expect(inventoryInfo.label).toBe('Wizard-Completed Inventory');
        expect(inventoryInfo.wizardRequired).toBe(true);
      });

      it('should include premium-only features in premium tier', () => {
        expect(isFeatureIncluded('guarantor_provisions', 'premium')).toBe(true);
        expect(isFeatureIncluded('hmo_clauses', 'premium')).toBe(true);
        expect(isFeatureIncluded('late_payment', 'premium')).toBe(true);
        expect(isFeatureIncluded('rent_review', 'premium')).toBe(true);
      });

      it('should always include compliance checklist', () => {
        expect(isFeatureIncluded('compliance_checklist', 'premium')).toBe(true);
      });

      jurisdictions.forEach((jurisdiction) => {
        it(`should return correct premium features for ${jurisdiction}`, () => {
          const features = getIncludedFeatures(jurisdiction, 'premium');

          // Must have main agreement (HMO version)
          const agreement = features.find(f => f.id === 'main_agreement');
          expect(agreement).toBeDefined();
          expect(agreement?.label).toContain('HMO');

          // Must have inventory schedule
          const hasInventory = features.some(f => f.id === 'schedule_inventory');
          expect(hasInventory).toBe(true);

          // Must have compliance checklist
          const hasChecklist = features.some(f => f.id === 'compliance_checklist');
          expect(hasChecklist).toBe(true);

          // Must have premium-only features
          const hasPremiumFeatures = features.some(f => f.isPremiumOnly);
          expect(hasPremiumFeatures).toBe(true);
        });
      });
    });
  });

  // ============================================================================
  // PART 2: DOCUMENT TESTS - PDF content by tier
  // ============================================================================

  describe('Document Tests - PDF Content by Tier', () => {
    describe('Standard PDFs', () => {
      it('should validate blank inventory schedule in standard PDFs', () => {
        const result = validatePDFMatchesAdvertised('england', 'standard', {
          hasAgreement: true,
          hasInventory: true,
          inventoryIsCompleted: false, // Blank inventory
          hasComplianceChecklist: true,
          hasSignatureBlocks: true,
          scheduleCount: 5,
        });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail validation if inventory is missing', () => {
        const result = validatePDFMatchesAdvertised('england', 'standard', {
          hasAgreement: true,
          hasInventory: false, // Missing!
          inventoryIsCompleted: false,
          hasComplianceChecklist: true,
          hasSignatureBlocks: true,
          scheduleCount: 4,
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('PDF missing inventory schedule');
      });

      it('should fail validation if compliance checklist is missing', () => {
        const result = validatePDFMatchesAdvertised('england', 'standard', {
          hasAgreement: true,
          hasInventory: true,
          inventoryIsCompleted: false,
          hasComplianceChecklist: false, // Missing!
          hasSignatureBlocks: true,
          scheduleCount: 5,
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('PDF missing compliance checklist');
      });
    });

    describe('Premium PDFs', () => {
      it('should validate completed inventory in premium PDFs', () => {
        const result = validatePDFMatchesAdvertised('england', 'premium', {
          hasAgreement: true,
          hasInventory: true,
          inventoryIsCompleted: true, // Wizard-completed
          hasComplianceChecklist: true,
          hasSignatureBlocks: true,
          scheduleCount: 5,
        });

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail validation if premium PDF has blank inventory', () => {
        const result = validatePDFMatchesAdvertised('england', 'premium', {
          hasAgreement: true,
          hasInventory: true,
          inventoryIsCompleted: false, // Should be completed!
          hasComplianceChecklist: true,
          hasSignatureBlocks: true,
          scheduleCount: 5,
        });

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Premium PDF has blank inventory but should have wizard-completed inventory');
      });

      it('should fail validation if schedule count is too low', () => {
        const result = validatePDFMatchesAdvertised('england', 'premium', {
          hasAgreement: true,
          hasInventory: true,
          inventoryIsCompleted: true,
          hasComplianceChecklist: true,
          hasSignatureBlocks: true,
          scheduleCount: 3, // Too few!
        });

        expect(result.valid).toBe(false);
        expect(result.errors[0]).toContain('should have at least 5');
      });
    });

    describe('All jurisdictions', () => {
      jurisdictions.forEach((jurisdiction) => {
        it(`should have valid compliance checklist info for ${jurisdiction}`, () => {
          const checklistInfo = COMPLIANCE_CHECKLIST_INFO[jurisdiction];
          expect(checklistInfo).toBeDefined();
          expect(checklistInfo.title).toContain('Checklist');
          expect(checklistInfo.title).toContain(jurisdiction === 'northern-ireland' ? 'Northern Ireland' : jurisdiction.charAt(0).toUpperCase() + jurisdiction.slice(1));
        });

        it(`should have valid agreement info for ${jurisdiction}`, () => {
          const agreementInfo = JURISDICTION_AGREEMENT_INFO[jurisdiction];
          expect(agreementInfo).toBeDefined();
          expect(agreementInfo.agreementName).toBeTruthy();
          expect(agreementInfo.legalFramework).toBeTruthy();
        });
      });
    });
  });

  // ============================================================================
  // PART 3: CONSISTENCY TESTS - UI matches PDF
  // ============================================================================

  describe('Consistency Tests - UI Matches PDF', () => {
    describe('Included summary matches actual features', () => {
      jurisdictions.forEach((jurisdiction) => {
        tiers.forEach((tier) => {
          it(`should have consistent summary for ${jurisdiction} ${tier}`, () => {
            const summary = getIncludedSummary(jurisdiction, tier);
            const features = getIncludedFeatures(jurisdiction, tier);

            // Headline should mention key items
            expect(summary.headline.length).toBeGreaterThan(0);

            // Details should have at least 3 categories
            expect(summary.details.length).toBeGreaterThanOrEqual(3);

            // Tier difference should be defined
            expect(summary.tierDifference).toBeTruthy();

            // Features should include agreement, inventory, and checklist
            expect(features.some(f => f.category === 'agreement')).toBe(true);
            expect(features.some(f => f.category === 'schedule')).toBe(true);
            expect(features.some(f => f.category === 'compliance')).toBe(true);
          });
        });
      });
    });

    describe('Inventory behaviour matches tier', () => {
      it('should describe standard inventory as blank template', () => {
        const standardInventory = getInventoryBehaviour('standard');
        expect(standardInventory.description).toContain('manual');
        expect(standardInventory.description.toLowerCase()).not.toContain('wizard');
      });

      it('should describe premium inventory as wizard-completed', () => {
        const premiumInventory = getInventoryBehaviour('premium');
        expect(premiumInventory.description).toContain('wizard');
      });
    });

    describe('No premium features appear in standard listings', () => {
      jurisdictions.forEach((jurisdiction) => {
        it(`should not include premium features in ${jurisdiction} standard`, () => {
          const standardFeatures = getIncludedFeatures(jurisdiction, 'standard');
          const premiumOnlyFeatures = standardFeatures.filter(f => f.isPremiumOnly);

          expect(premiumOnlyFeatures).toHaveLength(0);
        });
      });
    });
  });

  // ============================================================================
  // PART 4: TIER RECOMMENDATION TESTS
  // ============================================================================

  describe('Tier Recommendation Tests', () => {
    it('should recommend premium for HMO properties', () => {
      const result = getTierRecommendation({ isHMO: true });
      expect(result.recommendedTier).toBe('premium');
      expect(result.reason).toContain('HMO');
    });

    it('should recommend premium for 3+ tenants', () => {
      const result = getTierRecommendation({ tenantCount: 3 });
      expect(result.recommendedTier).toBe('premium');
      expect(result.reason).toContain('3+');
    });

    it('should recommend premium for student lets', () => {
      const result = getTierRecommendation({ isStudentLet: true });
      expect(result.recommendedTier).toBe('premium');
      expect(result.reason).toContain('Student');
    });

    it('should recommend premium if guarantor needed', () => {
      const result = getTierRecommendation({ hasGuarantor: true });
      expect(result.recommendedTier).toBe('premium');
      expect(result.reason).toContain('Guarantor');
    });

    it('should recommend standard for simple single household', () => {
      const result = getTierRecommendation({
        tenantCount: 1,
        isHMO: false,
        isStudentLet: false,
        hasGuarantor: false,
      });
      expect(result.recommendedTier).toBe('standard');
      expect(result.reason).toContain('single households');
    });
  });
});
