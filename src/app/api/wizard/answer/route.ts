/**
 * Wizard API - Submit Answer
 *
 * POST /api/wizard/answer
 * Saves user's answer to the wizard and updates case facts
 * ALLOWS ANONYMOUS ACCESS
 */

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const answerSchema = z.object({
  case_id: z.string().uuid(),
  question_id: z.string(),
  answer: z.any(), // Can be any type (string, number, boolean, array, object)
  progress: z.number().min(0).max(100).optional(),
});

export async function POST(request: Request) {
  try {
    // Allow anonymous access - user is optional
    const user = await getServerUser();
    const body = await request.json();

    // Validate input
    const validationResult = answerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_id, question_id, answer, progress } = validationResult.data;
    const supabase = await createServerSupabaseClient();

    // Fetch current case (allow both logged-in users and anonymous)
    // Note: Must use .is() for null checks, not .eq()
    let query = supabase
      .from('cases')
      .select('*')
      .eq('id', case_id);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      query = query.is('user_id', null);
    }

    const { data: currentCase, error: fetchError } = await query.single();

    if (fetchError || !currentCase) {
      console.error('Case not found:', fetchError);
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Merge new answer with existing facts
    const currentFacts = (currentCase.collected_facts as any) || {};
    const updatedFacts = {
      ...currentFacts,
      [question_id]: answer,
    };

    // Update case with new facts
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        collected_facts: updatedFacts as any,
        wizard_progress: progress !== undefined ? progress : currentCase.wizard_progress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', case_id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update case:', updateError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: updatedCase,
        message: 'Answer saved successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Save answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
