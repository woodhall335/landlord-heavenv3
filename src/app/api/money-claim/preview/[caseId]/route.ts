import { NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  requireServerAuth,
} from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';
import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';

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
      console.error('Money claim preview case not found:', error);
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

    // Optionally you could have a lighter generator for preview, but using the same is fine.
    const pack = await generateMoneyClaimPack(moneyClaimCase);

    // Pick a couple of key docs for preview (e.g. LBA + PoC)
    const importantDocs = pack.documents.filter((doc) =>
      ['Letter Before Action', 'Particulars of Claim'].includes(doc.title)
    );

    const chunks: string[] = [];

    chunks.push(
      `<html><head><title>Money claim preview</title></head><body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; padding: 24px;">`
    );
    chunks.push(
      `<h1 style="font-size: 20px; margin-bottom: 8px;">Money claim preview</h1>`
    );
    chunks.push(
      `<p style="font-size: 13px; color: #4b5563;">Showing a short preview of your Letter Before Action and Particulars of Claim. The full pack will include pre-action documents, court forms, a Schedule of Loss, an Evidence Index and post-issue guidance.</p>`
    );

    for (const doc of importantDocs) {
      const html = doc.html?.toString() || '';
      const trimmed =
        html.length > 5000
          ? html.slice(0, 5000) + '\n\n… (preview truncated)'
          : html;

      chunks.push(
        `<hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />`
      );
      chunks.push(
        `<h2 style="font-size: 16px; margin-bottom: 6px;">${doc.title}</h2>`
      );
      chunks.push(
        `<div style="font-size: 13px; color: #111827; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; background: #f9fafb;">${trimmed}</div>`
      );
    }

    chunks.push(
      `<p style="margin-top: 24px; font-size: 12px; color: #6b7280;">This is a preview only. The full pack contains court-ready PDFs and a complete evidence bundle.</p>`
    );
    chunks.push(`</body></html>`);

    const htmlResponse = chunks.join('\n');

    return new NextResponse(htmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (err) {
    console.error('Money claim preview error:', err);
    return NextResponse.json(
      { error: 'Failed to generate money claim preview' },
      { status: 500 }
    );
  }
}
