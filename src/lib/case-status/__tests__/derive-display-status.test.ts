/**
 * Tests for derive-display-status helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  deriveDisplayStatus,
  getDisplayStatusBadgeVariant,
  getDisplayStatusLabel,
  type DeriveStatusInput,
} from '../derive-display-status';

describe('deriveDisplayStatus', () => {
  describe('archived status', () => {
    it('returns archived for archived cases regardless of other status', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'archived',
        paymentStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        hasFinalDocuments: true,
      });

      expect(result.status).toBe('archived');
      expect(result.label).toBe('Archived');
      expect(result.badgeVariant).toBe('neutral');
    });
  });

  describe('documents_ready status', () => {
    it('returns documents_ready when paid + has documents', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        paymentStatus: 'paid',
        hasFinalDocuments: true,
      });

      expect(result.status).toBe('documents_ready');
      expect(result.label).toBe('Documents ready');
      expect(result.badgeVariant).toBe('success');
    });

    it('prioritizes documents_ready over stale in_progress case status', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress', // Stale status
        wizardProgress: 50,
        paymentStatus: 'paid',
        hasFinalDocuments: true,
      });

      expect(result.status).toBe('documents_ready');
      expect(result.label).toBe('Documents ready');
    });

    it('returns documents_ready regardless of fulfillment_status when has documents', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        paymentStatus: 'paid',
        fulfillmentStatus: 'processing', // Not fulfilled, but has documents
        hasFinalDocuments: true,
      });

      expect(result.status).toBe('documents_ready');
      expect(result.label).toBe('Documents ready');
    });
  });

  describe('paid_in_progress status', () => {
    it('returns paid_in_progress when paid but no documents yet', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        paymentStatus: 'paid',
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('paid_in_progress');
      expect(result.label).toBe('In progress');
      expect(result.badgeVariant).toBe('warning');
    });

    it('returns paid_in_progress when paid + fulfilled but no docs yet', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        paymentStatus: 'paid',
        fulfillmentStatus: 'fulfilled',
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('paid_in_progress');
      expect(result.label).toBe('In progress');
    });

    it('returns paid_in_progress when paid + processing', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        paymentStatus: 'paid',
        fulfillmentStatus: 'processing',
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('paid_in_progress');
    });
  });

  describe('ready_to_purchase status', () => {
    it('returns ready_to_purchase when wizard complete but not paid', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        wizardProgress: 100,
        paymentStatus: null,
        fulfillmentStatus: null,
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('ready_to_purchase');
      expect(result.label).toBe('Ready to purchase');
      expect(result.badgeVariant).toBe('warning');
    });

    it('returns ready_to_purchase when wizard_completed_at is set', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        wizardProgress: 85, // Progress might not be 100 yet
        wizardCompletedAt: '2024-01-15T12:00:00Z',
        paymentStatus: null,
        fulfillmentStatus: null,
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('ready_to_purchase');
    });

    it('does not return ready_to_purchase if already paid', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        wizardProgress: 100,
        paymentStatus: 'paid',
        fulfillmentStatus: 'processing',
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('paid_in_progress');
    });
  });

  describe('in_progress status', () => {
    it('returns in_progress for active cases', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        wizardProgress: 50,
        paymentStatus: null,
        fulfillmentStatus: null,
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('in_progress');
      expect(result.label).toBe('In progress');
      expect(result.badgeVariant).toBe('warning');
    });

    it('returns in_progress when wizard started but not complete', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'in_progress',
        wizardProgress: 75,
        wizardCompletedAt: null,
        paymentStatus: null,
        fulfillmentStatus: null,
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('in_progress');
    });
  });

  describe('draft status', () => {
    it('returns draft for new cases with no progress', () => {
      const result = deriveDisplayStatus({
        caseStatus: null,
        wizardProgress: 0,
        paymentStatus: null,
        fulfillmentStatus: null,
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('draft');
      expect(result.label).toBe('Draft');
      expect(result.badgeVariant).toBe('neutral');
    });

    it('returns draft for cases with null status and no activity', () => {
      const result = deriveDisplayStatus({
        caseStatus: null,
        wizardProgress: null,
        paymentStatus: null,
        fulfillmentStatus: null,
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('draft');
    });
  });

  describe('completed status fallback', () => {
    it('respects completed case status when no order info', () => {
      const result = deriveDisplayStatus({
        caseStatus: 'completed',
        wizardProgress: 100,
        paymentStatus: null,
        fulfillmentStatus: null,
        hasFinalDocuments: false,
      });

      expect(result.status).toBe('completed');
      expect(result.label).toBe('Completed');
      expect(result.badgeVariant).toBe('success');
    });
  });
});

describe('getDisplayStatusBadgeVariant', () => {
  it('returns success for documents_ready', () => {
    expect(getDisplayStatusBadgeVariant('documents_ready')).toBe('success');
  });

  it('returns success for completed', () => {
    expect(getDisplayStatusBadgeVariant('completed')).toBe('success');
  });

  it('returns warning for generating_documents', () => {
    expect(getDisplayStatusBadgeVariant('generating_documents')).toBe('warning');
  });

  it('returns warning for paid_in_progress', () => {
    expect(getDisplayStatusBadgeVariant('paid_in_progress')).toBe('warning');
  });

  it('returns warning for in_progress', () => {
    expect(getDisplayStatusBadgeVariant('in_progress')).toBe('warning');
  });

  it('returns warning for ready_to_purchase', () => {
    expect(getDisplayStatusBadgeVariant('ready_to_purchase')).toBe('warning');
  });

  it('returns neutral for archived', () => {
    expect(getDisplayStatusBadgeVariant('archived')).toBe('neutral');
  });

  it('returns neutral for draft', () => {
    expect(getDisplayStatusBadgeVariant('draft')).toBe('neutral');
  });
});

describe('getDisplayStatusLabel', () => {
  it('returns correct labels for all status types', () => {
    expect(getDisplayStatusLabel('documents_ready')).toBe('Documents ready');
    expect(getDisplayStatusLabel('generating_documents')).toBe('Generating documents');
    expect(getDisplayStatusLabel('paid_in_progress')).toBe('In progress');
    expect(getDisplayStatusLabel('ready_to_purchase')).toBe('Ready to purchase');
    expect(getDisplayStatusLabel('completed')).toBe('Completed');
    expect(getDisplayStatusLabel('in_progress')).toBe('In progress');
    expect(getDisplayStatusLabel('archived')).toBe('Archived');
    expect(getDisplayStatusLabel('draft')).toBe('Draft');
  });
});

describe('status priority order', () => {
  it('documents_ready takes priority when paid and has documents', () => {
    // Even with in_progress case status, paid+has_documents should show documents_ready
    const result = deriveDisplayStatus({
      caseStatus: 'in_progress',
      wizardProgress: 100,
      wizardCompletedAt: '2024-01-15T12:00:00Z',
      paymentStatus: 'paid',
      hasFinalDocuments: true,
    });

    expect(result.status).toBe('documents_ready');
  });

  it('archived takes absolute priority', () => {
    const result = deriveDisplayStatus({
      caseStatus: 'archived',
      wizardProgress: 100,
      wizardCompletedAt: '2024-01-15T12:00:00Z',
      paymentStatus: 'paid',
      hasFinalDocuments: true,
    });

    expect(result.status).toBe('archived');
  });

  it('paid_in_progress shown when paid but no documents yet', () => {
    const result = deriveDisplayStatus({
      caseStatus: 'in_progress',
      wizardProgress: 100,
      wizardCompletedAt: '2024-01-15T12:00:00Z',
      paymentStatus: 'paid',
      hasFinalDocuments: false,
    });

    expect(result.status).toBe('paid_in_progress');
    expect(result.label).toBe('In progress');
  });
});
