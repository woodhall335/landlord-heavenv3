import fs from 'fs/promises';
import path from 'path';

import {
  type ASTDocumentPack,
  generatePremiumASTDocuments,
  generateStandardASTDocuments,
} from '../src/lib/documents/ast-generator.ts';
import { mapWizardToASTData } from '../src/lib/documents/ast-wizard-mapper.ts';
import {
  ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
  ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
} from '../src/lib/tenancy/england-agreement-constants.ts';

process.env.TZ = 'Europe/London';

type WizardFacts = Record<string, unknown>;

function buildStandardFacts(): WizardFacts {
  return {
    product_tier: ENGLAND_STANDARD_ASSURED_PERIODIC_TIER_LABEL,
    jurisdiction: 'england',
    agreement_date: '2026-05-20',
    tenancy_start_date: '2026-06-01',
    landlord_full_name: 'Amelia Hart',
    landlord_address: '14 Kingsway, London, WC2B 6UN',
    landlord_address_line1: '14 Kingsway',
    landlord_address_town: 'London',
    landlord_address_postcode: 'WC2B 6UN',
    landlord_email: 'amelia.hart@example.com',
    landlord_phone: '07000000010',
    property_address: 'Flat 4, 19 River Street, Manchester, M3 4EN',
    property_address_line1: 'Flat 4, 19 River Street',
    property_address_town: 'Manchester',
    property_address_postcode: 'M3 4EN',
    property_type: 'Flat',
    number_of_bedrooms: 2,
    furnished_status: 'part-furnished',
    parking_available: false,
    tenancy_end_date: null,
    is_fixed_term: false,
    rent_amount: 1450,
    rent_period: 'month',
    rent_due_day: '1st',
    payment_method: 'Standing Order',
    payment_details: 'Monthly standing order to the landlord account',
    bank_account_name: 'Amelia Hart',
    bank_sort_code: '112233',
    bank_account_number: '12345678',
    deposit_amount: 1450,
    deposit_scheme_name: 'DPS',
    deposit_scheme: 'custodial',
    deposit_reference_number: 'DPS-ENG-2026-001',
    deposit_paid_date: '2026-05-20',
    deposit_protection_date: '2026-05-21',
    prescribed_information_date: '2026-05-21',
    council_tax_band: 'C',
    council_tax_responsibility: 'Tenant',
    utilities_responsibility: 'Tenant',
    internet_responsibility: 'Tenant',
    inventory_attached: true,
    inventory_provided: true,
    pets_allowed: false,
    smoking_allowed: false,
    right_to_rent_check_date: '2026-05-22',
    how_to_rent_version: 'May 2026',
    gas_safety_certificate: true,
    gas_safety_certificate_expiry: '2027-05-10',
    electrical_safety_certificate: true,
    eicr_next_inspection_date: '2030-05-10',
    epc_rating: 'C',
    epc_expiry: '2034-01-10',
    smoke_alarms_fitted: true,
    carbon_monoxide_alarms: true,
    repairs_reporting_method: 'Email the landlord or managing agent in writing',
    emergency_contact: '07000000010',
    tenants: [
      {
        full_name: 'Noah Bennett',
        dob: '1992-09-14',
        email: 'noah.bennett@example.com',
        phone: '07000000011',
      },
    ],
  };
}

