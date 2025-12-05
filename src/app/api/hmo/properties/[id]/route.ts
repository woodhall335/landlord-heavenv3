/**
 * HMO Properties API - Specific Property Operations
 *
 * GET /api/hmo/properties/[id] - Get specific property
 * PUT /api/hmo/properties/[id] - Update property
 * DELETE /api/hmo/properties/[id] - Delete property
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { HMO_PRO_DISABLED_RESPONSE, HMO_PRO_ENABLED } from '@/lib/feature-flags';

/**
 * GET - Fetch specific property by ID
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

    // Fetch property
    const { data: property, error } = await supabase
      .from('hmo_properties')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !property) {
      console.error('Property not found:', error);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Fetch tenants for this property
    const { data: tenants, count: tenantCount } = await supabase
      .from('hmo_tenants')
      .select('*', { count: 'exact' })
      .eq('property_id', id);

    const activeTenants = tenants?.filter((t) => (t as any).tenancy_status === 'active').length || 0;

    return NextResponse.json(
      {
        success: true,
        property: {
          ...property,
          total_tenants: tenantCount || 0,
          active_tenants: activeTenants,
          tenants: tenants || [],
        },
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

    console.error('Get property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for property updates
const updatePropertySchema = z.object({
  property_name: z.string().min(2).optional(),
  address_line1: z.string().min(2).optional(),
  address_line2: z.string().optional(),
  city: z.string().min(2).optional(),
  postcode: z.string().min(2).optional(),
  council_code: z.string().optional(),
  council_name: z.string().optional(),
  license_type: z.enum(['mandatory', 'additional', 'selective']).optional(),
  license_number: z.string().optional(),
  license_expiry_date: z.string().optional(),
  number_of_bedrooms: z.number().int().min(1).optional(),
  number_of_tenants: z.number().int().min(0).optional(),
  max_occupancy: z.number().int().min(1).optional(),
  number_of_bathrooms: z.number().int().min(1).optional(),
  number_of_kitchens: z.number().int().min(1).optional(),
  has_fire_alarm: z.boolean().optional(),
  has_co_alarm: z.boolean().optional(),
  has_emergency_lighting: z.boolean().optional(),
  has_fire_doors: z.boolean().optional(),
  has_fire_blanket: z.boolean().optional(),
});

/**
 * PUT - Update property
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
    const validationResult = updatePropertySchema.safeParse(body);
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

    // Verify property ownership
    const { data: existingProperty, error: fetchError } = await supabase
      .from('hmo_properties')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingProperty) {
      console.error('Property not found:', fetchError);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Update property
    const { data: updatedProperty, error: updateError } = await supabase
      .from('hmo_properties')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update property:', updateError);
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        property: updatedProperty,
        message: 'Property updated successfully',
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

    console.error('Update property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete property and associated tenants
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

    // Verify property ownership
    const { data: existingProperty, error: fetchError } = await supabase
      .from('hmo_properties')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingProperty) {
      console.error('Property not found:', fetchError);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Delete property (cascade will delete tenants and compliance items)
    const { error: deleteError } = await supabase
      .from('hmo_properties')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete property:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete property' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Property and associated data deleted successfully',
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

    console.error('Delete property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
