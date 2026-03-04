/**
 * Wizard API - Get Case
 *
 * GET /api/wizard/case/[caseId]
 * Retrieves a specific case by ID
 * ALLOWS ANONYMOUS ACCESS - Users can access their anonymous cases
 */

import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { getCasePaymentStatus } from '@/lib/payments/entitlement';
import { assertCaseReadAccess } from '@/lib/auth/case-access';

type RouteParams = { id: string };

export async function GET(
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) {
  try {
    const { id: caseId } = await context.params;

    // Use admin client to bypass RLS - we do our own access control below
    const adminSupabase = createAdminClient();

    // Try to get a user, but don't fail if unauthenticated
    const user = await getServerUser();

    // Fetch the case using admin client (bypasses RLS)
    const { data: caseData, error } = await adminSupabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !caseData) {
      console.error('Case not found:', { error, caseId });
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Type assertion for the case record properties we need
    const caseRecord = caseData as {
      id: string;
      user_id: string | null;
      session_token?: string | null;
      [key: string]: unknown;
    };
    const accessError = assertCaseReadAccess({ request, user, caseRow: caseRecord });
    if (accessError) return accessError;

    const paymentStatus = await getCasePaymentStatus(caseId);
    const purchasedProduct = paymentStatus.latestOrder?.product_type || null;

    const hydratedCase = {
      ...caseData,
      collected_facts: paymentStatus.hasPaidOrder
        ? {
            ...(caseData as any).collected_facts,
            __meta: {
              ...(((caseData as any).collected_facts || {}).__meta || {}),
              purchased_product: purchasedProduct,
              entitlements: paymentStatus.paidProducts,
            },
          }
        : (caseData as any).collected_facts,
    };

    return NextResponse.json(
      {
        success: true,
        case: hydratedCase,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
