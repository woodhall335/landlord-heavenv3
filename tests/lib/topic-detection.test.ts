/**
 * Topic Detection Tests
 *
 * Tests the Ask Heaven topic detection and CTA mapping.
 */

import { describe, expect, it } from 'vitest';
import {
  detectTopics,
  getTopicCTAs,
  hasActionableTopics,
  getPrimaryTopic,
} from '@/lib/ask-heaven/topic-detection';

describe('Topic Detection', () => {
  describe('detectTopics', () => {
    it('detects eviction topics', () => {
      expect(detectTopics('How do I evict a tenant?')).toContain('eviction');
      expect(detectTopics('I want to serve a Section 21 notice')).toContain('eviction');
      expect(detectTopics('Can I use S8 for rent arrears?')).toContain('eviction');
      expect(detectTopics('possession proceedings')).toContain('eviction');
      expect(detectTopics('notice to leave in Scotland')).toContain('eviction');
    });

    it('detects arrears topics', () => {
      expect(detectTopics('My tenant owes me rent arrears')).toContain('arrears');
      expect(detectTopics('How do I file a money claim?')).toContain('arrears');
      expect(detectTopics('recover money from tenant')).toContain('arrears');
      expect(detectTopics('letter before action')).toContain('arrears');
      expect(detectTopics('LBA for unpaid rent')).toContain('arrears');
    });

    it('detects tenancy topics', () => {
      expect(detectTopics('I need a tenancy agreement')).toContain('tenancy');
      expect(detectTopics('AST for new tenant')).toContain('tenancy');
      expect(detectTopics('occupation contract in Wales')).toContain('tenancy');
      expect(detectTopics('PRT in Scotland')).toContain('tenancy');
    });

    it('detects deposit topics', () => {
      expect(detectTopics('deposit protection requirements')).toContain('deposit');
      expect(detectTopics('TDS or DPS?')).toContain('deposit');
      expect(detectTopics('prescribed information for deposit')).toContain('deposit');
      expect(detectTopics('mydeposits scheme')).toContain('deposit');
    });

    it('detects multiple topics', () => {
      const topics = detectTopics(
        'I want to evict my tenant for rent arrears and need a tenancy agreement for my next tenant'
      );
      expect(topics).toContain('eviction');
      expect(topics).toContain('arrears');
      expect(topics).toContain('tenancy');
    });

    it('returns empty array for unrelated text', () => {
      expect(detectTopics('Hello, how are you today?')).toEqual([]);
      expect(detectTopics('What is the weather like?')).toEqual([]);
    });

    it('is case insensitive', () => {
      expect(detectTopics('SECTION 21')).toContain('eviction');
      expect(detectTopics('Rent Arrears')).toContain('arrears');
      expect(detectTopics('Tenancy Agreement')).toContain('tenancy');
    });
  });

  describe('getTopicCTAs', () => {
    it('returns eviction CTAs for eviction topic', () => {
      const ctas = getTopicCTAs(['eviction'], 'england');
      expect(ctas.length).toBeGreaterThan(0);
      expect(ctas.some((c) => c.label.includes('Notice'))).toBe(true);
      expect(ctas.some((c) => c.label.includes('Complete Pack'))).toBe(true);
    });

    it('returns arrears CTAs for arrears topic', () => {
      const ctas = getTopicCTAs(['arrears'], 'england');
      expect(ctas.length).toBeGreaterThan(0);
      expect(ctas.some((c) => c.label.includes('Money Claim'))).toBe(true);
    });

    it('returns tenancy CTAs for tenancy topic', () => {
      const ctas = getTopicCTAs(['tenancy'], 'england');
      expect(ctas.length).toBeGreaterThan(0);
      expect(ctas.some((c) => c.label.includes('AST'))).toBe(true);
    });

    it('returns tenancy CTAs for deposit topic', () => {
      const ctas = getTopicCTAs(['deposit'], 'england');
      expect(ctas.length).toBeGreaterThan(0);
      expect(ctas.some((c) => c.label.includes('AST'))).toBe(true);
    });

    it('excludes eviction/arrears CTAs for Northern Ireland', () => {
      const evictionCtas = getTopicCTAs(['eviction'], 'northern-ireland');
      expect(evictionCtas.length).toBe(0);

      const arrearsCtas = getTopicCTAs(['arrears'], 'northern-ireland');
      expect(arrearsCtas.length).toBe(0);
    });

    it('allows tenancy CTAs for Northern Ireland', () => {
      const tenancyCtas = getTopicCTAs(['tenancy'], 'northern-ireland');
      expect(tenancyCtas.length).toBeGreaterThan(0);
      expect(tenancyCtas.some((c) => c.label.includes('AST'))).toBe(true);
    });

    it('deduplicates CTAs when multiple topics match', () => {
      const ctas = getTopicCTAs(['tenancy', 'deposit'], 'england');
      const hrefs = ctas.map((c) => c.href);
      const uniqueHrefs = [...new Set(hrefs)];
      expect(hrefs.length).toBe(uniqueHrefs.length);
    });

    it('returns empty array for empty topics', () => {
      expect(getTopicCTAs([], 'england')).toEqual([]);
    });
  });

  describe('hasActionableTopics', () => {
    it('returns true when topics detected', () => {
      expect(hasActionableTopics(['eviction'])).toBe(true);
      expect(hasActionableTopics(['arrears', 'tenancy'])).toBe(true);
    });

    it('returns false for empty topics', () => {
      expect(hasActionableTopics([])).toBe(false);
    });
  });

  describe('getPrimaryTopic', () => {
    it('returns first topic', () => {
      expect(getPrimaryTopic(['eviction', 'arrears'])).toBe('eviction');
      expect(getPrimaryTopic(['tenancy'])).toBe('tenancy');
    });

    it('returns null for empty topics', () => {
      expect(getPrimaryTopic([])).toBeNull();
    });
  });
});
