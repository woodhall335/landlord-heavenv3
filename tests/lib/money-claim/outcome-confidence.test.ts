/**
 * Outcome Confidence Indicator Tests
 *
 * Tests the rules-based scoring model for case strength assessment.
 */

import {
  calculateOutcomeConfidence,
  getConfidenceLevelLabel,
  getConfidenceLevelColor,
  getPackQualityLevelLabel,
  getPackQualityLevelColor,
  type CaseFactsForScoring,
} from '@/lib/money-claim/outcome-confidence';

describe('Outcome Confidence Indicator', () => {
  describe('calculateOutcomeConfidence', () => {
    describe('evidence scoring', () => {
      it('gives low evidence score for no documents', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.breakdown.evidence.score).toBeLessThan(10);
      });

      it('increases score with relevant documents uploaded', () => {
        const factsWithDocs: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          uploaded_documents: [
            { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
            { id: '2', name: 'bank-statement-jan-2025.pdf', type: 'application/pdf' },
          ],
        };

        const factsNoDocs: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          uploaded_documents: [],
        };

        const withDocs = calculateOutcomeConfidence(factsWithDocs);
        const noDocs = calculateOutcomeConfidence(factsNoDocs);

        expect(withDocs.breakdown.evidence.score).toBeGreaterThan(noDocs.breakdown.evidence.score);
      });

      it('recognizes photo evidence for damage claims', () => {
        const factsWithPhotos: CaseFactsForScoring = {
          claiming_damages: true,
          money_claim: {
            other_amounts_types: ['property_damage'],
            damage_items: [{ description: 'Broken window', amount: 200 }],
          },
          uploaded_documents: [
            { id: '1', name: 'damage-photo.jpg', type: 'image/jpeg' },
          ],
        };

        const result = calculateOutcomeConfidence(factsWithPhotos);
        expect(result.positiveFactors).toContain('Photographic evidence provided');
      });

      it('recognizes inventory evidence', () => {
        const factsWithInventory: CaseFactsForScoring = {
          claiming_damages: true,
          money_claim: {
            other_amounts_types: ['property_damage'],
          },
          uploaded_documents: [
            { id: '1', name: 'checkout-inventory.pdf', type: 'application/pdf' },
          ],
        };

        const result = calculateOutcomeConfidence(factsWithInventory);
        expect(result.positiveFactors).toContain('Inventory report provided');
      });
    });

    describe('claim clarity scoring', () => {
      it('gives higher score for detailed basis of claim', () => {
        const detailedFacts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'The tenant failed to pay rent for the period January 2025 to June 2025. Despite multiple reminders sent on 1st Feb, 1st Mar, and 1st Apr, no payments were received. The total outstanding amount is £6,000 representing 6 months at £1,000 per month.',
          },
        };

        const briefFacts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant owes rent.',
          },
        };

        const detailed = calculateOutcomeConfidence(detailedFacts);
        const brief = calculateOutcomeConfidence(briefFacts);

        expect(detailed.breakdown.claimClarity.score).toBeGreaterThan(
          brief.breakdown.claimClarity.score
        );
      });

      it('rewards complete arrears entries', () => {
        const completeFacts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1000, rent_paid: 0 },
          ],
          rent_amount: 1000,
          rent_frequency: 'monthly',
        };

        const incompleteFacts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          arrears_items: [
            { period_start: null, period_end: null, rent_due: null, rent_paid: null },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1000, rent_paid: 0 },
          ],
        };

        const complete = calculateOutcomeConfidence(completeFacts);
        const incomplete = calculateOutcomeConfidence(incompleteFacts);

        expect(complete.breakdown.claimClarity.score).toBeGreaterThan(
          incomplete.breakdown.claimClarity.score
        );
      });

      it('rewards interest calculation being complete', () => {
        const withInterest: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            charge_interest: true,
            interest_rate: 8,
            interest_start_date: '2025-01-01',
          },
        };

        const noInterestDecision: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {},
        };

        const withInt = calculateOutcomeConfidence(withInterest);
        const noInt = calculateOutcomeConfidence(noInterestDecision);

        expect(withInt.breakdown.claimClarity.score).toBeGreaterThan(
          noInt.breakdown.claimClarity.score
        );
      });
    });

    describe('PAP compliance scoring', () => {
      /**
       * Two-stage PAP scoring model tests:
       * - Stage 1: PAP pack generated (60% = 15/25)
       * - Stage 2: PAP sent + 30 days (full credit ~100%)
       */

      it('gives high PAP score when letter sent and 30 days elapsed', () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 35);

        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: true,
          pap_letter_date: thirtyDaysAgo.toISOString().split('T')[0],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.breakdown.papCompliance.score).toBeGreaterThanOrEqual(20);
        expect(result.positiveFactors).toContain('30-day response period elapsed');
      });

      it('gives substantial PAP score when letter sent but less than 30 days', () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: true,
          pap_letter_date: tenDaysAgo.toISOString().split('T')[0],
        };

        const result = calculateOutcomeConfidence(facts);
        // Letter sent but not yet 30 days - should still get credit for sending
        expect(result.breakdown.papCompliance.score).toBeGreaterThanOrEqual(17);
        expect(result.positiveFactors).toContain('Letter Before Claim sent');
      });

      it('gives zero PAP score when no letter sent AND no PAP pack generated', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
          // generate_pap_documents not set
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.breakdown.papCompliance.score).toBe(0);
      });

      /**
       * CRITICAL FIX: Stage 1 - PAP pack generated gives substantial credit (15/25 = 60%)
       * This ensures users who chose to have us generate the PAP pack don't get near-zero score.
       */
      it('gives substantial PAP score when PAP pack is generated (Stage 1)', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
          money_claim: {
            generate_pap_documents: true,
          },
        };

        const result = calculateOutcomeConfidence(facts);
        // Stage 1: PAP pack generated = 15/25 = 60%
        expect(result.breakdown.papCompliance.score).toBeGreaterThanOrEqual(15);
        expect(result.positiveFactors).toContain(
          'PAP pack generated (Letter Before Claim, Info Sheet, Reply Form, Financial Statement)'
        );
      });

      it('shows appropriate improvement tip when PAP pack is generated but not sent', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
          money_claim: {
            generate_pap_documents: true,
          },
        };

        const result = calculateOutcomeConfidence(facts);
        // Should guide user to send the pack and wait 30 days
        expect(result.improvements).toContainEqual(
          expect.stringContaining('Send the PAP Letter Before Claim pack')
        );
        expect(result.improvements).toContainEqual(
          expect.stringContaining('wait 30 days')
        );
      });

      it('shows improvement tip to complete Pre-Action when neither generated nor sent', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
          // No generate_pap_documents flag
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.improvements).toContainEqual(
          expect.stringContaining('Complete the Pre-Action section')
        );
      });

      it('gives full PAP score when letter sent, 30 days elapsed, and response documented', () => {
        const thirtyFiveDaysAgo = new Date();
        thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: true,
          pap_letter_date: thirtyFiveDaysAgo.toISOString().split('T')[0],
          pap_response_received: false, // No response from tenant
        };

        const result = calculateOutcomeConfidence(facts);
        // Full compliance: 17 (letter sent) + 6 (30 days) + 2 (response documented) = 25
        expect(result.breakdown.papCompliance.score).toBe(25);
        expect(result.positiveFactors).toContain('Letter Before Claim sent');
        expect(result.positiveFactors).toContain('30-day response period elapsed');
        expect(result.positiveFactors).toContain('No tenant response recorded');
      });

      it('shows waiting period improvement when letter sent but 30 days not elapsed', () => {
        const fifteenDaysAgo = new Date();
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: true,
          pap_letter_date: fifteenDaysAgo.toISOString().split('T')[0],
        };

        const result = calculateOutcomeConfidence(facts);
        // Should suggest waiting remaining days
        expect(result.improvements).toContainEqual(
          expect.stringContaining('Wait 15 more days')
        );
      });

      it('PAP pack generated score is between no-PAP and fully-sent scores', () => {
        const thirtyFiveDaysAgo = new Date();
        thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

        const noPAPFacts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
        };

        const generatedPAPFacts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
          money_claim: {
            generate_pap_documents: true,
          },
        };

        const fullySentPAPFacts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: true,
          pap_letter_date: thirtyFiveDaysAgo.toISOString().split('T')[0],
          pap_response_received: false,
        };

        const noPAP = calculateOutcomeConfidence(noPAPFacts);
        const generatedPAP = calculateOutcomeConfidence(generatedPAPFacts);
        const fullySentPAP = calculateOutcomeConfidence(fullySentPAPFacts);

        // Order should be: no PAP < generated PAP < fully sent PAP
        expect(generatedPAP.breakdown.papCompliance.score).toBeGreaterThan(
          noPAP.breakdown.papCompliance.score
        );
        expect(fullySentPAP.breakdown.papCompliance.score).toBeGreaterThan(
          generatedPAP.breakdown.papCompliance.score
        );
      });
    });

    describe('overall confidence level', () => {
      it('returns higher score for high-quality cases than minimal cases', () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 35);

        const highQualityCase: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'The tenant John Smith rented 123 High Street, London under an AST dated 1 January 2024. The rent was £1,200 per month payable on the 1st. Despite the tenancy agreement and multiple reminders, rent has not been paid since January 2025.',
            charge_interest: true,
            interest_rate: 8,
            interest_start_date: '2025-01-01',
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1200, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1200, rent_paid: 0 },
            { period_start: '2025-03-01', period_end: '2025-03-31', rent_due: 1200, rent_paid: 0 },
          ],
          rent_amount: 1200,
          rent_frequency: 'monthly',
          uploaded_documents: [
            { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
            { id: '2', name: 'rent-ledger.pdf', type: 'application/pdf' },
            { id: '3', name: 'bank-statement-jan-2025.pdf', type: 'application/pdf' },
          ],
          evidence_reviewed: true,
          letter_before_claim_sent: true,
          pap_letter_date: thirtyDaysAgo.toISOString().split('T')[0],
          pap_response_received: false,
        };

        const minimalCase: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          arrears_items: [],
          uploaded_documents: [],
        };

        const highQuality = calculateOutcomeConfidence(highQualityCase);
        const minimal = calculateOutcomeConfidence(minimalCase);

        // High-quality should score significantly better than minimal
        expect(highQuality.score).toBeGreaterThan(minimal.score);
        expect(highQuality.score - minimal.score).toBeGreaterThanOrEqual(10);
        // Should have more positive factors
        expect(highQuality.positiveFactors.length).toBeGreaterThan(minimal.positiveFactors.length);
      });

      it('returns "weak" for minimal cases', () => {
        const weakCase: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          arrears_items: [],
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(weakCase);
        expect(result.level).toBe('weak');
        expect(result.score).toBeLessThan(45);
      });

      it('returns higher score for case with PAP compliance than without', () => {
        const caseWithPAP: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant owes rent for January to March 2025. They stopped paying after they lost their job.',
            charge_interest: false,
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1000, rent_paid: 0 },
          ],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          letter_before_claim_sent: true,
          pap_letter_date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          uploaded_documents: [
            { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
          ],
        };

        const caseWithoutPAP: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant owes rent for January to March 2025.',
            charge_interest: false,
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
          ],
          letter_before_claim_sent: false,
          uploaded_documents: [],
        };

        const withPAP = calculateOutcomeConfidence(caseWithPAP);
        const withoutPAP = calculateOutcomeConfidence(caseWithoutPAP);

        // Case with PAP compliance should score higher
        expect(withPAP.score).toBeGreaterThan(withoutPAP.score);
        expect(withPAP.breakdown.papCompliance.score).toBeGreaterThan(
          withoutPAP.breakdown.papCompliance.score
        );
      });
    });

    describe('improvements generation', () => {
      it('suggests uploading tenancy agreement when missing', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.improvements).toContain('Upload your tenancy agreement');
      });

      it('suggests PAP letter when not sent', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.improvements.some((i) => i.includes('Letter Before Claim'))).toBe(true);
      });

      it('suggests photos for damage claims without photos', () => {
        const facts: CaseFactsForScoring = {
          claiming_damages: true,
          money_claim: {
            other_amounts_types: ['property_damage'],
          },
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.improvements.some((i) => i.includes('photo'))).toBe(true);
      });

      it('suggests more detail for brief basis of claim', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Owes rent.',
          },
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.improvements.some((i) => i.includes('basis of claim'))).toBe(true);
      });
    });
  });

  describe('getConfidenceLevelLabel', () => {
    it('returns correct labels', () => {
      expect(getConfidenceLevelLabel('strong')).toBe('Strong');
      expect(getConfidenceLevelLabel('moderate')).toBe('Moderate');
      expect(getConfidenceLevelLabel('weak')).toBe('Weak');
    });
  });

  describe('getConfidenceLevelColor', () => {
    it('returns green colors for strong', () => {
      const colors = getConfidenceLevelColor('strong');
      expect(colors.bg).toContain('green');
      expect(colors.text).toContain('green');
    });

    it('returns amber colors for moderate', () => {
      const colors = getConfidenceLevelColor('moderate');
      expect(colors.bg).toContain('amber');
      expect(colors.text).toContain('amber');
    });

    it('returns red colors for weak', () => {
      const colors = getConfidenceLevelColor('weak');
      expect(colors.bg).toContain('red');
      expect(colors.text).toContain('red');
    });
  });

  // ==========================================================================
  // PACK QUALITY SCORE TESTS
  // These test the new Document Pack Quality score shown on the Review page.
  // The pack quality score measures drafting readiness (system-controlled quality),
  // NOT court filing readiness. Evidence uploads are excluded.
  // ==========================================================================
  describe('Pack Quality Score', () => {
    describe('baseline score for cleanly completed wizard', () => {
      /**
       * CRITICAL ACCEPTANCE CRITERIA:
       * A typical case with all wizard fields completed, arrears schedule complete,
       * interest configured, and PAP pack generated (but no evidence uploads)
       * MUST score >= 70 on pack quality.
       */
      it('scores >= 70 for complete wizard with PAP generated but no evidence uploads', () => {
        const typicalCompleteCase: CaseFactsForScoring = {
          // Claim type
          claiming_rent_arrears: true,
          // Complete basis of claim
          money_claim: {
            basis_of_claim: 'The tenant John Smith rented 123 High Street, London under an AST dated 1 January 2024. The rent was £1,200 per month payable on the 1st. Despite the tenancy agreement and multiple reminders, rent has not been paid since January 2025.',
            charge_interest: true,
            interest_rate: 8,
            interest_start_date: '2025-01-01',
            generate_pap_documents: true, // PAP pack generated
          },
          // Complete arrears schedule
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1200, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1200, rent_paid: 0 },
            { period_start: '2025-03-01', period_end: '2025-03-31', rent_due: 1200, rent_paid: 0 },
          ],
          // Tenancy details
          rent_amount: 1200,
          rent_frequency: 'monthly',
          tenancy_start_date: '2024-01-01',
          tenancy_end_date: '2025-06-30',
          // NO evidence uploads
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(typicalCompleteCase);

        // Pack quality score must be >= 70 for this typical complete case
        expect(result.packQualityScore).toBeGreaterThanOrEqual(70);
        expect(result.packQualityLevel).not.toBe('needs_work');

        // Filing readiness improvements should still be shown (PAP not sent, no evidence)
        expect(result.filingReadinessImprovements.length).toBeGreaterThan(0);
        expect(result.filingReadinessImprovements.some(i => i.includes('Letter Before Claim'))).toBe(true);
      });

      it('scores >= 70 even without interest when interest decision is made (opted out)', () => {
        const caseNoInterest: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'The tenant owes rent arrears for the period January 2025 to March 2025. Total £3,600 outstanding at £1,200 per month.',
            charge_interest: false, // Explicitly opted out
            generate_pap_documents: true,
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1200, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1200, rent_paid: 0 },
            { period_start: '2025-03-01', period_end: '2025-03-31', rent_due: 1200, rent_paid: 0 },
          ],
          rent_amount: 1200,
          rent_frequency: 'monthly',
          tenancy_start_date: '2024-01-01',
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(caseNoInterest);
        expect(result.packQualityScore).toBeGreaterThanOrEqual(70);
      });

      it('maintains high pack quality score even when PAP sent + 30 days completed', () => {
        const thirtyFiveDaysAgo = new Date();
        thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

        const caseWithPAPComplete: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant failed to pay rent for January to March 2025 despite reminders.',
            charge_interest: true,
            interest_rate: 8,
            interest_start_date: '2025-01-01',
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1000, rent_paid: 0 },
          ],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          tenancy_start_date: '2024-01-01',
          letter_before_claim_sent: true,
          pap_letter_date: thirtyFiveDaysAgo.toISOString().split('T')[0],
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(caseWithPAPComplete);
        expect(result.packQualityScore).toBeGreaterThanOrEqual(70);

        // Fewer filing readiness improvements when PAP is complete
        const papImprovement = result.filingReadinessImprovements.find(
          i => i.includes('Letter Before Claim') || i.includes('30 days')
        );
        expect(papImprovement).toBeUndefined(); // No PAP improvement needed
      });
    });

    describe('score drops for incomplete wizard', () => {
      it('scores below 70 when key wizard fields are missing', () => {
        const incompleteCase: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          // Missing basis of claim
          money_claim: {
            basis_of_claim: '', // Empty
            // Interest not configured
          },
          // Incomplete arrears
          arrears_items: [
            { period_start: null, period_end: null, rent_due: null, rent_paid: null },
          ],
          // Missing tenancy details
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(incompleteCase);
        expect(result.packQualityScore).toBeLessThan(70);
        expect(result.packQualityLevel).toBe('needs_work');
      });

      it('scores lower without PAP documents generated', () => {
        const caseWithPAP: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant owes rent.',
            generate_pap_documents: true,
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
          ],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          uploaded_documents: [],
        };

        const caseWithoutPAP: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant owes rent.',
            // No generate_pap_documents
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
          ],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          uploaded_documents: [],
        };

        const withPAP = calculateOutcomeConfidence(caseWithPAP);
        const withoutPAP = calculateOutcomeConfidence(caseWithoutPAP);

        expect(withPAP.packQualityScore).toBeGreaterThan(withoutPAP.packQualityScore);
      });
    });

    describe('pack quality vs court readiness scores', () => {
      it('pack quality score is higher than court readiness when no evidence uploaded', () => {
        const caseNoEvidence: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant failed to pay rent for January to March 2025. Total £3,000 owed.',
            charge_interest: true,
            interest_rate: 8,
            interest_start_date: '2025-01-01',
            generate_pap_documents: true,
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1000, rent_paid: 0 },
            { period_start: '2025-03-01', period_end: '2025-03-31', rent_due: 1000, rent_paid: 0 },
          ],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          tenancy_start_date: '2024-01-01',
          uploaded_documents: [], // No evidence!
        };

        const result = calculateOutcomeConfidence(caseNoEvidence);

        // Pack quality should be high (wizard complete)
        // Court readiness should be lower (no evidence)
        expect(result.packQualityScore).toBeGreaterThan(result.score);
      });

      it('pack quality and court readiness converge when evidence is uploaded', () => {
        const thirtyFiveDaysAgo = new Date();
        thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

        const fullCase: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant failed to pay rent for January to March 2025. Total £3,000 owed.',
            charge_interest: true,
            interest_rate: 8,
            interest_start_date: '2025-01-01',
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
            { period_start: '2025-02-01', period_end: '2025-02-28', rent_due: 1000, rent_paid: 0 },
          ],
          rent_amount: 1000,
          rent_frequency: 'monthly',
          tenancy_start_date: '2024-01-01',
          letter_before_claim_sent: true,
          pap_letter_date: thirtyFiveDaysAgo.toISOString().split('T')[0],
          pap_response_received: false,
          evidence_reviewed: true,
          uploaded_documents: [
            { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
            { id: '2', name: 'bank-statement-jan.pdf', type: 'application/pdf' },
          ],
        };

        const result = calculateOutcomeConfidence(fullCase);

        // Both scores should be high
        expect(result.packQualityScore).toBeGreaterThanOrEqual(70);
        expect(result.score).toBeGreaterThanOrEqual(50); // Court readiness also improved
      });
    });

    describe('filing readiness improvements', () => {
      it('includes PAP send reminder when PAP docs generated but not sent', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant owes rent.',
            generate_pap_documents: true,
          },
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.filingReadinessImprovements.some(
          i => i.includes('Letter Before Claim') && i.includes('30 days')
        )).toBe(true);
      });

      it('includes evidence reminder when no tenancy agreement uploaded', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            generate_pap_documents: true,
          },
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.filingReadinessImprovements.some(
          i => i.includes('tenancy agreement')
        )).toBe(true);
      });

      it('includes rent records reminder for arrears claims', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            generate_pap_documents: true,
          },
          uploaded_documents: [],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.filingReadinessImprovements.some(
          i => i.includes('rent records') || i.includes('bank statements')
        )).toBe(true);
      });

      it('filing improvements empty when PAP complete and evidence uploaded', () => {
        const thirtyFiveDaysAgo = new Date();
        thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

        const fullCase: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: true,
          pap_letter_date: thirtyFiveDaysAgo.toISOString().split('T')[0],
          uploaded_documents: [
            { id: '1', name: 'tenancy-agreement.pdf', type: 'application/pdf' },
            { id: '2', name: 'bank-statement.pdf', type: 'application/pdf' },
          ],
        };

        const result = calculateOutcomeConfidence(fullCase);
        expect(result.filingReadinessImprovements.length).toBe(0);
      });
    });

    describe('pack quality breakdown', () => {
      it('provides breakdown with claim clarity, document completeness, and PAP preparedness', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          money_claim: {
            basis_of_claim: 'Tenant owes rent.',
            generate_pap_documents: true,
          },
          arrears_items: [
            { period_start: '2025-01-01', period_end: '2025-01-31', rent_due: 1000, rent_paid: 0 },
          ],
        };

        const result = calculateOutcomeConfidence(facts);

        expect(result.packQualityBreakdown).toBeDefined();
        expect(result.packQualityBreakdown.claimClarity).toBeDefined();
        expect(result.packQualityBreakdown.documentCompleteness).toBeDefined();
        expect(result.packQualityBreakdown.papPreparedness).toBeDefined();

        // Check weights add up
        const totalWeight =
          result.packQualityBreakdown.claimClarity.weight +
          result.packQualityBreakdown.documentCompleteness.weight +
          result.packQualityBreakdown.papPreparedness.weight;
        expect(totalWeight).toBe(1.0);
      });

      it('gives claim clarity 60% weight', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.packQualityBreakdown.claimClarity.weight).toBe(0.6);
        expect(result.packQualityBreakdown.claimClarity.maxScore).toBe(60);
      });

      it('gives document completeness 25% weight', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.packQualityBreakdown.documentCompleteness.weight).toBe(0.25);
        expect(result.packQualityBreakdown.documentCompleteness.maxScore).toBe(25);
      });

      it('gives PAP preparedness 15% weight', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.packQualityBreakdown.papPreparedness.weight).toBe(0.15);
        expect(result.packQualityBreakdown.papPreparedness.maxScore).toBe(15);
      });
    });
  });

  describe('getPackQualityLevelLabel', () => {
    it('returns correct labels', () => {
      expect(getPackQualityLevelLabel('excellent')).toBe('Excellent');
      expect(getPackQualityLevelLabel('good')).toBe('Good');
      expect(getPackQualityLevelLabel('needs_work')).toBe('Needs Work');
    });
  });

  describe('getPackQualityLevelColor', () => {
    it('returns green colors for excellent', () => {
      const colors = getPackQualityLevelColor('excellent');
      expect(colors.bg).toContain('green');
      expect(colors.text).toContain('green');
    });

    it('returns blue colors for good', () => {
      const colors = getPackQualityLevelColor('good');
      expect(colors.bg).toContain('blue');
      expect(colors.text).toContain('blue');
    });

    it('returns amber colors for needs_work', () => {
      const colors = getPackQualityLevelColor('needs_work');
      expect(colors.bg).toContain('amber');
      expect(colors.text).toContain('amber');
    });
  });
});
