/**
 * Money Claim PAP Status Tests
 *
 * Tests the Review page's PAP (Pre-Action Protocol) filing status logic
 * to ensure users get clear messaging about when they can:
 * - Generate documents (always when validation passes)
 * - File in court (only after PAP letter sent + 30 days)
 *
 * These tests verify the getPapFilingStatus function logic matches
 * the two-stage PAP compliance model.
 */

import { describe, expect, it } from 'vitest';

/**
 * Replicate the getPapFilingStatus logic from ReviewSection.tsx for testing
 */
function getPapFilingStatus(facts: any): {
  canGenerateDocs: boolean;
  canFileInCourt: boolean;
  papLetterSent: boolean;
  papWaitingPeriodMet: boolean;
  daysElapsed: number | null;
  statusMessage: string;
  statusType: 'ready_to_file' | 'ready_to_generate' | 'needs_pap_send' | 'needs_pap_wait';
} {
  const moneyClaim = facts?.money_claim || {};
  const letterSent = facts?.letter_before_claim_sent === true;
  const generatePapDocs = moneyClaim.generate_pap_documents === true;

  // Calculate days elapsed since PAP letter was sent
  let daysElapsed: number | null = null;
  if (letterSent && (moneyClaim.lba_date || facts?.pap_letter_date)) {
    const sentDate = new Date(moneyClaim.lba_date || facts?.pap_letter_date);
    const today = new Date();
    daysElapsed = Math.floor((today.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const papWaitingPeriodMet = daysElapsed !== null && daysElapsed >= 30;

  // Case 1: PAP letter already sent AND 30 days have passed → Ready to file
  if (letterSent && papWaitingPeriodMet) {
    return {
      canGenerateDocs: true,
      canFileInCourt: true,
      papLetterSent: true,
      papWaitingPeriodMet: true,
      daysElapsed,
      statusMessage: 'Your PAP compliance is complete. You can proceed to file your claim.',
      statusType: 'ready_to_file',
    };
  }

  // Case 2: PAP letter sent but 30 days haven't passed yet
  if (letterSent && !papWaitingPeriodMet) {
    const daysRemaining = 30 - (daysElapsed || 0);
    return {
      canGenerateDocs: true,
      canFileInCourt: false,
      papLetterSent: true,
      papWaitingPeriodMet: false,
      daysElapsed,
      statusMessage: `Wait ${daysRemaining} more day${daysRemaining === 1 ? '' : 's'} before filing (30-day PAP period).`,
      statusType: 'needs_pap_wait',
    };
  }

  // Case 3: User opted to generate PAP docs (hasn't sent yet)
  if (generatePapDocs) {
    return {
      canGenerateDocs: true,
      canFileInCourt: false,
      papLetterSent: false,
      papWaitingPeriodMet: false,
      daysElapsed: null,
      statusMessage: 'After downloading, send the Letter Before Claim and wait 30 days before filing.',
      statusType: 'needs_pap_send',
    };
  }

  // Case 4: No PAP selection made yet - still allow generation
  return {
    canGenerateDocs: true,
    canFileInCourt: false,
    papLetterSent: false,
    papWaitingPeriodMet: false,
    daysElapsed: null,
    statusMessage: 'Complete the Pre-Action section to ensure PAP compliance.',
    statusType: 'needs_pap_send',
  };
}

describe('Money Claim PAP Filing Status', () => {
  describe('PAP documents generated but not sent', () => {
    it('shows "Ready to generate" with send warning', () => {
      const facts = {
        letter_before_claim_sent: false,
        money_claim: {
          generate_pap_documents: true,
        },
      };

      const status = getPapFilingStatus(facts);

      expect(status.canGenerateDocs).toBe(true);
      expect(status.canFileInCourt).toBe(false);
      expect(status.papLetterSent).toBe(false);
      expect(status.statusType).toBe('needs_pap_send');
      expect(status.statusMessage).toContain('send the Letter Before Claim');
      expect(status.statusMessage).toContain('30 days');
    });
  });

  describe('PAP letter sent but 30 days not elapsed', () => {
    it('shows "Ready to generate" with waiting period warning', () => {
      // Letter sent 15 days ago
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const facts = {
        letter_before_claim_sent: true,
        money_claim: {
          lba_date: fifteenDaysAgo.toISOString().split('T')[0],
        },
      };

      const status = getPapFilingStatus(facts);

      expect(status.canGenerateDocs).toBe(true);
      expect(status.canFileInCourt).toBe(false);
      expect(status.papLetterSent).toBe(true);
      expect(status.papWaitingPeriodMet).toBe(false);
      expect(status.statusType).toBe('needs_pap_wait');
      expect(status.daysElapsed).toBeGreaterThanOrEqual(14);
      expect(status.daysElapsed).toBeLessThanOrEqual(16);
      expect(status.statusMessage).toContain('Wait');
      expect(status.statusMessage).toContain('more day');
    });

    it('calculates correct days remaining', () => {
      // Letter sent 25 days ago → 5 days remaining
      const twentyFiveDaysAgo = new Date();
      twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);

      const facts = {
        letter_before_claim_sent: true,
        money_claim: {
          lba_date: twentyFiveDaysAgo.toISOString().split('T')[0],
        },
      };

      const status = getPapFilingStatus(facts);

      expect(status.daysElapsed).toBeGreaterThanOrEqual(24);
      expect(status.daysElapsed).toBeLessThanOrEqual(26);
      // Should show approximately 5 days remaining
      expect(status.statusMessage).toMatch(/Wait \d+ more days? before filing/);
    });
  });

  describe('PAP letter sent + 30 days elapsed', () => {
    it('shows "Ready to file"', () => {
      // Letter sent 35 days ago
      const thirtyFiveDaysAgo = new Date();
      thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

      const facts = {
        letter_before_claim_sent: true,
        money_claim: {
          lba_date: thirtyFiveDaysAgo.toISOString().split('T')[0],
        },
      };

      const status = getPapFilingStatus(facts);

      expect(status.canGenerateDocs).toBe(true);
      expect(status.canFileInCourt).toBe(true);
      expect(status.papLetterSent).toBe(true);
      expect(status.papWaitingPeriodMet).toBe(true);
      expect(status.statusType).toBe('ready_to_file');
      expect(status.daysElapsed).toBeGreaterThanOrEqual(34);
      expect(status.statusMessage).toContain('PAP compliance is complete');
      expect(status.statusMessage).toContain('proceed to file');
    });

    it('allows exactly 30 days', () => {
      // Letter sent exactly 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const facts = {
        letter_before_claim_sent: true,
        money_claim: {
          lba_date: thirtyDaysAgo.toISOString().split('T')[0],
        },
      };

      const status = getPapFilingStatus(facts);

      expect(status.canFileInCourt).toBe(true);
      expect(status.papWaitingPeriodMet).toBe(true);
      expect(status.statusType).toBe('ready_to_file');
    });
  });

  describe('No PAP selection made', () => {
    it('defaults to "Ready to generate" with PAP guidance', () => {
      const facts = {};

      const status = getPapFilingStatus(facts);

      expect(status.canGenerateDocs).toBe(true);
      expect(status.canFileInCourt).toBe(false);
      expect(status.statusType).toBe('needs_pap_send');
      expect(status.statusMessage).toContain('Pre-Action section');
    });
  });

  describe('Uses pap_letter_date fallback', () => {
    it('falls back to pap_letter_date if lba_date not set', () => {
      const thirtyFiveDaysAgo = new Date();
      thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

      const facts = {
        letter_before_claim_sent: true,
        pap_letter_date: thirtyFiveDaysAgo.toISOString().split('T')[0],
        money_claim: {},
      };

      const status = getPapFilingStatus(facts);

      expect(status.canFileInCourt).toBe(true);
      expect(status.papWaitingPeriodMet).toBe(true);
    });
  });
});

describe('Filing Guide Template Assertions', () => {
  it('filing guide template includes MCOL numbers-only guidance', async () => {
    // Read the template file and verify it contains the key guidance text
    const fs = await import('fs/promises');
    const template = await fs.readFile(
      'config/jurisdictions/uk/england/templates/money_claims/filing_guide.hbs',
      'utf-8'
    );

    // Should include numbers-only guidance
    expect(template).toContain('numbers only');
    expect(template).toContain('no £ symbol');

    // Should include "Particulars of Claim attached" in brief details
    expect(template).toContain('Particulars of Claim attached');

    // Should NOT reference "Evidence Index" (removed from pack)
    expect(template).not.toContain('Evidence Index');
  });

  it('filing guide template shows plain number for claim amount', async () => {
    const fs = await import('fs/promises');
    const template = await fs.readFile(
      'config/jurisdictions/uk/england/templates/money_claims/filing_guide.hbs',
      'utf-8'
    );

    // Should have the plain number format for MCOL entry
    expect(template).toContain('{{total_claim_amount}}');
    // Should have guidance about entering the number
    expect(template).toContain('enter this number');
  });
});

describe('Terminology Consistency', () => {
  it('money-claim-faqs uses "Letter Before Claim" not "Letter Before Action"', async () => {
    const fs = await import('fs/promises');
    const faqContent = await fs.readFile(
      'src/data/faqs/money-claim-faqs.ts',
      'utf-8'
    );

    // Should use "Letter Before Claim"
    expect(faqContent).toContain('Letter Before Claim');
    // Should NOT use "Letter Before Action"
    expect(faqContent).not.toContain('Letter Before Action');
  });

  it('ReviewSection uses "Letter Before Claim" in Ask Heaven banner', async () => {
    const fs = await import('fs/promises');
    const reviewContent = await fs.readFile(
      'src/components/wizard/money-claim/ReviewSection.tsx',
      'utf-8'
    );

    // The Ask Heaven banner should mention "Letter Before Claim"
    expect(reviewContent).toContain('Letter Before Claim will be professionally');
    // Should NOT contain "Letter Before Action" in the banner text
    expect(reviewContent).not.toMatch(/Letter Before Action will be professionally/);
  });
});
