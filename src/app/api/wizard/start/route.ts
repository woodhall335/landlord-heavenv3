/**
 * Wizard API - Start
 *
 * POST /api/wizard/start
 * Creates a new case and initiates the wizard flow
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const startWizardSchema = z.object({
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
});

export async function POST(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();

    // Validate input
    const validationResult = startWizardSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_type, jurisdiction } = validationResult.data;
    const supabase = await createServerSupabaseClient();

    // Create new case
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        user_id: user.id,
        case_type,
        jurisdiction,
        status: 'in_progress',
        wizard_progress: 0,
        collected_facts: {},
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
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Start wizard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
