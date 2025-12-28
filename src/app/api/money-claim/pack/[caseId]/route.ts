import { NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  requireServerAuth,
} from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';
import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';
import JSZip from 'jszip';

// If you have a proper Case row type somewhere, you can replace this `any`
type CaseRow = any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  // Step 1: Check authentication
  let user;
  try {
    user = await requireServerAuth();
  } catch (authError) {
    console.error('Money claim pack auth error:', authError);
    return NextResponse.json(
      { error: 'Please sign in to generate your money claim pack' },
      { status: 401 }
    );
  }

  const { caseId } = await params;

  // Step 2: Fetch case data
  let caseRow: CaseRow;
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Money claim case not found:', error);
      return NextResponse.json(
        { error: 'Case not found. Please ensure you have saved your case.' },
        { status: 404 }
      );
    }

    caseRow = data;
  } catch (dbError) {
    console.error('Money claim database error:', dbError);
    return NextResponse.json(
      { error: 'Unable to load case data. Please try again.' },
      { status: 500 }
    );
  }

  // Step 3: Transform wizard facts to case facts
  let caseFacts: CaseFacts;
  let moneyClaimCase;
  try {
    const wizardFacts =
      caseRow.wizard_facts ||
      caseRow.collected_facts ||
      caseRow.facts ||
      caseRow.case_facts ||
      {};

    if (!wizardFacts || Object.keys(wizardFacts).length === 0) {
      return NextResponse.json(
        { error: 'No case data found. Please complete the wizard first.' },
        { status: 400 }
      );
    }

    caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;
    moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);
  } catch (mapError) {
    console.error('Money claim data mapping error:', mapError);
    return NextResponse.json(
      { error: 'Unable to process case data. Please check all required fields are filled.' },
      { status: 400 }
    );
  }

  // Step 4: Generate the pack
  let pack;
  try {
    // Pass caseFacts to enable AI drafting of LBA, PoC, and Evidence Index
    pack = await generateMoneyClaimPack(moneyClaimCase, caseFacts);
  } catch (genError) {
    console.error('Money claim pack generation error:', genError);
    return NextResponse.json(
      { error: 'Failed to generate documents. Please try again or contact support.' },
      { status: 500 }
    );
  }

  // Step 5: Create ZIP file
  try {
    const zip = new JSZip();
    const root = zip.folder('Money-Claim-Premium')!;

    for (const doc of pack.documents) {
      // If your generator already sets a `folder` property, honour it
      let folder: string;

      if ((doc as any).folder) {
        folder = (doc as any).folder;
      } else {
        // Fallback based on category + title
        switch (doc.category) {
          case 'court_form':
          case 'particulars':
          case 'schedule':
            folder = 'Claim-Pack';
            break;
          case 'evidence':
            folder = 'Claim-Pack';
            break;
          case 'guidance': {
            const title = (doc.title || '').toLowerCase();
            if (
              title.includes('letter before') ||
              title.includes('pap') ||
              title.includes('pre-action')
            ) {
              folder = 'Pre-Action-Protocol';
            } else if (
              title.includes('what happens next') ||
              title.includes('enforcement') ||
              title.includes('risk') ||
              title.includes('askheaven')
            ) {
              folder = 'Post-Issue';
            } else {
              folder = 'Claim-Pack';
            }
            break;
          }
          default:
            folder = 'Claim-Pack';
        }
      }

      const fileName = doc.file_name || `${doc.title}.pdf`;
      const path = `${folder}/${fileName}`;

      if (doc.pdf) {
        root.file(path, doc.pdf);
      } else if (doc.html) {
        root.file(path.replace(/\.pdf$/, '.html'), doc.html);
      }
    }

    // Generate as ArrayBuffer – TS is happy and Response accepts it
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="money-claim-${caseId}.zip"`,
      },
    });
  } catch (zipError) {
    console.error('Money claim ZIP creation error:', zipError);
    return NextResponse.json(
      { error: 'Failed to create download package. Please try again.' },
      { status: 500 }
    );
  }
}
