/**
 * Wizard API - Start
 *
 * POST /api/wizard/start
 * Creates a new case and initiates the wizard flow
 * ALLOWS ANONYMOUS ACCESS - Users can try wizard before signing up
 */

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const startWizardSchema = z.object({
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement']).optional(),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
  product: z.enum(['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement']).optional(),
});

export async function POST(request: Request) {
  try {
    // Get user if logged in (but don't require it)
    const user = await getServerUser();
    const body = await request.json();
    const url = new URL(request.url);

    // Validate input
    const validationResult = startWizardSchema.safeParse({
      ...body,
      product: body.product ?? url.searchParams.get('product') ?? undefined,
    });
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { jurisdiction } = validationResult.data;
    const requestedProduct = validationResult.data.product;
    const productFromQuery = url.searchParams.get('product');

    const product = (requestedProduct || productFromQuery) as
      | 'notice_only'
      | 'complete_pack'
      | 'money_claim'
      | 'tenancy_agreement'
      | null;

    const resolvedProduct =
      product && ['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'].includes(product)
        ? product
        : null;

    const resolvedCaseType = (() => {
      switch (resolvedProduct) {
        case 'notice_only':
        case 'complete_pack':
          return 'eviction' as const;
        case 'money_claim':
          return 'money_claim' as const;
        case 'tenancy_agreement':
          return 'tenancy_agreement' as const;
        default:
          return validationResult.data.case_type || null;
      }
    })();

    if (!resolvedCaseType) {
      return NextResponse.json(
        { error: 'Invalid case_type or product' },
        { status: 400 }
      );
    }

    if (jurisdiction === 'northern-ireland' && resolvedCaseType !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          error: 'Eviction and money claim workflows are not supported in Northern Ireland',
        },
        { status: 400 }
      );
    }

    if (resolvedCaseType === 'money_claim' && jurisdiction === 'northern-ireland') {
      return NextResponse.json(
        {
          error: 'Money claim workflows are not available in Northern Ireland.',
        },
        { status: 400 }
      );
    }
    const supabase = await createServerSupabaseClient();

    // Create new case (user_id can be null for anonymous users)
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        user_id: user?.id || null,
        case_type: resolvedCaseType,
        jurisdiction,
        status: 'in_progress',
        wizard_progress: 0,
        collected_facts: {
          __meta: {
            product: resolvedProduct ?? 'legacy',
            mqs_version: null,
          },
        },
      })
      .select()
      .single();

    if (caseError) {
      console.error('Failed to create case:', caseError);
      return NextResponse.json(
        { error: 'Failed to create case' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: newCase,
        message: 'Case created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Start wizard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
