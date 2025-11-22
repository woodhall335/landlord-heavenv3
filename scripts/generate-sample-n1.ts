/**
 * Generate Sample Filled N1 Form
 *
 * Creates a realistic filled N1 money claim form for testing and demonstration.
 */

import { fillN1Form, CaseData, saveFilledForm } from '../src/lib/documents/official-forms-filler';
import { join } from 'path';

async function generateSampleN1() {
  console.log('📄 Generating sample N1 form (Money Claim)...\n');

  // Sample case data - Rent arrears money claim
  const sampleData: CaseData = {
    // Court
    court_name: 'Central London County Court',

    // Landlord (Claimant)
    landlord_full_name: 'John Michael Smith',
    landlord_address: '45 Park Lane\nMayfair\nLondon\nW1K 1AA',
    landlord_postcode: 'W1K 1AA',
    landlord_phone: '020 7123 4567',
    landlord_email: 'john.smith@example.com',
    claimant_reference: 'JMS/2025/001',

    // Tenant (Defendant)
    tenant_full_name: 'Sarah Jane Williams',
    property_address: '123 High Street\nApt 2B\nLondon\nSW1A 1AA',
    property_postcode: 'SW1A 1AA',

    // Tenancy
    tenancy_start_date: '2023-06-01',
    rent_amount: 1500,
    rent_frequency: 'monthly',

    // Claim
    claim_type: 'money_claim',
    total_claim_amount: 9000, // 6 months arrears
    court_fee: 455, // Court fee for £9,000 claim
    solicitor_costs: 0, // No solicitor (self-representing)

    // Particulars of claim
    particulars_of_claim: `PARTICULARS OF CLAIM

1. The Claimant is the freehold owner of the property known as 123 High Street, Apt 2B, London SW1A 1AA ("the Property").

2. By an Assured Shorthold Tenancy Agreement dated 1 June 2023, the Claimant let the Property to the Defendant for a monthly rent of £1,500.00, payable in advance on the 1st day of each month.

3. The Defendant has failed to pay rent due under the tenancy agreement. As at 22 November 2025, the Defendant owes arrears of £9,000.00, representing 6 months' unpaid rent from June 2025 to November 2025 inclusive.

4. Despite repeated written requests for payment, the Defendant has failed to pay the outstanding arrears.

5. The Claimant claims:
   (a) £9,000.00 being rent arrears;
   (b) Interest pursuant to section 69 of the County Courts Act 1984 at the rate of 8% per annum from the date of each payment becoming due to the date of judgment;
   (c) Costs.

STATEMENT OF TRUTH
The Claimant believes that the facts stated in these Particulars of Claim are true.`,

    // Signature
    signatory_name: 'John Michael Smith',
    signature_date: '2025-11-22',
  };

  console.log('Case Details:');
  console.log(`  Claimant: ${sampleData.landlord_full_name}`);
  console.log(`  Defendant: ${sampleData.tenant_full_name}`);
  console.log(`  Claim Amount: £${sampleData.total_claim_amount}`);
  console.log(`  Court Fee: £${sampleData.court_fee}`);
  console.log(`  Total: £${sampleData.total_claim_amount! + sampleData.court_fee!}`);
  console.log('');

  const filledPdf = await fillN1Form(sampleData);

  const outputPath = join(process.cwd(), 'sample-n1-filled.pdf');
  await saveFilledForm(filledPdf, outputPath);

  console.log('\n✅ Sample N1 form generated!');
  console.log(`📄 Open: ${outputPath}\n`);
}

generateSampleN1().catch(console.error);
