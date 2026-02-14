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
});
