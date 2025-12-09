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
  { params }: { params: { caseId: string } }
) {
  try {
    const user = await requireServerAuth();
    const { caseId } = params;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      console.error('Money claim case not found:', error);
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const caseRow = data as CaseRow;

    const wizardFacts =
      caseRow.wizard_facts ||
      caseRow.collected_facts ||
      caseRow.facts ||
      caseRow.case_facts ||
      {};

    const caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;
    const moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);

    // Pass caseFacts to enable AI drafting of LBA, PoC, and Evidence Index
    const pack = await generateMoneyClaimPack(moneyClaimCase, caseFacts);

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

    // ✅ Generate as ArrayBuffer instead of Uint8Array – TS is happy and Response accepts it
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="money-claim-${caseId}.zip"`,
      },
    });
  } catch (err) {
    console.error('Money claim pack generation error:', err);
    return NextResponse.json(
      { error: 'Failed to generate money claim pack' },
      { status: 500 }
    );
  }
}
