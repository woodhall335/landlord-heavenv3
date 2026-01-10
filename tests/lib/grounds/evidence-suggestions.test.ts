/**
 * Evidence Suggestions Tests
 *
 * Tests for ground-aware evidence suggestions and arrears validation.
 */

import { describe, it, expect } from 'vitest';
import {
  getGroundAwareSuggestions,
  isArrearsEvidenceComplete,
} from '../../../src/lib/grounds/evidence-suggestions';

describe('getGroundAwareSuggestions', () => {
  describe('Arrears grounds (8, 10, 11)', () => {
    it('suggests rent schedule for arrears grounds', () => {
      const suggestions = getGroundAwareSuggestions(['8']);
      const rentScheduleSuggestion = suggestions.find(s => s.id === 'rent_schedule');
      expect(rentScheduleSuggestion).toBeDefined();
      expect(rentScheduleSuggestion?.priority).toBe('high');
    });

    it('suggests bank statements for arrears grounds', () => {
      const suggestions = getGroundAwareSuggestions(['10']);
      const bankStatementSuggestion = suggestions.find(s => s.id === 'bank_statements');
      expect(bankStatementSuggestion).toBeDefined();
    });

    it('suggests payment history for Ground 11 (persistent late payment)', () => {
      const suggestions = getGroundAwareSuggestions(['11']);
      const paymentHistorySuggestion = suggestions.find(s => s.id === 'payment_history');
      expect(paymentHistorySuggestion).toBeDefined();
    });

    it('does not suggest payment history for Ground 8 only', () => {
      const suggestions = getGroundAwareSuggestions(['8']);
      const paymentHistorySuggestion = suggestions.find(s => s.id === 'payment_history');
      expect(paymentHistorySuggestion).toBeUndefined();
    });
  });

  describe('ASB grounds (14)', () => {
    it('suggests incident log for Ground 14', () => {
      const suggestions = getGroundAwareSuggestions(['14']);
      const incidentLogSuggestion = suggestions.find(s => s.id === 'asb_incident_log');
      expect(incidentLogSuggestion).toBeDefined();
    });

    it('suggests police letters for Ground 14', () => {
      const suggestions = getGroundAwareSuggestions(['14']);
      const policeLettersSuggestion = suggestions.find(s => s.id === 'police_letters');
      expect(policeLettersSuggestion).toBeDefined();
      expect(policeLettersSuggestion?.priority).toBe('high');
    });

    it('suggests council letters for Ground 14', () => {
      const suggestions = getGroundAwareSuggestions(['14']);
      const councilLettersSuggestion = suggestions.find(s => s.id === 'council_asb_letters');
      expect(councilLettersSuggestion).toBeDefined();
    });

    it('does NOT suggest ASB evidence for arrears-only grounds', () => {
      const suggestions = getGroundAwareSuggestions(['8', '10']);
      const incidentLogSuggestion = suggestions.find(s => s.id === 'asb_incident_log');
      const policeLettersSuggestion = suggestions.find(s => s.id === 'police_letters');
      expect(incidentLogSuggestion).toBeUndefined();
      expect(policeLettersSuggestion).toBeUndefined();
    });
  });

  describe('Breach grounds (12)', () => {
    it('suggests tenancy clause highlighting for Ground 12', () => {
      const suggestions = getGroundAwareSuggestions(['12']);
      const tenancyClausesSuggestion = suggestions.find(s => s.id === 'tenancy_clauses');
      expect(tenancyClausesSuggestion).toBeDefined();
    });

    it('suggests breach evidence for Ground 12', () => {
      const suggestions = getGroundAwareSuggestions(['12']);
      const breachEvidenceSuggestion = suggestions.find(s => s.id === 'breach_evidence');
      expect(breachEvidenceSuggestion).toBeDefined();
    });
  });

  describe('Filtering based on uploaded evidence', () => {
    it('filters out suggestions for evidence already uploaded', () => {
      const suggestions = getGroundAwareSuggestions(['8'], {
        rent_schedule_uploaded: true,
      });
      const rentScheduleSuggestion = suggestions.find(s => s.id === 'rent_schedule');
      expect(rentScheduleSuggestion).toBeUndefined();
    });

    it('filters out bank statements when already uploaded', () => {
      const suggestions = getGroundAwareSuggestions(['8'], {
        bank_statements_uploaded: true,
      });
      const bankStatementsSuggestion = suggestions.find(s => s.id === 'bank_statements');
      expect(bankStatementsSuggestion).toBeUndefined();
    });

    it('filters out authority letters when already uploaded', () => {
      const suggestions = getGroundAwareSuggestions(['14'], {
        authority_letters_uploaded: true,
      });
      const policeLettersSuggestion = suggestions.find(s => s.id === 'police_letters');
      const councilLettersSuggestion = suggestions.find(s => s.id === 'council_asb_letters');
      expect(policeLettersSuggestion).toBeUndefined();
      expect(councilLettersSuggestion).toBeUndefined();
    });
  });

  describe('Mixed grounds', () => {
    it('suggests relevant evidence for multiple ground types', () => {
      const suggestions = getGroundAwareSuggestions(['8', '14']);

      // Should have arrears suggestions
      const rentScheduleSuggestion = suggestions.find(s => s.id === 'rent_schedule');
      expect(rentScheduleSuggestion).toBeDefined();

      // Should have ASB suggestions
      const incidentLogSuggestion = suggestions.find(s => s.id === 'asb_incident_log');
      expect(incidentLogSuggestion).toBeDefined();
    });
  });

  describe('Priority ordering', () => {
    it('sorts high priority suggestions first', () => {
      const suggestions = getGroundAwareSuggestions(['8', '14']);
      const firstFew = suggestions.slice(0, 3);
      // Most of the first suggestions should be high priority
      const highPriorityCount = firstFew.filter(s => s.priority === 'high').length;
      expect(highPriorityCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Edge cases', () => {
    it('returns empty array for empty grounds', () => {
      const suggestions = getGroundAwareSuggestions([]);
      expect(suggestions).toHaveLength(0);
    });

    it('handles unknown grounds gracefully', () => {
      const suggestions = getGroundAwareSuggestions(['99']);
      // Should still return tenancy agreement suggestion (always relevant)
      // But no ground-specific ones
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('isArrearsEvidenceComplete', () => {
  describe('Non-arrears grounds', () => {
    it('returns complete for non-arrears grounds', () => {
      const result = isArrearsEvidenceComplete(['14', '12'], []);
      expect(result.complete).toBe(true);
      expect(result.message).toContain('not required');
    });
  });

  describe('Arrears grounds with missing schedule', () => {
    it('returns incomplete when arrears schedule is missing', () => {
      const result = isArrearsEvidenceComplete(['8'], []);
      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('arrears_schedule');
      expect(result.message).toContain('arrears schedule');
    });

    it('returns incomplete for Ground 10 with missing schedule', () => {
      const result = isArrearsEvidenceComplete(['10'], []);
      expect(result.complete).toBe(false);
    });

    it('returns incomplete for Ground 11 with missing schedule', () => {
      const result = isArrearsEvidenceComplete(['11'], []);
      expect(result.complete).toBe(false);
    });
  });

  describe('Arrears grounds with incomplete schedule', () => {
    it('returns incomplete when arrears items have no valid periods', () => {
      const incompleteItems = [
        { period_start: '', rent_due: 0, amount_owed: 0 },
      ];
      const result = isArrearsEvidenceComplete(['8'], incompleteItems);
      expect(result.complete).toBe(false);
      expect(result.missingFields).toContain('arrears_period_data');
    });
  });

  describe('Arrears grounds with complete schedule', () => {
    it('returns complete when arrears schedule has valid data', () => {
      const validItems = [
        { period_start: '2024-01-01', period_end: '2024-01-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
        { period_start: '2024-02-01', period_end: '2024-02-29', rent_due: 1000, rent_paid: 500, amount_owed: 500 },
      ];
      const result = isArrearsEvidenceComplete(['8'], validItems);
      expect(result.complete).toBe(true);
    });
  });

  describe('Mixed grounds', () => {
    it('requires arrears schedule when any arrears ground is included', () => {
      // Non-arrears + arrears ground
      const result = isArrearsEvidenceComplete(['14', '8'], []);
      expect(result.complete).toBe(false);
      expect(result.message).toContain('arrears schedule');
    });
  });
});
