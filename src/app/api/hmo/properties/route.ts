/**
 * HMO Properties API - List & Create
 *
 * GET /api/hmo/properties - List all properties
 * POST /api/hmo/properties - Create new property
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET - List all properties for authenticated user
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
    const councilCode = searchParams.get('council_code');

    // Build query
    let query = supabase
      .from('hmo_properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (councilCode) {
      query = query.eq('council_code', councilCode);
    }

    const { data: properties, error } = await query;

    if (error) {
      console.error('Failed to fetch properties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Get tenant counts for each property
    const propertiesWithCounts = await Promise.all(
      (properties || []).map(async (property) => {
        const { count } = await supabase
          .from('hmo_tenants')
          .select('*', { count: 'exact', head: true })
          .eq('property_id', (property as any).id)
          .eq('tenancy_status', 'active');

        return {
          ...property,
          active_tenants: count || 0,
        };
      })
    );

    return NextResponse.json(
      {
        success: true,
        properties: propertiesWithCounts,
        count: propertiesWithCounts.length,
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

    console.error('List properties error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for property creation
const createPropertySchema = z.object({
  property_name: z.string().min(2),
  address_line1: z.string().min(2),
  address_line2: z.string().optional(),
  city: z.string().min(2),
  postcode: z.string().min(2),
  council_code: z.string(),
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
 * POST - Create new property
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
    const validationResult = createPropertySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const propertyData = validationResult.data;

    // Create property
    const { data: newProperty, error: createError } = await supabase
      .from('hmo_properties')
      .insert({
        user_id: user.id,
        ...propertyData,
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create property:', createError);
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        property: newProperty,
        message: 'Property created successfully',
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

    console.error('Create property error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
