import { NextResponse } from 'next/server';
import {
  createServerSupabaseClient,
  createAdminClient,
  tryGetServerUser,
} from '@/lib/supabase/server';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { CaseFacts } from '@/lib/case-facts/schema';
import { mapCaseFactsToMoneyClaimCase } from '@/lib/documents/money-claim-wizard-mapper';
import { generateMoneyClaimPack } from '@/lib/documents/money-claim-pack-generator';
import { deriveCanonicalJurisdiction, type CanonicalJurisdiction } from '@/lib/types/jurisdiction';
import { validateForGenerate } from '@/lib/validation/previewValidation';
import { evaluateRules, type MoneyClaimFacts } from '@/lib/validation/money-claim-rules-engine';
import JSZip from 'jszip';
import { assertPaidEntitlement } from '@/lib/payments/entitlement';

// If you have a proper Case row type somewhere, you can replace this `any`
type CaseRow = any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const user = await tryGetServerUser();

  const { caseId } = await params;

  // Step 2: Fetch case data
  let caseRow: CaseRow;
  try {
    const supabase = user ? await createServerSupabaseClient() : createAdminClient();
    let query = supabase
      .from('cases')
      .select('*')
      .eq('id', caseId);

    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.single();

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
          user_message: 'A supported jurisdiction is required to generate a money claim pack.',
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

    // Wales money claims are not supported (England only product)
    // Defense-in-depth: wizard start should block this, but enforce here too
    if (jurisdiction === 'wales') {
      return NextResponse.json(
        {
          code: 'WALES_MONEY_CLAIM_UNSUPPORTED',
          error: 'WALES_MONEY_CLAIM_UNSUPPORTED',
          user_message:
            'Money claims are only available in England. For Wales, please use the Notice Only product.',
          blocking_issues: [{
            code: 'WALES_MONEY_CLAIM_UNSUPPORTED',
            fields: ['jurisdiction'],
            user_fix_hint: 'Money claims are only available in England. Please use the Notice Only product for Wales.',
          }],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // Scotland money claims are not supported (England only product)
    // Defense-in-depth: wizard start should block this, but enforce here too
    if (jurisdiction === 'scotland') {
      return NextResponse.json(
        {
          code: 'SCOTLAND_MONEY_CLAIM_UNSUPPORTED',
          error: 'SCOTLAND_MONEY_CLAIM_UNSUPPORTED',
          user_message:
            'Money claims are only available in England. For Scotland, please use the Notice Only product.',
          blocking_issues: [{
            code: 'SCOTLAND_MONEY_CLAIM_UNSUPPORTED',
            fields: ['jurisdiction'],
            user_fix_hint: 'Money claims are only available in England. Please use the Notice Only product for Scotland.',
          }],
          warnings: [],
        },
        { status: 422 },
      );
    }

    // After Wales/Scotland/NI blocking above, only England reaches here
    await assertPaidEntitlement({ caseId, product: 'money_claim' });

    // ============================================================================
    // UNIFIED VALIDATION VIA REQUIREMENTS ENGINE
    // ============================================================================
    console.log('[MONEY-CLAIM-PACK] Running unified validation via validateForGenerate');
    const validationError = validateForGenerate({
      jurisdiction,
      product: 'money_claim',
      route: 'money_claim',
      facts: wizardFacts,
      caseId,
    });

    if (validationError) {
      console.warn('[MONEY-CLAIM-PACK] Unified validation blocked pack generation:', {
        case_id: caseId,
      });
      return validationError; // Already a NextResponse with standardized 422 payload
    }

    // ============================================================================
    // MONEY CLAIM RULES ENGINE VALIDATION (England only)
    // ============================================================================
    if (jurisdiction === 'england') {
      console.log('[MONEY-CLAIM-PACK] Running rules engine validation');
      const rulesResult = evaluateRules(wizardFacts as MoneyClaimFacts);

      if (!rulesResult.isValid) {
        console.warn('[MONEY-CLAIM-PACK] Rules engine blocked pack generation:', {
          case_id: caseId,
          blockers: rulesResult.blockers.length,
        });

        return NextResponse.json(
          {
            code: 'MONEY_CLAIM_VALIDATION_FAILED',
            error: 'Case validation failed',
            user_message: 'Please complete all required fields before generating your pack.',
            blocking_issues: rulesResult.blockers.map((b) => ({
              code: b.id,
              severity: 'blocker',
              fields: b.field ? [b.field] : [],
              user_fix_hint: b.message,
              internal_reason: b.rationale,
            })),
            warnings: rulesResult.warnings.map((w) => ({
              code: w.id,
              severity: 'warning',
              fields: w.field ? [w.field] : [],
              user_fix_hint: w.message,
              internal_reason: w.rationale,
            })),
          },
          { status: 422 }
        );
      }

      // Log warnings but don't block
      if (rulesResult.warnings.length > 0) {
        console.log('[MONEY-CLAIM-PACK] Rules engine warnings:', {
          case_id: caseId,
          warnings: rulesResult.warnings.length,
        });
      }
    }

    caseFacts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;
    moneyClaimCase = mapCaseFactsToMoneyClaimCase(caseFacts);
  } catch (mapError) {
    if (mapError instanceof Response) {
      return mapError;
    }
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
      { error: 'Failed to generate case bundle. Please try again or contact support.' },
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
