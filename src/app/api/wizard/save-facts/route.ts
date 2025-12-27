/**
 * Wizard API - Save Facts
 *
 * POST /api/wizard/save-facts
 * Persists wizard facts to both:
 * - case_facts.facts (source of truth)
 * - cases.collected_facts (mirrored copy)
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { case_id, facts } = body;

    if (!case_id) {
      return NextResponse.json(
        { error: 'case_id is required' },
        { status: 400 }
      );
    }

    if (!facts || typeof facts !== 'object') {
      return NextResponse.json(
        { error: 'facts must be an object' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Try to get the user (but don't require auth for wizard saves)
    const { data: { user } } = await supabase.auth.getUser();

    // First, check if the case exists
    let query = supabase
      .from('cases')
      .select('id, user_id, collected_facts')
      .eq('id', case_id);

    // If logged in, also check ownership
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data: existingCase, error: fetchError } = await query.single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching case:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch case' },
        { status: 500 }
      );
    }

    // Deep merge the new facts with existing facts
    const existingFacts = existingCase?.collected_facts || {};
    const mergedFacts = {
      ...existingFacts,
      ...facts,
      __meta: {
        ...(existingFacts?.__meta || {}),
        ...(facts?.__meta || {}),
        case_id,
        updated_at: new Date().toISOString(),
      },
    };

    const timestamp = new Date().toISOString();

    if (existingCase) {
      // Update existing case - write to BOTH tables for consistency
      // 1. Update case_facts.facts (source of truth)
      const { data: existingCaseFacts } = await supabase
        .from('case_facts')
        .select('version')
        .eq('case_id', case_id)
        .maybeSingle();

      if (existingCaseFacts) {
        // Update existing case_facts row
        const { error: caseFactsError } = await supabase
          .from('case_facts')
          .update({
            facts: mergedFacts,
            version: (existingCaseFacts.version ?? 0) + 1,
            updated_at: timestamp,
          })
          .eq('case_id', case_id);

        if (caseFactsError) {
          console.error('Error updating case_facts:', caseFactsError);
          // Continue anyway - collected_facts is still useful
        }
      } else {
        // Create case_facts row if it doesn't exist
        const { error: insertCaseFactsError } = await supabase
          .from('case_facts')
          .insert({
            case_id,
            facts: mergedFacts,
            version: 1,
          });

        if (insertCaseFactsError) {
          console.error('Error creating case_facts:', insertCaseFactsError);
          // Continue anyway - collected_facts is still useful
        }
      }

      // 2. Update cases.collected_facts (mirrored copy)
      const { error: updateError } = await supabase
        .from('cases')
        .update({
          collected_facts: mergedFacts,
          updated_at: timestamp,
        })
        .eq('id', case_id);

      if (updateError) {
        console.error('Error updating case facts:', updateError);
        return NextResponse.json(
          { error: 'Failed to save facts' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Facts saved successfully',
      });
    } else {
      // Case doesn't exist - need to create it
      // Extract metadata from facts to set up the case
      const meta = facts?.__meta || {};
      const jurisdiction = meta.jurisdiction || 'england';
      const caseType = meta.case_type || 'money_claim';

      // Allow anonymous case creation (user_id can be null for "try before you buy")
      const { error: insertError } = await supabase
        .from('cases')
        .insert({
          id: case_id,
          user_id: user?.id || null, // Allow null for anonymous users
          case_type: caseType,
          jurisdiction: jurisdiction,
          collected_facts: mergedFacts,
          status: 'in_progress',
        });

      if (insertError) {
        console.error('Error creating case:', insertError);
        return NextResponse.json(
          { error: 'Failed to create case' },
          { status: 500 }
        );
      }

      // Also create case_facts row (source of truth)
      const { error: insertCaseFactsError } = await supabase
        .from('case_facts')
        .insert({
          case_id,
          facts: mergedFacts,
          version: 1,
        });

      if (insertCaseFactsError) {
        console.error('Error creating case_facts:', insertCaseFactsError);
        // Continue anyway - case was created successfully
      }

      return NextResponse.json({
        success: true,
        message: 'Case created and facts saved successfully',
      });
    }
  } catch (error) {
    console.error('Save facts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
