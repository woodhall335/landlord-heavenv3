import { describe, expect, it } from 'vitest';
import { generateStandardAST } from '@/lib/documents/ast-generator';
import { generatePRTAgreement } from '@/lib/documents/scotland/prt-generator';
import { generatePrivateTenancyAgreement } from '@/lib/documents/northern-ireland/private-tenancy-generator';

describe('Tenancy generator jurisdiction smoke tests', () => {
  it('generates England AST without throwing when facts are complete', async () => {
    await expect(generateStandardAST({
      jurisdiction: 'england',
      agreement_date: '2026-01-01',
      landlord_full_name: 'Landlord One',
      landlord_address: '1 Landlord Street, London, SW1A 1AA',
      landlord_email: 'landlord@example.com',
      landlord_phone: '07000000000',
      tenants: [{ full_name: 'Tenant One', dob: '1990-01-01', email: 'tenant@example.com', phone: '07111111111' }],
      property_address: '2 Tenant Road, London, E1 1AA',
      tenancy_start_date: '2026-02-01',
      is_fixed_term: false,
      rent_amount: 1200,
      rent_due_day: '1st',
      payment_method: 'Bank Transfer',
      payment_details: 'Account Name: LH\nSort Code: 00-00-00\nAccount Number: 12345678',
      deposit_amount: 0,
      deposit_scheme_name: 'DPS',
    }, true)).resolves.toBeTruthy();
  });

  it('generates Scotland PRT without throwing when facts are complete', async () => {
    await expect(generatePRTAgreement({
      agreement_date: '2026-01-01',
      landlord_full_name: 'Landlord Scotland',
      landlord_address: '1 George St, Edinburgh EH1 1AA',
      landlord_email: 'scotland@example.com',
      landlord_phone: '07000000000',
      landlord_reg_number: '123456/999/12345',
      tenants: [{ number: 1, full_name: 'Tenant Scotland', dob: '1991-01-01', email: 'tenant.scot@example.com', phone: '07222222222' }],
      property_address: '2 Princes St, Edinburgh EH2 2AA',
      tenancy_start_date: '2026-02-01',
      rent_amount: 1000,
      rent_period: 'month',
      rent_due_day: '1st',
      payment_method: 'Bank Transfer',
      payment_details: 'Bank transfer details',
      deposit_amount: 500,
      deposit_scheme_name: 'SafeDeposits Scotland',
    }, true, 'html')).resolves.toBeTruthy();
  });

  it('generates Northern Ireland tenancy without throwing when facts are complete', async () => {
    await expect(generatePrivateTenancyAgreement({
      agreement_date: '2026-01-01',
      landlord: { full_name: 'Landlord NI', address: '1 Belfast Rd, Belfast BT1 1AA' },
      tenants: [{ full_name: 'Tenant NI', dob: '1992-01-01', email: 'tenant.ni@example.com', phone: '07333333333' }],
      property_address: '2 Derry Rd, Belfast BT2 2BB',
      tenancy_start_date: '2026-02-01',
      is_fixed_term: false,
      rent_amount: 950,
      rent_due_day: '1st',
      payment_method: 'Bank Transfer',
      payment_details: 'Bank transfer details',
      first_payment: 950,
      first_payment_date: '2026-02-01',
      deposit_amount: 0,
    }, true, 'html')).resolves.toBeTruthy();
  });
});
