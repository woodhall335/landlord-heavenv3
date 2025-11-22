/**
 * Admin API - User Details
 *
 * GET /api/admin/users/[id] - Get specific user details
 * PUT /api/admin/users/[id] - Update user (admin only)
 */

import { createAdminClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

async function requireAdmin(userId: string) {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (!adminIds.includes(userId)) {
    throw new Error('Unauthorized - Admin access required');
  }
}

/**
 * GET - Fetch detailed user information
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    await requireAdmin(user.id);

    const { id: targetUserId } = await params;
    const supabase = createAdminClient();

    // Fetch user
    const { data: targetUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (error || !targetUser) {
      console.error('User not found:', error);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch related data
    const [
      { data: cases },
      { data: orders },
      { data: documents },
      { data: properties },
    ] = await Promise.all([
      supabase.from('cases').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }),
      supabase.from('orders').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }),
      supabase.from('documents').select('*').eq('user_id', targetUserId).order('created_at', { ascending: false }),
      supabase.from('hmo_properties').select('*').eq('user_id', targetUserId),
    ]);

    // Calculate revenue
    const totalRevenue = orders
      ?.filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + parseFloat(String(o.total_amount || 0)), 0) || 0;

    return NextResponse.json(
      {
        success: true,
        user: {
          ...targetUser,
          cases: cases || [],
          orders: orders || [],
          documents: documents || [],
          properties: properties || [],
          stats: {
            total_cases: cases?.length || 0,
            total_orders: orders?.length || 0,
            total_revenue: totalRevenue,
            total_documents: documents?.length || 0,
            total_properties: properties?.length || 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in' || error.message === 'Unauthorized - Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Admin user detail error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for admin user updates
const updateUserSchema = z.object({
  hmo_pro_active: z.boolean().optional(),
  hmo_pro_tier: z.string().optional(),
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

/**
 * PUT - Update user (admin override)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    await requireAdmin(user.id);

    const { id: targetUserId } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;
    const supabase = createAdminClient();

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
        message: 'User updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in' || error.message === 'Unauthorized - Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    console.error('Admin update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
