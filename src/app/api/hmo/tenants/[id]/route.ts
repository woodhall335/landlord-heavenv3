/**
 * HMO Tenants API - Specific Tenant Operations
 *
 * GET /api/hmo/tenants/[id] - Get specific tenant
 * PUT /api/hmo/tenants/[id] - Update tenant
 * DELETE /api/hmo/tenants/[id] - Delete tenant
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { HMO_PRO_DISABLED_RESPONSE, HMO_PRO_ENABLED } from '@/lib/feature-flags';

/**
 * GET - Fetch specific tenant by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!HMO_PRO_ENABLED) {
      return NextResponse.json(HMO_PRO_DISABLED_RESPONSE, { status: 403 });
    }

    const user = await requireServerAuth();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Check HMO Pro access
    const { data: userData } = await supabase
      .from('users')
      .select('hmo_pro_active')
      .eq('id', user.id)
      .single();

    if (!userData?.hmo_pro_active) {
      return NextResponse.json(
        { error: 'HMO Pro subscription required' },
        { status: 403 }
      );
    }

    // Fetch tenant with property details
    const { data: tenant, error } = await supabase
      .from('hmo_tenants')
      .select('*, hmo_properties(*)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !tenant) {
      console.error('Tenant not found:', error);
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        tenant,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Get tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for tenant updates
const updateTenantSchema = z.object({
  full_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  room_number: z.string().optional(),
  move_in_date: z.string().optional(),
  tenancy_end_date: z.string().optional(),
  move_out_date: z.string().optional(),
  monthly_rent: z.number().min(0).optional(),
  deposit_amount: z.number().min(0).optional(),
  deposit_protected: z.boolean().optional(),
  deposit_scheme: z.enum(['DPS', 'TDS', 'MyDeposits']).optional(),
  tenancy_status: z.enum(['active', 'notice_given', 'ended']).optional(),
});

/**
 * PUT - Update tenant
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!HMO_PRO_ENABLED) {
      return NextResponse.json(HMO_PRO_DISABLED_RESPONSE, { status: 403 });
    }

    const user = await requireServerAuth();
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    // Check HMO Pro access
    const { data: userData } = await supabase
      .from('users')
      .select('hmo_pro_active')
      .eq('id', user.id)
      .single();

    if (!userData?.hmo_pro_active) {
      return NextResponse.json(
        { error: 'HMO Pro subscription required' },
        { status: 403 }
      );
    }

    // Validate input
    const validationResult = updateTenantSchema.safeParse(body);
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

    // Verify tenant ownership
    const { data: existingTenant, error: fetchError } = await supabase
      .from('hmo_tenants')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingTenant) {
      console.error('Tenant not found:', fetchError);
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Update tenant
    const { data: updatedTenant, error: updateError } = await supabase
      .from('hmo_tenants')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update tenant:', updateError);
      return NextResponse.json(
        { error: 'Failed to update tenant' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        tenant: updatedTenant,
        message: 'Tenant updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Update tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete tenant
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!HMO_PRO_ENABLED) {
      return NextResponse.json(HMO_PRO_DISABLED_RESPONSE, { status: 403 });
    }

    const user = await requireServerAuth();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Check HMO Pro access
    const { data: userData } = await supabase
      .from('users')
      .select('hmo_pro_active')
      .eq('id', user.id)
      .single();

    if (!userData?.hmo_pro_active) {
      return NextResponse.json(
        { error: 'HMO Pro subscription required' },
        { status: 403 }
      );
    }

    // Verify tenant ownership
    const { data: existingTenant, error: fetchError } = await supabase
      .from('hmo_tenants')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingTenant) {
      console.error('Tenant not found:', fetchError);
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Delete tenant
    const { error: deleteError } = await supabase
      .from('hmo_tenants')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete tenant:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete tenant' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Tenant deleted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Delete tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
