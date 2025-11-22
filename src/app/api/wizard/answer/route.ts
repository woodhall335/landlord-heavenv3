/**
 * Wizard API - Submit Answer
 *
 * POST /api/wizard/answer
 * Saves user's answer to the wizard and updates case facts
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
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
    const user = await requireServerAuth();
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

    // Fetch current case
    const { data: currentCase, error: fetchError } = await supabase
      .from('cases')
      .select('*')
      .eq('id', case_id)
      .eq('user_id', user.id)
      .single();

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
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Save answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
