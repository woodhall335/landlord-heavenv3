/**
 * AST Flow Verification Script
 *
 * Tests the complete AST flow from wizard facts → mapper → generator
 * Run with: npx tsx test-ast-flow.ts
 */

import { mapWizardToASTData } from './src/lib/documents/ast-wizard-mapper';
import { generateStandardAST, generatePremiumAST } from './src/lib/documents/ast-generator';

// Sample wizard facts that would be collected from the MQS
const standardASTFacts = {
  // Pre-populated from button click
  product_tier: 'Standard AST',

  // Property details
  property_address: 'Flat 2, 123 High Street, London, SW1A 1AA',
  property_address_line1: '123 High Street',
  property_address_town: 'London',
  property_address_postcode: 'SW1A 1AA',
  property_type: 'Flat',
  number_of_bedrooms: 2,
  furnished_status: 'Furnished',
  property_description: 'Modern 2-bedroom flat in central London',
  parking_available: true,
  parking_details: 'One allocated parking space',
  has_garden: false,

  // Landlord details
  landlord_full_name: 'John Smith',
  landlord_address: '456 Oak Road, London, W1B 2CD',
  landlord_address_line1: '456 Oak Road',
  landlord_address_town: 'London',
  landlord_address_postcode: 'W1B 2CD',
  landlord_email: 'john.smith@example.com',
  landlord_phone: '07700900123',

  // Tenant details
  tenants: [
    {
      full_name: 'Jane Doe',
      dob: '1990-05-15',
      email: 'jane.doe@example.com',
      phone: '07700900456',
    }
  ],
  number_of_tenants: 1,

  // Tenancy dates
  agreement_date: '2025-01-01',
  tenancy_start_date: '2025-01-15',
  is_fixed_term: true,
  tenancy_end_date: '2026-01-14',
  term_length: '12 months',

  // Rent details
  rent_amount: 1500,
  rent_period: 'month',
  rent_due_day: '1st of each month',
  payment_method: 'Standing Order',
  payment_details: 'Bank transfer to landlord account',
  bank_account_name: 'John Smith',
  bank_sort_code: '12-34-56',
  bank_account_number: '12345678',

  // Deposit details
  deposit_amount: 2000,
  deposit_scheme_name: 'DPS',
  deposit_paid_date: '2025-01-01',
  deposit_protection_date: '2025-01-05',

  // Bills and utilities
  council_tax_responsibility: 'Tenant',
  utilities_responsibility: 'Tenant',
  internet_responsibility: 'Tenant',

  // Inventory and condition
  inventory_attached: true,
  professional_cleaning_required: true,
  decoration_condition: 'Good',

  // Pets and smoking
  pets_allowed: true,
  approved_pets: 'One small dog or cat',
  smoking_allowed: false,

  // Safety certificates
  gas_safety_certificate: true,
  epc_rating: 'C',
  electrical_safety_certificate: true,
  smoke_alarms_fitted: true,
  carbon_monoxide_alarms: true,

  // Landlord access
  landlord_access_notice: '24 hours',
  inspection_frequency: 'Quarterly',
  end_of_tenancy_viewings: true,

  // Break clause
  break_clause: true,
  break_clause_months: 6,
  break_clause_notice_period: '2 months',
  subletting_allowed: false,

  // Compliance
  right_to_rent_check_date: '2025-01-01',
  how_to_rent_guide_provided: true,
  how_to_rent_provision_date: '2025-01-01',

  // Joint liability
  joint_and_several_liability: false,
};

// Premium AST facts (includes guarantor, HMO, rent review)
const premiumASTFacts = {
  ...standardASTFacts,
  product_tier: 'Premium AST',

  // Premium features
  is_hmo: true,
  communal_areas: 'Kitchen, bathroom, living room',
  communal_cleaning: 'Professional cleaning service weekly',
  number_of_sharers: 4,
  hmo_licence_status: 'Licensed',

  // Multiple tenants
  tenants: [
    {
      full_name: 'Jane Doe',
      dob: '1990-05-15',
      email: 'jane.doe@example.com',
      phone: '07700900456',
    },
    {
      full_name: 'John Roe',
      dob: '1992-08-20',
      email: 'john.roe@example.com',
      phone: '07700900789',
    }
  ],
  number_of_tenants: 2,
  joint_and_several_liability: true,

  // Guarantor
  guarantor_required: true,
  guarantor_name: 'Robert Doe',
  guarantor_address: '789 Elm Street, Manchester, M1 1AA',
  guarantor_email: 'robert.doe@example.com',
  guarantor_phone: '07700900999',
  guarantor_dob: '1960-03-10',
  guarantor_relationship: 'Parent',

  // Rent increase
  rent_increase_clause: true,
  rent_increase_method: 'RPI',
  rent_increase_frequency: 'Annual',

  // Insurance
  tenant_insurance_required: true,
};

