/**
 * England Deposit Cap Tests
 *
 * Confirms the live England tenancy-agreement wizard surfaces the legal
 * deposit cap and that the shared tenancy validator blocks over-cap deposits.
 */

import { describe, expect, it } from 'vitest';
import { validateTenancyRequiredFacts } from '@/lib/validation/tenancy-details-validator';

describe('England deposit cap validation', () => {
  it('blocks an England deposit that exceeds the legal cap', () => {
    const result = validateTenancyRequiredFacts({
      __meta: { jurisdiction: 'england', product: 'ast_standard' },
      landlord_full_name: 'Jane Landlord',
      landlord_email: 'jane@example.com',
      landlord_phone: '07123456789',
      landlord_address_line1: '1 High Street',
      landlord_address_town: 'London',
      landlord_address_postcode: 'SW1A 1AA',
      property_address_line1: '2 Main Road',
      property_address_town: 'London',
      property_address_postcode: 'E1 1AA',
      tenancy_start_date: '2026-06-01',
      rent_amount: 1000,
      rent_period: 'monthly',
      deposit_amount: 2000,
      deposit_scheme_name: 'DPS',
      tenants: [
        {
          full_name: 'John Tenant',
          email: 'john@example.com',
          phone: '07999999999',
        },
      ],
    }, { jurisdiction: 'england' });

    expect(result.invalid_fields).toContain('deposit_amount');
  });
});

describe('England deposit step copy contract', () => {
  it('shows the England deposit cap explanation and updated prescribed-information warning in the live tenancy wizard', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const source = fs.readFileSync(
      path.join(process.cwd(), 'src/components/wizard/flows/TenancySectionFlow.tsx'),
      'utf8',
    );

    expect(source).toContain("For England, the deposit must not exceed 5 weeks' rent");
    expect(source).toContain('England deposit cap:');
    expect(source).toContain('Deposit exceeds the England legal cap');
    expect(source).toContain(
      'You must give the tenant the prescribed deposit information within 30 days of receiving the deposit.'
    );
    expect(source).toContain('pay compensation of up to 3 times the deposit');
    expect(source).not.toContain('1-3x the deposit amount');
    expect(source).not.toContain('other enforcement or possession risks');
  });

  it('keeps the England MQS prescribed-information helper aligned with the live wizard wording', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const source = fs.readFileSync(
      path.join(process.cwd(), 'config/mqs/tenancy_agreement/england.yaml'),
      'utf8',
    );

    expect(source).toContain(
      'Statutory requirement: you must give the tenant the prescribed deposit information within 30 days of receiving the deposit.',
    );
    expect(source).toContain('pay compensation of up to 3 times the deposit');
    expect(source).not.toContain('1-3x the deposit amount');
    expect(source).not.toContain('other enforcement or possession risks');
  });
});
