import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const migrationsDir = join(process.cwd(), 'supabase/migrations');
const grantsSource = readFileSync(
  join(migrationsDir, '024_explicit_data_api_grants.sql'),
  'utf8'
);

function collectCreatedRelations(): string[] {
  const sql = readdirSync(migrationsDir)
    .filter((fileName) => fileName.endsWith('.sql'))
    .map((fileName) => readFileSync(join(migrationsDir, fileName), 'utf8'))
    .join('\n');

  const relations = new Set<string>();
  const relationPattern =
    /CREATE\s+(?:OR\s+REPLACE\s+)?(?:TABLE|VIEW)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:public)\.)?([a-zA-Z_][a-zA-Z0-9_]*)/gi;

  for (const match of sql.matchAll(relationPattern)) {
    relations.add(match[1]);
  }

  return Array.from(relations).sort();
}

describe('Supabase Data API grants', () => {
  it('covers every public table and view created by migrations', () => {
    const missing = collectCreatedRelations().filter(
      (relation) => !grantsSource.includes(`public.${relation}`)
    );

    expect(missing).toEqual([]);
  });

  it('keeps customer-facing grants explicit for anon and authenticated roles', () => {
    expect(grantsSource).toContain('GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role');
    expect(grantsSource).toContain('GRANT SELECT, INSERT, UPDATE ON TABLE public.cases TO anon');
    expect(grantsSource).toContain('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cases TO authenticated');
    expect(grantsSource).toContain('GRANT SELECT ON TABLE public.ask_heaven_questions TO anon, authenticated');
  });
});
