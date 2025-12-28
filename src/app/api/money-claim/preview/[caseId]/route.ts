import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';
import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { validateForPreview } from '@/lib/validation/previewValidation';

type CaseRow = any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    const supabase = await createServerSupabaseClient();

    // Try to get the current user (but allow anonymous access)
    const { data: { user } } = await supabase.auth.getUser();

    // Build query to allow viewing own cases or anonymous cases
    let query = supabase
      .from('cases')
      .select('*')
      .eq('id', caseId);

    // If logged in, allow viewing owned cases or anonymous cases
    if (user) {
      query = query.or(`user_id.eq.${user.id},user_id.is.null`);
    } else {
      // If not logged in, only allow viewing anonymous cases
      query = query.is('user_id', null);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      console.error('Money claim preview case not found:', error);
      return new Response(JSON.stringify({ error: 'Case not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    const caseRow = data as CaseRow;

    const wizardFacts =
      caseRow.wizard_facts ||
      caseRow.collected_facts ||
      caseRow.facts ||
      caseRow.case_facts ||
      {};

    // ============================================================================
    // JURISDICTION VALIDATION & NI BLOCKING
    // ============================================================================
    const jurisdiction = deriveCanonicalJurisdiction(
      caseRow.jurisdiction,
      wizardFacts,
    ) as CanonicalJurisdiction | undefined;

    if (!jurisdiction) {
      return NextResponse.json(
        {
          code: 'INVALID_JURISDICTION',
          error: 'Invalid or missing jurisdiction',
          user_message: 'A supported jurisdiction is required to generate a money claim preview.',
          blocking_issues: [],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // NI money claims are not supported
    if (jurisdiction === 'northern-ireland') {
      return NextResponse.json(
        {
          code: 'NI_MONEY_CLAIM_UNSUPPORTED',
          error: 'NI_MONEY_CLAIM_UNSUPPORTED',
          user_message:
            'Money claims are not supported in Northern Ireland. Tenancy agreements remain available.',
          blocking_issues: [{
            code: 'NI_MONEY_CLAIM_UNSUPPORTED',
            fields: ['jurisdiction'],
            user_fix_hint: 'Money claims are not available in Northern Ireland. Only tenancy agreements are currently supported.',
          }],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // ============================================================================
    // UNIFIED VALIDATION VIA REQUIREMENTS ENGINE
    // ============================================================================
    console.log('[MONEY-CLAIM-PREVIEW] Running unified validation via validateForPreview');
    const validationError = validateForPreview({
      jurisdiction,
      product: 'money_claim',
      route: 'money_claim',
      facts: wizardFacts,
      caseId,
    });

    if (validationError) {
      console.warn('[MONEY-CLAIM-PREVIEW] Unified validation blocked preview:', {
        case_id: caseId,
      });
      return validationError; // Already a NextResponse with standardized 422 payload
    }

    const caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;
    const moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);

    // 🔮 This calls the full pack generator, which now includes AskHeaven AI drafting
    const pack = await generateMoneyClaimPack(moneyClaimCase);

    const allDocs = pack.documents || [];

    // Helpful dev log – you can delete this once you're happy
    console.log(
      'Money claim preview docs:',
      allDocs.map((d: any) => d.title)
    );

    // Try to pick out LBA + PoC by title (case-insensitive, substring-friendly)
    let importantDocs = allDocs.filter((doc: any) => {
      const title = (doc.title || '').toLowerCase();
      return (
        title.includes('letter before') ||
        title.includes('letter of claim') ||
        title.includes('particulars of claim') ||
        title.includes('simple procedure particulars')
      );
    });

    // Fallback: if nothing matched, just show the first 2–3 documents
    if (importantDocs.length === 0) {
      importantDocs = allDocs.slice(0, 3);
    }

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

    if (importantDocs.length === 0) {
      chunks.push(
        `<p style="font-size: 13px; color: #b91c1c; margin-top: 16px;">No previewable documents were found in this pack. Please check the pack configuration.</p>`
      );
    } else {
      for (const doc of importantDocs) {
        const rawHtml = doc.html?.toString() || '';
        const html =
          rawHtml.trim().length === 0
            ? `<p style="font-size: 13px; color: #6b7280;">No HTML preview is available for <strong>${doc.title}</strong> (this document may only exist as a PDF).</p>`
            : rawHtml;

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
    }

    chunks.push(
      `<p style="margin-top: 24px; font-size: 12px; color: #6b7280;">This is a preview only. The full pack contains court-ready PDFs and a complete evidence bundle.</p>`
    );
    chunks.push(`</body></html>`);

    const htmlResponse = chunks.join('\n');

    return new Response(htmlResponse, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err) {
    console.error('Money claim preview error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to generate money claim preview' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      }
    );
  }
}
