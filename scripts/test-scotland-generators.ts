/**
 * Test Scotland Document Generators
 *
 * Generates sample Scotland documents to verify generators work correctly
 */

import fs from 'fs';
import path from 'path';
import { generatePRTAgreement, createSamplePRTData } from '../src/lib/documents/scotland/prt-generator';
import {
  generateNoticeToLeave,
  _createSampleNoticeToLeaveData,
  buildGround1RentArrears,
  buildGround3ASB,
  buildGround4LandlordOccupy,
  buildGround5LandlordSell,
  calculateEarliestLeavingDate,
} from '../src/lib/documents/scotland/notice-to-leave-generator';

const OUTPUT_DIR = path.join(process.cwd(), 'output', 'scotland-samples');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateSamples() {
  console.log('🏴󠁧󠁢󠁳󠁣󠁴󠁿 Testing Scotland Document Generators\n');

  // ============================================================================
  // 1. PRT AGREEMENT
  // ============================================================================
  console.log('1️⃣  Generating PRT Agreement...');
  try {
    const prtData = createSamplePRTData();
    const prtDoc = await generatePRTAgreement(prtData, false, 'html');

    const prtPath = path.join(OUTPUT_DIR, 'prt_agreement_sample.html');
    if (prtDoc.html) {
      fs.writeFileSync(prtPath, prtDoc.html);
      console.log(`   ✅ PRT Agreement generated: ${prtPath}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error generating PRT Agreement: ${error.message}`);
  }

  // ============================================================================
  // 2. NOTICE TO LEAVE - GROUND 1 (RENT ARREARS)
  // ============================================================================
  console.log('\n2️⃣  Generating Notice to Leave - Ground 1 (Rent Arrears)...');
  try {
    const noticeDate = new Date('2025-01-15');
    const earliestLeavingDate = calculateEarliestLeavingDate(noticeDate, 28);

    const ntlGround1Data = {
      // Landlord
      landlord_full_name: 'Sarah MacDonald',
      landlord_address: '123 Princes Street, Edinburgh, EH2 4AA',
      landlord_email: 'sarah.macdonald@example.com',
      landlord_phone: '0131 123 4567',
      landlord_reg_number: '123456/230/12345',

      // Tenant
      tenant_full_name: 'James Murray',

      // Property
      property_address: '45 Rose Street, Edinburgh, EH2 2NG',

      // Dates
      notice_date: '15 January 2025',
      earliest_leaving_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      earliest_tribunal_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      notice_period_days: 28 as 28 | 84,

      // Ground 1 - Rent arrears with pre-action requirements
      ...buildGround1RentArrears({
        totalArrears: 3600,
        rentAmount: 1200,
        rentPeriod: 'month',
        arrearsBreakdown: [
          { period: 'November 2024', amount_due: 1200, amount_paid: 0, balance: 1200 },
          { period: 'December 2024', amount_due: 1200, amount_paid: 0, balance: 2400 },
          { period: 'January 2025', amount_due: 1200, amount_paid: 0, balance: 3600 },
        ],
        lastPaymentDate: '1 October 2024',
        lastPaymentAmount: 1200,
        preActionEvidence:
          'Rent statements provided on 5 Nov 2024, 10 Dec 2024, 5 Jan 2025. Payment plan offered on 20 Dec 2024. Tenant contacted by phone on 15 Nov, 20 Dec, 5 Jan. No response received.',
      }),

      // Deposit
      deposit_protected: true,
      deposit_amount: 1800,
      deposit_scheme: 'SafeDeposits Scotland',

      // Council
      council_name: 'City of Edinburgh Council',
      council_phone: '0131 200 2000',
    };

    const ntlGround1Doc = await generateNoticeToLeave(ntlGround1Data, false, 'html');

    const ntlGround1Path = path.join(OUTPUT_DIR, 'notice_to_leave_ground1_arrears.html');
    if (ntlGround1Doc.html) {
      fs.writeFileSync(ntlGround1Path, ntlGround1Doc.html);
      console.log(`   ✅ Notice to Leave (Ground 1) generated: ${ntlGround1Path}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error generating Notice to Leave (Ground 1): ${error.message}`);
  }

  // ============================================================================
  // 3. NOTICE TO LEAVE - GROUND 3 (ANTISOCIAL BEHAVIOUR)
  // ============================================================================
  console.log('\n3️⃣  Generating Notice to Leave - Ground 3 (Antisocial Behaviour)...');
  try {
    const noticeDate = new Date('2025-01-15');
    const earliestLeavingDate = calculateEarliestLeavingDate(noticeDate, 28);

    const ntlGround3Data = {
      // Landlord
      landlord_full_name: 'John Campbell',
      landlord_address: '456 George Street, Glasgow, G2 1QE',
      landlord_email: 'john.campbell@example.com',
      landlord_phone: '0141 234 5678',
      landlord_reg_number: '654321/220/54321',

      // Tenant
      tenant_full_name: 'Robert Wilson',

      // Property
      property_address: '78 Sauchiehall Street, Glasgow, G2 3DE',

      // Dates
      notice_date: '15 January 2025',
      earliest_leaving_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      earliest_tribunal_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      notice_period_days: 28 as 28 | 84,

      // Ground 3 - Antisocial behaviour
      ...buildGround3ASB({
        asbType: 'Noise nuisance and threatening behaviour',
        asbDescription:
          'The tenant has repeatedly played loud music late at night, causing disturbance to neighbours. On multiple occasions, the tenant has been verbally abusive and threatening towards neighbours who complained.',
        incidents: [
          {
            date: '5 November 2024',
            time: '11:30 PM',
            description: 'Loud music played until 2:00 AM. Multiple neighbour complaints. Police called.',
            witnesses: ['Mrs. Janet Brown (Flat 79)', 'Mr. David Smith (Flat 77)'],
          },
          {
            date: '20 November 2024',
            time: '10:00 PM',
            description:
              'Loud party with shouting and music until 3:00 AM. Tenant verbally abusive to neighbour who asked for quiet.',
            witnesses: ['Mrs. Janet Brown (Flat 79)', 'Police Constable Anderson'],
          },
          {
            date: '15 December 2024',
            time: '11:00 PM',
            description: 'Loud music and stamping. Threats made to neighbour. Police called again.',
            witnesses: ['Mrs. Janet Brown (Flat 79)', 'Mr. David Smith (Flat 77)'],
          },
          {
            date: '3 January 2025',
            time: '9:00 PM',
            description: 'Further noise disturbance and threatening language to multiple neighbours.',
            witnesses: ['Mrs. Janet Brown (Flat 79)', 'Ms. Sarah Lee (Flat 80)'],
          },
        ],
        policeInvolved: true,
        policeCrimeNumbers: ['SCO/2024/11/12345', 'SCO/2024/11/23456', 'SCO/2024/12/34567'],
        councilInvolved: true,
        councilName: 'Glasgow City Council',
        councilReference: 'ASB/2024/5678',
      }),

      // Deposit
      deposit_protected: true,
      deposit_amount: 1000,
      deposit_scheme: 'MyDeposits Scotland',

      // Council
      council_name: 'Glasgow City Council',
      council_phone: '0141 287 2000',
    };

    const ntlGround3Doc = await generateNoticeToLeave(ntlGround3Data, false, 'html');

    const ntlGround3Path = path.join(OUTPUT_DIR, 'notice_to_leave_ground3_asb.html');
    if (ntlGround3Doc.html) {
      fs.writeFileSync(ntlGround3Path, ntlGround3Doc.html);
      console.log(`   ✅ Notice to Leave (Ground 3) generated: ${ntlGround3Path}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error generating Notice to Leave (Ground 3): ${error.message}`);
  }

  // ============================================================================
  // 4. NOTICE TO LEAVE - GROUND 4 (LANDLORD INTENDS TO OCCUPY)
  // ============================================================================
  console.log('\n4️⃣  Generating Notice to Leave - Ground 4 (Landlord Intends to Occupy)...');
  try {
    const noticeDate = new Date('2025-01-15');
    const earliestLeavingDate = calculateEarliestLeavingDate(noticeDate, 84);

    const ntlGround4Data = {
      // Landlord
      landlord_full_name: 'Mary Stewart',
      landlord_address: '789 Perth Road, Dundee, DD1 4HN',
      landlord_email: 'mary.stewart@example.com',
      landlord_phone: '01382 123 456',
      landlord_reg_number: '789012/210/98765',

      // Tenant
      tenant_full_name: 'Emma Thompson',

      // Property
      property_address: '12 Nethergate, Dundee, DD1 4ER',

      // Dates
      notice_date: '15 January 2025',
      earliest_leaving_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      earliest_tribunal_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      notice_period_days: 84 as 28 | 84,

      // Ground 4 - Landlord intends to occupy
      ...buildGround4LandlordOccupy({
        reasonForOccupying:
          'I am relocating to Dundee for work and require the property as my principal home. My current employment contract in Aberdeen is ending and I have accepted a new position in Dundee starting 1 May 2025.',
        currentResidence: '45 Union Street, Aberdeen, AB10 1TP',
        occupationTimescale: '1 May 2025',
      }),

      // Deposit
      deposit_protected: true,
      deposit_amount: 1400,
      deposit_scheme: 'Letting Protection Service Scotland',

      // Council
      council_name: 'Dundee City Council',
      council_phone: '01382 434000',
    };

    const ntlGround4Doc = await generateNoticeToLeave(ntlGround4Data, false, 'html');

    const ntlGround4Path = path.join(OUTPUT_DIR, 'notice_to_leave_ground4_landlord_occupy.html');
    if (ntlGround4Doc.html) {
      fs.writeFileSync(ntlGround4Path, ntlGround4Doc.html);
      console.log(`   ✅ Notice to Leave (Ground 4) generated: ${ntlGround4Path}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error generating Notice to Leave (Ground 4): ${error.message}`);
  }

  // ============================================================================
  // 5. NOTICE TO LEAVE - GROUND 5 (LANDLORD INTENDS TO SELL)
  // ============================================================================
  console.log('\n5️⃣  Generating Notice to Leave - Ground 5 (Landlord Intends to Sell)...');
  try {
    const noticeDate = new Date('2025-01-15');
    const earliestLeavingDate = calculateEarliestLeavingDate(noticeDate, 84);

    const ntlGround5Data = {
      // Landlord
      landlord_full_name: 'Andrew Robertson',
      landlord_address: '321 High Street, Inverness, IV1 1HT',
      landlord_email: 'andrew.robertson@example.com',
      landlord_phone: '01463 234 567',
      landlord_reg_number: '456789/240/11111',

      // Tenant
      tenant_full_name: 'Sophie MacLeod',

      // Property
      property_address: '56 Church Street, Inverness, IV1 1DX',

      // Dates
      notice_date: '15 January 2025',
      earliest_leaving_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      earliest_tribunal_date: earliestLeavingDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      notice_period_days: 84 as 28 | 84,

      // Ground 5 - Landlord intends to sell
      ...buildGround5LandlordSell({
        saleIntentionDetails:
          'Due to financial circumstances and retirement planning, I need to sell the property to release equity. I have already instructed an estate agent and obtained a property valuation.',
        estateAgent: 'Highland Properties Ltd',
        estateAgentDate: '5 January 2025',
        marketingDetails:
          'Property will be marketed for sale immediately upon vacant possession. Professional photographs have been taken and marketing materials prepared.',
      }),

      // Deposit
      deposit_protected: true,
      deposit_amount: 1100,
      deposit_scheme: 'SafeDeposits Scotland',

      // Council
      council_name: 'Highland Council',
      council_phone: '01349 886606',
    };

    const ntlGround5Doc = await generateNoticeToLeave(ntlGround5Data, false, 'html');

    const ntlGround5Path = path.join(OUTPUT_DIR, 'notice_to_leave_ground5_landlord_sell.html');
    if (ntlGround5Doc.html) {
      fs.writeFileSync(ntlGround5Path, ntlGround5Doc.html);
      console.log(`   ✅ Notice to Leave (Ground 5) generated: ${ntlGround5Path}`);
    }
  } catch (error: any) {
    console.error(`   ❌ Error generating Notice to Leave (Ground 5): ${error.message}`);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ Scotland document generation test complete!');
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('='.repeat(60));
}

// Run the test
generateSamples().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
