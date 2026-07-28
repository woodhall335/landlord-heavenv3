import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { TENANCY_AGREEMENT_REGISTRY } from '@/lib/tenancy/agreement-registry';
import {
  NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION,
  isNonEnglandStandardTenancyCertified,
} from '@/lib/tenancy/non-england-certification';
import { isNonEnglandStandardTenancyPubliclyEnabled } from '@/lib/tenancy/non-england-rollout';
import {
  VALID_SKUS_BY_JURISDICTION,
  normalizeProductForJurisdiction,
  validateUrlProduct,
} from '@/lib/tenancy/product-normalization';
import { detectInventoryData } from '@/lib/tenancy/product-tier';

const NON_ENGLAND_JURISDICTIONS = [
  'wales',
  'scotland',
  'northern-ireland',
] as const;

describe('non-England standard tenancy release', () => {
  it.each(NON_ENGLAND_JURISDICTIONS)(
    'enables the verified standard product for %s without a solicitor-marketing gate',
    (jurisdiction) => {
      const certification =
        NON_ENGLAND_STANDARD_TENANCY_CERTIFICATION[jurisdiction];
      const registryEntries = TENANCY_AGREEMENT_REGISTRY.filter(
        (entry) => entry.jurisdiction === jurisdiction
      );

      expect(certification).not.toHaveProperty('solicitorApproved');
      expect(isNonEnglandStandardTenancyCertified(jurisdiction)).toBe(true);
      expect(isNonEnglandStandardTenancyPubliclyEnabled(jurisdiction)).toBe(true);
      expect(registryEntries.length).toBeGreaterThan(0);
      expect(
        registryEntries.every(
          (entry) =>
            entry.standardAvailable &&
            !entry.premiumAvailable &&
            entry.releaseStatus === 'available' &&
            entry.startRoute.includes('product=ast_standard')
        )
      ).toBe(true);
    }
  );

  it.each(NON_ENGLAND_JURISDICTIONS)(
    'normalizes new premium requests to the standard product for %s',
    (jurisdiction) => {
      expect(VALID_SKUS_BY_JURISDICTION[jurisdiction]).toHaveLength(1);
      expect(
        normalizeProductForJurisdiction({
          jurisdiction,
          requestedSku: 'ast_premium',
        })
      ).toMatchObject({
        paymentSku: 'ast_standard',
        tier: 'standard',
      });
      expect(validateUrlProduct('ast_premium', jurisdiction)).toContain(
        'standard'
      );
    }
  );

  it('does not mistake an attachment flag for a completed inventory', () => {
    expect(detectInventoryData({ inventory_attached: true })).toBe(false);
    expect(
      detectInventoryData({
        inventory: { rooms: [{ room: 'Kitchen', condition: 'Good' }] },
      })
    ).toBe(true);
  });

  it.each(NON_ENGLAND_JURISDICTIONS)(
    'surfaces a truthful separate-inventory date in the %s wizard',
    (jurisdiction) => {
      const yaml = readFileSync(
        join(
          process.cwd(),
          'config',
          'mqs',
          'tenancy_agreement',
          `${jurisdiction}.yaml`
        ),
        'utf8'
      );
      const inventorySection = yaml.slice(
        yaml.indexOf('- id: inventory_condition'),
        yaml.indexOf('# 11.', yaml.indexOf('- id: inventory_condition'))
      );

      expect(inventorySection).toContain('id: inventory_delivery_method');
      expect(inventorySection).toContain('value: "later"');
      expect(inventorySection).toContain('id: inventory_due_date');
      expect(inventorySection).not.toContain('value: "attached"');
    }
  );

  it('keeps the browser entry, flow page and API start gate aligned', () => {
    const entrySource = readFileSync(
      join(process.cwd(), 'src', 'app', '(app)', 'wizard', 'WizardClientPage.tsx'),
      'utf8'
    );
    const flowSource = readFileSync(
      join(process.cwd(), 'src', 'app', '(app)', 'wizard', 'flow', 'page.tsx'),
      'utf8'
    );
    const startSource = readFileSync(
      join(process.cwd(), 'src', 'app', 'api', 'wizard', 'start', 'route.ts'),
      'utf8'
    );

    expect(entrySource).toContain('allowedNonEnglandStandardTenancy');
    expect(entrySource).toContain(
      'if (allowedNonEnglandStandardTenancy && rawProduct)'
    );
    expect(flowSource).toContain('!allowedNonEnglandStandardTenancy');
    expect(startSource).toContain('!allowedNonEnglandStandardTenancy');
  });

  it('carries the Wales fixed/periodic selection into canonical wizard facts', () => {
    const flowSource = readFileSync(
      join(process.cwd(), 'src', 'app', '(app)', 'wizard', 'flow', 'page.tsx'),
      'utf8'
    );
    const startSource = readFileSync(
      join(process.cwd(), 'src', 'app', 'api', 'wizard', 'start', 'route.ts'),
      'utf8'
    );

    expect(flowSource).toContain(
      "contract_type: searchParams.get('contract_type') || undefined"
    );
    expect(startSource).toContain(
      "contract_type: z.enum(['fixed', 'periodic']).optional()"
    );
    expect(startSource).toContain(
      "is_fixed_term: contract_type === 'fixed'"
    );
  });
});