async function testStandardAST() {
  console.log('\n=== Testing Standard AST Flow ===\n');

  try {
    // Step 1: Map wizard facts to ASTData
    console.log('1. Mapping wizard facts to ASTData...');
    const astData = mapWizardToASTData(standardASTFacts);
    console.log('✓ Mapping successful');
    console.log(`   - Product Tier: ${astData.product_tier}`);
    console.log(`   - Property: ${astData.property_address}`);
    console.log(`   - Landlord: ${astData.landlord_full_name}`);
    console.log(`   - Tenants: ${astData.tenants.length}`);
    console.log(`   - Rent: £${astData.rent_amount}/${astData.rent_period}`);

    // Step 2: Generate Standard AST
    console.log('\n2. Generating Standard AST documents...');
    const pack = await generateStandardAST(astData);
    console.log('✓ Generation successful');

    // Step 3: Verify pack contents
    console.log('\n3. Verifying pack contents:');
    const expectedDocs = [
      'main_agreement',
      'terms_and_conditions',
      'certificate_of_curation',
      'legal_validity_summary',
    ];

    // Check if deposit protection certificate should be included
    if (astData.deposit_amount && astData.deposit_amount > 0) {
      expectedDocs.push('deposit_protection_certificate');
    }

    // Check if inventory template should be included
    if (astData.inventory_attached) {
      expectedDocs.push('inventory_template');
    }

    const missingDocs = expectedDocs.filter(doc => !pack.documents?.some(d => d.filename.includes(doc)));

    if (missingDocs.length > 0) {
      console.log('✗ Missing documents:', missingDocs);
      return false;
    }

    console.log(`✓ All ${pack.documents?.length ?? 0} expected documents present:`);
    pack.documents?.forEach(doc => {
      console.log(`   - ${doc.filename}`);
    });

    // Step 4: Validate no errors
    if (pack.validation_errors && pack.validation_errors.length > 0) {
      console.log('\n✗ Validation errors found:');
      pack.validation_errors.forEach(err => console.log(`   - ${err}`));
      return false;
    }

    console.log('\n✓ No validation errors');
    console.log('\n=== Standard AST Test PASSED ===\n');
    return true;

  } catch (error: any) {
    console.error('\n✗ Standard AST test FAILED:');
    console.error(error.message);
    console.error(error.stack);
    return false;
  }
}

async function testPremiumAST() {
  console.log('\n=== Testing Premium AST Flow ===\n');

  try {
    // Step 1: Map wizard facts to ASTData
    console.log('1. Mapping wizard facts to ASTData...');
    const astData = mapWizardToASTData(premiumASTFacts);
    console.log('✓ Mapping successful');
    console.log(`   - Product Tier: ${astData.product_tier}`);
    console.log(`   - Property: ${astData.property_address}`);
    console.log(`   - Is HMO: ${astData.is_hmo}`);
    console.log(`   - Joint & Several: ${astData.joint_and_several_liability}`);
    console.log(`   - Guarantor Required: ${astData.guarantor_required}`);
    console.log(`   - Rent Increase Clause: ${astData.rent_increase_clause}`);

    // Step 2: Generate Premium AST
    console.log('\n2. Generating Premium AST documents...');
    const pack = await generatePremiumAST(astData);
    console.log('✓ Generation successful');

    // Step 3: Verify pack contents
    console.log('\n3. Verifying pack contents:');
    const expectedDocs = [
      'main_agreement',
      'terms_and_conditions',
      'certificate_of_curation',
      'legal_validity_summary',
    ];

    // Premium-specific documents
    if (astData.guarantor_required) {
      expectedDocs.push('guarantor_agreement');
    }

    if (astData.deposit_amount && astData.deposit_amount > 0) {
      expectedDocs.push('deposit_protection_certificate');
    }

    if (astData.inventory_attached) {
      expectedDocs.push('inventory_template');
    }

    const missingDocs = expectedDocs.filter(doc => !pack.documents?.some(d => d.filename.includes(doc)));

    if (missingDocs.length > 0) {
      console.log('✗ Missing documents:', missingDocs);
      return false;
    }

    console.log(`✓ All ${pack.documents?.length ?? 0} expected documents present:`);
    pack.documents?.forEach(doc => {
      console.log(`   - ${doc.filename}`);
    });

    // Step 4: Validate no errors
    if (pack.validation_errors && pack.validation_errors.length > 0) {
      console.log('\n✗ Validation errors found:');
      pack.validation_errors.forEach(err => console.log(`   - ${err}`));
      return false;
    }

    console.log('\n✓ No validation errors');
    console.log('\n=== Premium AST Test PASSED ===\n');
    return true;

  } catch (error: any) {
    console.error('\n✗ Premium AST test FAILED:');
    console.error(error.message);
    console.error(error.stack);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   AST Flow Verification Script                     ║');
  console.log('║   Testing: Wizard → Mapper → Generator            ║');
  console.log('╚════════════════════════════════════════════════════╝');

  const standardPassed = await testStandardAST();
  const premiumPassed = await testPremiumAST();

  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║   Summary                                          ║');
  console.log('╠════════════════════════════════════════════════════╣');
  console.log(`║   Standard AST: ${standardPassed ? '✓ PASSED' : '✗ FAILED'}                               ║`);
  console.log(`║   Premium AST:  ${premiumPassed ? '✓ PASSED' : '✗ FAILED'}                               ║`);
  console.log('╚════════════════════════════════════════════════════╝\n');

  if (standardPassed && premiumPassed) {
    console.log('✓ All tests passed! The AST flow is working correctly.');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
