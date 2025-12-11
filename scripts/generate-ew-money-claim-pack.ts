import { generateMoneyClaimPack } from '../src/lib/documents/money-claim-pack-generator.ts';
import { savePackPreview } from './helpers/save-pack.ts';

const sampleCase = {
  jurisdiction: 'england-wales' as const,
  case_id: 'case-money-cli-1',
  landlord_full_name: 'Alice Landlord',
  landlord_address: '1 High Street\nLondon',
  landlord_postcode: 'E1 1AA',
  landlord_email: 'alice@example.com',
  tenant_full_name: 'Tom Tenant',
  property_address: '2 High Street\nLondon',
  property_postcode: 'E1 2BB',
  rent_amount: 950,
  rent_frequency: 'monthly' as const,
  payment_day: 1,
  tenancy_start_date: '2024-01-01',
  arrears_schedule: [
    { period: 'Jan 2024', due_date: '2024-01-01', amount_due: 950, amount_paid: 0, arrears: 950 },
    { period: 'Feb 2024', due_date: '2024-02-01', amount_due: 950, amount_paid: 450, arrears: 500 },
  ],
  damage_items: [{ description: 'Broken door', amount: 200 }],
  other_charges: [{ description: 'Locksmith call-out', amount: 80 }],
  interest_start_date: '2024-01-01',
  particulars_of_claim: 'Rent arrears and damage to the property.',
  signatory_name: 'Alice Landlord',
  signature_date: '2025-01-15',
};

async function main() {
  process.env.DISABLE_MONEY_CLAIM_AI = 'true';

  const pack = await generateMoneyClaimPack(sampleCase);
  await savePackPreview('E&W Money Claim Pack', 'ew-money-claim', pack.documents);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
