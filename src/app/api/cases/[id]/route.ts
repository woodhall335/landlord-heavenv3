/**
 * Cases API - Specific Case Operations
 *
 * GET /api/cases/[id] - Get specific case
 * PUT /api/cases/[id] - Update case
 * DELETE /api/cases/[id] - Delete case
 */

import { createAdminClient, createServerSupabaseClient, getServerUser, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logMutation } from '@/lib/auth/audit-log';
import { checkMutationAllowed } from '@/lib/payments/edit-window-enforcement';

/**
 * GET - Fetch specific case by ID
 * ALLOWS ANONYMOUS ACCESS - Users can access their anonymous cases
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Use admin client to bypass RLS - we do our own access control below
    const adminSupabase = createAdminClient();

    // Try to get a user, but don't fail if unauthenticated
    const user = await getServerUser();

    // Fetch the case using admin client (bypasses RLS)
    const { data: caseData, error } = await adminSupabase
      .from('cases')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !caseData) {
      console.error('Case not found:', error);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Type assertion for the case record properties we need
    const caseRecord = caseData as {
      id: string;
      user_id: string | null;
      [key: string]: unknown;
    };

    // Manual access control: user can access if:
    // 1. They own the case (user_id matches)
    // 2. The case is anonymous (user_id is null) - anyone can access
    const isOwner = user && caseRecord.user_id === user.id;
    const isAnonymousCase = caseRecord.user_id === null;

    if (!isOwner && !isAnonymousCase) {
      console.error('Access denied to case:', { id, userId: user?.id, caseUserId: caseRecord.user_id });
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Fetch associated documents count
    const { count: documentCount } = await adminSupabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('case_id', id);

    // Fetch order status to check if paid
    const { data: orderData } = await adminSupabase
      .from('orders')
      .select('payment_status')
      .eq('case_id', id)
      .eq('payment_status', 'paid')
      .limit(1);

    const isPaid = (orderData && orderData.length > 0);

    // Calculate effective wizard progress:
    // - 100% if wizard is complete (wizard_completed_at is set)
    // - 100% if case is paid (payment implies wizard was completed)
    // - Otherwise use the stored wizard_progress
    const wizardCompletedAt = (caseData as any).wizard_completed_at;
    const isWizardComplete = wizardCompletedAt != null && wizardCompletedAt !== '';
    const effectiveWizardProgress = (isWizardComplete || isPaid) ? 100 : ((caseData as any).wizard_progress || 0);

    return NextResponse.json(
      {
        success: true,
        case: {
          ...caseData,
          wizard_progress: effectiveWizardProgress,
          document_count: documentCount || 0,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
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
  collected_facts: z.record(z.string(), z.any()).optional(),
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
 *
 * Edit window enforcement: If case has a paid order with expired
 * edit window (30 days), mutations are blocked with 403.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;

    // Check edit window - block if paid and window expired
    const mutationCheck = await checkMutationAllowed(id);
    if (!mutationCheck.allowed) {
      return mutationCheck.errorResponse;
    }

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

    // Audit log for paid cases (non-blocking)
    const changedKeys = Object.keys(updates);
    if (changedKeys.length > 0) {
      logMutation({
        caseId: id,
        userId: user.id,
        action: changedKeys.includes('status') ? 'case_status_change' : 'case_facts_update',
        changedKeys,
        metadata: { source: 'case-update', fieldsUpdated: changedKeys },
      }).catch(() => {}); // Fire and forget
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
 * DELETE - Archive case (soft-delete)
 *
 * Sets case status to 'archived' instead of hard deleting.
 * Archived cases are hidden from list views by default but can be restored.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireServerAuth();
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    // Verify case ownership and get current data
    const { data: existingCase, error: fetchError } = await supabase
      .from('cases')
      .select('id, status')
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

    // Check if already archived
    if ((existingCase as any).status === 'archived') {
      return NextResponse.json(
        {
          success: true,
          message: 'Case is already archived',
          already_archived: true,
        },
        { status: 200 }
      );
    }

    // Soft-delete: Set status to 'archived'
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to archive case:', updateError);
      return NextResponse.json(
        { error: 'Failed to archive case' },
        { status: 500 }
      );
    }

    // Audit log for case archival (non-blocking)
    logMutation({
      caseId: id,
      userId: user.id,
      action: 'case_archived',
      changedKeys: ['status'],
      metadata: { source: 'case-delete', previous_status: (existingCase as any).status },
    }).catch(() => {}); // Fire and forget

    return NextResponse.json(
      {
        success: true,
        message: 'Case archived successfully',
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

    console.error('Archive case error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
