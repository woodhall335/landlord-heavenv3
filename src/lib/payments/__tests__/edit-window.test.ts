/**
 * Tests for edit-window helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  EDIT_WINDOW_DAYS,
  getEditWindowEndsAt,
  isEditWindowOpen,
  getEditWindowStatus,
  formatEditWindowEndDate,
} from '../edit-window';

describe('edit-window', () => {
  describe('EDIT_WINDOW_DAYS', () => {
    it('is 30 days', () => {
      expect(EDIT_WINDOW_DAYS).toBe(30);
    });
  });

  describe('getEditWindowEndsAt', () => {
    it('returns date 30 days after payment', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const endsAt = getEditWindowEndsAt(paidAt);

      expect(endsAt.toISOString()).toBe('2024-02-14T12:00:00.000Z');
    });

    it('handles string input', () => {
      const paidAt = '2024-03-01T10:30:00Z';
      const endsAt = getEditWindowEndsAt(paidAt);

      expect(endsAt.toISOString()).toBe('2024-03-31T10:30:00.000Z');
    });

    it('handles month boundary correctly', () => {
      const paidAt = new Date('2024-01-31T12:00:00Z');
      const endsAt = getEditWindowEndsAt(paidAt);

      // Jan 31 + 30 days = March 1 (2024 is a leap year)
      expect(endsAt.toISOString()).toBe('2024-03-01T12:00:00.000Z');
    });

    it('handles year boundary correctly', () => {
      const paidAt = new Date('2024-12-15T12:00:00Z');
      const endsAt = getEditWindowEndsAt(paidAt);

      expect(endsAt.toISOString()).toBe('2025-01-14T12:00:00.000Z');
    });
  });

  describe('isEditWindowOpen', () => {
    it('returns true when within 30 days', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-02-01T12:00:00Z'); // 17 days later

      expect(isEditWindowOpen(paidAt, now)).toBe(true);
    });

    it('returns true on day 29', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-02-13T12:00:00Z'); // 29 days later

      expect(isEditWindowOpen(paidAt, now)).toBe(true);
    });

    it('returns true just before window closes', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-02-14T11:59:59Z'); // 1 second before

      expect(isEditWindowOpen(paidAt, now)).toBe(true);
    });

    it('returns false exactly at window close', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-02-14T12:00:00Z'); // exactly 30 days

      expect(isEditWindowOpen(paidAt, now)).toBe(false);
    });

    it('returns false after 30 days', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-03-01T12:00:00Z'); // well after

      expect(isEditWindowOpen(paidAt, now)).toBe(false);
    });

    it('returns false on day 31', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-02-15T12:00:00Z'); // 31 days later

      expect(isEditWindowOpen(paidAt, now)).toBe(false);
    });

    it('uses current time when now is not provided', () => {
      const futurePayment = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow
      // A payment that will be made tomorrow should have an open window today
      // Actually, this doesn't make sense - if payment is in future, window should be open
      // Let's test with a recent payment
      const recentPayment = new Date(Date.now() - 1000); // 1 second ago
      expect(isEditWindowOpen(recentPayment)).toBe(true);
    });
  });

  describe('getEditWindowStatus', () => {
    it('returns NOT_PAID when paidAt is null', () => {
      const status = getEditWindowStatus(null);

      expect(status.isPaid).toBe(false);
      expect(status.isOpen).toBe(false);
      expect(status.endsAt).toBeNull();
      expect(status.reason).toBe('NOT_PAID');
    });

    it('returns open window when within 30 days', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-02-01T12:00:00Z');

      const status = getEditWindowStatus(paidAt, now);

      expect(status.isPaid).toBe(true);
      expect(status.isOpen).toBe(true);
      expect(status.endsAt).toBe('2024-02-14T12:00:00.000Z');
      expect(status.reason).toBeNull();
    });

    it('returns expired window when after 30 days', () => {
      const paidAt = new Date('2024-01-15T12:00:00Z');
      const now = new Date('2024-03-01T12:00:00Z');

      const status = getEditWindowStatus(paidAt, now);

      expect(status.isPaid).toBe(true);
      expect(status.isOpen).toBe(false);
      expect(status.endsAt).toBe('2024-02-14T12:00:00.000Z');
      expect(status.reason).toBe('EXPIRED');
    });

    it('handles string input for paidAt', () => {
      const paidAt = '2024-06-10T15:30:00Z';
      const now = new Date('2024-06-20T12:00:00Z');

      const status = getEditWindowStatus(paidAt, now);

      expect(status.isPaid).toBe(true);
      expect(status.isOpen).toBe(true);
      expect(status.endsAt).toBe('2024-07-10T15:30:00.000Z');
    });
  });

  describe('formatEditWindowEndDate', () => {
    it('formats date in UK format', () => {
      const date = new Date('2024-02-14T12:00:00Z');
      const formatted = formatEditWindowEndDate(date);

      expect(formatted).toBe('14 Feb 2024');
    });

    it('handles string input', () => {
      const dateStr = '2024-12-25T00:00:00Z';
      const formatted = formatEditWindowEndDate(dateStr);

      expect(formatted).toBe('25 Dec 2024');
    });

    it('handles single digit day', () => {
      const date = new Date('2024-01-05T12:00:00Z');
      const formatted = formatEditWindowEndDate(date);

      expect(formatted).toBe('5 Jan 2024');
    });
  });

  describe('boundary conditions', () => {
    it('exactly at 30 days is expired', () => {
      const paidAt = new Date('2024-01-01T00:00:00Z');
      const exactlyAt30Days = new Date('2024-01-31T00:00:00Z');

      expect(isEditWindowOpen(paidAt, exactlyAt30Days)).toBe(false);

      const status = getEditWindowStatus(paidAt, exactlyAt30Days);
      expect(status.isOpen).toBe(false);
      expect(status.reason).toBe('EXPIRED');
    });

    it('1 millisecond before 30 days is still open', () => {
      const paidAt = new Date('2024-01-01T00:00:00.000Z');
      const justBefore30Days = new Date('2024-01-30T23:59:59.999Z');

      expect(isEditWindowOpen(paidAt, justBefore30Days)).toBe(true);

      const status = getEditWindowStatus(paidAt, justBefore30Days);
      expect(status.isOpen).toBe(true);
      expect(status.reason).toBeNull();
    });
  });
});
