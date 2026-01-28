/**
 * Order By Session API
 *
 * GET /api/orders/by-session?session_id=...
 *
 * Resolves a Stripe session ID to an order and its associated case.
 * Used for dashboard fallback redirect handling.
 */

import { requireServerAuth } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export interface OrderBySessionResponse {
  found: boolean;
  paid: boolean;
  case_id?: string;
  product?: string;
  order_id?: string;
}

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const adminClient = createSupabaseAdminClient();

    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Find order by stripe_session_id
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, case_id, product_type, payment_status, user_id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (orderError || !order) {
      // Not found is not an error - just return found: false
      return NextResponse.json(
        {
          found: false,
          paid: false,
        } as OrderBySessionResponse,
        { status: 200 }
      );
    }

    // Verify the order belongs to the current user
    if (order.user_id !== user.id) {
      return NextResponse.json(
        {
          found: false,
          paid: false,
        } as OrderBySessionResponse,
        { status: 200 }
      );
    }

    const response: OrderBySessionResponse = {
      found: true,
      paid: order.payment_status === 'paid',
      case_id: order.case_id || undefined,
      product: order.product_type || undefined,
      order_id: order.id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Order by-session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
