/**
 * Case Facts Store
 *
 * SOURCE OF TRUTH: case_facts.facts (WizardFacts)
 * ================================================
 * - case_facts.facts is the canonical source of truth (flat WizardFacts format)
 * - cases.collected_facts is a mirrored/cached copy for convenience
 * - All writes update BOTH tables to keep them in sync
 * - When in doubt, case_facts.facts is authoritative
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { WizardFacts } from './schema';
import { createEmptyWizardFacts } from './schema';

/**
 * Loads or creates WizardFacts (flat DB format) for a case.
 * Use wizardFactsToCaseFacts() from normalize.ts to convert to nested domain model.
 */
export async function getOrCreateWizardFacts(
  supabase: SupabaseClient<Database>,
  caseId: string
): Promise<WizardFacts> {
  const { data, error } = await supabase
    .from('case_facts')
    .select('facts')
    .eq('case_id', caseId)
    .maybeSingle();

  if (error) {
    console.error('Failed to load case facts', error);
    throw new Error('Could not load case facts');
  }

  if (data?.facts) {
    return data.facts as WizardFacts;
  }

  // No facts exist - create empty WizardFacts
  const emptyFacts = createEmptyWizardFacts();
  const { error: insertError } = await supabase.from('case_facts').insert({
    case_id: caseId,
    facts: emptyFacts as any, // Supabase types facts as Json
  });

  if (insertError) {
    console.error('Failed to create case facts', insertError);
    throw new Error('Could not create case facts');
  }

  return emptyFacts;
}

/**
 * Updates WizardFacts (flat DB format) for a case.
 * The updater function receives and returns WizardFacts in flat format.
 *
 * Updates both:
 * - case_facts.facts (source of truth)
 * - cases.collected_facts (mirrored copy)
 */
export async function updateWizardFacts(
  supabase: SupabaseClient<Database>,
  caseId: string,
  updater: (current: WizardFacts) => WizardFacts,
  options?: { meta?: Record<string, unknown> }
): Promise<WizardFacts> {
  const currentFacts = await getOrCreateWizardFacts(supabase, caseId);
  const newFacts = updater(currentFacts);
  const timestamp = new Date().toISOString();

  const { data: versionRow, error: versionError } = await supabase
    .from('case_facts')
    .select('version')
    .eq('case_id', caseId)
    .maybeSingle();

  if (versionError) {
    console.error('Failed to read case facts version', versionError);
    throw new Error('Could not update case facts');
  }

  const newVersion = (versionRow?.version ?? 0) + 1;

  // Update case_facts.facts (source of truth)
  const { error: updateFactsError } = await supabase
    .from('case_facts')
    .update({
      facts: newFacts as any, // Supabase types facts as Json
      version: newVersion,
      updated_at: timestamp,
    })
    .eq('case_id', caseId);

  if (updateFactsError) {
    console.error('Failed to persist case facts', updateFactsError);
    throw new Error('Could not update case facts');
  }

  // Mirror to cases.collected_facts (cached copy)
  // Include __meta if provided in options
  const mirroredFacts: WizardFacts = options?.meta
    ? { ...newFacts, __meta: options.meta as any }
    : newFacts;

  const { error: caseUpdateError } = await supabase
    .from('cases')
    .update({
      collected_facts: mirroredFacts as any, // Supabase types collected_facts as Json
      updated_at: timestamp,
    })
    .eq('id', caseId);

  if (caseUpdateError) {
    console.error('Failed to mirror case facts to cases', caseUpdateError);
    throw new Error('Could not update case facts');
  }

  return newFacts;
}

// Legacy aliases for backward compatibility - will be removed in future
export const getOrCreateCaseFacts = getOrCreateWizardFacts;
export const updateCaseFacts = updateWizardFacts;
