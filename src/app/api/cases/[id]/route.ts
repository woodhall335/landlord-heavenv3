/**
 * Cases API - Specific Case Operations
 *
 * GET /api/cases/[id] - Get specific case
 * PUT /api/cases/[id] - Update case
 * DELETE /api/cases/[id] - Delete case
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET - Fetch specific case by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Fetch case
    const { data: caseData, error } = await supabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !caseData) {
      console.error('Case not found:', error);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Fetch associated documents count
    const { count: documentCount } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('case_id', id);

    return NextResponse.json(
      {
        success: true,
        case: {
          ...caseData,
          document_count: documentCount || 0,
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

    console.error('Get case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for case updates
const updateCaseSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'archived']).optional(),
  collected_facts: z.record(z.any()).optional(),
  wizard_progress: z.number().min(0).max(100).optional(),
  recommended_route: z.string().optional(),
  recommended_grounds: z.array(z.string()).optional(),
  success_probability: z.number().min(0).max(100).optional(),
  red_flags: z.any().optional(),
  compliance_issues: z.any().optional(),
  council_code: z.string().optional(),
});

/**
 * PUT - Update case
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateCaseSchema.safeParse(body);
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
    const supabase = await createServerSupabaseClient();

    // Verify case ownership
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCase) {
      console.error('Case not found:', fetchError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Update case
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update case:', updateError);
      return NextResponse.json(
        { error: 'Failed to update case' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: updatedCase,
        message: 'Case updated successfully',
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

    console.error('Update case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete case and associated documents
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Verify case ownership
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingCase) {
      console.error('Case not found:', fetchError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Delete case (cascade will delete associated documents and orders)
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete case:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete case' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Case and associated data deleted successfully',
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

    console.error('Delete case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
