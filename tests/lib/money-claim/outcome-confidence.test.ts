/**
 * Outcome Confidence Indicator Tests
 *
 * Tests the rules-based scoring model for case strength assessment.
 */

import {
  calculateOutcomeConfidence,
  getConfidenceLevelLabel,
  getConfidenceLevelColor,
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

      it('gives lower PAP score when letter sent but less than 30 days', () => {
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: true,
          pap_letter_date: tenDaysAgo.toISOString().split('T')[0],
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.breakdown.papCompliance.score).toBeLessThan(20);
      });

      it('gives low PAP score when no letter sent', () => {
        const facts: CaseFactsForScoring = {
          claiming_rent_arrears: true,
          letter_before_claim_sent: false,
        };

        const result = calculateOutcomeConfidence(facts);
        expect(result.breakdown.papCompliance.score).toBeLessThan(5);
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
});
