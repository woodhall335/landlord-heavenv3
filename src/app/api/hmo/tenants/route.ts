/**
 * HMO Tenants API - List & Create
 *
 * GET /api/hmo/tenants - List all tenants
 * POST /api/hmo/tenants - Create new tenant
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET - List all tenants for authenticated user
 */
export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    const { searchParams } = new URL(request.url);
    const supabase = await createServerSupabaseClient();

    // Check if user has HMO Pro access
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

    // Optional filters
    const propertyId = searchParams.get('property_id');
    const tenancyStatus = searchParams.get('tenancy_status');

    // Build query
    let query = supabase
      .from('hmo_tenants')
      .select('*, hmo_properties(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    if (tenancyStatus) {
      query = query.eq('tenancy_status', tenancyStatus);
    }

    const { data: tenants, error } = await query;

    if (error) {
      console.error('Failed to fetch tenants:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenants' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: tenants?.length || 0,
      active: tenants?.filter((t) => (t as any).tenancy_status === 'active').length || 0,
      notice_given: tenants?.filter((t) => (t as any).tenancy_status === 'notice_given').length || 0,
      ended: tenants?.filter((t) => (t as any).tenancy_status === 'ended').length || 0,
      total_monthly_rent: tenants
        ?.filter((t) => (t as any).tenancy_status === 'active')
        .reduce((sum, t) => sum + parseFloat(String((t as any).monthly_rent || 0)), 0) || 0,
    };

    return NextResponse.json(
      {
        success: true,
        tenants: tenants || [],
        stats,
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

    console.error('List tenants error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for tenant creation
const createTenantSchema = z.object({
  property_id: z.string().uuid(),
  full_name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  room_number: z.string().optional(),
  move_in_date: z.string(),
  tenancy_end_date: z.string().optional(),
  move_out_date: z.string().optional(),
  monthly_rent: z.number().min(0),
  deposit_amount: z.number().min(0).optional(),
  deposit_protected: z.boolean().optional(),
  deposit_scheme: z.enum(['DPS', 'TDS', 'MyDeposits']).optional(),
  tenancy_status: z.enum(['active', 'notice_given', 'ended']).optional(),
});

/**
 * POST - Create new tenant
 */
export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();
    const supabase = await createServerSupabaseClient();

    // Check if user has HMO Pro access
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
    const validationResult = createTenantSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const tenantData = validationResult.data;

    // Verify property exists and belongs to user
    const { data: property, error: propertyError } = await supabase
      .from('hmo_properties')
      .select('id')
      .eq('id', tenantData.property_id)
      .eq('user_id', user.id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Create tenant
    const { data: newTenant, error: createError } = await supabase
      .from('hmo_tenants')
      .insert({
        user_id: user.id,
        ...tenantData,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create tenant:', createError);
      return NextResponse.json(
        { error: 'Failed to create tenant' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        tenant: newTenant,
        message: 'Tenant created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Create tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
