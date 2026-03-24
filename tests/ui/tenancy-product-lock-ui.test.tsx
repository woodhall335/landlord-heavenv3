import { describe, it, expect } from 'vitest';
import { getVisibleSectionsForFacts } from '@/components/wizard/flows/TenancySectionFlow';

describe('Tenancy wizard product section visibility', () => {
  it('hides the product step when a purchased product exists', () => {
    const facts = {
      __meta: { purchased_product: 'ast_standard', entitlements: ['ast_standard'] },
      product_tier: 'Standard AST',
    };

    const sections = getVisibleSectionsForFacts(facts, true);
    expect(sections.some((section) => section.id === 'product')).toBe(false);
  });

  it('shows the product step when no paid entitlement is present', () => {
    const facts = { product_tier: null };

    const sections = getVisibleSectionsForFacts(facts, false);
    expect(sections.some((section) => section.id === 'product')).toBe(true);
  });

  it('only treats England written-information tracking as a blocker for new agreements', () => {
    const sections = getVisibleSectionsForFacts(
      {
        __meta: { jurisdiction: 'england' },
        england_tenancy_purpose: 'new_agreement',
        how_to_rent_guide_provided: false,
      },
      false,
    );
    const complianceSection = sections.find((section) => section.id === 'compliance');

    expect(complianceSection?.hasBlockers?.({
      __meta: { jurisdiction: 'england' },
      england_tenancy_purpose: 'new_agreement',
      how_to_rent_guide_provided: false,
    })).toEqual([
      'England written information or any government guidance you provide should be recorded for the tenancy file',
    ]);

    expect(complianceSection?.hasBlockers?.({
      __meta: { jurisdiction: 'england' },
      england_tenancy_purpose: 'existing_written_tenancy',
      how_to_rent_guide_provided: false,
    })).toEqual([]);
  });
});
