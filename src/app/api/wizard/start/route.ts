/**
 * Wizard API - Start or resume a wizard flow
 *
 * POST /api/wizard/start
 * Creates or resumes a case and returns the first MQS question
 * ALLOWS ANONYMOUS ACCESS - Users can try wizard before signing up
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { createEmptyCaseFacts } from '@/lib/case-facts/schema';
import { getOrCreateCaseFacts } from '@/lib/case-facts/store';
import { getNextMQSQuestion, loadMQS, type MasterQuestionSet, type ProductType } from '@/lib/wizard/mqs-loader';

const startWizardSchema = z.object({
  product: z.enum(['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
  case_id: z.string().uuid().optional(),
});

const productToCaseType = (product: ProductType) => {
  switch (product) {
    case 'notice_only':
    case 'complete_pack':
      return 'eviction';
    case 'money_claim':
      return 'money_claim';
    case 'tenancy_agreement':
      return 'tenancy_agreement';
    default:
      return null;
  }
};

function loadMQSOrError(product: ProductType, jurisdiction: string): MasterQuestionSet | null {
  const mqs = loadMQS(product, jurisdiction);
  return mqs;
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();
    const body = await request.json();
    const validationResult = startWizardSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { product, jurisdiction, case_id } = validationResult.data;
    const resolvedCaseType = productToCaseType(product);

    if (!resolvedCaseType) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const supabaseClient = supabase as unknown as SupabaseClient;

    let caseRecord: any = null;

    if (case_id) {
      let query = supabase.from('cases').select('*').eq('id', case_id);
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.single();
      if (error || !data) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      if (data.case_type !== resolvedCaseType || data.jurisdiction !== jurisdiction) {
        return NextResponse.json(
          { error: 'Case does not match requested product or jurisdiction' },
          { status: 400 }
        );
      }

      caseRecord = data;
    } else {
      const emptyFacts = createEmptyCaseFacts();
      const { data, error } = await supabase
        .from('cases')
        .insert({
          user_id: user?.id ?? null,
          case_type: resolvedCaseType,
          jurisdiction,
          status: 'in_progress',
          wizard_progress: 0,
          collected_facts: { ...emptyFacts, __meta: { product } } as any,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to create case:', error);
        return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
      }

      caseRecord = data;
    }

    const facts = await getOrCreateCaseFacts(supabaseClient, caseRecord.id);
    const mqs = loadMQSOrError(product, jurisdiction);

    if (!mqs) {
      return NextResponse.json(
        { error: 'MQS not implemented for this jurisdiction yet' },
        { status: 400 }
      );
    }

    const nextQuestion = getNextMQSQuestion(mqs, facts);
    const isComplete = !nextQuestion;

    return NextResponse.json({
      case_id: caseRecord.id,
      product,
      jurisdiction,
      next_question: nextQuestion,
      is_complete: isComplete,
    });
  } catch (error: any) {
    console.error('Start wizard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateCaseFacts } from "@/lib/case-facts/store";
import { loadMQSFor } from "@/lib/mqs/loader";
import { getNextMQSQuestion } from "@/lib/mqs/engine";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();

    const { product, jurisdiction, case_id } = body;

    if (!product || !jurisdiction) {
      return NextResponse.json(
        { error: "product and jurisdiction are required" },
        { status: 400 }
      );
    }

    let caseRow;

    // -----------------------------------------
    // 1. Load or create the case
    // -----------------------------------------

    if (case_id) {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("id", case_id)
        .single();

      if (error || !data)
        return NextResponse.json(
          { error: "Case not found" },
          { status: 404 }
        );

      caseRow = data;
    } else {
      const user = await supabase.auth.getUser();
      const userId = user?.data?.user?.id ?? null;

      const { data, error } = await supabase
        .from("cases")
        .insert({
          user_id: userId,
          case_type: "eviction", // TODO: derive from product
          jurisdiction,
          status: "in_progress",
          wizard_progress: 0,
        })
        .select("*")
        .single();

      if (error)
        return NextResponse.json(
          { error: "Failed to create case", details: error },
          { status: 400 }
        );

      caseRow = data;
    }

    // -----------------------------------------
    // 2. Ensure case_facts row exists
    // -----------------------------------------
    const caseFacts = await getOrCreateCaseFacts(supabase, caseRow.id);

    // -----------------------------------------
    // 3. Load the correct MQS YAML
    // -----------------------------------------
    const mqs = await loadMQSFor(product, jurisdiction);
    if (!mqs) {
      return NextResponse.json(
        { error: `MQS not implemented for ${product}/${jurisdiction}` },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 4. Compute the first question
    // -----------------------------------------
    const nextQuestion = getNextMQSQuestion(mqs, caseFacts);

    return NextResponse.json({
      success: true,
      case_id: caseRow.id,
      case: caseRow,
      next_question: nextQuestion || null,
      is_complete: !nextQuestion,
    });
  } catch (err) {
    console.error("Wizard start error", err);
    return NextResponse.json(
      { error: "Server error", details: err },
      { status: 500 }
    );
  }
}
