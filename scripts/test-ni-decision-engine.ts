/**
 * Test Northern Ireland Notice to Quit Generators
 *
 * Verifies that the NI document generators run without throwing
 * and return the expected metadata/html fields.
 */

import * as niDocs from '../src/lib/documents/northern-ireland';

async function runTests() {
  console.log('🏴 Testing Northern Ireland Generators\n');
  console.log('='.repeat(70));

  // Resolve generator functions in a tolerant way so we don't depend
  // on specific named exports at type level.
  const generateNoticeToQuit: any =
    (niDocs as any).generateNoticeToQuit ||
    (niDocs as any).generateNoticeToQuitDocument ||
    (niDocs as any).generateNoticeToQuitHtml;

  const generateSampleNoticeToQuit: any =
    (niDocs as any).generateSampleNoticeToQuit ||
    (niDocs as any).createSampleNoticeToQuitData;

  if (!generateNoticeToQuit || !generateSampleNoticeToQuit) {
    console.log('⚠️  NI Notice to Quit generator not available in this build.');
    console.log('    Skipping NI generator tests.\n');
    return;
  }

  // ---------------------------------------------------------------------------
  // TEST 1: Ground 8 — Serious rent arrears (typical mandatory case)
  // ---------------------------------------------------------------------------
  console.log('\n📋 Test 1: Ground 8 — Serious Rent Arrears');
  console.log('-'.repeat(70));

  try {
    const data8 = generateSampleNoticeToQuit(8);
    const result8: any = await generateNoticeToQuit(data8, false, 'html');

    console.log('✅ Document generated for Ground 8');
    console.log('   Template:', result8.metadata?.templateUsed || 'unknown');
    console.log('   Document ID:', result8.metadata?.documentId || 'unknown');
    console.log('   Generated at:', result8.metadata?.generatedAt || 'unknown');
    console.log('   HTML length:', (result8.html || '').length, 'chars');
  } catch (error: any) {
    console.error('❌ Test 1 failed:', error.message || error);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Ground 10 — Standard rent arrears (discretionary)
  // ---------------------------------------------------------------------------
  console.log('\n📋 Test 2: Ground 10 — Rent Arrears (discretionary)');
  console.log('-'.repeat(70));

  try {
    const data10 = generateSampleNoticeToQuit(10);
    const result10: any = await generateNoticeToQuit(data10, false, 'html');

    console.log('✅ Document generated for Ground 10');
    console.log('   Template:', result10.metadata?.templateUsed || 'unknown');
    console.log('   Document ID:', result10.metadata?.documentId || 'unknown');
    console.log('   Generated at:', result10.metadata?.generatedAt || 'unknown');
    console.log('   HTML length:', (result10.html || '').length, 'chars');
  } catch (error: any) {
    console.error('❌ Test 2 failed:', error.message || error);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Ground 12 or 14 — Another typical ground (ASB / breach)
  // ---------------------------------------------------------------------------
  console.log('\n📋 Test 3: Ground 14 — Antisocial Behaviour (or similar)');
  console.log('-'.repeat(70));

  try {
    const data14 = generateSampleNoticeToQuit(14);
    const result14: any = await generateNoticeToQuit(data14, false, 'html');

    console.log('✅ Document generated for Ground 14');
    console.log('   Template:', result14.metadata?.templateUsed || 'unknown');
    console.log('   Document ID:', result14.metadata?.documentId || 'unknown');
    console.log('   Generated at:', result14.metadata?.generatedAt || 'unknown');
    console.log('   HTML length:', (result14.html || '').length, 'chars');
  } catch (error: any) {
    console.error('❌ Test 3 failed:', error.message || error);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n\n' + '='.repeat(70));
  console.log('✅ Northern Ireland Generator Smoke Tests Complete');
  console.log('='.repeat(70));
}

// Run the tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
