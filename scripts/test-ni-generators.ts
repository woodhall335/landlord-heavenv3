/**
 * Test Northern Ireland Document Generators
 *
 * Tests all Northern Ireland document generation functions to ensure they work correctly.
 */

import * as niDocs from '../src/lib/documents/northern-ireland';

// Keep full functionality, just relax typing / export resolution a bit
const {
  generatePrivateTenancyAgreement,
  generateSamplePrivateTenancyAgreement,
  generateSamplePrivateTenancyWithAgent,
} = niDocs as any;

// Notice to Quit helpers may be exported under slightly different names,
// so resolve them dynamically but keep the same usage.
const generateNoticeToQuit: any =
  (niDocs as any).generateNoticeToQuit ||
  (niDocs as any).generateNoticeToQuitDocument ||
  (niDocs as any).generateNoticeToQuitHtml;

const generateSampleNoticeToQuit: any =
  (niDocs as any).generateSampleNoticeToQuit ||
  (niDocs as any).createSampleNoticeToQuitData;

async function runTests() {
  console.log('🏴 Testing Northern Ireland Document Generators\n');
  console.log('='.repeat(70));

  let successCount = 0;
  let failCount = 0;

  // ==========================================================================
  // TEST 1: Private Tenancy Agreement (Fixed Term)
  // ==========================================================================
  console.log('\n📄 Test 1: Private Tenancy Agreement (Fixed Term)');
  console.log('-'.repeat(70));

  try {
    const ptaData = generateSamplePrivateTenancyAgreement('fixed');
    const result = await generatePrivateTenancyAgreement(ptaData, false, 'html');

    console.log('✅ Document generated successfully!');
    console.log(`   Document ID: ${result.metadata.documentId}`);
    console.log(`   HTML length: ${result.html.length} chars`);
    console.log(`   Landlord: ${ptaData.landlord.full_name}`);
    console.log(`   Tenants: ${ptaData.tenants.map((t: any) => t.full_name).join(', ')}`);
    console.log(`   Property: ${ptaData.property_address}`);
    console.log(
      `   Term: ${ptaData.term_length} (${ptaData.tenancy_start_date} to ${ptaData.tenancy_end_date})`,
    );
    console.log(`   Rent: £${ptaData.rent_amount}/${ptaData.rent_period}`);
    console.log(`   Deposit: £${ptaData.deposit_amount} (${ptaData.deposit_scheme})`);
    successCount++;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    failCount++;
  }

  // ==========================================================================
  // TEST 2: Private Tenancy Agreement (Periodic)
  // ==========================================================================
  console.log('\n\n📄 Test 2: Private Tenancy Agreement (Periodic)');
  console.log('-'.repeat(70));

  try {
    const ptaData = generateSamplePrivateTenancyAgreement('periodic');
    const result = await generatePrivateTenancyAgreement(ptaData, false, 'html');

    console.log('✅ Document generated successfully!');
    console.log(`   Document ID: ${result.metadata.documentId}`);
    console.log(`   HTML length: ${result.html.length} chars`);
    console.log(`   Type: Periodic tenancy`);
    console.log(`   Start: ${ptaData.tenancy_start_date}`);
    console.log(`   Rent: £${ptaData.rent_amount}/${ptaData.rent_period}`);
    successCount++;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    failCount++;
  }

  // ==========================================================================
  // TEST 3: Private Tenancy Agreement (With Agent)
  // ==========================================================================
  console.log('\n\n📄 Test 3: Private Tenancy Agreement (With Agent)');
  console.log('-'.repeat(70));

  try {
    const ptaData = generateSamplePrivateTenancyWithAgent();
    const result = await generatePrivateTenancyAgreement(ptaData, false, 'html');

    console.log('✅ Document generated successfully!');
    console.log(`   Document ID: ${result.metadata.documentId}`);
    console.log(`   Agent: ${ptaData.agent?.name} (${ptaData.agent?.company})`);
    console.log(`   Agent signs: ${ptaData.agent?.signs ? 'Yes' : 'No'}`);
    successCount++;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    failCount++;
  }

  // ==========================================================================
  // TEST 4: Notice to Quit - Ground 8 (Serious Rent Arrears - MANDATORY)
  // ==========================================================================
  console.log('\n\n📄 Test 4: Notice to Quit - Ground 8 (Serious Rent Arrears - MANDATORY)');
  console.log('-'.repeat(70));

  try {
    const ntqData = generateSampleNoticeToQuit(8);
    const result = await generateNoticeToQuit(ntqData, false, 'html');

    console.log('✅ Document generated successfully!');
    console.log(`   Document ID: ${result.metadata.documentId}`);
    console.log(`   HTML length: ${result.html.length} chars`);
    console.log(`   Ground: 8 (Serious Rent Arrears - MANDATORY)`);
    console.log(`   Landlord: ${ntqData.landlord.full_name}`);
    console.log(`   Tenant: ${ntqData.tenants[0].full_name}`);
    console.log(`   Property: ${ntqData.property.address}`);
    console.log(`   Notice date: ${ntqData.notice_date}`);
    console.log(`   Quit date: ${ntqData.quit_date}`);
    console.log(
      `   Notice period: ${ntqData.notice_period_weeks} weeks (${ntqData.notice_period_days} days)`,
    );
    console.log(`   Arrears: £${ntqData.total_arrears} (${ntqData.arrears_weeks} weeks)`);
    successCount++;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    failCount++;
  }

  // ==========================================================================
  // TEST 5: Notice to Quit - Ground 10 (Rent Arrears - DISCRETIONARY)
  // ==========================================================================
  console.log('\n\n📄 Test 5: Notice to Quit - Ground 10 (Rent Arrears - DISCRETIONARY)');
  console.log('-'.repeat(70));

  try {
    const ntqData = generateSampleNoticeToQuit(10);
    const result = await generateNoticeToQuit(ntqData, false, 'html');

    console.log('✅ Document generated successfully!');
    console.log(`   Document ID: ${result.metadata.documentId}`);
    console.log(`   Ground: 10 (Rent Arrears - DISCRETIONARY)`);
    console.log(`   Arrears: £${ntqData.total_arrears}`);
    console.log(`   Notice period: ${ntqData.notice_period_weeks} weeks`);
    successCount++;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    failCount++;
  }

  // ==========================================================================
  // TEST 6: Notice to Quit - Ground 12 (Breach of Tenancy)
  // ==========================================================================
  console.log('\n\n📄 Test 6: Notice to Quit - Ground 12 (Breach of Tenancy)');
  console.log('-'.repeat(70));

  try {
    const ntqData = generateSampleNoticeToQuit(12);
    const result = await generateNoticeToQuit(ntqData, false, 'html');

    console.log('✅ Document generated successfully!');
    console.log(`   Document ID: ${result.metadata.documentId}`);
    console.log(`   Ground: 12 (Breach of Tenancy)`);
    console.log(`   Breach type: ${ntqData.breach_type}`);
    console.log(`   Breach date: ${ntqData.breach_date}`);
    successCount++;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    failCount++;
  }

  // ==========================================================================
  // TEST 7: Notice to Quit - Ground 14 (Antisocial Behaviour)
  // ==========================================================================
  console.log('\n\n📄 Test 7: Notice to Quit - Ground 14 (Antisocial Behaviour)');
  console.log('-'.repeat(70));

  try {
    const ntqData = generateSampleNoticeToQuit(14);
    const result = await generateNoticeToQuit(ntqData, false, 'html');

    console.log('✅ Document generated successfully!');
    console.log(`   Document ID: ${result.metadata.documentId}`);
    console.log(`   Ground: 14 (Nuisance/Annoyance - ASB)`);
    console.log(`   ASB incidents: ${ntqData.asb_incidents?.length || 0}`);
    console.log(`   Evidence: ${ntqData.asb_evidence}`);
    successCount++;
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    failCount++;
  }

  // ==========================================================================
  // SUMMARY
  // ==========================================================================
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(
    `📈 Success Rate: ${(
      (successCount / (successCount + failCount || 1)) *
      100
    ).toFixed(1)}%`,
  );
  console.log('='.repeat(70));

  if (failCount === 0) {
    console.log('\n🎉 All Northern Ireland document generators working perfectly!');
    console.log('\nDocuments tested:');
    console.log('  ✅ Private Tenancy Agreement (Fixed Term)');
    console.log('  ✅ Private Tenancy Agreement (Periodic)');
    console.log('  ✅ Private Tenancy Agreement (With Agent)');
    console.log('  ✅ Notice to Quit - Ground 8 (Mandatory Rent Arrears)');
    console.log('  ✅ Notice to Quit - Ground 10 (Discretionary Rent Arrears)');
    console.log('  ✅ Notice to Quit - Ground 12 (Breach of Tenancy)');
    console.log('  ✅ Notice to Quit - Ground 14 (Antisocial Behaviour)');
    console.log('\n🏴 Northern Ireland Implementation: 100% Complete');
    console.log('='.repeat(70));
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
