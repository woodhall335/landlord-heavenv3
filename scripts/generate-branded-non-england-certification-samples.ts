import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';

import type { ASTData } from '../src/lib/documents/ast-generator';
import { generateStandardASTDocuments } from '../src/lib/documents/ast-generator';

const generatedOn = '2026-07-27';
const outputRoot = path.join(process.cwd(), 'output', 'pdf');

function sha256(value: Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

async function pageCount(value: Buffer): Promise<number> {
  return (await PDFDocument.load(value)).getPageCount();
}

async function writePack(
  fileName: string,
  data: ASTData
): Promise<void> {
  const sampleKey = fileName.replace(/\.pdf$/i, '');
  const pack = await generateStandardASTDocuments(data, `CERT-${sampleKey}`);
  const agreement = pack.documents.find((document) => document.category === 'agreement');
  if (!agreement?.pdf) throw new Error(`Agreement PDF missing for ${sampleKey}`);

  const packDirectory = path.join(outputRoot, `${sampleKey}-pack`);
  await mkdir(packDirectory, { recursive: true });
  await writeFile(path.join(outputRoot, fileName), agreement.pdf);

  const manifestDocuments = [];
  for (const document of pack.documents) {
    if (!document.pdf) throw new Error(`PDF missing for ${document.document_type}`);
    await writeFile(path.join(packDirectory, document.file_name), document.pdf);
    manifestDocuments.push({
      title: document.title,
      category: document.category,
      documentType: document.document_type,
      fileName: document.file_name,
      bytes: document.pdf.length,
      pages: await pageCount(document.pdf),
      sha256: sha256(document.pdf),
      openCheck: 'passed',
    });
  }

  const manifest = {
    sample: fileName,
    generatedOn,
    jurisdiction: data.jurisdiction,
    tenancyStartDate: data.tenancy_start_date,
    inventoryMode: data.inventory_delivery_method,
    agreementIncludesAppendedSchedule1: data.inventory_delivery_method === 'attached',
    documents: manifestDocuments,
  };
  await writeFile(
    path.join(packDirectory, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  );
  console.log(`${path.join(outputRoot, fileName)} (${manifestDocuments.length} pack assets)`);
}

const walesCommon: Omit<ASTData, 'jurisdiction' | 'is_fixed_term'> = {
  agreement_date: generatedOn,
  landlord_full_name: 'Carys Morgan',
  landlord_address: '18 Cathedral Road, Cardiff, CF11 9LJ',
  landlord_email: 'carys.morgan@example.test',
  landlord_phone: '029 2018 4472',
  landlord_registration_number: 'RSW-REG-472901',
  rent_smart_wales_number: 'RSW-REG-472901',
  rent_smart_wales_registered: true,
  rent_smart_wales_registration_number: 'RSW-REG-472901',
  rent_smart_wales_registration_expiry: '2030-04-30',
  rent_smart_wales_licensed: true,
  rent_smart_wales_licence_number: 'RSW-LIC-883104',
  rent_smart_wales_licence_expiry: '2030-04-30',
  managing_agent_rsw_licensed: false,
  tenants: [{
    full_name: 'Eleri Hughes',
    dob: '1992-06-14',
    email: 'eleri.hughes@example.test',
    phone: '07700 900412',
    address: '7 Bridge Street, Newport, NP20 4AL',
  }],
  property_address: '24 Plasturton Avenue, Cardiff, CF11 9HL',
  property_type: 'terraced house',
  included_areas: 'Rear garden and garden shed',
  shared_areas: 'None',
  excluded_areas: 'Locked loft storage cupboard',
  furnished_status: 'unfurnished',
  tenancy_start_date: '2026-09-01',
  rent_amount: 1_150,
  rent_period: 'month',
  rent_due_day: '1st',
  rent_payment_timing: 'advance',
  payment_method: 'Bank transfer',
  payment_details: 'Account name: Carys Morgan | Sort code: 20-18-44 | Account number: 55790124',
  first_payment: 1_150,
  first_payment_date: '2026-09-01',
  first_payment_period_from: '2026-09-01',
  first_payment_period_to: '2026-09-30',
  rent_includes: 'No utilities or council tax',
  deposit_amount: 1_150,
  deposit_scheme_name: 'DPS',
  deposit_already_protected: false,
  deposit_payer: 'Eleri Hughes',
  inventory_delivery_method: 'attached',
  communication_method: 'email',
  tenant_utility_accounts: 'electricity, gas, water, broadband and council tax',
  gas_safety_certificate: true,
  gas_safety_certificate_date: '2026-08-20',
  epc_rating: 'C',
  epc_certificate_date: '2026-08-18',
  electrical_safety_certificate: true,
  eicr_certificate_date: '2026-08-15',
  smoke_alarms_fitted: true,
  carbon_monoxide_alarms: true,
  meter_reading_gas: '01482.6 m3',
  meter_reading_electric: '036214 kWh',
  meter_reading_water: '00192 m3',
  number_of_front_door_keys: 2,
  number_of_back_door_keys: 2,
};

const scotland: ASTData = {
  agreement_date: generatedOn,
  jurisdiction: 'scotland',
  landlord_full_name: 'Fiona MacLeod',
  landlord_address: '12 Marchmont Crescent, Edinburgh, EH9 1HN',
  landlord_email: 'fiona.macleod@example.test',
  landlord_phone: '0131 555 0187',
  landlord_registration_number: '123456/230/01234',
  landlord_registration_authority: 'City of Edinburgh Council',
  tenants: [{
    full_name: 'Jamie Fraser',
    dob: '1989-03-22',
    email: 'jamie.fraser@example.test',
    phone: '07700 900731',
    address: '5 Leith Walk, Edinburgh, EH6 8LN',
  }],
  property_address: '42 Warrender Park Road, Edinburgh, EH9 1EU',
  property_type: 'tenement flat',
  included_areas: 'Private cellar marked 42',
  shared_areas: 'Common stair and shared rear garden',
  excluded_areas: 'Locked owner cupboard in hall',
  furnished_status: 'part-furnished',
  permitted_residents: 'None other than the named tenant',
  maximum_occupancy: 2,
  is_hmo: false,
  tenancy_start_date: '2026-09-01',
  is_fixed_term: false,
  rent_amount: 1_050,
  rent_period: 'month',
  rent_due_day: '1st',
  rent_payment_timing: 'advance',
  payment_method: 'Bank transfer',
  payment_details: 'Account name: Fiona MacLeod | Sort code: 83-18-44 | Account number: 55790124',
  first_payment: 1_050,
  first_payment_date: '2026-09-01',
  first_payment_period_from: '2026-09-01',
  first_payment_period_to: '2026-09-30',
  rent_includes: 'Communal stair cleaning',
  deposit_amount: 1_050,
  deposit_scheme_name: 'SafeDeposits Scotland' as ASTData['deposit_scheme_name'],
  deposit_payer: 'Jamie Fraser',
  deposit_already_protected: false,
  deposit_scheme_type: 'pending',
  deposit_scheme_address: '1st Floor, 12-14 Shandwick Place, Edinburgh, EH2 4RG',
  deposit_scheme_contact_details: '03333 213 136; safedepositsscotland.com',
  deposit_deduction_circumstances:
    'Unpaid rent or other sums due, damage beyond fair wear and tear, missing items, and evidenced cleaning or replacement costs caused by breach.',
  deposit_repayment_dispute_information:
    'Repayment must be requested through SafeDeposits Scotland. Either party may use the scheme dispute-resolution service if the proposed allocation is disputed.',
  prescribed_information_served: false,
  inventory_delivery_method: 'attached',
  scotland_rent_control_area_status: 'not_designated',
  communication_method: 'email',
  tenant_utility_accounts: 'gas, electricity, broadband and council tax',
  meter_reading_gas: '01321.4 m3',
  meter_reading_electric: '028991 kWh',
  meter_reading_water: 'Not metered',
  number_of_front_door_keys: 2,
  access_cards_fobs: 1,
};

const northernIreland: ASTData = {
  agreement_date: generatedOn,
  jurisdiction: 'northern-ireland',
  landlord_full_name: 'Aoife Campbell',
  landlord_address: '8 Malone Park, Belfast, BT9 6NJ',
  landlord_email: 'aoife.campbell@example.test',
  landlord_phone: '028 9066 1842',
  landlord_registration_number: 'NI-LR-642901',
  tenants: [{
    full_name: 'Conor O’Neill',
    dob: '1991-11-04',
    email: 'conor.oneill@example.test',
    phone: '07700 900624',
    address: '14 Ormeau Road, Belfast, BT7 2JA',
  }],
  property_address: '31 Ravenhill Avenue, Belfast, BT6 8LD',
  property_type: 'terraced house',
  included_areas: 'Rear yard',
  shared_areas: 'None',
  excluded_areas: 'Locked landlord store',
  furnished_status: 'part-furnished',
  tenancy_start_date: '2026-09-01',
  is_fixed_term: true,
  term_length: '12 months',
  tenancy_end_date: '2027-08-31',
  rent_amount: 900,
  rent_period: 'month',
  rent_due_day: '1st',
  rent_payment_timing: 'advance',
  payment_method: 'Bank transfer',
  payment_details: 'Account name: Aoife Campbell | Sort code: 95-18-44 | Account number: 55790124',
  first_payment: 900,
  first_payment_date: '2026-09-01',
  first_payment_period_from: '2026-09-01',
  first_payment_period_to: '2026-09-30',
  rent_includes: 'Domestic rates',
  ni_capital_value: '£135,000',
  ni_rates_payable: '£1,120 per year',
  ni_rates_included_in_rent: 'All domestic rates are included in the monthly rent',
  ni_other_required_payments: 'None',
  deposit_amount: 900,
  deposit_scheme_name: 'Tenancy Deposit Scheme Northern Ireland' as ASTData['deposit_scheme_name'],
  deposit_payer: 'Conor O’Neill',
  deposit_already_protected: false,
  inventory_delivery_method: 'attached',
  communication_method: 'email',
  tenant_utility_accounts: 'electricity, gas, water and broadband',
  gas_safety_certificate: true,
  electrical_safety_certificate: true,
  smoke_alarms_fitted: true,
  carbon_monoxide_alarms: true,
  meter_reading_gas: '00821.7 m3',
  meter_reading_electric: '019440 kWh',
  meter_reading_water: 'Not metered',
  number_of_front_door_keys: 2,
  number_of_back_door_keys: 1,
};

async function main(): Promise<void> {
  await mkdir(outputRoot, { recursive: true });
  await writePack('scotland-prt-branded-sample.pdf', scotland);
  await writePack('wales-fixed-branded-sample.pdf', {
    ...walesCommon,
    jurisdiction: 'wales',
    is_fixed_term: true,
    term_length: '12 months',
    tenancy_end_date: '2027-08-31',
  });
  await writePack('wales-periodic-branded-sample.pdf', {
    ...walesCommon,
    jurisdiction: 'wales',
    is_fixed_term: false,
  });
  await writePack(
    'northern-ireland-private-tenancy-branded-sample.pdf',
    northernIreland
  );
}

void main();
