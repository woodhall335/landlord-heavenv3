import { fillN5BForm } from '../src/lib/documents/official-forms-filler';
import * as fs from 'fs';
import * as path from 'path';

async function generateTestForm() {
  const testData = {
    court_name: 'Central London County Court',
    court_address: '26 Park Crescent, London W1B 1HT',
    claim_number: 'A12345678',
    landlord_title: 'Mr',
    landlord_first_name: 'John',
    landlord_last_name: 'Smith',
    landlord_full_name: 'Mr John Smith',
    landlord_address: '123 High Street\nKensington\nLondon',
    landlord_postcode: 'W8 5SA',
    landlord_phone: '07700 900123',
    landlord_email: 'john.smith@example.com',
    tenant_title: 'Ms',
    tenant_first_name: 'Jane',
    tenant_last_name: 'Doe',
    tenant_full_name: 'Ms Jane Doe',
    property_address: '45 Oak Avenue\nFlat 2B, Westminster\nLondon\nSW1P 2AQ',
    tenancy_start_date: '2023-01-15',
    tenancy_type: 'AST',
    rent_amount: 1500,
    rent_frequency: 'monthly',
    notice_service_method: 'First class post',
    section_21_notice_date: '2025-09-15',
    notice_expiry_date: '2025-11-15',
    deposit_amount: 1500,
    deposit_protected: true,
    deposit_scheme: 'DPS',
    deposit_protection_date: '2023-01-20',
    deposit_prescribed_info_given: true,
    deposit_returned: false,
    epc_provided: true,
    epc_provided_date: '2023-01-10',
    gas_safety_provided: true,
    gas_safety_before_occupation: true,
    has_gas_at_property: true,
    how_to_rent_provided: true,
    how_to_rent_date: '2023-01-15',
    how_to_rent_method: 'email' as const,
    n5b_q9a_after_feb_1997: true,
    n5b_q9b_has_notice_not_ast: false,
    n5b_q9c_has_exclusion_clause: false,
    n5b_q9d_is_agricultural_worker: false,
    n5b_q9e_is_succession_tenancy: false,
    n5b_q9f_was_secure_tenancy: false,
    n5b_q9g_is_schedule_10: false,
    n5b_property_requires_licence: false,
    n5b_property_condition_notice_served: false,
    n5b_q19_has_unreturned_prohibited_payment: false,
    n5b_q19b_holding_deposit: false,
    n5b_q20_paper_determination: true,
    signatory_name: 'Mr John Smith',
    signature_date: '2026-01-23',
    solicitor_costs: false,
    has_tenancy_agreement_copy: true,
    has_section_21_notice_copy: true,
    has_service_proof: true,
    has_deposit_certificate: true,
    has_epc_copy: true,
    has_gas_safety_copy: true,
    has_how_to_rent_copy: true,
  };

  console.log('Generating N5B form with comprehensive test data...');

  try {
    const pdfBytes = await fillN5BForm(testData as any);
    const outputPath = path.join(__dirname, '../artifacts/test/n5b_e2e_test_output.pdf');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, pdfBytes);
    console.log('✅ N5B form generated successfully!');
    console.log('📄 Output saved to:', outputPath);
    console.log('📊 PDF size:', (pdfBytes.length / 1024).toFixed(2), 'KB');
  } catch (error: any) {
    console.error('❌ Error generating form:', error.message);
    console.error(error.stack);
  }
}

generateTestForm();
