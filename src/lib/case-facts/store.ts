import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import type { CaseFacts } from './schema';
import { createEmptyCaseFacts } from './schema';

export async function getOrCreateCaseFacts(
  supabase: SupabaseClient<Database>,
  caseId: string
): Promise<CaseFacts> {
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
    return data.facts as CaseFacts;
  }

  const emptyFacts = createEmptyCaseFacts();
  const { error: insertError } = await supabase.from('case_facts').insert({
    case_id: caseId,
    facts: emptyFacts,
  });

  if (insertError) {
    console.error('Failed to create case facts', insertError);
    throw new Error('Could not create case facts');
  }

  return emptyFacts;
}

export async function updateCaseFacts(
  supabase: SupabaseClient<Database>,
  caseId: string,
  updater: (current: CaseFacts) => CaseFacts,
  options?: { meta?: Record<string, unknown> }
): Promise<CaseFacts> {
  const currentFacts = await getOrCreateCaseFacts(supabase, caseId);
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

  const { error: updateFactsError } = await supabase
    .from('case_facts')
    .update({ facts: newFacts as any, version: newVersion, updated_at: timestamp })
    .eq('case_id', caseId);

  if (updateFactsError) {
    console.error('Failed to persist case facts', updateFactsError);
    throw new Error('Could not update case facts');
  }

  const { error: caseUpdateError } = await supabase
    .from('cases')
    .update({
      collected_facts: options?.meta
        ? ({ ...newFacts, __meta: options.meta } as any)
        : (newFacts as any),
      updated_at: timestamp,
    })
    .eq('id', caseId);

  if (caseUpdateError) {
    console.error('Failed to mirror case facts to cases', caseUpdateError);
    throw new Error('Could not update case facts');
  }

  return newFacts;
}