function buildPremiumFacts(): WizardFacts {
  return {
    product_tier: ENGLAND_PREMIUM_ASSURED_PERIODIC_TIER_LABEL,
    jurisdiction: 'england',
    agreement_date: '2026-05-28',
    tenancy_start_date: '2026-06-15',
    landlord_full_name: 'Cedar Estates Ltd',
    landlord_address: '22 Regent Square, Leeds, LS2 8AJ',
    landlord_address_line1: '22 Regent Square',
    landlord_address_town: 'Leeds',
    landlord_address_postcode: 'LS2 8AJ',
    landlord_email: 'lettings@cedarestates.example.com',
    landlord_phone: '07000000020',
    agent_name: 'Cedar Estates Management',
    agent_address: '22 Regent Square, Leeds, LS2 8AJ',
    agent_email: 'management@cedarestates.example.com',
    agent_phone: '07000000021',
    property_address: '32 Carlton Grove, Leeds, LS6 1BT',
    property_address_line1: '32 Carlton Grove',
    property_address_town: 'Leeds',
    property_address_postcode: 'LS6 1BT',
    property_type: 'House',
    number_of_bedrooms: 4,
    furnished_status: 'furnished',
    parking_available: true,
    parking_details: 'On-street permit parking',
    is_fixed_term: false,
    rent_amount: 2400,
    rent_period: 'month',
    rent_due_day: '1st',
    payment_method: 'Bank Transfer',
    payment_details: 'Monthly transfer to the managing agent client account',
    bank_account_name: 'Cedar Estates Client Account',
    bank_sort_code: '445566',
    bank_account_number: '87654321',
    deposit_amount: 2400,
    deposit_scheme_name: 'MyDeposits',
    deposit_scheme: 'insured',
    deposit_reference_number: 'MYD-ENG-2026-014',
    deposit_paid_date: '2026-05-28',
    deposit_protection_date: '2026-05-29',
    prescribed_information_date: '2026-05-29',
    council_tax_band: 'D',
    council_tax_responsibility: 'Tenant',
    utilities_responsibility: 'Tenant',
    internet_responsibility: 'Tenant',
    inventory_attached: true,
    inventory_provided: true,
    is_hmo: true,
    number_of_sharers: 4,
    communal_areas: 'Kitchen, rear sitting room, two bathrooms, hallway, and garden',
    communal_cleaning: 'Occupiers rotate weekly cleaning and bin duties',
    hmo_licence_status: 'Currently licensed',
    hmo_licence_number: 'HMO-LDS-2026-441',
    hmo_licence_expiry: '2029-03-31',
    pets_allowed: false,
    smoking_allowed: false,
    right_to_rent_check_date: '2026-05-30',
    how_to_rent_version: 'May 2026',
    gas_safety_certificate: true,
    gas_safety_certificate_expiry: '2027-04-18',
    electrical_safety_certificate: true,
    eicr_next_inspection_date: '2030-04-18',
    epc_rating: 'C',
    epc_expiry: '2033-09-01',
    smoke_alarms_fitted: true,
    carbon_monoxide_alarms: true,
    repairs_reporting_method: 'Use the online maintenance portal or email the managing agent',
    emergency_contact: '07000000021',
    guarantor_required: true,
    guarantor_name: 'Olivia Bennett',
    guarantor_address: '8 Hill View, York, YO10 4BD',
    guarantor_email: 'olivia.bennett@example.com',
    guarantor_phone: '07000000030',
    guarantor_dob: '1971-03-05',
    guarantor_relationship: 'Parent of lead tenant',
    guarantor_max_liability: 'twelve months of rent plus reasonable enforcement costs',
    tenants: [
      {
        full_name: 'Liam Carter',
        dob: '1998-02-11',
        email: 'liam.carter@example.com',
        phone: '07000000022',
      },
      {
        full_name: 'Maya Singh',
        dob: '1999-07-19',
        email: 'maya.singh@example.com',
        phone: '07000000023',
      },
      {
        full_name: 'Ethan Price',
        dob: '1997-11-03',
        email: 'ethan.price@example.com',
        phone: '07000000024',
      },
      {
        full_name: 'Grace Moore',
        dob: '1998-04-28',
        email: 'grace.moore@example.com',
        phone: '07000000025',
      },
    ],
  };
}

async function writeAgreementSample(
  pack: ASTDocumentPack,
  targetPath: string,
) {
  const agreement = pack.documents.find((document) => document.category === 'agreement');

  if (!agreement?.pdf) {
    throw new Error(`Expected main agreement PDF output for ${targetPath}`);
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, agreement.pdf);
  console.log(`Wrote ${targetPath}`);
}

async function main() {
  const standardPack = await generateStandardASTDocuments(
    mapWizardToASTData(buildStandardFacts() as any),
    'england-standard-live-sample',
  );
  await writeAgreementSample(
    standardPack,
    path.join(process.cwd(), 'artifacts', 'test', 'tenancy_agreement.pdf'),
  );

  const premiumPack = await generatePremiumASTDocuments(
    mapWizardToASTData(buildPremiumFacts() as any),
    'england-premium-live-sample',
  );
  await writeAgreementSample(
    premiumPack,
    path.join(process.cwd(), 'artifacts', 'test', 'prem tenancy england', 'tenancy_agreement_hmo.pdf'),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
