/**
 * Jurisdiction Migration Tests
 *
 * Tests the migration from legacy "england-wales" to canonical jurisdictions
 * This is the ONLY test file that should use legacy jurisdiction values
 */

import { describe, expect, it } from 'vitest';
import {
  migrateToCanonicalJurisdiction,
  type CanonicalJurisdiction,
} from '@/lib/types/jurisdiction';

describe('Jurisdiction Migration', () => {
  describe('migrateToCanonicalJurisdiction', () => {
    it('should preserve canonical jurisdiction values', () => {
      expect(migrateToCanonicalJurisdiction('england')).toBe('england');
      expect(migrateToCanonicalJurisdiction('wales')).toBe('wales');
      expect(migrateToCanonicalJurisdiction('scotland')).toBe('scotland');
      expect(migrateToCanonicalJurisdiction('northern-ireland')).toBe('northern-ireland');
    });

    it('should FAIL CLOSED for "england-wales" without property_location (no default to england)', () => {
      // IMPORTANT: Do NOT default to england - this could apply wrong legal framework
      expect(migrateToCanonicalJurisdiction('england-wales')).toBeNull();
    });

    it('should migrate "england-wales" to "wales" if property_location is wales', () => {
      expect(migrateToCanonicalJurisdiction('england-wales', 'wales')).toBe('wales');
    });

    it('should migrate "england-wales" to "england" if property_location is england', () => {
      expect(migrateToCanonicalJurisdiction('england-wales', 'england')).toBe('england');
    });

    it('should handle "england & wales" variant', () => {
      expect(migrateToCanonicalJurisdiction('england & wales')).toBeNull();
      expect(migrateToCanonicalJurisdiction('england & wales', 'wales')).toBe('wales');
    });

    it('should handle "england and wales" variant', () => {
      expect(migrateToCanonicalJurisdiction('england and wales')).toBeNull();
      expect(migrateToCanonicalJurisdiction('england and wales', 'wales')).toBe('wales');
    });

    it('should handle case-insensitive input', () => {
      expect(migrateToCanonicalJurisdiction('ENGLAND-WALES')).toBeNull();
      expect(migrateToCanonicalJurisdiction('England-Wales')).toBeNull();
      expect(migrateToCanonicalJurisdiction('  england-wales  ')).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(migrateToCanonicalJurisdiction(null)).toBeNull();
      expect(migrateToCanonicalJurisdiction(undefined)).toBeNull();
      expect(migrateToCanonicalJurisdiction('')).toBeNull();
    });

    it('should return null for unrecognized values', () => {
      expect(migrateToCanonicalJurisdiction('france')).toBeNull();
      expect(migrateToCanonicalJurisdiction('invalid')).toBeNull();
    });
  });

  describe('Real-world migration scenarios', () => {
    it('should FAIL CLOSED for wizard API payloads with england-wales and no property_location', () => {
      // Simulate old wizard data without property location
      const legacyPayload = {
        product: 'notice_only',
        jurisdiction: 'england-wales',
      };

      const migratedJurisdiction = migrateToCanonicalJurisdiction(legacyPayload.jurisdiction);
      // Must fail closed - cannot assume England
      expect(migratedJurisdiction).toBeNull();
    });

    it('should handle database records with england-wales and property_location', () => {
      // Simulate old case with property location
      const legacyCaseWales = {
        jurisdiction: 'england-wales',
        property_location: 'wales' as const,
      };

      const migratedJurisdiction = migrateToCanonicalJurisdiction(
        legacyCaseWales.jurisdiction,
        legacyCaseWales.property_location
      );
      expect(migratedJurisdiction).toBe('wales');
    });

    it('should FAIL CLOSED for database records without property_location (no default to england)', () => {
      const legacyCase = {
        jurisdiction: 'england-wales',
        // no property_location
      };

      const migratedJurisdiction = migrateToCanonicalJurisdiction(
        legacyCase.jurisdiction
      );
      // Must fail closed - cannot assume England, could be Wales with different legal framework
      expect(migratedJurisdiction).toBeNull();
    });
  });
});
