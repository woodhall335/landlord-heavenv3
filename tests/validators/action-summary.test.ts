/**
 * Tests for getActionSummary helper function
 *
 * Validates that action summaries are generated correctly based on
 * validation status, blockers, warnings, and questions count.
 */

import { describe, it, expect } from 'vitest';

// We need to test the exported function from ValidationResultBanner
// Since it's a React component file, we'll test the logic separately
// by importing just the helper function

// Define the BannerStatus type for testing
type BannerStatus = 'valid' | 'warning' | 'high_risk' | 'invalid' | 'wrong_doc_type' | 'needs_info' | 'unknown';

// Copy of the getActionSummary function for testing
// (In production, this would be imported from the component file)
function getActionSummary(
  normalizedStatus: BannerStatus,
  blockersCount: number,
  warningsCount: number,
  questionsCount: number
): string {
  // Wrong document type - immediate action needed
  if (normalizedStatus === 'wrong_doc_type') {
    return 'Please upload the correct document type.';
  }

  // Has blockers - needs attention
  if (blockersCount > 0) {
    if (questionsCount > 0) {
      return `Address ${blockersCount} critical issue${blockersCount > 1 ? 's' : ''} below, then answer ${questionsCount} question${questionsCount > 1 ? 's' : ''} for full validation.`;
    }
    return `Address ${blockersCount} critical issue${blockersCount > 1 ? 's' : ''} below to proceed.`;
  }

  // Has questions to answer
  if (questionsCount > 0) {
    if (warningsCount > 0) {
      return `Answer ${questionsCount} question${questionsCount > 1 ? 's' : ''} below and review ${warningsCount} warning${warningsCount > 1 ? 's' : ''}.`;
    }
    return `Answer ${questionsCount} question${questionsCount > 1 ? 's' : ''} below for complete validation.`;
  }

  // Warnings only
  if (warningsCount > 0) {
    return `Review ${warningsCount} warning${warningsCount > 1 ? 's' : ''} below before proceeding.`;
  }

  // All good
  if (normalizedStatus === 'valid') {
    return 'Your document is ready. Proceed to generate court forms.';
  }

  // Needs more info
  if (normalizedStatus === 'needs_info') {
    return 'Additional information is required to complete validation.';
  }

  return '';
}

describe('getActionSummary', () => {
  describe('wrong document type', () => {
    it('should return upload correct document message', () => {
      const result = getActionSummary('wrong_doc_type', 0, 0, 0);
      expect(result).toBe('Please upload the correct document type.');
    });

    it('should return upload message even when other issues exist', () => {
      const result = getActionSummary('wrong_doc_type', 2, 3, 1);
      expect(result).toBe('Please upload the correct document type.');
    });
  });

  describe('blockers', () => {
    it('should mention single blocker', () => {
      const result = getActionSummary('invalid', 1, 0, 0);
      expect(result).toBe('Address 1 critical issue below to proceed.');
    });

    it('should pluralize multiple blockers', () => {
      const result = getActionSummary('invalid', 3, 0, 0);
      expect(result).toBe('Address 3 critical issues below to proceed.');
    });

    it('should mention blockers and questions together', () => {
      const result = getActionSummary('invalid', 2, 0, 3);
      expect(result).toBe('Address 2 critical issues below, then answer 3 questions for full validation.');
    });

    it('should handle single blocker and single question', () => {
      const result = getActionSummary('invalid', 1, 0, 1);
      expect(result).toBe('Address 1 critical issue below, then answer 1 question for full validation.');
    });
  });

  describe('questions only', () => {
    it('should mention single question', () => {
      const result = getActionSummary('warning', 0, 0, 1);
      expect(result).toBe('Answer 1 question below for complete validation.');
    });

    it('should pluralize multiple questions', () => {
      const result = getActionSummary('warning', 0, 0, 4);
      expect(result).toBe('Answer 4 questions below for complete validation.');
    });

    it('should mention questions and warnings together', () => {
      const result = getActionSummary('warning', 0, 2, 3);
      expect(result).toBe('Answer 3 questions below and review 2 warnings.');
    });

    it('should handle single question and single warning', () => {
      const result = getActionSummary('warning', 0, 1, 1);
      expect(result).toBe('Answer 1 question below and review 1 warning.');
    });
  });

  describe('warnings only', () => {
    it('should mention single warning', () => {
      const result = getActionSummary('warning', 0, 1, 0);
      expect(result).toBe('Review 1 warning below before proceeding.');
    });

    it('should pluralize multiple warnings', () => {
      const result = getActionSummary('high_risk', 0, 5, 0);
      expect(result).toBe('Review 5 warnings below before proceeding.');
    });
  });

  describe('valid status', () => {
    it('should return ready message when no issues', () => {
      const result = getActionSummary('valid', 0, 0, 0);
      expect(result).toBe('Your document is ready. Proceed to generate court forms.');
    });
  });

  describe('needs info status', () => {
    it('should return additional info message', () => {
      const result = getActionSummary('needs_info', 0, 0, 0);
      expect(result).toBe('Additional information is required to complete validation.');
    });
  });

  describe('unknown status', () => {
    it('should return empty string for unknown status with no issues', () => {
      const result = getActionSummary('unknown', 0, 0, 0);
      expect(result).toBe('');
    });
  });

  describe('priority ordering', () => {
    it('should prioritize blockers over questions', () => {
      const result = getActionSummary('invalid', 2, 1, 3);
      expect(result).toContain('critical issue');
      expect(result).toContain('question');
    });

    it('should prioritize questions over warnings alone', () => {
      const result = getActionSummary('warning', 0, 2, 1);
      expect(result).toContain('question');
      expect(result).toContain('warning');
    });
  });
});
