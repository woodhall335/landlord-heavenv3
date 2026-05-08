import { describe, expect, it } from 'vitest';
import {
  buildEvictionPackGenerationFacts,
  resolveEvictionPackGenerationRoute,
} from '../eviction-pack-facts';

describe('eviction pack generation facts', () => {
  it('injects row-level context required by the pack generators', () => {
    const facts = buildEvictionPackGenerationFacts({
      facts: {
        tenant_full_name: 'Alex Tenant',
        landlord_full_name: 'Sam Landlord',
      },
      caseId: 'case-123',
      jurisdiction: 'england',
      product: 'notice_only',
      selectedRoute: 'section_8',
    });

    expect(facts.case_id).toBe('case-123');
    expect(facts.jurisdiction).toBe('england');
    expect(facts.__meta.jurisdiction).toBe('england');
    expect(facts.selected_notice_route).toBe('section_8');
    expect(facts.eviction_route).toBe('section_8');
    expect(facts.product).toBe('notice_only');
  });

  it('uses case row route fallback when facts do not carry the selected route', () => {
    const facts = buildEvictionPackGenerationFacts({
      facts: {},
      caseId: 'case-123',
      jurisdiction: 'england',
      product: 'complete_pack',
      selectedRoute: 'section8',
    });

    expect(facts.selected_notice_route).toBe('section_8');
    expect(facts.eviction_route).toBe('section_8');
    expect(facts.pack_type).toBe('complete');
  });

  it('keeps Wales selected routes compatible with validation while giving the generator canonical routes', () => {
    const route = resolveEvictionPackGenerationRoute(
      { wales_fault_grounds: ['rent_arrears_serious'] },
      'wales',
      'section_8',
    );

    expect(route.selectedNoticeRoute).toBe('wales_fault_based');
    expect(route.evictionRoute).toBe('fault_based');
  });
});
