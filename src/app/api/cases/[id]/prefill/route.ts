import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { createEmptyWizardFacts } from '@/lib/case-facts/schema';
import { buildPrefilledFacts, type PrefillProduct } from '@/lib/cases/prefill';
import { isValidProductSku } from '@/lib/pricing/products';
import { isResidentialLettingProductSku } from '@/lib/residential-letting/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function resolveCaseType(destinationProduct: string): 'eviction' | 'money_claim' | 'tenancy_agreement' | 'rent_increase' {
  if (destinationProduct === 'notice_only' || destinationProduct === 'complete_pack') {
    return 'eviction';
  }
  if (destinationProduct === 'money_claim') {
    return 'money_claim';
  }
  if (destinationProduct === 'section13_standard' || destinationProduct === 'section13_defensive') {
    return 'rent_increase';
  }
  return 'tenancy_agreement';
}

function inferSourceProduct(sourceFacts: Record<string, unknown>, fallback: string | null): PrefillProduct | null {
  const meta = (sourceFacts.__meta || {}) as Record<string, unknown>;
  const candidates = [
    meta.product,
    meta.canonical_product,
    meta.original_product,
    fallback,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && isValidProductSku(candidate)) {
      return candidate as PrefillProduct;
    }
  }

  return null;
}

function getWizardRedirectUrl(request: NextRequest, destinationProduct: string, caseId: string): URL {
  const caseType = resolveCaseType(destinationProduct);
  const redirectUrl = new URL('/wizard/flow', request.url);
  redirectUrl.searchParams.set('type', caseType);
  redirectUrl.searchParams.set('product', destinationProduct);
  redirectUrl.searchParams.set('jurisdiction', 'england');
  redirectUrl.searchParams.set('case_id', caseId);
  redirectUrl.searchParams.set('prefilled', '1');
  redirectUrl.searchParams.set('src', 'dashboard_prefill');
  return redirectUrl;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireServerAuth();
    const { id: sourceCaseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const destinationProduct = searchParams.get('destination_product') || searchParams.get('product');
    const prefillTrigger = searchParams.get('prefill_trigger') || 'dashboard_related_product';

    if (!destinationProduct || !isValidProductSku(destinationProduct)) {
      return NextResponse.json({ error: 'Valid destination_product is required' }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { data: sourceCase, error: sourceError } = await adminSupabase
      .from('cases')
      .select('id,user_id,case_type,jurisdiction,collected_facts')
      .eq('id', sourceCaseId)
      .eq('user_id', user.id)
      .single();

    if (sourceError || !sourceCase) {
      return NextResponse.json({ error: 'Source case not found' }, { status: 404 });
    }

    const { data: latestOrder } = await adminSupabase
      .from('orders')
      .select('product_type')
      .eq('case_id', sourceCaseId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const sourceFacts = ((sourceCase as any).collected_facts || {}) as Record<string, unknown>;
    const sourceProduct = inferSourceProduct(sourceFacts, (latestOrder as any)?.product_type || null);

    if (!sourceProduct) {
      return NextResponse.json({ error: 'Unable to infer source product for prefill' }, { status: 400 });
    }

    const { destinationFacts, mappedFields } = buildPrefilledFacts({
      sourceCaseId,
      sourceProduct,
      destinationProduct: destinationProduct as PrefillProduct,
      prefillTrigger,
      sourceFacts,
    });

    if (mappedFields.length === 0) {
      return NextResponse.json(
        { error: 'No safe prefill mapping exists for this product path' },
        { status: 409 },
      );
    }

    const resolvedCaseType = resolveCaseType(destinationProduct);
    const emptyFacts = createEmptyWizardFacts();
    const initialFacts = {
      ...emptyFacts,
      ...destinationFacts,
      __meta: {
        ...((emptyFacts as any).__meta || {}),
        ...(destinationFacts.__meta as Record<string, unknown>),
        mqs_product:
          resolvedCaseType === 'rent_increase'
            ? 'rent_increase'
            : resolvedCaseType === 'tenancy_agreement'
              ? 'tenancy_agreement'
              : destinationProduct,
        ...(isResidentialLettingProductSku(destinationProduct)
          ? { product_tier: destinationProduct }
          : {}),
      },
    };

    const { data: createdCase, error: createError } = await adminSupabase
      .from('cases')
      .insert({
        user_id: user.id,
        case_type: resolvedCaseType,
        jurisdiction: 'england',
        status: 'in_progress',
        wizard_progress: 0,
        collected_facts: initialFacts as any,
      } as any)
      .select('id')
      .single();

    if (createError || !createdCase) {
      console.error('Failed to create prefilled case:', createError);
      return NextResponse.json({ error: 'Failed to create prefilled case' }, { status: 500 });
    }

    await adminSupabase
      .from('case_facts')
      .insert({
        case_id: (createdCase as any).id,
        facts: initialFacts as any,
        version: 1,
      } as any);

    return NextResponse.redirect(
      getWizardRedirectUrl(request, destinationProduct, (createdCase as any).id),
      303,
    );
  } catch (error: any) {
    if (error?.message === 'Unauthorized - Please log in') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('Case prefill error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
